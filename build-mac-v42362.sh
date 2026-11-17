#!/usr/bin/env bash
# One-command native Mac DMG + matching source ZIP, no preinstalled source required.
set -Eeuo pipefail
VERSION=4.23.62
REF='experiment/electron-v42362-vietnamese-tts'
OUT="$HOME/Downloads/Open_IPTV_Pro_v4.23.62"
TMP="$(mktemp -d "/tmp/openiptv-v42362.XXXXXXXX")"
trap 'rm -rf "$TMP"' EXIT
ARCH="$(uname -m)"
case "$ARCH" in
  arm64|aarch64) ARCH=arm64 ;;
  x86_64|x64) ARCH=x64 ;;
  *) echo "Chưa hỗ trợ CPU Mac $ARCH" >&2; exit 1 ;;
esac
for bin in curl unzip node npm; do
  command -v "$bin" >/dev/null 2>&1 || { echo "Thiếu công cụ $bin" >&2; exit 1; }
done
mkdir -p "$OUT"
ZIP="$TMP/OpenIPTVPro_Source_v4.23.62.zip"
printf "Downloading experimental source branch: %s\n" "${REF}"
curl --fail --location --silent --show-error --retry 3 \
  "https://codeload.github.com/trisanghy/open-iptv-pro/zip/refs/heads/${REF}" -o "$ZIP"
unzip -q "$ZIP" -d "$TMP/src"
ROOT="$(find "$TMP/src" -mindepth 1 -maxdepth 1 -type d | head -1)"
[ -n "$ROOT" ] && [ -f "$ROOT/package.json" ] || { echo "Mã nguồn tải về không hợp lệ" >&2; exit 1; }
cd "$ROOT"
node -e 'const p=require("./package.json");if(p.version!=="4.23.62"||JSON.stringify(p.build.mac.target)!==JSON.stringify(["dmg"]))process.exit(2)'
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm test
export CSC_IDENTITY_AUTO_DISCOVERY=false
./node_modules/.bin/electron-builder --mac dmg "--$ARCH" --publish never
DMG="dist/Open-IPTV-Pro-$VERSION-mac-$ARCH.dmg"
[ -s "$DMG" ] || { echo "Đóng gói DMG chưa thành công" >&2; exit 1; }
cp "$DMG" "$OUT/"
cp "$ZIP" "$OUT/OpenIPTVPro_Source_v4.23.62.zip"
echo "DMG: $OUT/$(basename "$DMG")"
echo "Source ZIP: $OUT/OpenIPTVPro_Source_v4.23.62.zip"
