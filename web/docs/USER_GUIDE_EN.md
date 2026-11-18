# Open IPTV Pro — Desktop User Guide (English)

## Install or launch

Install Node.js 22+, run `npm install` from the source directory, then `npm start`. Or create a platform installer using `BUILD_MAC.command` on Mac or `BUILD_WINDOWS.bat` on Windows. A release installer must be built for your target architecture.

## Change interface language

Open **Settings** from the left sidebar. Under **Language**, choose Vietnamese, English, Spanish, Portuguese (Brazil), Simplified Chinese, Thai, Lao or Khmer. The UI changes immediately. The choice is stored locally and will be restored on the next launch. Your imported channel titles and provider EPG are kept unchanged.

## Add sources and watch channels

Use **Open M3U File** to import an existing `.m3u` file, or **Add URL** to fetch a playlist. Select **Watch TV**, find a channel, and click to play. Use the play/pause, volume and aspect-ratio controls underneath the video. Picture-in-picture depends on codec and platform support.

## Folders and favorites

Click the star in the channel list or player to add a channel to Favorites. Stars synchronize across the interface. Drag channels onto another folder heading to reorganize them. Channel order and personal folders are stored locally; importing a remote source never changes the original provider file.

## EPG

Choose **TV Guide** to view XMLTV schedules; add or enable an EPG source under **Settings**. Channel IDs may require manual mapping, and provider program names remain untranslated.

## Link checks and snapshots

In **Manage Sources → Check & Repair**, verify link availability and review Alive, Offline and Unknown results. Unknown means the checker could not prove the stream works or fails. You can also capture thumbnails under **Channel Snapshots**. Both actions support independent concurrency settings (1–32). A higher worker count may cause rate limiting or network overload.

## MultiView and Timeshift

Open **MultiView** for a four-channel grid; audio follows the pane under the cursor. Timeshift captures a rolling local buffer on desktop when explicitly enabled. You cannot rewind to material that has not yet been recorded locally unless the provider supports DVR/catch-up.

## Troubleshooting

If a stream is playable but the checker reports Offline, use its playback proof or recheck after a delay and compare with a backup source. For `403`/`429` or timeout problems, lower concurrency. For EPG mismatches, validate the playlist `tvg-id` and the XMLTV feed. If a build fails, run the script in Terminal/PowerShell to inspect its error instead of closing it automatically.

## Privacy and licensing

Do not submit private subscription URLs or credentials to public repositories. The project itself is MIT-licensed; streams, logos and EPG information remain owned by their respective providers.
