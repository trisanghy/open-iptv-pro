# Open IPTV Pro TV · TizenBrew v0.1.8 (thử nghiệm)

## Cập nhật không cần USB

1. Mở ứng dụng **TizenBrew** (không phải TizenBrew Installer).
2. Vào **Module Manager → Add GitHub Module**, nhập `trisanghy/open-iptv-pro@tizenbrew`.
3. Mở/cập nhật module **Open IPTV Pro TV**. Nếu thấy giao diện cũ, tải lại module hoặc xóa cache.

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
- Trang quản lý dùng GitHub Pages `https://trisanghy.github.io/open-iptv-pro/tizen/phone.html`; QR thêm `?v=018#code=...` để bảo đảm mở đúng phiên bản và giữ mã ghép TV. Không dùng RawGitHack.

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
- QR tiếp tục có hạn 10 phút. Bản đã đồng bộ cho trang quản lý trên `web/online:tizen/phone.html`; địa chỉ QR có `?v=018` để tránh dùng phiên bản HTML cũ.
- Trạng thái “đã lưu” nghĩa là đã lưu danh sách kênh trên TV, **không** bảo đảm mọi kênh phát được nếu codec, DRM, CORS hoặc đường dẫn media bên trong bị giới hạn.
- Trình duyệt Tizen không thể tự vượt giới hạn CORS của máy chủ ngoài; nhập tệp là lựa chọn dự phòng có thể thực hiện mà không cần máy chủ proxy. Việc kiểm tra trên TV Samsung thật và khả năng truy cập thực tế `https://d.org.vn/listiptv` vẫn chưa được xác nhận.
- Kiểm thử logic bổ sung: `node --test tizenbrew/tests/source-dialog.test.cjs`. Không sửa main/Electron/Rust/Mobile.
