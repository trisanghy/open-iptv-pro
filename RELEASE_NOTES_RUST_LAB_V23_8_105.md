# Rust Lab v23.8.105 — Real WatchFlow learning, prerelease

- Three mode buttons show memory/storage cost: Standard **0 MB**, Smart **under 1 MB** bundled local classifier and saved weights, Intelligence contextual ranking **0 MB additional** (optional separate Qwen3 model ~1.4 GB, NOT yet connected to WatchFlow inference).
- Smart uses real offline multinomial Naive Bayes classification over existing guide programmes + channel metadata. Learns category preferences locally from active playback timeupdate only when Smart/Intelligence selected; stores category seconds and time buckets only, no URLs.
- Intelligence ranks existing channels using learned interests, viewing hour, available EPG and local recent history. This is contextual recommendation, not an LLM.
- User-click-only Wikidata metadata search for television channels, no stream scraping or automatic M3U imports.
- Reset local learning data in WatchFlow UI. All Rust Lab releases remain prereleases; no Stable/Latest update.

Validation limitations: Actual playback sampling and real Wikidata networking are not confirmed on physical macOS/Windows; Smart/Intelligence do not yet invoke an installed Qwen3/MLX language model.
