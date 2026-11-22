# Open IPTV Pro TV · TizenBrew v0.1.24 (OTA)

## v0.1.24 — Bảng chọn kênh khi nhấn ↑ ↓ ← → trong màn hình toàn màn hình

- **Bốn phím mũi tên đều mở bảng chọn kênh phủ lên màn hình đang phát**; không tự chuyển kênh ngay khi nhấn lần đầu.
- **Khi bảng chọn đã mở:** ↑/↓ chọn kênh trước/sau; ←/→ đổi thư mục; OK phát kênh đang bôi sáng; Back đóng bảng chọn và quay lại video đang phát. CH± vẫn hỗ trợ chuyển nhanh khi bảng chọn đóng.
- **Trực quan trên TV:** panel bên trái hiển thị tên kênh, thư mục, kênh đang xem và số thứ tự; hỗ trợ kho kênh lớn bằng cách chỉ dựng tối đa 21 hàng gần vị trí chọn, tránh treo khi có nhiều kênh.
- **Back một lần:** chặn một lần nhấn bị gửi đồng thời qua `keydown`, `keyup` và `tizenhwkey` gây đóng video rồi thoát hẳn ứng dụng. Có thời gian chống lặp 650 ms giữa các hành động Back, ưu tiên đóng bảng chọn, sau đó mới đóng trình phát, rồi mới thoát ở giao diện chính.
- **Bảo toàn dữ liệu:** không thay đổi playlist M3U, yêu thích, lịch sử, cơ chế giải mã HLS/AVPlay hoặc đường khởi động `tizenbrew/bootstrap.html` (OTA).
- **Kiểm thử:** `tizenbrew/tests/fullscreen-channel-picker.test.cjs` kiểm tra mở bảng chọn bằng 4 phím, điều hướng thư mục/kênh, OK, Back và tránh thoát ứng dụng do sự kiện trùng.
- Chưa kiểm thử trực tiếp trên TV Samsung; kiểm thử CI chỉ xác nhận logic mô phỏng và JavaScript.

## v0.1.23 — Thử lại luồng IPTV HLS và chẩn đoán ngay trên TV

- Giữ nguyên `appPath=tizenbrew/bootstrap.html` và cơ chế OTA theo commit (đã được người dùng xác nhận TV tự tải bản `0.1.22`).
- Trước đây, các URL IPTV không chứa đuôi `.m3u8` chỉ được thử bằng HTML5; khi HTML5 báo `NotSupportedError` hoặc `MEDIA_ERR_SRC_NOT_SUPPORTED`, trình phát dừng mà không thử HLS.js.
- Hiện tại HTML5 lỗi sẽ thử HLS.js **một lần** với URL gốc không sửa đổi, kể cả URL không có đuôi `.m3u8`. M3U8 có đuôi vẫn thử HLS.js trực tiếp nếu trình duyệt không công bố hỗ trợ HLS native.
- Màn hình phát hiển thị các chẩn đoán không chứa URL/token nguồn: AVPlay có khả dụng hay không, native HLS, HLS.js/MediaSource và thông báo lỗi. Tránh vòng lặp thử lại và giữ nguyên danh sách kênh/QR/yêu thích.
- Không thể ép HLS.js hoạt động khi TV không có MediaSource, hoặc khi nguồn chặn CORS. AVPlay cần quyền Samsung Product API trong gói WGT; module web chạy dưới TizenBrew có thể không sử dụng được AVPlay của hệ thống. Trong trường hợp đó cần bản WGT độc lập được ký và khai báo quyền AVPlay, không chỉ cập nhật JS.
- Kiểm thử hồi quy cho HLS URL không có đuôi, trường hợp MediaSource không hỗ trợ, tránh lỗi lặp: `tizenbrew/tests/samsung-avplay-playback.test.cjs`.
- Đây là bản sửa theo thông tin lỗi từ TV, chưa được xác minh phát thành công trên phần cứng Samsung thực tế.

## v0.1.22 — Khắc phục bản TV bị kẹt tại 0.1.17 dù đã xóa/cài lại

### Nguyên nhân xác minh được
TizenBrew tải `package.json` và các file module từ `https://cdn.jsdelivr.net/gh/trisanghy/open-iptv-pro@tizenbrew/`. Trong log GitHub Actions, jsDelivr trả HTTP 200 nhưng có `"throttled":true`; yêu cầu purge thực tế bị từ chối. Các workflow cũ chỉ kiểm tra mã HTTP nên báo thành công sai. Lỗi này làm việc xóa/cài lại cùng đường dẫn module vẫn nhận code cache cũ.

### Cách cài lại một lần qua đường dẫn đã xác minh
Mở **TizenBrew > Module Manager > Add GitHub Module**, nhập nguyên văn:

```text
trisanghy/open-iptv-pro@77e9b0bebbbad18914334b02ff3042e5883db939
```

Mục **Add GitHub Module** tự thêm tiền tố `gh/`, vì vậy **không nhập thêm `gh/`**. Đây là **commit chính xác đã được GitHub Actions xác minh CDN tải được cả `package.json` v0.1.22 và `tizenbrew/bootstrap.html`**, xem workflow `tizenbrew-ota-smoke.yml`. Không thay thành `@tizenbrew` vì URL cũ đang bị CDN hạn chế purge. Có thể xóa thẻ Open IPTV Pro cũ khỏi danh sách TizenBrew nếu muốn tránh trùng; không chọn xóa dữ liệu TizenBrew.

