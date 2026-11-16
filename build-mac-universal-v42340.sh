#!/usr/bin/env bash
# Open IPTV Pro v4.23.40 — one source ZIP, Apple Silicon + Intel Universal DMG.
set -Eeuo pipefail
SOURCE="OpenIPTVPro_Source_v4.23.40.zip"
SHA="d3fa103a7e8eea33e3d1ed384a166b7a2e36c103a8cc31b04e90b144e63e0e69"
BASE="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/source"
[ "$(uname -s)" = "Darwin" ] || { echo "macOS is required." >&2; exit 1; }
case "$(uname -m)" in arm64|x86_64) ;; *) echo "Unsupported Mac architecture"; exit 1;; esac
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42340-universal.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.40_Universal"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.40_Universal_ERROR.log"
SUCCESS=0
cleanup() {
  code=$?
  trap - EXIT
  if [ "$SUCCESS" != 1 ]; then
    if [ -f "$WORK/build.log" ]; then cp "$WORK/build.log" "$LOG" || true; fi
    echo "Universal build failed. Existing results remain available." >&2
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42340-universal.*) rm -rf "$WORK" ;; esac
  exit "$code"
}
trap cleanup EXIT
echo "[1/4] Downloading one v4.23.40 desktop ZIP..."
curl -fL --retry 2 --connect-timeout 15 --max-time 240 -o "$WORK/$SOURCE" "$BASE/$SOURCE"
echo "$SHA  $WORK/$SOURCE" | shasum -a 256 -c - || { echo "Incorrect SHA-256"; exit 1; }
echo "[2/4] Extracting..."
unzip -q "$WORK/$SOURCE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_40_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "package.json missing"; exit 1; }
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]40"' "$PROJECT/package.json" || { echo "Incorrect source version"; exit 1; }
grep -Fq 'OPENIPTV_BUILD_ARCH' "$PROJECT/BUILD_MAC.command" || { echo "Universal Mac build support missing"; exit 1; }
echo "[3/4] Testing and building universal macOS DMG..."
(
 cd "$PROJECT"
 OPENIPTV_BUILD_ARCH=universal bash ./BUILD_MAC.command
) 2>&1 | tee "$WORK/build.log"
DMG="Open-IPTV-Pro-4.23.40-mac-universal.dmg"
test -s "$PROJECT/dist/$DMG" || { echo "Missing universal DMG"; exit 1; }
EXE="$PROJECT/dist/mac-universal/Open IPTV Pro.app/Contents/MacOS/Open IPTV Pro"
test -f "$EXE" || { echo "Missing universal executable"; exit 1; }
ARCHS="$(lipo -archs "$EXE")"
case " $ARCHS " in *" x86_64 "*) ;; *) echo "Missing Intel x86_64 architecture: $ARCHS"; exit 1;; esac
case " $ARCHS " in *" arm64 "*) ;; *) echo "Missing Apple Silicon arm64 architecture: $ARCHS"; exit 1;; esac
echo "Verified Electron binary: $ARCHS"
echo "[4/4] Keeping DMG + source ZIP only..."
[ ! -L "$OUT" ] || { echo "Output is a symlink, refusing overwrite"; exit 1; }
mkdir -p "$OUT"
cp "$PROJECT/dist/$DMG" "$WORK/$DMG"
mv -f "$WORK/$DMG" "$OUT/$DMG"
mv -f "$WORK/$SOURCE" "$OUT/$SOURCE"
rm -f "$LOG"
SUCCESS=1
echo "BUILD COMPLETE: $OUT"
ls -lh "$OUT/$DMG" "$OUT/$SOURCE"
open "$OUT" || true
