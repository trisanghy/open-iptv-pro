# Open IPTV Pro — Guía en español

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · **Español** · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta:** [Android APK debug / iOS unsigned IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10). iOS IPA requires valid Apple signing and is not directly installable. [Mobile source in main](../../mobile/) · [Mobile setup and limitations](../../docs/MOBILE_ANDROID_IOS.md). Mobile is a separate Capacitor edition, not full Desktop feature parity.

## Descripción general

Open IPTV Pro es un reproductor IPTV y gestor de listas M3U de código abierto, desarrollado como proyecto personal para Web, Windows y macOS. El usuario aporta sus propias fuentes legales M3U/EPG; no se incluyen canales ni suscripciones.

## Ediciones y plataformas

Electron Desktop es la edición estable con más funciones. Rust Lab es una beta independiente basada en Tauri/Rust. Web Online funciona sin instalación, con límites de CORS, códecs, DRM y reproducción automática.

| Edition | Platform | Official source |
| --- | --- | --- |
| Web Online | Browser | [Open Web player](https://trisanghy.github.io/open-iptv-pro/) |
| Electron Desktop | Windows/macOS | [Latest release](https://github.com/trisanghy/open-iptv-pro/releases/latest) |
| Rust Lab Beta | Windows/macOS (depending on release) | [Rust Lab releases](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab) |
| Mobile Capacitor Beta | Android 7+ debug APK / iOS 15+ unsigned IPA | [Mobile v4.23.17-mobile.10](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10) |

## Funciones principales

- Importa archivos M3U o URL autorizadas; organiza grupos, busca y guarda favoritos.
- Fusiona canales duplicados y conserva enlaces alternativos reales y distintos.
- Consulta la guía EPG cuando hay datos XMLTV que coinciden con los canales.
- Controla volumen, pantalla completa y PiP; AirPlay/Cast requieren dispositivos compatibles.
- Algunas ediciones de escritorio incorporan grabación, timeshift, subtítulos, traducción y TTS.
- Guarda ajustes locales, realiza copias y sincroniza datos Web cuando la nube está configurada.

## Primeros pasos

1. Abre el reproductor Web o descarga el instalador adecuado para tu sistema y procesador.
2. Lee el aviso de derechos y carga solo listas M3U que puedas utilizar legalmente.
3. Elige canales por grupo, búsqueda, favoritos o historial.
4. Configura EPG, aspecto y fuentes alternativas si lo necesitas.
5. Haz una copia de seguridad antes de actualizar o cambiar de dispositivo.

## Descargas

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Español](https://trisanghy.github.io/?lang=es)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Capturas de pantalla

La galería contiene 12 capturas Web actuales: escritorio y vistas móviles emuladas de iOS/Android con vídeo de demostración local.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Compatibilidad y problemas

Los fallos pueden deberse a CORS, autenticación, HTTPS, DRM, códecs o políticas del servidor. Un error de navegador no indica necesariamente que el canal esté inactivo. Las capturas de iOS/Android son emulaciones de navegador.

## Ejecutar desde el código

Para ejecutar Electron desde el código (Node.js 22+), usa `npm install --no-audit --no-fund`, `npm test` y `npm start`. Consulta la documentación vietnamita completa para más detalles.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Derechos y exención

El autor solo proporciona una herramienta, no canales, contenidos, suscripciones ni permisos de transmisión. Debes garantizar los derechos de cada fuente y proteger listas, cuentas y grabaciones. El software se ofrece «TAL CUAL» dentro de lo permitido por la ley.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Ayuda y código fuente

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=es)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
