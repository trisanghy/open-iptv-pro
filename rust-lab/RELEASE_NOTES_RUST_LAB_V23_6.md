# Rust Lab v23.6 — sửa Live Translate và cài đặt AI theo Electron v4.23.67

Nguồn Electron tham chiếu: `bcd80872aa0153e7badebe1206c6037f1fa44283` (v4.23.67). Phiên bản Rust trước: `69443c3b36391a126813858e538e861e4550a2b6` (v23.5).

## Sửa lỗi phiên dịch
- Đồng bộ danh mục **21 ngôn ngữ** giữa UI/Rust và bộ định tuyến Python Argos; trước đó Python chỉ chấp nhận 15 ngôn ngữ, gây lỗi "Unsupported source or target language".
- Thêm kiểm tra tuyến dịch **nguồn thực tế → đích**; không dựa vào trạng thái giả của cờ `en→target` cũ. Ưu tiên direct/pivot, dự phòng Whisper → English nếu khả thi, báo thiếu mô hình rõ ràng.
- Đổi tên script Python nhúng sang `argos_direct_router_v23_6.py` để sửa runtime đã cài bản cũ trên máy người dùng.
- Bật Live Caption hoặc Live Translate có thể tự cài Whisper một lần. Tự cài cặp Argos khi ngôn ngữ gốc đã được Whisper nhận diện (có thể tắt tại ⚙). Có nút **Thử lại**, giữ checkbox bật khi gặp lỗi, xếp hàng yêu cầu thay đổi khi đang cài.
- Có **Kiểm tra dịch mẫu** chạy bản dịch Argos thật; không báo thành công giả khi chỉ có fallback Whisper từ âm thanh.
- Tránh hiển thị thêm phụ đề dưới video từ TTS khi đang bật lớp phụ đề đích.

## Cài đặt AI, giống cấu trúc Electron
- Bốn khu: Whisper; Live Translate/Argos; Piper/VieNeu; quản lý dung lượng mô hình.
- Kiểm tra dung lượng và xóa mô hình **chỉ trong thư mục app Rust Lab**, yêu cầu xác nhận hai lần, không xóa model do người dùng đặt ngoài thư mục ứng dụng.
- Có nút cài model theo nhóm, báo tiến trình, kiểm tra tuyến Argos và trạng thái đã tải.
- Giao diện điều khiển gọn lấy từ CSS Electron v4.23.67.
- **MLX Hy-MT2/Qwen3 chưa được đưa sang backend Rust:** chỉ hiển thị các mục bị vô hiệu hóa; KHÔNG cho chọn hoặc báo mô hình đã cài.

## Release
- Version `4.23.17-tauri.23.6`, tag bất biến `rust-lab/v23.6` được workflow tạo sau khi push.
- Workflow chọn ghi chú tương ứng số version, không còn mô tả v23.3 cho bản mới.
- CI Windows tạo Setup, Portable, source ZIP, SHA256; macOS tạo Universal DMG nếu job biên dịch hoàn tất. Dùng prerelease, không đổi Electron Latest.
- Build Mac một lệnh tải đúng tag và xuất DMG + ZIP trong Downloads:
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

**Chưa kiểm thử chạy dịch và âm thanh trên Mac thực tế, cũng chưa xác nhận native build hoàn tất.** Kết quả CI và tài sản GitHub Release phải được kiểm tra sau khi chạy.
