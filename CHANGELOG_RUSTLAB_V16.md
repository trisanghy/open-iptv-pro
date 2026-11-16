# Open IPTV Pro Rust Lab v16 — compact two-row controls

Nhánh: `experiment/rust-tauri-v2` (độc lập với Electron và nhánh `main`).

## Giao diện xem truyền hình

- Hàng 1: logo/tên kênh → Điều khiển Trước/Phát-Tạm dừng/Dừng/Sau → Cast/AirPlay, PiP, Toàn màn hình.
- Hàng 2: Chương trình hiện tại và chương trình tiếp theo cạnh nhau (đọc từ XMLTV EPG thực tế; có tên và giờ bắt đầu/kết thúc) → Khung hình (giữ select Vừa khung/Lấp đầy/Kéo giãn/Kích thước gốc) → Link phát thu nhỏ → Yêu thích.
- Bỏ nhãn pill **Đang phát** trong thanh chương trình; không thay đổi trạng thái phát của ứng dụng.
- Đưa nút Snapshot và thanh âm lượng vào **Công cụ nhanh** để không lặp cột điều khiển, vẫn giữ tính năng.
- Tab mở Danh sách kênh đã thu gọn thành mũi tên nhỏ ở mép sidebar, tách nút thu gọn chính; giữ video toàn chiều ngang.
- Lịch EPG được cập nhật khi đổi kênh, tải lại XMLTV và qua phút mới. Khi thiếu lịch, hiển thị trạng thái thiếu dữ liệu, không tạo lịch giả.

## Ranh giới thay đổi

- Không thay đổi Rust Core, FFmpeg, HLS, Auto Failover, logic nguồn M3U hoặc các bài kiểm thử playback v7.
- Tái sử dụng các phần tử ID cũ để không mất sự kiện điều khiển, không đổi dữ liệu người dùng.

## Kiểm thử

- `npm run test:quick` dùng kiểm thử hồi quy riêng của v16 và các bản v7/v11/v13.
- Đã xác minh bố cục 2 hàng bằng Chromium với dữ liệu EPG mô phỏng ở kích thước rộng/hẹp; chưa xác nhận build native macOS.
