# Rust Lab v23.8.142 — Background Internet research independent of AI mode (PRE-RELEASE)

- Fix background research stopping after one batch unless Intelligence was selected. All modes now continue searching public channel metadata in the background while Internet research is enabled, with hard limits of 6 sanitized channel names per batch and 72 per day and a two-minute gap between automatic batches.
- Show actual researched/matched/failed quota numbers in the visible WatchFlow status across Standard, Smart, and Intelligence.
- Fix a regression-test-only mismatch caused by assuming an unaccented cache key for a Vietnamese channel name; real cache uses the original accented channel display name.
- Preserve all verified Wikipedia/Wikidata source links and negative-cache upgrade introduced in v23.8.141, exact broadcaster identity checks, Qwen3 enrichment of verified metadata, existing media playback, immutable prerelease tags, and Stable/Latest isolation.
- CI tests validate simulated matching and continuous background logic. Live network availability and accuracy depend on the actual Wikimedia APIs; no claim of successfully identifying all 560 playlist channels.
