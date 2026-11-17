#!/usr/bin/env bash
# Private/personal Mac build: ONLY one .app; open folder on success.
set -Eeuo pipefail
VERSION='4.23.66'
REF='experiment/electron-v42366-tts-translate-stability'
OUT="$HOME/Downloads/Open_IPTV_Pro_APP_v4.23.66"
TMP="$(mktemp -d /tmp/openiptv-app-v42366.XXXXXXXX)"
trap 'rm -rf "$TMP"' EXIT
case "$(uname -m)" in
 arm64|aarch64) ARCH='arm64' ;;
 x86_64|x64) ARCH='x64' ;;
 *) echo 'Unsupported Mac CPU' >&2; exit 1 ;;
esac
for bin in curl unzip node npm ditto open; do
 command -v "$bin" >/dev/null 2>&1 || { echo "Thiếu $bin (cần Node.js 22+ để build)." >&2; exit 1; }
done
ZIP="$TMP/src.zip"
printf 'Downloading source %s (%s)\n' "$VERSION" "$REF"
curl --fail --location --show-error --silent --retry 3 \
 "https://codeload.github.com/trisanghy/open-iptv-pro/zip/refs/heads/${REF}" -o "$ZIP"
unzip -q "$ZIP" -d "$TMP/source"
ROOT=''
for candidate in "$TMP"/source/*; do
 if [ -f "$candidate/package.json" ]; then ROOT="$candidate"; break; fi
done
[ -n "$ROOT" ] || { echo 'Archive source không hợp lệ' >&2; exit 1; }
cd "$ROOT"
node -e 'if(require("./package.json").version!=="4.23.66")process.exit(2)' ||
 { echo 'Sai phiên bản mã nguồn' >&2; exit 1; }
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm test
export CSC_IDENTITY_AUTO_DISCOVERY=false
printf 'Building ONLY .app (%s) - no DMG/source ZIP in output\n' "$ARCH"
./node_modules/.bin/electron-builder --mac --dir "--$ARCH" --publish never
APP=''
for candidate in "dist/mac-$ARCH/Open IPTV Pro.app" "dist/mac/Open IPTV Pro.app"; do
 if [ -f "$candidate/Contents/Info.plist" ]; then APP="$candidate"; break; fi
done
[ -n "$APP" ] || { echo 'Không tìm thấy Open IPTV Pro.app' >&2; exit 1; }
mkdir -p "$OUT"
rm -rf "$OUT/Open IPTV Pro.app"
ditto "$APP" "$OUT/Open IPTV Pro.app"
[ -f "$OUT/Open IPTV Pro.app/Contents/Info.plist" ] ||
 { echo 'Bundle ứng dụng chưa sao chép đầy đủ' >&2; exit 1; }
printf 'Hoàn tất: %s\n' "$OUT/Open IPTV Pro.app"
open "$OUT"
