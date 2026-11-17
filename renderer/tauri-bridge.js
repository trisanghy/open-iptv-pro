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
    captionStatus: 'caption:status', captionStart: 'caption:start',
    captionStop: 'caption:stop', captionChooseFile: 'caption:chooseFile',
    captionAutoInstall: 'caption:install',
    captionTranslationStatus: 'caption:translationStatus', captionTranslationInstall: 'caption:translationInstall',
    captionTestTranslation: 'caption:testTranslation', aiStorageStatus: 'ai:storage', aiRemoveModel: 'ai:removeModel',
    aiModelStatus: 'ai:modelStatus', aiInstallModel: 'ai:installModel',
    ttsStatus: 'tts:status', ttsInstall: 'tts:install',
    ttsVoiceStatus: 'tts:voiceStatus', ttsVoiceInstall: 'tts:voiceInstall', ttsPrewarm: 'tts:prewarm',
    ttsSynthesize: 'tts:synthesize', ttsStop: 'tts:stop',
    pipOpen: 'pip:open', pipClose: 'pip:close',
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
  // Tauri 2 native event subscriptions; compatible with Electron's onEvent API.
  // Return an immediate unsubscribe closure even though listen() is asynchronous.
  const onNative = (eventName, callback) => {
    if (typeof callback !== 'function') return () => {};
    const eventApi = window.__TAURI__?.event;
    if (typeof eventApi?.listen !== 'function') return () => {};
    let disposed = false, unlisten;
    Promise.resolve(eventApi.listen(eventName, event => {
      if (!disposed) callback(event?.payload ?? event);
    })).then(stop => { unlisten = stop; if (disposed) stop(); })
      .catch(err => console.warn('Tauri AI event:', err));
    return () => {disposed = true; if (unlisten) unlisten();};
  };
  api.captionOnEvent = cb => onNative('caption:event', cb);
  api.ttsOnEvent = cb => onNative('tts:event', cb);
  api.aiOnEvent = cb => onNative('ai:event', cb);
  window.streamleaf = Object.freeze(api);
  document.documentElement.dataset.desktopRuntime = 'tauri2-rust';
})();
