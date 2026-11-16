# Open IPTV Pro · Rust Lab v21.1
Isolated Rust + Tauri experimental desktop build; does not change Electron main.
## Fixes
- Allow up to 30 minutes for the 148 MB model on slower connections, with 25-second connection timeout and 75-second per-read stall protection.
- Accept verified HTTPS model downloads from Hugging Face's current *.hf.co CDN redirects (including us.aws.cdn.hf.co). The pinned Whisper SHA-256 checksum remains enforced.
- Continue to normalize the upstream Whisper ZIP executable to whisper-cli on macOS/Windows (from v20.1).
## Multilingual offline Live Translate
- Choose 21 supported caption languages, default Vietnamese.
- Whisper performs source recognition / translation to English; Argos then translates English into the selected subtitle language, fully locally after installation.
- Add one-click installation of only the selected Argos language model, separate from Piper TTS voice downloads.
- Preserve English intermediate caption text so Piper TTS can read in an independently selected language.
- Reuse the approved player layout and avoid modifying the Electron/main release.
## Usage
- Open a channel and the Live Caption setup panel to install Whisper when needed.
- Select a target language. Press **Cài mô hình dịch** once for targets other than English. Then enable **Live Translate**.
- Optional **Giọng dịch TTS** uses its own language and model installation.
Downloads require internet the first time; on-device speech and translation work offline afterward.
