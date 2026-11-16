# Open IPTV Pro — Web Online

Source branch: \`web/online\`; desktop \`main\` and WebView \`experiment/native-webview-ffmpeg\` remain unchanged.

This is a browser-only adaptation of the WebView 4.23.38 frontend, with the original two-row player, channel/folder organization, favorites, M3U file/URL import, EPG and MultiView where supported by browsers. HLS.js and dash.js are included with the static website; no app installation is required.

## Hosting

The workflow at \`.github/workflows/deploy-openiptv-web.yml\` downloads the WebView 4.23.37 source ZIP from the experimental branch, applies the v4.23.38 toolbar patch, copies only \`frontend/\`, bundles the HLS/DASH browser players, applies browser-only changes and uploads a GitHub Pages artifact.

GitHub Pages must be enabled with **repository Settings → Pages → Build and deployment → Source: GitHub Actions** before the deployment action can publish. Subsequent pushes to \`web/online\` redeploy automatically.

Expected URL after a successful Pages deployment:
https://trisanghy.github.io/open-iptv-pro/

## What works in the browser

- Import local M3U files and HTTPS playlist URLs **when CORS is permitted by the source**
- Play browser-supported HLS, MPEG-DASH and MP4 (with supported codecs)
- Search, favorites, folders, drag-and-drop ordering, themes, playlist export
- XMLTV EPG when it can be retrieved by the browser; MultiView for supported streams
- Browser PiP and fullscreen where available
- Local JSON Backup/Restore. Data stays in this browser's localStorage, not on GitHub.

## Differences from desktop

GitHub Pages serves **only static assets**. It cannot provide native FFmpeg remux, scheduled recording, Timeshift recording, LAN Cast/AirPlay discovery, stream proxy or a server-side CORS bypass. Some HTTP, DRM, MPEG-TS and access-restricted sources will not play. The Web Edition hides the DVR and native FFmpeg buttons.

No playlists or channels are bundled. Use sources you are authorized to view. Backup JSON can include sensitive URLs/PIN, so store it privately.
