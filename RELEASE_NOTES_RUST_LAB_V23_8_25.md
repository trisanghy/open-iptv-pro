# Rust Lab v23.8.25 — Thanh phát gọn & 3 hộp chọn 1–32

- Áp dụng bản demo đã duyệt trên bố cục Rust hiện tại: rút ngắn hàng phát, EPG và khoảng trắng; giữ giao diện / màu nền trước đó, âm lượng trên hàng đầu.
- Live Caption/Translate, chọn ngôn ngữ, CC nằm trên hàng chính. Chuyển trạng thái nhận diện và menu Công cụ xuống hàng trạng thái mảnh bên dưới.
- Gộp trọn lựa chọn TTS, ngôn ngữ, Giọng, Tốc độ và Gốc cùng một hàng ở kích thước màn hình desktop; trạng thái đọc chuyển xuống dòng riêng. Khi cửa sổ hẹp, CSS thích ứng hai hàng rồi tự co giãn, không làm tràn nội dung.
- Di chuyển đúng các phần tử DOM đang dùng, không nhân bản hay thay đổi trình xử lý, giữ nguyên model, giọng đọc, bộ nhớ tùy chọn, subtitle, PiP gốc.
- Đổi **Luồng kiểm tra link**, **Luồng chụp Snapshot**, **Thời lượng tua lại** thành đúng ba hộp chọn 1–32. Mỗi giá trị đều được lưu độc lập.
- Kiểm tra link Rust tôn trọng giá trị chọn (tối đa 32 thay vì chặn cứng ở 8). Snapshot áp dụng 1–32 luồng. Tua lại Rust FFmpeg chấp nhận 1–32 phút và được áp dụng khi bật bộ đệm mới, không thay đổi buffer đang chạy.
- Cập nhật bài test từ radio presets cũ sang dropdown mới, thêm hồi quy riêng cho CSS, DOM và Rust backend.
- Giữ **Công cụ nhanh luôn mở**, không có ô âm lượng thừa; không sửa main hoặc nhánh Electron.
- Tag bất biến `rust-lab/v23.8.25`; Mac local build chỉ xuất một `.app`, GitHub Actions tạo DMG/Windows/source ZIP khi thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
