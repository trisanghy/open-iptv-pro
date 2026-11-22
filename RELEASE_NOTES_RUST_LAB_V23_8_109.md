# Rust Lab v23.8.109 — WatchFlow mode separation and installed model reuse (PRE-RELEASE)

- Standard now explicitly uses the existing built-in Naive Bayes model for EPG/channel classification, under 1 MB, without installing a model.
- Smart is reserved for a separately pretrained **fastText** text classifier; target ~18 MB, currently **not installed or executing**, not silently replaced by Naive Bayes. Until the verified trained .ftz artifact is available, the app explicitly labels fallback classification as Standard.
- Intelligence has a working native Rust Lab MLX model inventory selector: detects installed Qwen3/Hy-MT2, shows actual installed bytes and supports selecting an existing model or requesting download of a new one on user click. Downloads use the existing native installer; no duplicate downloads when installed and ready.
- Selection is saved locally. Native MLX is supported on Apple Silicon macOS, not Windows; WatchFlow model-driven classification/inference with Qwen3/Hy-MT2 is still not connected and not advertised as running.
- Kept autonomous public-metadata discovery, Native PiP, CC/TTS and player behavior unchanged. Added regression tests. Prerelease-only policy preserved.
