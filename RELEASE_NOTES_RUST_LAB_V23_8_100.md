# Rust Lab v23.8.100 — Web Cast TV pairing with screenshot-ready UI

- Same encrypted PIN pairing as Open IPTV Pro Web (one-time 6-digit PIN, ECDH P-256 / AES-GCM over Supabase Realtime).
- TV receiver controls and real playback acknowledgements: previous, Play/Pause, Stop, next, mute and a compact 1/3-width volume slider.
- On successful pairing, app shows “ĐÃ KẾT NỐI” with “Phiên được mã hóa” while Google Cast, AirPlay and LAN remain separately available.
- TV-only playback prevents local native decoder from starting again on channel changes.
- Preserve 17-language static audit by dynamically mounting the paired-TV component; update native title/version to v23.8.100.
- Previous Rust Lab v23.8.99 tag remains immutable; no changes to main, Electron or Web.
