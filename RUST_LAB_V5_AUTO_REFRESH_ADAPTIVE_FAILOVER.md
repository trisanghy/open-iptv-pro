# Rust Lab v4.23.17-tauri.5 — Auto M3U Refresh + Adaptive Failover

Branch: `experiment/rust-tauri-v2` (independent of Electron stable).

## New features

- On launch (Tauri app only), fetch enabled URL-type M3U sources in background; skip local file playlists. Can disable from **Quản lý nguồn → Tự tải lại các nguồn M3U khi khởi động**.
- Parse first, then atomically update sources while preserving matched channel IDs, favorites, groups, and playback preferences. If download/parse fails, or newly returned playlist loses >35% of a source with 10+ channels, **do not replace old data**.
- A working playback is not interrupted by background playlist updates. Updated URL used next time the channel opens.
- On playback, previously stable secondary URL is tried before the original if still in available alternatives. The playlist's canonical URL remains unchanged, allowing later M3U refreshes.
- Save preferred secondary URL only after >=12s uninterrupted playback and >=4s real media progress. This also works for genuinely decoded FFmpeg-compatibility playback. A snapshot or HTTP 200 by itself does **not** promote a link. If preferred URL becomes unavailable after playlist update, fall back to original/other alternatives.
- Auto Failover progress is shown in status line rather than emitting a toast for every retry; duplicate toasts are throttled.

## Validation
Run `npm test`, `npm run check:rust`, and `npm run build -- --bundles dmg` on Mac. Native stream/cast/multiview need validation on a real machine and with authorized live streams. This ZIP is an experimental source, not a confirmed production installer.

## Diagnostics / known limits

- Node targeted suite: 62/62 passed locally. Legacy Electron-based suite: 7 expected differences/failures out of 221 total, exactly matching the original v4 branch (202/211 passed before these v5 tests were added); these are **not** proof of native Rust compatibility.
- This environment has no `cargo` or macOS SDK; native Rust compilation and real VTV stream playback remain **unverified**. Run Mac build and real live-stream playback before considering the patch stable.
- CDN blocking, DRM, server-side timeouts, TLS/certificate issues and unsupported codecs still cannot be guaranteed fixed by automatic playlist refresh.
- One retry only is attempted for temporary network/HLS transport faults, then alternative links are tried. HTTP 401/403/404, MediaError 3/4 and unsupported format are not blindly retried.
- Use **Sức khỏe kênh / Failover → Dùng lại link gốc từ M3U** to reset a saved preferred stream.
- Previous stable Electron app, profile data folder and branch remain untouched.
