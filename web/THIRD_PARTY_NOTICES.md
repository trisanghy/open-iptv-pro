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
