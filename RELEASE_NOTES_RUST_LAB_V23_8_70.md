# Rust Lab v23.8.70 — Video enhancement panel and motion benchmark (first stage)

- New Nâng cao video bằng AI toggle beside the existing CC toggle; inline borderless panel without additional title banner.
- Settings for FPS 60/90/120 and resolution 1080p/1440p/2160p, saved locally on each device, default OFF.
- Synthetic, bounded local FFmpeg minterpolate benchmark measures processing throughput of each target FPS on a 320x180 sample and provides a preliminary suggestion.
- Limitations: this does **not** benchmark full-resolution live playback, implement live motion interpolation, or run an AI super-resolution model. The UI explicitly states enhancement is not applied until real backend support is available. No fake AI quality claims, no new video player, no automatic model download.
- Preserve original PiP, Live Caption, Translate, TTS, and previous data and releases.
