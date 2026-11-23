# Open IPTV Pro TV · TizenBrew v0.1.44 (OTA)

## v0.1.44 — Mở lại kênh nhanh và giảm chớp hình

- Ghi nhớ bộ phát và nguồn đã chạy theo từng kênh. Nếu kênh phát được bằng URL dự phòng đã gắn sẵn, lần mở tiếp theo ưu tiên URL đó bằng một phiên phát mới.
- Tách lượt phát cũ khi đổi kênh hoặc đổi bộ giải mã. Màn hình chuyển tiếp che các khung hình lúc khởi tạo và tự bỏ khi hình mới đã sẵn sàng.
- Giữ bộ đệm khi HLS gặp gián đoạn ngắn. Khi bộ phát đã lưu không mở được, ứng dụng thử lại các bộ phát và nguồn dự phòng của đúng kênh.

## v0.1.43 — Ổn định phát HLS sau khi kênh đã lên hình

- Relay kiểm tra playlist chính và các playlist biến thể. Với phản hồi rỗng, bị ngắt hoặc sai định dạng, relay thử lại tối đa hai lần trước khi báo lỗi về trình phát.
- Trình phát thử tải lại playlist ngay trên bộ đệm hiện tại khi gặp `levelParsingError` lúc đang xem. Nếu lỗi kéo dài, ứng dụng vẫn dùng cơ chế dự phòng có giới hạn.
- Relay dùng lại đường dẫn nội bộ của các đoạn video xuất hiện ở nhiều lần cập nhật playlist. Dịch vụ mới dùng cổng loopback `17870` để tránh dùng nhầm tiến trình còn chạy từ bản cũ.

## v0.1.42 — Thử lại bằng Chrome khi nguồn trả HTTP 403

- Khi Samsung/Tizen User-Agent nhận HTTP 403 từ máy chủ kênh, relay trên TV tự thử lại URL một lần với Chrome User-Agent. Nếu thành công, cùng User-Agent Chrome được giữ cho manifest và segment của phiên xem đó.
- Thử trực tiếp URL VTV2 trong M3U đính kèm: Tizen UA nhận HTTP 403; Chrome 131 nhận HTTP 200 và manifest `#EXTM3U`. Relay không thêm Origin/Referer giả.
- Relay chuyển sang cổng loopback `17869` để tránh tiến trình phiên bản cũ còn chiếm cổng trước; bản mới hiển thị `0.1.42` trong chẩn đoán.
- Kiểm thử tự động mô phỏng đúng tình huống Tizen 403 → Chrome 200, sau đó phát segment bằng Chrome. Chưa thể xác nhận phát trên TV Samsung thật từ môi trường này.

## v0.1.41 — Chuyển kênh trực tiếp bằng ↑/↓ trong toàn màn hình

- Bấm ↑ hoặc ↓ khi đang xem: danh sách kênh hiện lên và **chuyển sang kênh trước/sau ngay lập tức**, không cần OK.
- Danh sách vẫn hiển thị khi chuyển kênh tiếp bằng ↑/↓. ←/→ chỉ đổi thư mục. OK/Back đóng danh sách mà vẫn giữ kênh đang phát.
- Lần bấm ↑/↓ đầu tiên bắt đầu từ kênh thực sự đang phát, tránh chọn sai do vị trí cũ. OK không khởi chạy lại cùng một kênh.
- Chỉ cập nhật `tizenbrew/index.html` và kiểm thử bộ chọn kênh, không tác động đến bản web/Cast hoặc relay.
- Đã kiểm tra cú pháp JavaScript; bài kiểm thử tự động được bổ sung. Chưa xác minh trên Samsung TV thật.

## v0.1.35 — Hiện chẩn đoán HLS và User-Agent đầy đủ

