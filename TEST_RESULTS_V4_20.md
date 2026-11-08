# Open IPTV Pro v4.20 — update repair test report

Date: 2026-11-08

- Node 22: `npm test` **66/66 passed**.
- Added tests for missing checksum, auto-updater error → verified manual fallback, GitHub API errors, and assembling Mac ARM/Intel metadata.
- Chromium Playwright smoke: update check/download/install confirmation/manual fallback, no-release/source-only, official repo **PASS**.
- Chromium Playwright full desktop UI: compact navigation, Timeshift controls, 32 workers, light/dark + language flow **PASS**.
- YAML workflow parsed; shell updater helper passed `bash -n`; Node update and assemble scripts passed syntax checks.
- **Not tested here:** actual Windows NSIS installer, macOS signed update, Apple notarization, live GitHub Actions release, downloading a 300+ MB installer, or native update on a real user machine. These require the user's GitHub release pipeline and macOS/Windows machines.

The source-only ZIP is **not** an executable installer. To make future in-app updates work, publish a stable GitHub Release containing Windows NSIS Setup, Mac ARM/Intel ZIP+DMG, latest.yml, latest-mac.yml, and SHA256SUMS.txt. Unsigned builds use an installer the user opens manually; macOS silent in-place update requires code signing.
