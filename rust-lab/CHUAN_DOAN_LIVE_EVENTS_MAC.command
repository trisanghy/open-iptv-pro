#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"
PLAYLIST="${1:-$HOME/Downloads/live events iptv.m3u}"
if ! command -v node >/dev/null 2>&1; then
  echo 'Chua tim thay Node.js. Vui long cai Node.js de chay kiem tra.' >&2
  exit 1
fi
if [[ ! -f "$PLAYLIST" ]]; then
  echo "Khong tim thay playlist: $PLAYLIST" >&2
  echo 'Keo file M3U vao Terminal sau ten file .command hoac dat ten live events iptv.m3u trong Downloads.' >&2
  exit 1
fi
printf 'KIEM TRA LIVE EVENTS (khong in URL co token)\n'
node scripts/diagnose-m3u.cjs "$PLAYLIST" --group 'LIVE EVENTS' --limit 10 "${@:2}"
