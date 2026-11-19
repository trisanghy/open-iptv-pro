# Open IPTV Pro — Deutsche Anleitung

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · **Deutsch** · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile-Beta (Android/iOS):** Die Capacitor-Ausgabe wird unabhängig von Electron und Rust Lab entwickelt und bietet nicht denselben Funktionsumfang. Die Android-APK ist zum Testen mit einem Debug-Schlüssel signiert. Die iOS-IPA ist unsigniert und benötigt gültige Apple-Zertifikate und Provisioning.

## Überblick

Open IPTV Pro ist ein privat entwickelter Open-Source-IPTV-Player und Playlist-Manager für Web, Windows und macOS. M3U-Listen und EPG-Daten müssen Benutzer selbst mit entsprechenden Nutzungsrechten bereitstellen. Sender oder Abonnements sind nicht enthalten.

Open IPTV Pro bietet getrennte Ausgaben für Web, Windows/macOS und Android/iOS. Sender oder Abonnements sind nicht enthalten.

## Editionen und Plattformen

Electron Desktop ist die umfangreiche stabile Ausgabe. Rust Lab ist eine separate Tauri/Rust-Beta. Web Online läuft ohne Installation, unterliegt aber CORS-, Codec-, DRM- und Autoplay-Beschränkungen des Browsers.

- **Web Online — Browser:** [Player öffnen](https://trisanghy.github.io/open-iptv-pro/), ohne Installation; CORS-, Codec- und DRM-Grenzen gelten.
- **Electron Desktop — Windows/macOS:** [Offizielle Installer](https://github.com/trisanghy/open-iptv-pro/releases/latest).
- **Rust Lab Beta — Windows/macOS:** [Separate Veröffentlichungen](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab).
- **Mobile Capacitor Beta — Android/iOS:** [Debug-APK / unsignierte IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.16), [Mobile-Quellcode](../../mobile/) und [Installationsanleitung](../MOBILE_ANDROID_IOS.md).

## Funktionen

- M3U-Dateien und berechtigte URLs importieren, Gruppen ordnen, suchen und Favoriten speichern.
- Doppelte Sender zusammenführen und echte alternative Stream-URLs erhalten.
- EPG-Programme anzeigen, wenn XMLTV-Daten zu den Sendern passen.
- Lautstärke, Vollbild und PiP nutzen; AirPlay/Cast erfordern kompatible Geräte.
- Einige Desktop-Versionen bieten Aufnahme, Timeshift, Untertitel, Übersetzung und TTS.
- Lokale Einstellungen sichern; Web-Kontosynchronisation ist bei eingerichteter Cloud möglich.

## Erste Schritte

1. Webplayer öffnen oder Installer passend zu Betriebssystem und Prozessor auswählen.
2. Rechtehinweise lesen und nur berechtigte M3U-Listen importieren.
3. Sender über Gruppen, Suche, Favoriten oder Verlauf auswählen.
4. Bei Bedarf EPG, Darstellung und Ersatzstreams einstellen.
5. Vor Updates oder Gerätewechsel Daten sichern.

## Downloads

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Deutsch](https://trisanghy.github.io/?lang=de)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Screenshots

Die Galerie enthält zwölf aktuelle Web-Aufnahmen von Desktop und emulierten iOS-/Android-Ansichten mit lokal erzeugtem Demo-Video.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Kompatibilität und Fehlerbehebung

Wiedergabeprobleme können an CORS, Authentifizierung, HTTPS, DRM, Codecs oder Serverrichtlinien liegen. Ein Browserfehler beweist nicht, dass der Stream offline ist. iOS/Android-Abbildungen stammen aus Browser-Emulationen.

## Aus dem Quellcode starten

Electron aus dem Quellcode starten (Node.js 22+): `npm install --no-audit --no-fund`, `npm test`, `npm start`. Weitere Details stehen in der vietnamesischen Hauptdokumentation.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Nutzungsrechte und Haftung

Der Autor stellt nur die Player-Software bereit, keine Inhalte, Abonnements oder Wiedergaberechte. Nutzer tragen die Verantwortung für rechtmäßige Quellen, Wiedergabe, Aufnahmen, Zugangsdaten und Backups. Die Software wird im gesetzlich zulässigen Umfang OHNE GEWÄHR bereitgestellt.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Support und Quellcode

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=de)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
