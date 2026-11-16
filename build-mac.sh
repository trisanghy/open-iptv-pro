#!/usr/bin/env bash
# Open IPTV Pro v4.23.37: one verified source ZIP from isolated branch -> DMG + source ZIP.
set -Eeuo pipefail
VERSION="4.23.37"
ARCHIVE="OpenIPTVPro_Source_v$VERSION.zip"
EXPECTED_SHA256="d312ed8e2f82ff9fe195b7f6e29a174949542258fd93d403019e9951a6241f7a"
RAW="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) ARCH="arm64" ;;
  Darwin-x86_64) ARCH="x64" ;;
  *) echo "ERROR: This command only builds macOS Intel/Apple Silicon." >&2; exit 1 ;;
esac
for cmd in curl shasum unzip awk sed df mktemp tee wc tr; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Missing utility: $cmd" >&2; exit 1; }
done
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
FREE_KIB="$(df -Pk "$DOWNLOADS" | awk 'NR==2 {print $4}')"
if [ -n "$FREE_KIB" ] && [ "$FREE_KIB" -lt 6291456 ]; then
  echo "Insufficient free space: at least 6 GB; 10 GB recommended." >&2
  df -h "$DOWNLOADS" >&2; exit 1
fi
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42337-build.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v$VERSION"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v$VERSION_ERROR.log"
SUCCESS=0
cleanup() {
  status=$?
  trap - EXIT
  if [ "$SUCCESS" != 1 ]; then
    echo "Build failed; previous output was preserved." >&2
    if [ -f "$WORK/build.log" ]; then cp "$WORK/build.log" "$LOG" || true; fi
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42337-build.*) rm -rf -- "$WORK" ;; esac
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "[1/4] Downloading one source ZIP: v$VERSION"
curl -fL --retry 3 --connect-timeout 20 --max-time 300 \
  --output "$WORK/$ARCHIVE" "$RAW/source/$ARCHIVE"
[ -s "$WORK/$ARCHIVE" ] || { echo "Downloaded ZIP is missing." >&2; exit 1; }
SHA="$(shasum -a 256 "$WORK/$ARCHIVE" | awk '{print $1}')"
[ "$SHA" = "$EXPECTED_SHA256" ] || { echo "Source ZIP SHA-256 verification failed!" >&2; exit 1; }
unzip -tq "$WORK/$ARCHIVE" >/dev/null
echo "[2/4] Extracting verified source..."
unzip -q "$WORK/$ARCHIVE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_37_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "Missing source package.json." >&2; exit 1; }
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]37"' "$PROJECT/package.json" || { echo "Unexpected source version." >&2; exit 1; }
[ -f "$PROJECT/BUILD_MAC.command" ] || { echo "Missing build script." >&2; exit 1; }
echo "[3/4] Installing, testing and building macOS DMG..."
if (cd "$PROJECT" && OPENIPTV_ONE_COMMAND=1 bash ./BUILD_MAC.command) 2>&1 | tee "$WORK/build.log"; then
  :
else
  echo "Mac build failed; see output above." >&2; exit 1
fi
DMG_NAME="Open-IPTV-Pro-$VERSION-mac-$ARCH.dmg"
DMG="$PROJECT/dist/$DMG_NAME"
[ -s "$DMG" ] || { echo "DMG not found: $DMG" >&2; exit 1; }
SIZE="$(wc -c < "$DMG" | tr -d ' ')"
[ "$SIZE" -ge 1048576 ] || { echo "DMG is unexpectedly small." >&2; exit 1; }
echo "[4/4] Cleaning result: keeping ONLY DMG and matching source ZIP."
if [ -L "$OUT" ]; then echo "Output directory is a symlink; refusing to overwrite." >&2; exit 1; fi
if [ -e "$OUT" ] && [ ! -d "$OUT" ]; then echo "Output path is not a directory." >&2; exit 1; fi
if [ -d "$OUT" ]; then
  for ITEM in "$OUT"/* "$OUT"/.[!.]* "$OUT"/..?*; do
    [ -e "$ITEM" ] || [ -L "$ITEM" ] || continue
    [ -f "$ITEM" ] && [ ! -L "$ITEM" ] || { echo "Unexpected file type; refusing cleanup: $ITEM" >&2; exit 1; }
    case "$(basename "$ITEM")" in "$DMG_NAME"|"$ARCHIVE") ;; *) echo "Unknown file; refusing cleanup: $ITEM" >&2; exit 1 ;; esac
  done
fi
mkdir -p "$WORK/ready" "$OUT"
cp "$DMG" "$WORK/ready/$DMG_NAME"
cp "$WORK/$ARCHIVE" "$WORK/ready/$ARCHIVE"
rm -f "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
mv "$WORK/ready/$DMG_NAME" "$OUT/$DMG_NAME"
mv "$WORK/ready/$ARCHIVE" "$OUT/$ARCHIVE"
rm -f "$LOG"
SUCCESS=1
echo "BUILD COMPLETE: $OUT"
ls -lh "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
open "$OUT" || true
