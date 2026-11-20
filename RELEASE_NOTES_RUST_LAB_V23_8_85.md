# Rust Lab v23.8.85 — GPU hardware benchmark, recommendations, managed storage
- Detect GPU H.264 hardware encoding via the FFmpeg binary bundled in the existing Rust Lab installer, on Apple macOS (VideoToolbox) and Windows (NVENC/AMF/QSV/Media Foundation if available).
- Verify actual hardware encoder operation against local generated 720p/60 and 1080p/30 video samples; estimate hardware encoding throughput without fetching or transmitting media.
- Show a benchmark result and an accessible dialog with a conservative video encoding profile recommendation; saving recommendations does not secretly activate unverified AI inference or alter playback.
- Add restricted app-owned `video-gpu-assets` storage inventory and explicit per-category cleanup. Never delete playlists, captions, TTS data, apps, or folders outside that directory; reject symlinks.
- The existing FFmpeg resources are already packaged; no manual installation is needed for supported GPU encoders. Proprietary GPU drivers and AI model runtimes are not downloaded or installed without a verified signed distribution.
- AI upscaling and GPU motion interpolation are **not implemented** by these GPU encoding benchmarks. Existing CPU minterpolate/HLS compatibility and fallback remain unchanged.
- Includes native Rust unit tests and Node regression checks.
