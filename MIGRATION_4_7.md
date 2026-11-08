# Upgrade 4.6 → 4.7

- Menu riêng `Thu thập & sửa kênh` đã được xóa. Mọi nút liên quan có mặt trong **Quản lý nguồn**.
- Cấu hình nguồn, trạng thái, playlist, snapshot và kết quả gộp sử dụng cùng localStorage cũ; không xóa dữ liệu.
- `IPTVState.setPage("collector")` vẫn điều hướng về trang `sources` để tương thích.
- Icon nền sáng dùng PNG/ICNS/ICO mới.
- Không cần cấp quyền GitHub: nguồn chỉ được đọc công khai, không có API ghi repository.
