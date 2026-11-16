'use strict';
/* Web-only: each browser profile remembers its last selected IPTV channel. */
(() => {
  if (window.streamleaf) return;
  const app = window.IPTVState;
  const video = document.getElementById('video');
  const holder = document.getElementById('playerBox');
  if (!app || !video || !holder) return;
  const state = app.getStore?.();
  const id = typeof state?.current === 'string' ? state.current : '';
  if (!id) return;
  const channel = app.getChannels?.().find(ch => ch.id === id);
  if (!channel) return;

  let started = false;
  let dismissed = false;
  const panel = document.createElement('div');
  panel.id = 'web-resume-panel';
  panel.className = 'web-resume-panel';
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.hidden = true;
  const label = document.createElement('span');
  label.textContent = 'Đã mở lại kênh vừa xem';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Bật âm thanh';
  panel.append(label, button);
  holder.append(panel);

  const stillLast = () => app.getCurrent?.()?.id === id;
  const hide = () => { dismissed = true; panel.hidden = true; };
  const show = (message, action) => {
    if (dismissed || !stillLast()) return;
    label.textContent = message;
    button.textContent = action;
    panel.hidden = false;
  };
  button.addEventListener('click', () => {
    if (!stillLast()) { hide(); return; }
    video.defaultMuted = false;
    video.muted = false;
    panel.hidden = true;
    try {
      const promise = video.play();
      Promise.resolve(promise).then(hide, err => {
        show('Trình duyệt chưa cho phép phát kênh', 'Nhấn để phát');
        console.debug('Restore requires playback gesture', err?.name || 'unknown');
      });
    } catch (_) {
      show('Trình duyệt chưa cho phép phát kênh', 'Nhấn để phát');
    }
  });
  video.addEventListener('playing', () => {
    if (!started || dismissed) return;
    if (!stillLast()) { hide(); return; }
    if (video.muted) show('Đã tự phát kênh lần trước (đang tắt tiếng)', 'Bật âm thanh');
    else hide();
  });
  video.addEventListener('emptied', () => {
    if (started && !stillLast()) hide();
  });

  const start = () => {
    if (started || dismissed || app.getCurrent?.() || !app.getChannels?.().some(ch => ch.id === id)) return;
    started = true;
    video.defaultMuted = true;
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    Promise.resolve(app.playChannel(id)).catch(() => {
      show('Không thể tự phát kênh đã xem', 'Thử phát lại');
    });
    window.setTimeout(() => {
      if (dismissed || !stillLast()) return;
      if (video.paused) show('Nhấn để tiếp tục kênh đã xem', 'Phát kênh');
      else if (video.muted) show('Đã tự phát kênh lần trước (đang tắt tiếng)', 'Bật âm thanh');
    }, 6500);
  };
  if (document.readyState === 'complete') window.setTimeout(start, 0);
  else window.addEventListener('load', start, { once: true });
})();