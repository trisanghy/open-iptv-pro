# Open IPTV Pro Rust Lab v23.8.19 — hiện đầy đủ phụ đề dài

- Khắc phục phụ đề gốc và bản dịch bị kéo thành một dòng ngang rồi mất phần cuối trên video.
- Đặt khung phụ đề rộng 92% video thay vì `width: max-content`, để các câu dài có chỗ xuống dòng.
- Bỏ hoàn toàn giới hạn 2 dòng (`-webkit-line-clamp: 2`) và bỏ giới hạn khung phụ đề 34%/210px từng làm ẩn câu dài. Cả tiếng gốc và dịch được xuống dòng tự nhiên, kể cả khi có khoảng trắng hoặc từ rất dài.
- Bỏ cắt chuỗi 500 ký tự khi hiển thị; giữ toàn bộ văn bản Whisper/Translate.
- Khi nội dung xuống nhiều dòng vượt diện tích phát, giảm kích thước *hiển thị* từ mức đã chọn xuống tối thiểu 12px; vẫn giữ nguyên cài đặt kích thước của người dùng. Nếu nội dung đặc biệt dài, khung phụ đề có cuộn riêng thay vì mất phần cuối.
- Điều chỉnh theo kích thước video, thay đổi cửa sổ và toàn màn hình. Giữ vị trí, màu, font, TTS đồng bộ và cài đặt CC đã lưu.
- Giữ nguyên PiP gốc, nhóm 3 nút Live Caption/Translate/TTS và các cập nhật khác.
- Commit/tag riêng `rust-lab/v23.8.19`; không thay đổi main và không ghi đè tag cũ.
- Mac local chỉ xuất một ứng dụng `.app`. GitHub Actions tiếp tục xây Windows Setup/Portable, macOS Universal DMG, Source ZIP/Checksum khi CI thành công.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
