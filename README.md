# Open IPTV Pro — v4.23.68

**Electron Desktop Stable · Rust Lab v23.8.26 Beta · Web Online**

Trình phát IPTV mã nguồn mở cho macOS, Windows và trình duyệt. Mã nguồn bản phát hành được tổ chức gọn, tách ba nền tảng để tránh nhầm chương trình chạy hoặc build.

| Nền tảng | Mã nguồn | Tải/cài đặt |
|---|---|---|
| **Electron v4.23.68 (Stable)** | `renderer/`, `src/`, `scripts/`, `tests/` | [DMG/EXE v4.23.68](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.68) |
| **Rust Lab v23.8.26 (Beta)** | [`rust-lab/`](rust-lab/) | [Release Rust Lab](https://github.com/trisanghy/open-iptv-pro/releases/tag/rust-lab/v23.8.26) |
| **Web Online** | [`web/`](web/) | [Mở website](https://trisanghy.github.io/open-iptv-pro/) |

## Các tính năng chính

M3U và nhiều nguồn, EPG/XMLTV, thư mục và yêu thích, HLS/DASH, chọn link chính/dự phòng, chụp kênh, kiểm tra nguồn, MultiView, Timeshift, DVR và Cast/AirPlay khi tương thích.

Bản Electron có nhận diện phụ đề, dịch và TTS offline (cài mô hình riêng), CC tùy chỉnh, PiP, 11 kiểu giao diện, snapshot/logo dự phòng và thanh thông tin kênh hiện tại có thể thu gọn. Rust Lab dùng Tauri/Rust, còn trong giai đoạn Beta. Web dùng trình duyệt, có Cloud Sync khi được cấu hình; CORS/codec/autoplay có thể giới hạn luồng phát.

## Chạy và build mã nguồn

Yêu cầu Node.js 22+ và npm. Ở thư mục gốc Electron:

```bash
npm install --no-audit --no-fund
npm test
npm start
```

**Build Electron trên Mac, một lệnh tải mã nguồn và chỉ xuất một `.app`:**

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'
```

**Build Rust Lab trên Mac, một lệnh tải mã nguồn và chỉ xuất một `.app`:**

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

**Windows:** chạy `BUILD_WINDOWS.bat` trong gốc mã Electron hoặc tải file Setup/Portable trên trang Release.

[Hướng dẫn build và release](docs/BUILD.md) · [Hướng dẫn cài đặt](docs/INSTALL_V4_23_68.md) · [So sánh ba nền tảng](docs/COMPARE_EDITIONS_V4_23_68.md) · [Nguồn/commit gốc](docs/RELEASE_SOURCE_MAP_V4_23_68.md).

## Lịch sử và vệ sinh repository

- [Nhật ký thay đổi](CHANGELOG.md) · [Release notes v4.23.68](RELEASE_NOTES_V4_23_68.md) · [Tất cả Release trước](https://github.com/trisanghy/open-iptv-pro/releases).
- `main` là bản tổng hợp; phát triển Electron tại `build-sources/electron-desktop`, Rust tại `experiment/rust-tauri-v2`, Web tại `web/online`.
- Các ZIP source, workflow, tài liệu và screenshot **phiên bản cũ** đã được loại khỏi cây mã nguồn hiện tại; chúng vẫn tồn tại trong lịch sử Git và các tag/Release trước. Không xóa các nhánh gốc hay ghi đè Release.
- Cấu hình phát hành: `.github/workflows/`; tài liệu hiện hành: `docs/`. Ứng dụng không đi kèm nguồn IPTV có bản quyền.

Giấy phép: [LICENSE](LICENSE). Lưu ý thêm [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), [SECURITY.md](SECURITY.md).
