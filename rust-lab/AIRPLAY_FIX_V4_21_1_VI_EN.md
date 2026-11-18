# Sửa AirPlay v4.21.1 (macOS) / AirPlay discovery fix

## Tiếng Việt
- Google Cast và AirPlay là hai giao thức riêng. TV xuất hiện trong Safari không nhất thiết hỗ trợ Chromecast.
- Mục **Google Cast** tiếp tục tìm `_googlecast._tcp`.
- Mục **AirPlay** trên Mac dùng công cụ Bonjour `dns-sd` có sẵn để tìm `_airplay._tcp` và hiện danh sách thiết bị nhận diện được.
- Nhấn **Mở AirPlay trong Safari**, sau đó chọn thiết bị AirPlay từ trình phát trong Safari. Danh sách ở Open IPTV Pro chỉ để nhận biết, không trực tiếp khởi tạo phiên AirPlay hay điều khiển TV.
- Nếu danh sách AirPlay trống nhưng Safari thấy thiết bị, thử nút Safari: các bộ nhận AirPlay bên thứ ba có thể quảng bá dịch vụ khác nhau.
- Để tự chẩn đoán trên Mac: mở Terminal và chạy `dns-sd -B _airplay._tcp local.` (Control+C để dừng).
- Nếu không mở được luồng trên Safari/TV, kiểm tra URL video, codec, mạng LAN và khả năng TV truy cập máy Mac.
- Giữ toàn bộ FFmpeg, Timeshift, Snapshot, 8 ngôn ngữ, Windows Setup/Portable. Không chỉnh Android/iOS.

## English
- Google Cast discovery and AirPlay discovery are different. Seeing a TV in Safari does not imply Chromecast support.
- The app separately lists video-capable AirPlay Bonjour receivers via macOS built-in `dns-sd`.
- Safari still handles choosing and streaming to the AirPlay receiver; the app does not connect to a receiver using the Cast protocol.
- If the list is empty, opening Safari may still work for some third-party receivers.
