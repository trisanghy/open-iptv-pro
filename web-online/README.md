# Open IPTV Pro — Web Online

**Dùng trực tiếp:** https://trisanghy.github.io/open-iptv-pro/  
**Hướng dẫn trên website:** https://trisanghy.github.io/open-iptv-pro/huong-dan.html  
**Desktop v4.23.60:** https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.60

Bản Web là ứng dụng trình duyệt tĩnh trên nhánh **web/online**, khác bản desktop Electron mã nguồn chính tại `main`.

## Tính năng Web

- Nhập file M3U hoặc URL danh sách kênh khi truy cập hợp lệ; sắp xếp nguồn/thư mục và kênh yêu thích.
- Phát HLS, MPEG-DASH, MP4 nếu codec và HTTPS/CORS cho phép; chọn link dự phòng, âm lượng, fullscreen, PiP, đa màn hình khi hỗ trợ.
- EPG/XMLTV, tìm kiếm kênh, Smart IPTV Doctor/kiểm tra nguồn trong giới hạn trình duyệt.
- Ghi nhớ kênh xem gần nhất, thử tự phát kênh/âm thanh; trình duyệt có thể yêu cầu thao tác của người dùng.
- Backup/Restore JSON bản Web; đồng bộ tài khoản chỉ khi Supabase được cấu hình, không đăng nhập vẫn có chế độ khách.
- Truy cập hướng dẫn ngay từ thanh trên của ứng dụng hoặc đường dẫn `/huong-dan.html`.

## Những chức năng KHÔNG có trên GitHub Pages

Không có FFmpeg native, ghi hình hẹn giờ, Timeshift native, CORS bypass, LAN discovery gốc, mô hình Whisper/MLX/Piper/VieNeu offline và đồng bộ tiếng gốc của Desktop v4.23.60. Web chỉ phát những luồng mà trình duyệt có quyền, không vượt DRM/hạn chế máy chủ. Backup JSON Web không đồng nhất với file .iptvbackup Desktop.

## Deploy

Workflow `.github/workflows/deploy-openiptv-web.yml` dựng Web từ WebView frontend đã kiểm thử, chèn các bản vá riêng trong `web-online/prepare-web.py`, copy tài liệu `huong-dan.html`, kiểm tra JS/HTML rồi xuất GitHub Pages và đồng bộ bản static vào gốc nhánh `web/online`.

Website: **https://trisanghy.github.io/open-iptv-pro/**.

Chỉ sử dụng nội dung IPTV bạn có quyền truy cập; không kèm playlist trái phép.

## Cảnh báo quyền sử dụng và trách nhiệm người dùng

**Open IPTV Pro là dự án cá nhân chỉ cung cấp phần mềm xem/quản lý IPTV.** Tác giả không phân phối kênh, nội dung có bản quyền, tài khoản dịch vụ hoặc quyền xem/phát lại bất kỳ nguồn nào.

Người sử dụng phải tự xác minh quyền truy cập, bản quyền, giấy phép và điều khoản nhà cung cấp trước khi nhập hoặc xem bất cứ file/link M3U hay kênh từ Smart Discovery. **Nguồn công khai, tìm thấy trên mạng hoặc phát được không đồng nghĩa có giấy phép.** Người dùng tự chịu trách nhiệm về mọi nguồn, dữ liệu và nội dung mình nhập, lưu, phát, xem hay chia sẻ. Tác giả không kiểm soát, bảo đảm tính hợp pháp và **không chịu trách nhiệm về nội dung do người dùng đưa vào hoặc xem**, trong phạm vi pháp luật cho phép. Tuyên bố không thay thế các nghĩa vụ pháp luật và không trao thêm quyền sử dụng nội dung.

- Trước khi mở hộp chọn file M3U, thêm/sửa URL M3U hoặc nhập playlist từ repository, người dùng phải tự tích ô xác nhận quyền hợp pháp trong hộp cảnh báo. Không đồng ý → hủy, không tải/nhập nguồn.
- Trước khi sử dụng **Smart Discovery**, phải tự tích **hai ô riêng biệt** xác nhận đã kiểm tra điều khoản/nguồn gốc của nhà cung cấp và có quyền xem nội dung; việc nhập kết quả từ Smart Discovery yêu cầu xác nhận lại cho từng lượt.
- Các ô mặc định trống. Xác nhận chỉ là cam kết do người dùng đưa ra, **không phải** ứng dụng kiểm chứng bản quyền hay cấp phép.

## Trải nghiệm trình phát trên iPhone/Android (11/2026)

Web Mobile UX: trên điện thoại, thanh điều khiển được chia thành nhóm rõ ràng (tên kênh, chuyển/phát/dừng, Cast/PiP/Toàn màn hình, âm lượng, EPG và nguồn phát) với mục tiêu vùng chạm từ 44px. Thanh điều hướng dưới cùng có thể vuốt ngang để truy cập các mục khác, giữ vùng video đủ rộng.

**Toàn màn hình trên iOS:** Safari iPhone thường không cho `requestFullscreen()` trên một khung HTML tùy ý. Nút Toàn màn hình trên iPhone ưu tiên `video.webkitEnterFullscreen()` nếu video đã có metadata; các trình duyệt khác dùng Fullscreen API của khung video. Nếu trình duyệt nhúng không cấp quyền fullscreen, ứng dụng chuyển sang giao diện video phủ toàn bộ *viewport của website* với nút thoát (không thể ẩn thanh công cụ của Safari hoặc bắt buộc xoay màn hình). Do hạn chế nền tảng, âm lượng trong Safari iOS được điều chỉnh bằng phím vật lý của iPhone; nút tắt tiếng vẫn có sẵn.

### Hotfix mobile 2026-11-18 (bản tự nhận diện)

Ứng dụng gắn `data-iptv-device=mobile` theo iPhone, Android Mobile, thiết bị cảm ứng màn hình hẹp và tự cập nhật khi xoay màn hình. CSS mobile được cô lập vào nhánh này và đặt độ ưu tiên cao hơn `data-sidebar-visible=false` để menu đáy không bị menu desktop 78px ghi đè. Khôi phục vùng xem chính, thanh điều khiển chạm lớn, nav vuốt ngang; CSS và JS dùng query `?v=mobilefix-20261118b` để phá cache Safari. Không thay đổi desktop và dữ liệu IPTV.
