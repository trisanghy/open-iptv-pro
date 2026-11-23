# Rust Lab v23.8.138 — Evidence audit for current IPTV channels (PRE-RELEASE)

- Add an actual **Kiểm tra phân loại** button next to the existing WatchFlow background rescan button.
- On click, read the current playlist and EPG. Display sortable/paginated per-channel classification from independent name/group evidence, classified EPG programmes and verified exact-name Wikidata matches. The final category is identified separately; the source-agreement count is provided for review.
- Up to six fresh public-name metadata lookups per click, honoring the existing 72/day limit, 48-hour cache and Internet opt-out. Mark remaining channels as not yet searched; never invent external evidence or fetch/modify stream URLs.
- User can sort by category, evidence, name or current channel, search within the report and expand batches of 50. Existing automatic scanning and model management are unchanged.
- CI static behavior tests and real Chromium UI smoke capture the report. Native device verification and a genuine user playlist are required to validate external service reachability/accuracy.
- Rust Lab prerelease only; no Stable/Latest/main changes.