### Cơ chế OTA không phụ thuộc cache URL nhánh
- `package.json` đặt `appPath: tizenbrew/bootstrap.html`.
- Bootstrap đọc SHA đầu nhánh `tizenbrew` bằng GitHub API khi mở ứng dụng.
- HTML TV được lấy qua `https://cdn.jsdelivr.net/gh/trisanghy/open-iptv-pro@<sha>/tizenbrew/index.html`, tức **URL commit mới cho mỗi bản mới**, tránh URL cố định `@tizenbrew` bị giữ bản cũ.
- Nếu CDN lỗi, tải bản đúng SHA từ `raw.githubusercontent.com`. Nếu API lỗi, thử tải trực tiếp `tizenbrew/index.html` của nhánh, kèm cache-buster.
- Bootstrap thay nội dung cùng WebView bằng `document.open/write/close`, giữ nguyên origin của TizenBrew, không xóa dữ liệu kênh, đăng nhập hoặc yêu thích.
- **Lưu ý:** TizenBrew sẽ hiển thị thẻ module `0.1.22` vì đường cài dùng commit cố định; còn bên trong ứng dụng sẽ tải và hiển thị phiên bản mới hơn từ HEAD sau các lần cập nhật. Không được hiểu số thẻ bootstrap là phiên bản runtime.
- Không khẳng định đã kiểm thử trên Samsung TV thực tế: mới xác minh logic Node.js, GitHub Actions và URL CDN theo commit.
- Workflow purge mới phải kiểm tra `.paths[*].throttled` và so sánh `package.json` thật trên CDN. Không tiếp tục gọi purge mỗi commit code tránh bị rate limit.

## v0.1.21 — Khắc phục lỗi không phát được bất kỳ kênh IPTV nào

- **Nguyên nhân trong mã cũ:** bộ phát chỉ gán trực tiếp URL `c.url` vào thẻ HTML5 `<video>` và gọi `play()`. Khi Samsung Tizen không hỗ trợ luồng IPTV HLS/DASH theo đường HTML5, ứng dụng chỉ báo lỗi mà không chuyển sang bộ phát khác.
- **Bộ phát Samsung AVPlay:** dùng `webapis.avplay.open(url)` → `setDisplayRect(0,0,1920,1080)` → `prepareAsync()` → `play()` cho các kênh, với đối tượng `application/avplayer` trong trình phát. Chờ sự kiện tiến độ phát trước khi xóa trạng thái tải. AVPlay hỗ trợ HLS và DASH theo tài liệu Samsung.
- **Tự dự phòng:** nếu AVPlay không có, chuẩn bị lỗi hoặc chờ quá 18 giây, thử trình phát HTML5. Với M3U8 không hỗ trợ HLS nguyên bản, tải HLS.js từ trang chủ GitHub Pages (dự phòng jsDelivr) khi trình duyệt hỗ trợ MediaSource. Không chuyển tiếp playlist riêng tư qua proxy lạ và không can thiệp DRM.
- **Điều khiển:** nút OK dùng đúng API `play/pause` của bộ phát đang hoạt động; CH± tiếp tục chuyển kênh, Back dừng giải mã và về danh sách. Thay kênh sẽ `stop/close` AVPlay và `destroy` HLS.js cũ trước khi mở kênh mới; callback của kênh cũ được bỏ qua.
- **Lỗi rõ ràng hơn:** màn hình sẽ cho biết đang thử AVPlay hay HTML5/HLS.js, và lý do thất bại nếu có.
- **Không xóa nguồn:** giữ nguyên danh sách kênh, QR, yêu thích, lịch sử và thiết lập.
- **Kiểm thử:** `tizenbrew/tests/samsung-avplay-playback.test.cjs` bổ sung kiểm thử máy giả lập về các nhánh chọn bộ phát, dự phòng, điều khiển, hủy callback cũ, giải phóng và HLS.js. Chưa được xác nhận phát thành công trên Samsung TV thực.
- **Tự cập nhật:** vẫn dựa vào metadata CDN của TizenBrew, có thể bị trễ do cache. Số phiên bản ở cả metadata và giao diện là **v0.1.21**.

## v0.1.20 — Sửa Back/Thoát và làm mới thông tin phiên bản trong TizenBrew

- **Thoát bằng Back hoặc nút Thoát:** Khi đang phát video, Back đóng trình phát để về danh sách; khi đang nhập nguồn, Back đóng hộp thoại; khi ở màn hình danh sách, Back hoặc nút Thoát gọi `history.back()` để trở về đúng giao diện TizenBrew đã mở module. Bỏ cách điều hướng sai qua `http://127.0.0.1:8081/tizenbrew-ui/dist/index.html` — cổng 8081 chỉ phục vụ proxy module.
- **Chống lặp nút Back:** Tránh xử lý cùng một lần nhấn hai lần khi remote tạo cả keydown và keyup. Tiếp tục hỗ trợ sự kiện `tizenhwkey` của Samsung.
- **Làm mới danh sách module:** Khi khởi động, Open IPTV Pro gửi yêu cầu WebSocket `GetModules` với `payload:true` tới dịch vụ nội bộ TizenBrew, để đọc lại `package.json` thay vì giữ vĩnh viễn danh sách module trong bộ nhớ. Không xóa dữ liệu người dùng.
- **Giới hạn cần biết:** TizenBrew đọc metadata qua jsDelivr theo nhánh GitHub, nên CDN có thể giữ dữ liệu cũ tới khoảng 12 giờ. Workflow `tizenbrew-cdn-refresh.yml` đã yêu cầu purge sau khi có commit, nhưng không thể bảo đảm TV nhận mã mới nếu CDN/TizenBrew còn đang cache. Cần kiểm tra thực tế trên TV.
- Metadata trong `package.json` và header TV cùng là **v0.1.20**. Có thêm bài kiểm thử `tizenbrew/tests/back-exit-update.test.cjs`.
- Không chỉnh sửa các bản Electron, Rust Lab hay nhánh `main`.

