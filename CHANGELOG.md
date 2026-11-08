## 4.21.0 – M3U URL Editor + Cast/AirPlay (Desktop Full)

- Sửa URL nguồn M3U đã lưu, giữ danh tính nguồn, kênh khớp, thư mục và Yêu thích; thay thế chỉ sau tải và kiểm tra thành công.
- Tìm Google Cast qua mDNS, gửi kênh lên Chromecast/Google TV bằng Default Media Receiver.
- Máy chủ relay LAN tạm thời kèm liên kết ký HMAC cho manifest HLS và segment, không dùng proxy 127.0.0.1 trên TV.
- AirPlay dùng trình phát Safari trên macOS; hỗ trợ link LAN cho trình duyệt TV.
- FFmpeg nhúng, Timeshift, Snapshot, MultiView, Doctor và 8 ngôn ngữ được giữ nguyên.
- Source code tests + simulated UI tests; chưa thử trên thiết bị TV thật.

---

## v4.20.0 — Fix GitHub updater, keep full FFmpeg and Timeshift (2026-11-08)
- Báo rõ khi GitHub chỉ có commit mã nguồn, chưa có Release hoặc chưa có bộ cài đúng kiến trúc.
- Thiếu SHA256SUMS.txt/digest thì không tự tải bộ cài chưa được xác minh.
- Electron autoUpdater thất bại sẽ chuyển sang tải bộ cài đã kiểm tra SHA256 nếu Release có checksum.
- GitHub Actions tạo Mac Intel + Apple Silicon trên máy build riêng, gộp manifest latest-mac.yml cho cả hai.
- Không bỏ chức năng, vẫn tích hợp FFmpeg, Timeshift, Snapshot 32 luồng, MultiView và 8 ngôn ngữ.

## v4.19.0 — Full UI (2026-11-08)

- Khôi phục FFmpeg nhúng trong bộ cài Mac/Windows (không yêu cầu cài riêng).
- Timeshift 5 phút, tự bật Timeshift, Snapshot hàng loạt tối đa 32 tác vụ, MultiView, EPG, Doctor 2.0, kiểm tra 32 luồng, Failover, PiP, Auto Update: giữ nguyên.
- Cải thiện giao diện: nhóm công cụ nhanh có thể mở rộng, đưa liên kết tới các mục kiểm tra/ảnh chụp/Timeshift vào Cài đặt, gộp báo cáo Doctor thành một hành động.
- Giữ sửa lỗi luồng video dài hơn 25 giây trong proxy từ v4.18.
- Khôi phục Windows Setup và Portable; macOS DMG/ZIP, Intel/Apple Silicon.

**English:** Bundled FFmpeg restored. No desktop feature removed; only UI organization is simplified.

# Changelog

## v4.18.0 — Lite builds, stable long-running streams, compact UI
- Removes bundled FFmpeg; FFmpeg-dependent timeshift/bulk captures remain available when installed externally.
- Targets architecture-specific macOS builds (ARM64 or Intel) and one Windows NSIS installer, retaining 8 Electron locales.
- Fixes upstream proxy aborting healthy long-running video streams after a 25-second handshake timeout. Bounds HLS manifests while reading.
- Caps HLS memory/buffers, video quality to player dimensions, and MultiView tile buffers. Caches short media-type probes; retries recoverable decoding faults once.
- Unifies Doctor reporting/actions, removes duplicate worker settings and the redundant player quick-action strip. No changes to Android/iOS.


## v4.17.0 — Smart IPTV Doctor 2.0, Freeze Monitor, Visual Snapshot Review
- On-device frozen-frame/black-screen warning for the playing channel.
- Snapshot perceptual hash comparisons with conservative, review-only duplicate suggestions.
- Evidence-based diagnostic recommendations with explicit confirmation and undo.
- Offline JSON reporting; 8-language support for newly added primary controls.
- Windows/macOS only; no Android/iOS changes.


