# Open IPTV Pro v4.23.36 — Configuration Dropdowns & macOS DMG Update

- Convert the three settings controls into native dropdowns: link check (1/4/8/16/32), Snapshot (1/4/8/16/32), replay buffer (5/10/15/30 min).
- Save each selection immediately, sync existing quick selectors, apply replay duration to the next buffer start.
- On macOS, download the SHA-256-verified DMG instead of relying on ZIP-based native update.
- After a user-triggered download completes, open the verified DMG and quit Open IPTV Pro. Background automatic downloads ask first to avoid unexpectedly closing playback.
- Never quit on failed download, bad checksum or LaunchServices error. Windows update behavior unchanged.
