# Open IPTV Pro — Panduan Bahasa Indonesia

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · **Bahasa Indonesia** · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta (Android/iOS):** edisi Capacitor dikembangkan secara terpisah dari Electron dan Rust Lab sehingga fiturnya tidak sama. APK Android bertanda tangan debug hanya untuk pengujian. IPA iOS belum ditandatangani dan memerlukan sertifikat serta provisioning Apple yang sah agar dapat dipasang.

## Ringkasan

Open IPTV Pro adalah pemutar IPTV dan pengelola playlist M3U sumber terbuka untuk Web, Windows, dan macOS. Ini proyek pribadi; pengguna menyediakan sumber M3U/EPG yang memiliki hak akses. Aplikasi tidak menyediakan kanal atau langganan.

Open IPTV Pro memiliki edisi terpisah untuk Web, Windows/macOS, serta Android/iOS dan tidak menyertakan kanal atau langganan.

## Edisi dan platform

Electron Desktop adalah edisi stabil yang lebih lengkap. Rust Lab merupakan beta Tauri/Rust terpisah. Web Online bekerja tanpa instalasi, tetapi dibatasi CORS, codec, DRM, dan autoplay browser.

- **Web Online — Peramban:** [Buka pemutar](https://trisanghy.github.io/open-iptv-pro/), tanpa instalasi; batas CORS, codec, dan DRM tetap berlaku.
- **Electron Desktop — Windows/macOS:** [Installer resmi](https://github.com/trisanghy/open-iptv-pro/releases/latest).
- **Rust Lab Beta — Windows/macOS:** [Rilis terpisah](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab).
- **Mobile Capacitor Beta — Android/iOS:** [APK debug / IPA belum ditandatangani](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.16), [kode sumber Mobile](../../mobile/) dan [panduan instalasi](../MOBILE_ANDROID_IOS.md).

## Fitur utama

- Impor file M3U atau URL yang diizinkan, kelola grup, cari kanal, dan simpan favorit.
- Gabungkan kanal yang sama sambil mempertahankan tautan cadangan yang benar-benar berbeda.
- Lihat jadwal EPG jika data XMLTV cocok dengan kanal.
- Atur volume, layar penuh, dan PiP; AirPlay/Cast bergantung pada perangkat.
- Sebagian edisi desktop menyediakan perekaman, timeshift, subtitle, terjemahan, dan TTS.
- Simpan pengaturan lokal, cadangkan data, serta sinkronkan Web bila cloud dikonfigurasi.

## Memulai

1. Buka pemutar Web atau unduh installer yang sesuai dengan OS dan CPU.
2. Baca pemberitahuan hak cipta lalu impor hanya playlist M3U yang berhak Anda gunakan.
3. Pilih kanal melalui grup, pencarian, favorit, atau riwayat.
4. Atur EPG, tema, dan tautan alternatif jika perlu.
5. Cadangkan data sebelum pembaruan atau pindah perangkat.

## Unduhan

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Bahasa Indonesia](https://trisanghy.github.io/?lang=id)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Tangkapan layar

Galeri berisi 12 tangkapan layar Web terbaru: desktop dan emulasi iOS/Android dengan video demo lokal.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Kompatibilitas dan masalah

Pemutaran dapat gagal akibat CORS, autentikasi, HTTPS, DRM, codec, atau aturan server. Kegagalan browser belum tentu berarti stream mati. Gambar iOS/Android berasal dari emulasi perangkat browser, bukan ponsel asli.

## Menjalankan sumber

Untuk menjalankan sumber Electron diperlukan Node.js 22+: `npm install --no-audit --no-fund`, `npm test`, `npm start`. Lihat README bahasa Vietnam untuk informasi lengkap.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Hak konten dan penafian

Pengembang hanya menyediakan perangkat lunak, bukan kanal, konten, langganan, atau hak siar. Pengguna bertanggung jawab atas sumber legal, rekaman, akun, dan pencadangan. Perangkat lunak disediakan APA ADANYA sejauh diizinkan hukum.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Bantuan dan kode sumber

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=id)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
