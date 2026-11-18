# Rust Lab v23.8.26 — Sửa điều khiển chồng lên nhau khi thu nhỏ Mac

- Bổ sung CSS responsive mới, nạp sau các CSS trước. Dùng @container theo chiều rộng thật của khung trình phát thay vì kích thước cửa sổ macOS.
- Giữ một hàng gọn ở kích thước vừa; khi hẹp hơn, thông tin kênh + Play và âm lượng + Cast/PiP/fullscreen tự chuyển thành hai hàng; khung cực hẹp tách bốn hàng riêng.
- EPG, chọn kiểu hiển thị, link gốc/dự phòng và yêu thích chuyển vị trí có kiểm soát ở khung hẹp.
- Live Caption, Translate và CC giữ nguyên sự kiện; trạng thái nhận diện và menu Công cụ nằm hàng riêng.
- TTS tự chuyển từ 8 cột lớn thành 6/4/2 cột tại các ngưỡng 1120/685/455px; nhãn và hộp chọn luôn đi theo cặp, trạng thái đọc nằm bên dưới.
- Rút ngắn nhãn Cast trong khung nhỏ qua ResizeObserver, vẫn giữ tooltip và aria-label đầy đủ.
- Công cụ nhanh luôn mở; ba nút trên một hàng; không có ô âm lượng thừa. Không thay đổi ba hộp chọn 1–32 và giá trị đã lưu.
- Giữ nguyên engine Rust, PiP gốc, Live Caption/TTS, chức năng phát, settings, main và nhánh Electron.
- Thêm kiểm thử hồi quy cho ngưỡng responsive, ID không bị nhân bản và tùy chọn đã lưu.
- Phát hành mới bất biến rust-lab/v23.8.26. Lệnh Mac chỉ xuất 1 .app trong Downloads; GitHub Actions tiếp tục dựng DMG, Windows, ZIP source khi thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
