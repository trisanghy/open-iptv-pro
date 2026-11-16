# Rust Lab v4.23.17-tauri.11 — Thu gọn danh sách kênh

- Thêm nút ❮ trong tiêu đề **Danh sách kênh** để thu gọn toàn bộ cột kênh, độc lập với sidebar ứng dụng.
- Khi thu gọn, khu vực video dùng toàn bộ chiều rộng còn lại; nút **☷ Danh sách kênh ›** phía trên video mở lại mà không che hình.
- Ghi nhớ trạng thái đóng/mở qua `localStorage` riêng, giữ nguyên danh sách/kênh chọn và phục hồi vị trí cuộn.
- Tương thích các kiểu giao diện đang có; **Cinema TV** tiếp tục dùng drawer **Tất cả kênh** riêng, không bị đổi chức năng.
- Không sửa lõi phát IPTV, Auto Failover, FFmpeg hay quản lý nguồn M3U. Không thay đổi bản Electron chính.
- Chạy `npm run test:quick` rồi `bash BUILD_MAC_FAST.command` trên Mac để build DMG.
