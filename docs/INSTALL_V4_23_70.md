# Hướng dẫn cài đặt — Open IPTV Pro v4.23.70 (có cảnh báo bản quyền)

**Tải tất cả file từ [GitHub Release v4.23.70](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.70)**. Bản này đã thay thế binary Electron cũ bằng **Electron v4.23.70 build mới có hộp xác nhận quyền sử dụng**. Rust Lab giữ phiên bản v23.8.30 đã có cảnh báo.

| Hệ điều hành | Electron 4.23.70 Stable (build mới) | Rust Lab v23.8.30 Beta |
|---|---|---|
| Mac Apple Silicon | `Open-IPTV-Pro-4.23.70-mac-arm64.dmg` | `OpenIPTVPro-RustLab-v23.8.30-mac-universal.dmg` |
| Mac Intel | `Open-IPTV-Pro-4.23.70-mac-x64.dmg` | DMG Universal như trên |
| Windows 10/11 x64 | `Open-IPTV-Pro-Setup-4.23.70-x64.exe` hoặc `Open-IPTV-Pro-4.23.70-x64.exe` Portable | `OpenIPTVPro-RustLab-v23.8.30-Windows-Setup-x64.exe` hoặc Portable ZIP |
| Web | [Mở Web Online](https://trisanghy.github.io/open-iptv-pro/) | Không cần cài |

## Cài trên Mac
1. Tải đúng bản DMG cho Mac ARM64/Intel (Rust Lab dùng Universal).
2. Mở DMG và kéo ứng dụng vào Applications. Nếu macOS hiển thị cảnh báo chưa ký/notarize, đối chiếu SHA-256 và nguồn chính thức trước khi dùng **Open Anyway** theo hướng dẫn macOS; không tắt toàn hệ thống Gatekeeper.
3. Mở ứng dụng, nhấn Mở file M3U hoặc Thêm URL. **Bạn phải xem cảnh báo và chủ động tích xác nhận quyền sử dụng** thì mới được nhập nguồn.
4. Với Smart Discovery, phải tích **hai điều khoản riêng** trước khi tìm/kiểm tra, và xác nhận tiếp trước khi nhập kênh. Không dùng kênh mà bạn chưa xác minh quyền xem.

## Cài trên Windows
1. Chọn Setup EXE để cài thường hoặc Portable EXE để dùng không cài.
2. Kiểm tra mã SHA-256 và nhà phát hành tải trước khi vượt qua cảnh báo SmartScreen.
3. Khi mở file/link M3U, hệ thống hiển thị xác nhận quyền sử dụng, **không tự chọn**. Smart Discovery có xác nhận riêng.
4. Sao lưu playlist, yêu thích và dữ liệu trước khi thay đổi phiên bản. **Không dùng Rust Lab đè lên Electron**.

## Web Online
Mở https://trisanghy.github.io/open-iptv-pro/ và sử dụng playlist của chính bạn. Trang web không cung cấp quyền xem kênh. Hạn chế về codec, CORS, autoplay và DRM thuộc trình duyệt/nguồn.

## Xác minh file và thông báo bản quyền
- Tải `SHA256SUMS.txt` từ cùng Release.
- Mac: `shasum -a 256 ten-file.dmg`; Windows PowerShell: `Get-FileHash -Algorithm SHA256 .\ten-file.exe`. Đối chiếu với bảng công bố.
- Đọc [Thông báo bản quyền & trách nhiệm](../COPYRIGHT_NOTICE_V4_23_70.md) và phần cuối [README](../README.md).
- **Tác giả chỉ phát triển ứng dụng cá nhân, không cung cấp nội dung; người dùng tự chịu trách nhiệm về nguồn, dữ liệu và nội dung nhập/xem; miễn trừ trách nhiệm trong phạm vi pháp luật cho phép.**
- Bộ cài Electron v4.23.68 trong Release cũ **không được xác nhận có hộp kiểm mới**, vì thế ưu tiên bản Electron 4.23.70.

## Mã nguồn và tự build
[ZIP nguồn đầy đủ của bản mới](https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.70) bao gồm Electron, Rust, Web, README, hướng dẫn và cảnh báo. Để build riêng trên Mac từ nhánh Electron:

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'
```

Thư mục Downloads sẽ giữ một `.app` sau khi build theo script hiện tại. Rust Lab có script riêng tại `experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh`.

**Không chia sẻ hoặc tự động nhập kênh trái phép. Xác nhận điều khoản là tự cam kết, không phải giấy phép nội dung.**
