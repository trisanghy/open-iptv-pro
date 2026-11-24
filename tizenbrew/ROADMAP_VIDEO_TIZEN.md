# Open IPTV Pro TV — Lộ trình phát IPTV/video cho nhánh Tizen

Ngày lập: 2026-11-24. Phạm vi duy nhất: `tizenbrew`. Không sửa `main`, `web/online`, Electron, Rust, Positron hoặc nhánh mobile; không bổ sung CarPlay và không thiết kế giao diện màn hình xe.

## Nguyên tắc
- Phát tốt và ổn định trên Samsung TV quan trọng hơn số lượng bộ giải mã. Giữ AVPlay của firmware, HTML5, HLS.js, dash.js, mpegts.js và HLS relay hiện có, chỉ thay bộ phát khi có bằng chứng lỗi.
- Mỗi kênh giữ nguyên URL chính và danh sách backup *được gắn với chính kênh đó*. Không tự lấy URL của kênh cùng tên trong nguồn khác. Không ghi URL/token vào log hoặc localStorage route profile.
- Mỗi hạng mục cần kiểm thử tự động, build WGT thử nghiệm, xác minh remote và thử phát trên TV thật. CI pass không đồng nghĩa đã thử phần cứng Samsung.
- CORS, quyền đăng nhập, DRM, codec phần cứng và chính sách nền tảng không thể bị vượt qua bằng cách đổi player. Chỉ dùng nguồn mà người dùng có quyền phát.

## Giai đoạn 1 — Đã triển khai (v0.1.50): Ưu tiên bộ phát đã kiểm chứng
- Lưu bộ phát đã ổn định theo kênh/source fingerprint, gồm AVPlay, HTML5, HLS.js, HLS relay, DASH.js và MPEG-TS.
- Tái sử dụng route được xác minh **trước** quá trình suy luận từ đuôi URL. Nếu API không có hoặc profile đang cooldown, sử dụng chuỗi phát dự phòng.
- Kiểm tra: mở kênh lần đầu, đổi qua lại 20 lượt, mở lại sau khi restart và thay URL backup; không phát chéo nguồn.

## Giai đoạn 2 — Đã triển khai (v0.1.50): Phục hồi khi đứng hình
- HTML5 theo dõi `stalled` bên cạnh `waiting`; AVPlay theo dõi `onbufferingstart` / `onbufferingcomplete`.
- Chỉ thử phục hồi khi mất tiến hình/đệm kéo dài quá ngưỡng; giữ retry budget, phiên phát mới hủy callback của phiên cũ.
- Kiểm tra: kênh gián đoạn mạng, đóng mở TV, dừng hình sau vài giây, khởi tạo video nháy một khung và 20 lượt đổi kênh. Đảm bảo không reset stream tốt chỉ vì live `currentTime` đứng yên.

## Giai đoạn 3 — Dự kiến: Nhận diện và phát video web
- Thêm thao tác điều khiển bằng remote để mở **URL media trực tiếp** có định dạng HLS (.m3u8), DASH (.mpd), MP4 và WebM nếu firmware hỗ trợ. Đường dẫn không có đuôi cần xác minh định dạng từ response/content-type trong phạm vi CORS cho phép.
- Một trang web HTML thông thường **không được** tự coi là stream media. Chỉ đề xuất mở trong trình duyệt Samsung bằng hành động tường minh; không cào nội dung đăng nhập hay phá DRM/CORS.
- Trình duyệt tích hợp toàn diện là hạng mục nghiên cứu riêng: iframe có giới hạn CSP, cross-origin và điều khiển remote. Không tuyên bố mọi trang YouTube/Netflix sẽ phát trong ứng dụng.
- Tiêu chí nghiệm thu: bộ phân loại URL có test tốt/xấu, không phát HTTP private/localhost không chủ đích, giao diện hiển thị nguồn và lỗi codec rõ ràng.

