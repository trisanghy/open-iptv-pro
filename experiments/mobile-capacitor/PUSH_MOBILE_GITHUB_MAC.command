#!/bin/bash
set -Eeuo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
BRANCH="experiment/mobile-capacitor-4211"
REPO="https://github.com/trisanghy/open-iptv-pro.git"
command -v git >/dev/null || { echo 'Cần Git trên Mac';exit 1; }
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
printf 'Clone %s\n' "$REPO"
git clone "$REPO" "$TMP/repo"
cd "$TMP/repo"
git fetch origin "$BRANCH" 2>/dev/null && git switch -c "$BRANCH" --track "origin/$BRANCH" || git switch -c "$BRANCH" origin/main
mkdir -p experiments/mobile-capacitor .github/workflows
rsync -a --delete --exclude .git --exclude node_modules --exclude dist --exclude ios --exclude android "$SRC/" experiments/mobile-capacitor/
cp -f "$SRC/GITHUB_ACTIONS_ANDROID_APK.yml" .github/workflows/mobile-apk.yml
git add experiments/mobile-capacitor .github/workflows/mobile-apk.yml
if git diff --cached --quiet;then echo 'Không có thay đổi mới';exit 0;fi
git commit -m 'feat(mobile): Android iOS Capacitor 8 prototype from 4.21.1'
git push -u origin "$BRANCH"
echo "[SUCCESS] https://github.com/trisanghy/open-iptv-pro/tree/$BRANCH"
