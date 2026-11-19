# Rust Lab v23.8.56 — native dynamic UI statuses and honest runtime auditing

- Adds 76 native-language backup/restore, playback, source-management and Doctor status/error messages for all 16 supported languages outside Vietnamese.
- Adds translation of known backup/restore error prefixes while preserving appended operating system diagnostics, URLs and filenames.
- New `npm run audit:i18n:runtime` scans JavaScript literal UI strings and identifies missing translations in renderer modules; percentages are source coverage, not a full visual QA guarantee.
- Adds regression tests for all locales, critical error messages, prefix behavior and code ownership.
- No media player, native PiP, Whisper/TTS processing or data-storage modifications. Previous releases and tags remain intact.
- Remaining untranslated UI messages and dynamic template literals are expected and have not been declared 100% complete.
