# Open IPTV Pro v4.23.12 — audit

Based on the supplied full v4.23.11 source ZIP. No destructive data conversion.

## Changes verified
- Cinema TV: playback + now/next + featured carousel use the same IPTV channel data.
- Glassmorphism: true three-pane layout; player controls physically reparented, not duplicated.
- Accent: the selected hue is saved as an intentional preference, and the theme UI observes it across preset changes. Wheel centre gradient is no longer obscured by the inset shadow.
- Studio/Bento/Swiss additional TV layout improvements.

## Automated verification
- `npm test` including the new UI structure tests (see console result). Two existing optional FFmpeg integration tests are skipped by default.
- Headless Chromium static layout inspections at 1536×960 and 1000×800 using mocked channel/EPG data. This is visual/layout verification only, not an actual packaged Electron runtime.
- JavaScript syntax and ZIP CRC checks.

## Remaining testing requirements
- Test actual `.dmg` / `.exe` builds on macOS and Windows before GitHub release.
- Verify playing streams, EPG/network access, FFmpeg recording, AirPlay and Cast on real devices.
- Colour / appearance combinations in both operating systems.
