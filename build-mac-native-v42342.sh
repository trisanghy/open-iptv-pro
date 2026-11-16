#!/usr/bin/env bash
# Open IPTV Pro v4.23.42 — one Mac command, automatically selects Apple Silicon or Intel.
set -Eeuo pipefail
VERSION=4.23.42
SOURCE=OpenIPTVPro_Source_v4.23.42.zip
SHA256=a9dc7d02fd8f3074f098fc90211e19f47c70a4cc6eec018f5790b0758ea0359d
RAW=https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/source
if [ "$(uname -s)" != Darwin ]; then echo 'This command requires macOS.' >&2; exit 1; fi
case "$(uname -m)" in
  arm64) ARCH=arm64; EXPECTED=arm64 ;;
  x86_64) ARCH=x64; EXPECTED=x86_64 ;;
  *) echo 'Unsupported Mac architecture.' >&2; exit 1 ;;
esac
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42342-${ARCH}.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.42_${ARCH}"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.42_${ARCH}_ERROR.log"
SUCCESS=0
cleanup() {
  code=$?
  trap - EXIT
  if [ "$SUCCESS" != 1 ]; then
    [ ! -s "$WORK/build.log" ] || cp "$WORK/build.log" "$LOG" || true
    echo 'Build failed: previous output was preserved. Check error log in Downloads.' >&2
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42342-*) rm -rf -- "$WORK" ;; esac
  exit "$code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "[1/4] Downloading one verified v${VERSION} source ZIP..."
curl -fL --retry 2 --connect-timeout 15 --max-time 300 --output "$WORK/$SOURCE" "$RAW/$SOURCE"
echo "$SHA256  $WORK/$SOURCE" | shasum -a 256 -c - || { echo 'Source checksum mismatch.' >&2; exit 1; }
echo '[2/4] Unpacking source...'
unzip -q "$WORK/$SOURCE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_42_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "Missing package.json at expected directory: $PROJECT" >&2; find "$WORK" -maxdepth 3 -name package.json -print >&2 || true; exit 1; }
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]42"' "$PROJECT/package.json" || { echo 'Wrong source version' >&2; exit 1; }
echo "[3/4] Building native Mac $ARCH DMG..."
( cd "$PROJECT" && OPENIPTV_ONE_COMMAND=1 bash ./BUILD_MAC.command ) 2>&1 | tee "$WORK/build.log"
DMG="Open-IPTV-Pro-4.23.42-mac-${ARCH}.dmg"
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
echo '[4/4] Keeping only native DMG and matching source ZIP...'
[ ! -L "$OUT" ] || { echo 'Output folder is a symlink; refusing to overwrite.' >&2; exit 1; }
mkdir -p "$OUT"
cp "$PROJECT/dist/$DMG" "$OUT/$DMG"
mv "$WORK/$SOURCE" "$OUT/$SOURCE"
rm -f "$LOG"
SUCCESS=1
echo "DONE: $OUT"
ls -lh "$OUT/$DMG" "$OUT/$SOURCE"
open "$OUT" || true