- Sau lỗi phát qua relay TV, hiện User-Agent mà TizenBrew gửi và từng lần upstream trả lỗi: hostname, HTTP status, direct/Cast-page context, Origin/Referer, content-type và server header. Không hiển thị URL, path, query hoặc token kênh.
- Thêm endpoint chẩn đoán chỉ đọc, loopback-only, yêu cầu cùng Origin và header bảo vệ như các endpoint relay khác; giới hạn tối đa 8 lần lỗi cho mỗi phiên.
- Giữ lần retry 403 theo ngữ cảnh HTTPS của Cast; không tự thay User-Agent bằng giá trị đoán. Dùng log trên TV để xác định UA nào được gửi trước khi chọn UA khác.
- Kiểm thử CI xác nhận endpoint debug không trả URL/token; WGT giả lập được đóng gói. Chưa xác nhận trên TV thật.

## v0.1.34 — Thử lại HTTP 403 theo ngữ cảnh Cast HTTPS

- Khi relay nội bộ nhận HTTP 403, thử lại đúng một lần với `Origin` và `Referer` cố định của `tv.html` trên HTTPS — cùng ngữ cảnh trang TV Cast đã phát được. Giữ nguyên User-Agent TV đã chuyển tiếp và không thay URL/token của kênh.
- Không lặp vô hạn: nếu máy chủ vẫn từ chối sau lần thử có ngữ cảnh Cast, ứng dụng giữ nguyên thông báo lỗi 403 để không báo phát thành công giả.
- Chỉ sửa `tizenbrew`; bộ phát Cast/Web không thay đổi. Xác minh qua CI và WGT giả lập; chưa có xác nhận phát VTV trên TV thật.

## v0.1.32 — Phát HLS ngay trong TizenBrew, không chuyển sang Cast

- **Đúng mục tiêu:** khi chọn VTV1/VTV2/VTV7 ngay trong Open IPTV Pro trên TizenBrew, ứng dụng phát qua bộ phát hiện tại; nếu HLS.js không tải được manifest do CORS, tự kích hoạt **bộ chuyển tiếp HLS chạy trên chính Samsung TV**. Video tiếp tục hiển thị trong trình phát, remote OK/Back/↑↓←→ không thay đổi. Không tự mở `tv.html` hoặc đòi mã ghép đôi.
- **Dịch vụ TizenBrew:** khai báo `serviceFile: tizenbrew/hls-relay-v1.js` trong `package.json`. Mã dịch vụ được nạp qua cơ chế TizenBrew `StartService` (WebSocket event type 6) ngay khi module khởi động, không cần người dùng tự cài Node, mở laptop, hoặc sử dụng proxy bên ngoài. Cơ chế gọi khởi động có điều tiết; client thử kết nối lại dịch vụ tối đa 7 lần nếu tiến trình chưa sẵn sàng.
- **Phạm vi bảo mật:** ở phiên bản 0.1.32, dịch vụ chỉ lắng nghe `127.0.0.1:17868`, chỉ chấp nhận Origin TizenBrew localhost và header riêng, từ chối địa chỉ IP mạng nội bộ/loopback từ playlist, chỉ kết nối HTTP(S). URL và token gốc không ghi vào log, không gửi tới máy chủ proxy bên thứ ba. Playlist HLS được viết lại sang ID tài nguyên ngẫu nhiên trên TV; hỗ trợ manifest nhiều mức chất lượng, audio URI, AES key, init segment và HTTP Range. Giới hạn phiên, số tài nguyên và kích thước để giảm rủi ro.
- **Khả năng khắc phục:** giải quyết một lớp lỗi **CORS của WebView** khi TV vẫn có mạng và nguồn HLS hợp lệ. **Không thể** khắc phục HTTP 403 do máy chủ từ chối cả yêu cầu từ dịch vụ TV, codec phần cứng không hỗ trợ, DRM hoặc AVPlay bị giới hạn. Khi đó lỗi sẽ hiển thị trên TV; không được coi là đã phát thành công.
- **Kênh & dữ liệu:** giữ chính xác URL đã chọn (bản v0.1.31), không gom URL của kênh trùng tên; giữ QR, thứ tự kênh, lịch sử và mục yêu thích. Đường OTA vẫn `tizenbrew/bootstrap.html`. **Không chỉnh sửa `web/online` hoặc trình phát Cast**.
- **Kiểm thử:** `tizenbrew/tests/tv-local-hls-relay.test.cjs` kiểm tra CORS preflight, bắt buộc header và nguồn TV, playlist rewriting, không rò URL/token, chặn loopback/private IP. `tizenbrew/tests/tizen-in-app-relay-playback.test.cjs` kiểm tra HLS.js tự thử relay, chọn kênh khác hủy callback cũ và không tự dùng Cast. `tizenbrew/tests/last-channel-startup.test.cjs` kiểm tra dịch vụ khởi động trước khi mở kênh gần nhất.
- **Kích hoạt:** TizenBrew có thể dùng metadata module cũ trong cache ngay sau khi OTA. Mã ứng dụng sẽ gửi `StartService` cho dịch vụ riêng để giảm tình trạng đó. Nếu TV không kết nối được dịch vụ nội bộ sau OTA, đóng hẳn rồi mở lại TizenBrew (không xóa ứng dụng, không mất kênh).
- **Giới hạn xác minh:** kiểm thử CI kiểm tra mã và luồng giả lập; chưa có phép thử phát VTV2/VTV7 trực tiếp trên thiết bị Samsung của người dùng.

