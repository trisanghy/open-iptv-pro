# Open IPTV Pro Electron v4.23.61 — Google offline translation + new Vietnamese voices

**Experimental branch:** `experiment/google-translate-gemma-v42361`  
**Stable:** `main` stays at v4.23.60 and its public Mac DMG, Windows EXE and source ZIP releases remain untouched.  
**Local one-command Mac APP build:** `build-mac-v42361-app.sh` leaves only `Open IPTV Pro.app` in a new Downloads folder. No automatic installation into Applications.

## Google translation engines (on-device via Ollama)

The app can use locally installed Ollama weights only. Ollama is an external free local runtime, so the first setup requires [Ollama](https://ollama.com/download). **Nothing automatically downloads at app startup.** In ⚙ → Bộ dịch offline, select one of these models and click Tải mô hình. Only your explicitly selected model is pulled, and text remains on `127.0.0.1:11434`.

| Family | Choice | Approx. storage | Min RAM* | Suggested RAM* | Terms |
|---|---|---:|---:|---:|---|
| TranslateGemma | 4B / 12B / 27B | 3.3 / 8.1 / 17 GB | 8 / 16 / 32 GB | 16 / 32 / 64 GB | Google Gemma Terms |
| Gemma 3 | 1B / 4B | 0.8 / 3.4 GB | 4 / 8 GB | 8 / 16 GB | Google Gemma Terms |
| Gemma 4 | E2B / E4B / 12B / 26B | 7.5 / 9.5 / 8 / 19 GB | 12 / 16 / 16 / 32 GB | 24 / 32 / 32 / 48 GB | Apache 2.0 |

TranslateGemma is specialized for translation; Gemma 3/4 translate following a prompt. English is **not** forced as an intermediate target. MLX Hy-MT2/Qwen3 models continue to run only on Apple Silicon, unchanged. All storage/hardware estimates are approximate and depend on quantization, OS, other running AI, and context length. Ollama weights are shared with other applications on your machine: deleting a model in this app also removes that Ollama model for other apps.

## Vietnamese offline TTS (all opt-in)

| Family | Characteristics | Rough hardware guidance* | Status |
|---|---|---|---|
| VieNeu v3 Turbo | Existing 25 preset voices, 48 kHz | ≥12 GB / suggest 24 GB for concurrent translation | Existing, unchanged |
| Piper vi_VN | Existing 25hours/VAIS1000/VIVOS, low-latency CPU | ≥4 GB / suggest 8 GB | Existing, unchanged |
| VietVoice-TTS | NEW: 6 presets across North/Central/South, male/female and news/story styles, ONNX | ≥8 GB / suggest 16 GB | Opt-in installer; model ~1.51 GB |
| F5-TTS Vietnamese | NEW: voice reference + matching transcript, diffusion based | ≥16 GB / suggest 32 GB + fast GPU | Opt-in **noncommercial** checkpoint |

`VietVoice-TTS` is taken from official MIT source `nguyenvulebinh/VietVoice-TTS`, pinned to commit `d4e8a22525437fc976ee9bc4dfd41ceb4b311248`. Its actual model downloads from the upstream Hugging Face model repository into the app data directory when you click install.

`F5-TTS` uses the MIT engine from `f5-tts==1.1.22` with the Vietnamese checkpoint `toandev/F5-TTS-Vietnamese` licensed **CC-BY-NC-4.0**, not for commercial deployment. A deliberate second click is required to confirm the noncommercial restriction before downloading weights. To use this engine, select your own or explicitly authorized reference audio and enter the matching spoken text. Reference audio is read locally, not uploaded.

**F5 and VietVoice are slower than Piper on many systems.** Fast TTS, Whisper and translation simultaneously may overheat slower computers. Turning on TTS continues to attenuate source audio to the chosen percentage, with the complete-utterance queue preventing mid-sentence cuts.

## How to use

1. Open the desktop app → choose an IPTV channel → enable Live Caption + Live Translate and select target language.
2. Tap the unified **⚙** → choose TranslateGemma or a smaller model. Install only the specific model needed.
3. On the **Giọng dịch TTS** row, select **Tiếng Việt**, then a VieNeu, Piper, VietVoice, or F5 voice.
4. If a new model is not yet installed, tap **Cài mô hình tự động** once and wait for on-device verification.
5. Use **Nghe thử** before live playback. For F5, first select reference audio and provide its accurate transcript.
6. To reclaim space, open **⚙ → Xem mô hình đã tải và giải phóng dung lượng**. Model cards include approximate minimum/recommended RAM and separate delete controls.

## Testing and limits

Continuous Whisper capture remains 8 seconds. Existing player, source lists, EPG, favorites, backup, subtitle-only-on-video and complete-sentence TTS queue are not intentionally modified. JavaScript model routing, UI, security and packaging are covered by CI tests; actual 1–17GB model quality and time-to-first-audio must be benchmarked on the user's machine after opt-in downloads. F5 may require accelerated hardware and is not ideal for real-time dubbing. This experiment is **not** yet a production replacement for v4.23.60.

*Device requirements are engineering estimates rather than guarantees or official universal minimums.*

Official sources: https://ollama.com/library/translategemma, https://ollama.com/library/gemma4, https://github.com/nguyenvulebinh/VietVoice-TTS, https://huggingface.co/toandev/F5-TTS-Vietnamese, https://github.com/pnnbao97/VieNeu-TTS.
