// Mobile player-first layout matched to Open IPTV Pro Web controls and bottom navigation.
export function oldStyleLayout(){
return `
<main class="mobile-main">
 <section class="page active" id="page-tv">
  <div class="hero-player" aria-label="Khu vực trình phát">
   <div class="hero-placeholder"><div class="hero-play">▶</div><strong id="heroTitle">Chưa chọn kênh</strong><span id="heroSubtitle">Nhập M3U hoặc chọn kênh để xem</span></div>
   <video id="webVideo" class="inline-video" playsinline webkit-playsinline x-webkit-airplay="allow" preload="none" aria-label="Video IPTV phát trong khung" hidden></video><button type="button" id="unmuteAutoplay" class="unmute-autoplay" hidden>🔊 Bật tiếng</button>
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
    <button id="muteCurrent" class="mobile-media-action" aria-label="Bật hoặc tắt âm thanh" type="button"><span class="media-icon" aria-hidden="true">🔊</span></button>
    <button id="castCurrent" class="mobile-media-action" aria-label="Cast / AirPlay lên TV" title="Cast / AirPlay" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="14" rx="2"/><path d="m12 14-6.5 7h13L12 14Z" fill="currentColor" stroke-width="1"/></svg></button>
    <button id="pictureInPicture" class="mobile-media-action" aria-label="Cửa sổ nổi PiP" title="PiP" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="3.5" width="19" height="17" rx="2"/><rect x="11.5" y="11.5" width="8" height="6.5" rx="1" fill="currentColor"/></svg></button>
    <button id="fullScreenCurrent" class="mobile-media-action" aria-label="Toàn màn hình" title="Toàn màn hình" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H5a1 1 0 0 0-1 1v3m12-4h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/></svg></button>
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
  <section class="recent-channels" id="recentChannelsSection" aria-label="Kênh vừa xem">
   <div class="recent-heading">
     <div class="recent-title"><span class="recent-clock" aria-hidden="true">◷</span><h2>Kênh vừa xem</h2><span id="recentCount" class="recent-count" aria-label="Số kênh vừa xem">0</span></div>
     <button type="button" id="clearRecent" aria-label="Xóa lịch sử xem" hidden>Xóa</button>
   </div>
   <div id="recentChannelList" class="recent-scroll" aria-live="polite"></div>
  </section>
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
  <p class="muted">Các nguồn XMLTV Việt Nam giống bản Web/Rust Lab; tải lần lượt nguồn hoạt động, giữ EPG cũ nếu nguồn lỗi.</p>
  <div id="epgSourcesList" class="epg-source-list"></div>
  <label class="epg-auto-label"><input type="checkbox" id="epgAutoRefresh" checked/> Tự cập nhật EPG khi khởi động</label>
  <div class="add-row epg-manual-row"><input id="epgURL" placeholder="https://…/guide.xml hoặc .gz"/><button id="addEPGSource" type="button">+ Nguồn</button></div>
  <input id="epgChannel" placeholder="tvg-id (tự chọn theo kênh đang xem)"/>
  <button id="loadEPG">↻ Tải EPG ngay</button><p id="epgStatus" class="muted" aria-live="polite">Chưa tải EPG</p>
  <div id="epgResults"></div>
 </section>
 <section class="page" id="page-multi"><h2>MultiView 4 kênh</h2><p class="muted">Bốn luồng HLS/WebView thử nghiệm; phụ thuộc codec và CORS.</p><div class="add-row"><button id="startMulti">Tạo 4 khung</button><button id="stopMulti">Dừng tất cả</button></div><div id="multiGrid"></div></section>
 <section class="page" id="page-tools"><h2>Công cụ & cài đặt</h2>
  <section class="mobile-language-card" aria-labelledby="mobileLanguageTitle">
    <h3 id="mobileLanguageTitle">🌐 Ngôn ngữ hiển thị</h3>
    <label for="appLanguage">Ngôn ngữ giao diện</label>
    <select id="appLanguage" aria-label="Ngôn ngữ giao diện"><option value="vi">Tiếng Việt</option></select>
    <p class="muted">Chọn ngôn ngữ ứng dụng. Thay đổi có hiệu lực ngay, không cần khởi động lại.</p>
  </section>
  <label class="epg-auto-label"><input type="checkbox" id="autoRefreshPlaylists" checked/> Tải lại tất cả danh sách M3U khi khởi động</label>
  <label class="epg-auto-label"><input type="checkbox" id="autoResumeLast" checked/> Tự phát kênh đã xem ở phiên trước</label>
  <label class="epg-auto-label auto-pip-setting"><input type="checkbox" id="autoPiPOnBackground"/>
   <span><strong>Tự động PiP khi rời ứng dụng</strong>
     <small>Đang phát TV: thu nhỏ thành cửa sổ nổi khi về màn hình chính; trở lại khung TV khi mở app.</small></span>
  </label>
  <p class="muted" id="autoPipSupportNote">Mặc định tắt. Android 8 trở lên hỗ trợ PiP tùy thiết bị; trên iPhone phụ thuộc iOS, nguồn phát và cài đặt PiP của hệ thống.</p>
  <p class="muted">iOS có thể tự phát tắt tiếng; nhấn Bật tiếng khi được yêu cầu.</p>
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