## Giai đoạn 4 — Dự kiến: Cast và các khả năng nhận phát
- Duy trì Cast chuẩn đã có bằng mã ghép đôi; đối chiếu Google Cast và Samsung Smart View receiver theo SDK/chính sách nền tảng.
- Phân biệt **TV nhận AirPlay/DLNA ở cấp hệ thống** với **ứng dụng Tizen được quyền nhận luồng**. Tizen Web không mặc nhiên là AirPlay receiver hay DLNA DMR; cần xác minh quyền, giao thức và dịch vụ nền. Không bổ sung nút nhận khi không có backend thật.
- Nếu triển khai điều khiển từ điện thoại, bắt buộc ghép đôi có xác thực, ràng buộc phiên/nguồn, giới hạn thời gian và không gửi URL riêng tư cho server bên thứ ba.
- Tiêu chí nghiệm thu: một thiết bị gửi và một TV nhận thật; phát/tạm dừng/đổi nguồn đồng bộ; lỗi không làm hỏng phiên IPTV đang chạy.

## Giai đoạn 5 — Dự kiến: Giao diện TV và remote
- Chỉ tối ưu Samsung TV: focus rõ, vùng bấm lớn, phím Back/OK và điều hướng lên/xuống; các thao tác phát không tạo stream mới khi người dùng nhấn liên tiếp.
- Không xây dựng màn hình xe, CarPlay Video, điều khiển ô tô hoặc thành phần UI của iOS.
- Tiêu chí nghiệm thu: 100% luồng điều khiển lõi dùng được bằng remote, bảng kênh tự ẩn và không phát lại kênh đang xem khi bấm OK.

## Giai đoạn 6 — Dự kiến: Preview và tương thích định dạng
- Ưu tiên metadata/ảnh tĩnh hợp lệ; nếu cần trích frame, giới hạn thời gian/tần suất, giải phóng decoder khi chuyển kênh, không làm chậm khung TV chính.
- MKV/WebM/AVI: đánh giá theo container+video codec+audio codec của từng đời Samsung; không mặc định rằng FFmpeg hay VLC có thể nhúng dưới dạng bộ giải mã phần mềm toàn năng trong Tizen Web.
- Chỉ cân nhắc chuyển mã cục bộ khi có engine/service được TV hỗ trợ, giới hạn CPU/RAM và có kiểm thử nhiệt/độ trễ; không phát hứa hẹn 4K vượt phần cứng.
- Tiêu chí nghiệm thu: không tăng đáng kể RAM hoặc tải CPU khi chỉ duyệt danh sách kênh; tỷ lệ xem thử không làm giảm độ ổn định phát chính.

## Ma trận xác minh trước mỗi phát hành
1. CI: tất cả `node --test tizenbrew/tests/*.test.cjs` phải đạt, OTA/bootstrap smoke phải đạt, WGT Browser và WGT Samsung AVPlay phải đóng gói thành công.
2. TV thật: thử ít nhất một model cũ và một model mới nếu có; phân biệt WGT native với TizenBrew hosted module vì API khác nhau.
3. Tình huống: HLS/DASH/TS/MP4, URL có token, kênh dùng backup, rút mạng ngắn, nguồn trả 403/404, stream đứng hình khi vẫn giữ kết nối, A→B→A và remote spam.
4. Hiệu năng: ghi thời gian từ bấm kênh tới khung hình đầu tiên, tỷ lệ phát thành công, số lần reset sai, bộ nhớ sau 30 phút. Không tuyên bố nhanh hơn trước khi có số đo đối chứng.
5. Phát hành: commit mới trên `tizenbrew`, không force push, không tạo hoặc thay đổi tag cũ; liên kết đúng workflow và ghi rõ hạn chế chưa test TV thật.

Tham khảo chính thức:
- https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html
- https://developer.samsung.com/smarttv/develop/guides/multimedia/adaptive-streaming.html
- https://developer.samsung.com/smarttv/develop/extension-libraries/smart-view-sdk/receiver-apps.html
