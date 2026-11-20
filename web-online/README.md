# Open IPTV Pro — Web Online

**Dùng trực tiếp:** https://trisanghy.github.io/open-iptv-pro/  
**Hướng dẫn trên website:** https://trisanghy.github.io/open-iptv-pro/huong-dan.html  
**Desktop mới nhất:** https://github.com/trisanghy/open-iptv-pro/releases/latest

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

Trên thiết bị mobile, danh sách kênh được đặt ngay sau video/khung điều khiển, **trước Công cụ nhanh**. Khung danh sách có chiều cao rõ ràng khoảng 350–520px; riêng danh sách kênh cuộn dọc bằng ngón tay, thanh bộ lọc cuộn ngang, không cản thao tác cuộn cả trang. Thu gọn danh sách vẫn được hỗ trợ. Thông báo hiện phía trên bottom navigation (bao gồm safe area iOS), không bị 5 tab che khuất. Tất cả áp dụng chỉ trong chế độ mobile, không thay đổi dữ liệu IPTV hay desktop.

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
Các nút trong trình phát dùng biểu tượng SVG đơn sắc dạng CSS mask (không phụ thuộc emoji, CDN, hay phông chữ ngoài): chuyển kênh, phát/tạm dừng, dừng, âm lượng/tắt tiếng, Cast, PiP, toàn màn hình, lịch EPG, yêu thích và các công cụ xem truyền hình và các công cụ nhanh. Màu sắc dùng biến theme hiện có; hỗ trợ `focus-visible`, trạng thái disabled, vùng chạm tối thiểu ~46px trên mobile, `prefers-reduced-motion`. Trạng thái play/pause và âm lượng phản ánh video thật; không thay các event handler, thay ID hay logic phát kênh. Browser cache được làm mới qua `?v=vectorplayer-20261118a`.

### Sửa nút hiện hai icon trên iPhone (18/11/2026)

Các phiên bản trước chỉ ẩn chữ cũ bằng CSS `font-size:0`; những bộ chọn desktop có độ ưu tiên cao vẫn khiến emoji/phím tắt hiện bên cạnh icon SVG. Bản sửa loại bỏ trực tiếp **text node trang trí** ở các nút điều khiển (không xóa phần tử button, ID, event listener, nhãn tiếp cận hay span mô tả). `MutationObserver` theo dõi những thay đổi `textContent` từ mã phát video/yêu thích để không tái xuất hiện icon đôi sau khi phát/tạm dừng/đổi kênh. Không ảnh hưởng điều khiển âm lượng và nguồn phát.

## AirPlay trên iPhone/iPad (18/11/2026)

Trên iOS, bấm nút Cast để yêu cầu bộ chọn AirPlay trực tiếp trong lần chạm nếu Safari/WebKit cung cấp `webkitShowPlaybackTargetPicker()`; có phương án API Remote Playback khi được hỗ trợ. Thẻ video đã bật `x-webkit-airplay="allow"`. Nếu trình duyệt nhúng không hỗ trợ, ứng dụng hiển thị hướng dẫn sử dụng Safari hoặc Phản chiếu màn hình thay cho hộp thoại Cast desktop vô hiệu hóa. Icon Cast đã được căn chính giữa trên mobile. Khả năng phát lên TV còn phụ thuộc trình duyệt, nguồn video và khả năng tương thích của TV; không bảo đảm mọi luồng đều truyền được. Không đổi chức năng Cast desktop hay nội dung IPTV.

## Mobile bootstrap fallback (18/11/2026)

Khắc phục tình trạng trang trắng với sidebar desktop bên trái trên Safari/iOS và trình duyệt nhúng. Nhận diện mobile thực hiện ngay ở `theme-boot.js` trong `<head>`, trước khi tải CSS và trước khi đọc dữ liệu ứng dụng. Logic dự phòng xét iPhone/iPad, viewport nhỏ, thiết bị cảm ứng và cả iPhone giả lập user-agent desktop. Critical stylesheet được tạo cùng lúc để bảo toàn nội dung chính, thanh điều hướng phía dưới ngay cả khi CSS nâng cao bị tải lỗi/chưa sẵn sàng. `web-mobile-player.js` dùng cùng một nguồn nhận diện, tự đồng bộ khi xoay máy/quay lại trang. Đã đổi phiên bản tài nguyên `mobile-recovery-20261118i` để tránh cache cũ. Không sửa dữ liệu IPTV, main hoặc bản desktop.

