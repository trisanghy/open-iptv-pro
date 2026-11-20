'use strict';
/* Inline unified Live AI controls: keep original elements and their listeners. */
(() => {
  function initialize() {
    const row = document.getElementById('captionThirdRow');
    if (!row || row.dataset.unifiedAiReady) return;
    row.dataset.unifiedAiReady = 'true';
    row.classList.add('unified-ai-row');
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.id = 'unifiedAiToggle';
    trigger.className = 'unified-ai-toggle';
    trigger.setAttribute('aria-controls', 'unifiedAiContent');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = '<span class="unified-ai-mark" aria-hidden="true">CC</span><span>Phụ đề · Dịch · Giọng nói</span><span class="unified-ai-arrow" aria-hidden="true">⌄</span>';
    const content = document.createElement('div');
    content.id = 'unifiedAiContent';
    content.className = 'unified-ai-content';
    content.hidden = true;
    // Reparent, never clone: all original event handlers and saved values survive.
    while (row.firstChild) content.appendChild(row.firstChild);
    row.append(trigger, content);
    function setOpen(open) {
      content.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      row.classList.toggle('unified-ai-open', open);
    }
    trigger.addEventListener('click', () => setOpen(content.hidden));
    // The old "Công cụ" dropdown is removed from the layout, not its actions.
    const extra = document.getElementById('playbackExtra');
    if (extra) {
      const actions = extra.querySelector('.playback-extra-inner');
      if (actions) {
        actions.classList.add('unified-ai-tools');
        content.appendChild(actions);
      }
      extra.hidden = true;
    }
    const panelId = document.getElementById('subtitleOptionsPanel')
      ? 'subtitleOptionsPanel' : 'rustSubtitleOptionsPanel';
    const attachCC = () => {
      const panel = document.getElementById(panelId);
      if (!panel || content.contains(panel)) return !!panel;
      panel.classList.add('unified-inline-cc');
      panel.removeAttribute('role');
      content.appendChild(panel);
      return true;
    };
    if (!attachCC()) {
      const observer = new MutationObserver(() => {
        if (attachCC()) observer.disconnect();
      });
      observer.observe(document.body, {childList: true, subtree: true});
    }
    // Hide the visual CC/gear popup frame; keep both native actions accessible.
    const existingCC = document.getElementById('subtitleOptionsBtn')
      || document.getElementById('rustSubtitleOptionsButton');
    if (existingCC) existingCC.setAttribute('title', 'Tuỳ chỉnh phụ đề (CC)');
    setOpen(false);
  }
  // Rust modules load asynchronously from app-entry; attach after all modules finish.
  document.addEventListener('openiptv:renderer-ready', initialize, {once:true});
})();