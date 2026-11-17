#!/usr/bin/env bash
# Public/other users: native DMG plus matching source ZIP; no .app in output.
set -Eeuo pipefail
VERSION='4.23.66'
REF='electron-v4.23.66'
OUT="$HOME/Downloads/Open_IPTV_Pro_v4.23.66_release"
TMP="$(mktemp -d /tmp/openiptv-release-v42366.XXXXXXXX)"
trap 'rm -rf "$TMP"' EXIT
case "$(uname -m)" in
 arm64|aarch64) ARCH='arm64' ;;
 x86_64|x64) ARCH='x64' ;;
 *) echo 'Unsupported Mac CPU' >&2; exit 1 ;;
esac
for bin in curl unzip node npm; do
 command -v "$bin" >/dev/null 2>&1 || { echo "Missing $bin" >&2; exit 1; }
done
ZIP="$TMP/OpenIPTVPro_Source_v4.23.66.zip"
curl --fail --location --show-error --silent --retry 3 \
 "https://codeload.github.com/trisanghy/open-iptv-pro/zip/refs/tags/${REF}" -o "$ZIP"
unzip -q "$ZIP" -d "$TMP/source"
ROOT=''
for candidate in "$TMP"/source/*; do
 if [ -f "$candidate/package.json" ]; then ROOT="$candidate"; break; fi
done
[ -n "$ROOT" ] || { echo 'Invalid source archive' >&2; exit 1; }
cd "$ROOT"
node -e 'if(require("./package.json").version!=="4.23.66")process.exit(2)'
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm test
export CSC_IDENTITY_AUTO_DISCOVERY=false
./node_modules/.bin/electron-builder --mac dmg "--$ARCH" --publish never
DMG="dist/Open-IPTV-Pro-$VERSION-mac-$ARCH.dmg"
[ -s "$DMG" ] || { echo "DMG not generated: $DMG" >&2; exit 1; }
mkdir -p "$OUT"
cp "$DMG" "$OUT/"
cp "$ZIP" "$OUT/OpenIPTVPro_Source_v4.23.66.zip"
printf 'Release files:\n  %s\n  %s\n' "$OUT/$(basename "$DMG")" "$OUT/OpenIPTVPro_Source_v4.23.66.zip"