## v0.1.19 — Giữ 0,5 giây để kéo thư mục/kênh; không tự bật bàn phím

- Trang quản lý kênh **trên điện thoại qua QR**: giữ **0,5 giây ở bất kỳ đâu trong ô kênh**, kể cả hàng nút yêu thích, chuyển, mở thêm và chỉnh sửa; không còn chỉ nhận thao tác ở `.channel-head`.
- **Thư mục**: có thể giữ từ toàn bộ phần tiêu đề hoặc phần nền trống của khối thư mục (không yêu cầu đúng một nút), kéo đến thư mục khác để đổi thứ tự. Kéo kênh vào thư mục khác hoặc lên/xuống trước/sau kênh mục tiêu.
- Vuốt nhanh để cuộn: nếu ngón tay di chuyển quá 14 px trước khi đủ 500 ms, hủy chế độ giữ; khi đang kéo hiển thị nhãn nổi. Chặn menu giữ mặc định iOS trong thẻ kênh/thư mục.
- **TV Samsung – Thêm nguồn:** mở hộp nhập nguồn không tự focus vào ô URL nên **không tự hiện bàn phím che mã QR**. Ban đầu focus ở nút **Chuyển xuống nhập đường dẫn**; chỉ khi người dùng nhấn OK hoặc chuyển vào ô nhập mới bật bàn phím.
- Địa chỉ QR trỏ đến trang quản lý mới trên `web/online` với tham số `?v=023` để hạn chế dùng bản cache cũ.
- Giữ nguyên chức năng tên nguồn M3U không bắt buộc của v0.1.18. Có kiểm thử hồi quy tương ứng tại `tizenbrew/tests/full-card-drag-focus.test.cjs`.

## v0.1.18 — Không bắt buộc nhập tên nguồn M3U

- **TV:** có thể bỏ trống ô tên nguồn, chỉ nhập URL hợp lệ và xác nhận quyền sử dụng. Khi mở hộp thoại, remote focus trực tiếp vào ô URL; nhấn ↑ nếu muốn đặt tên thủ công.
- **Điện thoại qua QR:** bỏ `required` và điều kiện kiểm tra tên nguồn trong biểu mẫu gửi URL M3U/M3U8. Tải file M3U hoặc dán nội dung cũng không yêu cầu tự gõ tên.
- **TV tự đặt tên:** nếu tên trống hoặc chỉ chứa khoảng trắng, lưu là `Nguồn IPTV 1`, `Nguồn IPTV 2`, … theo số nguồn hiện có. Áp dụng cho nhập URL trên TV, gửi nguồn URL từ điện thoại và nhận playlist theo từng phần.
- Vẫn yêu cầu **URL hợp lệ**, hoặc nội dung/tệp M3U hợp lệ, và **xác nhận quyền sử dụng**. Không nới lỏng các kiểm tra an toàn nguồn.
- Cập nhật metadata và header ứng dụng thành **v0.1.18**. Nhánh TizenBrew được tự động yêu cầu làm mới CDN sau khi push.

## v0.1.17 — Sửa phiên bản và mô tả thẻ ứng dụng TizenBrew

- Tách phiên bản module TizenBrew khỏi bản Desktop: metadata `package.json` khai báo **0.1.17** đồng bộ với `tizenbrewEdition` và dòng phiên bản trên giao diện TV.
- Đổi mô tả module thành tiếng Việt, ngắn gọn, đúng các chức năng Samsung TV; bỏ đoạn giới thiệu Desktop dài gây **tràn khỏi thẻ ứng dụng** trên TizenBrew.
- TizenBrew lấy tên, phiên bản và mô tả hiển thị trực tiếp từ metadata của module; không thể điều chỉnh CSS của màn hình TizenBrew thông qua module Open IPTV Pro.
- Nếu TV vẫn hiện **4.23.39**, hãy thoát TizenBrew, mở lại và để module cập nhật; nếu chưa đổi, làm mới/cài lại module từ `trisanghy/open-iptv-pro@tizenbrew`. Đừng cài từ `main`, `web/online` hoặc một release/tag cũ. Việc cài lại module có thể ảnh hưởng dữ liệu lưu trên TV, nên xuất sao lưu trước nếu có.

## v0.1.16 — Hai nút tách thành hai hàng trong ô trống sidebar

- Hai nút **▶ TizenTube** và **✕ Thoát** nay được xếp **dọc, mỗi nút một hàng** ngay dưới **Hướng dẫn** trong menu bên trái, đúng hai khu vực được đánh dấu trên ảnh. Nút thấp hơn các nút menu chính, tối ưu bấm bằng remote.
- Không còn nút ở footer hoặc đè trên video. Khi đang phát, hai nút ẩn cùng sidebar; phím Back trở về danh sách.
- Nếu bản xem thử trên Mac vẫn có nút ở góc phải footer, đó là tab localhost/WGT cũ. Cần mở bản preview từ release/tệp mới thay vì chỉ tải lại tab đã ghim một tag cũ.