## Yêu cầu trang web máy tính trên iPhone (18/11/2026)

Khi người dùng chọn `Yêu cầu trang web cho máy tính` trong Safari/Chrome iOS, Open IPTV Pro ưu tiên User-Agent desktop hoặc viewport >= 960px thay vì ép mobile theo kích thước vật lý hay cảm ứng. Trên điện thoại dùng desktop UA, trang áp dụng viewport 1024px để giữ bố cục desktop. Nhóm 63 quy tắc CSS mobile ban đầu đã được giới hạn bằng `data-iptv-device="mobile"`; chữ của thanh điều hướng 5 tab không tràn vào sidebar desktop.

Một số trình duyệt nhúng không đổi User-Agent khi chuyển chế độ; `?view=desktop` ép hiển thị desktop, `?view=mobile` ép mobile. Khi chuyển lại trình duyệt sang chế độ di động, trang mặc định tự nhận diện lại. Không thay đổi dữ liệu IPTV, tài khoản, Electron hoặc Rust.

## Giao diện TV rộng không có EPG bên phải — 18/11/2026

Đã ẩn riêng panel EPG bên phải (`#themeGuidePanel`) trên trang Xem truyền hình của tất cả phong cách, bao gồm Cinema, Glass và Broadcast. Các layout desktop được cập nhật: Cinema chỉ còn một cột video/điều khiển rộng đầy đủ; Glass và Broadcast giữ điều hướng kênh ở trái nhưng bỏ hẳn cột EPG bên phải. Bỏ giới hạn chiều cao 520px của video Cinema để khung video thực sự rộng hơn. **Giữ nguyên EPG ở nút Lịch, trong thanh điều khiển và trang Lịch EPG.** Phần tử EPG cũ chỉ giữ ẩn trong DOM để các chức năng của `theme-stage.js` không bị ngắt. Desktop Web được triển khai từ tệp `web-tv-wide.css` và builder WebView có cùng cấu hình để phát hành sau không khôi phục panel.

## Mobile Controls Align (2026-11-18)

Căn đồng bộ bốn nút Âm lượng, AirPlay/Cast, PiP và Toàn màn hình trong cùng lưới 4 cột; icon SVG đồng kích thước 24px căn hình học chính giữa, vùng chạm 48px. Trên iPhone biểu tượng AirPlay hiển thị chính xác, trạng thái fullscreen vẫn đổi khi bật/tắt. Giữ nguyên API và click handler hiện có.

Thanh điều hướng chân trang mobile chuyển sang CSS Grid 5 cột `minmax(0,1fr)` để loại bỏ tràn ngang do flex 20% cộng padding/khoảng cách. Giữ năm mục TV, Yêu thích, Lịch, Nguồn, Thêm; bảo vệ safe area iPhone và không che thông báo. Chỉ áp dụng chế độ mobile, không thay đổi desktop hay dữ liệu.

### Sửa PiP và icon điều hướng sát nhãn (18/11/2026)
Bỏ văn bản `PiP` nằm bên trong nút PiP Web (vẫn giữ `aria-label`), chuẩn hóa duy nhất SVG vector 24px. Sửa thuộc tính `min-width/min-height` cũ đang ép SVG ở thanh đáy lên 38px, khiến biểu tượng vượt khỏi khung 29px và đè nhãn. Các tab mobile dùng hai hàng lưới riêng (icon 27px, nhãn 16px), SVG thực 23px; desktop không bị ảnh hưởng.

## Nhận diện link dự phòng trong M3U hai nguồn (18/11/2026)

Đã sửa bộ phát Web để nhận kênh trùng nhau bằng `tvg-id`, sau đó dự phòng bằng tên chuẩn hóa (bỏ riêng hậu tố `(Nguồn 1)`, `(Nguồn 3)`, `(Source 2)`...). Không gộp nhầm hai kênh có `tvg-id` khác nhau. File kiểm thử tái hiện danh sách VTV 25 mục của người dùng gồm 12 cặp VTV1–VTV10 và Vietnam Today; chỉ dùng URL ví dụ thay vì lưu các URL M3U có thể chứa token. Ứng dụng nhận diện đủ 12 cặp; trong file đính kèm có 8 cặp với URL phát khác nhau nên xuất hiện link dự phòng thực sự, còn VTV3, VTV5, VTV6 và VTV10 trùng URL giữa hai nguồn nên chỉ hiện một link (không tạo dự phòng giả). Với các link khác nhau, có thể chuyển thủ công hoặc dùng Auto Failover. Giữ nguyên 25 dòng danh sách và nguồn ban đầu. `web-online/prepare-web.py` lấy bộ matcher Web đã sửa để các bản dựng sau không làm mất tính năng.

