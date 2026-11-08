#!/bin/bash
set -Eeuo pipefail
cd "$(dirname "$0")"
echo 'Open IPTV Pro Mobile 4.21.1';echo '1: Android APK';echo '2: iOS IPA / Xcode';echo '3: Cả hai';read -r -p 'Chọn (1/2/3): ' SEL
case "$SEL" in 1) bash BUILD_ANDROID_APK_MAC.command;; 2) bash BUILD_IOS_IPA_MAC.command;; 3) bash BUILD_ANDROID_APK_MAC.command && bash BUILD_IOS_IPA_MAC.command;; *) echo 'Lựa chọn không hợp lệ';exit 1;; esac
