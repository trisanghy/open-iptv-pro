# Open IPTV Pro Rust Lab v23.8.96

**Nền tảng:** Rust Lab / Tauri 2, nhánh `experiment/rust-tauri-v2`.

## Sửa giao diện Light mode

- Đồng nhất độ tương phản chữ thông báo DVR/ghi hình, lịch phát, trạng thái lỗi và cảnh báo.
- Làm rõ thông tin nguồn IPTV, gợi ý tương tác, trạng thái danh sách và tên mục điều hướng trong theme sáng.
- Giữ lại màu nhấn theo lựa chọn người dùng; không thay đổi logic player, playlist, EPG, tài khoản hoặc dữ liệu.
- Không can thiệp theme Dark/AMOLED, Web Online, Electron Desktop, Mobile hay `main`.

## Kiểm thử

- Các kiểm tra hồi quy Light mode với CSS được giới hạn trong `data-theme="light"`.
- Chụp 11 trang từ renderer thật trong Chromium và kiểm tra màu tính toán/độ tương phản; ảnh này **không** thay cho ảnh ứng dụng Tauri native.
- Windows x64 và macOS CI chỉ được công nhận khi workflow thực tế hoàn tất và có artifact hợp lệ.

## Lịch sử

Tag `rust-lab/v23.8.96` được tạo mới, bất biến sau khi phát hành; các tag v23.8.95 trở về trước được giữ nguyên.
