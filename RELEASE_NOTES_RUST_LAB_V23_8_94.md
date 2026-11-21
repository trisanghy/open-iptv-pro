# Rust Lab v23.8.94 — Verified Light text contrast

This release follows v23.8.93, which fixed the Light screenshot contrast errors without altering other appearances or user settings.

## Automated evidence
- Chromium renderer visual regression now checks WCAG AA 4.5:1 contrast on the selected "Tất cả" channel filter instead of checking card-background brightness alone.
- Capture and inspect 11 real renderer pages under the selected Light appearance, with image artifacts.
- Trigger these visual tests whenever the Rust Lab Light CSS or regression tests change, to prevent recurrence.

## Compatibility
- Rust Lab / Tauri branch only. Existing tags immutable.
- User IPTV playlists, AI models, themes, custom accent, EPG and playback state are not changed.
- Browser renderer images do not prove native Tauri window appearance. Native Windows x64 and macOS Universal binaries are built by the existing immutable-tag release workflow.
