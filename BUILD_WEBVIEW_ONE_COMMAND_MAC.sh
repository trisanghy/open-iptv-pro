#!/usr/bin/env bash
# Open IPTV Pro WebView v4.23.36: download ONE ZIP and build DMG on macOS.
set -Eeuo pipefail
cd "$HOME" || exit 9
VERSION='4.23.36'
NAME='Open_IPTV_Pro_WebView_v4_23_36_FULL_SOURCE.zip'
URL="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/native-webview-ffmpeg/webview-sources/v4.23.36/$NAME"
ROOT='Open_IPTV_Pro_WebView_v4_23_36_FULL'
D="$HOME/Downloads"
OUT="$D/OpenIPTV_WebView_v${VERSION}_Build"
mkdir -p "$D"
TMP="$(mktemp -d "$D/.OpenIPTV-WebView-build.XXXXXXXX")"
LOG="$TMP/build.log"
cleanup() {
  code=$?
  if [ "$code" -ne 0 ]; then
    cp "$LOG" "$D/OpenIPTV_WebView_Build_ERROR.log" 2>/dev/null || true
    printf '\nBuild failed (%s). Log: %s\n' "$code" "$D/OpenIPTV_WebView_Build_ERROR.log" >&2
  else
    rm -f "$D/OpenIPTV_WebView_Build_ERROR.log"
  fi
  rm -rf -- "$TMP"
}
trap cleanup EXIT
exec > >(tee -a "$LOG") 2>&1
printf '\n=== Open IPTV Pro WebView v%s | ONE ZIP -> DMG ===\n' "$VERSION"
printf 'Source branch: experiment/native-webview-ffmpeg (main unchanged)\n'
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  echo 'Install Xcode Command Line Tools and rerun this same command.'
  exit 10
fi
printf '\n[1/4] Downloading exactly ONE source ZIP...\n'
ARCHIVE="$TMP/$NAME"
curl --fail --location --silent --show-error --retry 2 --connect-timeout 20 --max-time 180 "$URL" -o "$ARCHIVE"
mkdir -p "$TMP/src"
unzip -q "$ARCHIVE" -d "$TMP/src"
PROJECT="$TMP/src/$ROOT"
[ -f "$PROJECT/package.json" ] || { echo 'Missing package.json in downloaded source'; exit 11; }
printf '\n[2/4] Preparing build toolchain...\n'
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    case "$(uname -m)" in arm64) NARCH=arm64;; x86_64) NARCH=x64;; *) echo 'Unsupported CPU'; exit 12;; esac
    NVER='22.16.0'; NF="node-v$NVER-darwin-$NARCH.tar.gz"
    curl -fLsS --retry 2 --connect-timeout 20 "https://nodejs.org/dist/v$NVER/$NF" -o "$TMP/$NF"
    tar -xzf "$TMP/$NF" -C "$TMP"
    export PATH="$TMP/node-v$NVER-darwin-$NARCH/bin:$PATH"
  fi
fi
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="$HOME/.cargo/bin:$PATH"
command -v cargo >/dev/null || { echo 'Rust/Cargo missing'; exit 13; }
cd "$PROJECT"
printf '\n[3/4] Installing modules, bundling FFmpeg/FFprobe...\n'
export npm_config_fetch_retries=1 npm_config_fetch_timeout=90000
npm install --no-audit --no-fund --foreground-scripts --prefer-offline --loglevel=error
npm run assets --silent
printf '\n[4/4] Compiling macOS DMG (no duplicate file checks or test suites)...\n'
npx --no-install tauri build --bundles dmg
DMG="$(find "$PROJECT/src-tauri/target" -type f -path '*/bundle/dmg/*.dmg' -size +0c -print -quit)"
[ -n "$DMG" ] || { echo 'DMG not found'; exit 14; }
mkdir -p "$OUT"
find "$OUT" -maxdepth 1 -type f \( -name '*.dmg' -o -name 'Open_IPTV_Pro_WebView_v*_FULL_SOURCE.zip' \) -delete
cp "$DMG" "$OUT/"
cp "$ARCHIVE" "$OUT/$NAME"
printf '\nBUILD SUCCESS: %s\n' "$OUT"
ls -lh "$OUT"/*.dmg "$OUT/$NAME"
open "$OUT" || true
