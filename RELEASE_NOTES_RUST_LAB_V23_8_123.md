# Rust Lab v23.8.123 — Scan-once WatchFlow regression correction (PRE-RELEASE)

- Carries v23.8.121–122: keep user-open topic/EPG folders expanded; persist channel classification and native Qwen3 by channel identity across restarts; process only new channels and fresh EPG programme content; preserve cached topic results if EPG storage exceeds localStorage quota.
- Fixes an assertion in the new v23.8.122 simulated Qwen3 integration test: restoring cached labels can reapply a previously classified channel to the in-memory UI without any new native model inference. The test now counts **actual calls to aiClassifyChannel** rather than the number of UI cache applications. This correctly enforces the requirement that EPG refresh causes zero new native inferences, a newly added channel one, and an explicit manual scan the entire chosen playlist.
- Actual Qwen3 execution/EPG channel code remains the same as v23.8.122; no changes to stream playback, playlists or native MLX inference backend.
- Only experimental Rust/Tauri branch; immutable tag and verified GitHub Actions build artifacts, no experimental GitHub Releases; Stable/Latest/main and other branches unchanged.
