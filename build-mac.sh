#!/usr/bin/env bash
# Open IPTV Pro - isolated source branch, macOS one-command builder
set -Eeuo pipefail
VERSION="4.23.35"
ARCHIVE="OpenIPTVPro_Source_v$VERSION.zip"
EXPECTED_SHA256="a5b58c8feb9f8e029e76504db99a3fe9a4764f47fc9c8b2ba1e50512a9339ca5"
RAW_BASE="https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source"
DOWNLOAD_URL="$RAW_BASE/source/$ARCHIVE"
case "$(uname -s)-$(uname -m)" in
  Darwin-arm64) PLATFORM="arm64" ;;
  Darwin-x86_64) PLATFORM="x64" ;;
  *) echo "ERROR: Chỉ hỗ trợ macOS Intel và Apple Silicon."; exit 1 ;;
esac
command -v curl >/dev/null || { echo "ERROR: Thiếu curl."; exit 1; }
command -v shasum >/dev/null || { echo "ERROR: Thiếu shasum."; exit 1; }
WORK="$(mktemp -d -t openiptv-build.XXXXXXXX)"
cleanup() { rm -rf "$WORK"; }
trap cleanup EXIT
trap 'echo "Build thất bại; file cũ trong Downloads vẫn được giữ." >&2' ERR
mkdir -p "$HOME/Downloads"
echo "Open IPTV Pro $VERSION — tải source từ nhánh iptv-build-source (không dùng main)"
curl --fail --location --silent --show-error --retry 3 --connect-timeout 20 --max-time 900 \
  --output "$WORK/$ARCHIVE" "$DOWNLOAD_URL"
ACTUAL="$(shasum -a 256 "$WORK/$ARCHIVE" | awk '{print $1}')"
if [ "$ACTUAL" != "$EXPECTED_SHA256" ]; then
  echo "ERROR: SHA256 source ZIP không khớp. Không build." >&2
  exit 1
fi
unzip -q "$WORK/$ARCHIVE" -d "$WORK"
PROJECT="$WORK/Open-IPTV-Pro-v4_23_35_Full_Desktop"
if [ ! -f "$PROJECT/package.json" ]; then echo "ERROR: Source ZIP không đúng cấu trúc."; exit 1; fi
if ! grep -Eq '"version"[[:space:]]*:[[:space:]]*"4\.23\.35"' "$PROJECT/package.json"; then
  echo "ERROR: Phiên bản mã nguồn không đúng $VERSION."; exit 1
fi
export OPENIPTV_ONE_COMMAND=1
bash "$PROJECT/BUILD_MAC.command"
DMG_NAME="Open-IPTV-Pro-$VERSION-mac-$PLATFORM.dmg"
DMG="$PROJECT/dist/$DMG_NAME"
[ -s "$DMG" ] || { echo "ERROR: Thiếu DMG hoặc DMG rỗng."; exit 1; }
DEST="$HOME/Downloads/OpenIPTVPro_Build_v$VERSION"
if [ -L "$DEST" ]; then echo "ERROR: Thư mục kết quả là symbolic link."; exit 1; fi
if [ -e "$DEST" ] && [ ! -d "$DEST" ]; then echo "ERROR: Đường dẫn kết quả không phải thư mục."; exit 1; fi
if [ -d "$DEST" ]; then
  for item in "$DEST"/* "$DEST"/.[!.]* "$DEST"/..?*; do
    [ -e "$item" ] || [ -L "$item" ] || continue
    case "$(basename "$item")" in "$DMG_NAME"|"$ARCHIVE") ;; *)
      echo "ERROR: Thư mục kết quả chứa file khác; không tự xóa dữ liệu của bạn: $item" >&2
      exit 1 ;;
    esac
  done
fi
mkdir -p "$DEST"
cp -f "$DMG" "$WORK/$DMG_NAME"
cp -f "$WORK/$ARCHIVE" "$WORK/$ARCHIVE.copy"
rm -f "$DEST/$DMG_NAME" "$DEST/$ARCHIVE"
mv "$WORK/$DMG_NAME" "$DEST/$DMG_NAME"
mv "$WORK/$ARCHIVE.copy" "$DEST/$ARCHIVE"
echo ""
echo "BUILD THÀNH CÔNG — chỉ có DMG + source ZIP:"
ls -lh "$DEST/$DMG_NAME" "$DEST/$ARCHIVE"
open "$DEST"