## Sửa lỗi gộp nguồn `Can't find variable: applied` (19/11/2026)

Nguyên nhân: trình thu thập gọi biến `applied` chưa khai báo sau khi đã lưu nguồn, khiến người dùng nhìn thấy thông báo lỗi dù playlist có thể đã đổi. Đã xóa lỗi này, kiểm tra lưu thành công, hoàn tác thay đổi trong bộ nhớ khi lưu thất bại và ghi trạng thái chính xác sau khi lưu. Trình phát giờ đọc `channel.alternates` ngay từ playlist gộp ngay cả khi hai nguồn gốc đã được tắt, còn cấu hình nâng cao có API cập nhật link dự phòng theo lô. Có bài kiểm thử cho gộp thành công và lỗi lưu; không xóa các nguồn gốc.

## Tải bản Desktop mới nhất từ web (19/11/2026)

Trên máy tính: nút **Tải Desktop** ở thanh công cụ. Trên điện thoại: nút **Tải Open IPTV Pro Desktop** trước video và mục **Tải bản Desktop** bên trong menu **Thêm**. Hộp thoại truy vấn `api.github.com/repos/trisanghy/open-iptv-pro/releases/latest` khi người dùng nhấn nút, lọc bộ cài Electron cho Windows x64 (Setup và Portable), macOS Apple Silicon và macOS Intel, không nhầm bản Rust Lab/Web ZIP. Chỉ hiển thị URL tải có gốc `github.com/trisanghy/open-iptv-pro/releases/download/`. Khi API bị giới hạn, dùng trang `/releases/latest` thay vì hiển thị một phiên bản cũ. Không ảnh hưởng việc phát IPTV, dữ liệu nguồn và đồng bộ.


## Cài app cho iOS (không cần ký) — lối tắt Web

Trong **Tải xuống phần mềm**, mục **Cài app cho iOS (không cần ký)** hướng dẫn trên iPhone/iPad dùng **Safari hoặc Chrome**: mở `https://trisanghy.github.io/open-iptv-pro/`, nhấn **Chia sẻ → Thêm vào Màn hình chính → Thêm**. Đây là phiên bản Web/lối tắt và không cần chứng chỉ ký ứng dụng, khác tệp IPA unsigned của phiên bản native.

## Smart IPTV Discovery trong trình duyệt

Web Online hỗ trợ xem trước danh mục kênh theo quốc gia, thể loại, ngôn ngữ hoặc toàn cầu từ **iptv-org**, và playlist chọn lọc từ **Free-TV/IPTV**. Chỉ tải danh mục từ các địa chỉ HTTPS đã định trước; không tự dùng dịch vụ proxy của bên thứ ba. Trình duyệt sử dụng kiểm tra HLS/media dựa trên bằng chứng video và có thể báo **Chưa rõ** khi nguồn giới hạn CORS, mạng, địa lý hoặc HTTPS — tuyệt đối không xem đó là bằng chứng kênh chết.

**Trước lần khám phá:** người dùng phải tích ba ô riêng: đã xem điều khoản nhà cung cấp, xác nhận quyền sử dụng nội dung, và đồng ý tự chịu trách nhiệm đối với các nguồn mình chọn. Đây là tự xác nhận, không cấp giấy phép. **Trước mỗi lần nhập kênh:** phải xác nhận lại cả ba ô. Khi nhập trên Web, kênh được lưu dưới dạng bản chụp danh sách đã chọn, không âm thầm thay nguồn cũ hoặc tự cập nhật playlist đó.

Trình duyệt không thể vượt hạn chế CORS hoặc xác minh bản quyền. Phần mềm là công cụ độc lập; trách nhiệm của tác giả chỉ được loại trừ trong phạm vi pháp luật cho phép. Chỉ kiểm tra và sử dụng các nguồn mình có quyền hợp pháp.
