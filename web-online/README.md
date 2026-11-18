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

## Giao diện mobile gọn hơn (18/11/2026)

Trên iPhone và Android: ẩn hoàn toàn topbar trùng lặp, gom thanh điều hướng dưới thành 5 tab TV/Yêu thích/Lịch/Nguồn/Thêm (không cần vuốt để tìm mục quan trọng). Mục Thêm mở bảng các chức năng phụ: MultiView, ảnh chụp, thư mục, sức khỏe kênh, Doctor, hồ sơ, nhập file/URL M3U, xuất M3U, Cài đặt, Tài khoản và hướng dẫn. Các tác vụ tiếp tục dùng handler cũ và vẫn yêu cầu xác nhận quyền sử dụng trước khi nhập nguồn.

Thanh công cụ phát trên điện thoại gồm một hàng 4 icon chạm tối thiểu 46px: tắt/bật tiếng, Cast, PiP và toàn màn hình. Ẩn dòng hướng dẫn âm lượng iPhone và thanh âm lượng không tác dụng trên iOS. Giao diện desktop không bị ảnh hưởng; file CSS/JS có tham số phiên bản để Safari nạp lại bản mới.

## Sửa cuộn danh sách và thông báo mobile (18/11/2026)

Trên thiết bị mobile, danh sách kênh được đặt ngay sau video/khung điều khiển, **trước Tua lại và Công cụ nhanh**. Khung danh sách có chiều cao rõ ràng khoảng 350–520px; riêng danh sách kênh cuộn dọc bằng ngón tay, thanh bộ lọc cuộn ngang, không cản thao tác cuộn cả trang. Thu gọn danh sách vẫn được hỗ trợ. Thông báo hiện phía trên bottom navigation (bao gồm safe area iOS), không bị 5 tab che khuất. Tất cả áp dụng chỉ trong chế độ mobile, không thay đổi dữ liệu IPTV hay desktop.

## Mobile Channel Touch — 18/11/2026

Tăng kích thước danh sách kênh trên điện thoại (khung 570–780px, thư mục ít nhất 60px, mỗi kênh ít nhất 78px), logo 54×52px, nút yêu thích và chuyển thư mục có vùng chạm ít nhất 44×46px. Giảm chiều cao các bộ lọc và bỏ hướng dẫn kéo/Shift dành cho chuột để dành thêm chỗ cho kênh. Danh sách sử dụng riêng vùng cuộn dọc iOS (`overflow-y: scroll`, `touch-action: pan-y`, `-webkit-overflow-scrolling: touch`). Chỉ tác động giao diện mobile, không thay đổi hành vi desktop hay nguồn IPTV.

### Channel panel +75% height (18/11/2026)

Đã tăng thêm chính xác 75% chiều cao của khung Danh sách kênh trên mobile: dọc từ `clamp(570px, 77dvh, 780px)` lên `clamp(997.5px, 134.75dvh, 1365px)`; với thiết bị thấp/ngang từ `clamp(360px, 90dvh, 540px)` lên `clamp(630px, 157.5dvh, 945px)`. Giữ hàng kênh, thư mục, vuốt danh sách, menu và chức năng desktop như trước. Nếu thư mục đang gập, cần nhấn tên thư mục để thấy các kênh trong đó.

## Browser Channel Check and Snapshot (2026-11-18)

Kiểm tra kênh dùng HLS/DASH/byte media và link dự phòng nếu CORS cho phép; không coi CORS hoặc timeout là kênh Die. Trên mobile, bảng tiến độ/hủy được chuyển ra khỏi footer (footer bị ẩn trong mobile UI), giới hạn kiểm tra ở 2 kết nối song song.

Snapshot trên Web chỉ lưu **khung hình video thật**. Ứng dụng thử ảnh từ kênh đang phát hoặc video muted chạy ngầm, dùng Safari native HLS/HLS.js/DASH.js khi hỗ trợ; không vượt CORS/DRM hoặc quy định autoplay và không dùng logo làm ảnh chụp giả. Hàng loạt giới hạn 80 kênh/lượt, 1 luồng mobile hoặc 2 luồng desktop-web để giảm áp lực bộ nhớ. Bảng tiến độ hiển thị số thành công, thất bại, tên kênh và nút Hủy. Nếu Safari không cho video chạy ngầm, mở kênh để có hình rồi thử chụp riêng kênh đó hoặc dùng Desktop FFmpeg.

- Công cụ nhanh có thêm nút **Chụp kênh đang xem** để chụp video đang phát thực tế khi Safari chặn phát ngầm. Ảnh Web chỉ tính thành công khi lưu được vào localStorage; đầy bộ nhớ sẽ báo lỗi và hoàn nguyên ảnh cũ.

## Mobile channel-height adjustment (18/11/2026)

Khung Danh sách kênh trong giao diện mobile giảm đúng **40%** so với cấu hình v5 gần nhất: từ `clamp(997.5px,134.75dvh,1365px)` còn `clamp(598.5px,80.85dvh,819px)`; ở màn hình thấp từ `clamp(630px,157.5dvh,945px)` còn `clamp(378px,94.5dvh,567px)`. Không đổi chiều cao hàng kênh 78px, logo, nút thao tác, vuốt cuộn iOS và desktop. Phiên bản URL asset được cập nhật để tránh cache Safari.

## Bộ icon trình phát Web (18/11/2026)
Các nút trong trình phát dùng biểu tượng SVG đơn sắc dạng CSS mask (không phụ thuộc emoji, CDN, hay phông chữ ngoài): chuyển kênh, phát/tạm dừng, dừng, âm lượng/tắt tiếng, Cast, PiP, toàn màn hình, lịch EPG, yêu thích, tua lại, ghi hình và các công cụ nhanh. Màu sắc dùng biến theme hiện có; hỗ trợ `focus-visible`, trạng thái disabled, vùng chạm tối thiểu ~46px trên mobile, `prefers-reduced-motion`. Trạng thái play/pause và âm lượng phản ánh video thật; không thay các event handler, thay ID hay logic phát kênh. Browser cache được làm mới qua `?v=vectorplayer-20261118a`.
