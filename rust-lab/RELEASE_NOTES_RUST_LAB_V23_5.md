# Open IPTV Pro Rust Lab v23.5 — sửa lỗi build Mac

## Nguyên nhân
Tag `rust-lab/v23.4` chứa mã nguồn `4.23.17-tauri.23.4` đúng, nhưng builder đối chiếu bằng biểu thức tĩnh phiên bản cũ `4.23.17-tauri.23.3`, gây lỗi giả "Tag không chứa đúng nguồn v23.4".

## Sửa lỗi
- Dùng BSD `sed -E` có sẵn trên Mac để trích `version` từ `package.json` bên trong ZIP, đối chiếu trực tiếp với `VERSION` trong script. Không còn phiên bản tĩnh bị quên khi nâng version.
- Đồng bộ package, tiêu đề cửa sổ, tiêu đề HTML, tên thư mục đầu ra, tên tag và lệnh build thành v23.5.
- Sửa bài test hồi quy dùng version/tag động; kiểm tra sự hiện diện của bộ đối chiếu mới.
- Giữ trọn các cập nhật v23.4 kế thừa từ Electron v4.23.66. Không sửa `main`, nhánh Electron, hoặc tag cũ.

Tag bất biến mới được workflow tạo: `rust-lab/v23.5`; bản v23.4 không bị thay đổi.

## Một lệnh trên Mac

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```

Kết quả khi build thành công: `~/Downloads/OpenIPTVPro_RustLab_v23_5_Build/` chỉ chứa DMG và ZIP nguồn của cùng tag; không cần tải source thủ công.

**Giới hạn:** chưa xác nhận native DMG và kiểm thử giọng/video thực tế trên máy người dùng; cần theo dõi GitHub Actions hoặc build Mac.
