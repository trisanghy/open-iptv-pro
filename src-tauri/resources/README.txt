At build time, npm run prepare:renderer copies the correct platform FFmpeg binary
here (ffmpeg.exe on Windows, ffmpeg on macOS). These large binaries are not
included in the source ZIP. FFmpeg binary licenses must be honored on release.
