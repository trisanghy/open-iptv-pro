# Đối chiếu v4.19 Electron → WebView FULL

| Hạng mục | Phương án WebView | Kiểm thử hiện tại |
|---|---|---|
| Giao diện v4.19 nguyên bản | Sao chép toàn bộ renderer HTML/CSS/JS và assets | Test static đối chiếu |
| Ngôn ngữ VI/EN/ES/PT-BR/ZH-CN/TH/LO/KM | Giữ các file locales và bản bundle cũ | Test source gốc |
| Quản lý nguồn M3U URL/file, xuất M3U | Backend gốc, native file dialog Tauri | API tích hợp; dialog chưa thử native |
| Xem kênh, MultiView 4 kênh, PiP | Giữ player v4.19, HLS.js offline, WKWebView/WebView2 | Chưa thử native video |
| FFmpeg / FFprobe | Sidecar đủ bộ đóng gói trong installer, không tải lúc mở app | Test cấu hình; chưa thử bundle macOS/Windows |
| Timeshift 5 phút, tua -30s/-5 phút, LIVE, tự động | Node source gốc + FFmpeg, HTTP rolling buffer | 62 test source gốc và API thực |
| Snapshot 1/hàng loạt 1-32 workers | Node source gốc + FFmpeg | Test source gốc; native chưa thử |
| Check link 1-32 workers | Mã kiểm tra v4.19 gốc | Test source gốc |
| EPG / TV Guide | Node EPG backend + renderer v4.19 | Test source gốc |
| Doctor 2.0, phân tích ảnh, phục hồi | Renderer v4.19 gốc | Test source gốc |
| Favorites, folders, kéo-thả | Renderer v4.19 gốc | Test source gốc; localStorage ở origin mới |
| Failover, channel health, buffering | Original renderer/backend | Test source gốc |
| Collector GitHub playlists | Original source/repo-sources, UMD collector-core | API test |
| Tối/sáng/tự động, giao diện | Giữ renderer v4.19 | Test source gốc |
| Nhắc EPG | Tauri notification command | Chưa thử notification native |
| Cập nhật | Check/tải SHA256 của **WebView** Releases, mở cài thủ công | Native auto-install chưa có (cần ký số/Tauri updater) |
| Cài Mac/Windows | Build DMG/EXE bằng Tauri native WebView | Build native chưa thực hiện trong môi trường Linux |

**Không có chức năng nào của renderer v4.19 bị xóa**. Tuy nhiên tương đương giao diện/source không đồng nghĩa với việc tất cả đã hoạt động trên Windows/Mac. Đặc biệt trình phát phụ thuộc codec WebView hệ thống và chức năng auto-install Electron phải chuyển sang Tauri updater mới có thể coi là tương đương hoàn toàn.
