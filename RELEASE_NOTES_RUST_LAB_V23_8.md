# Rust Lab v23.8 — sửa Live Translate + Hy-MT2/Qwen3 theo Electron v4.23.67

## Sửa lỗi khi bật đồng thời Live Caption + Live Translate
- Cả hai nút sử dụng **một** luồng Whisper, không tạo hai phiên nhận diện cạnh tranh.
- Sửa lỗi `Argos: 'NoneType' object has no attribute 'translate'`: Argos v1.11 dùng `MINISBD` + `OPENNMT`, không còn `NONE`. Bộ định tuyến Python mới kiểm tra **dịch thật** trước khi báo "đã cài", phát hiện model lỗi và tự tải lại đúng cặp khi người dùng yêu cầu.
- Định tuyến dịch nguồn→đích, ưu tiên bản dịch trực tiếp rồi English dự phòng nếu cần; không hiển thị nội dung gốc như phụ đề đã dịch.
- Giữ trạng thái bật, nút Thử lại và Kiểm tra dịch mẫu.

## Thêm tám mô hình MLX chạy trực tiếp trên Mac Apple Silicon
- **Hy-MT2:** 1.8B 4-bit, 1.8B 8-bit, 7B 4-bit, 7B 8-bit.
- **Qwen3:** 0.6B, 1.7B, 4B, 8B (4-bit).
- Cổng Rust gọi bộ chạy Python/MLX được port từ Electron `src/hymt-bridge.py`, tải weights từ các repository allowlist của `mlx-community` khi bấm Tải mô hình; dữ liệu riêng `ai-translate/models/<id>`.
- Dùng công cụ `uv` đã xác minh SHA-256, Python 3.11 riêng, cài `mlx-lm` và `huggingface-hub`; mô hình sau khi tải hoạt động offline. Tất cả model đều kiểm tra đủ tệp và shards, không nhận model dở là đã cài.
- Cài đặt AI có 10 lựa chọn: Tự động, Argos, tám MLX; thêm cân bằng/tiết kiệm/chất lượng, kiểm tra dung lượng/đã cài, tải tiếp, sửa runtime và xóa mô hình sau xác nhận hai lần.
- Trên Windows và Mac Intel, các lựa chọn MLX bị khóa và Argos vẫn dùng được.
- Khi Tự động, chỉ chọn MLX có sẵn, Argos dự phòng; khi người dùng chọn mô hình MLX cụ thể thì không tự đổi sang mô hình khác nếu chưa cài.
- Tốc độ xử lý MLX phụ thuộc phần cứng, bộ nhớ và model; lần đầu tải mô hình có thể mất vài GB dung lượng và cần internet.

## Build và phiên bản
- Nhánh `experiment/rust-tauri-v2`, phiên bản `4.23.17-tauri.23.8`, tag bất biến `rust-lab/v23.8`.
- Sửa test v23.7 còn đòi ZIP nguồn trong Downloads, trong khi build cá nhân Mac đã chuyển sang **duy nhất một `.app`**.
- Lệnh build Mac một dòng không đổi:
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
- Workflow GitHub Release giữ **Universal DMG + ZIP mã nguồn** (và Windows Setup/Portable + checksum); không sửa Electron hay main.

**Giới hạn:** Chưa thử tải mô hình nhiều GB/chạy inference trên Mac của người dùng. GitHub CI kiểm tra biên dịch đa nền tảng; chỉ khẳng định có DMG/EXE khi workflow thành công.
