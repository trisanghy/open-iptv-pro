# Rust Lab v23.8.102 — WatchFlow demo

- New third player toolbar action: AI Phân tích kênh & Đề xuất.
- Inline interactive preview with Standard / Smart / Intelligence modes, EPG/topic classification, previous viewing recommendations and Internet-search entry.
- All illustrative channels are clearly labeled. Smart/Intelligence are preview controls only; no ML models, stream-crawling or unverified M3U imports.
- Reads existing playlists, current EPG label and locally stored recent channels only. Playback, native PiP, CC/TTS, sources, subtitles and other existing listeners are not modified.
- Regression tests cover classification, ordering, UI mounting and safety.
- CI compilation is not live-device playback or visual acceptance.
