# Rust Lab v23.8.93 — Light screenshot contrast follow-up

Branch: `experiment/rust-tauri-v2`

## Verified visual findings
- The selected "Tất cả" channel filter retained an opaque navy background because a shared dark-theme `!important` rule took precedence over the existing Light selector.
- Active navigation labels were pale lavender on light lavender, reducing legibility.
- The Timeshift label and DVR error/recording/scheduled states used colors intended for dark UI, reducing contrast in Light.
- Channel browser empty-state text was pale on white.

## Fix
- Add strictly Light-scoped, higher-priority selectors to resolve the existing cascade, preserving the selected custom accent in the active background/border.
- Darken active nav labels and state text without changing the meaning of error/recording statuses.
- Keep all functionality, data, local models, Dark/AMOLED, media and fullscreen overlays unchanged.

## Validation
- Run `npm run test:quick` (includes Light selector regression) and the Rust Lab Light visual audit.
- The Windows NSIS EXE and universal macOS DMG are built by the existing release workflow for the immutable new `rust-lab/v23.8.93` tag.
