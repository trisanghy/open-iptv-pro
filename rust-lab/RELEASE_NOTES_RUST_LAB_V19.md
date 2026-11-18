# Open IPTV Pro Rust Lab v19 — Ghi chú phát hành

**Ngày:** 16/11/2026  
**Phiên bản mã nguồn:** `4.23.17-tauri.19`  
**Nhánh:** `experiment/rust-tauri-v2`

## Tóm tắt

v19 ưu tiên **ổn định thao tác phát IPTV** bằng cách hoàn tác bố cục điều khiển hai hàng mới không tương thích từ v16. Người dùng quay lại cách sắp xếp đã hoạt động ở v15, nhưng vẫn giữ riêng hai cải tiến: khung video đổi tỷ lệ tự động theo nguồn (v17) và tab mở danh sách kênh hẹp 15 px (v18).

## Giao diện điều khiển được khôi phục

- **Thông tin kênh:** tên kênh, selector Link phát (link chính/dự phòng), nút Yêu thích.
- **Playback:** Trước, Phát/Tạm dừng, Dừng, Sau.
- **Điều khiển bổ sung:** âm lượng, chụp ảnh, Khung hình (vừa/lấp đầy), Cast/AirPlay, PiP, toàn màn hình.
- **Khung riêng:** EPG hiện tại và các chức năng Tua lại / Hẹn ghi; không đặt chồng lên thanh playback.

Để khôi phục đúng giao diện, phần JavaScript thay đổi vị trí DOM và CSS bố cục hai hàng của v16 đã được loại khỏi tuyến giao diện đang chạy. Các ID điều khiển gốc được giữ nguyên.

## Các cải tiến vẫn giữ

- **Tỷ lệ nguồn (v17):** 16:9 mặc định trước khi nhận metadata; sau đó theo kích thước thực của luồng, tự cập nhật khi độ phân giải thay đổi; không kéo méo nội dung khi dùng 'Vừa khung'.
- **Tab mở danh sách kênh (v18):** bề ngang 15 px, chiều cao 40 px, ở mép sidebar; thao tác thu/mở danh sách độc lập với nút `☰`.
- Giữ hệ thống nguồn dự phòng và xử lý chuyển kênh đã triển khai trong nhánh Rust Lab.

## Build Mac một lệnh

```bash
curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash
```

Script tải một ZIP từ nhánh thử nghiệm, xác nhận v19 trước build, tạo DMG và dọn thư mục tạm. Nếu thành công, đầu ra là `~/Downloads/OpenIPTVPro_RustLab_v19_Build/` với **một DMG và một ZIP mã nguồn v19**.

## Kiểm thử và giới hạn

Kiểm thử JavaScript của lần sửa được báo cáo: **30/30 nhanh**, **96/96 chính**. Chưa xác minh build DMG trên máy Mac thực hoặc tương thích nguồn IPTV/codec/Timeshift/DVR/Cast trên phần cứng thật. Windows cần công cụ MSVC/WebView2 theo tài liệu kỹ thuật.

**Phạm vi:** Nhánh `experiment/rust-tauri-v2`. Không sửa `main`, không tự tạo release cho bản Electron chính.
