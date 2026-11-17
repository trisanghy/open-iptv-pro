# Open IPTV Pro Electron v4.23.65 — AI hardware hints per model

Branch: experiment/electron-v42365-ai-model-hardware-hints (does not change main or Rust/Tauri).

The AI model storage inventory now shows, for each model:
- Approximate recommended RAM and CPU/MLX processing route.
- Suggested free disk space, alongside actual storage use and original model download size.
- Brief workload/voice/quality tradeoff.
- Soft comparison against device RAM and OS/architecture, without forbidding installs on low-RAM machines.
- Apple Silicon-only warning for MLX models; F5 noncommercial checkpoint warning.

These numbers are advisory estimates for simultaneous IPTV and AI use, not guaranteed minimum requirements.
Runtime and cache folders are labeled as infrastructure rather than standalone models.
The UI uses the original secure ai:modelStatus call, which now includes operating system,
architecture and total RAM. No model download, audio pipeline, upload or filesystem deletion behavior was changed.

Personal macOS builder (only Open IPTV Pro.app; opens Finder on success):
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/electron-v42365-ai-model-hardware-hints/build-mac-v42365.sh | bash'

Public / GitHub build: separate build-mac-v42365-public.sh and workflow build-v42365-public.yml
create matching DMG and source ZIP. No models are bundled by either builder.