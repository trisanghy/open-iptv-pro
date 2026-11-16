'use strict';
/* Web-only last-channel resume. Try audible autoplay; never force mute.
 * When Chrome/Safari disallow autoplay with sound, require a user gesture.
 */
(() => {
  if (window.streamleaf) return;
  const $ = id => document.getElementById(id);
  const app = window.IPTVState;
  const video = $('video');
  const holder = $('playerBox');
  const toggle = $('webAutoResumeLast');
  const hint = $('webAutoResumeHint');
  const audioToggle = $('webAutoEnableAudio');
  const audioHint = $('webAutoAudioHint');
  if (!app || !video || !holder || !toggle || !audioToggle) return;
  const store = app.getStore?.();
  if (!store || typeof store !== 'object') return;

  const enabled = () => store.autoResumeLastChannel !== false;
  const audioEnabled = () => store.autoEnableAudio !== false;
  const explain = (message) => {
    if (hint) hint.textContent = message || (
      enabled()
        ? 'Mặc định bật. Thử tự phát có tiếng; Chrome/Safari có thể yêu cầu nhấn Phát có tiếng một lần.'
        : 'Đã tắt. Lần mở website sau sẽ không tự phát kênh.'
    );
  };
  const explainAudio = (message) => {
    if (audioHint) audioHint.textContent = message || (
      audioEnabled()
        ? 'Mặc định bật. Nếu trình duyệt chặn tự phát có tiếng, hãy nhấn “Phát có tiếng” một lần.'
        : 'Đã tắt. Kênh bắt đầu ở chế độ tắt tiếng; có thể bật lại bằng nút loa.'
    );
  };
  toggle.checked = enabled();
  audioToggle.checked = audioEnabled();
  explain();
  explainAudio();

  toggle.addEventListener('change', () => {
    const previous = store.autoResumeLastChannel;
    store.autoResumeLastChannel = !!toggle.checked;
    if (app.save?.() === false) {
      store.autoResumeLastChannel = previous;
      toggle.checked = enabled();
      explain('Không lưu được cài đặt, vui lòng kiểm tra dung lượng bộ nhớ trình duyệt.');
      return;
    }
    explain();
    if (!enabled()) dismissPrompt();
  });

  audioToggle.addEventListener('change', () => {
    const previous = store.autoEnableAudio;
    store.autoEnableAudio = !!audioToggle.checked;
    if (app.save?.() === false) {
      store.autoEnableAudio = previous;
      audioToggle.checked = audioEnabled();
      explainAudio('Không lưu được lựa chọn âm thanh. Vui lòng kiểm tra bộ nhớ trình duyệt.');
      return;
    }
    explainAudio();
    if (app.getCurrent?.()) {
      video.defaultMuted = !audioEnabled();
      video.muted = !audioEnabled();
      if (!audioEnabled() && panel) panel.hidden = true;
      if (audioEnabled() && started && video.paused && !dismissed)
        showPrompt('Trình duyệt yêu cầu nhấn Phát có tiếng để tiếp tục.');
    }
  });

  let started = false;
  let dismissed = false;
  let panel;
  let message;
  let action;
  const savedId = typeof store.current === 'string' ? store.current : '';
  const available = app.getChannels?.() || [];
  const lastId = available.some(ch=>ch.id===savedId) ? savedId : (available[0]?.id||'');
  const isLast = () => app.getCurrent?.()?.id === lastId;
  const hasSource = () => !!(video.currentSrc || video.getAttribute?.('src') || video.src);
  const hidePrompt = () => { if (panel) panel.hidden = true; };
  const dismissPrompt = () => {
    dismissed = true;
    hidePrompt();
  };
  if (!lastId) return;
  const showPrompt = (text) => {
    if (!started || dismissed || !enabled() || !isLast()) return;
    if (!video.paused && !video.muted) {hidePrompt();return;}
    message.textContent = text;
    action.textContent = !audioEnabled() ? 'Phát kênh' : video.muted ? 'Bật âm thanh' : 'Phát có tiếng';
    panel.hidden = false;
  };

  // Keep the audio-permission action inside video, not in the two-row toolbar.
  panel = document.createElement('div');
  panel.id = 'web-resume-panel';
  panel.className = 'web-resume-panel';
  panel.setAttribute('role','status');
  panel.setAttribute('aria-live','polite');
  panel.hidden = true;
  message = document.createElement('span');
  message.textContent = 'Nhấn để phát kênh đã xem với âm thanh';
  action = document.createElement('button');
  action.type = 'button';
  action.textContent = 'Phát có tiếng';
  panel.append(message,action);
  holder.append(panel);

  action.addEventListener('click', () => {
    if (!enabled() || !isLast()) { dismissPrompt(); return; }
    // Must run on the synchronous user-click stack to satisfy autoplay policy.
    video.defaultMuted = !audioEnabled();
    video.muted = !audioEnabled();
    video.autoplay = false;
    panel.hidden = true;
    if (!hasSource()) {
      // Stream may have failed to prepare. Retry the selected channel.
      Promise.resolve(app.playChannel(lastId)).catch(() => {
        showPrompt('Không nạp được kênh. Thử phát lại.');
      });
      return;
    }
    try {
      Promise.resolve(video.play()).then(() => {
        if (!video.paused && video.muted === !audioEnabled()) dismissPrompt();
        else showPrompt('Trình phát vẫn chưa phát có tiếng.');
      }, () => showPrompt(audioEnabled() ? 'Trình duyệt chưa cho phép phát có tiếng. Nhấn lại để thử.' : 'Trình duyệt chưa cho phép phát kênh. Nhấn lại để thử.'));
    } catch {
      showPrompt('Không phát được nguồn này. Nhấn lại để thử.');
    }
  });

  video.addEventListener('playing', () => {
    if (!started || dismissed || !isLast()) return;
    if (video.muted && audioEnabled()) showPrompt('Hình đang tự phát tắt tiếng. Nhấn Bật tiếng để nghe.');
    else hidePrompt();
  });
  video.addEventListener('volumechange', () => {
    if (started && isLast() && !video.muted && video.volume>0) hidePrompt();
  });
  document.addEventListener('openiptv:autoplay-muted',event=>{
    if (!started || dismissed || !enabled() || !audioEnabled() || !isLast())return;
    if (event?.detail?.channelId!==lastId)return;
    showPrompt('Video đã tự phát tắt tiếng. Nhấn Bật tiếng để nghe.');
  });
  document.addEventListener('openiptv:autoplay-blocked',event=>{
    if (!started || dismissed || !enabled() || !isLast())return;
    if (event?.detail?.channelId!==lastId)return;
    if (!video.paused){hidePrompt();return;}
    showPrompt(audioEnabled()?'Trình duyệt yêu cầu thao tác để phát có tiếng.':'Nhấn Phát kênh để tiếp tục.');
  });

  const resume = () => {
    if (!enabled() || started || app.getCurrent?.()) return;
    if (!app.getChannels?.().some(ch => ch.id === lastId)) return;
    started = true;
    // The desktop version is untouched; this is web-only behavior.
    video.defaultMuted = !audioEnabled();
    video.muted = !audioEnabled();
    video.autoplay = false;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    Promise.resolve(app.playChannel(lastId)).catch(() => {
      showPrompt('Không thể tự mở kênh trước đó. Nhấn để thử phát.');
    });
    // No speculative timeout: only report confirmed autoplay denials.
  };
  // DOMContentLoaded does not wait for thumbnails, ads or slow network assets.
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded',resume,{once:true});
  else window.setTimeout(resume,0);
})();