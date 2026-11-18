# Open IPTV Pro Rust Lab v17 — Adaptive Source Aspect Ratio

- Default player frame is **16:9** before metadata is available.
- Once the main video loads metadata, player frame follows its encoded resolution (e.g. 4:3, 9:16, 21:9) using the native `videoWidth` and `videoHeight`.
- Resets to 16:9 on `loadstart` and `emptied` (change channel, stop, retry, failover).
- Updates on `resize` for stream adaptive resolution changes.
- Removes former theme max-height frame constraint that caused unused side gaps; vertical scrolling is retained for tall sources.
- Fullscreen still fills the screen, object-fit options remain intact; no changes to IPTV engine, decoder or source selection.
- Branch: `experiment/rust-tauri-v2`; no modifications to `main`.