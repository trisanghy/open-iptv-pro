# Rust Lab v23.8.67 — EPG improvements and reliable versioned release

## What's changed

- Set the Vietnam VNEPG gzip feed `https://epg.io.vn/epg.xml.gz` as the default XMLTV source. Standard XML and localized gzip variants remain optional; EPGShare01 and EPG.pw are disabled fallbacks that can be enabled manually.
- Remove the hard limit of 12,000 XMLTV programmes. Keep valid programmes across channels according to the guide parser's date and size validation instead of discarding late entries.
- Prefer specific episode/programme names derived from XMLTV title, description and subtitle when providers use generic labels such as “Phim truyện”. This depends on the source actually supplying episode metadata.
- Store larger guides in a separate, compressed IndexedDB cache where available. Preserve the previous usable guide on failed storage writes or refreshes, rather than erasing it.
- Maintain the existing IPTV player, favourites, recent channels, playlists, channel organizer, subtitles/translation/TTS, PiP and source/Discovery permission safeguards.

## Release and verification

- Regression coverage includes XMLTV with more than 13,000 entries, VTV3 programme titles, persisted guide restoration and version consistency.
- The automatic release workflow builds Windows x64 Setup and Portable ZIP plus an unsigned macOS Universal DMG (Apple Silicon + Intel) with FFmpeg; source ZIP and SHA-256 checksums are also included when CI completes.
- This update requires the matching release-notes file *before* GitHub Actions creates an immutable version tag. Prior tags and release assets are not modified.
- XMLTV guide content comes from third-party feeds; channel data, airing times, source availability and rights are controlled by their respective providers. No claim is made that the live schedule always matches VTV's official listings.

The standalone macOS build script fetches the immutable `rust-lab/v23.8.67` tag and places only the built `.app` under the new Downloads build directory.
