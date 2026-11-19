# Open IPTV Pro Rust Lab v23.8.35 — International Interface

This is an independent, immutable prerelease of **Open IPTV Pro Rust Lab** built from the `experiment/rust-tauri-v2` branch. It does not change `main`, Electron releases, or previous Rust Lab tags.

## Localization update

- Adds 17 selectable display languages in Settings: Vietnamese, English, Spanish, Brazilian Portuguese, Simplified Chinese, Thai, Lao, Khmer, French, German, Italian, Japanese, Korean, Russian, Indonesian, Hindi, and Arabic.
- Adds localized high-priority interface labels and English fallback for missing translations, including advanced settings, AI caption/translation controls, EPG, recording, and Discovery.
- Preserves user-supplied channel names, playlists, EPG data, and persisted settings; does not send UI text to an external translation service.
- Language changes take effect immediately; translations are not yet complete for every phrase in every language.

## Security and existing functionality

Preserves the prior SSRF-safe Smart Discovery network constraints, per-import permission notices, consent controls, Live Caption / Translate / TTS settings, source management, and FFmpeg integration. Users must have rights to all content they add; no channels are included.

## Releases and verification

The workflow builds Windows Setup and Portable, macOS universal DMG, source ZIP, and checksums for **this new immutable tag**. Check GitHub Actions and verified release assets before installing. A successful source commit alone is not a verified installer. Do not overwrite earlier tags.
