# Open IPTV Pro Rust Lab v23.7 — Mac build chỉ một ứng dụng .app

## Quy tắc build mới
- Lệnh Terminal gửi cho người dùng trên Mac **chỉ tạo một `.app`** trong một thư mục riêng tại `~/Downloads/OpenIPTVPro_RustLab_v23_7_Build/`.
- Script vẫn tải đúng mã nguồn `rust-lab/v23.7` tạm thời, kiểm tra `package.json`, cài dependency khi cần, build bằng `npm run build -- --bundles app`. Toàn bộ ZIP nguồn, thư mục build tạm và các file trung gian được tự động dọn.
- `ditto` sao chép nguyên bundle với `Info.plist`, tệp thực thi và resource; kiểm tra đầu ra chỉ có một bundle `.app`.
- Giữ nguyên URL script Mac cũ để người dùng không phải đổi cú pháp Terminal; kết quả build đổi từ DMG+ZIP thành duy nhất `.app`.

## GitHub Release không thay đổi
- **Không sửa workflow** `.github/workflows/rust-lab-version-tags.yml`.
- macOS Universal DMG; source ZIP cùng tag, Windows Setup/Portable và SHA256SUMS tiếp tục theo quy trình GitHub Actions trước đây.
- Đánh tag bất biến mới `rust-lab/v23.7`, không sửa `main`, Electron hoặc tag v23.6 và cũ hơn.
- Các chức năng Live Translate, Argos, Whisper, Piper/VieNeu, giao diện AI v23.6 giữ nguyên.

## Một lệnh build Mac
```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Khi build thành công, mở thư mục Downloads mới có đúng một ứng dụng `Open IPTV Pro Rust Lab.app`. Không có `.dmg` hay `.zip` trong thư mục đó. **Chưa xác nhận chạy được trên Mac thực tế hoặc được ký/notarize.**
