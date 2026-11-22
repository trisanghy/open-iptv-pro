# Rust Lab v23.8.107 — Autonomous classification CI fix (prerelease)

- Fix regression in v23.8.106: a verified exact-name Wikidata record with an explicit genre description was ignored because a small Bayes training corpus scored it too weakly.
- Use bounded, explainable exact-match description cues for confident public genres, with EPG preserving priority. Avoid guessing from unrelated Wikidata entities.
- Precompute current XMLTV classifications automatically during discovery when app starts, and refresh after online enrichment; no click required.
- Includes new tests for exact-name matches, background classification and EPG precedence; no changes to playlist, media/CC/TTS, casting or PiP.
- All releases remain prerelease with no repository Latest changes. Physical desktop network and playback remain unverified until integration testing.
