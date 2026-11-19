'use strict';
/* Web-only last-channel resume. Start the selected stream as soon as the page
 * is ready. Autoplay policy handling belongs to web-autoplay.js, which tries
 * audible playback and retries muted playback for both native HLS and MSE.
 * Never insert a permission banner or cover the player with a second button. */
(() => {
  if (window.streamleaf) return;
  const $ = id => document.getElementById(id);
  const app = window.IPTVState;
  const video = $('video');
  const toggle = $('webAutoResumeLast');
  const hint = $('webAutoResumeHint');
  const audioToggle = $('webAutoEnableAudio');
  const audioHint = $('webAutoAudioHint');
  if (!app || !video || !toggle || !audioToggle) return;
  const store = app.getStore?.();
  if (!store || typeof store !== 'object') return;

  const enabled = () => store.autoResumeLastChannel !== false;
  const audioEnabled = () => store.autoEnableAudio !== false;
  const explain = message => {
    if (hint) hint.textContent = message || (enabled()
      ? 'Tự mở kênh gần nhất khi truy cập trang.'
      : 'Đã tắt. Lần mở website sau sẽ không tự phát kênh.');
  };
  const explainAudio = message => {
    if (audioHint) audioHint.textContent = message || (audioEnabled()
      ? 'Ưu tiên phát có tiếng; nếu trình duyệt chặn, tự phát tắt tiếng. Dùng nút loa trên trình phát để bật tiếng.'
      : 'Kênh bắt đầu ở chế độ tắt tiếng; có thể bật lại bằng nút loa.');
  };
  toggle.checked = enabled();
  audioToggle.checked = audioEnabled();
  explain(); explainAudio();

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
    }
  });

  const savedId = typeof store.current === 'string' ? store.current : '';
  let started = false;
  const resume = () => {
    if (!enabled() || started || app.getCurrent?.()) return;
    const available = app.getChannels?.() || [];
    const lastId = available.some(ch => ch.id === savedId) ? savedId : (available[0]?.id || '');
    if (!lastId) return;
    started = true;
    video.defaultMuted = !audioEnabled();
    video.muted = !audioEnabled();
    video.preload = 'auto';
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    // playChannel() invokes web-autoplay.js on manifest-ready/native URL.
    // Deliberately do not call video.play() here a second time.
    Promise.resolve(app.playChannel(lastId)).catch(() => {
      const status = $('streamInfo');
      if (status) status.textContent = 'Không mở được kênh gần nhất. Hãy chọn kênh khác.';
    });
  };
  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', resume, {once:true});
  else window.setTimeout(resume, 0);
})();
