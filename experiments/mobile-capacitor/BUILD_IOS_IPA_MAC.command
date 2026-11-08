#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
LOG="$HOME/Downloads/OpenIPTV_Mobile_iOS_build.log"
exec > >(tee -a "$LOG") 2>&1
trap 'echo "[ERROR] Build iOS stopped at line $LINENO. See $LOG"' ERR
printf '\n=== OPEN IPTV PRO MOBILE - IOS IPA ===\n'
if ! command -v node >/dev/null 2>&1;then echo 'Cần Node 22+. Cài Node LTS tại nodejs.org';exit 1;fi
node -e 'if(+process.versions.node.split(".")[0]<22) process.exit(1)' || { echo 'Cần Node 22 trở lên';exit 1; }
if ! command -v xcodebuild >/dev/null 2>&1;then echo 'Cần cài Xcode đầy đủ (không chỉ Command Line Tools).';exit 1;fi
if ! xcodebuild -version;then echo 'Mở Xcode lần đầu và chấp nhận License trước';exit 1;fi
FREE_KB=$(df -Pk . | awk 'END {print $4}')
if [ "${FREE_KB:-0}" -lt 10485760 ];then echo 'Cần tối thiểu 10 GB trống để build IPA';exit 1;fi
npm install --no-audit --no-fund
npm test
npm run build
if [ ! -d ios ];then npx cap add ios;fi
npx cap sync ios
node scripts/patch-native.mjs
if [ -z "${APPLE_TEAM_ID:-}" ]; then
 echo '[INFO] Cần Apple Team ID để ký IPA.'
 echo 'Đang mở Xcode: Settings > Accounts > Apple ID, sau đó App > Signing & Capabilities chọn Team.'
 npx cap open ios
 echo 'Sau khi chọn Team, chạy lại với APPLE_TEAM_ID=XXXXXXXXXX bash BUILD_IOS_IPA_MAC.command'
 exit 0
fi
printf '[INFO] Ký bằng Team %s\n' "$APPLE_TEAM_ID"
# The CLI generates an IPA only if Apple signing/provisioning supports this export method.
npx cap build ios --xcode-team-id "$APPLE_TEAM_ID" --xcode-signing-style automatic --xcode-export-method debugging
IPA=$(find ios -type f -name '*.ipa' -print -quit)
if [ -n "$IPA" ] && [ -s "$IPA" ]; then cp -f "$IPA" "$HOME/Downloads/OpenIPTVPro-Mobile-4.21.1.ipa";echo "[SUCCESS] IPA: $HOME/Downloads/OpenIPTVPro-Mobile-4.21.1.ipa";else echo 'Đã build nhưng không thấy IPA. Kiểm tra signing/provisioning Xcode.';exit 1;fi
