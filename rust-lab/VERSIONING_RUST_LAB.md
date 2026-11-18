# Quy tắc lưu phiên bản — Open IPTV Pro Rust Lab

Áp dụng cho **nhánh thử nghiệm** `experiment/rust-tauri-v2` trong repository `trisanghy/open-iptv-pro`. Không chỉnh sửa, gộp tự động hoặc phát hành lên `main`.

## Commit, bản phát hành và bản sửa nhỏ

- Mỗi lần cập nhật mã nguồn đều tạo **Git commit mới**; không force-push hoặc ghi đè lịch sử commit.
- Phiên bản chính thức tiếp theo: **v19, v20, v21...**. Tag có namespace `rust-lab/v19`, `rust-lab/v20` để không trùng với các tag Electron hoặc nhánh thí nghiệm khác.
- Chỉnh sửa nhỏ sau v19: **v19.1, v19.2...**, tag `rust-lab/v19.1`, `rust-lab/v19.2`.
- `package.json` là nguồn của số phiên bản: `4.23.17-tauri.19` → `4.23.17-tauri.19.1` (bản sửa nhỏ) hoặc `4.23.17-tauri.20` (bản lớn). Khi đổi version phải đồng bộ nhãn UI, mô tả, script build và ghi chú thay đổi.
- **Không xóa, di chuyển, force-update hoặc tái sử dụng tag đã tồn tại.** Một tag luôn chỉ tới một commit bất biến.

## Tự động tạo tag

Workflow [Rust Lab - immutable version tags](.github/workflows/rust-lab-version-tags.yml) chạy sau mỗi push lên đúng nhánh `experiment/rust-tauri-v2`, dùng script `scripts/tag-rust-lab-release.sh`.

1. Đọc số phiên bản trong `package.json` và suy ra tag `rust-lab/v...`.
2. Nếu chưa có tag, **tạo annotated tag mới** trỏ tới commit push rồi đẩy tag lên GitHub.
3. Nếu tag đã có, **không ghi đè**. Nếu mã nguồn, bộ test hoặc script build đã đổi so với commit có tag mà chưa tăng phiên bản, workflow báo lỗi để yêu cầu tạo phiên bản vá tiếp theo. Commit chỉ đổi tài liệu vẫn được giữ nhưng không cập nhật tag cũ.

Workflow chỉ có `permissions: contents: write` cho thao tác tạo tag; GitHub Actions cần được bật và token cần có quyền tạo refs. Nếu workflow bị hạn chế bởi cài đặt repository, tag sẽ không tự xuất hiện: kiểm tra mục **Actions** và **Tags**.

## Tải phiên bản cũ chính xác

Sau khi tag tồn tại, GitHub luôn có URL ZIP riêng:

- v19: `https://github.com/trisanghy/open-iptv-pro/archive/refs/tags/rust-lab/v19.zip`
- v19.1: `https://github.com/trisanghy/open-iptv-pro/archive/refs/tags/rust-lab/v19.1.zip`
- v20: `https://github.com/trisanghy/open-iptv-pro/archive/refs/tags/rust-lab/v20.zip`

Script Mac một lệnh lấy **một ZIP nguồn theo tag** và giữ đúng ZIP đó làm nguồn đi kèm DMG. Kết quả v19 nằm ở `~/Downloads/OpenIPTVPro_RustLab_v19_Build/` với **chỉ DMG và ZIP mã nguồn**. Nếu build lại cùng phiên bản, thư mục mới có hậu tố `_2`, `_3`... để không ghi đè đầu ra trước.

**Giới hạn:** Git tag giữ được mã nguồn và lịch sử. Nó **không tự lưu DMG lên GitHub Releases**; DMG vẫn được build trên Mac. Chỉ số phiên bản có tag sau khi workflow thành công mới được coi là phiên bản đã lưu trữ.

Không tự tạo tag tương tự cho nhánh `experiment/native-webview-ffmpeg` hoặc cho Electron `main` bằng workflow này.
