# Open IPTV Pro Rust Lab v4.23.17 — Windows environment fix

This is the isolated experiment `experiment/rust-tauri-v2`. No edits or releases to the Electron stable repository.

## What changed

- `BUILD_WINDOWS_TAURI.ps1` no longer stops immediately when `node` is missing.
- Uses Windows Package Manager (WinGet) to install Node.js LTS and Rustup when necessary.
- Installs Microsoft VS 2022 C++ Build Tools with the Desktop C++ workload when missing; checks `cl.exe` and Windows SDK's `rc.exe` via `VsDevCmd.bat`.
- Selects stable x64 MSVC Rust, sets a conservative compilation concurrency (2), runs npm tests, prepares renderer, runs Cargo tests and builds Tauri NSIS `.exe`.
- Creates `build-logs/WINDOWS_TAURI_LAST.log` and opens EXE folder only after verifying a fresh installer.

## One PowerShell command (run as Administrator)

Save the fixed ZIP under Downloads, then paste the one command provided with the ZIP. An internet connection is needed for initial installations. WinGet may show UAC/installer prompts and in some cases Windows needs rebooting. The installer for Visual Studio Build Tools can be several GB; do not turn off the PC mid-install.

After successful build, the NSIS installer is in `src-tauri/target/release/bundle/nsis`.

If the script stops, send **the final 80–120 lines of** `build-logs/WINDOWS_TAURI_LAST.log`. A successful tool installation does not by itself prove the Rust project will compile; the subsequent test/build steps are the actual verification.

## Prerequisites

- Windows 10/11 x64 and `winget` (Microsoft App Installer)
- VS 2022 Build Tools, MSVC and Windows 10/11 SDK (automatically attempted when absent)
- Node.js 22 or later, Rust stable x64 MSVC (automatically attempted when absent)
- WebView2 Runtime (usually present on updated Windows; https://v2.tauri.app/start/prerequisites/)

## Safety

- Does not alter source IPTV playlists or application user data.
- Does not create/push a Git branch or change `main`.
- Does not delete previous build artifacts. The EXE check requires a freshly created installer.

## Fix v6.2: Node 26 false-negative on PowerShell

The old PowerShell check passed a JavaScript snippet via `node -p`; its nested quotes could be lost, producing `split(.)`, `Unexpected token`, and a false missing-Node message even for Node 26.13.1. The updated check parses `node.exe --version` via a PowerShell regex without any JavaScript evaluation. Node.js 22+ (including Node 26) is accepted when `npm.cmd` is available, so WinGet will not be invoked unnecessarily.

This change is limited to the Windows bootstrap. Windows-native compilation and installation still need validation on a real Windows host.
