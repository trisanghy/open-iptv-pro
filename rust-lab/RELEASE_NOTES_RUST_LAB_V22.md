# Open IPTV Pro · Rust Lab v22 — Vietnamese natural voices
Independent Rust/Tauri experiment. No changes to main or Electron.
## New
- 25 real VieNeu-TTS v3 Turbo Vietnamese preset voices covering Bắc, Trung, Nam; independent male/female/story/news styles. The model is shared; it is not downloaded once per voice.
- Preserve 3 fast Piper voice alternatives: vi_VN-25hours_single-low, vi_VN-vais1000-medium, vi_VN-vivos-x_low.
- Voice dropdown appears for Vietnamese TTS; preview button speaks a short Vietnamese sample offline.
- Optional VieNeu install uses app-private uv/Python 3.11 and pinned vieneu==3.8.3. Downloads/initializes v3 Turbo once on deliberate install click; after that the worker is kept warm and forced to use its local Hugging Face cache.
- Source/translation playback volume ducking remains unchanged; TTS language can differ from subtitle language.
- Piper text is passed to stdin with --model and --output_file; no synthetic placeholder voices.
## Notes
VieNeu first install may download a substantial model and dependencies. Users may select Piper on slower machines.
No model is downloaded without the install action. Natural voices may need more memory than Piper.
The 25 presets are the verified names in the upstream VieNeu v3 Turbo voice manifest.
