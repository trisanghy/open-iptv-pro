# Third-party licenses / Thư viện bên thứ ba

Open IPTV Pro **source code** uses MIT (`LICENSE`). Its build bundles dependencies
with their **own** license terms. This MIT license does not replace them.

- **Electron / Chromium / Node.js**: see licensing files distributed by Electron.
- **hls.js**: see `node_modules/hls.js/LICENSE` installed through npm.
- **FFmpeg (optional external tool):** v4.18 Lite does **not** bundle or distribute an FFmpeg executable. Users can install FFmpeg separately to enable Timeshift and bulk snapshots. Its license depends on the build; consult https://ffmpeg.org/legal.html.
- **electron-builder**: see package license in npm distribution.

**Redistribution note:** a public MIT source repository does not automatically
make bundled third-party executables MIT-licensed. Before publicly distributing
binary builds, review bundled libraries, code signing/notarization and any
codec patent obligations relevant to your jurisdiction. The optional FFmpeg
installation has separate licensing requirements.


## Programme Guide / XMLTV feeds

Open IPTV Pro includes **optional URLs** pointing to EPGShare01 and IPTV-EPG.org; it does not bundle, sublicense, republish, or mirror their TV schedule data. Their content usage terms may differ from the MIT license for this application. Users are responsible for complying with third-party terms. The [iptv-org/epg](https://github.com/iptv-org/epg) community offers open-source tooling to generate XMLTV; its source-code license is independent from TV guide content rights.

## New in v4.21

- `bonjour-service` 1.4.4 (MIT): local network service discovery for Google Cast.
- `castv2-client` 1.2.0 (MIT): Cast V2 sender and Default Media Receiver control.
- Their transitive dependencies are installed during `npm install` and retain their own licenses.


## Desktop experimental v4.23.65 — bundled native utilities and AI models

The application distributes ffmpeg-static 5.3.0 and @ffprobe-installer/ffprobe
2.1.2 with platform-specific native executables in the Desktop DMG/EXE.
FFmpeg/FFprobe binary redistribution may be subject to LGPL/GPL, nonfree build
flags and codec patent restrictions depending on the exact binary build.
The MIT license for Open IPTV Pro source does not override those terms.
Distributors should audit the actual binaries and supply license texts/source
offers where required before commercial redistribution.

Piper, VieNeu, VietVoice, F5 and MLX model weights are downloaded separately
only on user request, and each has its own model license. The selected F5-TTS
Vietnamese checkpoint is CC-BY-NC-4.0 (noncommercial), and voice cloning
requires the speaker's explicit permission. No model weights or voice samples
are included in the public installer assets.


## MPEG-TS / FLV playback

- `mpegts.js` 1.8.2 is bundled in `renderer/mpegts.min.js` under Apache-2.0. Its license text is shipped in `renderer/licenses/mpegts-Apache-2.0.txt`.
- The library transmuxes supported streams to MSE; the Chromium/platform decoder still determines which video/audio codecs play.
