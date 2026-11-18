# Open IPTV Pro Rust Lab v19.2 — Tauri 2 + Rust Desktop

**Nhánh độc lập:** `experiment/rust-tauri-v2` · **Tag bất biến:** `rust-lab/v19.2`

## Giao diện điều khiển theo mẫu

- **Hàng trên:** tên kênh, bốn nút Trước / Phát-Tạm dừng / Dừng / Sau, Cast/AirPlay, PiP, toàn màn hình.
- **Hàng dưới:** EPG hiện tại và tiếp theo từ XMLTV theo kênh, dropdown Khung hình vẫn giữ đúng chức năng, dropdown Link phát và Yêu thích.
- Không dùng JavaScript di chuyển nút sau khi chạy. Các nút giữ ID cũ và có CSS responsive.
- Âm lượng/Chụp ảnh vẫn truy cập trong Công cụ nhanh, không bị xóa chức năng.
- Giữ tỷ lệ nguồn video tự động, mặc định 16:9; giữ tab mở Danh sách kênh 15 px.

## v19.2 sửa lỗi tự động build của v19.1

- Sửa chính xác thứ tự đối số của lệnh `lipo` khi xác minh FFmpeg Apple Silicon/x64 và binary Universal.
- Sửa các bài test cũ ghim phiên bản v19, cập nhật kiểm thử theo version/tag hiện hành.
- Tạo DMG macOS Universal gồm app và FFmpeg hai kiến trúc; build NSIS Windows x64, ZIP portable kèm FFmpeg, ZIP nguồn đúng tag và SHA256SUMS.
- Chỉ công bố GitHub **prerelease** khi cả hai build thành công; **không** thay nhãn Latest của Electron, không chạm main.

> Bộ cài chưa ký mã/notarize. macOS Gatekeeper và Windows SmartScreen có thể cảnh báo.
> Đây là nhánh thử nghiệm, còn giới hạn về Cast/AirPlay, codec/DRM và DASH đặc biệt.

Nếu các job chưa thành công, xem log tại [GitHub Actions](https://github.com/trisanghy/open-iptv-pro/actions); không coi CI vừa khởi chạy là đã phát hành thành công.