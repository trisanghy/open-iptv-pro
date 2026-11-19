# Open IPTV Pro — 한국어 안내

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · **한국어** · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta:** [Android APK debug / iOS unsigned IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10). iOS IPA requires valid Apple signing and is not directly installable. [Mobile source in main](../../mobile/) · [Mobile setup and limitations](../../docs/MOBILE_ANDROID_IOS.md). Mobile is a separate Capacitor edition, not full Desktop feature parity.

## 개요

Open IPTV Pro는 Web, Windows, macOS에서 사용하는 개인 오픈 소스 IPTV 플레이어 및 재생 목록 관리자입니다. M3U/EPG와 콘텐츠 이용 권한은 사용자가 직접 준비해야 하며 채널이나 구독 서비스는 제공하지 않습니다.

## 버전 및 플랫폼

Electron Desktop은 기능이 풍부한 안정판이며, Rust Lab은 별도의 Tauri/Rust 베타판입니다. Web Online은 설치가 필요 없지만 브라우저의 CORS, 코덱, DRM, 자동 재생 정책에 영향을 받습니다.

| Edition | Platform | Official source |
| --- | --- | --- |
| Web Online | Browser | [Open Web player](https://trisanghy.github.io/open-iptv-pro/) |
| Electron Desktop | Windows/macOS | [Latest release](https://github.com/trisanghy/open-iptv-pro/releases/latest) |
| Rust Lab Beta | Windows/macOS (depending on release) | [Rust Lab releases](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab) |
| Mobile Capacitor Beta | Android 7+ debug APK / iOS 15+ unsigned IPA | [Mobile v4.23.17-mobile.10](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10) |

## 주요 기능

- M3U 파일 또는 허가된 URL 가져오기, 그룹·검색·즐겨찾기 관리.
- 중복 채널 병합과 실제로 다른 예비 스트림 주소 보관.
- 일치하는 XMLTV 데이터가 있을 때 EPG 편성표 표시.
- 음량, 전체 화면, PiP 지원. AirPlay/Cast는 기기 호환성에 따라 달라집니다.
- 일부 데스크톱 버전에는 녹화, 타임시프트, 자막, 번역, TTS 기능이 있습니다.
- 로컬 설정과 백업, 설정된 경우 Web 계정 동기화를 지원합니다.

## 시작하기

1. Web 플레이어를 열거나 운영체제와 CPU에 맞는 설치 파일을 선택합니다.
2. 콘텐츠 이용 권한을 확인한 뒤 합법적인 M3U 목록을 가져옵니다.
3. 그룹, 검색, 즐겨찾기 또는 최근 시청에서 채널을 고릅니다.
4. 필요하면 EPG, 테마, 예비 링크를 설정합니다.
5. 업데이트나 기기 변경 전 데이터를 백업합니다.

## 다운로드

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in 한국어](https://trisanghy.github.io/?lang=ko)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## 화면 캡처

최신 Web UI 스크린샷 12장을 제공하며 데스크톱, iOS 및 Android 브라우저 에뮬레이션을 포함합니다. 영상은 로컬 데모입니다.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## 호환성과 문제 해결

재생 문제는 CORS, 인증, HTTPS, DRM, 코덱, 서버 정책이 원인일 수 있습니다. 브라우저에서 실패했다고 스트림이 오프라인인 것은 아닙니다. iOS/Android 이미지는 실제 휴대폰이 아닌 브라우저 에뮬레이션입니다.

## 소스에서 실행

Electron 소스 실행에는 Node.js 22+가 필요합니다: `npm install --no-audit --no-fund`, `npm test`, `npm start`. 세부 사항은 베트남어 원문을 참조하세요.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## 저작권 및 책임

개발자는 플레이어 도구만 제공하며 채널, 구독 또는 콘텐츠 이용 권한을 제공하지 않습니다. 사용자는 목록, EPG, 계정 정보, 녹화와 백업을 적법하게 관리할 책임이 있습니다. 소프트웨어는 법률이 허용하는 범위에서 '있는 그대로' 제공됩니다.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## 지원 및 소스 코드

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=ko)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
