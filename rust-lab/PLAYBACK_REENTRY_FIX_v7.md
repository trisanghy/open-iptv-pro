# Playback re-entry fix v7 — Open IPTV Pro Rust Lab

## Bug reproduced by review of the code

- A pending HTML video `error` / `waiting` event could act on the newly selected channel, because handlers used the global generation instead of validating the active media URL and attempt.
- `timeupdate` forwarded a DOM Event into `markPlaybackVerified(generation)`, so the event handler always returned early and never recorded stable alternative playback.
- The Rust loopback manifest URL was identical across rapid visits to the same channel; WebKit could reuse a stale native HLS state even when the origin URL was still live.

## Fix

- Invalidate the existing decoder synchronously on channel selection before awaiting Rust IPC; also guard delayed permission dialogs and obsolete decoder events.
- Add a unique attempt marker ONLY to the local loopback `/stream` URL (upstream source URLs and signed query strings are untouched).
- Serve all relay responses with `Cache-Control: no-store, no-cache`; request fresh upstream manifest for known `.m3u8`/`.mpd` paths.
- When the exact channel+URL was decoding successfully within 90 seconds, allow one bounded 550 ms decoder restart after a WebKit MediaError 3/4; after that keep regular failover/FFmpeg fallback.
- Fix `timeupdate` forwarding so a demonstrated 12-second stable backup can become the next preferred link.
- Added regression tests for old-event invalidation, cache isolation, bounded retry, and preservation of signed URLs.

## Test boundaries

Node.js regression tests and a Chromium A→B→A mock-browser smoke test are executable in this environment. macOS Rust/Tauri compilation and live VTV3 testing require running BUILD_MAC_TAURI.command on a Mac with Cargo, and no claim is made that a remote IPTV source is guaranteed to remain online.

Additional MSE safeguards record the actual active blob URL to prevent a delayed error from a previous hls.js/dash.js instance from being mistaken for the newly selected stream.