## v4.16.0 — Thông báo, tải và cài bản cập nhật
- Kiểm tra GitHub Releases theo repository chính thức, tự thông báo khi mở ứng dụng nếu được bật.
- Tải bộ cài mới kèm tiến độ, xác minh SHA256 và chỉ cài khi người dùng xác nhận.
- Bản có chữ ký số và metadata hợp lệ dùng electron-updater; bản chưa ký hoặc portable mở bộ cài thủ công.
- Thêm GitHub Actions phát hành bộ cài, ZIP cập nhật Mac, latest.yml/latest-mac.yml và SHA256SUMS.txt.
- Không sửa Android/iOS, playlist, dữ liệu Snapshot hoặc Yêu thích.


## v4.14.0 — Flat icon + Android/iOS source
- Thay logo app desktop thành tam giác Play đặc, gradient xanh ngọc–xanh dương–tím trên nền trắng, không có chữ, không Liquid Glass.
- Bổ sung source app Android/iOS Capacitor 8 trong `mobile/`, giao diện cảm ứng riêng cùng parser M3U/EPG với desktop.
- Thêm scripts tạo Android debug APK, mở dự án iOS bằng Xcode, tạo icon native tự động.
- Không thay đổi cơ chế nguồn/yêu thích desktop từ v4.13. Các tính năng cần FFmpeg/Electron chưa port mobile.


## v4.13.0 — Đồng bộ Yêu thích và icon mới
- Tất cả các nút sao ở Xem TV, trình phát, Yêu thích và Snapshot dùng chung trạng thái theo danh tính kênh ổn định.
- Thao tác bật/tắt sao cập nhật ngay bộ đếm, danh sách lọc và khung đang phát; giữ vị trí cuộn khi đổi sao trong danh sách.
- Đồng bộ lựa chọn yêu thích vào hồ sơ đang hoạt động; làm mới hoặc đổi/xóa/bật/tắt nguồn tự cập nhật danh sách hiển thị.
- Snapshot có nút sao riêng; nhấn không tự mở kênh.
- Thiết kế lại icon Play cân đối, nền sáng và chuyển màu tím–xanh, xuất PNG/ICO/ICNS/SVG.


## v4.12.0 — 32 checks & 32 snapshots
- Tăng trần tác vụ kiểm tra link và FFmpeg Snapshot từ 16 lên 32; giữ mặc định 4 và lưu riêng từng cấu hình.
- Cập nhật cả hai hộp chọn nhanh và phần kiểm tra / sửa link dự phòng của playlist gộp.
- Không thay đổi chính sách bảo thủ Sống / Die / Chưa rõ và trạng thái Yêu thích.
- Bộ thử giả lập đo được 32 kiểm tra và 32 Snapshot chạy đồng thời; không đo trên nguồn mạng thực.

## v4.11.0 — Tùy chỉnh kiểm tra & Snapshot 1–16 luồng
- Hai tùy chọn tốc độ độc lập trong Cài đặt (1–16, mặc định 4), lưu với playlist/cấu hình đã có.
- Chọn nhanh và đồng bộ với Cài đặt tại Quản lý nguồn → Kiểm tra & sửa, và trang Snapshot.
- Kiểm tra toàn bộ kênh theo số luồng đã chọn; vẫn phân loại Sống/Die/Chưa rõ theo bằng chứng nhiều vòng.
- Kiểm tra & thay link dự phòng của playlist gộp cũng dùng mức song song 1–16.
- Chụp Snapshot nâng tối đa từ 8 lên 16 tiến trình FFmpeg; tiếp tục tách biệt hai tác vụ.
- Hiển thị mức song song trong bảng tiến độ; nút hủy và dữ liệu không thay đổi.
- Bổ sung kiểm thử giới hạn đồng thời (40 luồng mẫu, 2 lần chạy mỗi tác vụ) và trường hợp playlist gộp cũ thiếu `alternates`.

