# Open IPTV Pro Rust Lab v23.8.44 — fix multilingual regression harness

- The language runtime regression test now loads the existing bundled, expanded and additional offline dictionaries in the same order as the app before asserting locale-specific strings. This prevents a false negative for the improved native German EPG label.
- Keeps the restored Rust Lab English captions/AI/PiP/DVR translations and localized status counters from v23.8.43 without changes to playback or media logic.
- Keeps the 120 additional native UI labels across French, German, Italian, Japanese, Korean, Russian, Indonesian, Hindi and Arabic, plus Chinese, Lao and other existing dictionaries.
- Adds no new external dependencies or network translation.
- Existing immutable Rust Lab versions are preserved; the new build requires successful GitHub Actions verification.
