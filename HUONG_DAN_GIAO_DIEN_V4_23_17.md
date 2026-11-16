# Open IPTV Pro 4.23.17 — Settings controls

- Mục **Phong cách giao diện** đứng trước **Hiển thị & Màu giao diện** trong Cài đặt.
- Mục Hiển thị & Màu giao diện gộp chế độ Sáng/Tối/AMOLED/Tự động, thanh Sidebar đầy đủ/gọn, và bảng màu dạng sidebar thay cho bánh xe màu. Màu tùy chỉnh sử dụng bộ chọn màu native HTML5. Tất cả lưu vào settings v1 và giữ tương thích backup.
- Mục **Chọn cấu hình kiểm tra** có ba nhóm nút: kiểm tra link 1/4/8/16/32, Snapshot 1/4/8/16/32 và tua lại 5/10/15/30 phút. Các mức kiểm tra đồng bộ với select 1–32 ở trang chuyên dụng. Không còn link điều hướng gây nhầm lẫn.
- Thời lượng tua lại truyền từ giao diện qua preload tới Electron IPC và FFmpeg. HLS segment 5 giây, cửa sổ 12 segment/phút (mặc định 120 segment/10 phút), giới hạn dung lượng tối đa vẫn 2GB bảo vệ ổ cứng. Đổi cấu hình chỉ tác động lần tạo bộ đệm tiếp theo.
- Nguồn bị DRM hoặc mạng chặn có thể không tạo được bộ đệm; tính năng không vượt DRM.
- Không thay dữ liệu người dùng/playlist. Không tự publish GitHub.

**MPEG-DASH:** gói cài bổ sung `dashjs@5.3.0`, chuyển luồng `.mpd` sang player DASH; proxy loopback cấp manifest và segment, không hỗ trợ DRM thiếu license. Hỗ trợ codec phụ thuộc Chromium.
