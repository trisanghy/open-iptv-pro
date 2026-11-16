#!/usr/bin/env bash
# Open IPTV Pro WebView - one-command Mac source download/build
# Read-only source: experiment/native-webview-ffmpeg; NEVER touches main.
set -Eeuo pipefail
# Terminal may start inside a deleted temporary build folder.
cd "$HOME" || { echo 'Cannot access home directory' >&2; exit 9; }
REPO='https://github.com/trisanghy/open-iptv-pro.git'
BRANCH='experiment/native-webview-ffmpeg'
EXPECTED='4.23.35'
mkdir -p "$HOME/Downloads"
TMP="$(mktemp -d "$HOME/Downloads/.OpenIPTV-WebView-build.XXXXXXXX")"
LOG="$TMP/build.log"
on_exit() {
  code=$?
  if [ "$code" -ne 0 ]; then
    cp "$LOG" "$HOME/Downloads/OpenIPTV_WebView_Build_ERROR.log" 2>/dev/null || true
    echo "Build failed (code $code). Log: ~/Downloads/OpenIPTV_WebView_Build_ERROR.log" >&2
  else
    rm -f "$HOME/Downloads/OpenIPTV_WebView_Build_ERROR.log"
  fi
  rm -rf -- "$TMP"
}
trap on_exit EXIT
exec > >(tee -a "$LOG") 2>&1
echo "== Open IPTV Pro WebView: GitHub branch -> DMG + Source ZIP =="
echo "Source branch: $BRANCH"
if ! xcode-select -p >/dev/null 2>&1 || ! command -v git >/dev/null 2>&1; then
  echo "Install Apple Command Line Tools, then run the SAME command again."
  xcode-select --install || true
  exit 10
fi
echo "[1/5] Downloading source (branch only; no main modifications)..."
git clone --depth 1 --filter=blob:none --single-branch --branch "$BRANCH" --sparse "$REPO" "$TMP/repo"
git -C "$TMP/repo" sparse-checkout set experiments/webview-full
PROJECT="$TMP/repo/experiments/webview-full"
[ -f "$PROJECT/package.json" ] || { echo "Git branch missing WebView source"; exit 15; }
VERSION="$(/usr/bin/sed -nE 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$PROJECT/package.json" | /usr/bin/head -n 1)"
if [ "$VERSION" != "$EXPECTED" ]; then
  echo "STOP: GitHub branch contains WebView $VERSION, but this build requires $EXPECTED."
  echo "The v4.23.35 source archive has not been uploaded to this GitHub branch. This script will not build an old version under a new name."
  exit 16
fi
echo "Version confirmed: $VERSION. Preparing Node and Rust toolchains..."
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    case "$(uname -m)" in arm64) ARCH=arm64;; x86_64) ARCH=x64;; *) exit 11;; esac
    NV='22.16.0'; NF="node-v$NV-darwin-$ARCH.tar.gz"
    URL="https://nodejs.org/dist/v$NV"
    curl -fL --retry 3 --connect-timeout 20 "$URL/SHASUMS256.txt" -o "$TMP/checksums"
    SHA="$(awk -v f="$NF" '$2==f {print $1}' "$TMP/checksums")"
    [ -n "$SHA" ] || { echo "Missing Node checksum"; exit 12; }
    curl -fL --retry 3 --connect-timeout 20 "$URL/$NF" -o "$TMP/$NF"
    [ "$(shasum -a 256 "$TMP/$NF" | awk '{print $1}')" = "$SHA" ] || { echo "Checksum mismatch"; exit 13; }
    tar -xzf "$TMP/$NF" -C "$TMP"
    export PATH="$TMP/node-v$NV-darwin-$ARCH/bin:$PATH"
  fi
fi
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="$HOME/.cargo/bin:$PATH"
command -v cargo >/dev/null || exit 14

OUT="$HOME/Downloads/OpenIPTV_WebView_v${VERSION}_Build"
mkdir -p "$OUT"
ZIP="$OUT/Open_IPTV_Pro_WebView_v$VERSION_FULL_SOURCE.zip"
echo "[2/5] Creating exact-version source ZIP..."
rm -f "$ZIP"
(cd "$TMP/repo/experiments" && /usr/bin/zip -qr "$ZIP" webview-full -x '*/node_modules/*' '*/src-tauri/target/*' '*/src-tauri/binaries/*' '*/.DS_Store')
[ -s "$ZIP" ] || exit 17
cd "$PROJECT"
echo "[3/5] Installing dependencies..."
export npm_config_fetch_retries=1 npm_config_fetch_timeout=90000
npm install --no-audit --no-fund --foreground-scripts
echo "[4/5] Testing and preparing FFmpeg/Node..."
npm run test:bridge
npm run assets
echo "[5/5] Building macOS DMG..."
npx --no-install tauri build --bundles dmg
find "$OUT" -maxdepth 1 -type f -name '*.dmg' -delete
find "$PROJECT/src-tauri/target" -type f -path '*/bundle/dmg/*.dmg' -size +0c -exec cp -f '{}' "$OUT/" \;
find "$OUT" -maxdepth 1 -name '*.dmg' -size +0c | grep -q . || { echo "DMG missing"; exit 18; }
echo "SUCCESS: $OUT"
ls -lh "$OUT"/*.dmg "$ZIP"
open "$OUT" || true
