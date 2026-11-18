# Open IPTV Pro v4.23.7 — Danh sách tính năng mã nguồn tổng hợp

**Đây là checklist tính năng trong mã nguồn, không phải chứng nhận tất cả đã chạy thành công trên Windows/macOS thực.**

- [x] Chromium/Electron desktop, theme sáng/tối/tự động, 8 ngôn ngữ
- [x] M3U/M3U8, sửa URL nguồn, nhập/xuất, gộp kênh, thư mục, yêu thích, kéo-thả
- [x] Smart IPTV Discovery: nguồn công khai theo quốc gia/thể loại/ngôn ngữ/toàn cầu, Free-TV; quét ALL hoặc tối đa 1000 kênh/lượt
- [x] Smart IPTV Doctor 3.0: chẩn đoán Sống/Die/Chưa rõ, quét ALL, điểm ưu tiên chất lượng, link dự phòng, hoàn tác
- [x] Tự kiểm tra kênh ngay ở màn hình xem TV; thanh tiến độ thu gọn ở footer và nút hủy
- [x] EPG/XMLTV, chỉnh ghép EPG, nguồn theo quốc gia, tùy chọn tự tải lúc khởi động, tải URL và nhập XML/.xmltv/.gz thủ công
- [x] Hẹn giờ ghi hình nền FFmpeg từ EPG/nhập giờ, lịch bền vững, từ chối lịch trùng, chuyển bản ghi an toàn sang MP4
- [x] Tên file ghi hình theo tên kênh, giờ bắt đầu/kết thúc, tên chương trình EPG (nếu có)
- [x] Tua lại khoảng 10 phút (khi đủ buffer); nút -10s, -30s, về LIVE
- [x] Backup/Restore .iptvbackup (cấu hình, playlist, favorites, tùy chọn snapshot, lịch ghi tương lai)
- [x] Snapshot đơn/hàng loạt, kiểm tra nhiều luồng, EPG, MultiView 4 kênh, PiP
- [x] Google Cast, AirPlay, link LAN/relay, Auto Failover, kiểm tra đứng hình
- [x] Cập nhật qua GitHub Releases có kiểm tra, phát hành cho macOS ARM64/x64 và Windows x64
- [x] Script build Windows có kiểm tra symbolic link và xác nhận Setup + Portable

**Lưu ý:** Quyền xem nội dung và chất lượng luồng IPTV phụ thuộc nguồn cung cấp; ghi hình không xử lý DRM. Máy phải đang chạy ứng dụng và không ngủ khi đến giờ ghi. Backup không chứa video đã ghi và chưa mã hóa.

Xem README.md, CHANGELOG.md và TONG_HOP_PHIEN_BAN_V4_23_7.md để biết chi tiết.
