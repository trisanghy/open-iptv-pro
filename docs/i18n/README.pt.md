# Open IPTV Pro — Guia em português

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · [Français](../../docs/i18n/README.fr.md) · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · **Português** · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Mobile Beta (Android/iOS):** a edição Capacitor é desenvolvida separadamente de Electron e Rust Lab e não oferece os mesmos recursos. O APK Android tem assinatura de depuração para testes. O IPA para iOS não está assinado e exige certificados Apple e provisionamento válidos para instalar.

## Visão geral

Open IPTV Pro é um player IPTV e gerenciador de listas M3U de código aberto, desenvolvido como projeto pessoal para Web, Windows e macOS. O usuário fornece suas fontes M3U/EPG com os devidos direitos; o aplicativo não inclui canais ou assinaturas.

Open IPTV Pro oferece versões separadas para Web, Windows/macOS e Android/iOS e não inclui canais nem assinaturas.

## Edições e plataformas

Electron Desktop é a edição estável com mais recursos. Rust Lab é uma versão beta independente baseada em Tauri/Rust. Web Online não requer instalação, mas segue os limites de CORS, codecs, DRM e autoplay do navegador.

- **Web Online — Navegador:** [Abrir player](https://trisanghy.github.io/open-iptv-pro/), sem instalação; há limites de CORS, codecs e DRM.
- **Electron Desktop — Windows/macOS:** [Instaladores oficiais](https://github.com/trisanghy/open-iptv-pro/releases/latest).
- **Rust Lab Beta — Windows/macOS:** [Versões independentes](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab).
- **Mobile Capacitor Beta — Android/iOS:** [APK debug / IPA sem assinatura](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.16), [código-fonte móvel](../../mobile/) e [guia de instalação](../MOBILE_ANDROID_IOS.md).

## Recursos

- Importe arquivos M3U ou URLs autorizadas, organize grupos, pesquise e salve favoritos.
- Combine canais duplicados e mantenha links alternativos reais e distintos.
- Consulte a programação EPG quando os dados XMLTV correspondem aos canais.
- Controle volume, tela cheia e PiP; AirPlay/Cast dependem dos dispositivos.
- Algumas versões desktop oferecem gravação, timeshift, legendas, tradução e TTS.
- Salve configurações locais, faça backup e sincronize Web quando a nuvem estiver configurada.

## Primeiros passos

1. Abra o player Web ou baixe o instalador compatível com seu sistema e processador.
2. Leia o aviso de direitos e importe apenas listas M3U que você tenha autorização para usar.
3. Encontre canais por grupo, busca, favoritos ou histórico.
4. Configure EPG, tema e links alternativos quando necessário.
5. Faça backup antes de atualizar ou trocar de dispositivo.

## Downloads

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Português](https://trisanghy.github.io/?lang=pt)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Capturas de tela

A galeria inclui 12 imagens atuais da Web: desktop e emulações móveis iOS/Android com vídeo de demonstração local.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Compatibilidade e problemas

Falhas de reprodução podem resultar de CORS, autenticação, HTTPS, DRM, codecs ou políticas do servidor. Erro no navegador não significa necessariamente que o canal esteja offline. Imagens iOS/Android são de emulação de navegador.

## Executar do código-fonte

Para executar Electron do código-fonte (Node.js 22+): `npm install --no-audit --no-fund`, `npm test`, `npm start`. Veja o README vietnamita completo para detalhes.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Direitos e isenção

O autor fornece apenas software, não canais, assinaturas ou direitos de exibição. O usuário deve verificar a legalidade das fontes, dos guias, das gravações e manter seus dados protegidos. O software é fornecido 'NO ESTADO EM QUE SE ENCONTRA', conforme a lei aplicável.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Suporte e código-fonte

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=pt)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
