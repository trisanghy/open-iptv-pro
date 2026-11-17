#!/usr/bin/env bash
# Open IPTV Pro v4.23.59 native macOS DMG-only builder.
# Unlike legacy BUILD_MAC.command, never expects or builds the updater app ZIP.
set -Eeuo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
cd "$ROOT"
ARCH="${1:-$(uname -m)}"
case "$ARCH" in
  arm64|aarch64) ARCH=arm64 ;;
  x64|x86_64) ARCH=x64 ;;
  *) echo "Unsupported Mac CPU architecture: $ARCH" >&2; exit 1 ;;
esac
[ -f package.json ] || { echo "Missing package.json at $ROOT" >&2; exit 1; }
command -v node >/dev/null 2>&1 || { echo 'Node.js is not on PATH.' >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo 'npm is not on PATH.' >&2; exit 1; }
node -e '
 const p=require("./package.json");
 if(p.version!=="4.23.59"||JSON.stringify(p.build?.mac?.target)!==JSON.stringify(["dmg"])||
   p.build?.dmg?.writeUpdateInfo!==false){
   console.error("Expected exact v4.23.59 DMG-only profile");
   process.exit(1);
 }'
echo "[DMG] Installing project dependencies (no app ZIP, no update blockmap)..."
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi
[ -x node_modules/.bin/electron-builder ] || { echo 'Missing local electron-builder executable.' >&2; exit 1; }
echo "[DMG] Packaging native macOS $ARCH DMG only..."
export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES=false
./node_modules/.bin/electron-builder --mac dmg "--$ARCH" --publish never
DMG="dist/Open-IPTV-Pro-4.23.59-mac-${ARCH}.dmg"
[ -s "$DMG" ] || { echo "DMG build did not produce $DMG" >&2; exit 1; }
echo "[DMG] Verified: $DMG"
ls -lh "$DMG"
