# Open IPTV Pro Rust Lab v23.4 — parity từ Electron v4.23.66

Nền Rust: `ab07310b497cf652cc9990f839e8f7b8e4cec8f8` (Rust Lab v23.3).
Nguồn Electron: `1010d6c04207c1a2f77cd72605ec6219cad10cc2` (Electron v4.23.66, nhánh `build-sources/electron-desktop`).

## Đã cập nhật
- Hai hàng Live Caption / Live Translate và TTS gọn; giữ nguyên player/video.
- Điều chỉnh tốc độ TTS 0.6–2.0× cho giọng phát và nghe thử, lưu thiết lập trong máy.
- Giới hạn sinh giọng 45 giây, bỏ kết quả cũ quá 25 giây; nghe thử giới hạn 90 giây, khi nghe thử vẫn giữ câu phụ đề mới nhất để tiếp tục phát sau đó.
- Khi Live Translate bật, chỉ bản dịch đích xuất hiện trực tiếp trên video. Phụ đề gốc không lặp dưới video. VTT qua PiP là best-effort.
- PiP tự động khi chuyển tab (mặc định bật), tùy chọn PiP khi thu nhỏ/mất tiêu điểm (mặc định tắt), dùng cùng player.
- Gợi ý tài nguyên cho Whisper, Argos, Piper, VieNeu: chỉ tham khảo, không tự tải model.
- Bài test hồi quy giao diện và cập nhật builder Mac một lệnh thành v23.4.

Giữ mã nhận diện ngôn ngữ nguồn, dịch Argos trực tiếp/bắc cầu, bỏ dịch khi cùng ngôn ngữ và source ducking của Rust Lab v23.3.

## Giới hạn chưa đồng bộ
- Backend MLX Hy-MT2/Qwen3, VietVoice/F5, FFprobe bundled, quản lý/xóa mọi model, chọn version cập nhật của Electron. Không quảng cáo các engine chưa có backend.
- Các tác vụ PiP khi cửa sổ mất focus phụ thuộc quyền WebView/OS và có thể bị chặn.
- Chưa xác nhận chạy nhận diện/giọng thực và build native cho đến khi thử trên thiết bị/CI.

Version package: `4.23.17-tauri.23.4`; tag bất biến `rust-lab/v23.4` do workflow tạo trên nhánh `experiment/rust-tauri-v2`. Không sửa `main`, nhánh Electron hay các tag cũ.

Mac build sau khi tag xuất hiện:
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
