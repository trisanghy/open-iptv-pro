#!/usr/bin/env bash
# Open IPTV Pro v4.23.59 — uncut sentence playback and latest-pending TTS, Mac DMG + source ZIP.
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
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.59_DMG_Source_${ARCH}"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.59_${ARCH}_ERROR.log"
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
PATCH_SOURCE="OpenIPTVPro_Source_v4.23.59.zip"
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
echo '[3/5] Fixing Live Translate and preserving working Live Caption...'
V50_REV="f087dae3d8ccf1ca0d405b62497ae50b3d582651"
V50_ASSETS="$WORK/overlays50"
mkdir -p "$V50_ASSETS"
for file in argos-bridge-v42350-fix.py caption-translator-v42350-repair.cjs local-ai-autoinstall-v42350-repair.cjs live-translate-recovery-v42350.cjs live-translate-v42350.test.cjs argos-runtime-v42350.test.py v4.23.50-apply.cjs; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V50_REV/overlays/$file" \
    -o "$V50_ASSETS/$file"
done
( cd "$PROJECT" && node "$V50_ASSETS/v4.23.50-apply.cjs" "$V50_ASSETS" )
for js in src/live-caption-service.cjs src/caption-translator.cjs src/local-ai-autoinstall.cjs renderer/live-captions-v42343.js renderer/local-tts-v42344.js; do
  node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$PROJECT/src/argos-bridge.py"
  python3 "$PROJECT/tests/argos-runtime-v42350.test.py"
  find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_50_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Configuring DMG-only electron-builder target; skipping app ZIP and blockmap...'
DMG_PROFILE_REV="$V50_REV"
curl -fsSL --retry 2 --connect-timeout 15 --max-time 60 \
  "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$DMG_PROFILE_REV/overlays/dmg-only-v42350.cjs" \
  -o "$WORK/dmg-only-v42350.cjs"
( cd "$PROJECT" && node "$WORK/dmg-only-v42350.cjs" )
node -e 'const p=require(process.argv[1]);const b=p.build||{};if(p.version!=="4.23.50"||JSON.stringify(b.mac?.target)!=="[\"dmg\"]"||b.dmg?.writeUpdateInfo!==false)process.exit(1)' "$PROJECT/package.json" || {
 echo 'macOS DMG-only configuration was not applied' >&2
 exit 1
}
# Include a working DMG-only build entry point in the matching source archive.
DMG_ONLY_REV="822aa24c2659e7c838b2372e24b548a94a4613c3"
curl -fsSL --retry 2 --connect-timeout 15 --max-time 60 \
 "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$DMG_ONLY_REV/overlays/BUILD_MAC_DMG_ONLY_v42350.command" \
 -o "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command" || { echo 'DMG-only helper syntax invalid' >&2; exit 1; }
echo '[3/5] Applying Argos MINISBD translation runtime fix (v4.23.51)...'
V51_REV="424e4fcef9ffb4e778926ad58ee9420999545541"
V51_DIR="$WORK/overlays51"
mkdir -p "$V51_DIR"
for file in argos-bridge-v42351.py local-ai-autoinstall-v42351.cjs caption-translator-v42351.cjs local-tts-service-v42351.cjs v42351-minisbd-tts.test.cjs v4.23.51-apply.cjs BUILD_MAC_DMG_ONLY_v42351.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V51_REV/overlays/$file" \
    -o "$V51_DIR/$file"
done
( cd "$PROJECT" && node "$V51_DIR/v4.23.51-apply.cjs" "$V51_DIR" )
cp "$V51_DIR/BUILD_MAC_DMG_ONLY_v42351.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/local-ai-autoinstall.cjs src/caption-translator.cjs src/local-tts-service.cjs; do
  node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$PROJECT/src/argos-bridge.py"
  find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_51_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Adding persistent 0.6x-2x TTS playback speed and preview speed...'
V52_REV="3f023cc9f99532b7a3ed2561653a01be712370b3"
V52_DIR="$WORK/overlays52"
mkdir -p "$V52_DIR"
for file in local-tts-ui-v42352.js v42352-tts-speed.test.cjs v4.23.52-apply.cjs BUILD_MAC_DMG_ONLY_v42352.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V52_REV/overlays/$file" \
    -o "$V52_DIR/$file"
