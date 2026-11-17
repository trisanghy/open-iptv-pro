#!/usr/bin/env bash
# Experimental Open IPTV Pro v4.23.61 local builder.
# Loads the full source from the dedicated experimental branch.
# FINAL FOLDER: exactly one Open IPTV Pro.app; never DMG or source ZIP.
set -Eeuo pipefail
[ "$(uname -s)" = Darwin ] || { echo 'Only macOS is supported.' >&2; exit 1; }
case "$(uname -m)" in arm64) ARCH=arm64; PLATFORM=darwin-arm64;; x86_64) ARCH=x64; PLATFORM=darwin-x64;; *) echo 'Unsupported CPU'; exit 1;; esac
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
TEMP="$(mktemp -d "$DOWNLOADS/.openiptv-v42361-app-${ARCH}.XXXXXXXX")"
STAGE=''
OUT="$DOWNLOADS/OpenIPTVPro_Google_Vietnamese_TTS_v4.23.61_APP_${ARCH}"
rollback(){
 code=$?; trap - EXIT
 [ -z "$STAGE" ] || rm -rf -- "$STAGE"
 if [ -d "$TEMP/previous" ] && [ ! -e "$OUT" ]; then mv "$TEMP/previous" "$OUT" || true; fi
 rm -rf -- "$TEMP"
 exit "$code"
}
trap rollback EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

REPO='trisanghy/open-iptv-pro'
BRANCH='experiment/google-translate-gemma-v42361'
echo '[1/5] Fetching experimental Electron source commit...'
REF_JSON="$(curl -fsSL --retry 3 --connect-timeout 15 --max-time 90 \
 "https://api.github.com/repos/$REPO/git/refs/heads/$BRANCH")"
COMMIT="$(printf '%s\n' "$REF_JSON" | sed -nE 's/.*"sha":[[:space:]]*"([0-9a-f]{40})".*/\1/p' | head -1)"
[[ "$COMMIT" =~ ^[0-9a-f]{40}$ ]] || { echo 'Cannot verify experimental branch commit.' >&2; exit 1; }
curl -fL --retry 3 --connect-timeout 15 --max-time 480 \
 -o "$TEMP/source.zip" "https://codeload.github.com/$REPO/zip/$COMMIT"
unzip -q "$TEMP/source.zip" -d "$TEMP/source"
PROJECT="$(find "$TEMP/source" -mindepth 1 -maxdepth 1 -type d -print -quit)"
test -f "$PROJECT/package.json"
node_major=0
if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
 node_major="$(node -p 'Number(process.versions.node.split(".")[0])' 2>/dev/null || echo 0)"
fi
if [ "$node_major" -lt 22 ]; then
 echo '[2/5] Bootstrapping official standalone Node.js 22 (no global install)...'
 NODE_VERSION='22.16.0'
 NODE_TAR="node-v${NODE_VERSION}-${PLATFORM}.tar.gz"
 curl -fL --retry 3 --connect-timeout 15 --max-time 480 \
  -o "$TEMP/$NODE_TAR" "https://nodejs.org/dist/v${NODE_VERSION}/$NODE_TAR"
 curl -fL --retry 3 --connect-timeout 15 --max-time 90 \
  -o "$TEMP/SHASUMS256.txt" "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"
 SHA="$(awk -v n="$NODE_TAR" '$2==n{print $1}' "$TEMP/SHASUMS256.txt")"
 [[ "$SHA" =~ ^[a-fA-F0-9]{64}$ ]] || { echo 'Missing Node.js official checksum.' >&2; exit 1; }
 echo "$SHA  $TEMP/$NODE_TAR" | shasum -a 256 -c -
 tar -xzf "$TEMP/$NODE_TAR" -C "$TEMP"
 export PATH="$TEMP/node-v${NODE_VERSION}-${PLATFORM}/bin:$PATH"
fi
test "$(node -p "require('$PROJECT/package.json').version")" = '4.23.61'
echo "[2/5] Verified source commit: $COMMIT"
echo '[3/5] Installing local dependencies and running tests...'
cd "$PROJECT"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund
else npm install --no-audit --no-fund; fi
npm test
echo '[4/5] Building a native, unpacked Mac .app (NO DMG, NO installer ZIP)...'
export CSC_IDENTITY_AUTO_DISCOVERY=false
./node_modules/.bin/electron-builder --dir --mac "--$ARCH" --publish never
case "$ARCH" in arm64) DIR=mac-arm64;; x64) DIR=mac;; esac
APP="$PROJECT/dist/$DIR/Open IPTV Pro.app"
test -x "$APP/Contents/MacOS/Open IPTV Pro"
STAGE="$(mktemp -d "$DOWNLOADS/.openiptv-app-stage-${ARCH}.XXXXXXXX")"
ditto "$APP" "$STAGE/Open IPTV Pro.app"
test -x "$STAGE/Open IPTV Pro.app/Contents/MacOS/Open IPTV Pro"
echo '[5/5] Publishing ONE APP to Downloads; no auto-install in Applications...'
if [ -e "$OUT" ]; then
 if [ ! -d "$OUT" ] || [ -L "$OUT" ]; then echo 'Unexpected output path; aborting' >&2; exit 1; fi
 ITEMS="$(find "$OUT" -mindepth 1 -maxdepth 1 -print)"
 [ "$ITEMS" = "$OUT/Open IPTV Pro.app" ] && [ ! -L "$OUT/Open IPTV Pro.app" ] ||
  { echo 'Output contains unrelated files; not deleting' >&2; exit 1; }
 mv "$OUT" "$TEMP/previous"
fi
mv "$STAGE" "$OUT"; STAGE=''
test "$(find "$OUT" -mindepth 1 -maxdepth 1 -print)" = "$OUT/Open IPTV Pro.app"
printf '\nSUCCESS — ONLY Open IPTV Pro.app:\n%s\n' "$OUT/Open IPTV Pro.app"
printf 'No DMG/ZIP, no automatic Applications install; public releases and main unchanged.\n'
