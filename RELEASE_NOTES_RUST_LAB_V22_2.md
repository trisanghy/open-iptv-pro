# Open IPTV Pro Rust Lab v22.2 — TTS dedup and persistent source audio ducking
- Source audio follows the selected percentage for the entire period while TTS is enabled, even during translation, between utterances and after each spoken sentence.
- User master volume remains controlled by the normal playback slider and is restored only when TTS is turned off or the app unloads.
- Media volume resets and channel changes reapply source attenuation. Voice audio remains full volume.
- Repeated Whisper segments and near-duplicate rolling-window phrases are suppressed for TTS, with a bounded 45-second cache per channel.
- All previous v22 Vietnamese voice options and offline models remain untouched.
- Main and other experiment branches are not modified.

- Fixed Unicode punctuation canonicalization after simulated-player testing.
