# Rust Lab v23.8.99 — Ghép đôi TV và điều khiển từ xa an toàn

- Tích hợp ghép đôi TV tự động bằng mã PIN 6 số, cùng giao thức với Web/TV receiver (Supabase Broadcast, ECDH P-256, AES-GCM).
- Chỉ hiển thị **ĐÃ KẾT NỐI** / **Phiên được mã hóa** sau khi nhận phản hồi kết nối an toàn từ TV.
- Đồng bộ chuyển kênh, Play/Pause, Dừng và âm lượng; chờ trạng thái phát thực tế do TV gửi về.
- Chuyển kênh trên Rust Lab không phát video cục bộ đè lên TV; bảo toàn Google Cast, AirPlay và liên kết LAN hiện có.
- Giao diện có link rút gọn Web/TV và link dự phòng gốc, có nút sao chép; không còn bước chấp thuận mã trên TV.
- Giữ nguyên các tag Rust Lab cũ, không sửa main hay các nhánh ứng dụng khác.
