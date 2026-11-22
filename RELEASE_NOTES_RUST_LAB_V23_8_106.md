# Rust Lab v23.8.106 — Autonomous WatchFlow channel discovery (PRE-RELEASE)

- Automatically starts a limited public Wikidata lookup after Rust Lab renderer initialization, independent of opening the WatchFlow panel. While the app is running it scans again at 15-minute intervals, rotating channel-name lookups and searching category topics suggested by locally learned viewing interests.
- Infers public-channel categories from returned names/descriptions with existing on-device Bayes classifier, combining them with locally cached XMLTV/EPG classifications. EPG has priority over ambiguous internet metadata; existing channel groups and playlists are never changed automatically.
- Displays independently discovered public-channel names, descriptions and Wikidata provenance; no streaming URL lookup/import, copyright bypass or hidden playlist changes.
- Limits to six requests per scan, 24 requests per day, 48-hour cache; sends only public channel display names and genre phrases to Wikidata, never stream URLs, passwords or credentials. Auto-discovery is on by default with a visible opt-out.
- Corrects CommonJS test startup when window/root is unavailable, and adds regression tests for proactive lookup, privacy filtering, cache, opt-out, rate limits and metadata enrichment.
- The Wikidata API may not offer public records for every channel. Tests cover deterministic mocked results; real Windows/macOS network behavior and stream playback remain unverified until a native run.
