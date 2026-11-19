# Open IPTV Pro — International guide

[Tiếng Việt](../../README.md) · **English** · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> This is the international quick-start guide. The Vietnamese README remains the complete technical reference; version numbers and features should always be confirmed against current Releases.

> **Mobile Beta:** [Android APK debug / iOS unsigned IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10). iOS IPA requires valid Apple signing and is not directly installable. [Mobile source in main](../../mobile/) · [Mobile setup and limitations](../../docs/MOBILE_ANDROID_IOS.md). Mobile is a separate Capacitor edition, not full Desktop feature parity.

## Overview

Open IPTV Pro is a personal, open-source IPTV player and playlist manager for Web, Windows, and macOS. You provide your own lawfully accessible M3U playlists and EPG sources; the app does not bundle channels or subscriptions.

## Editions and supported platforms

Electron Desktop is the stable feature-rich edition. Rust Lab is a separate Tauri/Rust beta with different compatibility and features. Web Online runs in supported browsers and may be limited by CORS, codecs, DRM, autoplay, and media-server configuration.

| Edition | Platform | Official source |
| --- | --- | --- |
| Web Online | Browser | [Open Web player](https://trisanghy.github.io/open-iptv-pro/) |
| Electron Desktop | Windows/macOS | [Latest release](https://github.com/trisanghy/open-iptv-pro/releases/latest) |
| Rust Lab Beta | Windows/macOS (depending on release) | [Rust Lab releases](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab) |
| Mobile Capacitor Beta | Android 7+ debug APK / iOS 15+ unsigned IPA | [Mobile v4.23.17-mobile.10](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10) |

## Main features

- Import local M3U files or authorized M3U URLs, organize groups, search channels, and mark favorites.
- Merge matching channels carefully and retain distinct, genuine fallback stream URLs.
- Browse EPG/XMLTV schedules when your source supplies matching program information.
- Switch streams, control volume, fullscreen, and PiP; AirPlay/Cast depend on your browser and devices.
- Electron/Rust Lab may offer FFmpeg, recording, timeshift, caption, translation, or TTS workflows depending on edition and available models.
- Save local settings, back up playlists, and use account sync on the Web when cloud service is configured.

## Getting started

1. Choose the browser player or an installer matching your CPU and operating system.
2. Read and confirm the content-rights notice; import an M3U file or URL you are authorized to use.
3. Browse channels by group, search, favorites, or recently watched items.
4. Optionally add XMLTV EPG, customize the theme and player, and configure supported backup streams.
5. Back up your playlists and settings before updates or moving to another device.

## Downloads

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in English](https://trisanghy.github.io/?lang=en)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Screenshots

The current gallery includes 12 Chromium-captured Web views: desktop, iOS-style mobile, and Android-style mobile. Demo media is generated locally; these are not verified screenshots from physical phones.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Compatibility and troubleshooting

Streams may fail because of network restrictions, authentication, server policy, CORS, incompatible codecs, mixed HTTP/HTTPS, DRM, or autoplay limitations. A browser playback failure alone does not prove a stream is offline. iOS/Android screenshot samples are browser-device emulations, not proof of Safari or native-app support.

## Build from source

To run the Electron desktop source (Node.js 22+), use `npm install --no-audit --no-fund`, `npm test`, then `npm start`. Consult the Vietnamese master README and build documentation for the current build scripts and release safeguards.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Content rights and disclaimer

The author provides software tools, not television channels, subscriptions, streaming rights, or guarantees. You must have permission to access, play, record, or redistribute every source you add. You are responsible for playlists, EPG, credentials, recordings, account information, and backups. Software is provided “AS IS”; exclusions apply only to the extent allowed by law. See the MIT license and copyright notice.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Support and source code

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=en)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
