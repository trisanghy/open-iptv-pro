// v4.23.38 — intrinsic video aspect ratio, default 16:9.
// Reads dimensions reported by the actual HTMLVideoElement, including HLS/DASH
// and FFmpeg-backed HLS; does not assume the playlist/channel name is 16:9.
(() => {
  'use strict';
  const video = document.getElementById('video');
  const stage = document.getElementById('playerBox');
  const label = document.getElementById('videoSourceRatio');
  if (!video || !stage) return;

  const DEFAULT_WIDTH = 16;
  const DEFAULT_HEIGHT = 9;
  function normalizedDimensions(width, height) {
    const w = Number(width), h = Number(height);
    if (!Number.isFinite(w) || !Number.isFinite(h) || w < 1 || h < 1) {
      return [DEFAULT_WIDTH, DEFAULT_HEIGHT];
    }
    // Limit pathological metadata (e.g. malformed streams) without changing
    // valid 21:9, 9:16 and other common aspect ratios.
    const ratio = w / h;
    if (ratio < 0.2 || ratio > 5) return [DEFAULT_WIDTH, DEFAULT_HEIGHT];
    return [w, h];
  }
  function ratioText(w, h) {
    const ratio = w / h;
    const known = [[16, 9], [4, 3], [3, 2], [21, 9], [1, 1], [9, 16], [3, 4]];
    for (const [a, b] of known) {
      if (Math.abs(ratio - a / b) < 0.014) return `${a}:${b}`;
    }
    return `${ratio.toFixed(2)}:1`;
  }
  function applyDimensions(width, height) {
    const [w, h] = normalizedDimensions(width, height);
    const factor = w / h;
    stage.style.setProperty('--iptv-video-ratio', `${w} / ${h}`);
    stage.style.setProperty('--iptv-video-ratio-number', factor.toFixed(6));
    const description = ratioText(w, h);
    stage.dataset.sourceAspectRatio = description;
    if (label) {
      label.textContent = description;
      label.title = `Tỷ lệ khung video từ nguồn phát: ${description}`;
    }
    return description;
  }
  function readVideoSize() {
    return applyDimensions(video.videoWidth, video.videoHeight);
  }
  function resetAspect() { return applyDimensions(DEFAULT_WIDTH, DEFAULT_HEIGHT); }
  for (const event of ['loadedmetadata', 'loadeddata', 'resize', 'canplay']) {
    video.addEventListener(event, readVideoSize);
  }
  for (const event of ['emptied', 'loadstart']) {
    video.addEventListener(event, resetAspect);
  }
  // After a channel switch to an audio-only stream, fall back to 16:9.
  video.addEventListener('error', resetAspect);
  resetAspect();
  // Lightweight test interface; never controls playback or stores preferences.
  window.OpenIPTVVideoAspect = Object.freeze({ applyDimensions, readVideoSize, resetAspect });
})();
