# Rust Lab v11 — Thu gọn danh sách kênh

## Sử dụng
1. Mở **Xem truyền hình**.
2. Bấm **❮** cạnh nút **↻** ở đầu **Danh sách kênh** để thu gọn riêng cột kênh.
3. Bấm **☷ Danh sách kênh ›** phía trên video để mở lại.

Vẫn dùng được nút thu gọn sidebar ứng dụng. Trạng thái cột kênh được lưu riêng.
Trong Cinema TV, nút **Tất cả kênh** tiếp tục mở drawer như bản trước.

## Build macOS
```bash
bash BUILD_MAC_FAST.command
```

File DMG khi build thành công nằm tại `src-tauri/target/release/bundle/dmg`.
Cần sẵn Node.js/npm, Rust/Cargo và Xcode Command Line Tools.

## Kiểm thử nhanh
```bash
npm run test:quick
```

## Đăng riêng Git (tùy chọn)
```bash
bash PUBLISH_RUSTLAB_V11_GITHUB_MAC.command
```
Chỉ push nhánh `experiment/rust-tauri-v2`; script cần xác thực GitHub và quyền push. Không push `main`.


- v15: Thu nhỏ nút mở lại Danh sách kênh khi panel đã thu gọn, hiển thị thành 1 icon nổi nhỏ ở góc trên trái, bỏ thanh rộng phía trên video.
