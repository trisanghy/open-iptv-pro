# Open IPTV Pro v4.18 Lite — Test results

## Đã chạy

- **62/62 Node tests PASS** (`npm test`): M3U/EPG, link checking & fallback, updater, visual duplicate safety, timeshift, and regression proving long-running proxy streams remain alive beyond the connection timeout.
- **10+ Chromium Playwright UI checks PASS** including import/folders, 8 languages, Doctor single action + one JSON export, Favorites, auto-update, MultiView, Failover, 32 parallel link checks, 32 snapshots, dark/light/auto and concurrent task cancellation.
- `node --check` for modified JS and `bash -n` for Mac scripts PASS.
- ZIP is checked for valid extraction, version and required file presence.

## Chưa kiểm chứng

- macOS DMG / Windows EXE filesize: **not yet measured**; this environment cannot produce native Mac/Win installers. `npm run audit:size` will report real size after building on each platform.
- Real-world IPTV stability and stream throughput / latency on the user's networks.
- FFmpeg discovery / Timeshift on a real Mac and Windows machine.
- Code signing, notarization and auto-update installation using published GitHub Releases.

### Trade-off
`ffmpeg-static` is deliberately not shipped in Lite. Bulk snapshots and Timeshift require optional external FFmpeg. Single playing-channel canvas screenshot works for supported, non-DRM streams.
