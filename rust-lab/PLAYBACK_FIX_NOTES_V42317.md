# Open IPTV Pro Rust Lab — Playback Compatibility Fix

**Source base:** v4.23.17 Tauri 2 + Rust with the previous E0502 correction.
**Branch:** `experiment/rust-tauri-v2` (independent from Electron main).
**Lab package revision:** `4.23.17-tauri.2`.

## What changed

- Main DASH player now requests the Rust local proxy manifest instead of the remote URL first. Some relative DASH SegmentTemplate configurations remain unsupported.
- Rust loopback proxy sniffs `#EXTM3U` for HLS playlists served without `.m3u8` or an HLS MIME type, while continuing to stream ordinary video incrementally. It avoids forwarding byte ranges for recognized manifest paths.
- A bounded on-demand FFmpeg compatibility path is available **only after** ordinary playback and configured URL alternatives fail. Converts video to H.264 and optional audio to AAC at up to 960 pixels wide, and plays authenticated HLS from a loopback-only endpoint. Only one compatibility session is allowed. Switching channels or stopping playback stops that session.
- HTMLMediaElement errors now show their `MediaError` category (network/codec/format) rather than only a generic message.
- Channel hover preview distinguishes an old saved snapshot from live video success.
- Both build scripts run the complete selected JavaScript test suite before Rust tests and packaging.

## Checks actually run in this environment

- `npm test`: **35 passed, 0 failed**.
- `npm run test:migration`: **11 passed, 0 failed**.
- `node --check renderer/app.js` and `advanced.js`: passed.
- FFmpeg media pipeline smoke test with a locally generated synthetic video: HLS playlist and H.264/AAC `.ts` segments produced, checked by ffprobe. This was **not** a real IPTV stream and not the bundled macOS binary.
- The Rust backend was **not compiled here** (Cargo/Rust are not installed in this environment). A successful DMG build and actual playback must be confirmed on macOS.

## Build on a Mac

Unzip into a new directory and run `bash BUILD_MAC_TAURI.command` in the project root. The script runs Node tests, bundles hls.js/dash.js/FFmpeg, runs `cargo test` and builds the DMG.

## Known limitations

- FFmpeg compatibility transcodes video using CPU and can consume substantial resources; it is a fallback, not the default.
- A dead, region-locked, login-required or blocked source cannot be repaired by codec conversion.
- DASH with relative SegmentTemplate/BaseURL is not yet fully supported by the Rust proxy.
- Google Cast and LAN relay remain experimental/incomplete from the original Tauri migration.
- Do not infer a healthy stream solely from an old snapshot preview.
- Does not modify the Electron stable application or its update process.
