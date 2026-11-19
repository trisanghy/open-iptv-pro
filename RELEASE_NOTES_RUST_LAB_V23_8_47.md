# Open IPTV Pro Rust Lab v23.8.47 — native technical and safety notices

- Added complete native-language translations of 17 full-length technical, security, privacy, legal-use, failover, DVR, EPG, backup and update explanatory paragraphs across all 15 non-Vietnamese/non-English locales.
- Translated priority Simplified Chinese, Lao, Korean and Russian first, then Spanish, Brazilian Portuguese, Thai, Khmer, French, German, Italian, Japanese, Indonesian, Hindi and Arabic.
- Preserved key numeric restrictions (12 seconds, 0–100 priority rather than uptime, 32 parallel streams, 2–8 concurrent checks, maximum 8-hour recording and MP4 output) and warnings about DRM, unencrypted backups and content rights.
- Added all-locale regression checks and extended static coverage audit.
- Does not change audio/video playback, native PiP, AI/TTS, rights acknowledgment, user data, previous tags/releases or unrelated branches.
- Static UI translation coverage is improved but not yet 100%; remaining UI and dynamic messages will be reported by audit.
