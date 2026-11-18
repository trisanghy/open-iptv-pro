# So sánh Electron, Rust Lab và Web Online — gói v4.23.69

| Hạng mục | Electron Desktop v4.23.68 | Rust Lab v23.8.30 | Web Online |
| --- | --- | --- | --- |
| Trạng thái | **Stable**, dùng hàng ngày | **Beta**, thử nghiệm Tauri/Rust | Website triển khai |
| macOS/Windows | Cả hai, bộ cài riêng | Cả hai, bộ cài riêng | Chạy trong trình duyệt |
| Xem M3U/HLS/DASH | Có, tùy codec/nguồn | Có, tùy codec/nguồn | Có, chịu CORS/HTTPS/codec |
| Tìm kênh & Yêu thích | Có | Có | Có |
| EPG/Snapshot | Có | Có | Có giới hạn trình duyệt |
| PiP, fullscreen | Theo hệ điều hành | Theo WebView/hệ điều hành | Theo API/trình duyệt |
| Timeshift, DVR, FFmpeg | Native, tùy luồng | Native khi FFmpeg hỗ trợ | Không có FFmpeg native |
| Live Caption/Translate/TTS offline | Có hỗ trợ mô hình tùy cài | Có các mô hình riêng | Không có native offline như Desktop |
| Tài khoản & Cloud Sync | Lưu trữ cục bộ và công cụ backup | Lưu trữ cục bộ và công cụ backup | Supabase nếu được cấu hình |
| Cảnh báo quyền M3U/Discovery | Mã nguồn mới đã đồng bộ, bộ cài Stable gốc 4.23.68 | **Có trong bản 23.8.30 phát hành** | **Có trên bản Web đã triển khai** |

**Quan trọng:** V4.23.69 là số của **gói phát hành tổng hợp**; không nên nhầm Electron 4.23.68 với Rust Lab 23.8.30. Mã nguồn ở `main` có thể chứa cập nhật mới hơn nhị phân Electron Stable đang được tái sử dụng để tránh thay bộ cài chưa qua CI.

Hai dòng desktop lưu dữ liệu riêng. Không bảo đảm mọi tính năng, codec, phụ đề hoặc file backup hoán đổi được giữa các nền tảng.
