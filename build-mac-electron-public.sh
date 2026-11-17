#!/usr/bin/env bash
# Separate public Mac builder: DMG plus matching source ZIP.
set -Eeuo pipefail
REF='build-sources/electron-desktop'
TMP="$(mktemp -d /tmp/openiptv-public.XXXXXXXX)"
trap 'rm -rf "$TMP"' EXIT
case "$(uname -m)" in arm64|aarch64) ARCH=arm64;; x86_64|x64) ARCH=x64;; *) echo 'Unsupported Mac CPU' >&2; exit 1;; esac
for tool in curl unzip node npm; do command -v "$tool" >/dev/null || { echo "Missing $tool" >&2; exit 1; }; done
curl -fsSL --retry 3 "https://codeload.github.com/trisanghy/open-iptv-pro/zip/refs/heads/$REF" -o "$TMP/src.zip"
unzip -q "$TMP/src.zip" -d "$TMP/source"
ROOT=''
for folder in "$TMP"/source/*; do if [ -f "$folder/package.json" ]; then ROOT="$folder"; break; fi; done
[ -n "$ROOT" ] || { echo 'Invalid source archive' >&2; exit 1; }
cd "$ROOT"
VERSION="$(node -p 'require("./package.json").version')"
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm test
export CSC_IDENTITY_AUTO_DISCOVERY=false
./node_modules/.bin/electron-builder --mac dmg "--$ARCH" --publish never
DMG="dist/Open-IPTV-Pro-$VERSION-mac-$ARCH.dmg"
test -s "$DMG" || { echo 'DMG missing' >&2; exit 1; }
OUT="$HOME/Downloads/Open_IPTV_Pro_v$VERSION""_release"
mkdir -p "$OUT"
cp "$DMG" "$OUT/"
cp "$TMP/src.zip" "$OUT/OpenIPTVPro_Source_v$VERSION.zip"
echo "Completed public package: $OUT"
