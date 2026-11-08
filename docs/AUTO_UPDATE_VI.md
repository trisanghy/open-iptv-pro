# Cập nhật phiên bản trong Open IPTV Pro v4.16

1. Vào **Cài đặt → Cập nhật phiên bản**. Mặc định bật **Tự kiểm tra khi mở ứng dụng** và **Tự tải khi có bản mới**; có thể tắt riêng từng tùy chọn.
2. Khi GitHub Releases có phiên bản cao hơn và đúng bộ cài của hệ điều hành, chọn **Tải phiên bản mới**.
3. Theo dõi tiến độ; app xác minh checksum/signature rồi mới hiện tùy chọn cài đặt.
4. Với bản ký hợp lệ: chọn **Cài đặt và khởi động lại**. Chương trình thoát và cài phiên bản mới.
5. Với bản portable hoặc chưa ký: chương trình tải vào **Downloads/Open-IPTV-Pro-Updates** và có nút **Mở bộ cài đã tải**; làm theo hướng dẫn của macOS/Windows.

Không bao giờ cho phép cài phiên bản không có checksum hợp lệ. Nếu thiếu file `SHA256SUMS.txt`, tải thủ công từ GitHub Releases. Chức năng tải tự động không hoạt động với Release chỉ có source code; phải đính kèm DMG + ZIP + `latest-mac.yml` cho macOS hoặc NSIS Setup + `latest.yml` cho Windows.

## Lưu ý cho người phát hành

- Đẩy mã nguồn v4.16 lên `main`, tăng `package.json` thành `4.16.0`, sau đó tạo tag **v4.16.0**. Workflow `.github/workflows/release-desktop.yml` build các bộ cài và gắn vào GitHub Release.
- Ký macOS với `MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD` và thông tin notarize `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` trong Secrets. Không đăng các khóa này lên repo.
- Ký Windows với `WIN_CSC_LINK` / `WIN_CSC_KEY_PASSWORD`. Không có chứng chỉ vẫn build được để thử, nhưng người dùng được hướng dẫn nâng cấp thủ công.
- GitHub Release cần có `SHA256SUMS.txt`, `latest.yml`, `latest-mac.yml`, `.exe`, `.dmg` và `.zip`.
- Người đang dùng **v4.15** phải cài **v4.16 lần đầu** theo cách thủ công vì bản cũ chưa có mã tự tải/cài. Từ các bản ký tiếp theo mới có thể nâng cấp ngay trong ứng dụng.
- Ứng dụng không dùng tính năng ghi/push mã nguồn lên GitHub.
