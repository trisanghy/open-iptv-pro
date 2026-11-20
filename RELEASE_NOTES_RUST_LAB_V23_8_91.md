# Rust Lab v23.8.91 — Vector Web player icons + localization regression

- Integrates the original `web/online` player SVG icon masks with the native Rust Lab/Tauri renderer.
- Main and fullscreen controls use vector masks instead of Unicode glyphs: playback, volume/mute, channel navigation, stop, PiP, cast, EPG, source link, screen fit, favorite, DVR and settings.
- Preserves all existing event listeners, video playback, subtitles, AI controls, source selection and v23.8.89 Windows hidden-process behavior.
- Restores the localized DVR label that the existing language catalogs expect, while CSS hides its decorative Unicode glyph. Updates legacy snapshot layout regression assertions to accept the clean icon/text representation.
- Includes SVG parity and live state regression tests in the fast suite.
- Real Windows/macOS visual acceptance remains separate from CI compilation. Previous tags and releases are never overwritten.
