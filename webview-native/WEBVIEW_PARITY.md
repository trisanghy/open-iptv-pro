# Danh sách kiểm tra tương thích Open IPTV Pro ↔ WebView

Đây là **nhánh thử nghiệm độc lập**. Không được coi là bản đầy đủ hoặc thay thế Electron cho đến khi tất cả các chức năng được chuyển đổi và thử trên Mac/Windows thật.

| Chức năng | Tình trạng của nhánh thử nghiệm |
| --- | --- |
| WebView hệ thống Windows/macOS | Đã cấu hình bằng Tauri 2 |
| FFmpeg CLI được đóng gói | Đã cấu hình sidecar; kiểm tra khi build; không tự cắt bỏ |
| FFprobe | Đã cấu hình sidecar |
| Mở M3U URL / tệp | Có trong UI thử nghiệm |
| Phát HLS/MP4 | Tích hợp Hls.js/native; tùy codec/CORS/DRM |
| Snapshot | Lệnh FFmpeg mẫu |
| Ghi clip 30 giây | Lệnh FFmpeg mẫu |
| Timeshift đầy đủ | **Cần chuyển từ bản Electron** |
| MultiView | **Cần chuyển từ bản Electron** |
| EPG / lịch phát | **Cần chuyển từ bản Electron** |
| Failover / chuyển nguồn | **Cần chuyển từ bản Electron** |
| Doctor 2.0 / Freeze Detector | **Cần chuyển từ bản Electron** |
| Playlist favorites, lưu trạng thái, cài đặt | **Cần ánh xạ và kiểm tra dữ liệu gốc** |
| 8 ngôn ngữ | **Cần chuyển UI gốc** |
| Auto updater / thông báo phiên bản | **Cần thiết kế và xác minh chữ ký cập nhật** |
| Giao diện đầy đủ gốc | **Chưa chuyển** |
| Codec/DRM/stream đặc biệt | **Phải kiểm thử trên từng nền tảng** |

## Vì sao chưa thể gọi là 'đầy đủ chức năng'?

Electron có `ipcMain`, `ipcRenderer`, `contextBridge` và các Node APIs mà Tauri không cung cấp trực tiếp. Chuyển HTML/CSS sang WebView vẫn cần tạo các lệnh Tauri tương ứng và kiểm thử dữ liệu. Chạy `npm run audit:electron` trong `webview-native` để ghi báo cáo `ELECTRON_API_AUDIT.json` sau khi ghép với mã nguồn thật.

## Điều kiện phát hành

- Có mã nguồn Electron thật để viết adapter tương ứng cho từng IPC.
- Những mục **Cần chuyển** đều được kiểm thử đạt.
- Dữ liệu playlist, favorites, EPG không mất khi chuyển phiên bản.
- FFmpeg và FFprobe thực sự chạy được từ bản installer sạch trên cả Windows/macOS.
- Kiểm tra giấy phép FFmpeg binary và hoàn thiện thông báo nguồn/bản quyền.
- Chưa bật tự cập nhật thay thế bản Electron cho đến khi đảm bảo tương thích.
