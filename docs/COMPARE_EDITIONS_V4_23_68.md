# So sánh các nền tảng — Open IPTV Pro 2026-11-18

| Tính năng | Electron Desktop 4.23.68 | Rust Lab 23.8.26 Beta | Web Online |
| --- | --- | --- | --- |
| Windows/macOS | Có, Electron | Có, Tauri 2/WebView | Qua trình duyệt |
| Nhiều nguồn M3U, nhóm, yêu thích | Có | Có | Có |
| HLS/DASH | Có, tùy nguồn/codec | Giới hạn theo WebView | Giới hạn CORS/codec |
| Link dự phòng, Auto Failover | Có | Một phần, tùy luồng | Một phần |
| EPG/XMLTV | Có | Có | Có |
| FFmpeg/Snapshot/ghi hình/Timeshift | Có khi tương thích | Có khi tương thích | Giới hạn |
| MultiView | Có | Tính năng thử nghiệm | Khác native |
| PiP và fullscreen | Có, CC PiP có dự phòng | WebView PiP tùy OS | Theo API trình duyệt |
| Live Caption/Translate/TTS offline | Có khi cài mô hình | Có, Beta | Không tương đương |
| Lưu trạng thái 3 nút AI | Có | Theo phiên bản | Không áp dụng |
| CC nhiều dòng/font/màu/vị trí | Có | Có (Beta) | Phụ thuộc Web |
| 11 preset giao diện & ảnh kênh | Có | Một số giao diện | Bố cục Web |
| Cloud Sync Supabase | Không mặc định | Không mặc định | Có khi cấu hình |

**Giới hạn:** Phát luồng phụ thuộc codec/CORS/DRM, nguồn URL và thiết bị. Rust Lab là Beta, không được tự động cài đè Electron.

**Cấu trúc source trong main:** renderer/, src/, tests/, scripts/ và package.json cho Electron; rust-lab/ chứa toàn bộ nhánh Rust; web/ chứa toàn bộ nhánh web/online. Các nguồn không dùng chung tiến trình phát.

Tài liệu: ../RELEASE_NOTES_V4_23_68.md · INSTALL_V4_23_68.md · RELEASE_SOURCE_MAP_V4_23_68.md
