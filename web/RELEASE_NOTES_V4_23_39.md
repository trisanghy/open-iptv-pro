# Open IPTV Pro v4.23.39 — Full-width Adaptive Player

**Ngày cập nhật:** 16/11/2026  
**Hệ điều hành:** Windows & macOS (Intel / Apple Silicon)  
**Nền tảng:** Electron / Chromium  
**Trạng thái:** Cập nhật mã nguồn (không phải installer Release)

## Giới thiệu

**Xem truyền hình thoáng hơn, hình ảnh tự nhiên hơn, điều khiển gọn hơn.**  
Open IPTV Pro v4.23.39 tập trung hoàn thiện trình phát: tận dụng tối đa chiều ngang cửa sổ, tự hiểu tỷ lệ khung hình từ luồng video và giữ toàn bộ thanh điều khiển tách biệt khỏi hình ảnh.

*Wider playback. Native aspect ratios. Controls where they belong.*

## Sửa lỗi và nâng cấp

1. **Fit bề ngang thực sự:** khung video lấp đầy 100% chiều rộng vùng nội dung khả dụng, chỉ giữ khoảng viền của giao diện. Bỏ phép giới hạn chiều ngang phụ thuộc chiều cao cửa sổ gây hai mép đen lớn ở v4.23.38.
2. **Theo tỷ lệ nguồn:** khung mặc định **16:9**, sau đó tự đổi sang tỷ lệ dựa trên metadata nguồn; xử lý khi luồng phát đổi kích thước. Video không bị kéo méo vì kích thước khung.
3. **Điều khiển gọn, không che hình:** giữ bố cục hai hàng: nút kênh/phát/âm lượng/Cast/PiP/fullscreen phía trên, EPG/Khung hình/link phát/yêu thích phía dưới.
4. **Thu gọn linh hoạt:** nút mở lại danh sách kênh gọn, phần nội dung tự nở; sidebar và danh sách kênh hoạt động độc lập.
5. **Giữ các tính năng có sẵn:** quản lý M3U, EPG, FFmpeg, Timeshift, DVR, Snapshot, MultiView, phụ đề nếu nguồn hỗ trợ, sắp xếp kênh/thư mục và quản lý link dự phòng.

## Mã nguồn và xây dựng

- **ZIP nguồn:** [OpenIPTVPro_Source_v4.23.39.zip](source/OpenIPTVPro_Source_v4.23.39.zip)
- **SHA-256:** `9fff925ca8bd5563ba1500bb579e0bc9aa6605f26f411e7b872a09686bc32aa3`
- **Nhánh build tự động (Mac):** `iptv-build-source` — `build-mac-v42339.sh`
- **Build Windows:** theo script đi kèm mã nguồn; việc tạo installer EXE cần thực hiện trên môi trường Windows.

### Một lệnh build macOS

```bash
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/iptv-build-source/build-mac-v42339.sh | bash'
```

Mã nguồn đã qua kiểm thử GitHub Actions trước khi đóng gói ZIP; tạo và chạy DMG thực tế trên Mac cần xác minh ở máy đích. Không tự tạo GitHub Release hoặc tag mới trong lần đồng bộ mã nguồn này.

## Lưu ý ảnh minh họa

Ảnh giao diện trong README phản ánh bố cục v4.23.37 để tham khảo. Thay đổi full-width của v4.23.39 được thể hiện bằng CSS và logic trong mã nguồn, không gắn nhầm ảnh cũ thành ảnh mới.
