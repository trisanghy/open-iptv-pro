#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p "$HOME/Downloads"
LOG="$HOME/Downloads/OpenIPTV_WebView_FULL_build.log"
exec > >(tee -a "$LOG") 2>&1
printf '\n=== Open IPTV Pro v4.19 WebView FULL / DMG ===\n'
FREE_KB=$(df -Pk . | awk 'NR==2 {print $4}')
if (( FREE_KB < 10*1024*1024 )); then
  echo "Cần tối thiểu 10GB dung lượng trống để build. Hiện có $((FREE_KB/1024)) MB."
  echo 'Không tự xóa dữ liệu hoặc cache người dùng.'; exit 1
fi
if ! xcode-select -p >/dev/null 2>&1; then
  echo 'Thiếu Xcode Command Line Tools. Đang mở cửa sổ cài đặt của Apple...'; xcode-select --install || true
  echo 'Cài Xcode Command Line Tools xong rồi chạy lại file này.'; exit 1
fi
if ! command -v node >/dev/null; then
 if command -v brew >/dev/null; then
  echo 'Tự cài Node.js cho công đoạn build...'; brew install node
 else
  echo 'Chưa có Node.js. Cài Node.js LTS từ https://nodejs.org hoặc Homebrew rồi chạy lại.'; exit 1
 fi
fi
if ! command -v cargo >/dev/null; then
 echo 'Cài Rust profile tối thiểu (không tải rust-src và docs)...'
 curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs | sh -s -- -y --profile minimal
fi
export PATH="$HOME/.cargo/bin:$PATH"
if ! command -v cargo >/dev/null; then echo 'Không tìm thấy cargo sau cài đặt';exit 1;fi
printf '\n== Cài thư viện build ==\n'
npm install --no-audit --no-fund
printf '\n== Kiểm thử mã v4.19 gốc và bridge ==\n'
npm run test:original
npm run test:bridge
printf '\n== Đóng gói FFmpeg/FFprobe/Node + tạo DMG ==\n'
npm run prepare
npx tauri build --bundles dmg
mkdir -p "$HOME/Downloads/OpenIPTV_WebView_FULL_DMG"
find src-tauri/target -type f -path '*/bundle/dmg/*.dmg' -exec cp -f '{}' "$HOME/Downloads/OpenIPTV_WebView_FULL_DMG/" \;
if ! find "$HOME/Downloads/OpenIPTV_WebView_FULL_DMG" -maxdepth 1 -name '*.dmg' | grep -q .; then
 echo 'Build chưa tạo ra DMG; xem log tại Downloads.';exit 1
fi
echo 'THÀNH CÔNG: DMG tại ~/Downloads/OpenIPTV_WebView_FULL_DMG/'
open "$HOME/Downloads/OpenIPTV_WebView_FULL_DMG" || true
