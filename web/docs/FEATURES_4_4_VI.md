# Open IPTV Pro 4.4 – Tính năng nâng cao

> Bản mã nguồn thử nghiệm. Trước khi phân phối bản cài `.dmg`/`.exe`, cần build và kiểm tra trên macOS/Windows thực tế. Chỉ sử dụng các luồng truyền hình bạn được phép truy cập.

## MultiView (4 kênh)

1. Nhập playlist M3U, vào **MultiView · 4 kênh**.
2. Chọn kênh cho 4 ô (mỗi ô có luồng riêng).
3. **Rê chuột vào ô nào thì chỉ ô đó phát âm thanh**. Khi di chuột ra khỏi ô, cả 4 ô im lặng. Video chính cũng được tạm tắt tiếng khi ở MultiView.
4. Chọn **Dừng 4 kênh** để tiết kiệm dữ liệu.

Ghi chú: nếu nhà cung cấp giới hạn số kết nối song song, có thể không xem được cả 4 cùng lúc. Mỗi ô có thể dùng một luồng video riêng nên cần băng thông và tài nguyên máy tương ứng.

## Timeshift – bộ đệm 5 phút

1. Mở một kênh HTTP(S) có thể phát bằng FFmpeg.
2. Trên thanh **Timeshift 5 phút**, chọn **Bật bộ đệm**. Bản desktop dùng FFmpeg để tạo danh sách HLS/segment tại thư mục dữ liệu người dùng, chỉ một kênh được đệm tại một thời điểm.
3. Khi đã tích lũy segment, chọn **−30 giây** để tua lại (tối đa khoảng 5 phút, nếu vùng `seekable` đủ lớn). **Về LIVE** để xem lại nguồn gốc.

Bộ đệm **bắt đầu trống** và không thể tua lại trước thời điểm bật, trừ khi nguồn cung cấp DVR. Đây không phải chức năng ghi liên tục trước khi mở app. File tạm bị xóa khi dừng/thoát; giới hạn dung lượng theo chương trình. Nội dung có DRM hoặc codec không được hỗ trợ sẽ không thể ghi/seek.

## Auto Failover

Vào **Sức khỏe kênh / Failover**, chọn kênh và nhập tối đa 9 URL HTTP(S) dự phòng (mỗi dòng một URL), rồi nhấn Lưu. Chương trình cũng nhận các kênh trùng tên từ nhiều nguồn làm nguồn dự phòng. Khi luồng chính báo lỗi hoặc hết thời gian kết nối, app thử lần lượt các URL dự phòng. Việc chuyển có thể làm gián đoạn phát trong vài giây; không hứa liền mạch tuyệt đối.

## Smart EPG & Catch-up

1. Vào **Cài đặt → Nguồn lịch EPG**, chọn nguồn XMLTV và cập nhật.
2. Vào **Lịch phát sóng EPG**, bấm **Ghép EPG thủ công** khi `tvg-id` và tên kênh không khớp; có thể chỉnh bù giờ +/− phút.
3. Tìm tên chương trình bằng ô tìm kiếm lớn; chương trình tương lai có nút **Nhắc trước 10 phút**.
4. Chương trình đã kết thúc có nút **Xem lại** **chỉ khi playlist khai báo `catchup-source` URL hợp lệ**. App thay các trường `{start}`, `{end}`, `{utc}`, `{timestamp}`, `{duration}` bằng timestamp Unix (giây). Một số nhà cung cấp dùng mẫu URL khác, cần sửa M3U cho phù hợp.

Nhắc lịch hoạt động khi phần mềm đang mở và có quyền thông báo. Không cung cấp hoặc tự tải bản quyền chương trình.

## Xem trước kênh im lặng

Rê chuột vào hàng kênh trong danh sách. App chờ một lúc rồi mở preview **không tiếng**, sử dụng ảnh snapshot gần nhất làm poster nếu có. Preview sẽ được dừng khi rời chuột để tránh dùng quá nhiều tài nguyên. Các luồng chặn CORS hoặc không có codec phù hợp có thể không xem trước được.

## Smart Channel Health / Stream Optimizer

- Bảng Health cho thấy trạng thái **Sống / Die / Chưa rõ**, thời điểm kiểm tra, thời gian kết nối video (nếu đo được), độ phân giải đã giải mã.
- Chương trình ghi các lần phát, kết quả kiểm tra và số lần chờ dữ liệu vào nhật ký cục bộ giới hạn lịch sử.
- Chọn 8 / 20 / 45 giây trong **Stream Optimizer** để thay đổi bộ đệm của HLS.js. Chế độ này không thay đổi chất lượng/bitrate thực nếu máy chủ không cung cấp nhiều mức.
- Nếu luồng bị treo hoặc báo lỗi, Auto Failover có thể thử liên kết khác.

Trạng thái kiểm tra chỉ là quan sát tại một thời điểm, không cam kết kênh luôn hoạt động.

## Hồ sơ và PIN

Vào **Hồ sơ / Khóa trẻ em**. Người quản trị đặt PIN 4–8 số trước, rồi tạo hồ sơ trẻ em và đánh dấu nhóm cần hạn chế. Khi ở hồ sơ trẻ em, các trang sửa nguồn, thư mục, export và Git được vô hiệu hóa ở giao diện. Để chuyển về người lớn cần xác minh PIN. PIN được dẫn xuất bằng PBKDF2-SHA256 với muối ngẫu nhiên và chỉ lưu bản băm cục bộ.

**Giới hạn**: Đây là khóa ở cấp ứng dụng dành cho sử dụng gia đình, không phải cơ chế chống xâm nhập; người có quyền truy cập dữ liệu ứng dụng hoặc máy tính vẫn có thể thay đổi chúng. Không dùng như bảo vệ cấp hệ điều hành.

## Smart IPTV Doctor

Bấm **Smart IPTV Doctor → Chẩn đoán ngay** để kiểm tra trùng URL, trùng tên, thiếu `tvg-id`, thiếu logo, link đã bị phân loại Die và số kênh khớp EPG. Có thể xuất báo cáo JSON. Doctor không tự xóa kênh, không tự đẩy lên GitHub và không tự tải các luồng; sử dụng **Quản lý nguồn → Kiểm tra & sửa → Kiểm tra toàn bộ kênh** để có dữ liệu sống/chết cập nhật.

## Cài đặt / Build

- macOS: chạy `BUILD_MAC.command`, script tự cài runtime và phụ thuộc dự án trong thư mục riêng nếu thiếu.
- Windows: chạy `BUILD_WINDOWS.bat`.
- Hoặc dùng **GitHub Actions** để build Mac Intel, Apple Silicon và Windows.
- Kết quả của workflow và bộ cài thật chưa được xác nhận chạy trên mọi máy. Khi phân phối công khai, cần kiểm tra giấy phép FFmpeg, ký và notarize trên macOS.

## Quyền tác giả và dữ liệu

Mã nguồn Open IPTV Pro dùng **MIT License**. XMLTV, tên kênh, logo, video, danh sách phát, FFmpeg/Electron/HLS.js có giấy phép và điều khoản riêng; không tự động có quyền phân phối lại chúng cùng phần mềm. Repository không chứa playlist hay nội dung truyền hình riêng của người dùng.
