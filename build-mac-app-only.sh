#!/usr/bin/env bash
# Open IPTV Pro — personal local Mac APP-ONLY builder (public release process unchanged).
# Downloads the latest official source, verifies SHA-256, and leaves just one .app.
set -Eeuo pipefail
[ "$(uname -s)" = "Darwin" ] || { echo 'macOS only.' >&2; exit 1; }
case "$(uname -m)" in
  arm64) ARCH=arm64; PLATFORM=darwin-arm64 ;;
  x86_64) ARCH=x64; PLATFORM=darwin-x64 ;;
  *) echo 'Unsupported architecture.' >&2; exit 1 ;;
esac
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-app-only-$ARCH.XXXXXXXX")"
STAGING=""
OUT=""
SUCCESS=0
cleanup() {
  code=$?
  trap - EXIT
  if [ "$SUCCESS" != "1" ]; then
    echo 'Build failed; prior installed apps and user files were left untouched.' >&2
    if [ -n "$OUT" ] && [ -d "$WORK/previous-output" ] && [ ! -e "$OUT" ]; then
      mv "$WORK/previous-output" "$OUT" || true
    fi
  fi
  if [ -n "$STAGING" ] && [ -d "$STAGING" ]; then rm -rf -- "$STAGING"; fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-app-only-*) rm -rf -- "$WORK" ;; esac
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

VERSION="${OPENIPTV_APP_VERSION:-}"
if [ -z "$VERSION" ]; then
  echo '[1/5] Checking the newest official GitHub Release...'
  RELEASE_JSON="$(curl -fsSL --retry 3 --connect-timeout 15 --max-time 90 \
    'https://api.github.com/repos/trisanghy/open-iptv-pro/releases/latest')"
  VERSION="$(printf '%s\n' "$RELEASE_JSON" | sed -nE 's/^[[:space:]]*"tag_name":[[:space:]]*"v([0-9]+\.[0-9]+\.[0-9]+)".*/\1/p')"
