#!/usr/bin/env bash
# Open IPTV Pro WebView v4.23.36 - one command source download and build.
# Downloads ONLY the dedicated experiment/native-webview-ffmpeg branch.
set -Eeuo pipefail
cd "$HOME" || { printf 'Cannot access home directory\n' >&2; exit 9; }
VERSION='4.23.36'
BASE_VERSION='4.23.35'
PATCH_SHA256='e72dd7bd3f28108f3b5705865c2b4f21a72f74cd4064d7f1149b8be3c19ea0af'
PATCH_URL='https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/native-webview-ffmpeg/webview-sources/v4.23.36/webview-v4.23.36-dragfix.patch'
SOURCE_NAME='Open_IPTV_Pro_WebView_v4_23_35_FULL_SYNC_20261116.zip'
SHA256='90348993b8c5184e8827b922a9e820d86158c96045c67789f9de4f8991738a2f'
RAW_ROOT='https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/native-webview-ffmpeg/webview-sources/v4.23.35'
ROOT='Open_IPTV_Pro_WebView_v4_23_35_FULL'
DOWNLOADS="$HOME/Downloads"
OUT="$DOWNLOADS/OpenIPTV_WebView_v${VERSION}_Build"
mkdir -p "$DOWNLOADS"
TMP="$(mktemp -d "$DOWNLOADS/.OpenIPTV-WebView-v42336.XXXXXXXX")"
LOG="$TMP/build.log"
cleanup() {
  result=$?
  if [ "$result" -ne 0 ]; then
    cp -f "$LOG" "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log" 2>/dev/null || true
    printf '\nBuild FAILED (%s). Log: %s\n' "$result" "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log" >&2
  else
    rm -f "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log"
  fi
  rm -rf -- "$TMP"
}
trap cleanup EXIT
exec > >(tee -a "$LOG") 2>&1
printf '\n=== Open IPTV Pro WebView v%s | macOS one-command build ===\n' "$VERSION"
printf 'Source: official v4.23.35 archive + v4.23.36 drag fix from isolated GitHub branch; main is untouched.\n'
command -v curl >/dev/null || { echo 'Missing curl'; exit 1; }
command -v unzip >/dev/null || { echo 'Missing unzip'; exit 1; }
command -v shasum >/dev/null || { echo 'Missing shasum'; exit 1; }
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  echo 'Install Xcode Command Line Tools, then run this same command again.'
  exit 10
fi
FREE_KB="$(df -Pk "$DOWNLOADS" | awk 'NR == 2 {print $4}')"
if [ "${FREE_KB:-0}" -lt 10485760 ]; then
  echo 'Need at least 10 GB free to compile the Tauri WebView application.'
  exit 11
fi
ARCHIVE="$TMP/$SOURCE_NAME"
mkdir -p "$TMP/parts"
printf '\n[1/7] Downloading 8 signed-by-checksum source parts...\n'
for n in 0 1 2 3 4 5 6 7; do
  printf -v suffix '%02d' "$n"
  part="$TMP/parts/$suffix"
  curl --fail --location --show-error --silent --retry 3 --retry-delay 2 --connect-timeout 20 --max-time 180 \
    "$RAW_ROOT/$SOURCE_NAME.part$suffix" -o "$part"
  [ -s "$part" ] || { echo "Empty part $suffix"; exit 12; }
  printf 'Downloaded part %s/07 (%s bytes)\n' "$suffix" "$(wc -c < "$part" | tr -d ' ')"
done
cat "$TMP/parts/"* > "$ARCHIVE"
ACTUAL_SHA="$(shasum -a 256 "$ARCHIVE" | awk '{print $1}')"
[ "$ACTUAL_SHA" = "$SHA256" ] || { echo 'SOURCE ZIP SHA-256 mismatch; download rejected.'; exit 13; }
unzip -tq "$ARCHIVE" >/dev/null || { echo 'Invalid ZIP source archive.'; exit 14; }
mkdir -p "$TMP/source"
unzip -q "$ARCHIVE" -d "$TMP/source"
PROJECT="$TMP/source/$ROOT"
[ -f "$PROJECT/package.json" ] || { echo 'Missing WebView package.json'; exit 15; }
# Patch is verified independently of the exact v4.23.35 source archive.
# The patch must apply completely, otherwise STOP before downloading toolchains.
printf '\n[2/7] Applying signed-by-checksum WebView drag/drop patch v%s...\n' "$VERSION"
curl --fail --location --show-error --silent --retry 3 --retry-delay 2 --connect-timeout 20 --max-time 180 \
  "$PATCH_URL" -o "$TMP/dragfix.patch"
