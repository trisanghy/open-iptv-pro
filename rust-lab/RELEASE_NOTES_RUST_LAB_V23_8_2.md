# Open IPTV Pro Rust Lab v23.8.2 — sửa biên dịch module MLX

- Khắc phục hai lỗi cú pháp Rust ở `src-tauri/src/local_ai/mlx_ai.rs` (CI Windows v23.8.1): thay khai báo `let installed=...,size=...` và `let base=...,model=...` bằng hai lệnh `let` hợp lệ.
- Đổi danh mục 8 mô hình từ `const` sang `static` để trình lặp có thời gian sống tĩnh rõ ràng; bỏ tham số không dùng trong hàm xử lý.
- Bổ sung kiểm thử hồi quy chống tái xuất hiện lỗi cú pháp.
- **Giữ nguyên tính năng** v23.8.1: sửa Argos NoneType/MINISBD; Live Caption và Live Translate dùng chung Whisper; Hy-MT2/Qwen3 MLX thật trên Mac Apple Silicon; lựa chọn mô hình/nhấn Tải hoặc Sửa trực tiếp; kiểm tra bộ nhớ và giọng TTS.
- Phiên bản `4.23.17-tauri.23.8.2`, nhánh `experiment/rust-tauri-v2`, tạo tag bất biến `rust-lab/v23.8.2`; giữ nguyên toàn bộ tag cũ và không ảnh hưởng `main` hoặc Electron.
- **Lệnh build Mac cá nhân** không đổi, chỉ xuất một ứng dụng `.app` trong Downloads, ZIP nguồn chỉ ở thư mục tạm:

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

- Workflow GitHub vẫn xuất Universal DMG + ZIP mã nguồn và Windows Setup/Portable, checksum khi build hợp lệ; không đổi quy trình phát hành.

**Giới hạn:** cần CI build và chạy thử thực tế trên Mac ARM để xác nhận suy luận MLX.
