# Rust Lab v23.8.79 — Hardware AI probe and frame-drop safety

- Add actual native macOS VideoToolbox hardware availability query for VTLowLatencySuperResolutionScalerConfiguration via runtime Objective-C messaging. The ML processor is a macOS 26+ API; support is tested on each device at runtime, not inferred from model name.
- Add a clearly labeled **Kiểm tra hỗ trợ AI** control in the existing borderless Video Enhancement panel, with no extra header, modal or duplicate player.
- The backend now explicitly reports whether hardware supports native processing and whether a live AI inference pipeline exists. At this stage live AI inference is **not implemented** and the UI never claims otherwise; settings 1080p / 1440p / 2160p remain preferences only.
- Fix misleading CPU interpolation resolution cap: up to **1280x720**, not 720x406. The on-device synthetic FFmpeg benchmark uses the matching filter; higher quality can cost significantly more CPU time.
- Implement real-time frame-drop protection for enhanced HLS playback. When overload is detected in two consecutive four-second samples and the user enables downshift, dispose the FFmpeg session and return to original playback. Never silently enable processing or modify PiP/Caption/Translate/TTS.
- Add JS regression tests and Rust tests for capability reporting, honest inference status, frame-drop threshold and full 720p size limit.
- Retain original build workflow: a one-command Mac script fetches the latest HEAD, produces a single .app; CI builds Universal DMG + Windows Setup/Portable + source ZIP with immutable tag.

Limitations: The hardware probe is **not** an AI inference benchmark. Windows DirectML/ONNX model inference and macOS actual CVPixelBuffer-to-VideoToolbox live frame processing remain future stages. No model automatically downloaded. Actual playback and hardware benchmarks still require device tests.
