# Third-party notices

The TizenBrew QR generator embeds QRCode.js from https://github.com/davidshimjs/qrcodejs, licensed under MIT.

The MIT License (MIT)
---------------------
Copyright (c) 2012 davidshimjs

Permission is hereby granted, free of charge,
to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Player libraries bundled in Tizen WGT archives

- **hls.js 1.6.15** (bundled path: `hls.min.js`) — Apache-2.0.
  Upstream project and license: https://github.com/video-dev/hls.js and https://github.com/video-dev/hls.js/blob/master/LICENSE
- **dash.js 5.3.0** (bundled path: `dash.all.min.js`) — BSD-3-Clause.
  Upstream project and license: https://github.com/Dash-Industry-Forum/dash.js and https://github.com/Dash-Industry-Forum/dash.js/blob/development/LICENSE.md

The exact decoder JS blobs are the identical tracked source assets used by the Web branch.
Bundling is for playback via MediaSource Extensions on compatible browsers; it does not
supply protected content, DRM keys, or rights to any media streams. Preserve upstream
license notices when redistributing the application.


## MPEG-TS / FLV player

- **mpegts.js 1.8.2** (Apache-2.0), source: https://github.com/xqq/mpegts.js, license: https://github.com/xqq/mpegts.js/blob/v1.8.2/LICENSE.
- CI fetches a pinned, version-verified 1.8.2 UMD distribution via npm at WGT build time. The repository additionally carries an Apache-2.0 licensed 1.8.0 fallback bundle for static TizenBrew hosting. Do not label the fallback 1.8.2.
- This is a transmuxer using Media Source Extensions, not a packaged Samsung hardware codec or a port of VLC. Original media rights and codec constraints still apply.
