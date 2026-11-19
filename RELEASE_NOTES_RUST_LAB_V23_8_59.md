# Open IPTV Pro Rust Lab v23.8.59 — Fullscreen Web-style player controls

- Rebuilt fullscreen controls to resemble the supplied Open IPTV Pro Web screenshot: edge-to-edge video, translucent bottom controls, green live indicator, channel information, transport, volume and full-screen exit.
- Added real fullscreen popover menus for 16:9, 4:3, 16:10, 21:9, fill/crop and fit-to-screen; aspect preference is saved locally and restored after restart.
- Added fullscreen link-source menu using options from the **existing** `manualLinkSelect`. Clicking a source dispatches its original change handler; no invented backup streams or duplicate players.
- Added favorite, native Picture-in-Picture, recording, snapshot and settings actions that forward to existing app handlers.
- Moved fullscreen EPG to a lower-left popup, with EPG, channel information and schedule tabs, highlighting live shows; the existing DVR panel and EPG-recording actions are retained.
- Enhanced auto-hide so menus and the EPG drawer remain interactive; maintained keyboard/focus behavior and small-window responsive layout.
- Tests cover the aspect-ratio calculations, source-owner delegation, popup wiring and fullscreen-only CSS. No changes to Electron, Web, Mobile or main branches.
- This release does not claim a verified screenshot on the user's actual Mac until the app is installed and launched there.
