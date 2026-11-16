#!/usr/bin/env bash
# Open IPTV Pro v4.23.49 — Mac DMG-only installer + separate exact-version source ZIP.
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
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.49_DMG_Source_${ARCH}"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.49_${ARCH}_ERROR.log"
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
PATCH_SOURCE="OpenIPTVPro_Source_v4.23.49.zip"
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
( cd "$PROJECT" && node "$OVERLAY_DIR/v4.23.48-apply.cjs" "$OVERLAY_DIR" ) || { echo 'Source patch failed' >&2; exit 1; }
for js in src/local-ai-autoinstall.cjs src/caption-translator.cjs src/local-tts-service.cjs renderer/local-tts-v42344.js src/main.cjs src/preload.cjs; do
  node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$PROJECT/src/argos-bridge.py"
  find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test tests/argos-tts-voice-v42348.test.cjs tests/whisper-installer-hotfix-v42347.test.cjs ) || { echo 'Argos/TTS regression tests failed' >&2; exit 1; }
NEW_PROJECT="$WORK/Open-IPTV-Pro-v4_23_48_Full_Desktop"
mv "$PROJECT" "$NEW_PROJECT"
PROJECT="$NEW_PROJECT"
echo '[3/5] Applying v4.23.49 Argos verified translation, VieNeu voices and ASAR fixes...'
V49_REV="56dd019a6aab6e0e76600cc00c6e412aa8636e13"
V49_ASSETS="$WORK/overlays49"
mkdir -p "$V49_ASSETS"
for file in argos-bridge-v42349.py caption-translator-v42349.cjs premium-voices-v42349.cjs vieneu-bridge-v42349.py local-ai-autoinstall-v42349.cjs local-tts-service-v42349.cjs local-tts-ui-v42349.js live-captions-ui-v42349.js v42349-translation-premium.test.cjs argos-bridge-v42350.py local-ai-autoinstall-v42350.cjs caption-translator-v42350.cjs local-tts-service-v42350.cjs local-tts-ui-v42350.js direct-caption-routing-v42350.cjs v42350-direct-routing.test.cjs v4.23.49-apply.cjs; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V49_REV/overlays/$file" \
    -o "$V49_ASSETS/$file"
done
( cd "$PROJECT" && node "$V49_ASSETS/v4.23.49-apply.cjs" "$V49_ASSETS" )
for js in src/local-ai-autoinstall.cjs src/caption-translator.cjs src/local-tts-service.cjs src/premium-voices.cjs renderer/local-tts-v42344.js renderer/live-captions-v42343.js src/main.cjs src/preload.cjs; do
  node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$PROJECT/src/argos-bridge.py" "$PROJECT/src/vieneu-bridge.py"
  find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test --test-concurrency=2 tests/*.test.cjs ) || { echo 'Open IPTV v4.23.49 regression tests failed' >&2; exit 1; }
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_49_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
node --check "$PROJECT/src/whisper-autoinstall.cjs"
echo '[3/5] Configuring DMG-only electron-builder target; disabling ZIP app and blockmap...'
DMG_PROFILE_REV="7c3db39b4b88e8327a851ec06617861d86a841f5"
curl -fsSL --retry 2 --connect-timeout 15 --max-time 60 \
  "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$DMG_PROFILE_REV/overlays/dmg-only-v42349.cjs" \
  -o "$WORK/dmg-only-v42349.cjs"
( cd "$PROJECT" && node "$WORK/dmg-only-v42349.cjs" )
node -e 'const p=require(process.argv[1]);const b=p.build||{};if(p.version!=="4.23.49"||JSON.stringify(b.mac?.target)!=="[\"dmg\"]"||b.dmg?.writeUpdateInfo!==false)process.exit(1)' "$PROJECT/package.json" || {
 echo 'macOS DMG-only configuration was not applied' >&2
 exit 1
}
( cd "$WORK" && zip -q -r "$PATCH_SOURCE" "Open-IPTV-Pro-v4_23_49_Full_Desktop" -x '*/node_modules/*' '*/dist/*' '*/.git/*' '*/__pycache__/*' )
unzip -tq "$WORK/$PATCH_SOURCE" >/dev/null
# Avoid 'unzip -Z1 | grep -q' under pipefail: early grep exit can trigger SIGPIPE 141.
# Read the exact ZIP member to a file and inspect its version instead.
ZIP_PACKAGE="$WORK/verified-package.json"
if ! unzip -p "$WORK/$PATCH_SOURCE" "Open-IPTV-Pro-v4_23_49_Full_Desktop/package.json" > "$ZIP_PACKAGE"; then
  echo 'Patched source ZIP is missing package.json or ZIP is corrupted' >&2
  exit 1
fi
node -e 'const fs=require("fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.version!=="4.23.49")process.exit(1)' "$ZIP_PACKAGE" || {
  echo 'Patched source ZIP contains the wrong package version' >&2
  exit 1
}
echo "Verified: ZIP contains Open IPTV Pro v4.23.49 package.json"
echo "[4/5] Building v4.23.49 native Mac $ARCH DMG..."
( cd "$PROJECT" && OPENIPTV_ONE_COMMAND=1 bash ./BUILD_MAC.command ) 2>&1 | tee "$WORK/build.log"
DMG="Open-IPTV-Pro-4.23.49-mac-${ARCH}.dmg"
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
echo '[5/5] Keeping exactly native DMG and matching source ZIP...'
[ ! -L "$OUT" ] || { echo 'Output folder is a symlink; refusing to overwrite.' >&2; exit 1; }
mkdir -p "$OUT"
# Do not erase unrelated files silently. Only two exact filenames are permitted here.
EXTRA_OUTPUT="$(find "$OUT" -mindepth 1 -maxdepth 1 ! -name "$DMG" ! -name "$PATCH_SOURCE" -print -quit)"
if [ -n "$EXTRA_OUTPUT" ]; then
 echo "Output folder contains unrelated files; refusing to remove them: $OUT" >&2
 exit 1
fi
cp "$PROJECT/dist/$DMG" "$OUT/$DMG"
mv "$WORK/$PATCH_SOURCE" "$OUT/$PATCH_SOURCE"
[ "$(find "$OUT" -mindepth 1 -maxdepth 1 -type f | wc -l | tr -d '[:space:]')" = 2 ] || {
 echo 'Expected exactly one DMG and one source ZIP in output folder' >&2
 exit 1
}
rm -f "$LOG"
SUCCESS=1
echo "DONE: $OUT"
ls -lh "$OUT/$DMG" "$OUT/$PATCH_SOURCE"
open "$OUT" || true
