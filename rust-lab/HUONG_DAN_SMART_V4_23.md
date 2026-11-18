# Cập nhật v4.23.2 — Smart Discovery trong Quản lý nguồn

Vào **Quản lý nguồn → Smart Discovery**. Chọn bộ sưu tập: iptv-org theo quốc gia, thể loại, ngôn ngữ, toàn cầu; hoặc Free-TV/IPTV nguồn chọn lọc. Nhấn **Khám phá nguồn**, sau đó chọn **Kiểm tra tất cả (không giới hạn)**, hoặc tùy chọn kiểm tra nhanh 10–1.000 kênh và số kết nối đồng thời (2–8). Nhấn **Kiểm tra luồng**, theo dõi tiến độ và dùng **Hủy** khi cần. Chỉ chọn **Nhập kênh đã xác minh** nếu muốn chỉ nhận các luồng có bằng chứng video. Nút nhập toàn bộ sẽ nhập các kênh chưa được xác minh.

Mỗi lượt quét ưu tiên các kênh chưa từng kiểm tra. Quét tất cả hàng nghìn kênh có thể kéo dài vì ứng dụng phải xác minh dữ liệu video, và kết quả phụ thuộc tốc độ mạng, geoblock, nhà cung cấp. Nguồn nhập không tự xóa hoặc thay URL của các nguồn trước đó. Ứng dụng không vượt DRM hoặc geo-blocking.

# Smart Discovery & IPTV Doctor 3.0 — Open IPTV Pro v4.23.0

## Smart IPTV Discovery

1. Chọn **Smart Discovery** ở thanh bên, chọn quốc gia (mặc định **VN**) và **Khám phá quốc gia**. Danh mục playlist đến từ `https://iptv-org.github.io/iptv/countries/<mã>.m3u` (chỉ dùng dữ liệu công khai).
2. Chọn 10, 25 hoặc 50 kênh rồi **Kiểm tra luồng**. Giới hạn 3 yêu cầu mạng đồng thời; mỗi URL được kiểm tra nhiều vòng để hạn chế lỗi đo giả. **Hủy** ngăn các công việc tiếp theo, không cắt yêu cầu đã gửi.
3. **Nhập kênh đã xác minh** chỉ thêm các kênh được xác nhận có video; **Nhập playlist gốc** nhập cả kênh chưa xác minh sau khi xác nhận thủ công. Dữ liệu nguồn M3U hiện tại không bị ghi đè.
4. Một quốc gia/một loại nhập có thể nhập một lần; muốn nhập lại, vào Quản lý nguồn xóa nguồn cũ trước. Nguồn từ Discovery mặc định tắt chức năng thu thập định kỳ để không vô tình thay tập kênh đã xác minh.

## Doctor 3.0

1. Vào **Smart IPTV Doctor** và xem bảng **Doctor 3.0**. Điểm chất lượng 0–100 là ước lượng ưu tiên theo lịch sử, không phải % thời gian sống.
2. **Kiểm tra kênh chưa rõ** chỉ chạy khi bấm, tối đa 40 kênh mỗi lượt. Trạng thái Die chỉ ghi khi có bằng chứng nhiều lần tại URL chính; nếu thiếu bằng chứng, để Chưa rõ.
3. Đề xuất link dự phòng yêu cầu khớp tvg-id hoặc tên + metadata cùng nhóm/logo, có bằng chứng hoạt động trong 24 giờ, và người dùng xác nhận. Chỉ thêm link dự phòng; không thay link chính. Bấm **Hoàn tác** để phục hồi dự phòng gần nhất.
4. Có thể **Xuất báo cáo 3.0** dạng JSON. Cấu hình Doctor 2.0, Backup/Restore, FFmpeg và EPG vẫn hoạt động.

## Giới hạn và bảo vệ dữ liệu

- Danh mục iptv-org thay đổi liên tục; một số URL có chặn vùng/mật khẩu/DRM và không thể xem. Không kiểm tra bằng cách vượt xác thực.
- Không tự tìm kiếm toàn bộ web hoặc quét mạng nội bộ, không chạy script từ repository. Không đảm bảo quyền xem nội dung tại mọi nơi; người dùng chịu trách nhiệm sử dụng nguồn hợp pháp.
- Test đơn vị trên mã nguồn không thay thế kiểm thử runtime của ứng dụng đã đóng gói trên Windows hoặc macOS.
