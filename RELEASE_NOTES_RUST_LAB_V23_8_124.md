# Rust Lab v23.8.124 — Fix WatchFlow “bộ nhớ ứng dụng đã đầy” and invisible close icon (EXPERIMENTAL)

- **Root cause:** WebView localStorage shares a small per-origin quota with unrelated app/playlist/EPG data; even the v23.8.122 reduced cache could not be written for some real 560-channel libraries. This was an error saving classifications, not an AI scan error.
- **Durable fix:** store channel classifications, compact EPG programme labels and Qwen3 AI results in a dedicated IndexedDB object store. Existing WatchFlow localStorage caches migrate on first load. After successful persistence, only the old WatchFlow cache keys are cleaned up; playlists, credentials, EPG source data and all other settings are preserved.
- **Graceful fallback:** when IndexedDB is unavailable, write compact localStorage; when both are unavailable, keep accurate classifications in memory for the session and show a clear *storage warning*, not a false “scan failed” error.
- **UI:** WatchFlow close control × now has explicit high-contrast foreground color in light and dark themes.
- **Unchanged scan rules:** channel AI scans new/changed channels once, not on EPG refresh; EPG only classifies new content; manual ↻ Quét lại still forces a rescan; topic folders remain expanded during updates.
- **Tests:** full localStorage quota simulation (560 channels × 40 entries), migration privacy, Qwen persistence across restarts, fallback behavior, and close button contrast; existing Rust Lab tests retained.
- **Branch/release policy:** only `experiment/rust-tauri-v2`, immutable experimental tag and GitHub Actions artifact binaries. No experimental GitHub Release, Stable/Latest/main changes or force pushes.
