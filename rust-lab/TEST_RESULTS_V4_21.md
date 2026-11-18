# Open IPTV Pro v4.21 – Test Results

- `npm test`: **72/72 passed**, including local HLS playlist/TS relay, signed URLs, source URL edit, LAN streaming and mocked Chromecast receiver.
- `python tests/ui_cast_source_v421.py`: **PASS**, testing source URL edit, favorites, English UI, Chromecast selection, AirPlay button and browser-link fallback with mocked native bridge.
- No real Chromecast, Google TV, Apple TV or Windows/macOS installer was available in this environment. Hardware casting and native signed installers remain **untested**.
- Existing FFmpeg, Timeshift and updater code retained; not tested by running an actual packaged installer in this environment.
