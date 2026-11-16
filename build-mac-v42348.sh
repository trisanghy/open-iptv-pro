#!/usr/bin/env bash
# Open IPTV Pro v4.23.48 — Argos real-model translation and selectable Piper voice builder.
set -Eeuo pipefail
VERSION=4.23.47
SOURCE=OpenIPTVPro_Source_v4.23.47.zip
SHA256=06e8123c768f41c14f47264fbc7220d1bdfa6ce5dc07e69eceba50e929abc783
RAW=https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/source
if [ "$(uname -s)" != Darwin ]; then echo 'This command requires macOS.' >&2; exit 1; fi
case "$(uname -m)" in
  arm64) ARCH=arm64; EXPECTED=arm64 ;;
  x86_64) ARCH=x64; EXPECTED=x86_64 ;;
  *) echo 'Unsupported Mac architecture.' >&2; exit 1 ;;
esac
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42347-${ARCH}.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.48_${ARCH}"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.48_${ARCH}_ERROR.log"
SUCCESS=0
cleanup() {
  code=$?
  trap - EXIT
  if [ "$SUCCESS" != 1 ]; then
    [ ! -s "$WORK/build.log" ] || cp "$WORK/build.log" "$LOG" || true
    echo 'Build failed: previous output was preserved. Check error log in Downloads.' >&2
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42347-*) rm -rf -- "$WORK" ;; esac
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "[1/5] Downloading one verified v${VERSION} source ZIP..."
curl -fL --retry 2 --connect-timeout 15 --max-time 300 --output "$WORK/$SOURCE" "$RAW/$SOURCE"
echo "$SHA256  $WORK/$SOURCE" | shasum -a 256 -c - || { echo 'Source checksum mismatch.' >&2; exit 1; }
echo '[2/5] Unpacking source...'
unzip -q "$WORK/$SOURCE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_47_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "Missing package.json at expected directory: $PROJECT" >&2; find "$WORK" -maxdepth 3 -name package.json -print >&2 || true; exit 1; }
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]47"' "$PROJECT/package.json" || { echo 'Wrong source version' >&2; exit 1; }
echo '[3/5] Applying pinned official Hugging Face CDN allowlist hotfix...'
PATCH_URL="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/748c3d89bd9f8077e8e3c8ece57899b485fce93a/overlays/whisper-autoinstall-v42347.cjs"
PATCH_SOURCE="OpenIPTVPro_Source_v4.23.48.zip"
[ -f "$PROJECT/src/whisper-autoinstall.cjs" ] || { echo 'Missing expected Whisper installer source' >&2; exit 1; }
curl -fL --retry 2 --connect-timeout 15 --max-time 60 --output "$WORK/whisper-autoinstall.cjs" "$PATCH_URL"
grep -Fq 'us.aws.cdn.hf.co' "$WORK/whisper-autoinstall.cjs" || { echo 'Invalid hotfix payload' >&2; exit 1; }
cp "$WORK/whisper-autoinstall.cjs" "$PROJECT/src/whisper-autoinstall.cjs"
echo '[3/5] Applying v4.23.48 offline translator and TTS voice-selector upgrade...'
if ! command -v node >/dev/null 2>&1; then
  if command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo 'Node.js is required for this Electron source patch. Please install Node.js 22+ or Homebrew.' >&2
    exit 1
  fi
fi
OVERLAY_REV="1d34c7b8a0f2f61a902a66c7090224a39e7c08b4"
OVERLAY_DIR="$WORK/overlays"
mkdir -p "$OVERLAY_DIR"
for file in argos-bridge-v42348.py local-ai-autoinstall-v42348.cjs caption-translator-v42348.cjs local-tts-service-v42348.cjs local-tts-ui-v42348.js argos-tts-voice-v42348.test.cjs v4.23.48-apply.cjs; do
  curl -fL --retry 2 --connect-timeout 15 --max-time 120 --output "$OVERLAY_DIR/$file" \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$OVERLAY_REV/overlays/$file"
done
node "$OVERLAY_DIR/v4.23.48-apply.cjs" "$OVERLAY_DIR" || { echo 'Source patch failed' >&2; exit 1; }
for js in src/local-ai-autoinstall.cjs src/caption-translator.cjs src/local-tts-service.cjs renderer/local-tts-v42344.js src/main.cjs src/preload.cjs; do
  node --check "$PROJECT/$js"
done
python3 -m py_compile "$PROJECT/src/argos-bridge.py"
find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
( cd "$PROJECT" && node --test tests/argos-tts-voice-v42348.test.cjs tests/whisper-installer-hotfix-v42347.test.cjs ) || { echo 'Argos/TTS regression tests failed' >&2; exit 1; }
NEW_PROJECT="$WORK/Open-IPTV-Pro-v4_23_48_Full_Desktop"
mv "$PROJECT" "$NEW_PROJECT"
PROJECT="$NEW_PROJECT"

node --check "$PROJECT/src/whisper-autoinstall.cjs"
( cd "$WORK" && zip -q -r "$PATCH_SOURCE" "Open-IPTV-Pro-v4_23_47_Full_Desktop" -x '*/node_modules/*' '*/dist/*' '*/.git/*' )
unzip -tq "$WORK/$PATCH_SOURCE" >/dev/null
echo "[4/5] Building v4.23.48 native Mac $ARCH DMG..."
( cd "$PROJECT" && OPENIPTV_ONE_COMMAND=1 bash ./BUILD_MAC.command ) 2>&1 | tee "$WORK/build.log"
DMG="Open-IPTV-Pro-4.23.48-mac-${ARCH}.dmg"
[ -s "$PROJECT/dist/$DMG" ] || { echo "Missing $DMG" >&2; exit 1; }
APP_DIR="mac-${ARCH}"
if [ "$ARCH" = 'x64' ]; then APP_DIR='mac'; fi
EXE="$PROJECT/dist/$APP_DIR/Open IPTV Pro.app/Contents/MacOS/Open IPTV Pro"
if [ -f "$EXE" ]; then
  BUILT="$(lipo -archs "$EXE")"
  [ "$BUILT" = "$EXPECTED" ] || { echo "Wrong executable architecture: $BUILT" >&2; exit 1; }
else
  echo 'DMG built, but uncompressed executable location could not be checked.' >&2
  exit 1
fi
echo '[5/5] Keeping only native DMG and matching source ZIP...'
[ ! -L "$OUT" ] || { echo 'Output folder is a symlink; refusing to overwrite.' >&2; exit 1; }
mkdir -p "$OUT"
cp "$PROJECT/dist/$DMG" "$OUT/$DMG"
mv "$WORK/$PATCH_SOURCE" "$OUT/$PATCH_SOURCE"
rm -f "$LOG"
SUCCESS=1
echo "DONE: $OUT"
ls -lh "$OUT/$DMG" "$OUT/$PATCH_SOURCE"
open "$OUT" || true
