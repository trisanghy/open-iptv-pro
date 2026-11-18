# Open IPTV Pro v4.23.14 – Hướng dẫn phát Live Events và video có thể tua

- Nguồn M3U ví dụ: `https://nts12.s.gy/iptv` (chưa thể kiểm tra trực tiếp trong môi trường build; không cam kết mọi kênh chạy).
- Trình phát nhận dạng HLS theo manifest thực, hỗ trợ playlist LIVE/EVENT/VOD; các kênh dạng MP4 và HLS có thể kéo thanh tua khi `video.seekable` thực sự cung cấp khoảng hợp lệ. Không có phân đoạn thì không giả tạo khả năng tua.
- Toàn màn hình: dùng nút ⛶, di chuột để hiện công cụ, đứng yên vài giây để ẩn. Có thể dùng Esc để thoát.
- Trong trang Xem truyền hình: ← / → chuyển kênh trước/sau; ↑ / ↓ tăng/giảm âm lượng 5%. Không áp dụng khi nhập trong ô văn bản, chọn danh sách hoặc kéo slider.
- Ứng dụng tự mở lại kênh gần nhất khi khởi động nếu nguồn chưa bị xóa/tắt. Nhấn nút đỏ trên Mac sẽ thoát hẳn, do vậy lịch DVR chỉ hoạt động nếu ứng dụng đang mở.
- Codec không có bộ giải mã, DRM, hạn chế IP/geo hoặc URL yêu cầu cookie vẫn có thể không phát trong Chromium dù app khác phát được. Không tự sửa/chèn thông tin xác thực.
- Build trên macOS `bash BUILD_MAC.command`, Windows `BUILD_WINDOWS.bat`. Trước khi cập nhật nên sao lưu trong Cài đặt.
