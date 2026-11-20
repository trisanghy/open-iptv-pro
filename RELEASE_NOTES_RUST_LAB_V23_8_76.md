# Rust Lab v23.8.76 — LIVE Motion interpolation with safe fallback

- Opt-in *real* FFmpeg motion-compensated frame interpolation of live IPTV to target **60, 90, or 120 FPS**, with a strict whitelist of accepted FPS. Uses the existing FFmpeg HLS compatibility session and original video element, not a second player or mini-window.
- New **Áp dụng cho kênh này** control reopens the currently selected LIVE channel using the saved per-device motion setting. No changes to EPG, video aspect, native PiP, Live Caption, Translate, or TTS.
- If the enhanced session cannot start, decode, or deliver HLS segments reliably, the application retires FFmpeg and reverts automatically to direct playback. Existing FFmpeg compatibility fallback remains separately available.
- Scale to **maximum 720p** *before* computationally expensive optical-flow interpolation. This protects resources on low-RAM devices at the cost of resolution. 90/120 FPS may exceed hardware capability; the app must not claim the requested target is actually being displayed unless playback is verified.
- Improve the local benchmark to generate 1280×720 synthetic frames, downscale to 720p and measure motion output throughput with bounded execution. Auto-selection requires measured processing headroom, but is preliminary and not a live-stream benchmark.
- **AI super-resolution 1080p / 1440p / 2160p is not implemented**, since a verified bundled inference runtime and model are not yet available. Its settings remain persisted but not falsely applied, and the UI says so explicitly.
- Original version tags and releases stay unchanged; the existing one-command Mac build script continues fetching the latest Rust Lab branch HEAD.

## Validation

Added JS regression tests for whitelisting, reuse of the original player, branch/session safety, live-only gating, graceful fallbacks, and truthful AI capability reporting, plus Rust unit tests for option parsing and filter construction. CI and actual device playback must be verified before declaring this release buildable.
