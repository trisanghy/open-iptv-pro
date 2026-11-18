// Mobile player-first layout matched to Open IPTV Pro Web controls and bottom navigation.
export function oldStyleLayout(){
return `
<main class="mobile-main">
 <section class="page active" id="page-tv">
  <div class="hero-player" aria-label="Khu vực trình phát">
   <div class="hero-placeholder"><div class="hero-play">▶</div><strong id="heroTitle">Chưa chọn kênh</strong><span id="heroSubtitle">Nhập M3U hoặc chọn kênh để xem</span></div>
   <video id="webVideo" class="inline-video" playsinline webkit-playsinline preload="none" aria-label="Video IPTV phát trong khung" hidden></video>
  </div>
  <section class="player-control-card" aria-label="Điều khiển và lịch phát">
   <div class="now-playing"><span class="now-channel-icon">TV</span><div class="now-copy"><strong id="nowTitle">Chưa chọn kênh</strong><span id="nowGroup">Chọn một kênh trong danh sách</span></div></div>
   <div class="playback-actions transport-controls" role="group" aria-label="Điều khiển media">
    <button id="previousChannel" aria-label="Kênh trước" type="button">⏮</button>
    <button id="playCurrent" class="primary-play" aria-label="Phát hoặc tạm dừng" type="button">▶</button>
    <button id="stopCurrent" aria-label="Dừng phát" type="button">■</button>
    <button id="nextChannel" aria-label="Kênh tiếp theo" type="button">⏭</button>
   </div>
   <div class="playback-actions output-controls" role="group" aria-label="Âm thanh và hiển thị">
    <button id="muteCurrent" aria-label="Tắt hoặc bật âm thanh" type="button">🔊</button>
    <button id="pictureInPicture" aria-label="Cửa sổ nổi PiP" type="button">▣</button>
    <button id="snapshotCurrent" aria-label="Ảnh chụp video" type="button">▤</button>
    <button id="fullScreenCurrent" aria-label="Toàn màn hình" type="button">⛶</button>
   </div>
   <div class="epg-current-card" id="epgCurrent" aria-label="Chương trình đang phát và tiếp theo">
    <div class="epg-current-item"><strong id="epgNowName">Chưa có lịch phát</strong><small id="epgNowTime">—</small></div>
    <div class="epg-next-item"><strong id="epgNextName">Chưa có chương trình tiếp theo</strong><small id="epgNextTime">—</small></div>
    <button id="openGuideBtn" aria-label="Xem lịch EPG" type="button">▤</button>
   </div>
   <div class="playback-settings">
    <label class="view-mode"><span>Khung hình</span><select id="videoFit" aria-label="Chế độ hiển thị video">
      <option value="contain">Vừa khung</option><option value="cover">Lấp đầy</option><option value="fill">Kéo giãn</option><option value="none">Gốc</option>
    </select></label>
    <button id="nowFavorite" class="favorite-current" type="button" aria-label="Yêu thích kênh">☆</button>
    <label class="manual-link-picker"><span>Link phát</span><select id="manualStreamSelect" aria-label="Chọn link phát chính hoặc dự phòng" disabled><option value="">Chưa chọn kênh</option></select></label>
   </div>
  </section>
  <div class="search-row"><input id="search" type="search" placeholder="Tìm kênh, nhóm…"/><button id="quickFavorite">☆ Yêu thích</button></div>
  <div class="channel-summary"><span id="count">0 / 0 kênh</span><div><button id="expandFolders">Mở hết</button><button id="collapseFolders">Gập hết</button></div></div>
  <div id="channelList" class="folders-list"></div>
 </section>
 <section class="page" id="page-fav"><h2>★ Kênh yêu thích</h2><div id="favoritesList"></div></section>
 <section class="page" id="page-sources"><h2>Thêm nguồn M3U</h2>
  <div class="add-row"><input type="url" id="newSource" placeholder="https://…/playlist.m3u"/><button id="pasteM3U" type="button">Dán</button><button id="addURL">+ Thêm</button></div>
  <div class="add-row"><label class="file-label">📁 Mở tệp M3U<input type="file" id="file" accept=".m3u,.m3u8,text/plain"/></label><button id="refresh">↻ Làm mới</button></div>
  <p class="muted">Chỉ nhập nguồn IPTV mà bạn có quyền sử dụng.</p><div id="sources"></div>
 </section>
 <section class="page" id="page-epg"><h2>Lịch phát sóng EPG</h2>
  <input id="epgURL" placeholder="https://…/guide.xml"/><input id="epgChannel" placeholder="tvg-id (tự chọn theo kênh đang xem)"/><button id="loadEPG">Tải lịch phát sóng</button><div id="epgResults"></div>
 </section>
 <section class="page" id="page-multi"><h2>MultiView 4 kênh</h2><p class="muted">Bốn luồng HLS/WebView thử nghiệm; phụ thuộc codec và CORS.</p><div class="add-row"><button id="startMulti">Tạo 4 khung</button><button id="stopMulti">Dừng tất cả</button></div><div id="multiGrid"></div></section>
 <section class="page" id="page-tools"><h2>Công cụ & cài đặt</h2>
  <p class="muted">Sức khỏe kênh chỉ là đánh giá dựa trên phản hồi HTTP và bằng chứng phát.</p>
  <div class="add-row"><label>Luồng <select id="threadCount"><option>8</option><option selected>16</option><option>32</option></select></label><button id="checkBtn">✓ Kiểm tra kênh</button></div>
  <button id="exportBtn">⇩ Xuất M3U</button>
  <h2>Link dự phòng</h2><input id="fallbackSource" placeholder="URL gốc kênh"/><input id="fallbackURL" placeholder="URL dự phòng"/><button id="saveFallback">Lưu dự phòng</button>
  <h2>Ảnh chụp và Timeshift</h2><p class="muted">Ảnh chụp native và ghi đệm Timeshift chưa có trên Mobile.</p><button id="snapshot">Thử ảnh chụp</button>
 </section>
</main>
<nav class="bottom-navigation" aria-label="Điều hướng chính">
  <button class="tab active" data-page="tv"><span>▣</span>TV</button>
  <button class="tab" data-page="fav"><span>☆</span>Yêu thích <small id="favCount">0</small></button>
  <button class="tab" data-page="epg"><span>▦</span>Lịch</button>
  <button class="tab" data-page="sources"><span>☷</span>Nguồn <small id="sourceCount">0</small></button>
  <button id="moreTrigger" type="button" aria-expanded="false" aria-controls="moreOverlay"><span>•••</span>Thêm</button>
</nav>
<div class="more-overlay" id="moreOverlay" hidden>
 <div class="more-backdrop" data-close-more="1"></div>
 <section class="more-panel" role="dialog" aria-modal="true" aria-labelledby="moreHeading">
  <div class="more-heading"><h2 id="moreHeading">Thêm tính năng</h2><button id="moreClose" aria-label="Đóng menu" type="button">×</button></div>
  <div class="more-grid">
   <button type="button" data-more="multiview"><span>▦</span>MultiView</button>
   <button type="button" data-more="snapshot"><span>▣</span>Ảnh chụp</button>
   <button type="button" data-more="folders"><span>▤</span>Thư mục</button>
   <button type="button" data-more="health"><span>♡</span>Sức khỏe kênh</button>
   <button type="button" data-more="doctor"><span>✚</span>IPTV Doctor</button>
   <button type="button" data-more="backup"><span>▥</span>Sao lưu / Khôi phục</button>
   <button type="button" data-more="file"><span>＋</span>Mở file M3U</button>
   <button type="button" data-more="url"><span>↗</span>Thêm URL</button>
   <button type="button" data-more="export"><span>⇩</span>Xuất M3U</button>
   <button type="button" data-more="settings"><span>⚙</span>Cài đặt</button>
   <button type="button" data-more="fallback"><span>⇄</span>Link dự phòng</button>
   <button type="button" data-more="terms"><span>ⓘ</span>Quyền sử dụng</button>
  </div>
 </section>
</div>

<footer id="status" role="status" aria-live="polite" hidden>Sẵn sàng</footer>
`;
}
