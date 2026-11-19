#!/usr/bin/env bash
set -Eeuo pipefail
VERSION=4.23.17-mobile.10
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
# Scroll channel list into view and capture the newly added "Recently watched" section.
adb shell input swipe 540 1700 540 850 470
sleep 2
adb exec-out screencap -p > "release/OpenIPTVPro-Mobile-${VERSION}-Android-Recent.png"
file "release/OpenIPTVPro-Mobile-${VERSION}-Android-Recent.png" | grep -q 'PNG image data'
test "$(stat -c%s "release/OpenIPTVPro-Mobile-${VERSION}-Android-Recent.png")" -gt 20000
# Bottom navigation remains fixed while content scrolls.

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


# Open Settings via accessible text in the More sheet; fallback to its known grid position.
timeout 18s adb shell uiautomator dump /sdcard/openiptv-more.xml >/dev/null 2>&1 || true
adb exec-out cat /sdcard/openiptv-more.xml > /tmp/openiptv-more.xml 2>/dev/null || true
POINT="$(python3 - <<'PY'
import xml.etree.ElementTree as ET,re
try:
  root=ET.parse('/tmp/openiptv-more.xml').getroot()
  nodes=[n for n in root.iter('node') if 'Cài đặt' in ((n.get('text') or '')+' '+(n.get('content-desc') or ''))]
  for n in reversed(nodes):
    b=re.findall(r'\d+',n.get('bounds',''))
    if len(b)==4:
      print((int(b[0])+int(b[2]))//2,(int(b[1])+int(b[3]))//2)
      break
except Exception: pass
PY
)"
if [ -n "$POINT" ]; then
  adb shell input tap $POINT
else
  adb shell input tap "$((WIDTH*3/4))" "$((HEIGHT*72/100))"
fi
sleep 3
adb exec-out screencap -p > "release/OpenIPTVPro-Mobile-${VERSION}-Android-PiP-Settings.png"
file "release/OpenIPTVPro-Mobile-${VERSION}-Android-PiP-Settings.png" | grep -q 'PNG image data'
test "$(stat -c%s "release/OpenIPTVPro-Mobile-${VERSION}-Android-PiP-Settings.png")" -gt 20000
