# Open IPTV Pro Rust Lab v4.23.17-tauri.3 — Playback & Storage Stability

Branch: `experiment/rust-tauri-v2`. This source package does not modify the Electron main branch. Separate app identifier and application data folder are retained.

## Corrections

1. Advanced configuration previously wrote unbounded `health` diagnostic history to WebView localStorage. Now only the newest 320 channel histories and 3 events/channel are eligible to persist; redundant URLs and long failure descriptions are stripped. If the quota is already exhausted, diagnostic history alone is omitted while preserving playlists (stored separately), user profiles, alternate URLs and PIN data. Storage warnings are throttled to once per minute. An existing oversized history is compacted on startup. **Older health history may be discarded**, but configured playlists/favorites are not deliberately deleted.
2. In Tauri, concurrent hover-preview video is suppressed while the main player is actively playing; existing saved snapshots remain visible and clearly identified as still images. Reduces duplicate decoders and playback contention.
3. Tauri HLS buffers are reduced, including VOD/EVENT (previously kept >=600 seconds of backbuffer in WebView). Long replay remains supported through separate on-disk FFmpeg Timeshift, subject to source compatibility.
4. FFmpeg fallback source failures are now categorized using a bounded 12-KiB stderr tail; URLs in error diagnostics are obscured. FFmpeg does not automatically retry repeatedly on the same failure (5-minute URL cooldown), or for clearly denied HTTP upstreams. Only one compat session can run.
5. Fixed FFmpeg fallback even-dimension bug: scaling a 16:9 source to 720 pixels could yield height 405, which libx264 rejects with exit code 1. Updated scale filter uses `force_divisible_by=2` and avoids upscaling small sources; reduced encoder threads and segment retention. A synthetic-video FFmpeg integration test confirms H.264/HLS segment output on the build host.
6. Avoid duplicate terminal error toasts for a single playback generation, and wait for prior compat session termination when switching channels.

## Tests

- On development host: `npm test` — 41 passed, 0 failed, 0 skipped.
- `node --check renderer/app.js renderer/advanced.js` — syntax valid (tested separately for each file).
- Local synthetic-video FFmpeg H.264/HLS regression test — passed.
- **Rust Cargo tests, packaged macOS DMG and playback of user's remote IPTV URLs were not run here** because Cargo and macOS runtime are unavailable in this environment. Do not treat this as a validated production release.

## Build on macOS

Unpack the ZIP to a clean new directory and run `bash BUILD_MAC_TAURI.command` from the project root. Requires Node/npm, Rust/Cargo, Xcode tools, network to install dependencies. Script runs JS tests, prepares bundled HLS/DASH/FFmpeg dependencies, runs Cargo tests and builds the DMG. Output should be under `src-tauri/target/release/bundle/dmg` upon successful build.

## Residual known limitations

- macOS WKWebView may still reject codecs, DRM, HTTPS tokens/headers or server responses. An H.264/AAC fallback cannot repair 401/403/404 or unreachable IPTV sources.
- Rust media and DVR code remain experimental; Google Cast and some DASH SegmentTemplate cases are not fully migrated.
- If the new diagnostic includes HTTP/codec reasons, use them to distinguish source failures from actual FFmpeg processing defects. Never share complete signed IPTV URLs or access tokens in logs.
