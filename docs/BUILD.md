# Build guide / Hướng dẫn build

## CI builds

- GitHub Actions workflows under `.github/workflows/`
- `workflow_dispatch` creates separate unsigned installers on Intel Mac, Apple Silicon and Windows 64-bit runners.
- `npm test` runs before building.
- CI uploads the outputs as **artifacts**; it does **not automatically publish a public release** or push to Gist.

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
