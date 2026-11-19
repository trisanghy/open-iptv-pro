# Open IPTV Pro — Руководство на русском

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · **Русский**

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Мобильная бета (Android/iOS):** версия Capacitor разрабатывается отдельно от Electron и Rust Lab и отличается по функциям. Android APK подписан отладочным ключом для тестирования. iOS IPA не подписан; для установки нужны действительные сертификаты Apple и provisioning.

## Обзор

Open IPTV Pro — личный проект с открытым исходным кодом: IPTV-плеер и менеджер M3U-плейлистов для Web, Windows и macOS. Пользователь сам добавляет законные источники M3U/EPG. Каналы и подписки не предоставляются.

Open IPTV Pro включает отдельные версии для Web, Windows/macOS и Android/iOS. Каналы и подписки в комплект не входят.

## Версии и платформы

Electron Desktop — стабильная версия с расширенными возможностями. Rust Lab — отдельная бета-версия Tauri/Rust. Web Online работает без установки, но зависит от ограничений CORS, кодеков, DRM и автозапуска в браузере.

- **Web Online — браузер:** [Открыть плеер](https://trisanghy.github.io/open-iptv-pro/), без установки, с ограничениями CORS, кодеков и DRM.
- **Electron Desktop — Windows/macOS:** [Официальные установщики](https://github.com/trisanghy/open-iptv-pro/releases/latest).
- **Rust Lab Beta — Windows/macOS:** [Отдельные выпуски](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab).
- **Mobile Capacitor Beta — Android/iOS:** [Отладочный APK / неподписанный IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10), [исходники Mobile](../../mobile/) и [инструкция](../MOBILE_ANDROID_IOS.md).

## Основные функции

- Импортировать M3U-файлы и разрешённые URL, управлять группами, поиском и избранным.
- Объединять дубли каналов и сохранять реальные альтернативные ссылки.
- Просматривать EPG при наличии подходящих данных XMLTV.
- Управлять громкостью, полноэкранным режимом и PiP; AirPlay/Cast требуют совместимых устройств.
- В некоторых настольных версиях доступны запись, таймшифт, субтитры, перевод и TTS.
- Хранить настройки локально, создавать резервные копии и синхронизировать Web при наличии облака.

## Начало работы

1. Откройте Web-плеер или скачайте установщик под свою ОС и процессор.
2. Ознакомьтесь с условиями и импортируйте только разрешённый M3U-плейлист.
3. Выберите канал через группы, поиск, избранное или историю.
4. Настройте EPG, тему и запасные ссылки при необходимости.
5. Сохраните резервную копию перед обновлением или переносом.

## Загрузки

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Русский](https://trisanghy.github.io/?lang=ru)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Скриншоты

Галерея содержит 12 актуальных снимков Web: компьютер и эмуляция iOS/Android с локальным демо-видео.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Совместимость и ошибки

Ошибка воспроизведения может быть связана с CORS, авторизацией, HTTPS, DRM, кодеками или правилами сервера. Сбой в браузере не обязательно означает, что поток недоступен. Скриншоты iOS/Android сделаны в эмуляции браузера.

## Запуск из исходников

Для запуска Electron из исходников нужен Node.js 22+: `npm install --no-audit --no-fund`, `npm test`, `npm start`. Подробная инструкция содержится в основном вьетнамском README.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Права и отказ от ответственности

Автор предоставляет только программный инструмент, но не контент, подписки или права на трансляции. Пользователь отвечает за законность источников, записи, учётные данные и резервные копии. Программа поставляется «КАК ЕСТЬ» в пределах действующего законодательства.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Поддержка и исходный код

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=ru)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