## v0.1.15 — Chỉnh đúng vị trí menu và cách nhận bản mới

- Đặt hai nút nhỏ **TizenTube** và **Thoát** **ngay dưới Hướng dẫn** trong sidebar, thay vì để khoảng trống tự giãn trước nút. Giữ chú thích điều khiển ở dưới cùng nhờ `.nav .tip{margin-top:auto}`.
- Không để hai nút nằm trong footer dưới cùng hay đè lên khung video. Nếu thấy chúng ở góc phải footer, trình duyệt vẫn đang sử dụng **tệp HTML cũ**, thường từ bản preview WGT/tag bất biến hoặc tab localhost chưa tải lại.
- Để xem mã mới nhất trên Mac trong thư mục preview đã dùng: chạy `mkdir -p ~/Downloads/OpenIPTV-Tizen && curl -fLsS -H 'Cache-Control: no-cache' "https://raw.githubusercontent.com/trisanghy/open-iptv-pro/tizenbrew/tizenbrew/index.html?fresh=$(date +%s)" -o ~/Downloads/OpenIPTV-Tizen/index.html && open ~/Downloads/OpenIPTV-Tizen/index.html`. Trang mở bằng file có bộ nhớ khác với bản localhost; không xóa dữ liệu TV và không sử dụng bản file để thay thế môi trường TV.
- Trên TizenBrew TV, tải lại module từ nhánh `trisanghy/open-iptv-pro@tizenbrew`, kiểm tra header hiển thị **v0.1.15** trước khi xác nhận vị trí nút mới.

## v0.1.14 — Đặt nút TizenTube và Thoát tại menu chính

- Chuyển **▶ TizenTube** và **✕ Thoát** vào phần trống **cuối menu bên trái** (dưới Hướng dẫn, phía trên chú thích remote). Hai nút nhỏ gọn, điều khiển được bằng remote ngay từ màn hình danh sách kênh.
- **Không đặt nút nào đè lên video**. Khi trình phát toàn màn hình mở, menu bên trái cùng hai nút được che bởi trình phát; dùng **Back** để trở về danh sách kênh, **OK** phát/tạm dừng và **CH±** chuyển kênh. Phím mũi tên khi xem không thể vô tình focus các nút nằm sau video.
- **Thoát** từ màn hình chính quay về TizenBrew; **TizenTube** chỉ mở module đã cài qua dịch vụ TizenBrew. Giữ sửa lỗi xóa cảnh báo autoplay khi video phát từ v0.1.13.
- Kiểm thử vị trí nút trong DOM, cú pháp và hành vi remote tại `tizenbrew/tests/tizentube-player-controls.test.cjs`.

## v0.1.12 — Quản lý kênh theo Web Mobile trên trang QR

- Bố cục trang quản lý `tizenbrew/phone.html` được thiết kế lại theo danh sách kênh của `web/online`: thẻ kênh có logo, tên, trạng thái yêu thích/ẩn/đang phát; thư mục có thể mở/gập và sắp xếp.
- Các bộ lọc **Tất cả · Yêu thích · Vừa xem · Đang hiện · Đã ẩn**, tìm kiếm theo tên/nhóm và chọn nguồn. Trên TV, dữ liệu được phân trang **30 kênh/lần** để tránh quá giới hạn Supabase Broadcast.
- Từ điện thoại qua QR: **phát kênh trên TV**; sửa tên/nhóm/URL; bật/tắt hiển thị, yêu thích; xóa kênh. Giữ **800 ms** trên hàng kênh để kéo chuyển thư mục hoặc thay đổi thứ tự. Vuốt thông thường vẫn cuộn trang.
- Tạo/đổi tên/xóa/sắp xếp thư mục trên từng nguồn; xóa thư mục chỉ chuyển kênh về nhóm `Khác`, **không xóa kênh**. Chọn nhiều kênh trong trang để chuyển thư mục/vị trí, thêm/bỏ yêu thích, ẩn/hiện hoặc xóa (có xác nhận).
- Những thay đổi thực sự chạy qua các lệnh quản lý trên TV, được kiểm tra danh tính kênh và chỉ hiện thành công sau khi TV lưu. Khi TV bị mất kết nối, nút quản lý bị vô hiệu; mã QR hết hạn sau 10 phút.
- QR mở `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html?v=020`; đồng bộ **duy nhất** trang QR ở `web/online:tizen/phone.html`. Không áp dụng tính năng trạng thái **Sống/Die** của bản Web vì Tizen chưa có bộ kiểm tra độc lập; tránh hiển thị kết quả kiểm tra không có thật.
- Đã chạy mô phỏng các thao tác quản lý nguồn/thư mục/kênh và kiểm tra cú pháp JavaScript. **Chưa xác minh trực tiếp trên Samsung TV**; cần kiểm tra kéo thả và phát kênh trên thiết bị thật.

## v0.1.14 — Danh sách thư mục gập mặc định, tự tải kênh và kéo thả 0,5 giây

