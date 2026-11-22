# Rust Lab v23.8.108 — Correct WatchFlow AI model contract (PRE-RELEASE)

Restore the previously agreed Smart vs Intelligence model architecture without misleading users:

- Standard: rule + EPG, no model download (0 MB).
- Smart: **approximately 18 MB pretrained classifier** is the agreed target. Its exact model weights, training provenance and trusted download hash are not present in this repo, so it is **not installed and not yet running**. A separate under-1-MB local Bayesian classifier remains an explicitly labeled fallback rather than masquerading as the approved 18 MB model.
- Intelligence: reuses an existing Qwen3/Hy-MT2 model when available, otherwise model management offers downloads. Rust Lab already supports MLX translation models on Apple Silicon, but WatchFlow has not yet been wired to model inference. Sizes vary with model and quantization.
- Preserve EPG classification, autonomous public-metadata discovery, preference learning, video playback, PiP, CC/TTS, existing libraries and immutability of release tags.
- All Rust Lab outputs are prerelease only; never move the repository Latest label.
- Model selection and actual 18 MB/LLM inference are not represented as functional before verified implementations exist.

