#!/usr/bin/env bash
# Open IPTV Pro v4.23.39: fast single-ZIP macOS builder; retain one SHA-256 check.
set -Eeuo pipefail
VERSION="4.23.39"
ARCHIVE="OpenIPTVPro_Source_v$VERSION.zip"
EXPECTED_SHA256="9fff925ca8bd5563ba1500bb579e0bc9aa6605f26f411e7b872a09686bc32aa3"
RAW="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) ARCH="arm64" ;;
  Darwin-x86_64) ARCH="x64" ;;
  *) echo "ERROR: This command only builds macOS Intel/Apple Silicon." >&2; exit 1 ;;
esac
for cmd in curl shasum unzip awk sed df mktemp tee; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Missing utility: $cmd" >&2; exit 1; }
done
DOWNLOADS="$HOME/Downloads"
mkdir -p "$DOWNLOADS"
FREE_KIB="$(df -Pk "$DOWNLOADS" | awk 'NR==2 {print $4}')"
if [ -n "$FREE_KIB" ] && [ "$FREE_KIB" -lt 6291456 ]; then
  echo "Insufficient free space: at least 6 GB; 10 GB recommended." >&2
  df -h "$DOWNLOADS" >&2; exit 1
fi
WORK="$(mktemp -d "$DOWNLOADS/.openiptv-42338-build.XXXXXXXX")"
OUT="$DOWNLOADS/OpenIPTVPro_Build_v$VERSION"
LOG="$DOWNLOADS/OpenIPTVPro_Build_v${VERSION}_ERROR.log"
SUCCESS=0
cleanup() {
  status=$?
  trap - EXIT
  if [ "$SUCCESS" != 1 ]; then
    echo "Build failed; previous output was preserved." >&2
    if [ -f "$WORK/build.log" ]; then cp "$WORK/build.log" "$LOG" || true; fi
  fi
  case "$WORK" in "$DOWNLOADS"/.openiptv-42338-build.*) rm -rf -- "$WORK" ;; esac
  exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
echo "[1/4] Downloading one source ZIP: v$VERSION"
curl -fL --retry 2 --connect-timeout 15 --max-time 180 \
  --output "$WORK/$ARCHIVE" "$RAW/source/$ARCHIVE"
[ -s "$WORK/$ARCHIVE" ] || { echo "Downloaded ZIP is missing." >&2; exit 1; }
SHA="$(shasum -a 256 "$WORK/$ARCHIVE" | awk '{print $1}')"
[ "$SHA" = "$EXPECTED_SHA256" ] || { echo "Source ZIP SHA-256 verification failed!" >&2; exit 1; }
echo "[2/4] Extracting source (no redundant ZIP pre-scan)..."
unzip -q "$WORK/$ARCHIVE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_39_Full_Desktop"
[ -f "$PROJECT/package.json" ] || { echo "Missing source package.json." >&2; exit 1; }
grep -Eq '"version"[[:space:]]*:[[:space:]]*"4[.]23[.]39"' "$PROJECT/package.json" || { echo "Unexpected source version." >&2; exit 1; }
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
mv "$DMG" "$WORK/ready/$DMG_NAME"
mv "$WORK/$ARCHIVE" "$WORK/ready/$ARCHIVE"
rm -f "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
mv "$WORK/ready/$DMG_NAME" "$OUT/$DMG_NAME"
mv "$WORK/ready/$ARCHIVE" "$OUT/$ARCHIVE"
rm -f "$LOG"
SUCCESS=1
echo "BUILD COMPLETE: $OUT"
ls -lh "$OUT/$DMG_NAME" "$OUT/$ARCHIVE"
open "$OUT" || true
