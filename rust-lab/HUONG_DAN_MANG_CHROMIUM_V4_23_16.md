# Open IPTV Pro v4.23.16 — Chẩn đoán mạng và Live Events

## Điều đã sửa
Ứng dụng desktop dùng Chromium `net.fetch` trước khi thử Node `fetch`; luồng HLS, các segment và kiểm tra kênh sẽ đi qua kết nối do Electron quản lý. Điều này tận dụng cấu hình DNS/TLS/proxy của hệ điều hành. **Không tự vượt DRM hoặc chặn truy cập từ nhà cung cấp.**

## Kiểm tra trên Mac khi kênh chưa phát

```bash
cd ~/Downloads/Open-IPTV-Pro-v4_23_16_Full_Desktop
bash CHUAN_DOAN_LIVE_EVENTS_MAC.command "$HOME/Documents/live events iptv.m3u" --limit 3 --compare-curl
```

Nếu Node hiện `fetch failed` nhưng curl trả HTTP 200/206 và HLS, đây là khác biệt đường truyền mạng — ứng dụng v4.23.16 dùng lớp Chromium giúp giải quyết nhiều trường hợp này. Nếu cả curl và Chromium cũng thất bại, cần xác minh mạng, DNS, TLS hoặc quyền truy cập nguồn bằng công cụ độc lập. **Đừng đánh dấu kênh Die** chỉ vì lỗi kết nối, 403, timeout.

Lưu ý: thumbnail có thể được tải từ `tvg-logo` khác máy chủ phát. Việc thấy ảnh không tự chứng minh manifest phim còn hoạt động; phải kiểm tra thực phát video.

Kiểm tra cùng một kênh với cùng mạng Wi-Fi trên Mac và ứng dụng khác. Cần thử DMG/EXE thực tế; bộ test tự động không xác nhận được mọi CDN.
