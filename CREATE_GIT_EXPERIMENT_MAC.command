#!/bin/bash
set -euo pipefail
src="$(cd "$(dirname "$0")" && pwd)"
target="$HOME/Downloads/OpenIPTVPro_Rust_Tauri_Git_Experiment"
branch="experiment/rust-tauri-v2"
command -v git >/dev/null || { echo 'Please install Git';exit 1; }
[ ! -e "$target" ] || { echo "Target already exists: $target; no changes made";exit 1; }
git clone --no-tags https://github.com/trisanghy/open-iptv-pro.git "$target"
git -C "$target" switch -c "$branch"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='target' --exclude='dist' \
 --exclude='*.dmg' --exclude='*.exe' --exclude='*.msi' "$src/" "$target/"
for obsolete in release-desktop.yml tao-bo-cai.yml test.yml; do
  rm -f "$target/.github/workflows/$obsolete"
done
printf 'Created local branch %s in %s\n' "$branch" "$target"
printf 'Nothing was committed/pushed. Inspect with: git -C "%s" status --short\n' "$target"