## v0.1.31 — Giữ đúng URL kênh được chọn; không tự đổi sang cùng tên ở nguồn khác

- **Lỗi được xác nhận trong mã:** `playbackCandidates()` trước đây tìm mọi kênh có cùng tên, bất kể nguồn M3U, rồi tự thử từng URL khi có lỗi. Một kênh VTV7 được chọn ở nguồn 1 có thể bất ngờ chuyển qua nguồn 2 với hostname, token hoặc quyền truy cập khác và nhận HTTP 403.
- **Sửa:** ưu tiên và giữ nguyên URL chính xác trên bản ghi kênh được người dùng chọn. Không tự lấy URL của những bản ghi khác chỉ vì trùng tên. Nếu một bản ghi có mảng `backupUrls` hoặc `fallbackUrls` được gắn rõ, mới thử tối đa bốn URL dự phòng riêng của bản ghi đó, kiểm tra HTTP(S), loại trùng và giữ thứ tự.
- **Chẩn đoán không lộ bí mật:** mỗi lần khởi chạy, hiển thị thứ tự `Nguồn 1/N` và **chỉ tên miền nguồn đang thử**, không hiện đường dẫn, query string hay token. Các lỗi HLS.js vẫn thể hiện HTTP 403/404 khi có mã phản hồi.
- **Hạn chế kỹ thuật còn lại:** WebView TizenBrew chạy qua localhost và không có Samsung AVPlay native trên nhiều TV; nếu máy chủ HLS chặn CORS/origin hoặc codec không được hỗ trợ thì thay đổi này không đủ để phát được. Cần đối chiếu URL kênh và phản hồi mạng, hoặc dùng Cast 6 số đang hoạt động qua Samsung Internet; **không sửa bộ phát Cast Web** trong bản này.
- **Giữ nguyên:** appPath OTA `tizenbrew/bootstrap.html`, giao diện, Back, QR quản lý/sắp xếp, danh sách kênh, lịch sử và yêu thích. Chỉ sửa nhánh `tizenbrew`.
- **Kiểm thử:** `tizenbrew/tests/tizen-playback-source-recovery.test.cjs` xác minh không nhảy giữa playlist trùng tên, URL dự phòng phải được chỉ định rõ, giữ tối đa năm URL, không hiển thị token và không ảnh hưởng kênh khác.
- Chưa kiểm thử phát thành công VTV1–VTV7 trên phần cứng Samsung; kiểm thử CI chỉ xác nhận logic trình phát.

## v0.1.30 — Sửa nút Cast sai trang và bỏ đường thử nghiệm gây manifestLoadError

