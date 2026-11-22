# Rust Lab v23.8.113 — WatchFlow Smart catalog regression correction (PRE-RELEASE)

- Carries forward v23.8.112: Standard Naive Bayes under 20 MB, user-selectable Smart candidates under 200 MB with model-specific benefits and honest not-installed status.
- Fixes two stale WatchFlow regression assertions that still expected the old preview-only copy instead of the existing native Qwen3 classification and new Smart fallback status.
- No change to actual video playback, user playlists, internet discovery, or Qwen3 native inference.
- Bumped Rust Lab immutable experimental release; do not change Stable, Latest, main, Electron, Positron or Tizen. Await native build/test verification.
