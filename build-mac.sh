#!/usr/bin/env bash
# Open IPTV Pro 4.23.36 - single-command Mac build from isolated GitHub source branch.
set -Eeuo pipefail
VERSION="4.23.36"
RAW="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source"
ARCHIVE="OpenIPTVPro_Source_v4.23.36.zip"
EXPECTED_SHA256="ba1c9f35cb5dabbcf8bf73c4eca5a048ce3ad3b4ef7487633d4d4ba0246084ce"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) ARCH="arm64" ;;
  Darwin-x86_64) ARCH="x64" ;;
  *) echo "ERROR: Only macOS Intel and Apple Silicon are supported." >&2; exit 1 ;;
esac
for cmd in curl shasum unzip awk sed df mktemp base64; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Missing required utility: $cmd" >&2; exit 1; }
done
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
FREE_KIB="$(df -Pk "$DOWNLOADS" | awk 'NR==2 {print $4}')"
if [ -n "$FREE_KIB" ] && [ "$FREE_KIB" -lt 6291456 ]; then
  echo "Not enough disk space. At least 6 GB required; 10 GB recommended." >&2
  df -h "$DOWNLOADS" >&2
  exit 1
fi
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42336-build.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v4.23.36"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v4.23.36_ERROR.log"
SUCCESS=0
cleanup() {
  status=$?
  trap - EXIT
  if [ "$SUCCESS" -ne 1 ]; then
    echo "Build failed. Existing output files were not deleted." >&2
    if [ -f "$WORK/build.log" ]; then cp "$WORK/build.log" "$LOG" || true; fi
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42336-build.*) rm -rf -- "$WORK" ;; esac
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "Open IPTV Pro $VERSION | Mac $ARCH | GitHub branch iptv-build-source"
mkdir -p "$WORK/parts"
for PART in 00 01 02 03 04 05 06 07 08 09 10; do
  echo "Downloading source chunk $PART / 10 ..."
  curl -fsSL --retry 3 --connect-timeout 20 --max-time 180 -o "$WORK/parts/$PART" "$RAW/source/v4.23.36.part$PART.b64"
  [ -s "$WORK/parts/$PART" ] || { echo "Empty chunk $PART" >&2; exit 1; }
done
cat "$WORK/parts/"* | base64 -D > "$WORK/$ARCHIVE"
SHA="$(shasum -a 256 "$WORK/$ARCHIVE" | awk '{print $1}')"
if [ "$SHA" != "$EXPECTED_SHA256" ]; then
  echo "ERROR: Source ZIP SHA256 mismatch. Aborting." >&2; exit 1
fi
unzip -tq "$WORK/$ARCHIVE" >/dev/null
unzip -q "$WORK/$ARCHIVE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_36_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "Source missing package.json" >&2; exit 1; }
if ! grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]36"' "$PROJECT/package.json"; then
  echo "Wrong source version; refusing to build." >&2; exit 1
fi
echo "Installing dependencies, testing, and creating DMG..."
if ! (cd "$PROJECT" && OPENIPTV_ONE_COMMAND=1 bash ./BUILD_MAC.command) 2>&1 | tee "$WORK/build.log"; then
  echo "BUILD_MAC.command failed." >&2; exit 1
fi
DMG_NAME="Open-IPTV-Pro-$VERSION-mac-$ARCH.dmg"
DMG="$PROJECT/dist/$DMG_NAME"
[ -s "$DMG" ] || { echo "DMG missing: $DMG" >&2; exit 1; }
SIZE="$(wc -c < "$DMG" | tr -d ' ')"
[ "$SIZE" -ge 1048576 ] || { echo "DMG too small: $SIZE" >&2; exit 1; }
mkdir -p "$WORK/ready"
cp "$DMG" "$WORK/ready/$DMG_NAME"
cp "$WORK/$ARCHIVE" "$WORK/ready/$ARCHIVE"
if [ -L "$OUT" ]; then echo "Output directory is a symbolic link; refusing to overwrite." >&2; exit 1; fi
if [ -e "$OUT" ] && [ ! -d "$OUT" ]; then echo "Output destination is not a directory." >&2; exit 1; fi
if [ -d "$OUT" ]; then
  for FILE in "$OUT"/* "$OUT"/.[!.]* "$OUT"/..?*; do
    [ -e "$FILE" ] || [ -L "$FILE" ] || continue
    [ -f "$FILE" ] && [ ! -L "$FILE" ] || { echo "Unexpected non-regular file: $FILE" >&2; exit 1; }
    case "$(basename "$FILE")" in "$DMG_NAME"|"$ARCHIVE") ;; *) echo "Unknown output file; will not delete: $FILE" >&2; exit 1 ;; esac
  done
  rm -f "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
else
  mkdir -p "$OUT"
fi
mv "$WORK/ready/$DMG_NAME" "$OUT/$DMG_NAME"
mv "$WORK/ready/$ARCHIVE" "$OUT/$ARCHIVE"
rm -f "$LOG"
SUCCESS=1
echo "BUILD SUCCESS: $OUT"
ls -lh "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
open "$OUT" || true
