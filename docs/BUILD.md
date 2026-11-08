# Build guide / Hướng dẫn build

## CI builds

- GitHub Actions workflows under `.github/workflows/`
- `workflow_dispatch` creates separate development installers on Intel Mac, Apple Silicon and Windows 64-bit runners.
- Pushing a `v*` tag triggers `release-desktop.yml`: tests, macOS universal + Windows x64 builds, GitHub Release assets, update manifests and SHA256SUMS.txt.
- `npm test` runs before building.
- Development builds are uploaded as **artifacts**. The release workflow publishes binaries on tag pushes. No push to Gist.
- **Automatic installation requires signed packages.** Configure `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`, and Windows `WIN_CSC_LINK`, `WIN_CSC_KEY_PASSWORD` secrets where appropriate.
- For update compatibility, the macOS release needs both `.dmg` and `.zip` plus `latest-mac.yml`; Windows requires NSIS Setup plus `latest.yml`. Never publish secrets or private keys.

## Runtime / Dependencies

- App code: Electron + browser renderer, local network proxy for HLS/CORS, FFmpeg snapshots.
- No Python, Qt or VLC is required on end-user machines after packaging.
- First build downloads npm packages; helpers can download a pinned Node archive locally, validating SHA-256 before executing it.
- Development: Node.js 22+, npm, internet; `npm install`, `npm test`, `npm start`.

## Distribution

- Both Mac DMGs require correct-architecture FFmpeg. The provided matrix builds these on different runner architectures.
- To publish a signed/notarized Mac app, arrange Apple Developer ID certificate credentials and configure electron-builder notarization.
- To publish a trusted Windows setup, sign the installer using your own code-signing certificate.
- FFmpeg license and codec compliance must be reviewed before distributing binaries.
- Stream checks cannot guarantee that a stream will remain playable later.
