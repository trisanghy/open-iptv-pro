#!/usr/bin/env bash
# Reconstruct immutable Open IPTV Pro v4.23.60 source from the verified
# Electron experiment. Never merge the experiment's incomplete overlay tree
# directly into main. The original main history and web/online stay intact.
set -Eeuo pipefail
EXPERIMENT="$1"
TEMPDIR="$2"
test -f "$EXPERIMENT/source/OpenIPTVPro_Source_v4.23.47.zip"
test -f "$EXPERIMENT/overlays/v4.23.60-apply.cjs"
test -d "$TEMPDIR"
echo '06e8123c768f41c14f47264fbc7220d1bdfa6ce5dc07e69eceba50e929abc783  '"$EXPERIMENT"'/source/OpenIPTVPro_Source_v4.23.47.zip' | sha256sum -c -
WORK="$TEMPDIR/openiptv-promote-v42360"
mkdir -p "$WORK"
unzip -q "$EXPERIMENT/source/OpenIPTVPro_Source_v4.23.47.zip" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_47_Full_Desktop"
test -f "$PROJECT/package.json"
test -f "$PROJECT/src/main.cjs"
cp "$EXPERIMENT/overlays/whisper-autoinstall-v42347.cjs" "$PROJECT/src/whisper-autoinstall.cjs"
for ver in 48 49 50; do
  (cd "$PROJECT" && node "$EXPERIMENT/overlays/v4.23.$ver-apply.cjs" "$EXPERIMENT/overlays")
done
(cd "$PROJECT" && node "$EXPERIMENT/overlays/dmg-only-v42350.cjs")
for ver in 51 52 53 54 55 56 57 58 59 60; do
  (cd "$PROJECT" && node "$EXPERIMENT/overlays/v4.23.$ver-apply.cjs" "$EXPERIMENT/overlays")
done
cp "$EXPERIMENT/overlays/BUILD_MAC_DMG_ONLY_v42360.command" "$PROJECT/BUILD_MAC_DMG_ONLY.command"
bash -n "$PROJECT/BUILD_MAC_DMG_ONLY.command"
node -e 'const p=require(process.argv[1]);if(p.version!=="4.23.60"||JSON.stringify(p.build.mac.target)!==JSON.stringify(["dmg"]))process.exit(1)' "$PROJECT/package.json"
for js in src/main.cjs src/preload.cjs src/live-caption-service.cjs src/continuous-capture.cjs src/vieneu-session.cjs src/local-tts-service.cjs src/hymt-service.cjs src/local-ai-storage.cjs renderer/live-captions-v42343.js renderer/local-tts-v42344.js renderer/tts-utterance-queue-v42359.js renderer/video-only-translated-caption-v42358.js; do
  node --check "$PROJECT/$js"
done
python3 -m py_compile "$PROJECT/src/hymt-bridge.py" "$PROJECT/src/vieneu-bridge.py"
python3 "$PROJECT/tests/v42356-mlx-model-catalog.test.py"
(cd "$PROJECT" && node --test --test-concurrency=2 tests/*.test.cjs)
find "$PROJECT" -type d -name __pycache__ -prune -exec rm -rf -- {} +
PROJECT_FINAL="$WORK/Open-IPTV-Pro-v4_23_60_Full_Desktop"
mv "$PROJECT" "$PROJECT_FINAL"
(cd "$WORK" && zip -qr "$TEMPDIR/OpenIPTVPro_Source_v4.23.60.zip" "Open-IPTV-Pro-v4_23_60_Full_Desktop" -x '*/node_modules/*' '*/dist/*' '*/.git/*' '*/__pycache__/*')
unzip -tq "$TEMPDIR/OpenIPTVPro_Source_v4.23.60.zip"
unzip -p "$TEMPDIR/OpenIPTVPro_Source_v4.23.60.zip" 'Open-IPTV-Pro-v4_23_60_Full_Desktop/package.json' > "$TEMPDIR/version-v42360.json"
node -e 'const p=require(process.argv[1]);if(p.version!=="4.23.60")process.exit(1)' "$TEMPDIR/version-v42360.json"
printf '%s\n' "$PROJECT_FINAL" > "$TEMPDIR/openiptv-v42360-path.txt"
echo "Reconstructed and verified complete source at: $PROJECT_FINAL"
