# Rust Lab v23.8.72 — Finish migration of Mac builder tests

- Preserve video enhancement settings panel and local synthetic motion benchmark added in v23.8.70.
- Correct two remaining obsolete regression assertions: Mac builder now uses one dedicated Downloads build directory, and derives VERSION from the downloaded branch source.
- The script continues downloading the HEAD of the existing Rust Lab branch, not changing any immutable tag.
- Protect original player, PiP, Caption/Translate/TTS, and existing release assets.

Limitations: the AI upscaler and live 60/90/120 FPS interpolation pipeline are not yet connected. Existing benchmark measures only synthetic low-resolution FFmpeg interpolation, not live throughput or AI inference.