- Trang quản lý qua QR mở ra với **toàn bộ thư mục được gập mặc định**. Danh sách hiển thị đầy đủ tên thư mục, gồm cả nhóm chưa có kênh; không cắt danh sách ở 100 nhóm như trước.
- Bỏ nút **Trước / Tiếp**. Khi mở thư mục hoặc cuộn tới cuối kênh đã tải, điện thoại tự xin 30 kênh tiếp theo từ TV và ghép vào nhóm đang mở. Kỹ thuật phân trang vẫn giữ ở lớp truyền Supabase để tránh gửi hàng nghìn kênh qua một tin nhắn, nhưng người dùng không cần thao tác chuyển trang.
- **Giữ 0,5 giây (500 ms)** trên tên kênh hoặc tiêu đề thư mục để bắt đầu kéo. Kéo kênh lên hàng kênh khác để sắp xếp trước/sau, thả trên tiêu đề thư mục để chuyển nhóm; kéo tiêu đề thư mục lên hoặc xuống tiêu đề khác để đổi thứ tự các thư mục. Có tự cuộn gần mép màn hình.
- Thao tác sắp xếp được gửi qua TV, kiểm tra ID kênh và tên thư mục, lưu thứ tự trên TV. Mọi thư mục tự gập khi mở lại tab quản lý hay thay nguồn. Bộ lọc, chọn nhiều, yêu thích và nhập nguồn vẫn giữ nguyên.
- Trang QR mới dùng `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html?v=021`; chỉ cập nhật `web/online:tizen/phone.html` để xuất bản, không sửa trình phát Web chính.
- Mô phỏng kiểm tra thành công: trả đủ 120 thư mục, tải lần lượt 72 kênh trong 3 gói 30/30/12, kéo sắp xếp thư mục trước/sau, kéo kênh giữa các nhóm. **Chưa xác minh bằng thao tác cảm ứng trên điện thoại thực và Samsung TV**.

## Cập nhật không cần USB

1. Mở ứng dụng **TizenBrew** (không phải TizenBrew Installer).
2. Vào **Module Manager → Add GitHub Module**, nhập `trisanghy/open-iptv-pro@tizenbrew`.
3. Mở/cập nhật module **Open IPTV Pro TV**. Nếu thấy giao diện cũ, tải lại module hoặc xóa cache.

## v0.1.13 — Nút thoát gọn, chuyển TizenTube, xóa thông báo che video

- Gỡ nút thoát lớn trên header, menu bên trái và đầu trình phát. Chỉ còn **1 nút ✕ Thoát nhỏ ở góc dưới**: đang xem thì về danh sách, ở danh sách thì về TizenBrew. Back từ remote tiếp tục làm tương tự.
- Thêm nút **▶ TizenTube** ở cạnh nút thoát. Nút dùng WebSocket nội bộ `ws://127.0.0.1:8081` của TizenBrew để đọc module đã cài, yêu cầu `LaunchModule` cho module TizenTube đã tìm thấy, sau đó chuyển sang `appPath` TizenBrew cung cấp. Không tự cài và không chuyển sang trang YouTube thường nếu module chưa có.
- Trong trình phát, điều hướng **↓** để chọn nút Thoát, **←/→** để chuyển giữa Thoát và TizenTube, **↑** về video. Nhấn **OK** trên video để phát/tạm dừng, trên nút sẽ thực hiện đúng thao tác đã chọn.
- Sửa cảnh báo autoplay lưu lại trên hình: `playing` và `timeupdate` xóa cảnh báo cũ ngay khi phát thực tế, kể cả khi người dùng nhấn OK thử lại. Phụ đề trạng thái và hướng dẫn bên dưới ẩn khi video đang phát; khi chờ hoặc tạm dừng sẽ hiện hướng dẫn.
- Đã có kiểm thử mô phỏng; cần kiểm tra thực tế trên Samsung Tizen vì TizenBrew và codec khác nhau theo TV.

## v0.1.12 — Tự mở kênh xem gần nhất khi khởi động

- Khi mở Open IPTV Pro TV, TV tự tìm **kênh đã xem gần nhất** từ lịch sử **Đã xem** đã lưu trên thiết bị, mở trình phát và thử phát ngay, không cần nhấn **Xem**.
- Lịch sử được lưu vào `localStorage` ngay mỗi lần bắt đầu phát hoặc đổi kênh; dùng lại lịch sử cũ, không xóa nguồn, yêu thích hoặc tùy chỉnh giao diện.
- Nếu chưa xem kênh nào, hoặc kênh gần nhất đã xóa/ẩn/không còn trong nguồn M3U, giữ giao diện chọn kênh bình thường. Không tự ý phát một kênh khác.
- Khi trình duyệt hoặc codec chặn phát tự động, trình phát hiển thị hướng dẫn nhấn **OK** để thử lại; chức năng Back, CH± vẫn hoạt động như trước.
- Kiểm thử hồi quy: `node --test tizenbrew/tests/last-channel-startup.test.cjs`. Cần xác minh autoplay thực tế trên Samsung TV.

## Thêm nguồn IPTV

