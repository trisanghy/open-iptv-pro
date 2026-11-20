# Positron P4 — Desktop UX Rework (v4.23.81)

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
The GitHub pipeline must pass Node regression tests, the 40 preexisting real Electron UI rounds and the 50 new screenshot-audited P4 stages before producing installation artifacts. The 50-stage report includes per-round PNG SHA-256, screenshot pixel statistics, window geometry and feedback fed into the next round.

GitHub tag `positron/v4.23.81-p4` is a new immutable prerelease. Build targets: macOS ARM64 DMG, macOS x64 DMG, Windows x64 Setup/Portable; source ZIP, checksums and a ZIP of all 50 real screenshots.

**Caveat:** These are Electron/Xvfb screenshot and interaction tests, not native-device GPU or IPTV live-playback benchmarks. No fake IPTV channels are injected. Unsigned binaries may trigger macOS Gatekeeper or Windows SmartScreen warnings.

## Relevant references
- WAI-ARIA patterns: https://www.w3.org/WAI/ARIA/apg/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Electron Security: https://www.electronjs.org/docs/latest/tutorial/security
