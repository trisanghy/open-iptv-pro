# Rust Lab v23.8.120 — Results-first WatchFlow + Actions artifact policy (PRE-RELEASE)

- Continues all v23.8.119 functionality: four focused result tabs, personalized channels plus actual EPG programme suggestions, compact AI settings, native user-triggered Qwen3/Hy-MT2 model download and real per-model storage/delete controls.
- Reconciles three outdated regression tests that expected a GitHub prerelease command in the Rust Lab Windows workflow. Repository owner commits 4ec65417 and c8f10822 intentionally switched Rust Lab to **Actions artifacts only**. These tests now verify that EXE artifacts are uploaded and no `gh release create` is used.
- Windows x64 NSIS EXE, macOS Universal DMG and (when built) portable artifacts are retained as GitHub Actions artifacts, not promoted to `main` Stable/Latest release listings. Do not re-enable experimental Release publishing.
- Rust Lab tag remains immutable. No other branches, M3U streams, source grouping, playlists, or playback paths altered.
