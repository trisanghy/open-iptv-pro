# Open IPTV Pro v4.23.10 — UI styles audit

## Scope

Built on the full v4.23.9 Snapshot + Discovery Preview source ZIP, preserving all desktop IPTV modules. New files: `renderer/ui-style.js`, `renderer/ui-styles.css`, `tests/ui_styles_v42310.test.cjs`, `tests/ui_styles_v42310.py`. Modified `renderer/theme-boot.js`, `renderer/index.html`, `renderer/settings-ui.js`, localization dictionaries/bundle, version metadata, README/CHANGELOG and build/test version expectations.

### Style selections

| Style | Implementation |
|---|---|
| Current | Original v4.23.9 presentation unchanged |
| Minimalism | Flat cards, reduced decoration, square controls, simplified navigation |
| Material Design 3 inspired | Layered tonal surfaces, rounded buttons and selection, larger shapes |
| Apple HIG inspired | Compact macOS-like controls, system typography, subdued separators |
| Liquid Glass inspired | Limited translucency, blur and glass treatment in the functional/navigation layer; legible opaque content |

The three named design-system inspirations are **CSS approximations** inside Electron/Chromium. They do **not** embed or claim to implement native Apple components, Material 3 framework or native Liquid Glass APIs.

### Safety and accessibility

- Independent preference storage key: `open-iptv-pro-ui-style-v1`, included automatically in namespaced backups.
- Invalid or corrupted stored preference reverts to `current`; no mutation of channel sources, player, DVR, recordings, timeshift or EPUB/EPG records.
- Theme initialized before the CSS loads; switches without reloading the Electron window.
- Preserves Light/Dark/AMOLED/Auto and custom accent. Handles `prefers-reduced-motion`, `prefers-reduced-transparency`, and forced-colors conditions in CSS.
- The original style remains available via a dedicated restore button.

### Tests

- `npm test`: **144 total; 142 passed, 0 failed, 2 skipped** (the FFmpeg integration cases remain opt-in).
- Chromium Playwright at 1000 px and 1360 px: 5 selections, active style status, persistence in localStorage, Light/AMOLED compatibility, reset, no visible overflow, no JS exceptions.
- The earlier `ui_compact_amoled_v4238.py` regression suite passed at both widths (accordion settings, theme wheel, footer task popup and EPG/backup deep links).
- 8 localization JSON files validated by JSON parse and the bundle was regenerated from dictionaries.

### Not verified

No native Windows EXE or macOS DMG binary was built and launched on a user device. This is source-level plus Chromium UI testing, not a guarantee for every OS, monitor scale or stream provider.
