# Open IPTV Pro Rust Lab v19.1 — cập nhật giao diện và bản build tự động

- Chuyển thanh điều khiển sang **HTML hai hàng tĩnh**, không còn runtime DOM reparenting gây lỗi v16.
- Hàng trên: tên kênh, 4 nút phát, Cast/AirPlay, PiP và fullscreen.
- Hàng dưới: **EPG đang phát + tiếp theo** (XMLTV thật), Khung hình (dropdown cũ), Link phát và Yêu thích.
- Âm lượng và Snapshot vẫn hoạt động trong Công cụ nhanh.
- Thêm CSS responsive v19.1, kiểm thử hồi quy, giữ nguồn phát v7 + tỷ lệ nguồn v17 và tab hẹp v18.
- Nâng nguồn lên `4.23.17-tauri.19.1`, tag `rust-lab/v19.1`.
- Tự build GitHub Actions: Mac Universal (FFmpeg universal), Windows x64 Setup + ZIP portable, ZIP nguồn theo tag, checksum; Release chỉ tạo khi build hoàn tất.
- `main` Electron không thay đổi; v19 và các tag cũ giữ nguyên.

Xem [Release notes](RELEASE_NOTES_RUST_LAB_V19_1.md).
