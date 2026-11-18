# Open IPTV Pro v4.23.15 – Hướng dẫn kiểm tra Live Events

## Đã sửa

1. M3U nhóm LIVE EVENTS có thể chứa phim VOD, video EVENT và cả DASH. Không tự gắn LIVE cho mọi URL.
2. Hls.js chỉ bắt đầu phát sau khi đọc manifest; báo rõ mã HTTP khi gặp `manifestLoadError`.
3. Thanh tua chỉ dùng cho VOD/EVENT được xác minh. LIVE thuần không hiển thị thanh tua VOD (vẫn hỗ trợ bộ đệm Tua lại 10 phút).
4. Proxy không gửi yêu cầu Range cho `.m3u8`; phân đoạn vẫn có thể dùng Range và fallback GET thông thường.

## Kiểm tra lỗi trên máy Mac

Đặt file `live events iptv.m3u` tại Downloads, mở Terminal trong thư mục dự án rồi chạy:

```bash
node scripts/diagnose-m3u.cjs "$HOME/Downloads/live events iptv.m3u" --group "LIVE EVENTS" --limit 8
```

Thêm `--offline` nếu chỉ muốn kiểm tra định dạng playlist, không thử kết nối.

- **HTTP 200 + HLS + VOD/Event**: máy chủ trả manifest đúng; nếu vẫn không phát, tiếp tục kiểm tra codec / các segment / key.
- **HTTP 401/403**: upstream từ chối truy cập; có thể do quyền, vùng địa lý hoặc URL hết hạn. Ứng dụng không tự vượt chặn.
- **HTTP 404/410**: URL bị xóa hoặc hết hiệu lực.
- **Timeout / DNS**: kiểm tra mạng, DNS và máy chủ.
- **DASH `.mpd`**: trình phát hiện chưa tích hợp DASH engine; cần nguồn HLS hoặc giải pháp DASH được cấp quyền.

Không gửi công khai URL chứa token, cookie hoặc tài khoản. Công cụ chẩn đoán chỉ in tên kênh, hostname, HTTP và định dạng.

## Giới hạn kiểm thử

Bộ kiểm thử gồm fixtures HLS VOD/LIVE nội bộ; chưa xác minh truy cập trực tiếp tới từng CDN trong M3U bạn gửi từ môi trường này. Không đồng nghĩa tất cả liên kết đều sẽ phát được.