- **Chứng cứ từ TV:** người dùng xác nhận `tv.html` mở qua Samsung Browser và được điều khiển từ Web/Mobile thì phát VTV7 tốt. Trang `tizen/hosted-player.html` do bản 0.1.28–0.1.29 bổ sung vẫn báo `manifestLoadError`. Hai trang không tương đương: Cast thật nhận URL qua phiên ghép đôi, còn hosted-player lấy lại URL TizenBrew đã chọn.
- **Đổi nút dự phòng:** bấm **Mở Cast chuẩn trên Samsung Internet (mã 6 số)** sẽ mở đúng `https://trisanghy.github.io/open-iptv-pro/tv.html` — trang Cast đã xác nhận hoạt động. Mở ứng dụng Web/Mobile Open IPTV Pro, chọn Cast và nhập mã 6 số trên TV để phát từ URL đang hoạt động của bản Web. Nút **không tự phát kênh được chọn** và không giả vờ rằng mở trang thử nghiệm sẽ sửa HTTP 403.
- **Không chuyển tiếp URL nhạy cảm:** đường mở trình duyệt chỉ chứa địa chỉ `tv.html`, không kèm URL M3U8/token trong query, fragment hay lịch sử. Nếu trình duyệt mở thành công, dừng bộ phát TizenBrew cũ để tránh chồng âm/luồng.
- **Tắt tự động thử iframe hosted-player:** nhánh fallback không mở iframe HTTPS thử nghiệm sau lỗi nữa. Nếu kênh có URL dự phòng do người dùng nhập, vẫn thử lần lượt rồi mới báo lỗi; không chạy hai nguồn cùng lúc.
- **Chẩn đoán nguồn:** khi lỗi, màn hình hiển thị tên miền nguồn đang được thử và thứ tự `Nguồn 1/N`; không hiển thị đường dẫn, token hoặc thông số URL. Giúp đối chiếu đúng hostname giữa TizenBrew và bản Web Cast.
- **Cần xác minh riêng:** chỉ khi cùng một URL, token và điều kiện truy cập mà `tv.html` phát được trong khi TizenBrew thất bại, mới kết luận khác biệt về môi trường WebView/CORS; hiện chưa có đủ URL để xác định máy chủ 403 do nguyên nhân nào.
- **Bảo toàn OTA:** `package.json` vẫn dùng `appPath=tizenbrew/bootstrap.html`. Không xóa nguồn, lịch sử, yêu thích, thứ tự hay bảng chọn kênh.
- **Kiểm thử:** `tizenbrew/tests/browser-native-fallback.test.cjs` kiểm tra mở đúng Cast receiver, không rò URL/token và chỉ dừng engine sau khi Samsung Internet mở thành công. `tizenbrew/tests/hosted-samsung-cast.test.cjs` xác minh không tự chuyển sang iframe lỗi.
- **Giới hạn:** chưa xác minh trên TV người dùng; nút Cast chuẩn cần ghép mã 6 số bằng điện thoại hoặc Web và chọn kênh lại.

## v0.1.29 — Sửa mở kênh bằng Samsung Internet thành bộ phát Cast thực

