# Open IPTV Pro v4.23.3 — DVR Reliability Audit (2026-11-10)

## What was changed

- Added `src/recording-scheduler.cjs` isolated in the Electron main process; no changes to existing player/Timeshift media pipeline.
- Persisted scheduled recordings atomically to `userData/dvr-schedule-v1.json` before beginning to record; quarantine damaged data.
- UI inside EPG: manual channel/title/time scheduling, EPG one-click scheduling, choosing a recording folder, active status, cancel/stop, reveal recording file.
- Dedicated FFmpeg stream-copy to MPEG-TS, output `.part.ts` during capture; success requires completed FFmpeg, minimum content, MPEG-TS sync bytes and close to scheduled end.
- Reject overlapped tasks; one recording at a time, 1 minute to 8 hours, future up to 45 days. Jobs missed by more than 90 seconds are marked missed, never replayed.
- Monitor recording wall-clock deadline, disk free space and no-growth timeouts. Guard against overwriting files. Errors and manual cancellation preserve partial recordings when possible.
- Quit/abnormal restart: retain unfinished files and mark interrupted; do not silently resume or claim success.
- Backup/Restore includes future scheduled jobs, but **never video files**; old backup files remain supported. When restoring a new backup, scheduled jobs are replaced only after successful storage restore.
- Seven translated locale dictionaries updated; Vietnamese remains the default.

## Test evidence

- `npm test` → **130 tests total, 128 passed, 0 failed, 2 skipped**. The 2 skipped are explicit FFmpeg integration tests.
- `DVR_INTEGRATION=1 node --test tests/dvr_live_ffmpeg_integration.test.cjs` → **2/2 passed**: local HTTP MPEG-TS and HLS playlists recorded to `.ts`, with FFprobe validation (Linux environment).
- `python tests/ui_dvr_v4233.py` → **2/2 viewport runs passed** (1360 px, 1000 px): EPG schedule/cancel, manual schedule, JavaScript exceptions 0, English/Thai label switches.
- Existing targeted UI tests passed: EPG, favorites/sources, Smart Discovery >1,000/Doctor 3.0, Cast/AirPlay.
- JavaScript syntax check over app JS; HTML IDs checked for duplicates.

## Not confirmed / usage restrictions

- Linux test environment is not a full Windows/macOS installer test. **No signed macOS DMG or Windows EXE was built or exercised on a real target machine**. Device-specific permissions, power states, DRM, remote HLS quirks, network disruptions and actual storage exhaustion still need user-device validation.
- The app must remain running, and the OS must not sleep. This version does not create OS-level login agents, wake timers or scheduled background jobs after app exit.
- Only HTTP(S) streams and unencrypted, legitimately recordable media are supported; no DRM bypass, no automatic alternate source switching, and no simultaneous recordings.
- Video recordings can be large and remain in the user-selected folder. `.iptvbackup` carries future schedules **only**, not the video files.
- Status 'completed' refers to a verified local MPEG-TS file and FFmpeg completion, not a guarantee that the broadcaster delivered all expected programme frames.

## Safe manual acceptance on Mac/Windows

1. Extract the source ZIP and build with `BUILD_MAC.command` or `BUILD_WINDOWS.bat`.
2. Record a short freely accessible test programme while the app is open and awake. Keep the channel playing separately; verify video and audio in the `.ts` file.
3. Cancel a second test in progress; verify it is not labelled completed and that incomplete video is preserved.
4. Try deliberately overlapping schedules; verify the second one is refused.
5. Keep a future schedule, quit and reopen, and verify it remains. Do not rely on recording while the app is closed.

No GitHub push, tag or Release was performed.
