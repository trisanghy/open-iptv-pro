# Open IPTV Pro Rust Lab v23.8.37 — English UI consistency

- Updated the 17-language desktop interface engine. English now covers the Cloud Account, Settings accordions, automatic playback, background audio, Discovery copyright warnings, and other previously mixed Vietnamese labels.
- Adds explicit translations for dynamic status counters, backup messages and accessibility labels; protects user M3U URLs, channel names, EPG content and saved preferences.
- When a requested translation is unavailable, the application uses English as fallback. Complete translations into all 17 languages are still in progress.
- Separate immutable Rust Lab release, without changes to Electron, Web, Mobile, main, earlier releases or their tags.
- This source commit is not proof of a finished Windows/macOS installer. Consult GitHub Actions and the published release assets.
