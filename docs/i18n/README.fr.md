# Open IPTV Pro — Guide en français

[Tiếng Việt](../../README.md) · [English](../../docs/i18n/README.en.md) · [简体中文](../../docs/i18n/README.zh.md) · [日本語](../../docs/i18n/README.ja.md) · [한국어](../../docs/i18n/README.ko.md) · **Français** · [Deutsch](../../docs/i18n/README.de.md) · [Español](../../docs/i18n/README.es.md) · [Português](../../docs/i18n/README.pt.md) · [ไทย](../../docs/i18n/README.th.md) · [Bahasa Indonesia](../../docs/i18n/README.id.md) · [Русский](../../docs/i18n/README.ru.md)

> International quick-start summary. The Vietnamese README is the complete technical reference; check current GitHub Releases for exact versions and capabilities.

> **Bêta Mobile (Android/iOS) :** l’édition Capacitor est indépendante d’Electron et Rust Lab et n’offre pas les mêmes fonctions. L’APK Android est signé en mode debug pour les essais. L’IPA iOS n’est pas signée : certificat Apple et provisioning valides sont indispensables pour l’installation.

## Présentation

Open IPTV Pro est un lecteur IPTV et gestionnaire de playlists open source, développé à titre personnel pour le Web, Windows et macOS. Les fichiers M3U et données EPG doivent être fournis par l'utilisateur avec les droits nécessaires. Aucun abonnement ni chaîne n'est inclus.

Open IPTV Pro propose des éditions indépendantes pour le Web, Windows/macOS et Android/iOS, sans chaînes ni abonnements fournis.

## Versions et plateformes

Electron Desktop est l'édition stable et complète. Rust Lab est une bêta Tauri/Rust distincte. Web Online fonctionne sans installation, sous réserve des limites CORS, codecs, DRM et lecture automatique du navigateur.

- **Web Online — Navigateur :** [Ouvrir le lecteur](https://trisanghy.github.io/open-iptv-pro/), sans installation, avec limites CORS, codecs et DRM.
- **Electron Desktop — Windows/macOS :** [Installateurs officiels](https://github.com/trisanghy/open-iptv-pro/releases/latest).
- **Rust Lab Bêta — Windows/macOS :** [Versions indépendantes](https://github.com/trisanghy/open-iptv-pro/releases?q=rust-lab).
- **Mobile Capacitor Bêta — Android/iOS :** [APK debug / IPA non signée](https://github.com/trisanghy/open-iptv-pro/releases/tag/mobile/v4.23.17.10), [code source mobile](../../mobile/) et [guide d’installation](../MOBILE_ANDROID_IOS.md).

## Fonctionnalités

- Importer des fichiers M3U ou des URL autorisées, organiser les groupes, rechercher et enregistrer les favoris.
- Fusionner les chaînes identiques et conserver les véritables URL de secours différentes.
- Afficher les programmes EPG lorsqu'une source XMLTV correspond aux chaînes.
- Gérer le volume, le plein écran et le PiP ; AirPlay/Cast dépendent des appareils compatibles.
- Certaines versions Desktop disposent d'enregistrement, timeshift, sous-titres, traduction et TTS.
- Conserver les réglages locaux, exporter des sauvegardes et synchroniser le Web si le cloud est configuré.

## Premiers pas

1. Ouvrez le lecteur Web ou téléchargez la version adaptée au système et au processeur.
2. Lisez les conditions et importez uniquement une liste M3U que vous êtes autorisé à utiliser.
3. Choisissez une chaîne par groupe, recherche, favoris ou historique.
4. Ajoutez si besoin une source EPG, un thème et des liens alternatifs.
5. Sauvegardez vos données avant toute mise à jour ou migration.

## Téléchargements

- [Open IPTV Pro Web](https://trisanghy.github.io/open-iptv-pro/)
- [Windows/macOS installers and checksums](https://github.com/trisanghy/open-iptv-pro/releases/latest)
- [Current project homepage in Français](https://trisanghy.github.io/?lang=fr)
- [Electron installation guide](https://github.com/trisanghy/open-iptv-pro/blob/main/docs/INSTALL_V4_23_70.md)

## Captures d'écran

La galerie comporte 12 captures de la version Web : ordinateur et émulations iOS/Android, avec une vidéo de démonstration locale.

[Open all 12 desktop/iOS/Android Web screenshots](https://github.com/trisanghy/open-iptv-pro/tree/main/docs/images/web-gallery).

## Compatibilité et dépannage

Les échecs de lecture peuvent provenir de CORS, de l'authentification, de HTTPS, du DRM, des codecs ou du serveur. Un échec Web ne signifie pas nécessairement que le flux est hors ligne. Les captures iOS/Android sont des émulations de navigateur.

## Exécuter depuis le code

Pour exécuter Electron depuis le code source (Node.js 22+) : `npm install --no-audit --no-fund`, `npm test`, puis `npm start`. Consultez le README vietnamien complet pour les détails.

- [Electron source / README](https://github.com/trisanghy/open-iptv-pro)
- [Web Online branch](https://github.com/trisanghy/open-iptv-pro/tree/web/online)
- [Rust Lab source](https://github.com/trisanghy/open-iptv-pro/tree/experiment/rust-tauri-v2)

## Droits d'auteur et avertissement

L'auteur fournit uniquement le logiciel, sans contenus, abonnements ni droits de diffusion. Vous devez disposer des autorisations nécessaires pour chaque chaîne, playlist, guide et enregistrement ; protégez vos données et sauvegardes. Logiciel fourni « EN L'ÉTAT », dans la limite du droit applicable.

**[Original copyright notice](https://github.com/trisanghy/open-iptv-pro/blob/main/COPYRIGHT_NOTICE_V4_23_70.md) · [MIT License](https://github.com/trisanghy/open-iptv-pro/blob/main/LICENSE) · [Third-party notices](https://github.com/trisanghy/open-iptv-pro/blob/main/THIRD_PARTY_NOTICES.md)**

## Aide et code source

[GitHub Issues](https://github.com/trisanghy/open-iptv-pro/issues) · [Full Vietnamese README](https://github.com/trisanghy/open-iptv-pro/blob/main/README.md) · [Project homepage](https://trisanghy.github.io/?lang=fr)

*This translated guide is informational; applicable law, the license, and the original copyright notice take precedence.*