- **Chẩn đoán từ ảnh TV:** bộ điều khiển video nhỏ `00:00` xuất hiện khi Samsung Internet được mở trực tiếp bằng URL `.m3u8`; đó không phải giao diện Cast đã phát thành công trên Samsung Browser. Nút cũ dùng `ApplicationControl(view, rawStreamUrl)`, khiến trình duyệt tự cố phát tệp HLS mà không có ứng dụng Web đứng giữa.
- **Thay đường mở:** nhấn **Phát kênh trong Samsung Internet (Cast)** sẽ mở trang HTTPS `/tizen/hosted-player.html` có cùng bộ phát HTML5/HLS.js/DASH.js với trang Cast, và nhận URL kênh đang chọn qua fragment `#stream=...`. Trang phát xóa fragment khỏi thanh địa chỉ ngay khi khởi động; không gửi URL riêng tư trong đường dẫn hay query HTTP tới GitHub Pages.
- **Có nút Phát / Thử lại:** trang mở trong Samsung Internet hiển thị trạng thái đang tải, lỗi và nút điều khiển trên TV, thay vì màn hình video đen `00:00` không có thông tin.
- **Không phát chồng:** chỉ khi mở Samsung Internet thành công, ngắt toàn bộ bộ phát TizenBrew cũ để tránh hai luồng/âm thanh cùng chạy; nếu mở thất bại, giữ nguyên trạng thái hiện tại. Nguồn HTTP bị chặn ở trang Cast HTTPS và có thông báo rõ ràng.
- **URL chính/phụ:** bộ phát đã có cơ chế `playbackCandidates` thử lần lượt: URL đang chọn ở đầu, sau đó tối đa 4 URL khác từ danh sách M3U đã nhập có cùng tên kênh. Cơ chế không phát đồng thời; mỗi lần đổi nguồn gọi `stopPlaybackEngine` trước. Không sửa hay gộp URL của người dùng, nhưng nhiều kênh trùng tên có thể được xem như các nguồn dự phòng — nếu cần phân biệt, nên đặt tên kênh riêng.
- **Chế độ Cast trong TizenBrew:** giữ iframe dự phòng, truyền tín hiệu phát/tạm dừng qua `postMessage`; trang HTTPS giờ hỗ trợ cả chế độ khởi động độc lập trên Samsung Internet. Không thay đổi trình phát Cast `tv.html` đang dùng mã ghép đôi.
- **OTA:** giữ `package.json` với `appPath: tizenbrew/bootstrap.html`, không yêu cầu xóa cài lại.
- **Kiểm thử:** `tizenbrew/tests/browser-native-fallback.test.cjs` kiểm tra ứng dụng mở trang Cast thay vì URL thô, chọn đúng URL đang phát, nguồn HTTP bị chặn và chỉ đóng bộ phát sau khi mở trình duyệt thành công; `web/online:tests/tizen-hosted-browser-player.test.cjs` kiểm tra khởi động qua fragment, xóa fragment, nút thử lại và iframe không nhận nhầm dữ liệu.
- **Giới hạn:** chưa thử VTV2–VTV5 trực tiếp trên TV Samsung. Trình duyệt Samsung có thể chặn autoplay và cần nhấn nút Phát; khi TizenBrew dùng iframe vẫn có thể khác Samsung Internet độc lập.

## v0.1.28 — Bộ phát Cast HTTPS dự phòng cho Samsung TV

- **Cơ sở sửa lỗi:** trang Cast `tv.html` đang chạy tốt trong Samsung Internet sử dụng HTML5 HLS gốc trước, HLS.js/dash.js cục bộ khi cần, và có nguồn gốc trang `https://trisanghy.github.io`. Module TizenBrew lại chạy từ `http://127.0.0.1:8081` và một số luồng báo `manifestLoadError` khi mở trực tiếp. Cùng TV nhưng khác origin và ngữ cảnh WebView; không được kết luận luồng M3U hỏng.
- **Đường phát Cast tách biệt:** bổ sung `tizen/hosted-player.html` trên nhánh `web/online`, cùng origin, thư viện HLS.js và dash.js với trang Cast đang chạy. Trang này không cần mã 6 số, không sử dụng Supabase, không lưu URL hoặc token nguồn.
- **Tự chuyển trên TizenBrew:** nếu HTML5/HLS.js/AVPlay nội bộ thất bại ổn định, tự thử **cùng URL HTTPS** bên trong iframe ghép qua `postMessage`; không đẩy URL lên proxy và không sửa M3U đã lưu. Chỉ sau khi bộ phát Cast cũng lỗi mới thử URL dự phòng khác (nếu có).
- **Giữ điều khiển:** giao diện TV bên ngoài vẫn quản lý ↑ ↓ ← → bảng chọn kênh, OK phát/tạm dừng qua `postMessage`, Back đóng khung phát và về danh sách. Khung Cast không chiếm focus điều khiển TV; khi chuyển kênh, hủy khung cũ và bỏ callback đến muộn.
- **An toàn:** chỉ gửi URL tới origin HTTPS cố định `trisanghy.github.io`; bộ phát từ chối lệnh của parent có origin khác TizenBrew nội bộ, parent không chấp nhận thông điệp từ iframe lạ. URL nguồn không đi vào query string hoặc log. Không dùng iframe cho nguồn HTTP vì sẽ vướng mixed-content trên trang HTTPS.
- **Giới hạn:** Samsung Internet chạy độc lập và WebView TizenBrew không hoàn toàn giống nhau; HTTPS iframe có thể vẫn bị giới hạn phát tự động/codec hoặc chính sách nhúng. Thử nghiệm mã không chứng minh đã phát được VTV2–VTV5 trên TV thật. Nút mở nguồn trong Samsung Internet ở v0.1.27 được giữ nguyên để dự phòng.
- **OTA vẫn giữ nguyên:** `package.json` tiếp tục `appPath=tizenbrew/bootstrap.html`. Không sửa phát hành Electron/Rust/main, không xóa danh sách, thứ tự kênh, lịch sử/yêu thích.
- **Kiểm thử:** `tizenbrew/tests/hosted-samsung-cast.test.cjs` kiểm tra phát HTTPS, kiểm tra origin, OK, Back, chuyển nguồn và HTTP không vào HTTPS iframe.