## v4.10.0 — Channel drag-and-drop and parallel fast Snapshot
- Thêm kéo thả kênh từ danh sách vào thư mục khác, kể cả thư mục gập/trống; giữ thứ tự thư mục, tùy chọn chuyển thủ công và dữ liệu nguồn.
- Chụp ảnh đồng thời 1/2/4/6/8 luồng FFmpeg, mặc định 4; lưu tùy chọn trong ứng dụng.
- Mặc định bỏ qua các kênh đã có snapshot, tránh chụp trùng URL; tùy chọn làm mới tất cả ảnh.
- Hạn chế thời gian chờ FFmpeg 12 giây/luồng, tăng tốc chuẩn bị ảnh thumbnail 384px, lưu từng lô và tối ưu danh sách ảnh lớn.
- Bổ sung bài thử GUI kéo thả, 4/2 worker song song, đồng bộ Cài đặt/Snapshot và bộ đếm khi bỏ qua ảnh.

## v4.9.0 — Favorites sync, conservative channel checking, refreshed logo
- Di chuyển dấu sao từ URL sang danh tính kênh, tự đồng bộ khi thêm, làm mới, tắt, xóa nguồn; giảm trùng khi cùng kênh ở nhiều nguồn.
- Sửa hồ sơ người lớn/trẻ em để giữ danh sách yêu thích riêng; tương thích dữ liệu từ các bản cũ.
- Giảm báo Die nhầm: thử lại không Range, thử 2 User-Agent; HLS kiểm tra segment mới, nhận diện MPEG-TS/fMP4; HTTP tạm thời thành Chưa rõ. Die chỉ khi URL luồng chính trả 404/410 nhiều vòng.
- Khi có bằng chứng phát video thực, cập nhật Sống và ghi nhận đúng link chính/dự phòng.
- Nâng cấp kết quả Die từ checker cũ thành Chưa rõ để kiểm tra lại, không xóa nguồn/ảnh/Yêu thích.
- Thay thiết kế icon, thêm SVG vector và các tài nguyên Mac/Windows.
- Thêm kiểm thử hồi quy danh sách Yêu thích, trạng thái nguồn, HLS và các lỗi máy chủ giả lập.


## v4.8.0 — Light / Dark / Auto appearance, consolidated link checks
- Thêm lựa chọn giao diện Sáng / Tối / Tự động theo chế độ macOS/Windows, cập nhật ngay khi hệ thống thay đổi và lưu thiết lập.
- Giữ bánh xe chọn màu/biểu tượng và mọi dữ liệu nguồn đã lưu.
- Bỏ mục Kiểm tra link riêng ở thanh bên, thêm nút Kiểm tra toàn bộ kênh ở Quản lý nguồn → Kiểm tra & sửa, dùng lại bộ kiểm tra nhiều vòng và tiến độ theo thời gian thực.
- Lối tắt kiểm tra ở trang TV và Smart IPTV Doctor dẫn về Quản lý nguồn.
- Thêm bài kiểm thử UI cho 3 chế độ giao diện, tự đổi theo hệ thống và đường kiểm tra mới.


## v4.7.0 — Nguồn hợp nhất & icon sáng
- Gộp **toàn bộ** workflow Thu thập → Gộp kênh → Kiểm tra/sửa → Xuất/Hoàn tác vào trang Quản lý nguồn.
- Xóa menu Thu thập & sửa kênh riêng; loại bỏ nút gộp trùng lặp.
- Thêm thanh điều hướng nhanh giữa các phần của Quản lý nguồn.
- Làm mới icon ứng dụng sang nền sáng, Play đa sắc kiểu Material, cân đối và rõ ở kích thước nhỏ.


## v4.6.0 — Default Timeshift, preview everywhere, source management merge
- Add a persistent opt-in setting to auto-enable the 5-minute local FFmpeg Timeshift after a LIVE channel begins playing. Keep the browser-only preview mode disabled; guard against duplicate starts and channel-switch races.
- Reuse one muted hover preview for TV, Favorites, Snapshot library, EPG guide/results and Channel Health table.
- Move the duplicate-channel merge workflow into Quản lý nguồn: source selection, dry-run analysis, explicit apply and local undo; retain public repository discovery and verified repair separately.
- Preserve original source-channel entries on undo, including when URL playlists were refreshed during merging.
- Add synthetic UI tests for these flows and update Vietnamese/English usage guides and screenshots.

