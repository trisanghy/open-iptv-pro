# Build & Release — Open IPTV Pro

Bản tổng hợp hiện tại: **Electron Desktop v4.23.70 Stable**, **Rust Lab v23.8.30 Beta** và **Web Online**. Bản này có cảnh báo M3U/Smart Discovery và build lại Electron installer.

## Electron (mã chính tại gốc)

Node.js 22+, npm:

```bash
npm install --no-audit --no-fund
npm test
npm start
```

**macOS, một lệnh build `.app` trên máy người dùng:**

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'
```

Để build DMG từ source: `BUILD_MAC_DMG_ONLY.command` hoặc `npm run dist:mac:arm64` / `npm run dist:mac:x64`. Windows: `BUILD_WINDOWS.bat` hoặc `npm run dist:win`. Chạy trên đúng kiến trúc để FFmpeg/FFprobe tương thích.

## Rust Lab (mã riêng trong rust-lab/)

Mã nguồn có `src-tauri/`, `renderer/`, `tests/`, `scripts/`. Dùng Node 22+, Rust stable và công cụ native của Tauri 2. Tại thư mục `rust-lab/`:

```bash
npm ci
npm run test:quick
npm run build
```

Build Mac tự động: [script trên nhánh Rust](https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh). Rust Lab là **Beta**; không thay thế Electron Stable.

## Web Online (mã riêng trong web/)

`web/index.html` và các file JS/CSS cùng cấp là site đã đóng gói. `web/web-online/` có scripts, tests, bản dựng nguồn. GitHub Pages triển khai từ nhánh [web/online](https://github.com/trisanghy/open-iptv-pro/tree/web/online). Tại `web/`: `python3 -m http.server 8000` để dùng local.

## GitHub Actions & release

- `.github/workflows/test.yml`: kiểm thử tự động khi push `main`.
- `.github/workflows/tao-bo-cai.yml`: build thủ công qua Actions.
- `.github/workflows/publish-portfolio-v42370.yml`: workflow build lại Electron 4.23.70 cho Mac/Windows; kiểm thử hộp quyền sử dụng trong file cài đặt, đóng gói Rust/Web và tạo Release mới, không ghi đè tag cũ.
- [Release có bản quyền trong installer](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.70) có installer Mac/Windows, Rust Lab, Web ZIP, Full Source, release notes và SHA256SUMS.

**Không tạo/ghi đè tag release chỉ vì dọn mã nguồn.** Thay đổi tiếp theo sẽ có commit mới trên main; bản `v4.23.68` vẫn giữ đúng snapshot đã xuất bản. Giữ riêng `build-sources/electron-desktop`, `experiment/rust-tauri-v2`, `web/online`.

## Thận trọng

Trước khi phát hành tiếp: chạy `npm test`, build native trên từng OS, đối chiếu checksum, kiểm tra app tải được. Đừng vô hiệu Gatekeeper toàn hệ thống để chạy app chưa ký; đừng commit khóa Cloud Sync bí mật.
