# Giải thích lỗi kiểm tra cập nhật

- Có mã nguồn ở GitHub (git push) **không đồng nghĩa** có GitHub Release.
- Bản sửa này phân biệt repository công khai nhưng chưa tạo Release (không còn báo lỗi chung), repo không truy cập được và API GitHub bị giới hạn.
- Khi Release chỉ có mã nguồn, thông báo rõ chưa có `.dmg` / `.exe`.
- Để phần mềm cũ kiểm tra thành công ngay, tạo Release `v4.15.0` trên repo `trisanghy/open-iptv-pro` bằng script `TAO_RELEASE_GITHUB_MAC.command` trong bộ sửa riêng.
- Bản sửa giao diện này là **mã nguồn**, cần build lại để có hiệu lực trên ứng dụng đã cài.
