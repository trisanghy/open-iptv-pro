# Open IPTV Pro — 中文使用指南

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · **简体中文** · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

## 项目简介

Open IPTV Pro 是适用于网页、Windows 和 macOS 的个人开源 IPTV 播放器及播放列表管理工具。频道与 M3U/EPG 数据须由用户自行提供并确认拥有合法使用权；本项目不提供电视套餐或频道。

## 版本与平台

Electron Desktop 是功能较完整的稳定版；Rust Lab 是独立的 Tauri/Rust 测试版。Web Online 无需安装，但受浏览器的 CORS、编解码器、DRM 与自动播放限制。

| Edition | Platform | Official source |
| --- | --- | --- |
| Web Online | Browser | [Open Web player](https://trisanghy.github.io/open-iptv-pro/) |
| Electron Desktop | Windows/macOS | [Latest release](https://github.com/trisanghy/open-iptv-pro/releases/latest) |
| Rust Lab Beta | Windows/macOS (depending on release) | [Rust Lab releases](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab) |

## 主要功能

- 导入 M3U 文件或授权的 URL，管理分组、搜索频道及收藏。
- 合并重复频道，保留真实且不同的备用播放地址。
- 支持匹配 XMLTV 数据时显示当前及后续 EPG 节目。
- 支持音量、全屏、画中画等操作；AirPlay/Cast 取决于设备兼容性。
- 部分桌面版本提供录制、时移、字幕、翻译及 TTS 等扩展功能。
- 支持本地设置和备份；配置云服务后网页版本可同步数据。

## 快速入门

1. 选择网页播放器或与电脑系统和处理器匹配的安装程序。
2. 阅读版权提示，导入您拥有使用权的 M3U 文件或链接。
3. 使用分组、搜索、收藏或最近观看选择频道。
4. 按需设置 EPG、外观和备用线路。
5. 更新或换机前请备份播放列表和设置。

## 软件下载

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in 简体中文](https://trisanghy.github.io/?lang=zh)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## 界面截图

图库包含 12 张新版 Web 截图，涵盖桌面、iOS 样式和 Android 样式模拟。演示视频在本地生成。

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## 兼容性与排错

若无法播放，请检查 CORS、服务器鉴权、HTTPS、DRM、编解码器和网络策略；浏览器错误并不一定表示流已经失效。iOS/Android 截图来自浏览器设备模拟，并非真机测试。

## 从源码运行

Electron 源码需要 Node.js 22+；可运行 `npm install --no-audit --no-fund`、`npm test` 和 `npm start`。详情请参阅越南语完整版及构建文档。

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## 版权和免责声明

软件作者仅提供播放工具，不提供内容、版权授权或订阅。用户须自行确保所有播放列表、频道、节目单和录制行为合法，并管理好账号和备份。软件按“现状”提供，责任限制以适用法律允许范围为准。

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## 支持与源代码

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=zh)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
