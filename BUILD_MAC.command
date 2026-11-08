#!/bin/bash
# Open IPTV Pro 4.21.1 FULL: Tu tai Node.js vao thu muc rieng, KHONG cai vao macOS.
set -Eeuo pipefail
cd "$(dirname "$0")"
PROJECT="$PWD"
NODE_VER='22.16.0'
ARCH=$(uname -m)
case "$ARCH" in
  arm64)
    PLATFORM='darwin-arm64'
    EXPECTED='1d7f34ec4c03e12d8b33481e5c4560432d7dc31a0ef3ff5a4d9a8ada7cf6ecc9'
    BUILD_ARCH='arm64'
    ;;
  x86_64)
    PLATFORM='darwin-x64'
    EXPECTED='838d400f7e66c804e5d11e2ecb61d6e9e878611146baff69d6a2def3cc23f4ac'
    BUILD_ARCH='x64'
    ;;
  *) echo "Khong ho tro kien truc Mac: $ARCH"; exit 1;;
esac
ARCHIVE="node-v${NODE_VER}-${PLATFORM}.tar.gz"
TOOLS="$PROJECT/.open-iptv-tools"
LOCAL_NODE="$TOOLS/node-v${NODE_VER}-${PLATFORM}/bin"

pause_at_end() {
  status=$?
  if [ "$status" -ne 0 ]; then
    printf '\nLOI: Khong tao duoc bo cai. Xem dong loi o phia tren.\n'
    printf 'Van co the mo giao dien ngay bang README.md de xem cach chay du an.\n'
  fi
  if [ -t 0 ]; then
    printf '\nNhan Enter de dong cua so...'
    read -r _unused || true
  fi
}
trap pause_at_end EXIT

printf '\n============================================\n'
printf ' OPEN IPTV PRO 4.21.1 FULL - TAO DMG TU DONG\n'
printf '============================================\n'
printf 'Mac: %s | Node.js duoc luu rieng trong thu muc ung dung.\n' "$ARCH"
printf 'Khong yeu cau cai Node/Python/Qt/VLC thu cong.\n'

if [ ! -x "$LOCAL_NODE/node" ] || [ ! -x "$LOCAL_NODE/npm" ]; then
  mkdir -p "$TOOLS"
  URL="https://nodejs.org/dist/v${NODE_VER}/${ARCHIVE}"
  TARGET="$TOOLS/$ARCHIVE"
  printf '\n[1/4] Dang tai Node.js chinh thuc (~50 MB): %s\n' "$URL"
  rm -f "$TARGET.partial"
  curl --fail --location --retry 3 --connect-timeout 20 --max-time 900 \
    --output "$TARGET.partial" "$URL"
  mv "$TARGET.partial" "$TARGET"
  printf 'Dang kiem tra SHA-256...\n'
  ACTUAL=$(shasum -a 256 "$TARGET" | awk '{print $1}')
  if [ "$ACTUAL" != "$EXPECTED" ]; then
    rm -f "$TARGET"
    echo 'SHA-256 sai: Huy bo file tai. KHONG su dung file nay.'
    exit 1
  fi
  printf 'SHA-256 chinh xac. Giai nen vao thu muc rieng...\n'
  tar -xzf "$TARGET" -C "$TOOLS"
else
  printf '\n[1/4] Node.js da co trong thu muc Open IPTV Pro; su dung lai.\n'
fi
if [ ! -x "$LOCAL_NODE/node" ] || [ ! -x "$LOCAL_NODE/npm" ]; then
  echo 'Khong tim thay file chay Node sau giai nen.'; exit 1
fi
export PATH="$LOCAL_NODE:$PATH"
printf 'Node: %s | npm: %s\n' "$(node -v)" "$(npm -v)"

printf '\n[2/4] Tu tai Electron + bo phat HLS + FFmpeg tích hợp + cong cu dong goi...\n'
if [ -f package-lock.json ]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

printf '\n[3/4] Kiem tra ma nguon...\n'
npm test

printf '\n[4/4] Dang tao bo cai Mac (.dmg / .app) ...\n'
if [ -z "${CSC_LINK:-}" ]; then export CSC_IDENTITY_AUTO_DISCOVERY=false; fi
npx --no-install electron-builder --mac --"$BUILD_ARCH" --publish never

printf '\nTHANH CONG! File DMG nam trong: %s/dist\n' "$PROJECT"
open "$PROJECT/dist"