## v0.1.27 — Đường phát bằng Samsung Internet và nguồn Tizen độc lập

- **Đối chiếu lỗi thực tế:** TizenBrew WebView có thể không cấp `webapis.avplay`, khiến VTV2–VTV5 thất bại mặc dù Samsung Internet và các ứng dụng khác vẫn xem cùng M3U. HLS.js dùng tải manifest/segment qua JavaScript nên chịu kiểm soát CORS; không thể khắc phục máy chủ chặn bằng cách tăng timeout.
- **Trình phát TizenBrew:** khi các bộ phát hiện có thất bại, hiện nút lớn **Mở thử kênh bằng Samsung Internet**. Có thể nhấn OK trên nút hoặc phím đỏ (`ColorF0Red`) để thử mở URL gốc của kênh bằng `tizen.application.launchAppControl`, không gửi qua proxy ngoài và không sửa URL đã lưu. Khả năng Samsung Internet xử lý trực tiếp URL HLS phụ thuộc thiết bị/nguồn.
- **Nếu luồng bắt đầu phát muộn:** ẩn nút dự phòng, trả focus lại màn hình trình phát. Danh sách kênh, thứ tự từ điện thoại, bảng chọn full-screen, phím Back và OTA được giữ nguyên.
- **Ứng dụng native AVPlay:** thêm `tizen-native/config.xml`, `tizen-native/build.py`, `tizen-native/README.md` và workflow `.github/workflows/package-tizen-native-avplay.yml`. Build tạo **gói WGT chưa ký** có cấu trúc native và tích hợp thư viện HLS local; không phải bản cài được ngay trên TV.
- **Hướng cài không USB:** cần Tizen Studio + Samsung Certificate Manager, chứng chỉ distributor gắn với DUID chính TV, ký và cài qua Wi-Fi; không chia sẻ chứng chỉ/mật khẩu. Bản WGT native là ứng dụng riêng, không được cập nhật bởi OTA TizenBrew, cũng không dùng chung localStorage.
- **Giới hạn xác minh:** chưa có kiểm thử phát thành công VTV2–VTV5 trên TV thật. Chỉ kiểm thử cú pháp, hành vi AppControl giả lập, cấu trúc WGT và CI.
- Bản `tizenbrew/bootstrap.html` vẫn là đường khởi động OTA đã hoạt động.

## v0.1.26 — Ghi nhớ vị trí con trỏ và đồng bộ sắp xếp kênh từ điện thoại

