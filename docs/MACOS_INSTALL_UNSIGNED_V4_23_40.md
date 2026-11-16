# Open IPTV Pro v4.23.40 — macOS installation (unsigned builds)

> **Important:** The macOS v4.23.40 DMG installers are **not signed with an Apple Developer ID and are not notarized by Apple**. A macOS Gatekeeper warning such as **“Open IPTV Pro is damaged and can't be opened. You should move it to the Trash.”** can appear when Chrome or Safari downloads the installer. This message does not, by itself, prove the downloaded file is corrupt. Do not disable Gatekeeper globally.

## 1. Pick the right macOS DMG

- **Apple Silicon (M1/M2/M3/M4/M5):** [Open-IPTV-Pro-4.23.40-mac-arm64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.40/Open-IPTV-Pro-4.23.40-mac-arm64.dmg)
  - SHA-256: `4fda42d49ce29a60f09e29b3c189d0f7e8e2cfa353cf88055e088052244d094b`
- **Mac Intel:** [Open-IPTV-Pro-4.23.40-mac-x64.dmg](https://github.com/trisanghy/open-iptv-pro/releases/download/v4.23.40/Open-IPTV-Pro-4.23.40-mac-x64.dmg)
  - SHA-256: `e71caff563d04355ff4c13dca298a4fdf8f87ef4ea857c3d324c14f3dc94f9f2`

## 2. Verify the download first

For an Apple Silicon machine:

```bash
shasum -a 256 "$HOME/Downloads/Open-IPTV-Pro-4.23.40-mac-arm64.dmg"
```

For an Intel machine:

```bash
shasum -a 256 "$HOME/Downloads/Open-IPTV-Pro-4.23.40-mac-x64.dmg"
```

**Stop if the computed hash differs** from the correct expected hash listed above. A mismatched file should be discarded and downloaded again.

## 3. Install and try the macOS security override

Mount the verified DMG, then drag **Open IPTV Pro.app** to **Applications**. In Finder, try Control-clicking the app and choosing **Open**. If macOS offers **Open Anyway** in **System Settings → Privacy & Security**, use that approval option if you trust this exact release.

If macOS still reports the app as damaged and you have *verified its original DMG checksum*, clear the download quarantine flag **for this specific app only**:

```bash
xattr -dr com.apple.quarantine "/Applications/Open IPTV Pro.app"
open "/Applications/Open IPTV Pro.app"
```

Do not use `spctl --master-disable` or turn off Gatekeeper system-wide.

If this does not work, check for a genuine signature/binary issue:

```bash
codesign --verify --deep --strict --verbose=2 "/Applications/Open IPTV Pro.app"
```

An unsigned app may fail this assessment, but an error reporting missing or invalid internal binaries requires investigation rather than repeating the quarantine command.

## 4. Permanent fix for distribution

A downloadable DMG that opens without manual quarantine exceptions requires a valid **Apple Developer ID Application** signing certificate and Apple **notarization**, including stapling the notarization ticket to the distributed product. In GitHub Actions, configure protected signing credentials and an App Store Connect notarization credential set, then verify with `codesign`, `spctl` and `xcrun stapler validate` before publication.

Until signed/notarized installers exist, **GitHub Actions build success does not mean macOS Gatekeeper approval**. Disclose the unsigned status on every Release.

Official documentation: [electron-builder macOS notarization](https://www.electron.build/docs/notarization/).
