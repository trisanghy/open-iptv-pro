# Open IPTV Pro v4.23.6 – EPG auto-load and manual XMLTV import audit

## Changes

- Optional persisted **Tự tải EPG khi khởi động ứng dụng** checkbox in Cài đặt > Nguồn lịch EPG. Disabled by default. On app startup, the enabled XMLTV URLs are checked once after UI/playlist initialization; no concurrent duplicate request if already loading or a manual refresh has started. When there are no M3U channels, the startup refresh is skipped with an informational settings label.
- Manual refresh from active URL sources remains available (EPG page and settings button).
- New **Nhập file EPG thủ công** opens the native file dialog and reads `.xml`, `.xmltv`, and `.gz`; the renderer never supplies an arbitrary filesystem path to Electron.
- Both remote EPG and local file import share bounded gzip decoding/format checks. XMLTV size up to 35 MB uncompressed and gzip input up to 12 MB; file must contain an XMLTV root with channel/programme evidence and parsing must succeed.
- Manual import confirms before replacing current EPG. Invalid/cancelled imports never replace the current guide. Storage quota errors warn that imported EPG is available only until app restart.
- Eight language dictionaries/bundle updated. Core playback, FFmpeg DVR MP4, Replay, Backup/Restore, Doctor, Discovery, Cast/AirPlay untouched.

## Tests actually run (2026-11-10)

- `node --test tests/*.test.cjs`: **141 total, 139 passed, 2 skipped (optional FFmpeg integration), 0 failed**.
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs`: **2/2 passed** (local TS and HLS recording and playable file probing).
- Chromium UI `tests/ui_epg_auto_import_v4236.py`: passed opt-in/out, startup exactly once, manual import, invalid file/cancel preserve old guide, persistent checkbox and 1000/1360 px control visibility. Electron APIs mocked here.
- Chromium UI `tests/ui_epg_smoke.py`: passed existing EPG guide display and settings workflow.
- `node --check` passed for changed JavaScript/CJS files. HTML ID and locale bundle consistency verified.

## Not tested / limitations

- No completed installer build or actual EXE/DMG launch on physical Windows/macOS in this environment.
- Native desktop file dialog and live public XMLTV endpoints were not exercised end-to-end here; verified backend file processing and renderer behavior independently.
- EPG refresh needs network and compatible XMLTV sources. Local XMLTV file is imported once, not watched or automatically re-read; the auto-start option works with the selected URL sources only.
- Local guide cache still uses application localStorage; unusually large guide data may not survive app restart if storage quota is exceeded. A warning is shown.
- No GitHub push or release performed.
