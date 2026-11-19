# Rust Lab v23.8.60 — Web-style channel picker under Quick Tools

- Added a fully interactive **Chọn kênh** panel directly under **Công cụ nhanh**, matching the shared Web layout: All / Favorites / Recently Watched, top channel-group chips, text search, group filter, sorting, 10-channel pagination and grid/list switch.
- Added companion quick-access cards for Favorites and Recently Watched with direct channel selection and See All actions. Both read the existing store using OpenIPTVFavorites and OpenIPTVRecentChannels APIs; disabled sources remain excluded.
- All play actions route through the existing IPTVState.playChannel with its parental permission checks and stream validation. No duplicate player, playlist, or recent-history database.
- Browser settings (tab, sort, grid/list) persist locally. Channel/group names from M3U are displayed as text and protected from UI translation. Remote logos are constrained to HTTP(S) image URLs.
- Added offline UI translations for 16 non-Vietnamese locales, using the existing i18n engine; the native names of user channels and source groups remain unchanged.
- Scoped CSS and container queries support compact Mac windows, showing side cards below the main browser when space is limited. Existing sidebar panel and themed channel sections are not removed.
- Added regression tests for filtering, pagination with 1,184 channels, recent ordering, favorite/source isolation, actual button wiring, save/restore of view preferences, script order and the screenshot's placement.

No changes to Electron/Web/Mobile/main, native PiP, CC, TTS, or source contents.
