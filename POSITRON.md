# Positron P3 — Experimental Desktop Lab

Based on the exact Electron branch commit `262374ef1d6ce6d3c8ff8dbea01103ef6da7a947` (Open IPTV Pro v4.23.76).

## Research and 20 new engineering iterations
The 20 sequential Git commits in P3 are recorded in `POSITRON_P3_CHANGELOG.md`. This is 20 code-change iterations plus 20 new real-interface test cycles; it is not 20 separate cross-platform performance certifications.

## What changes
- Independent Positron identity, application ID and prerelease update channel; stable Electron installers remain untouched.
- Workspace topbar with current-channel indicator.
- Keyboard command palette: `Ctrl+K` (Windows/Linux) or `⌘+K` (macOS), or `/` outside text inputs. Search existing channels and navigate to all desktop pages.
- One-click focus mode hides sidebar and channel list with the original application controls and restores prior visibility.
- Fresh navy/purple/teal sidebar, cards and control hierarchy with a compact responsive breakpoint.
- No alteration to existing IPTV parsing, playback, rights confirmation, EPG, DVR, Whisper/TTS, Supabase or settings storage code.

## Evidence
P2 repairs real screenshot-discovered contrast errors and excludes ephemeral log files from GitHub Release uploads.

The Positron CI pipeline executes the existing unit tests plus **40 separate real Electron UI interaction rounds (20 inherited + 20 new Studio tests)**, running the actual app under Xvfb and Chromium DevTools Protocol. It captures final main, command palette, focus, settings and Smart Doctor screenshots, together with `audit-20-rounds.json` and `audit-positron-p3-20-rounds.json`.

A completed green CI run proves the listed smoke checks, not 20 independent design revisions. Playback quality and streaming compatibility still require a real playable, authorized IPTV source and device-specific validation.

## New P3 themes
Choose Nebula (indigo), Aurora (teal) or Graphite (warm grey) from the **Chủ đề** button. Your choice is saved locally in the Positron installation. `Alt+P` opens Studio, `Alt+Shift+T` cycles color palettes and `Alt+1..5` navigates between TV, favorites, EPG, sources and settings. UI-only; no streaming settings are overwritten.

## Release policy
Tag: `positron/v4.23.79-p3` — experimental prerelease, never replace an existing tag or stable Electron release.
Builds: Apple Silicon DMG, Intel Mac DMG, Windows x64 Setup + Portable, source ZIP, checksums, actual screenshots.

Unsigned binaries may trigger Windows SmartScreen or macOS Gatekeeper warnings. New Positron app identity intentionally separates local app data from the stable installation; existing channel lists are not deleted. Back up or import playlists as required.