done
( cd "$PROJECT" && node "$V52_DIR/v4.23.52-apply.cjs" "$V52_DIR" )
cp "$V52_DIR/BUILD_MAC_DMG_ONLY_v42352.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
node --check "$PROJECT/renderer/local-tts-v42344.js"
( cd "$PROJECT" && node --test tests/v42352-tts-speed.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_52_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Applying v4.23.53 universal direct-model and Whisper-English fallback...'
V53_REV="067ffcc262bc8ee2e534dd8d5a37aee95ee03169"
V53_DIR="$WORK/overlays53"
mkdir -p "$V53_DIR"
for file in argos-bridge-v42353.py local-ai-autoinstall-v42353.cjs caption-translator-v42353.cjs live-translate-router-v42353.cjs live-translate-routing-v42353-apply.cjs v42353-multilingual-router.test.cjs v4.23.53-apply.cjs BUILD_MAC_DMG_ONLY_v42353.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V53_REV/overlays/$file" \
    -o "$V53_DIR/$file"
done
( cd "$PROJECT" && node "$V53_DIR/v4.23.53-apply.cjs" "$V53_DIR" )
cp "$V53_DIR/BUILD_MAC_DMG_ONLY_v42353.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/live-translate-router.cjs src/live-caption-service.cjs src/caption-translator.cjs src/local-ai-autoinstall.cjs src/main.cjs; do
  node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
  python3 -m py_compile "$PROJECT/src/argos-bridge.py"
  find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test tests/v42353-multilingual-router.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_53_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Adding unified Caption/Translate/TTS settings, Hy-MT2 MLX and safe model cleanup...'
V54_REV="3f23daf4636ea72552e7a283c0608c2445f58d89"
V54_DIR="$WORK/overlays54"
mkdir -p "$V54_DIR"
for file in hymt-bridge-v42354.py hymt-service-v42354.cjs local-ai-storage-v42354.cjs local-ai-autoinstall-v42354.cjs unified-ai-settings-v42354.js unified-ai-settings-v42354.css v42354-ai-management.test.cjs v4.23.54-apply.cjs BUILD_MAC_DMG_ONLY_v42354.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V54_REV/overlays/$file" \
    -o "$V54_DIR/$file"
done
( cd "$PROJECT" && node "$V54_DIR/v4.23.54-apply.cjs" "$V54_DIR" )
cp "$V54_DIR/BUILD_MAC_DMG_ONLY_v42354.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/hymt-service.cjs src/local-ai-storage.cjs src/local-ai-autoinstall.cjs src/main.cjs src/preload.cjs src/live-caption-service.cjs renderer/unified-ai-settings-v42354.js; do
 node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
 python3 -m py_compile "$PROJECT/src/hymt-bridge.py"
 find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test tests/v42354-ai-management.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_54_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Applying v4.23.55 tidy settings layout and 10-second orange warning...'
V55_REV="9c3e36af36ab7ab6cb568d7824946b0c66cfdcd5"
V55_DIR="$WORK/overlays55"
mkdir -p "$V55_DIR"
for file in unified-ai-settings-v42355.js unified-ai-settings-v42355.css v42355-ai-layout.test.cjs v4.23.55-apply.cjs BUILD_MAC_DMG_ONLY_v42355.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V55_REV/overlays/$file" \
    -o "$V55_DIR/$file"
done
( cd "$PROJECT" && node "$V55_DIR/v4.23.55-apply.cjs" "$V55_DIR" )
cp "$V55_DIR/BUILD_MAC_DMG_ONLY_v42355.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
node --check "$PROJECT/renderer/unified-ai-settings-v42355.js"
( cd "$PROJECT" && node --test tests/v42355-ai-layout.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_55_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Adding 6 new offline MLX translation models (8 selectable MLX total)...'
V56_REV="4544dda7f073dfa7535d92d332cb715f36526302"
V56_DIR="$WORK/overlays56"
mkdir -p "$V56_DIR"
for file in mlx-bridge-v42356.py mlx-service-v42356.cjs local-ai-storage-v42356.cjs unified-ai-settings-v42356.js unified-ai-settings-v42356.css v42356-mlx-model-catalog.test.cjs v42356-mlx-model-catalog.test.py v4.23.56-apply.cjs BUILD_MAC_DMG_ONLY_v42356.command; do
 curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
  "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V56_REV/overlays/$file" \
  -o "$V56_DIR/$file"
done
( cd "$PROJECT" && node "$V56_DIR/v4.23.56-apply.cjs" "$V56_DIR" )
cp "$V56_DIR/BUILD_MAC_DMG_ONLY_v42356.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/hymt-service.cjs src/local-ai-storage.cjs src/main.cjs renderer/unified-ai-settings-v42356.js; do
 node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
 python3 -m py_compile "$PROJECT/src/hymt-bridge.py"
 python3 "$PROJECT/tests/v42356-mlx-model-catalog.test.py"
 find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test tests/v42356-mlx-model-catalog.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_56_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Applying continuous FFmpeg captions and newest-only warm VieNeu TTS...'
V57_REV="6bf25d8034b7d9712159d8b1b2905466d50c7a47"
V57_DIR="$WORK/overlays57"
mkdir -p "$V57_DIR"
for file in continuous-capture-v42357.cjs vieneu-bridge-v42357.py vieneu-session-v42357.cjs local-tts-service-v42357.cjs local-tts-ui-v42357.js v42357-streaming-apply.cjs v42357-lowlatency.test.cjs v4.23.57-apply.cjs BUILD_MAC_DMG_ONLY_v42357.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V57_REV/overlays/$file" \
    -o "$V57_DIR/$file"
done
( cd "$PROJECT" && node "$V57_DIR/v4.23.57-apply.cjs" "$V57_DIR" )
cp "$V57_DIR/BUILD_MAC_DMG_ONLY_v42357.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/continuous-capture.cjs src/vieneu-session.cjs src/live-caption-service.cjs src/local-tts-service.cjs src/main.cjs renderer/local-tts-v42344.js renderer/live-captions-v42343.js; do
 node --check "$PROJECT/$js"
done
if command -v python3 >/dev/null 2>&1; then
 python3 -m py_compile "$PROJECT/src/vieneu-bridge.py"
 find "$PROJECT/src" -type d -name __pycache__ -prune -exec rm -rf -- {} +
fi
( cd "$PROJECT" && node --test tests/v42357-lowlatency.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_57_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Fixing Live Translate — ONLY target-language subtitles over the video...'
V58_REV="071812e0e7566c894c26ca5eddedfdcf4fa8ea2a"
V58_DIR="$WORK/overlays58"
mkdir -p "$V58_DIR"
for file in video-only-translated-caption-v42358.js video-only-translated-caption-v42358.css v42358-video-subtitles.test.cjs v4.23.58-apply.cjs BUILD_MAC_DMG_ONLY_v42358.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V58_REV/overlays/$file" \
    -o "$V58_DIR/$file"
done
( cd "$PROJECT" && node "$V58_DIR/v4.23.58-apply.cjs" "$V58_DIR" )
cp "$V58_DIR/BUILD_MAC_DMG_ONLY_v42358.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
node --check "$PROJECT/renderer/video-only-translated-caption-v42358.js"
node --check "$PROJECT/renderer/live-captions-v42343.js"
( cd "$PROJECT" && node --test tests/v42358-video-subtitles.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_58_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
echo '[3/5] Fixing TTS interrupting speech at every new subtitle — full sentences + newest queued...'
V59_REV="1eb46b460e2f3dab92c046728af89463ddb9bb51"
V59_DIR="$WORK/overlays59"
mkdir -p "$V59_DIR"
for file in tts-utterance-queue-v42359.js local-tts-ui-v42359.js v42359-tts-complete-utterance.test.cjs v4.23.59-apply.cjs BUILD_MAC_DMG_ONLY_v42359.command; do
  curl -fsSL --retry 2 --connect-timeout 15 --max-time 120 \
    "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/$V59_REV/overlays/$file" \
    -o "$V59_DIR/$file"
done
( cd "$PROJECT" && node "$V59_DIR/v4.23.59-apply.cjs" "$V59_DIR" )
cp "$V59_DIR/BUILD_MAC_DMG_ONLY_v42359.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
for js in src/local-tts-service.cjs renderer/tts-utterance-queue-v42359.js renderer/local-tts-v42344.js; do
 node --check "$PROJECT/$js"
done
( cd "$PROJECT" && node --test tests/v42359-tts-complete-utterance.test.cjs tests/v42352-tts-speed.test.cjs tests/v42357-lowlatency.test.cjs )
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_59_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
PROJECT="$PROJECT_FINAL"
( cd "$WORK" && zip -q -r "$PATCH_SOURCE" "Open-IPTV-Pro-v4_23_59_Full_Desktop" -x '*/node_modules/*' '*/dist/*' '*/.git/*' '*/__pycache__/*' )
unzip -tq "$WORK/$PATCH_SOURCE" >/dev/null
# Avoid 'unzip -Z1 | grep -q' under pipefail: early grep exit can trigger SIGPIPE 141.
# Read the exact ZIP member to a file and inspect its version instead.
ZIP_PACKAGE="$WORK/verified-package.json"
if ! unzip -p "$WORK/$PATCH_SOURCE" "Open-IPTV-Pro-v4_23_59_Full_Desktop/package.json" > "$ZIP_PACKAGE"; then
  echo 'Patched source ZIP is missing package.json or ZIP is corrupted' >&2
  exit 1
fi
node -e 'const fs=require("fs");const p=JSON.parse(fs.readFileSync(process.argv[1],"utf8"));if(p.version!=="4.23.59")process.exit(1)' "$ZIP_PACKAGE" || {
  echo 'Patched source ZIP contains the wrong package version' >&2
  exit 1
}
echo "Verified: ZIP contains Open IPTV Pro v4.23.59 package.json"
echo '[4/5] Running updated translation regression suite...'
( cd "$PROJECT" && node --test --test-concurrency=2 tests/*.test.cjs )
echo "[4/5] Building v4.23.59 native Mac $ARCH DMG..."
# Never call legacy BUILD_MAC.command: it treats an intentionally absent app ZIP as a build failure.
( cd "$PROJECT" && bash ./BUILD_MAC_DMG_ONLY.command "$ARCH" ) 2>&1 | tee "$WORK/build.log"
DMG="Open-IPTV-Pro-4.23.59-mac-${ARCH}.dmg"
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
