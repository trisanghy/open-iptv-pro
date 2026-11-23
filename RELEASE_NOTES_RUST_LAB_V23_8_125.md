# Rust Lab v23.8.125 — Verified IndexedDB persistence / WatchFlow cache migration test

- All v23.8.124 fixes retained: persistent classification and Qwen3 caches moved from quota-limited WebView localStorage to IndexedDB; 560-channel cache survives a full localStorage; only WatchFlow-owned old cache keys are removed after durable save; clear transient-storage warning on total storage outage; visible × close button in dark and light modes.
- The prior v23.8.124 CI ran 319 tests, with 318 passing. The single failing assertion incorrectly assumed the legacy cache's serialized representation had no `programmeTopics` field. The compacting legacy writer has always added that array. The regression now compares the **actual normalized legacy cache** against the IndexedDB-restored cache, verifying that channel signature, label and unrelated playlist data survive migration.
- No change to stream playback, AI classification, EPG ingestion, or cache migration implementation; this commit aligns the test with the true persisted format.
- Rust Lab/Tauri branch only; immutable experimental tag and GitHub Actions artifacts, never a beta GitHub Release; main and Stable unchanged.
