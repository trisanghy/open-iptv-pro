#!/usr/bin/env bash
set -Eeuo pipefail
VERSION=4.23.17-mobile.8
PACKAGE=com.trisanghy.openiptvpro.mobile
mkdir -p release
adb install -r "release/OpenIPTVPro-Mobile-${VERSION}-debug.apk"
adb shell am force-stop com.google.android.apps.nexuslauncher || true
adb shell am force-stop com.android.launcher3 || true
adb shell am start -W -n "$PACKAGE/.MainActivity"
sleep 5

# Reclaim emulator UI when the system launcher ANR overlays the IPTV app.
for attempt in 1 2; do
  timeout 20s adb shell uiautomator dump /sdcard/window.xml >/dev/null 2>&1 || true
  if adb shell cat /sdcard/window.xml 2>/dev/null | grep -Eqi 'responding'; then
    adb shell input tap 310 1185
    sleep 2
    adb shell am start -W -n "$PACKAGE/.MainActivity"
    sleep 2
  else
    break
  fi
done
adb exec-out screencap -p > "release/OpenIPTVPro-Mobile-${VERSION}-Android-screenshot.png"
SIZE="$(adb shell wm size | grep -Eo '[0-9]+x[0-9]+' | tail -1)"
WIDTH="${SIZE%x*}"
HEIGHT="${SIZE#*x}"
test -n "$WIDTH" && test -n "$HEIGHT"
# Check default guide-source choices on the actual Android build.
adb shell input tap "$((WIDTH*5/10))" "$((HEIGHT-230))"
sleep 3
adb exec-out screencap -p > "release/OpenIPTVPro-Mobile-${VERSION}-Android-EPG.png"
# Switch to the More sheet after EPG screenshot.
adb shell input tap "$((WIDTH*9/10))" "$((HEIGHT-230))"
sleep 3
adb exec-out screencap -p > "release/OpenIPTVPro-Mobile-${VERSION}-Android-more.png"
file "release/OpenIPTVPro-Mobile-${VERSION}-Android-screenshot.png" | grep -q 'PNG image data'
file "release/OpenIPTVPro-Mobile-${VERSION}-Android-more.png" | grep -q 'PNG image data'
file "release/OpenIPTVPro-Mobile-${VERSION}-Android-EPG.png" | grep -q 'PNG image data'
test "$(stat -c%s "release/OpenIPTVPro-Mobile-${VERSION}-Android-screenshot.png")" -gt 20000
test "$(stat -c%s "release/OpenIPTVPro-Mobile-${VERSION}-Android-more.png")" -gt 20000
test "$(stat -c%s "release/OpenIPTVPro-Mobile-${VERSION}-Android-EPG.png")" -gt 20000
if cmp -s "release/OpenIPTVPro-Mobile-${VERSION}-Android-screenshot.png" "release/OpenIPTVPro-Mobile-${VERSION}-Android-more.png"; then
  echo "::error::Android More sheet not opened; screenshots identical"
  exit 1
fi
