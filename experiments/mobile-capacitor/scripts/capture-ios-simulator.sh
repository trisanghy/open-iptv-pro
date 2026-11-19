#!/usr/bin/env bash
set -Eeuo pipefail
: "${MOBILE_VERSION:?MOBILE_VERSION required}"
APP_ID="com.trisanghy.openiptvpro.mobile"
mkdir -p release
echo "Available simulator devices:"
xcrun simctl list devices available
UDID="$(python3 - <<'PY'
import json,subprocess
data=json.loads(subprocess.check_output(['xcrun','simctl','list','devices','available','-j']))
choices=[]
for runtime,devices in data['devices'].items():
 if 'iOS' not in runtime: continue
 for d in devices:
  if not d.get('isAvailable',True): continue
  if 'iPhone' not in d.get('name',''): continue
  choices.append(d)
if choices: print(choices[0]['udid'])
PY
)"
if [[ -z "$UDID" ]]; then
  echo "::error::No available iPhone iOS Simulator runtime on runner"
  exit 2
fi
echo "Booting iPhone simulator $UDID"
xcrun simctl boot "$UDID" || true
xcrun simctl bootstatus "$UDID" -b
echo "Building app for actual iOS Simulator (not an IPA or mockup)"
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug \
 -sdk iphonesimulator -destination "platform=iOS Simulator,id=$UDID" \
 -derivedDataPath ios/DerivedDataSimulator \
 CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO build
APP="ios/DerivedDataSimulator/Build/Products/Debug-iphonesimulator/App.app"
test -s "$APP/Info.plist"
xcrun simctl install "$UDID" "$APP"
xcrun simctl terminate "$UDID" "$APP_ID" || true
xcrun simctl launch "$UDID" "$APP_ID"
sleep 8
SCREEN="release/OpenIPTVPro-Mobile-${MOBILE_VERSION}-iOS-Simulator.png"
xcrun simctl io "$UDID" screenshot "$SCREEN"
file "$SCREEN" | grep -q 'PNG image data'
test "$(stat -f%z "$SCREEN")" -gt 20000
echo "Captured installed iPhone Simulator screen: $SCREEN"
