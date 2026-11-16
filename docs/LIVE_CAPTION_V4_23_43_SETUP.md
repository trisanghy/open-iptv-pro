# Open IPTV Pro v4.23.43 — Live Caption & Live Translate (Beta)

The two controls are located on **player toolbar row 3**, to the left of **Chụp ảnh · FFmpeg**. Both are opt-in and off by default.

## How it works

- **Live Caption:** the bundled FFmpeg reads 8-second audio excerpts of the current HTTP(S) IPTV stream; separately installed whisper.cpp transcribes the speech locally.
- **Live Translate:** the same local Whisper engine translates speech **into English only**. This is not arbitrary language translation.
- Audio excerpts are temporarily written to the OS temp folder and removed after processing. This feature does not upload speech to a cloud transcription provider.
- The UI displays text immediately below toolbar row 3 and adds dynamic text track cues when Chromium supports them. Captions in the operating system's PiP window are **not guaranteed**; Chrome's native caption bubble is not available in Electron.

## One-time setup — macOS

Install whisper.cpp through its official Homebrew formula:

```bash
brew install whisper.cpp
```

Download a **multilingual** GGML Whisper model such as `ggml-base.bin` from the [official whisper.cpp model repository](https://huggingface.co/ggerganov/whisper.cpp/tree/main). The model is not included in the DMG, to avoid inflating both Apple Silicon and Intel installers. The model download is normally over 100 MB.

In Open IPTV Pro, click **⚙** on toolbar row 3, then **Chọn mô hình GGML (.bin)**. If whisper-cli was not found automatically, click **Chọn whisper-cli** and select `/opt/homebrew/bin/whisper-cli` (Apple Silicon) or `/usr/local/bin/whisper-cli` (Intel/Homebrew paths may differ).

Enable **Live Caption** to transcribe or **Live Translate** to translate speech to English. Live Translate also enables Live Caption.

## One-time setup — Windows

Get a compatible **whisper-cli.exe** build from the [whisper.cpp project](https://github.com/ggml-org/whisper.cpp/releases), with its required runtime DLL files. Get a multilingual GGML model such as `ggml-base.bin` from the official model repository. Use the **⚙** setup buttons in player toolbar row 3 to select the executable and model.

## Limitations

- This is an experimental feature, not a direct integration of Chrome's Live Caption / Live Translate, which are Chrome product features.
- Live Translate currently targets **English** only.
- Each audio segment takes time to capture and process, so captions are not instantaneous; the first caption can take more than 8 seconds and performance depends on the local CPU/GPU.
- FFmpeg cannot always read streams that depend on browser-only cookies, encrypted DRM or special provider authorization.
- Stopping playback, disabling captions or closing the application stops the local recognition process.
- Windows and Mac installers currently remain unsigned/notarized separately from this beta feature.

## Troubleshooting

If the UI reports **Chưa cài whisper-cli**, confirm the executable was installed and choose it through ⚙. If it reports **Chưa chọn mô hình**, choose a valid multilingual GGML `.bin` file. If FFmpeg cannot extract audio from a particular playlist, try another playable unencrypted stream. The output and errors are shown next to the row-3 toggles; no silent success is claimed.
