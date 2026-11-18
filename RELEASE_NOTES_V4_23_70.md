# Open IPTV Pro v4.23.70 — COPYRIGHT / M3U / SMART DISCOVERY VERIFIED RELEASE
**Ngày:** 18/11/2026 · **Electron 4.23.70 Stable** · **Rust Lab v23.8.30 Beta** · **Web Online (mới nhất)**

## Bản phát hành này sửa gì?
Release tổng hợp v4.23.69 đã có README và source cảnh báo, **nhưng bốn file cài đặt Electron được lấy nguyên từ binary v4.23.68 trước khi cảnh báo được tích hợp**. Release này đóng gói lại **Electron v4.23.70 từ source có mã xác nhận quyền sử dụng**, thay vì tái sử dụng installer cũ. Giữ nguyên các tag/Release v4.23.68, v4.23.69 để đối chiếu, **không khuyến nghị dùng các installer cũ nếu cần xác nhận quyền sử dụng trong ứng dụng**.

## Xác nhận trong ứng dụng
- Trước khi thêm **file M3U / link M3U / playlist URL từ repository**: hộp cảnh báo ghi rõ tác giả không cung cấp nội dung và người dùng tự chịu trách nhiệm; checkbox phải do người dùng tích, không chọn sẵn.
- **Smart Discovery:** hai xác nhận độc lập về điều khoản nhà cung cấp, quyền truy cập/bản quyền trước khi khám phá hoặc kiểm tra danh sách; kiểm tra tín hiệu thành công không chứng nhận bản quyền; xác nhận lại trước khi nhập kênh.
- Từ chối xác nhận/Hủy thì không thực hiện nhập mới. Trình phát, AI, EPG, PiP, yêu thích và dữ liệu nguồn cũ vẫn hoạt động như cũ.
- **Trách nhiệm người dùng:** tự kiểm tra quyền xem, nội dung, bản quyền, luật áp dụng, dữ liệu, tài khoản, bản ghi hình. Tác giả không chịu trách nhiệm về nguồn và nội dung do người dùng tự chọn/xem, hoặc dữ liệu người dùng quản lý, **trong phạm vi pháp luật cho phép**.
- Chi tiết: [COPYRIGHT_NOTICE_V4_23_70.md](COPYRIGHT_NOTICE_V4_23_70.md), [README](README.md), [LICENSE](LICENSE).

## Thành phần tải xuống và phân biệt phiên bản

| Nền tảng | Phiên bản thực thi | Installer | Nguồn |
|---|---|---|---|
| Electron Stable | **4.23.70**, build MỚI từ mã có checkbox | Mac ARM64 DMG, Mac Intel DMG, Windows Setup và Portable EXE | `build-sources/electron-desktop` commit `63058b8811335eb336a58772721649c89ec41b71` |
| Rust Lab Beta | **23.8.30**, đã có cảnh báo và xác nhận từ Release trước | Mac Universal DMG, Windows Setup/Portable, ZIP nguồn | `rust-lab/v23.8.30` bất biến |
| Web Online | Snapshot website mới nhất từ `web/online` | ZIP website, trang GitHub Pages | [trisanghy.github.io/open-iptv-pro](https://trisanghy.github.io/open-iptv-pro/) |
| Mã nguồn tổng hợp | Git commit tag `v4.23.70` | Full Source ZIP (Electron/Rust/Web) | [main](https://github.com/trisanghy/open-iptv-pro) |

**Tất cả file phát hành** được kiểm tra checksum SHA-256. Các gói Rust v23.8.30 được **giữ đúng file đã có cảnh báo**, không đổi tên engine hay gắn số phiên bản Electron. Đính kèm Release gồm: bốn installer Electron mới, bốn file Rust Lab hợp lệ, ZIP Web, ZIP Full Source, README, RELEASE_NOTES, INSTALL, bảng tính năng, bản đồ nguồn, cảnh báo bản quyền, bảng SHA-256 và checksum gốc.

## Kiểm thử và giới hạn
GitHub Actions kiểm tra: phiên bản, thứ tự nạp JS hộp cảnh báo; chạy bộ test Electron và kiểm thử consent/SSRF Web-Rust; xác nhận installer Electron thực sự chứa file `renderer/source-use-consent-v1.js` và có bản quyền ngay trong ASAR, kiểm Mac architecture/Windows installer, kiểm ZIP + SHA-256. **Chỉ công bố Release sau khi tất cả bước hoàn tất thành công**.

Giới hạn: nguồn IPTV phụ thuộc codec, mạng, CORS, DRM, trình duyệt/hệ điều hành; Live Caption/Translate/TTS cần mô hình và tài nguyên. Hộp xác nhận không thể tự xác minh quyền sở hữu nội dung. Installer có thể chưa ký số/notarize. Các bản phát hành cũ được bảo toàn nhưng không được cập nhật ngược.

**Xem:** [Hướng dẫn cài đặt](docs/INSTALL_V4_23_70.md) · [So sánh tính năng](docs/COMPARE_EDITIONS_V4_23_70.md) · [Nguồn phiên bản](docs/RELEASE_SOURCE_MAP_V4_23_70.md).

## English
v4.23.70 replaces the previously bundled older Electron binaries with **freshly built Electron 4.23.70 installers** containing explicit M3U and Smart Discovery rights confirmations. Rust Lab 23.8.30 and Web already support the notice. Legal/source/data responsibility terms are included in README and an attached bilingual notice. All assets are verified by SHA-256. Prior immutable releases remain available for rollback.
