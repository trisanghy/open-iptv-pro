# Open IPTV Pro v4.23.62 — offline Vietnamese TTS experiment

This update is on the separate branch experiment/electron-v42362-vietnamese-tts. It does not change main.

Supported Vietnamese engines:
- Piper (existing): three lightweight Vietnamese ONNX voices, fast CPU fallback.
- VieNeu v3 Turbo (existing): 25 presets, 48 kHz, ONNX / local CPU.
- VietVoice-TTS (new): six selectable male/female / northern, central, southern voices, ONNX Runtime and isolated Python environment; source pinned to upstream GitHub commit d4e8a22525437fc976ee9bc4dfd41ceb4b311248.
- F5-TTS Vietnamese (new): a local WAV recording plus matching spoken transcript is required. Use only with explicit consent of the speaker. Vietnamese checkpoint is CC-BY-NC-4.0 (noncommercial), unlike MIT F5 runtime.

Installation is opt-in for each model through the existing "Cài mô hình tự động" button. It uses pinned/allowlisted model locations, validates model weight SHA256, tests model loading, caches locally, and uses persistent offline workers. Models are not bundled with the installer. Payload size is approximately 1.51 GB (VietVoice) or 1.35 GB (F5 checkpoint), plus separate Python/runtime dependencies and F5 vocoder. Latency varies by machine; for live subtitles on weak CPUs Piper is more practical.

F5 voice cloning: select F5 Vietnamese in the live TTS voice menu, open settings, type the exact text from a short WAV recording (3–15 seconds), confirm voice permission, choose the WAV, install the model, and press "Nghe thử". Voice sample and transcript stay in the app's private local storage.

One-command Mac build (requires Node.js and npm already installed):
    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/electron-v42362-vietnamese-tts/build-mac-v42362.sh | bash'

This downloads the correct experimental branch, runs npm test, builds a native DMG and copies it with matching source ZIP into ~/Downloads/Open_IPTV_Pro_v4.23.62/. The build script does not overwrite main.
