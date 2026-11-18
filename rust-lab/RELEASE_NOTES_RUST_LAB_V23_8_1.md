# Rust Lab v23.8.1 — bản vá kiểm thử và tải mô hình trực tiếp

Kế thừa toàn bộ chức năng mới của **v23.8**:
- Argos Translate 1.11 sửa chế độ `NONE` gây lỗi `NoneType.translate` sang `MINISBD/OPENNMT`, kiểm tra mô hình bằng bản dịch thử và sửa cặp cài hỏng.
- Một luồng Whisper duy nhất cho Live Caption + Live Translate.
- Tám mô hình Hy-MT2/Qwen3 chạy MLX thật, cài offline theo nhu cầu và dùng được trên Mac Apple Silicon; tự động chọn model đã tải và dự phòng Argos nếu phù hợp.
- Cài đặt bốn khu, chọn bộ dịch, ưu tiên tài nguyên, quản lý bộ nhớ và mô hình.

## Bản vá v23.8.1
- Sửa hai bài test hồi quy Windows/macOS bị khóa cứng định dạng `LANGS=` và tên `argos_direct_router_v23_6.py` trong khi bộ định tuyến mới hợp lệ dùng `LANGS =` và script v23.8.
- Bỏ số version 23.8 viết cứng trong test MLX: kiểm tra phiên bản theo `package.json` và tag động.
- Thêm nút **Tải / sửa mô hình đang chọn** ngay tại mục Live Translate; bấm khi chọn Hy-MT2/Qwen3 sẽ chỉ cài đúng mô hình đó. Chọn Tự động/Argos thì cài Argos.
- Không thay đổi `main`, nhánh Electron hay các tag Rust Lab cũ.

## Quy tắc build
- Mac cá nhân: script cố định dưới đây chỉ xuất **một `.app`** trong Downloads; mọi ZIP tải nguồn chỉ nằm trong thư mục tạm.
- GitHub Actions giữ **Universal DMG + ZIP source**; Windows giữ Setup/Portable và checksum.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

**Hạn chế:** CI cần thực sự biên dịch và đóng gói xong để xác nhận trình cài; chưa kiểm thử suy luận MLX trên Mac của người dùng.