- **Remote:** chọn **＋ Nguồn**, nhập **Tên nguồn**, nhấn **OK** hoặc **↓** để chuyển xuống URL. Có nút **↓ Chuyển xuống nhập đường dẫn** làm đường dự phòng khi bàn phím Samsung giữ phím điều hướng. Nhập URL, xác nhận quyền sử dụng và nhấn **Lưu và tải**.
- **Điện thoại:** chọn **＋ Nguồn**, quét **mã QR lớn** bên phải; trên điện thoại nhập tên và URL M3U/M3U8, xác nhận quyền sử dụng rồi **Gửi nguồn sang TV**. TV tải và lưu danh sách, điện thoại nhận kết quả.
- Mã QR được tạo **tại TV** từ token ngẫu nhiên 128-bit, hết hạn trong **10 phút** hoặc khi đóng hộp thoại/tạo QR mới. Mã chỉ cho phép gửi nguồn đến TV đang hiển thị mã.
- Mã nguồn trang quản lý nằm ở `tizenbrew/phone.html` và bản được xuất bản độc lập trên GitHub Pages tại **https://trisanghy.github.io/open-iptv-pro/tizen/phone.html** (tệp xuất bản: `web/online:tizen/phone.html`). Quét QR sẽ mở trực tiếp trang này, không cần trang trung gian RawGitHack. Khi cập nhật chức năng trang quản lý, cần đồng bộ bản sao trên `web/online`.
- Luồng nhập dùng **Supabase Realtime Broadcast tạm thời** (TLS). Không ghi danh sách nguồn vào database; TV lưu dữ liệu cục bộ. Dịch vụ chuyển tiếp vẫn xử lý dữ liệu truyền, nên không chia sẻ QR với người không được phép.

## Giới hạn và kiểm thử

- TV và điện thoại cần Internet/WebSocket; TV cần `crypto.getRandomValues`. Phần mềm phải tải được Supabase SDK từ nguồn lưu trữ công khai.
- Danh sách M3U phải có URL HTTP(S) và máy chủ cho phép CORS. HTML5 trên TizenBrew không dùng Samsung AVPlay; khả năng phát tùy codec/HTTPS.
- **Đã bỏ ô dán nội dung M3U** trong màn thêm nguồn. Danh sách đã lưu từ các phiên bản trước vẫn được giữ nguyên.
- Kiểm thử tự động: `node --test tizenbrew/tests/source-dialog.test.cjs`. Chưa xác minh thực tế trên TV Samsung.
- Nhánh tizenbrew độc lập, không sửa `main`, `web/online`, Electron, Rust hay Mobile.

Không cung cấp nguồn IPTV bản quyền mặc định. Chỉ sử dụng nội dung có quyền truy cập.

## Điều khiển Back / Thoát (v0.1.4)

- **Back** trong trình phát: trở lại danh sách kênh.
- **Back** trong hộp thêm nguồn, QR hoặc tìm kiếm: đóng hộp thoại và dừng ghép đôi.
- **Back** tại màn hình chính: trở về TizenBrew (trên phiên mở thông thường bằng lịch sử); nếu mở trực tiếp không có lịch sử, thoát TizenBrew về Samsung Home.
- Bổ sung nút **↶ Thoát** trên thanh công cụ để dự phòng.
- Xử lý cả phím 10009 (`keydown`) lẫn sự kiện `tizenhwkey`, không thêm `Back` vào `package.json.keys` vì phím hệ thống không được đăng ký theo cách đó.
- Kiểm thử logic với mô phỏng phím Back. Vẫn cần xác minh trên TV Samsung thật.

## Sửa lỗi v0.1.4 — ô xác nhận quyền trên Samsung TV

- Thay ô checkbox nhỏ không nhận OK bằng nút dạng checkbox có vùng bấm rộng, trạng thái ✓ hiển thị rõ và thuộc tính `aria-checked`.
- Remote: từ ô URL nhấn **↓** đến ô xác nhận, nhấn **OK** để bật/tắt dấu ✓, sau đó nhấn **↓** đến **Lưu và tải**; nhấn **↑** để quay lại.
- Chặn lặp phím OK giữ lâu; hỗ trợ click bằng chuột/remote và reset xác nhận mỗi khi mở hộp thoại mới.
- Điều kiện xác nhận vẫn bắt buộc, không tự tích và không bỏ qua quyền sử dụng nội dung.

## v0.1.5 — QR quản lý nguồn và kênh, sửa lỗi giao nhận

### Sửa lỗi cũ

- Fix **cơ chế nhận Supabase Broadcast**: handler phải đọc \`event.payload\`, không phải \`event.id\`. Trước đây điện thoại nhận ACK máy chủ nhưng TV đã bỏ qua yêu cầu do đọc sai cấu trúc bản tin.
- Điện thoại **chỉ cho thao tác khi TV xác nhận đang trực tuyến** bằng RPC \`hello\`. Sau khi gửi nguồn, TV phát sự kiện **đã nhận/đang tải**, cuối cùng phản hồi thành công hoặc lỗi.
- TV tải danh sách M3U có hạn mức chờ 25 giây cho kết nối và đọc nội dung; báo lỗi cụ thể khi hết thời gian hoặc CORS.
- Xác nhận thực sự lưu vào \`localStorage\`: nếu bộ nhớ TV đầy thì hoàn tác thay đổi và trả lỗi, không báo thành công giả.

### Trang quản lý qua một QR

- Tab **Quản lý danh sách**: xem nguồn hiện có trên TV, tên nguồn, URL gốc, số kênh, thứ tự nguồn; đổi tên, lên/xuống hoặc xóa nguồn.
- Danh sách kênh có **tìm kiếm**, phân trang 30 kênh, đổi tên/nhóm/URL, thêm kênh thủ công, xóa kênh, ẩn/hiện, lên/xuống, đánh dấu yêu thích.
- Tab **Thêm nguồn**: gửi tên và URL M3U, chỉ khi TV đã xác nhận kết nối. TV trả tiến độ, số kênh thực tế hoặc lỗi.
- Các thay đổi thực hiện tại TV rồi lưu cục bộ; trang điện thoại chỉ hiển thị trạng thái đã lưu khi nhận \`manager-result\`. Khi hết 10 phút, cần QR mới.
- **Giữ hộp thoại QR mở trên TV** trong lúc quản lý. Nếu TV không hiển thị trạng thái "TV đã trực tuyến" dưới QR, kết nối chưa hoạt động và điện thoại không thể gửi nguồn.
- Trang quản lý dùng GitHub Pages `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html`; QR thêm `?v=019#code=...` để bảo đảm mở đúng phiên bản và giữ mã ghép TV. Không dùng RawGitHack.

