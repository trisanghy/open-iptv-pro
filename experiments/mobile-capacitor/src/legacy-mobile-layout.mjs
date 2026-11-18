// Presentation-only layout restoring the original Open IPTV Pro v4.23-style mobile navigation.
// Source behavior stays in main.js; no bundled copyrighted IPTV catalog or stream.
export function oldStyleLayout(appIcon){
  return `
  <header class="mobile-topbar">
    <img src="${appIcon}" alt="Open IPTV Pro" class="brand-logo"/>
    <div class="brand-copy"><strong>Open IPTV Pro</strong><small>Mobile · Android / iOS</small></div>
    <button type="button" id="settingsBtn" aria-label="Cài đặt">⚙</button>
  </header>
  <main class="mobile-main">
    <section class="page active" id="page-tv">
      <div class="hero-player"><div class="hero-placeholder">
        <div class="hero-play">▶</div><strong id="heroTitle">Chưa chọn kênh</strong>
        <span id="heroSubtitle">Nhập M3U hoặc chọn kênh để xem</span>
      </div></div>
      <div class="now-playing"><div class="now-copy">
        <strong id="nowTitle">Chưa chọn kênh</strong><span id="nowGroup">Chọn một kênh trong danh sách</span>
      </div><button id="nowFavorite" type="button" aria-label="Lưu yêu thích">☆</button></div>
      <div class="playback-actions">
        <button id="previousChannel" aria-label="Kênh trước">⏮</button>
        <button id="playCurrent" class="primary-play" aria-label="Phát kênh">▶</button>
        <button id="nextChannel" aria-label="Kênh sau">⏭</button>
        <button id="fullScreenCurrent" aria-label="Toàn màn hình">⛶</button>
        <button id="pictureInPicture" aria-label="Picture in Picture">▣</button>
      </div>
      <div class="search-row"><input id="search" type="search" placeholder="Tìm kênh, nhóm…"/><button id="quickFavorite">☆ Yêu thích</button></div>
      <div class="channel-summary"><span id="count">0 / 0 kênh</span><div><button id="expandFolders">Mở hết</button><button id="collapseFolders">Gập hết</button></div></div>
      <div id="channelList" class="folders-list"></div>
    </section>
    <section class="page" id="page-fav"><h2>★ Kênh yêu thích</h2><div id="favoritesList"></div></section>
    <section class="page" id="page-sources"><h2>Thêm nguồn M3U</h2>
      <div class="add-row"><input type="url" id="newSource" placeholder="https://…/playlist.m3u"/><button id="pasteM3U" type="button" aria-label="Dán link M3U">Dán</button><button id="addURL">+ Thêm</button></div>
      <div class="add-row"><label class="file-label">📁 Mở tệp M3U<input type="file" id="file" accept=".m3u,.m3u8,text/plain"/></label><button id="refresh">↻ Làm mới</button></div>
      <p class="muted">Chỉ sử dụng nguồn IPTV mà bạn có quyền truy cập hợp pháp.</p><div id="sources"></div>
    </section>
    <section class="page" id="page-epg"><h2>Lịch phát sóng EPG</h2><input id="epgURL" placeholder="https://…/guide.xml"/><input id="epgChannel" placeholder="tvg-id (để trống = tất cả)"/><button id="loadEPG">Tải lịch phát sóng</button><div id="epgResults"></div></section>
    <section class="page" id="page-multi"><h2>MultiView 4 kênh</h2><p class="muted">Thử nghiệm qua WebView/HLS. Phụ thuộc codec và CORS của nguồn.</p><div class="add-row"><button id="startMulti">Tạo 4 khung</button><button id="stopMulti">Dừng tất cả</button></div><div id="multiGrid"></div></section>
    <section class="page" id="page-tools"><h2>Công cụ & cài đặt</h2><p class="muted">Kiểm tra theo lô 1.000 kênh. HTTP không chứng minh video phát được.</p>
      <div class="add-row"><label>Luồng <select id="threadCount"><option>8</option><option selected>16</option><option>32</option></select></label><button id="checkBtn">✓ Kiểm tra kênh</button></div>
      <button id="exportBtn">⇩ Xuất M3U</button><h2>Link dự phòng</h2>
      <input id="fallbackSource" placeholder="URL gốc kênh"/><input id="fallbackURL" placeholder="URL dự phòng"/><button id="saveFallback">Lưu dự phòng</button>
      <h2>Snapshot / Timeshift</h2><p class="muted">Snapshot native và Timeshift ghi đệm chưa có trên mobile.</p><button id="snapshot">Thử chụp Snapshot</button>
      <h2>Chiếu lên TV</h2><p class="muted">AirPlay/Chromecast phụ thuộc plugin và thiết bị.</p>
    </section>
  </main>
  <nav class="bottom-navigation" aria-label="Điều hướng">
    <button class="tab active" data-page="tv"><span>▶</span>Xem TV</button>
    <button class="tab" data-page="fav"><span>★</span>Yêu thích <small id="favCount">0</small></button>
    <button class="tab" data-page="sources"><span>▤</span>Nguồn <small id="sourceCount">0</small></button>
    <button class="tab" data-page="epg"><span>▦</span>EPG</button>
    <button class="tab" data-page="multi"><span>⊞</span>4 kênh</button>
  </nav>
  <section id="webPlayer" hidden><b id="webTitle"></b><video playsinline controls id="webVideo"></video><button id="closePlayer">Đóng trình phát</button></section>
  <footer id="status" role="status" aria-live="polite" hidden>Sẵn sàng</footer>
  `;
}
