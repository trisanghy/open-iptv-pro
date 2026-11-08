# Thành phần phát hành đi kèm

- Node.js (https://nodejs.org) — binary runtime chính thức từ Node.js, kiểm tra SHA256 trước khi đóng gói. Người đóng gói chịu trách nhiệm kiểm tra phụ thuộc thư viện động và ghi nhận license đi kèm.
- FFmpeg/FFprobe — được bundling **đầy đủ** từ `ffmpeg-static` và `@w6s/ffprobe-static`; điều khoản GPL/LGPL của binary tùy phân phối. Không tự ý bỏ giấy phép hay tài liệu pháp lý.
- Tauri 2 (https://tauri.app) / system WKWebView / system WebView2.
- hls.js 1.6.15 (https://github.com/video-dev/hls.js) — được bundling offline.
- Original Open IPTV Pro v4.19 Electron app — MIT, mã nguồn người dùng đã gửi, giữ lại trong `electron-original/`.

Lưu ý: nếu phân phối công khai bộ cài bao gồm FFmpeg build GPL, cần đáp ứng đầy đủ điều kiện phân phối mã nguồn và giấy phép tương ứng.
