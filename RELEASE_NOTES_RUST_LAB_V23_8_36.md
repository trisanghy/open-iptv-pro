# Open IPTV Pro Rust Lab v23.8.36 — English interface completeness

- Extended English UI translations for Rust Lab player, sidebar, settings, channel/folder controls, Discovery, DVR, on-device AI, subtitle customization, automatic PiP, backup/failover and source import consent.
- Translated copyright and legal-use warnings and explicit agreement labels without changing consent requirements or saved data.
- Covered dynamic UI counts, recording statuses and error-message prefixes while preserving playlist-supplied channel names, EPG titles and voice identities.
- Added regression tests for English coverage and dynamic labels to the quick CI suite. No playback, subtitle engine, Whisper/TTS or native PiP changes.
- Preserved the immutable release process. Mac local builder continues to output exactly one .app; GitHub workflow independently builds Windows and Universal DMG.

Validation: tests/build/release are subject to GitHub Actions completion; source-only commit does not by itself prove successful distribution.
