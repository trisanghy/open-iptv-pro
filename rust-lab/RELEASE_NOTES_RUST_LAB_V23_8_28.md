# Open IPTV Pro Rust Lab v23.8.28 — Discovery Safe Mode và SSRF

## Phạm vi đã triển khai
- **File M3U, link M3U và cập nhật thủ công URL:** hộp thoại xác nhận quyền sử dụng trước khi nhập. Nút tiếp tục chỉ hoạt động khi người dùng tự tích vào ô xác nhận; Hủy không thêm dữ liệu.
- **Smart Discovery:** bắt buộc đọc và tự xác nhận điều khoản nguồn, bản quyền và quyền xem trước khi khám phá/kiểm tra. Mỗi lần nhập lô kênh lại yêu cầu xác nhận riêng. Phát được không đồng nghĩa đã được cấp phép.
- **Lưu lựa chọn:** xác nhận Smart Discovery lưu trên thiết bị theo revision `2026-11-18-v1` (không gửi server), tự khôi phục khi khởi động lại; có nút rút xác nhận và phiên bản điều khoản mới sẽ yêu cầu đồng ý lại. Xác nhận M3U thủ công vẫn phải thực hiện riêng cho từng lần nhập.
- **Trách nhiệm nội dung:** Open IPTV Pro không cung cấp kênh hay quyền phát sóng. Người dùng chịu trách nhiệm về nguồn/kênh tự chọn nhập và xem; tác giả không chịu trách nhiệm thay cho nguồn này trong giới hạn pháp luật cho phép. Quy định này không thể xóa bỏ nghĩa vụ pháp lý bắt buộc.
- **SSRF phía Rust:** chặn literal IP nội bộ, loopback, link-local, reserved, IPv6 không công khai, localhost và miền nội bộ; giải DNS và kiểm tra toàn bộ địa chỉ, chặn trả lời pha trộn private/public; pin địa chỉ công khai đã kiểm tra vào kết nối HTTP/TLS, không dùng proxy và không theo redirect tự động.
- **Chuyển hướng:** kiểm tra lại URL, DNS và IP sau từng HTTP redirect (tối đa bốn lần).
- **HLS:** bảo vệ cả các yêu cầu playlist master, media playlist và segment khi Smart Discovery quét kênh.
- **Playlist bên ngoài:** giới hạn dung lượng tải và áp dụng lớp bảo vệ SSRF cho URL M3U nhập tay và bộ danh mục/repository GitHub.
- **Tính tương thích:** không thay engine phát video đang sử dụng, không tự đổi các cài đặt xem trước hay số worker, không thay đường xử lý playlist nội bộ đã có.

## Kiểm thử và phát hành
- Thêm Rust unit tests cho IP, hostname, redirect không hợp lệ; CI Windows chạy `cargo test ... safe_network::tests --lib`.
- Thêm JS regression cho nguồn nhập M3U, xác nhận Smart Discovery, lưu và rút đồng ý, các nhánh tải/quét SSRF.
- **Tag bất biến:** `rust-lab/v23.8.28`, không thay tag v23.8.27 và các release cũ.
- Chỉ cập nhật nhánh `experiment/rust-tauri-v2`; **không thay main hoặc Electron**.
- Build Mac cá nhân vẫn một lệnh chỉ cho một `.app` trong Downloads; GitHub Release tiếp tục Windows Setup, Portable, DMG Universal macOS và ZIP source khi CI thành công.

> Cảnh báo kỹ thuật: Bộ lọc mạng áp dụng cho Discovery và thao tác tải M3U từ URL trong Rust. Trình phát IPTV có thể truy cập nguồn LAN đã được người dùng cấu hình từ trước; phát trực tiếp/FFmpeg không được xem là môi trường sandbox bản quyền hay mạng hoàn chỉnh.

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'
```
