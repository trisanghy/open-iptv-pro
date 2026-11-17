# Open IPTV Pro — Web Online

**Dùng trực tiếp:** https://trisanghy.github.io/open-iptv-pro/  
**Hướng dẫn trên website:** https://trisanghy.github.io/open-iptv-pro/huong-dan.html  
**Desktop v4.23.60:** https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.60

Bản Web là ứng dụng trình duyệt tĩnh trên nhánh **web/online**, khác bản desktop Electron mã nguồn chính tại `main`.

## Tính năng Web

- Nhập file M3U hoặc URL danh sách kênh khi truy cập hợp lệ; sắp xếp nguồn/thư mục và kênh yêu thích.
- Phát HLS, MPEG-DASH, MP4 nếu codec và HTTPS/CORS cho phép; chọn link dự phòng, âm lượng, fullscreen, PiP, đa màn hình khi hỗ trợ.
- EPG/XMLTV, tìm kiếm kênh, Smart IPTV Doctor/kiểm tra nguồn trong giới hạn trình duyệt.
- Ghi nhớ kênh xem gần nhất, thử tự phát kênh/âm thanh; trình duyệt có thể yêu cầu thao tác của người dùng.
- Backup/Restore JSON bản Web; đồng bộ tài khoản chỉ khi Supabase được cấu hình, không đăng nhập vẫn có chế độ khách.
- Truy cập hướng dẫn ngay từ thanh trên của ứng dụng hoặc đường dẫn `/huong-dan.html`.

## Những chức năng KHÔNG có trên GitHub Pages

Không có FFmpeg native, ghi hình hẹn giờ, Timeshift native, CORS bypass, LAN discovery gốc, mô hình Whisper/MLX/Piper/VieNeu offline và đồng bộ tiếng gốc của Desktop v4.23.60. Web chỉ phát những luồng mà trình duyệt có quyền, không vượt DRM/hạn chế máy chủ. Backup JSON Web không đồng nhất với file .iptvbackup Desktop.

## Deploy

Workflow `.github/workflows/deploy-openiptv-web.yml` dựng Web từ WebView frontend đã kiểm thử, chèn các bản vá riêng trong `web-online/prepare-web.py`, copy tài liệu `huong-dan.html`, kiểm tra JS/HTML rồi xuất GitHub Pages và đồng bộ bản static vào gốc nhánh `web/online`.

Website: **https://trisanghy.github.io/open-iptv-pro/**.

Chỉ sử dụng nội dung IPTV bạn có quyền truy cập; không kèm playlist trái phép.