fi
[[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo 'Invalid release version.' >&2; exit 1; }
SOURCE_NAME="OpenIPTVPro_Source_v${VERSION}.zip"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v${VERSION}_APP_${ARCH}"
BASE="https://github.com/trisanghy/open-iptv-pro/releases/download/v${VERSION}"
echo "[1/5] Downloading v$VERSION full source + SHA256SUMS..."
curl -fL --retry 3 --connect-timeout 15 --max-time 480 -o "$WORK/$SOURCE_NAME" "$BASE/$SOURCE_NAME"
curl -fL --retry 3 --connect-timeout 15 --max-time 90 -o "$WORK/SHA256SUMS.txt" "$BASE/SHA256SUMS.txt"
EXPECTED="$(awk -v name="$SOURCE_NAME" '$2==name{print $1}' "$WORK/SHA256SUMS.txt")"
[[ "$EXPECTED" =~ ^[a-fA-F0-9]{64}$ ]] || { echo 'Missing expected source SHA-256 in Release.' >&2; exit 1; }
echo "$EXPECTED  $WORK/$SOURCE_NAME" | shasum -a 256 -c -

echo '[2/5] Extracting source to a temporary directory...'
unzip -q "$WORK/$SOURCE_NAME" -d "$WORK/source"
PROJECT="$WORK/source/Open-IPTV-Pro-v${VERSION//./_}_Full_Desktop"
test -f "$PROJECT/package.json" || { echo 'Invalid source archive structure.' >&2; exit 1; }
NODE_VERSION=22.16.0
USE_SYSTEM_NODE=0
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
  MAJOR="$(node -p "Number(process.versions.node.split('.')[0])" 2>/dev/null || echo 0)"
  if [[ "$MAJOR" =~ ^[0-9]+$ ]] && [ "$MAJOR" -ge 22 ]; then USE_SYSTEM_NODE=1; fi
fi
if [ "$USE_SYSTEM_NODE" = 0 ]; then
  echo '[2/5] Downloading verified standalone Node.js 22; no global installation...'
  NODE_TAR="node-v${NODE_VERSION}-${PLATFORM}.tar.gz"
  curl -fL --retry 3 --connect-timeout 15 --max-time 480 \
    -o "$WORK/$NODE_TAR" "https://nodejs.org/dist/v${NODE_VERSION}/$NODE_TAR"
  curl -fL --retry 3 --connect-timeout 15 --max-time 90 \
    -o "$WORK/NODE_SHASUMS256.txt" "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"
  NODE_SHA="$(awk -v name="$NODE_TAR" '$2==name {print $1}' "$WORK/NODE_SHASUMS256.txt")"
  [[ "$NODE_SHA" =~ ^[a-fA-F0-9]{64}$ ]] || { echo 'Node.js official SHA-256 missing.' >&2; exit 1; }
  echo "$NODE_SHA  $WORK/$NODE_TAR" | shasum -a 256 -c -
  tar -xzf "$WORK/$NODE_TAR" -C "$WORK"
  export PATH="$WORK/node-v${NODE_VERSION}-${PLATFORM}/bin:$PATH"
fi
node -e 'const p=require(process.argv[1]);if(p.version!==process.argv[2])process.exit(1)' \
  "$PROJECT/package.json" "$VERSION"

echo '[3/5] Installing build dependencies and checking the source...'
cd "$PROJECT"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund
else npm install --no-audit --no-fund; fi
if [ "${OPENIPTV_SKIP_TESTS:-0}" != "1" ]; then npm test; fi
test -x node_modules/.bin/electron-builder

echo '[4/5] Building macOS .app (unpacked; NO DMG/ZIP)...'
export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=false
./node_modules/.bin/electron-builder --dir --mac "--$ARCH" --publish never
case "$ARCH" in arm64) DIR=mac-arm64;; x64) DIR=mac;; esac
BUILT_APP="$PROJECT/dist/$DIR/Open IPTV Pro.app"
test -s "$BUILT_APP/Contents/Info.plist"
test -x "$BUILT_APP/Contents/MacOS/Open IPTV Pro"
if command -v lipo >/dev/null 2>&1; then
  case "$ARCH" in arm64) NATIVE_ARCH=arm64;; x64) NATIVE_ARCH=x86_64;; esac
  lipo -archs "$BUILT_APP/Contents/MacOS/Open IPTV Pro" | tr ' ' '\n' | grep -Fxq "$NATIVE_ARCH"
fi

echo '[5/5] Publishing ONLY one .app in Downloads (no auto-install or Launchpad copy)...'
STAGING="$(mktemp -d "$DOWNLOADS/.openiptv-app-result-$ARCH.XXXXXXXX")"
ditto "$BUILT_APP" "$STAGING/Open IPTV Pro.app"
test -x "$STAGING/Open IPTV Pro.app/Contents/MacOS/Open IPTV Pro"
if [ -e "$OUT" ]; then
  if [ ! -d "$OUT" ] || [ -L "$OUT" ]; then echo "Unexpected output path: $OUT" >&2; exit 1; fi
  # Never delete unrelated content in an existing destination folder.
  ITEMS="$(find "$OUT" -mindepth 1 -maxdepth 1 -print)"
  if [ "$ITEMS" != "$OUT/Open IPTV Pro.app" ] || [ -L "$OUT/Open IPTV Pro.app" ]; then
    echo "Output folder contains unrelated files; preserved: $OUT" >&2; exit 1
  fi
  mv "$OUT" "$WORK/previous-output"
fi
mv "$STAGING" "$OUT"
STAGING=""
ITEMS="$(find "$OUT" -mindepth 1 -maxdepth 1 -print)"
[ "$ITEMS" = "$OUT/Open IPTV Pro.app" ] || { echo 'Final folder is not APP-only.' >&2; exit 1; }
SUCCESS=1
printf '\nSUCCESS — the destination contains ONLY:\n%s\n' "$OUT/Open IPTV Pro.app"
printf 'No DMG, ZIP, installer copies, Desktop shortcuts or Applications installs were made.\n'
