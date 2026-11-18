# Open IPTV Pro Rust Lab v10 — chọn link phát thủ công

Thêm nút **⛓ Nguồn phát (N)** bên cạnh tên kênh trong thẻ điều khiển.
Nút chỉ xuất hiện nếu kênh có từ hai URL phát hợp lệ (gốc + dự phòng).
Bấm để xem danh sách, chọn link và phát ngay. Nếu link được chọn lỗi, vẫn có Auto Failover.
Sau khi phát ổn định đủ 12 giây, cơ chế Adaptive Failover hiện có sẽ lưu ưu tiên.
Không thay thế URL gốc hoặc thay đổi phiên bản Electron chính.

## Build macOS bằng Terminal

```bash
bash BUILD_MAC_FAST.command
```

Script chỉ chạy kiểm thử JavaScript trọng tâm (chọn link, phát lại, sắp xếp kênh và sidebar), không chạy lại bộ test đầy đủ. Bước build Tauri vẫn dùng Rust Cargo và yêu cầu môi trường Xcode/Node/Rust hợp lệ.

Chưa thể xác minh build DMG hoặc phát link IPTV thật trên Mac trong môi trường tạo bản này.
