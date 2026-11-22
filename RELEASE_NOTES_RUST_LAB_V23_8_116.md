# Rust Lab v23.8.116 — Full automatic WatchFlow analysis + regression alignment (PRE-RELEASE)

- Includes v23.8.115's complete autonomous offline analysis of all enabled channels and every matched EPG programme, triggered at app startup and on data changes without opening the WatchFlow panel or clicking Refresh.
- Preserves automatic progress, cancellable chunked scans, full-channel search, simplified recommendations and offline / Internet separation.
- Fixes five legacy UI regression assertions that matched outdated Standard/Intelligence text rather than the new concise model labels; no change to the working classification engine or streaming path.
- Native window title, renderer title and package version synchronized.
- Still uses bundled Naive Bayes as the actual Standard classifier; Smart model catalog is not misrepresented as installed AI. Native Qwen3 remains opt-in/on-demand for compatible Mac MLX.
- All work confined to experiment/rust-tauri-v2, immutable prerelease only, with no Stable/Latest/main edits.
- Windows EXE, macOS DMG and real runtime quality remain subject to successful CI build verification.