## Sửa Back và nút THOÁT v0.1.6

- Thêm nút đỏ lớn **⏻ THOÁT ỨNG DỤNG** tại cuối menu bên trái; nút **⏻ THOÁT** trên thanh trên vẫn được giữ và làm nổi bật.
- Back trên màn chính: điều hướng **trực tiếp** về launcher TizenBrew bằng URL `/tizenbrew-ui/dist/index.html` cùng host hiện tại, thay vì `history.back()` vốn có thể quay về sai trang.
- Back khi nhập nguồn/QR/tìm kiếm: đóng hộp thoại; Back khi đang xem: trở về danh sách.
- Bắt `keydown`, `keyup`, `tizenhwkey` với chống lặp phím; không đăng ký phím Back qua `tvinputdevice.registerKey`.
- Nếu không điều hướng được, dự phòng thoát ứng dụng Tizen qua native API.
- Đã kiểm thử giả lập logic ở mức mã nguồn; việc bắt phím vật lý vẫn cần xác minh trên TV Samsung thật.
- Để tải mã mới, đóng hẳn TizenBrew và mở lại; có thể cần gỡ/thêm module nếu bộ đệm cũ.

## Sửa lỗi nguồn và URL v0.1.7 (22/11/2026)

- Ô URL trên **TV và điện thoại** nhận tên miền thiếu giao thức (`d.org.vn/listiptv`) rồi chuẩn hóa thành `https://d.org.vn/listiptv`.
- Tự sửa cú pháp nhầm `htttp://`, `htttps://`, `https//`, `https:/`, `http//` và giữ đúng HTTP hoặc HTTPS đã nhập.
- Sau khi nhập, điện thoại hiện URL đã chuẩn hóa. Khi lưu, TV chuẩn hóa lại để tương thích với trang quản lý phiên bản cũ.
- TV phân biệt HTTP 403/404, trang HTML không phải playlist, thiếu kênh hợp lệ, timeout và lỗi mạng/HTTPS/CORS. Lỗi sẽ phản hồi qua QR về điện thoại; chỉ báo thành công sau khi TV lưu được nguồn.
- Mã QR mở trang quản lý ở `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html?v=017` và tệp này đã được đồng bộ với `web/online:tizen/phone.html`. Ứng dụng Web chính không bị thay đổi.
- Lưu ý: tự sửa cú pháp URL **không** thể giúp trình duyệt TV vượt chính sách CORS, HTTPS/chứng chỉ hỏng, lỗi máy chủ hoặc nội dung bị giới hạn quyền. Nếu nguồn vẫn lỗi, mở URL đã chuẩn hóa trên TV và dùng playlist có CORS phù hợp.
- Kiểm thử: `node --test tizenbrew/tests/source-dialog.test.cjs` (môi trường Node cần có khi chạy cục bộ/CI). Kiểm tra thực tế trên Samsung Tizen vẫn cần thực hiện.

## Mở luôn bản WGT mới nhất từ GitHub trên Windows (CMD)

Mỗi lần chạy lệnh sau trong Command Prompt, công cụ tải đúng HEAD của nhánh `tizenbrew`, dựng **WGT chưa ký dành cho bản xem thử trên trình duyệt**, phục vụ giao diện qua `http://127.0.0.1` rồi tự mở trình duyệt mặc định. Máy không cần Python hay Tizen Studio, cần Windows PowerShell 5.1+:

```bat
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$f=Join-Path $env:TEMP 'OpenIPTV-Latest-WGT.ps1'; Invoke-WebRequest -UseBasicParsing 'https://raw.githubusercontent.com/trisanghy/open-iptv-pro/tizenbrew/tizenbrew/Open-Latest-WGT-Windows.ps1' -OutFile $f; & $f"
```

- Không lấy một Release cố định: script truy vấn SHA nhánh `tizenbrew` mới nhất mỗi lần khởi chạy và tải tệp từ chính SHA đó, nên không dùng nhầm mã nguồn cũ.
- WGT sinh ra được lưu tại `%LOCALAPPDATA%\OpenIPTVPro\TizenBrowser\<commit-sha>\Open-IPTV-Pro-TizenBrowser.wgt`.
- Phiên bản đã tải được cache theo SHA; cùng SHA thì không tải lại. Nhấn **Ctrl+C** trong CMD để tắt máy chủ. Không cần quyền quản trị.
- Workflow `package-tizen-browser.yml` tự dựng WGT Preview từ mỗi thay đổi `tizenbrew/**` và phát hành tag bất biến theo SHA.
- Đây **không phải gói WGT đã ký để cài lên TV Samsung**; không hỗ trợ một số API Tizen khi chạy trên Chrome/Edge. Trình duyệt truy cập Internet khi dùng các tính năng liên kết QR.

## v0.1.8 — Nhập playlist qua QR khi nguồn URL bị lỗi CORS (22/11/2026)

