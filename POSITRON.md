# Positron P4.1 — Desktop UX (v4.23.82)

Independent experimentation on the `Positron` branch only. The stable Electron branch, `main`, Web, Mobile and Rust/Tauri are not altered.

## Why P4 exists
Screenshot review of P3.1 revealed a 280px sidebar, over-dense channel filters, too many visible management pages, crowded transport rows and Timeshift tools below the fold. Positron P4 reorganizes the existing desktop frontend without replacing actual playback or changing channel data.

## 50 engineering iterations
Refer to `POSITRON_P4_CHANGELOG.md` for a source-level table of each of the 50 Git commits, the real screenshot name for each iteration and the screenshot-derived feedback methodology.

## New interface behavior
- Sidebar reduced to a more appropriate width; **Công cụ khác** reveals less-frequently-used pages and keeps their original handlers.
- Secondary channel filters under **Bộ lọc và thư mục**. Empty playlists no longer take up multiple rows of filter and drag instructions.
- Advanced Timeshift, DVR and quick tools remain available under **Timeshift · Ghi hình · Công cụ**; transport, volume, subtitles, Cast, PiP and fullscreen stay directly accessible.
- Added `?` shortcut help dialog. Original `Ctrl/⌘+K`, `Alt+1..5`, `Alt+P` and `Alt+F` remain.
- Responsive visual changes tested from large desktop down to narrow windows.

## Test status and distribution
The GitHub pipeline reruns Node regression tests and the 50 new screenshot-audited P4 stages before producing installers. The 40 historical P2/P3 Electron rounds were passed in earlier immutable releases, but are not re-executed by the P4 screenshot pipeline because P4 deliberately changes navigation visibility. The P4 report includes per-round PNG SHA-256, screenshot pixel statistics, rendered control visibility, window geometry and previous-round feedback fed into the next round.

GitHub tag `positron/v4.23.82-p4.1` is a new immutable prerelease. Build targets: macOS ARM64 DMG, macOS x64 DMG, Windows x64 Setup/Portable; source ZIP, checksums and a ZIP of all 50 real screenshots.

**Caveat:** These are Electron/Xvfb screenshot and interaction tests, not native-device GPU or IPTV live-playback benchmarks. No fake IPTV channels are injected. Unsigned binaries may trigger macOS Gatekeeper or Windows SmartScreen warnings.

## Relevant references
- WAI-ARIA patterns: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Electron Security: https://www.electronjs.org/docs/latest/tutorial/security

## P4.1 screenshot review
Fixed white surfaces in the Source and EPG pages found while visually reviewing true Electron screenshots from P4 rounds 38–39. At narrow widths the sidebar becomes a compact icon rail with accessible names. The P4 50-round screenshot audit now checks computed colors and rail geometry on the actual app.