- **Con trỏ Samsung không nhảy về đầu:** khi menu được dựng lại, ghi nhớ nút đang chọn theo định danh ổn định (ID kênh, tên thư mục, thanh điều hướng hoặc ID nút), khôi phục focus và cuộn nút vừa chọn vào vùng nhìn thấy. Áp dụng cả sau khi đổi trang/mục, thêm hoặc chỉnh sửa nguồn, thay yêu thích và đóng bảng nhập QR.
- **Ghi nhớ sau khi mở ứng dụng lại:** lưu key focus nhỏ gọn trong localStorage riêng (`open-iptv-tizen-focus-v1`), không ghi lại cả playlist sau mỗi lần điều hướng. Khi đang nhập liệu hoặc xem toàn màn hình thì không giành focus của hộp thoại/video.
- **Bảng chọn kênh toàn màn hình:** nhớ thư mục và ID kênh vừa bôi sáng trong `open-iptv-tizen-picker-v1`. Đóng/mở lại bảng chọn vẫn ở vị trí trước, ↑/↓ duyệt tiếp, ←/→ đổi thư mục, OK mới phát.
- **Điện thoại sắp xếp → TV cập nhật ngay:** thao tác kéo thả trong trang QR đã lưu `groupOrder` nhưng trước đây TV chỉ duyệt `source.channels` nguyên bản. TV hiện tạo danh sách theo `groupOrder` từng nguồn, đồng thời tôn trọng thứ tự kênh đã kéo trong từng nhóm; nhóm được chuyển đến vị trí mới trong giao diện chính và bảng chọn full-screen.
- **Đồng bộ cấu trúc nhất quán:** snapshot cho điện thoại cũng trả danh sách theo thứ tự được lưu, nhưng mỗi kênh giữ **index vật lý** gốc của mảng `source.channels` để lệnh sửa/kéo thả tiếp theo định vị đúng và không chuyển nhầm kênh.
- **Không làm mất vị trí:** thao tác `managerMutation` không xóa `selected` sau mỗi lệnh QR; TV cập nhật danh sách ngay sau khi lưu thành công và giữ kênh đang chọn theo ID.
- **Bảo toàn:** appPath OTA vẫn là `tizenbrew/bootstrap.html`; không xóa playlist M3U, lịch sử, yêu thích, thông số bộ phát hoặc chỉnh sửa các nhánh khác.
- **Kiểm thử CI:** `tizenbrew/tests/tizen-focus-order-sync.test.cjs` xác minh sắp xếp thư mục, index vật lý trong snapshot, cập nhật TV và khôi phục focus; `tizenbrew/tests/fullscreen-channel-picker.test.cjs` kiểm tra vị trí cuối trong bảng chọn.
- Chưa xác minh trực tiếp trên Samsung TV; chỉ xác nhận kiểm thử mô phỏng và mã nguồn trên GitHub Actions.

## v0.1.25 — Phát VTV1 muộn, lỗi HLS manifest và tự chọn URL dự phòng

- **Tránh báo lỗi trước khi video phát:** Sau lỗi tải HLS/HTML5, chờ thêm 2,4 giây để phát hiện sự kiện video bắt đầu phát thật. Nếu TV bắt đầu giải mã trong khoảng này, hủy lỗi và không đổi nguồn đang xem.
- **Thử bộ phát HLS gốc thêm một lần:** nếu HLS.js báo `manifestLoadError` hoặc `manifestLoadTimeout` và Samsung khai báo native HLS, thử lại trực tiếp một lần trước khi kết luận nguồn hỏng. Không vòng lặp vô hạn.
- **Tự dự phòng nguồn cùng kênh:** khi nguồn hiện tại thất bại chắc chắn, tìm tối đa 5 URL khác nhau đã có trong playlist do người dùng nhập, chỉ khi tên kênh khớp (bỏ qua khoảng trắng, không phân biệt hoa/thường). Không thay URL nguồn đã lưu, không chuyển sang kênh tên khác, không tải danh sách công khai ngoài ý muốn.
- **Chẩn đoán lỗi cụ thể hơn:** `manifestLoadError` sẽ thể hiện HTTP 401/403/404/5xx nếu HLS.js trả mã; nếu mã 0 chỉ nêu khả năng mạng/CORS, không tự kết luận. Không hiển thị URL hay token.
- **Chuyển kênh an toàn:** callback cũ và thời gian chờ bị vô hiệu hóa khi người dùng đổi kênh; OK khi bộ phát báo lỗi sẽ khởi động lại thay vì chỉ gọi `video.play()` trên nguồn hỏng.
- **Giới hạn kỹ thuật:** TizenBrew không cấp AVPlay nếu module không có quyền hệ thống. Nếu mọi URL đều cần AVPlay hoặc bị CORS thì mã JavaScript không thể đảm bảo phát được; khi đó cần WGT có quyền AVPlay hoặc một URL hợp lệ có hỗ trợ CORS.
- **Bảo toàn:** cơ chế OTA `tizenbrew/bootstrap.html`, bảng chọn kênh điều khiển Samsung, Back, nguồn, lịch sử và yêu thích.
- **Kiểm thử hồi quy:** `tizenbrew/tests/tizen-playback-source-recovery.test.cjs` bao gồm sự kiện video đến muộn, chuyển nguồn, hạn chế số nguồn, đổi kênh giữa thời gian chờ, và thông báo HTTP/CORS không tiết lộ thông tin nguồn.
- Chưa được xác nhận phát thành công trên TV Samsung thực tế.

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

