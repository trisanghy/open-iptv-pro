# Open IPTV Pro Electron v4.23.50 — direct language routing and no redundant voice translation

Separate experimental desktop version (main untouched).

- Whisper transcribes each audio segment in the detected spoken language. Actual source language is read from whisper.cpp's output JSON `result.language`.
- Live Translate bypasses translation when the spoken language already matches the selected subtitle target.
- Argos chooses an installed **direct** source→target language package first, otherwise an installed route via English, and finally Whisper's English translation plus Argos English→target when needed.
- Installer checks whether a direct package is available from the official Argos index. It downloads only on an explicit enable/install action and does not install a model for same-language speech.
- TTS bypasses Argos when the source text already matches the chosen voice language. Its request includes `sourceLanguage` and optional `englishFallbackText`; no assumption that every caption is English.
- Keeps the 45-second deduplication cache and continuous source-volume attenuation from the v4.23.48.1 experimental overlay.
- Offline operation after voice and translation models are installed; never calls cloud translation APIs.

**Limitation:** the official Argos index offers very few non-English direct pairs (such as Spanish↔Portuguese); Chinese→Vietnamese is not among them. Those pairs may need the English pivot and can therefore have more latency/quality loss.
