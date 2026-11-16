# Open IPTV Pro Rust Lab — v14 (Compact TV layout)

Branch: `experiment/rust-tauri-v2` (independent of Electron `main`).

## Fixed

- When the channel list is collapsed, the media player now grows to **100% of the available width** instead of leaving a large black area on the right.
- Removed the old viewport-height cap that constrained the intrinsic 16:9 player width.
- At narrow window widths, channel information, manual `Link phát` picker, favorite control and playback buttons wrap cleanly into compact rows.
- Timeshift and DVR actions remain available in separate compact panels, matching the reference's vertical layout.
- The **channel-list reopen** button stays at the top of the video content.
- Reduced Tauri's minimum window width from 980px to 720px so users can actually use the narrow Mac window layout.

## Preserved

- Native video element, HLS/FFmpeg playback logic, live buffer, EPG/DVR, manual link selection, failover, channel organization and independent app storage.
- User-selected video fitting mode; the layout does **not** stretch or crop the stream automatically.
- The expanded-channel-list layout and the dedicated Cinema drawer.

## Verification

- Focused JavaScript regression tests through `npm run test:quick`.
- Chromium geometry checks for 1600×900, 1100×780, 860×1400 and 740×950 with multiple UI themes.
- Does not claim a successful Tauri DMG build or real IPTV playback on macOS.
