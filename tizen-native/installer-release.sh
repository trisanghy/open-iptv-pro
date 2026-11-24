#!/usr/bin/env bash
# Owner-side signing and dedicated GitHub release. Never upload certificates.
set -euo pipefail
SOURCE=trisanghy/open-iptv-pro
DEST=trisanghy/open-iptv-pro-tizen
RUN=45300343037
ARTIFACT=Open-IPTV-Pro-TV-Native-UNSIGNED
SOURCE_SHA=a1b3b121ba4078548485fa43ec7f71c4b43217e4
MODE="${1:-prepare}"
WORK="$HOME/Downloads/Open-IPTV-Pro-Tizen-$RUN"
die(){ printf '%s\n' "$*" >&2; exit 1; }
command -v python3 >/dev/null || die 'Cần Python 3.'
command -v gh >/dev/null || die 'Cần GitHub CLI (gh). macOS: brew install gh'
gh auth status >/dev/null 2>&1 || die 'Hãy đăng nhập trước: gh auth login'
mkdir -p "$WORK"

if [[ "$MODE" == prepare ]]; then
  TIZEN="${TIZEN_CLI:-}"
  if [[ -z "$TIZEN" ]]; then
    TIZEN="$(command -v tizen || true)"
    if [[ -z "$TIZEN" && -x "$HOME/tizen-studio/tools/ide/bin/tizen" ]]; then
      TIZEN="$HOME/tizen-studio/tools/ide/bin/tizen"
    fi
  fi
  [[ -n "$TIZEN" && -x "$TIZEN" ]] || die 'Cần Tizen Studio + Samsung TV Extension, và Certificate Manager với chứng chỉ TV đã cấu hình. Có thể đặt TIZEN_CLI=/đường/dẫn/tizen.'
  printf 'Nhập tên Samsung certificate profile (đã thêm DUID TV): '
  IFS= read -r PROFILE
  [[ -n "$PROFILE" ]] || die 'Chưa có certificate profile.'
  TMP="$(mktemp -d "$WORK/build.XXXXXX")"
  trap 'rm -rf "$TMP"' EXIT
  gh run download "$RUN" -R "$SOURCE" -n "$ARTIFACT" -D "$TMP/artifact"
  UNSIGNED="$(find "$TMP/artifact" -type f -name 'Open-IPTV-Pro-TV-Native-UNSIGNED.wgt' -print -quit)"
  [[ -n "$UNSIGNED" ]] || die 'Không thấy WGT trong artifact.'
  mkdir -p "$TMP/project"
  python3 - "$UNSIGNED" "$TMP/project" <<'PY'
import sys,zipfile,pathlib,xml.etree.ElementTree as ET
src,dest=sys.argv[1:]
with zipfile.ZipFile(src) as z:
    assert z.testzip() is None
    names=set(z.namelist())
    assert {'config.xml','index.html','hls.min.js','dash.all.min.js','mpegts.min.js'} <= names
    assert not {'author-signature.xml','signature1.xml'} & names
    assert ET.fromstring(z.read('config.xml')).attrib['version']=='0.1.52'
    for n in names:
        p=pathlib.PurePosixPath(n)
        assert not p.is_absolute() and '..' not in p.parts
    z.extractall(dest)
PY
  "$TIZEN" build-web -- "$TMP/project"
  "$TIZEN" package -t wgt -s "$PROFILE" -- "$TMP/project/.buildResult"
  SIGNED="$(find "$TMP/project" -type f -name '*.wgt' -print -quit)"
  [[ -n "$SIGNED" ]] || die 'Tizen CLI chưa tạo WGT.'
  cp "$SIGNED" "$WORK/Open-IPTV-Pro-TV-0.1.52.wgt"
  FILE="$WORK/Open-IPTV-Pro-TV-0.1.52.wgt"
elif [[ "$MODE" == publish ]]; then
  FILE="${2:-$WORK/Open-IPTV-Pro-TV-0.1.52.wgt}"
else
  die 'Cách dùng: bash installer-release.sh prepare | publish [signed.wgt]'
fi

VERSION="$(python3 - "$FILE" <<'PY'
import sys,zipfile,xml.etree.ElementTree as ET,re
with zipfile.ZipFile(sys.argv[1]) as z:
    assert z.testzip() is None
    names=set(z.namelist())
    assert {'config.xml','index.html','author-signature.xml','signature1.xml'} <= names, 'WGT chưa đủ chữ ký'
    root=ET.fromstring(z.read('config.xml'))
    v=root.attrib['version']
    assert re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+',v)
    assert v=='0.1.52'
    assert 'webapis.avplay' in z.read('index.html').decode()
    print(v)
PY
)"
printf 'WGT có đủ file chữ ký: %s\n' "$FILE"
printf 'Kiểm tra cấu trúc không thay cho xác minh chữ ký hoặc thử trên TV thật.\n'
if [[ "$MODE" == prepare ]]; then
  printf 'Cài từ USB: chép WGT vào USB, mở TizenBrew Installer > Cài đặt app từ USB.\n'
  printf 'Để phát hành qua GitHub, chạy lại script với tham số publish.\n'
  exit 0
fi

printf 'Release public có thể chứa thông tin nhận dạng trong chữ ký distributor. Không upload chứng chỉ .p12, mật khẩu hoặc khóa riêng.\n'
printf 'Nhập PUBLISH để đồng ý công khai WGT đã ký: '
IFS= read -r CONFIRM
[[ "$CONFIRM" == PUBLISH ]] || die 'Đã hủy phát hành.'
command -v git >/dev/null || die 'Cần git.'
[[ "$(gh api user --jq .login)" == trisanghy ]] || die 'Đăng nhập gh bằng tài khoản trisanghy.'
if ! gh repo view "$DEST" >/dev/null 2>&1; then
  INIT="$(mktemp -d "$WORK/repo.XXXXXX")"
  trap 'rm -rf "$INIT"' EXIT
  git -C "$INIT" init -b main
  printf '# Open IPTV Pro — Samsung TV WGT\n\nDedicated installer releases; source: https://github.com/trisanghy/open-iptv-pro/tree/tizenbrew\n' > "$INIT/README.md"
  git -C "$INIT" add README.md
  git -C "$INIT" -c user.name=trisanghy -c user.email="$(gh api user --jq .id)+trisanghy@users.noreply.github.com" commit -m 'Initialize TV-only release repository'
  (cd "$INIT" && gh repo create "$DEST" --public --source=. --remote=origin --push)
fi
[[ "$(gh repo view "$DEST" --json visibility --jq .visibility)" == PUBLIC ]] || die 'Repository phát hành phải public; không tự đổi quyền riêng tư.'
TAG="v$VERSION"
if gh release view "$TAG" -R "$DEST" >/dev/null 2>&1; then
  die "Tag $TAG đã tồn tại; không ghi đè release bất biến."
fi
ASSET="$WORK/Open-IPTV-Pro-TV-$VERSION.wgt"
if [[ "$FILE" != "$ASSET" ]]; then cp "$FILE" "$ASSET"; fi
gh release create "$TAG" "$ASSET" -R "$DEST" --title "Open IPTV Pro TV $VERSION" --notes "Samsung TV WGT signed by owner; source commit $SOURCE_SHA. Device compatibility must be verified on TV." --latest
gh api "repos/$DEST/releases/latest" --jq '{tag:.tag_name,assets:[.assets[].name]}'
printf 'Nhập trong TizenBrew Installer > Cài đặt app từ GitHub: %s\n' "$DEST"
