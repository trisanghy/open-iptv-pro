# Open IPTV Pro Rust Lab — Build & GitHub

Nhánh: `experiment/rust-tauri-v2`. Không thay đổi Electron `main`.

## Build Mac

Trên Mac có Xcode CLI, Rust/Cargo và Node.js, trong thư mục mã nguồn chạy:

```bash
bash BUILD_MAC_TAURI.command
```

DMG sau khi build thành công: `src-tauri/target/release/bundle/dmg/`.

## Push riêng nhánh GitHub

Khi có quyền và đã cho phép đăng tải mã nguồn, trong thư mục nguồn chạy:

```bash
bash PUBLISH_RUSTLAB_V8_GITHUB_MAC.command
```

Script clone vào thư mục riêng rồi push nhánh thí nghiệm, không force push, không tạo release và không sửa `main`. Cần đăng nhập GitHub trong trình duyệt lần đầu.

## Kiểm thử

- `npm test`: 104/104 bài kiểm thử JS đạt trong môi trường đóng gói.
- Test giao diện ở trình duyệt mô phỏng đã kiểm tra toggle sidebar (mở rộng, dải biểu tượng 72px), không lỗi JS; thử ở 5 preset UI.
- Chưa có bằng chứng Cargo build / DMG hoặc EXE hoàn tất trên máy thật cho bộ v8 này.