- Sau khi nhập URL trên điện thoại, TV vẫn tải trực tiếp trước. Nếu tải thất bại do mạng/CORS, trang điện thoại tự thử tải URL đó bằng `fetch` trên điện thoại (chỉ khi chính sách CORS cho phép) rồi chuyển nội dung M3U cho TV.
- Nếu cả hai trình duyệt bị chặn: ở trang QR, nhấn **↗ Mở URL nguồn bằng trình duyệt**, tải/lưu tệp **.m3u** hoặc **.m3u8** về điện thoại; nhấn **Chọn tệp M3U / M3U8** → **↑ Gửi tệp M3U sang TV**. Không cần USB, không dùng proxy công khai.
- Tệp tối đa 3 MB. Điện thoại chia dữ liệu thành các phần tối đa 12.000 ký tự, mỗi phần cần TV xác nhận; có gửi lại tối đa 3 lượt. TV kiểm tra mã truyền riêng, đúng thứ tự, tổng kích thước và checksum FNV-1a trước khi phân tích và lưu. Khi lỗi hoặc chưa gửi đủ, không lưu nguồn thành công giả.
- QR tiếp tục có hạn 10 phút. Bản đã đồng bộ cho trang quản lý trên `web/online:tizen/phone.html`; địa chỉ QR có `?v=019` để tránh dùng phiên bản HTML cũ.
- Trạng thái “đã lưu” nghĩa là đã lưu danh sách kênh trên TV, **không** bảo đảm mọi kênh phát được nếu codec, DRM, CORS hoặc đường dẫn media bên trong bị giới hạn.
- Trình duyệt Tizen không thể tự vượt giới hạn CORS của máy chủ ngoài; nhập tệp là lựa chọn dự phòng có thể thực hiện mà không cần máy chủ proxy. Việc kiểm tra trên TV Samsung thật và khả năng truy cập thực tế `https://d.org.vn/listiptv` vẫn chưa được xác nhận.
- Kiểm thử logic bổ sung: `node --test tizenbrew/tests/source-dialog.test.cjs`. Không sửa main/Electron/Rust/Mobile.

## v0.1.9 — Khắc phục trải nghiệm nhập nguồn khi URL bị CORS hoặc sai giao thức

- TV hiển thị thông báo ngắn: truy cập URL thất bại không đồng nghĩa URL sai. Đường QR vẫn mở để người dùng nhập trên điện thoại.
- Trang điện thoại có **3 đường nhập M3U**: gửi URL; chọn tệp .m3u/.m3u8 trên điện thoại; hoặc **dán nội dung M3U bắt đầu bằng `#EXTM3U`**. Cả cách gửi tệp và dán văn bản đều dùng giao thức QR có kiểm tra toàn vẹn, tối đa 3 MB.
- Ô URL trên trang điện thoại được đổi từ `type="url"` sang `type="text" inputmode="url"`, để trình duyệt không chặn các URL thiếu `http(s)://` và URL gõ nhầm trước khi bộ chuẩn hóa tự động chạy. Ô URL sửa kênh cũng được sửa.
- QR mới mở `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html?v=019`. Tệp này được đồng bộ riêng trong nhánh `web/online` mà không sửa trình phát web chính.
- Link `https://d.org.vn/listiptv` chưa thể xác minh trực tiếp từ môi trường kiểm thử. TV dùng trình duyệt không thể tự vượt CORS nếu máy chủ không cho phép; hãy mở link trên điện thoại và dùng file hoặc sao chép nội dung M3U để chuyển qua QR.
- Kiểm thử logic đã bổ sung trong `tizenbrew/tests/source-dialog.test.cjs`; còn cần xác nhận chạy thực tế trên TV Samsung.

## v0.1.10 — Đọc URL rút gọn như bản Web, không cần gửi tệp thủ công

- Đối chiếu trực tiếp `web/online:app.js` hàm `readSourceURL()`: bản Web đã có bảng ánh xạ **chính xác** các link rút gọn công khai sang playlist HTTPS hỗ trợ trình duyệt.
- TizenBrew giờ thử URL gốc `https://d.org.vn/listiptv` trước. Khi CORS, timeout, lỗi HTTP hoặc nội dung không phải M3U, TV tự thử `https://raw.githubusercontent.com/vuminhthanh12/vuminhthanh12/main/vmttv` theo đúng đường dự phòng của Web.
- Tương tự với `https://nts12.s.gy/iptv`: `https://gist.githubusercontent.com/trisanghy/e63b2927598a4b932b3708ddd3183aaa/raw/iptv.m3u`.
- URL nhập bắt đầu bằng `http://` của **đúng hai liên kết trên** sẽ thử thẳng đích HTTPS, tránh lỗi nội dung hỗn hợp. Các nguồn URL riêng khác không bị thay đổi hoặc chuyển tới dịch vụ khác.
- Vẫn **lưu nguyên URL nguồn gốc** trong danh sách để quản lý sau; chỉ thay URL khi tải nội dung M3U. Chế độ gửi tệp và dán M3U qua QR v0.1.9 vẫn giữ nguyên.
- Đã kiểm tra truy cập đích HTTPS bằng nguồn công khai: nội dung bắt đầu bằng `#EXTM3U`. Kiểm thử mô phỏng tải lỗi CORS → dự phòng và không làm thay đổi URL riêng; **chưa xác minh thực tế trên TV Samsung**. Cấu hình giải mã/phát các kênh còn phụ thuộc TV, CORS và codec.
- Kiểm thử hồi quy: `node --test tizenbrew/tests/source-dialog.test.cjs`. Không sửa nhánh `main`, `web/online`, Electron, Rust hoặc Mobile trong vòng này.
