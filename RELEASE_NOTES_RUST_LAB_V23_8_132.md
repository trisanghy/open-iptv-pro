# Rust Lab v23.8.132 — One-click AI setup for ordinary viewers (PRERELEASE)

- Select **Smart** once to authorize a verified multilingual ONNX model download and local installation (~118 MB + tokenizer), without locating any model file or opening advanced settings. Reuses a cached model if present; the existing background Smart classifier starts on success. 18 MB custom fastText weights do not exist yet; never claim they are installed.
- Select **Intelligence** once to reuse installed Qwen3 models or set up the smallest Qwen3 MLX model automatically on Apple Silicon (~360 MB for weights, plus runtime). Existing native AI and translation models remain shared. Does not attempt unsupported Qwen3 MLX setup on Windows.
- Shows download/probe progress and actionable failures inside WatchFlow. Standard Naive Bayes continues functioning offline if installation fails. Retry only after prior user opt-in or a fresh mode selection.
- Preserves advanced model control, existing channel/EPG scanning, player, native PiP, captions, TTS and prerelease-only policy. No Stable/Latest updates.

Native model downloads and hardware runtime behavior require real-device verification; user is not instructed to install model files manually.
