# Open IPTV Pro v4.23.14 — Playback / Live Events Audit

## Sources & scope
- Base: Open IPTV Pro v4.23.13 full Windows/macOS source (retained).
- User sample: `https://nts12.s.gy/iptv`. Attempts to fetch it through public retrieval and local network **failed due to network access restrictions**. Its entries and real codec/headers were **not** inspected. Claims of fixing this particular provider must therefore remain conditional.
- Primary changes: content-aware HLS detection, EVENT/VOD seekability, playback controls, keyboard shortcuts, last-channel startup, macOS red-close quit.
- Unmodified features: M3U management, DVR MP4, EPG, 11 styles, Doctor 3.0, Backup/Restore, Cast/AirPlay, Smart Discovery.

## Technical changes
1. `src/media-inspection.cjs`: conservative classification of event/VOD/live based on manifest and content-type; no artificial seeking when the player lacks seekable ranges.
2. `src/main.cjs`: sniff the first upstream response chunk, rewrite HLS manifests even for nonstandard URLs, then preserve the first chunk when relaying plain MPEG-TS/MP4. The native media-kind probe retries without Range for 400/403/405/416.
3. `renderer/app.js`: use the detected format to route playback through hls.js, keep more back buffer for EVENT/VOD, update playback mode dynamically when a level playlist loads.
4. `renderer/player-ux.js` + `.css`: same-diameter circular controls, bounded seek bars, fullscreen controls with idle auto-hide, keyboard shortcuts, last-channel restore only for desktop.
5. `src/main.cjs`: `window-all-closed` now quits on macOS too. Closing the window means pending DVR sessions cannot keep running invisibly.
6. Build scripts / documentation bumped to v4.23.14. No git push or installer release performed.

## Verified
- `npm test`: **161 passed, 0 failed, 2 skipped** (the two FFmpeg integration tests are intentionally opt-in).
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs`: **2 passed**. Actual local MPEG-TS and HLS were written to MP4 and verified through ffprobe.
- HLS EVENT test: local mock server at no-extension URL returning `application/octet-stream` and rejecting Range; parser correctly classifies, relative segment URLs are rewritten.
- Player-UX tests: mocked video with 120-second seek window, keyboard arrow events and volume, ignored editable controls, previous-channel restore decision, CSS fullscreen/circular declarations.
- JavaScript `node --check` on entire source: passed; ZIP CRC check pending packaging.

## Not yet verified
- Real-world `nts12.s.gy` playlist, streams, provider authentication/header behavior, DRM restrictions, codecs and geo-blocking.
- Running the packaged app on actual macOS and Windows hardware; fullscreen interactions on a real Mac.
- Chromium UI test was attempted, but browser access to file:// and localhost was administratively blocked in this environment, so no browser-pass claim is made.

## Safe rollout
Backup in Settings before installing. For live DVR tasks, keep the application open; the macOS red button now quits fully. Prefer testing a few EVENT/VOD channels, live-only channels, and scheduled recordings before replacing a daily-use install.
