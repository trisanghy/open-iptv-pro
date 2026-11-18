# Open IPTV Pro Rust Lab v23.8.10 — chọn font phụ đề

- Thêm **Phông chữ** trong bảng CC: Mặc định, Arial, Tahoma, Verdana, Noto Sans, Georgia. Chọn là áp dụng ngay.
- Có ô xem trước chữ Việt và chữ Trung cùng lúc.
- Ưu tiên font hệ thống, CJK fallback PingFang SC (macOS), Microsoft YaHei (Windows), Noto Sans CJK SC, Songti SC/SimSun; font có thể hiển thị theo fallback nếu máy chưa cài.
- Giảm viền đen quá dày và giảm độ nặng nét; tăng độ thoáng dòng để đọc chữ Hán tốt hơn. Không thay đổi cỡ, màu, nền, vị trí mà người dùng đang chọn.
- Lưu font cùng cài đặt CC hiện tại; người dùng bản cũ được chọn mặc định dễ đọc.
- Sửa regression test cố định phiên bản v23.8.8, để kiểm tra phiên bản hiện hành.
- Giữ nguyên sửa lỗi Caption/Translate/TTS và luồng nhận diện cập nhật ở commit trước; không ảnh hưởng main.
- Tag bất biến: `rust-lab/v23.8.10`; build Mac cục bộ chỉ một `.app` trong Downloads; GitHub Actions tự xây Windows và Universal DMG, ZIP nguồn.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
