#!/usr/bin/env bash
# Open IPTV Pro WebView v4.23.38 — download ONE source ZIP, restore two-row player, build DMG.
# Branch isolation: experiment/native-webview-ffmpeg only. main is untouched.
set -Eeuo pipefail
cd "$HOME" || exit 9
VERSION='4.23.38'
BASE='4.23.37'
OLD_NAME='Open_IPTV_Pro_WebView_v4_23_37_FULL_SOURCE.zip'
NEW_NAME='Open_IPTV_Pro_WebView_v4_23_38_FULL_SOURCE.zip'
BRANCH='experiment/native-webview-ffmpeg'
ROOT_URL='https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/native-webview-ffmpeg'
SOURCE_URL="$ROOT_URL/webview-sources/v4.23.37/$OLD_NAME"
PATCH_URL="$ROOT_URL/webview-sources/v4.23.38/APPLY_WEBVIEW_TOOLBAR_V42338.cjs"
DOWNLOADS="$HOME/Downloads"
OUT="$DOWNLOADS/OpenIPTV_WebView_v${VERSION}_Build"
mkdir -p "$DOWNLOADS"
TMP="$(mktemp -d "$DOWNLOADS/.OpenIPTV-WebView-v42338.XXXXXXXX")"
LOG="$TMP/build.log"
cleanup() {
  status=$?
  if [ "$status" -ne 0 ]; then
    cp -f "$LOG" "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log" 2>/dev/null || true
    printf '\nBuild failed (%s). Log: %s\n' "$status" "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log" >&2
  else
    rm -f "$DOWNLOADS/OpenIPTV_WebView_Build_ERROR.log"
  fi
  rm -rf -- "$TMP"
}
trap cleanup EXIT
exec > >(tee -a "$LOG") 2>&1
printf '\n=== Open IPTV Pro WebView v%s | two-row player -> DMG ===\n' "$VERSION"
printf 'Git branch: %s (main unchanged)\n' "$BRANCH"
if ! xcode-select -p >/dev/null 2>&1; then
  xcode-select --install || true
  echo 'Install Apple Command Line Tools, then run this command again.'
  exit 10
fi
printf '\n[1/5] Downloading exactly ONE source ZIP...\n'
curl -fLsS --retry 2 --connect-timeout 20 --max-time 240 "$SOURCE_URL" -o "$TMP/$OLD_NAME"
mkdir -p "$TMP/src"
unzip -q "$TMP/$OLD_NAME" -d "$TMP/src"
PROJECT="$TMP/src/Open_IPTV_Pro_WebView_v4_23_37_FULL"
[ -f "$PROJECT/package.json" ] || { echo 'ZIP does not contain expected WebView source'; exit 11; }
printf '\n[2/5] Preparing Node.js and Rust...\n'
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    case "$(uname -m)" in arm64) NODE_ARCH=arm64;; x86_64) NODE_ARCH=x64;; *) echo 'Unsupported Mac CPU'; exit 12;; esac
    NODE_VERSION='22.16.0'
    NODE_FILE="node-v${NODE_VERSION}-darwin-${NODE_ARCH}.tar.gz"
    curl -fLsS --retry 2 --connect-timeout 20 "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_FILE}" -o "$TMP/$NODE_FILE"
    tar -xzf "$TMP/$NODE_FILE" -C "$TMP"
    export PATH="$TMP/node-v${NODE_VERSION}-darwin-${NODE_ARCH}/bin:$PATH"
  fi
fi
printf 'Node: %s | npm: %s\n' "$(node --version)" "$(npm --version)"
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="$HOME/.cargo/bin:$PATH"
command -v cargo >/dev/null || { echo 'Rust/Cargo unavailable'; exit 13; }
printf '\n[3/5] Applying the tested two-row toolbar fix...\n'
curl -fLsS --retry 2 --connect-timeout 20 "$PATCH_URL" -o "$TMP/toolbar-patch.cjs"
node "$TMP/toolbar-patch.cjs" "$PROJECT"
[ "$(node -p "require('$PROJECT/package.json').version")" = "$VERSION" ] || { echo 'Wrong patched version'; exit 14; }
NEW_ROOT="Open_IPTV_Pro_WebView_v4_23_38_FULL"
mv "$PROJECT" "$TMP/src/$NEW_ROOT"
PROJECT="$TMP/src/$NEW_ROOT"
printf 'Packaging exact v%s source ZIP...\n' "$VERSION"
(cd "$TMP/src" && /usr/bin/zip -qr "$TMP/$NEW_NAME" "$NEW_ROOT" \
    -x '*/node_modules/*' '*/src-tauri/target/*' '*/.DS_Store')
cd "$PROJECT"
printf '\n[4/5] Installing modules and bundling FFmpeg/HLS/DASH...\n'
export npm_config_fetch_retries=1 npm_config_fetch_timeout=90000
npm install --no-audit --no-fund --foreground-scripts --prefer-offline --loglevel=error
npm run assets --silent
printf '\n[5/5] Compiling macOS DMG...\n'
npx --no-install tauri build --bundles dmg
DMG="$(find "$PROJECT/src-tauri/target" -type f -path '*/bundle/dmg/*.dmg' -size +0c -print -quit)"
[ -n "$DMG" ] || { echo 'DMG not found'; exit 15; }
mkdir -p "$OUT"
find "$OUT" -maxdepth 1 -type f \( -name '*.dmg' -o -name 'Open_IPTV_Pro_WebView_v*_FULL_SOURCE.zip' \) -delete
cp -f "$DMG" "$OUT/"
cp -f "$TMP/$NEW_NAME" "$OUT/$NEW_NAME"
printf '\nBUILD SUCCESS: %s\n' "$OUT"
ls -lh "$OUT"/*.dmg "$OUT/$NEW_NAME"
open "$OUT" || true