[ "$(shasum -a 256 "$TMP/dragfix.patch" | awk '{print $1}')" = "$PATCH_SHA256" ] || { echo 'PATCH SHA-256 mismatch; refused.'; exit 22; }
(cd "$PROJECT" && patch -p1 < "$TMP/dragfix.patch") || { echo 'Patch could not be applied; refusing to build a partial update.'; exit 23; }
# Preserve source in a correctly-versioned archive BEFORE npm generates bundles.
NEW_ROOT="Open_IPTV_Pro_WebView_v4_23_36_FULL"
mv "$PROJECT" "$TMP/source/$NEW_ROOT"
PROJECT="$TMP/source/$NEW_ROOT"
OUTPUT_SOURCE="$TMP/Open_IPTV_Pro_WebView_v4_23_36_FULL_SOURCE.zip"
(cd "$TMP/source" && /usr/bin/zip -qr "$OUTPUT_SOURCE" "$NEW_ROOT" -x '*/node_modules/*' '*/src-tauri/target/*' '*/src-tauri/binaries/*' '*/.DS_Store')
[ -s "$OUTPUT_SOURCE" ] || { echo 'No patched source archive'; exit 24; }
ACTUAL_VERSION="$(/usr/bin/sed -nE 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"([^"]+)".*/\1/p' "$PROJECT/package.json" | head -n 1)"
[ "$ACTUAL_VERSION" = "$VERSION" ] || { echo "Unexpected source version: $ACTUAL_VERSION"; exit 16; }
printf 'Patched source verified: v%s (base SHA-256 %s)\n' "$VERSION" "$ACTUAL_SHA"

printf '\n[3/7] Checking Node.js and build toolchain...\n'
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    case "$(uname -m)" in arm64) NARCH=arm64;; x86_64) NARCH=x64;; *) echo 'Unsupported Mac CPU'; exit 17;; esac
    NODEVER='22.16.0'
    NODEFILE="node-v$NODEVER-darwin-$NARCH.tar.gz"
    NODEURL="https://nodejs.org/dist/v$NODEVER"
    curl -fLsS --retry 3 --connect-timeout 20 "$NODEURL/SHASUMS256.txt" -o "$TMP/SHASUMS256.txt"
    NODE_SHA="$(awk -v name="$NODEFILE" '$2==name {print $1}' "$TMP/SHASUMS256.txt")"
    [ -n "$NODE_SHA" ] || { echo 'Node download checksum unavailable'; exit 18; }
    curl -fLsS --retry 3 --connect-timeout 20 "$NODEURL/$NODEFILE" -o "$TMP/$NODEFILE"
    [ "$(shasum -a 256 "$TMP/$NODEFILE" | awk '{print $1}')" = "$NODE_SHA" ] || { echo 'Node checksum mismatch'; exit 19; }
    tar -xzf "$TMP/$NODEFILE" -C "$TMP"
    export PATH="$TMP/node-v$NODEVER-darwin-$NARCH/bin:$PATH"
  fi
fi
node --version
npm --version
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="$HOME/.cargo/bin:$PATH"
command -v cargo >/dev/null || { echo 'Rust/Cargo not found'; exit 20; }

cd "$PROJECT"
export npm_config_fetch_retries=1 npm_config_fetch_timeout=90000
printf '\n[4/7] Installing WebView dependencies...\n'
npm install --no-audit --no-fund --foreground-scripts --loglevel=info
printf '\n[5/7] Testing WebView & original desktop modules...\n'
npm run test:bridge
npm run test:original
printf '\n[6/7] Bundling FFmpeg/FFprobe, Node and DASH/HLS...\n'
npm run assets
printf '\n[7/7] Compiling the macOS DMG...\n'
npx --no-install tauri build --bundles dmg
DMG="$(find "$PROJECT/src-tauri/target" -type f -path '*/bundle/dmg/*.dmg' -size +0c -print -quit)"
[ -n "$DMG" ] && [ -s "$DMG" ] || { echo 'No valid DMG generated'; exit 21; }
mkdir -p "$OUT"
# Clean only old artifacts generated by this build, never unrelated user files.
find "$OUT" -maxdepth 1 -type f \( -name '*.dmg' -o -name 'Open_IPTV_Pro_WebView_v*_FULL_SOURCE.zip' -o -name 'Open_IPTV_Pro_WebView_v*_FULL_SYNC_*.zip' \) -delete
cp -f "$DMG" "$OUT/"
cp -f "$OUTPUT_SOURCE" "$OUT/$(basename "$OUTPUT_SOURCE")"
printf '\nSUCCESS: %s\n' "$OUT"
ls -lh "$OUT"/*.dmg "$OUT/$(basename "$OUTPUT_SOURCE")"
open "$OUT" || true