#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
LOG="$HOME/Downloads/OpenIPTV_Mobile_Android_build.log"
exec > >(tee -a "$LOG") 2>&1
trap 'echo "[ERROR] Build Android stopped at line $LINENO. See $LOG"' ERR
printf '\n=== OPEN IPTV PRO MOBILE - ANDROID DEBUG APK ===\n'
if ! command -v node >/dev/null 2>&1; then echo 'Cần Node 22+. Cài Node LTS tại https://nodejs.org'; exit 1; fi
node -e 'if(+process.versions.node.split(".")[0]<22) process.exit(1)' || { echo 'Cần Node 22 trở lên';exit 1; }
if ! command -v java >/dev/null 2>&1; then
  JBR="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  if [ -x "$JBR/bin/java" ]; then export JAVA_HOME="$JBR";export PATH="$JAVA_HOME/bin:$PATH"; else echo 'Cần Android Studio với JDK 21'; exit 1;fi
fi
if [ -z "${ANDROID_HOME:-}" ]; then export ANDROID_HOME="$HOME/Library/Android/sdk";fi
export ANDROID_SDK_ROOT="$ANDROID_HOME"
if [ ! -d "$ANDROID_HOME/platforms" ]; then echo "Không thấy Android SDK trong $ANDROID_HOME. Mở Android Studio > SDK Manager, cài SDK Platform + Build Tools.";exit 1;fi
FREE_KB=$(df -Pk . | awk 'END {print $4}')
if [ "${FREE_KB:-0}" -lt 8388608 ];then echo 'Cần ít nhất 8 GB trống để build APK';exit 1;fi
npm install --no-audit --no-fund
npm test
npm run build
if [ ! -d android ];then npx cap add android;fi
npx cap sync android
node scripts/patch-native.mjs
(cd android && chmod +x ./gradlew && ./gradlew --no-daemon --max-workers=4 assembleDebug)
APK="android/app/build/outputs/apk/debug/app-debug.apk"
test -s "$APK" || { echo 'Gradle hoàn tất nhưng chưa thấy APK';exit 1;}
cp -f "$APK" "$HOME/Downloads/OpenIPTVPro-Mobile-4.21.1-debug.apk"
echo "[SUCCESS] APK: $HOME/Downloads/OpenIPTVPro-Mobile-4.21.1-debug.apk"
