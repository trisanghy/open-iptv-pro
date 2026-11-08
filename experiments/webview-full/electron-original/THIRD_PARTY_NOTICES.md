# Third-party licenses / Thư viện bên thứ ba

Open IPTV Pro **source code** uses MIT (`LICENSE`). Its build bundles dependencies
with their **own** license terms. This MIT license does not replace them.

- **Electron / Chromium / Node.js**: see licensing files distributed by Electron.
- **hls.js**: see `node_modules/hls.js/LICENSE` installed through npm.
- **FFmpeg**, via npm package **ffmpeg-static**: the binary is bundled into the Full desktop installers. FFmpeg may use LGPL or GPL licenses depending on binary build options. Verify actual binary license and fulfill required notices, corresponding source availability and any relevant distribution obligations before publishing installers. See https://ffmpeg.org/legal.html.
- **electron-builder**: see package license in npm distribution.

**Redistribution note:** a public MIT source repository does not automatically
make bundled third-party executables MIT-licensed. Before publicly distributing
binary builds, review bundled libraries, code signing/notarization and any
codec patent obligations relevant to your jurisdiction.


## Programme Guide / XMLTV feeds

Open IPTV Pro includes **optional URLs** pointing to EPGShare01 and IPTV-EPG.org; it does not bundle, sublicense, republish, or mirror their TV schedule data. Their content usage terms may differ from the MIT license for this application. Users are responsible for complying with third-party terms. The [iptv-org/epg](https://github.com/iptv-org/epg) community offers open-source tooling to generate XMLTV; its source-code license is independent from TV guide content rights.