## Google TV Material 3 · EPG mỗi ngày · Tìm kiếm thông minh (23/11/2026)

- Giao diện TizenBrew dùng thiết kế **Google TV Material 3** theo mẫu duyệt: nền đen xanh, chọn kênh xanh da trời, danh sách ba cột, thông tin/lịch EPG cạnh khung xem thử. Logo **Play chuyển sắc xanh–tím trên ô trắng** được nhúng bằng đúng đường vector của `web/online:assets/icon.svg`, nên vẫn hiển thị khi TV không tải được file ảnh từ mạng.
- Bố cục tối ưu 16:9, nút lớn thao tác bằng remote; giữ các ID, bộ phát và cơ chế ghép QR hiện tại. Mục **Ứng dụng** quay về launcher TizenBrew; mục **Cài đặt** tiếp tục đổi chế độ Sáng / Tối / AMOLED. Không tự sửa dữ liệu danh sách kênh.
- Nguồn EPG ưu tiên giống Web `https://epg.io.vn/epg.xml.gz`, khi lỗi thử `https://epg.io.vn/epg.xml` rồi `https://epgshare01.online/epgshare01/epg_ripper_VN1.xml.gz` (dự phòng cũng có trong danh sách Web).
- Tự tải khi mở app nếu có nguồn M3U; **mỗi ngày lịch chỉ chạy tối đa một chu trình làm mới**, dấu lần thử/ngày lưu ở localStorage cực nhỏ. Nếu chưa có kênh, chờ đến khi người dùng thêm nguồn. Lịch lưu độc lập trong IndexedDB với một bản snapshot; khi tải/cache lỗi không xoá M3U, yêu thích, lịch sử hoặc bản EPG cũ.
- Giới hạn EPG: tệp nén không quá **8 MB**, sau giải nén không quá **24 MB**, tối đa **4.500 chương trình** (tối đa 32 chương trình/kênh), và bản snapshot lưu không quá **750 KB**. Nếu quá giới hạn, thông báo trạng thái thay vì cố ghi quá dung lượng. Tizen không hỗ trợ giải nén sẽ thử XML thường, nhưng tùy CORS/cấu hình nguồn có thể không tải được EPG.
- Giữ và đọc `tvg-id` từ M3U để ghép lịch chính xác; tiêu đề “Đang phát”, “Tiếp theo”, giờ bắt đầu/kết thúc và tiến độ phát hiển thị trong panel kênh.
- Tìm kiếm dùng lại thuật toán **OpenIPTVChannelSearch** của Web: bỏ dấu tiếng Việt, sửa lỗi gõ/transposition, tìm theo tên kênh, nhóm và chương trình EPG; hiển thị nhãn EPG trên kết quả. Nhóm **✨ Gợi ý** dựa trên yêu thích/lịch sử/EPG hiện tại; hoàn toàn tính tại TV, không truyền hành vi lên server.
- Test: `node --test tizenbrew/tests/*.test.cjs`. Kiểm tra cú pháp JS, XMLTV/timezone, quota, 1 lần/ngày, tìm kiếm/fuzzy, đề xuất, và các kiểm thử từ bản trước.
- Tất cả thay đổi mã nguồn chỉ thuộc nhánh `tizenbrew`. Gói **WGT xem thử** được tạo trong Actions riêng và *không phải* file cài Samsung TV đã ký. Độ giống ảnh tham khảo là mục tiêu bố cục/thiết kế; dữ liệu kênh và video thực tế phụ thuộc danh sách người dùng.
