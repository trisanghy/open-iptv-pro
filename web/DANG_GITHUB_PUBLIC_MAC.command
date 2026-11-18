#!/bin/bash
# Open IPTV Pro: publish the vetted project files to a NEW public GitHub repo.
# Never automatically publish private playlists, tokens, snapshots or extra files.
set -Eeuo pipefail
cd "$(dirname "$0")"
printf '\nOPEN IPTV PRO 4.1 — PUBLISH PUBLIC GITHUB PROJECT\n'
printf 'Chi dang cac file trong PUBLISH_FILES.txt. Khong dang playlist/snapshot/token ca nhan.\n\n'
if ! command -v git >/dev/null 2>&1; then
  echo 'Chua co Git. Mac: cai Command Line Tools bang: xcode-select --install'; exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo 'May chua co GitHub CLI (gh). Day la cong cu dang du an, khong phai de xem IPTV.'
  if command -v brew >/dev/null 2>&1; then
    read -r -p 'Cai GitHub CLI bang Homebrew? Nhap yes de cai: ' ok
    if [[ "$ok" == yes ]];then brew install gh;else echo 'Tai https://cli.github.com va chay lai.';exit 1;fi
  else
    echo 'Tai GitHub CLI tu https://cli.github.com, sau do chay lai script.'
    exit 1
  fi
fi
if [ -d .git ]; then
  echo 'Thu muc nay da co .git. Dung lai de khong ghi de/commit nham.'; exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo 'Dang nhap GitHub qua trinh duyet (khong dan token vao day):'
  gh auth login --hostname github.com --git-protocol https --web
fi
ACCOUNT=$(gh api user -q .login)
if [[ ! "$ACCOUNT" =~ ^[A-Za-z0-9-]+$ ]];then echo 'Khong xac dinh duoc username GitHub';exit 1;fi
read -r -p 'Ten repository PUBLIC moi [open-iptv-pro]: ' REPO
REPO=${REPO:-open-iptv-pro}
if [[ ! "$REPO" =~ ^[A-Za-z0-9._-]+$ || "$REPO" == '.' || "$REPO" == '..' ]];then echo 'Ten repo khong hop le';exit 1;fi
if gh repo view "$ACCOUNT/$REPO" >/dev/null 2>&1;then
  echo "Repository $ACCOUNT/$REPO da ton tai. Khong ghi de.";exit 1
fi
LIST=()
while IFS= read -r F || [[ -n "$F" ]];do
  [[ -z "$F" || "$F" == \#* ]] && continue
  if [[ "$F" == /* || "$F" == *'..'* || "$F" == *'\\'* || ! -f "$F" || -L "$F" ]];then
    echo "Khong an toan / thieu file: $F";exit 1
  fi
  LIST+=("$F")
done < PUBLISH_FILES.txt
if ((${#LIST[@]} < 20));then echo 'Danh sach file bat thuong, da huy';exit 1;fi
printf '\nFILE SE CONG KHAI (%s file):\n' "${#LIST[@]}"
printf '  %s\n' "${LIST[@]}"
printf '\nDIA CHI DU KIEN: https://github.com/%s/%s\n' "$ACCOUNT" "$REPO"
echo 'NHAC LAI: Toan bo tap tin tren se la CONG KHAI. Hay kiem tra khong co URL/token ca nhan.'
read -r -p 'Nhap dung PUBLIC de xac nhan tao repo moi va day ma nguon: ' OK
[[ "$OK" == 'PUBLIC' ]] || { echo 'Da huy, khong thay doi gi.'; exit 0; }
# Setup git only after confirmation; do not stage any unlisted file.
git init -b main
if [ -z "$(git config --local --get user.name || :)" ];then git config --local user.name "$ACCOUNT";fi
if [ -z "$(git config --local --get user.email || :)" ];then
  ID=$(gh api user -q .id)
  git config --local user.email "${ID}+${ACCOUNT}@users.noreply.github.com"
fi
git add -- "${LIST[@]}"
# Double-check staged paths against allowlist.
if [ "$(git diff --cached --name-only | wc -l | tr -d ' ')" -ne "${#LIST[@]}" ];then
  echo 'Danh sach staged khong khop, dung lai de kiem tra.';exit 1
fi
git commit -m 'Initial public release: Open IPTV Pro v4.1.0'
# Create a new repository only, never force-push or overwrite.
gh repo create "$ACCOUNT/$REPO" --public --source=. --remote=origin --push --description 'Open-source IPTV player for macOS and Windows: M3U, XMLTV EPG, PiP, snapshots, link checks'
printf '\nDA TAO: https://github.com/%s/%s\n' "$ACCOUNT" "$REPO"
if command -v open >/dev/null 2>&1;then open "https://github.com/$ACCOUNT/$REPO" || :;fi
