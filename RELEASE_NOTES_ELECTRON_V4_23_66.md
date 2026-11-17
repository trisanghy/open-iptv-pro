# Open IPTV Pro Electron v4.23.66 — Stability and compact controls

Experimental branch: experiment/electron-v42366-tts-translate-stability.
This branch does not modify main, Rust/Tauri, stable v4.23.60 or beta v4.23.65.

## Fixed bugs

- Prevent the Electron main-process crash caused by null.toString() when an MLX translation worker exits without a numerical code.
- Handle worker error/exit signals, clear pending translation timers, and prevent old workers from breaking new requests.
- When an MLX translation fails, temporarily fall back to an already-installed Argos English-to-target model. No unsolicited model downloads.
- Voice preview has an exclusive session, an explicit backend-stop acknowledgement and 90-second timeout; cancels when switching translation engine or voice.
- New subtitle segments remain queued while voice preview is active. Only the newest fresh one is spoken when preview finishes.
- Obsolete VieNeu/VietVoice/F5 synthesis can be cancelled instead of blocking for 210 seconds. Rewarming may be necessary after an interrupted worker.
- Live TTS synthesis has a 45-second deadline and preserves the previous 25-second freshness rule.
- Changing translation engines clears obsolete subtitle IDs and deduplication state.

## Compact player controls

- Caption/Translate and TTS/voice/speed/original-volume are grouped into two tighter rows, preserving accessibility and individual options.
- Shorter settings button, limited status width with hover tooltip, responsive layout for narrow windows.
- Chụp ảnh / FFmpeg controls remain available under the shorter Công cụ dropdown.
- Video area and other playback controls are not changed.

## Personal Mac builder

bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/electron-v42366-tts-translate-stability/build-mac-v42366.sh | bash'

Output: ~/Downloads/Open_IPTV_Pro_APP_v4.23.66/Open IPTV Pro.app; opens the Finder folder automatically; no DMG/source ZIP in personal output.
Public build: separate build-mac-v42366-public.sh for DMG and source ZIP.

## Verification and limitations

Automated Node tests cover null MLX exits, audio preview cancellation, timeout and queue recovery, and installed-only Argos fallback. CI builds native macOS app-only bundle.
Actual inference latency and voice playback with large installed models need an on-device smoke test. This is a separate experimental version and is not yet a stable GitHub Release.