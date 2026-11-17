# Open IPTV Pro Rust Lab v23.8.3 — sửa bản dựng macOS Universal trên GitHub Release

## Thay đổi so với v23.8.2
- Sửa quy trình xác minh DMG trên GitHub Actions: Tauri 2 đã dọn bản `.app` tạm sau khi đóng gói `.dmg`, khiến bước xác minh cũ thất bại dù DMG build thành công.
- CI gắn DMG ở chế độ chỉ đọc, kiểm tra `.app` *bên trong DMG*, xác minh executable và FFmpeg đều có kiến trúc Intel `x86_64` + Apple Silicon `arm64`, tháo gắn kết rồi mới đưa DMG vào Release.
- Bổ sung regression test cho bước xác minh DMG, giữ pipeline Windows x64 Setup/Portable và mã nguồn ZIP kèm SHA-256.
- Đồng bộ tên phiên bản trên `package.json`, giao diện, cấu hình Tauri và script build Mac cá nhân.
- Không thay đổi luồng dịch AI/Whisper/Argos/MLX/TTS của v23.8.2; bản vá này tập trung vào đóng gói và phát hành.

## Bản dựng
- **macOS:** Universal DMG dành cho Apple Silicon và Intel trên GitHub Release khi CI thành công (chưa ký/Apple notarize).
- **Windows:** Setup x64 EXE và Portable x64 ZIP.
- **Source:** ZIP đúng tag bất biến `rust-lab/v23.8.3`, cùng các file SHA256SUMS.
- **Mac cá nhân:** lệnh Terminal một dòng vẫn chỉ tạo **một `.app`** trong thư mục Downloads; không xuất DMG hoặc ZIP nguồn tại máy.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Tag mới `rust-lab/v23.8.3` sẽ giữ nguyên mọi phiên bản cũ và không sửa `main`.
