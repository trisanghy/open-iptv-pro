# Open IPTV Pro — 日本語ガイド

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · **日本語** · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta:** [Android APK debug / iOS unsigned IPA](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10). iOS IPA requires valid Apple signing and is not directly installable. [Mobile source in main](../../mobile/) · [Mobile setup and limitations](../../docs/MOBILE_ANDROID_IOS.md). Mobile is a separate Capacitor edition, not full Desktop feature parity.

## 概要

Open IPTV Pro は Web、Windows、macOS 向けの個人開発オープンソース IPTV プレーヤーです。M3U や EPG は利用権を持つユーザー自身が用意します。チャンネルや有料サービスは付属しません。

## エディションとプラットフォーム

Electron Desktop は高機能な安定版です。Rust Lab は独立した Tauri/Rust ベータ版です。Web Online はインストール不要ですが、CORS、コーデック、DRM、自動再生制限の影響を受けます。

| Edition | Platform | Official source |
| --- | --- | --- |
| Web Online | Browser | [Open Web player](https://trisanghy.github.io/open-iptv-pro/) |
| Electron Desktop | Windows/macOS | [Latest release](https://github.com/trisanghy/open-iptv-pro/releases/latest) |
| Rust Lab Beta | Windows/macOS (depending on release) | [Rust Lab releases](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab) |
| Mobile Capacitor Beta | Android 7+ debug APK / iOS 15+ unsigned IPA | [Mobile v4.23.17-mobile.10](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10) |

## 主な機能

- M3U ファイルや許可された URL を読み込み、グループ・検索・お気に入りを管理。
- 重複チャンネルの統合と実際に異なる予備ストリーム URL の保持。
- 一致する XMLTV データがあれば EPG 番組情報を表示。
- 音量、フルスクリーン、PiP を操作。AirPlay/Cast は対応機器が必要。
- デスクトップ版の一部で録画、タイムシフト、字幕、翻訳、TTS に対応。
- ローカル設定・バックアップ、環境に応じた Web クラウド同期。

## 使い始める

1. Web プレーヤーを開くか、OS と CPU に合うインストーラーを選択。
2. 権利に関する注意を確認し、利用許可のある M3U を追加。
3. グループ、検索、お気に入り、最近見たチャンネルから選択。
4. 必要に応じて EPG、テーマ、予備リンクを設定。
5. 更新や端末変更の前にデータをバックアップ。

## ダウンロード

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in 日本語](https://trisanghy.github.io/?lang=ja)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## 画面一覧

最新の Web 画面を Desktop・iOS 風・Android 風で合計12枚掲載。動画はローカルで作成したデモです。

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## 互換性と問題解決

再生不可は CORS、認証、HTTPS、DRM、コーデック、サーバー制限などが原因の場合があります。Web で再生できなくても配信終了とは限りません。iOS/Android 画像はブラウザ上の端末エミュレーションです。

## ソースから実行

Electron の実行には Node.js 22+ が必要です。`npm install --no-audit --no-fund`、`npm test`、`npm start` を実行。詳細はベトナム語の完全版を参照してください。

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## 著作権と免責

本プロジェクトはプレーヤーのみを提供し、コンテンツや視聴権を提供しません。プレイリスト、番組表、録画、認証情報の合法性と管理は利用者の責任です。ソフトウェアは適用法が許す範囲で現状のまま提供されます。

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## サポートとソースコード

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=ja)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
