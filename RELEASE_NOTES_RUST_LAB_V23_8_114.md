# Rust Lab v23.8.114 — WatchFlow Smart model choices and native title synchronization (PRE-RELEASE)

- Carries v23.8.112/113 feature: Standard (<20 MB) continues bundled Naive Bayes (~under 1 MB); Smart (<200 MB) provides a persistent user-selectable list of TinyBERT 4L INT8, MobileBERT INT8, multilingual E5 Small INT8, multilingual MiniLM INT8, and PhoBERT Base INT8. Benefits, size estimates and runtime caveats are disclosed.
- All Smart candidates remain uninstalled, no verified inference backend is currently supplied; the GUI does not falsely report them active. Standard Bayes and the real local behavior ranking remain operational. No automatic downloads.
- Correct native Tauri window title to v23.8.114, matching renderer and package release ID, after CI caught an old v23.8.111 window title.
- Existing Intelligence native Qwen3 classification, stream handling, subtitles, playlist storage and user consent are unchanged.
- Rust Lab immutable prerelease, no Stable/Latest/main/Positron changes. Verify CI tests and Windows EXE before distributing.
