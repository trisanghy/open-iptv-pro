# Open IPTV Pro v4.19 WebView — Snapshot Fix

## Đã sửa
- Snapshot bằng FFmpeg có retry: thử HTTP/HTTPS gốc; nếu thất bại, thử lại qua proxy `127.0.0.1` nội bộ đã dùng để phát IPTV.
- Thêm tùy chọn HLS phù hợp; không dùng `-allowed_extensions ALL` cho MP4/TS vì FFmpeg sẽ báo `Option allowed_extensions not found`.
- Tăng thời gian chờ khung hình, nhận diện file JPEG thực và trả lại lỗi FFmpeg cụ thể.
- Giao diện không còn nuốt lỗi khi chụp; tác vụ hàng loạt ghi lại kênh lỗi cuối cùng và vẫn có thể hủy.
- Bỏ `window.confirm()` chặn chụp hàng loạt trong WebView; bắt đầu ngay sau khi nhấn nút.
- FFmpeg, FFprobe, Timeshift và các thành phần khác **không bị cắt**.

## Kiểm thử trong môi trường xây dựng
- Kiểm thử WebView/backend: 9/9.
- Kiểm thử gốc Electron: 62/62.
- Chụp MPEG-TS thử nghiệm thật qua FFmpeg, retry qua proxy và phục vụ JPG qua API WebView.
- Chụp HLS gốc và HLS qua proxy với file m3u8/segment thử nghiệm.

Chưa kiểm thử ứng dụng macOS đã đóng gói / DRM / các URL IPTV hạn chế theo vùng.

## GitHub
Không có kết nối GitHub cho phiên này nên chưa thể đẩy thay bạn. Để đẩy đúng nhánh mà **không ảnh hưởng main**, trên Mac chạy:

```bash
cd ~/Downloads
unzip -o Open_IPTV_Pro_v4_19_WebView_SNAPSHOT_FIXED.zip
bash Open_IPTV_Pro_v4_19_WebView_SNAPSHOT_FIXED/PUSH_GITHUB_MAC.command
```

Script xác minh remote là `trisanghy/open-iptv-pro`, dùng nhánh `experiment/native-webview-ffmpeg`, kiểm tra repo không có thay đổi chưa commit, chặn tài khoản GitHub CLI khác `trisanghy`, và `git push` không sử dụng `--force`.

## Build DMG sau khi đẩy

```bash
cd ~/Downloads/open-iptv-pro/experiments/webview-full
bash BUILD_MAC.command
```

Đây là mã nguồn đã sửa, **không phải DMG build sẵn**. Script build cần kết nối Internet, Rust và đủ dung lượng ổ đĩa.
