# Open IPTV Pro Rust Lab — v4.23.17-tauri.10

Branch: `experiment/rust-tauri-v2` (không liên quan `main`).

- Nút **Nguồn phát (N)** cạnh tên kênh, chỉ xuất hiện khi có từ 2 URL hợp lệ.
- Menu liệt kê Link gốc / Dự phòng với tên miền (không hiển thị query chứa token), dấu link đang chọn và link đã ưu tiên.
- Bấm link sẽ khởi tạo phiên LIVE mới bằng URL được chọn, tiếp tục dùng các nguồn khác khi failover; không sửa URL M3U.
- Giữ cơ chế tự ghi nhớ link phát ổn định sau 12 giây của v7/v9.
- Thêm `BUILD_MAC_FAST.command` chạy tập kiểm thử JS trọng tâm, không chạy lại toàn bộ test Node trước build; bước native Rust vẫn biên dịch như thường.

**Giới hạn:** chưa kiểm tra DMG trên máy Mac thật trong môi trường tạo bản này.
