# Open IPTV Pro Rust Lab v4.23.17 — v13 / Link phát dropdown

Nhánh riêng `experiment/rust-tauri-v2` (không tác động Electron chính).

## Thay đổi
- Đổi nút “Nguồn phát (2)” thành nhãn **Link phát** và ô chọn `select` kéo dài, đúng vị trí góc phải của hàng thông tin kênh, ngay trước nút Yêu thích.
- Giá trị hiện tại hiển thị `Link chính · máy-chủ/đường-dẫn` hoặc `Dự phòng N · máy-chủ/đường-dẫn` (không hiển thị token/query string).
- Ô chọn chỉ hiển thị khi kênh có ít nhất hai link; chọn link gọi lại `playChannel(..., {manualUrl})` giữ nguyên fallback, adaptive preference và URL gốc.
- Hàng điều khiển bên dưới không thay đổi. Có điều chỉnh responsive khi cửa sổ hẹp và chế độ sáng.
- Không thay đổi lõi Rust, cơ chế FFmpeg, M3U/EPG, Snapshot hoặc dữ liệu người dùng.

## Kiểm thử
Chạy `npm run test:quick`. Chưa xác nhận build native Mac/Windows hoặc phát IPTV thực tế.
