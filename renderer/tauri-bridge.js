'use strict';
/* Electron preload compatibility shim. All native operations are performed in Rust.
   It is deliberately loaded before all existing renderer scripts. */
(() => {
  if (!window.__TAURI__?.core?.invoke) {
    // No mock desktop capabilities in browser-only mode.
    return;
  }
  const invoke = (op, ...args) => window.__TAURI__.core.invoke('bridge', { op, args });
  const commands = {
    castDiscover: 'cast:discover', airplayDiscover: 'airplay:discover',
    castPlay: 'cast:play', castStop: 'cast:stop', castStatus: 'cast:status',
    castLan: 'cast:lan', openAirplay: 'airplay:open', capabilities: 'app:capabilities',
    startTimeshift: 'timeshift:start', stopTimeshift: 'timeshift:stop', timeshiftStatus: 'timeshift:status',
    notifyReminder: 'reminder:notify', fetchEPG: 'epg:fetch', importEPGFile: 'epg:importFile',
    dvrList: 'dvr:list', dvrCreate: 'dvr:create', dvrStop: 'dvr:stop',
    dvrChooseDirectory: 'dvr:chooseDirectory', dvrOpenDirectory: 'dvr:openDirectory', dvrReveal: 'dvr:reveal',
    checkUpdate: 'update:check', updateStatus: 'update:status',
    downloadUpdate: 'update:download', installUpdate: 'update:install',
    openDownloadedUpdate: 'update:openDownloaded', openRelease: 'update:openRelease', openReleases: 'update:openReleases',
    backupExport: 'backup:export', backupInspect: 'backup:inspect', backupRestore: 'backup:restore', backupFinish: 'backup:finish',
    openM3U: 'source:readFile', loadURL: 'source:readUrl', proxy: 'media:proxy', mediaKind: 'media:kind', compatStart: 'media:compatStart', compatStop: 'media:compatStop',
    check: 'link:check', snapshot: 'snapshot:make', snapshotDelete: 'snapshot:delete', export: 'file:export',
    storeRead: 'storage:read', storeWrite: 'storage:write',
    smartCountries: 'smart:countries', smartCountry: 'smart:country', smartCatalogOptions: 'smart:catalog-options',
    smartLoad: 'smart:load', smartCheck: 'smart:check', listRepoPlaylists: 'source:listRepo', vlcWebsite: 'system:openVLC'
  };
  const api = {};
  for (const [name, op] of Object.entries(commands)) api[name] = (...args) => invoke(op, ...args);
  api.onUpdateStatus = cb => { // Rust Lab intentionally disables updates from the stable Electron releases.
    if(typeof cb === 'function') queueMicrotask(() => api.updateStatus().then(cb).catch(() => {}));
    return () => {};
  };
  window.streamleaf = Object.freeze(api);
  document.documentElement.dataset.desktopRuntime = 'tauri2-rust';
})();