## v4.5.0 — Read-only playlist discovery & repair
- Removed GitHub/Gist upload UI, token form, publish IPC and upload scripts.
- Added read-only discovery of public `.m3u/.m3u8` files in a GitHub repository by URL.
- Added selected-source collection, safe merge, deduplication, fallback URLs, deep verification and backup promotion only on confirmed live status.
- Added cleaned verified-only M3U export, rollback, opt-in refresh every 60 minutes while application is running, and live reports.
- Original sources are retained and not overwritten by unverified candidates.


## v4.4.0 — MultiView, Timeshift, Failover, Smart EPG, Health, Profiles and Doctor
- Add four-tile Multiview with muted background audio and hover-to-unmute one tile.
- Add opt-in FFmpeg local rolling 5-minute HLS Timeshift buffer and seek controls.
- Add manual/duplicate-name failover, stream startup timeout and stall detection, configurable HLS buffering.
- Add Smart EPG manual matching, offset, search and in-app reminders plus catch-up source template playback.
- Add silent hover previews, profile favorites, child-group restrictions with PBKDF2 PIN, and offline IPTV Doctor reports.
- Add tests for new functions, local MPEGTS FFmpeg buffer and advanced UI pages.


## v4.3.0 — Grouped snapshots and independent live tasks
- Snapshot library now follows the same custom/M3U folder order as the channel list, in a compact five-column layout on wide windows (responsive below 1200px).
- Stream checking and bulk snapshots now run concurrently, with separate progress, cancellation and counters.
- Realtime link-check results show each completed channel as **Sống**, **Die**, or **Chưa rõ**, including live totals; individual channel badges update immediately.
- A collapsible task monitor stays visible while navigating to other pages.
- Added synthetic-data GUI regression test for 5-column grouping and simultaneous check/snapshot workloads.

## v4.2.0 — Folder order, drag-drop, EPG matching and icon polish
- Giữ thứ tự thư mục theo thứ tự xuất hiện trong file M3U, không tự sort alphabet ngoài ý muốn.
- Khi đóng/mở thư mục trong danh sách kênh, giữ lại vị trí cuộn thay vì nhảy về đầu trang.
- Thêm kéo thả để sắp xếp lại thứ tự thư mục ở trang thư mục và ngay trong danh sách kênh.
- Cải thiện ghép EPG bằng `tvg-id`, tên kênh và alias trong XMLTV; ưu tiên ghép chính xác hơn cho kênh Việt Nam.
- Làm lại icon tam giác cân hơn; màu icon trong giao diện đổi theo màu theme đã chọn.

## v4.1.0 — EPG, PiP, theme wheel, release check
- Thêm lịch phát sóng XMLTV (đang phát / sắp phát), ghép theo `tvg-id`, nhóm tên hiển thị, nhiều nguồn EPG tùy chọn.
- Cài sẵn đường dẫn EPG công khai cho VN, Singapore, Thailand, UK; nguồn mặc định chỉ tải khi nhấn cập nhật.
- Thêm Picture-in-Picture (PiP), hỗ trợ tùy video/nền tảng.
- Thêm bánh xe màu và color picker; nhớ màu sau khi khởi động.
- Thêm kiểm tra cập nhật từ GitHub Releases trong Cài đặt; không cài hoặc cập nhật âm thầm.
- Bỏ hai badge “LIVE IPTV” và “Đang phát” phủ lên hình video.
- Tài liệu nguồn EPG, thử nghiệm XMLTV/gzip và release check; 5 test lõi mới.

## 4.0.0 — Source preview
- Rename StreamLeaf IPTV to Open IPTV Pro; use purple 3D play icon.
- Add M3U channel folder tree, custom folders and channel moves.
- Add attached thumbnail snapshots and desktop disk-based persistence.
- Add fit/fill/stretch/original video sizing and fullscreen safe-area CSS.
- Publish MIT source license, third-party notices, GitHub scripts, CI, docs.
