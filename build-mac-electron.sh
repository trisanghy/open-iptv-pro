#!/usr/bin/env bash
# Permanent Electron build: ONLY .app; open Finder; auto-clean source.
set -Eeuo pipefail
REF='build-sources/electron-desktop'
TMP="$(mktemp -d /tmp/openiptv-electron.XXXXXXXX)"
trap 'rm -rf "$TMP"' EXIT
case "$(uname -m)" in arm64|aarch64) ARCH=arm64;; x86_64|x64) ARCH=x64;; *) echo 'Unsupported Mac CPU' >&2; exit 1;; esac
for tool in curl unzip node npm ditto open; do command -v "$tool" >/dev/null || { echo "Missing $tool" >&2; exit 1; }; done
echo "Downloading Electron source from $REF"
curl -fsSL --retry 3 "https://codeload.github.com/trisanghy/open-iptv-pro/zip/refs/heads/$REF" -o "$TMP/src.zip"
unzip -q "$TMP/src.zip" -d "$TMP/source"
ROOT=''
for folder in "$TMP"/source/*; do if [ -f "$folder/package.json" ]; then ROOT="$folder"; break; fi; done
[ -n "$ROOT" ] || { echo 'Invalid source archive' >&2; exit 1; }
cd "$ROOT"
VERSION="$(node -p 'require("./package.json").version')"
case "$VERSION" in ''|*[!0-9.]*) echo 'Invalid package version' >&2; exit 1;; esac
if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
npm test
export CSC_IDENTITY_AUTO_DISCOVERY=false
./node_modules/.bin/electron-builder --mac --dir "--$ARCH" --publish never
APP=''
for folder in "dist/mac-$ARCH/Open IPTV Pro.app" "dist/mac/Open IPTV Pro.app"; do if [ -f "$folder/Contents/Info.plist" ]; then APP="$folder"; break; fi; done
[ -n "$APP" ] || { echo 'Mac .app was not created' >&2; exit 1; }
OUT="$HOME/Downloads/Open_IPTV_Pro_APP_v$VERSION"
mkdir -p "$OUT"
rm -rf "$OUT/Open IPTV Pro.app"
ditto "$APP" "$OUT/Open IPTV Pro.app"
test -f "$OUT/Open IPTV Pro.app/Contents/Info.plist"
echo "Completed: $OUT/Open IPTV Pro.app"
open "$OUT"
