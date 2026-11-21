# Rust Lab v23.8.92 — Light appearance consistency

Branch: `experiment/rust-tauri-v2`

## Corrections
- Repair fixed dark backgrounds, borders, text and inputs in Light appearance for the Rust channel browser (channel grid/list, filters, favorites, recently watched).
- Harmonize Light surfaces across EPG, DVR, channel health, Smart IPTV Doctor, discovery, sources, and settings.
- Correct Light colors for offline speech recognition, live translation, TTS, model storage, subtitle settings, video enhancement and hardware benchmark controls.
- Preserve the selected accent, navigation layout, IPTV playlists, user settings, Dark and AMOLED appearances and intentional dark media/fullscreen overlays.
- Add automated Light renderer coverage for eleven navigation sections, using browser snapshots and computed surface colors; this is a renderer-preview validation, not a native Tauri app screenshot.

## Validation
- Rust Light renderer browser audit: https://github.com/trisanghy/open-iptv-pro/actions/runs/44953061907 (passed on pre-version-bump Light fix).
- Windows x64 Tauri installer build from the same Light CSS: https://github.com/trisanghy/open-iptv-pro/actions/runs/44952885614 (passed).
- The immutable Rust Lab release workflow will test and publish the new `rust-lab/v23.8.92` tag separately. Its status must be checked before distributing DMG/ZIP.
