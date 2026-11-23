## P5.1.286 — So sánh trọng số AI hiện tại với bản sao trước khôi phục / Electron 4.23.371
- Feature priority: NEW — Hiển thị chênh lệch mẫu học Logistic ML, Naive Bayes và lượt khám phá UCB trong bảng so sánh ngay trước khi xác nhận, cảnh báo khi bản sao ít dữ liệu học hơn và nêu rõ không đánh đồng số mẫu với độ chính xác.
- Feature class: AI
- User action: TV → WatchFlow → AI hợp gu → Quản lý mô hình → Khôi phục mô hình AI → chọn JSON để xem ba hàng hiện tại/trong tệp, cảnh báo mất mẫu trước khi xác nhận.
- Electron screenshot: positron-p51286-ai-compare-before-1920x1080-real.png / positron-p51286-ai-compare-preview-1920x1080-real.png / positron-p51286-ai-compare-after-1920x1080-real.png.
- Evidence: Unit test đo ba mức chênh lệch khi ít/nhiều mẫu, bảo toàn mô hình trước xác nhận; Electron dùng bản sao ít mẫu để kiểm tra cảnh báo, đổi sang bản sao nhiều mẫu, mới xác nhận ghi ML, chứng minh danh sách kênh và playback bất biến.
- Status: CANDIDATE — Chỉ có bằng chứng sau khi CI và ảnh Electron thật đã mở kiểm tra, không tạo bản thử nghiệm trên GitHub Releases Stable.

## P5.1.285 — Khôi phục mô hình AI từ JSON có xác nhận / Electron 4.23.370
- Feature priority: NEW — Bổ sung chọn file sao lưu JSON cục bộ, từ chối tệp sai định dạng, giả mạo, vượt 500KB hoặc tổng số mẫu không khớp. Hiển thị xem trước Logistic, Naive Bayes, UCB và bắt buộc nhấn nút xác nhận trước khi thay thế trọng số.
- Chỉ đọc tệp trong Electron, không tải lên Internet. Bảo toàn quyền bật AI, thông báo, dữ liệu M3U/kênh, EPG, Favorites và trình phát; nếu ghi localStorage thất bại, khôi phục các giá trị cũ trong bộ nhớ.
- Feature class: AI
- User action: TV → WatchFlow → AI hợp gu → Quản lý mô hình → Khôi phục mô hình AI (.json) → chọn tệp → xem trước số mẫu → Xác nhận khôi phục trọng số AI.
- QA yêu cầu: kiểm thử Node JSON hợp lệ/không hợp lệ/giới hạn kích thước, Electron nhập tệp sai rồi tệp hợp lệ, xác minh không thay đổi dữ liệu trước khi xác nhận, ảnh trước/sau thật, kiểm tra trạng thái lưu.
- Electron screenshot: positron-p51285-ai-restore-before-1920x1080-real.png / positron-p51285-ai-restore-after-1920x1080-real.png.
- Evidence: Electron kiểm chứng từ chối JSON sai, preview không ghi dữ liệu, xác nhận khôi phục tăng số nhãn, quyền học và danh sách kênh giữ nguyên, có ảnh trước/sau thật.
- Status: CANDIDATE đến khi CI + ảnh sau được mở soát, không tạo release thử nghiệm trên trang Stable.

## P5.1.284 — Sao lưu trọng số ba mô hình AI / Electron 4.23.369
- Feature priority: NEW — Chủ động tải JSON trọng số Logistic, Naive Bayes và UCB cùng bộ đếm mẫu, chỉ dữ liệu học trên máy; không gồm playlist, URL, ID kênh hoặc lịch sử xem.
- Feature class: AI
- Evidence: Node regression xác nhận JSON không lộ dữ liệu kênh; QA Electron 1920×1080 nhấn Sao lưu mô hình AI, xác minh filename/blob, ảnh trước/sau và không thay đổi playlist, mô hình, playback. Chỉ đánh dấu đạt khi Actions xanh và đã trực tiếp mở ảnh thật.
- User action: TV → WatchFlow → AI hợp gu → Quản lý mô hình → Sao lưu mô hình AI (.json).
- Privacy: Tệp chỉ sinh khi người dùng bấm, không upload mạng. Trọng số học/từ khóa có thể là dữ liệu riêng tư nên cần bảo quản file.
- Electron screenshot: positron-p51284-ai-backup-before-1920x1080-real.png / positron-p51284-ai-backup-after-1920x1080-real.png.
- Trạng thái: CANDIDATE — chỉ Actions, GitHub Releases dành riêng Stable.

## P5.1.283 — AI kiểm tra độ cân bằng nhãn huấn luyện / Electron 4.23.368
- Feature priority: NEW — Đánh giá số chủ đề đã có nhãn thật, tổng số mẫu, tỷ lệ tập trung chủ đề lớn nhất và nhóm chủ đề chưa được học; đưa lời khuyên chống lệch mẫu mà không tự phân loại kênh hay hứa hẹn độ chính xác.
- Feature class: AI
- Evidence: Node regression cho mô hình trống, một chủ đề, cân bằng và lệch 80%; Electron 1920×1080 mở bảng độ phủ, đọc tiến độ thật, khẳng định không đổi localStorage, không đổi M3U và không tự phát. Chỉ đánh dấu đạt khi đã mở ảnh PNG và CI xanh.
- User action: TV → WatchFlow → AI hợp gu → Thư mục EPG → Dạy AI nhanh → AI dựa vào đâu để gợi ý? → Độ phủ dữ liệu AI.
- Privacy: Dữ liệu đánh giá chỉ lấy từ số lượng nhãn cục bộ do người dùng xác nhận, không gửi lịch sử xem, kênh, URL hay trọng số ra mạng; thanh mức phủ không phải độ chính xác của mô hình.
- Electron screenshot: positron-p51283-ai-training-health-before-1920x1080-real.png / positron-p51283-ai-training-health-after-1920x1080-real.png.
- Trạng thái: CANDIDATE — chỉ GitHub Actions; trang Releases dành cho Stable.

## P5.1.282 — AI giải thích bằng chứng Naive Bayes / Electron 4.23.367
- Feature priority: NEW — Cho phép xem mô hình Naive Bayes đã học bao nhiêu nhãn/chủ đề, có từ khóa nào trùng tên kênh và có dự đoán đáng tin cậy hay chưa; không hiển thị đoán mò khi thiếu nhãn hoặc từ khóa, không tự thay đổi kết quả phân loại.
- Feature class: AI
- Evidence: Pure regression xác minh giải thích dựa trên từ khóa đã học, từ chối đoán khi không có chứng cứ và playlist bất biến; kiểm thử Electron 1920×1080 mở bảng giải thích thật, xác minh mô hình/lưu trữ/stream không đổi, giao diện không tràn và ảnh before/after. Chỉ chứng nhận sau khi Actions xanh và trực tiếp mở PNG.
- User action: TV → WatchFlow → AI hợp gu → Thư mục EPG → Dạy AI nhanh → "AI dựa vào đâu để gợi ý?" để xem bằng chứng cục bộ trước khi quyết định nhãn.
- Privacy: Chỉ đọc bộ đếm và từ khóa do người dùng đã huấn luyện trên máy, không yêu cầu mạng, không đưa URL hoặc lịch sử xem vào phần giải thích; trạng thái gập/mở không ghi nhãn.
- Electron screenshot: positron-p51282-ai-explanation-before-1920x1080-real.png / positron-p51282-ai-explanation-after-1920x1080-real.png.
- Trạng thái: CANDIDATE — Actions-only, Releases Stable-only.

## P5.1.281 — Hoàn tác chính xác nhãn AI gần nhất / Electron 4.23.366
- Feature priority: NEW — Khôi phục chính xác trọng số Naive Bayes và ID của các kênh đã gán nhãn trước khi dạy sai, không xóa nhãn cũ.
- Feature class: AI
- Evidence: Node regression và Electron CDP 1920×1080 chụp trước/sau/khôi phục; kiểm tra mô hình localStorage, số nhãn, playlist, kênh bỏ qua, không autoplay. Chỉ xác nhận đạt sau Actions và mở PNG.
- User action: TV → WatchFlow → AI hợp gu → Thư mục EPG → Dạy AI nhanh → Ghi nhãn & tiếp → Hoàn tác nhãn AI vừa dạy.
- Privacy: Snapshot một bước chỉ tồn tại trong RAM, không thay playlist/EPG, không gửi dữ liệu lên mạng.
- Electron screenshot: positron-p51281-undo-ai-before-1920x1080-real.png / positron-p51281-undo-ai-after-1920x1080-real.png / positron-p51281-undo-ai-restored-1920x1080-real.png.
- Trạng thái: CANDIDATE — chỉ lưu GitHub Actions; Releases Stable-only.

## P5.1.280 — Hàng đợi AI dạy chủ đề không lặp / Electron 4.23.365
- Feature priority: NEW — Dạy AI nhanh chuyển qua hơn năm kênh chưa phân loại sau mỗi lần Bỏ qua; giữ danh sách bỏ qua chỉ trong phiên, tránh xuất hiện lại kênh cũ, cho phép Xem lại toàn bộ kênh đã bỏ qua. Xếp hạng vẫn dựa trên độ chưa chắc chắn của Naive Bayes và quyền người dùng tự gán nhãn.
- Feature class: AI
- Evidence: Regression kiểm tra tám ứng viên liên tiếp không lặp và playlist bất biến; kiểm thử Electron 1920x1080 chụp trước/sau sáu lần Bỏ qua, xác thực nhãn/mô hình lưu không đổi, không autoplay, nút khôi phục xuất hiện. Chỉ công nhận sau khi Actions và ảnh thực đã được mở xem.
- User action: TV → WatchFlow → AI hợp gu → Thư mục EPG → Chưa có chủ đề EPG → Dạy AI nhanh → Bỏ qua nhiều lần; Xem lại kênh đã bỏ qua để khôi phục hàng đợi.
- Privacy: Bỏ qua lưu trong RAM và mất khi thoát ứng dụng; không lưu hồ sơ, không gửi tên kênh/URL/hành vi lên web, không thay playlist hoặc auto phát.
- Electron screenshot: positron-p51280-active-queue-before-1920x1080-real.png / positron-p51280-active-queue-after-1920x1080-real.png.
- Trạng thái: CANDIDATE — Actions-only, GitHub Releases chỉ giữ Stable.

## P5.1.279 — Giữ thư mục con mở khi AI tự render / Electron 4.23.364
- Lỗi đã sửa: trạng thái chi tiết danh sách chưa phân loại được khôi phục khi giao diện render lại, không quét lại EPG, không phát kênh hoặc sửa playlist.
- Evidence: GitHub Actions 45101613049 test/capture/build thành công; ảnh Electron thật trước/sau đã mở xem trong đợt tiếp nối 23/11/2026.
- Trạng thái: Actions-only; GitHub Releases Stable-only.

# Positron P5 Changelog

## P5.1.278 — Hướng dẫn dạy AI từng kênh / Electron 4.23.363
- Feature priority: NEW — Hướng dẫn dạy AI theo từng kênh chưa phân loại: hiển thị một đề xuất có độ chắc chắn thấp nhất, cho phép Ghi nhãn & tiếp hoặc Bỏ qua an toàn; chuyển danh sách đầy đủ kênh chưa phân loại vào mục mở rộng riêng để không có hai thanh cuộn chen nhau.
- Feature class: AI
- Evidence: Node test xác thực một hàng dạy, nút bỏ qua không ghi trọng số; QA Electron thật 1920x1080 chụp trước/sau và kiểm tra bỏ qua đổi kênh gợi ý mà không lưu nhãn, không tự phát, không đổi playlist, không tràn; tất cả phải xác minh từ CI.
- User action: TV → WatchFlow → ✦ AI hợp gu → Thư mục EPG → Chưa có chủ đề EPG → Dạy AI nhanh → chọn nhãn/Ghi nhãn & tiếp hoặc Bỏ qua; mở danh sách đầy đủ nếu cần.
- Privacy: Không gửi dữ liệu ra web, không gán nhãn khi Bỏ qua, giữ nguyên kênh/EPG/Favorites và không tự phát.
- Electron screenshot: positron-p51278-guided-ai-before-1920x1080-real.png / positron-p51278-guided-ai-after-1920x1080-real.png.
- Trạng thái: CANDIDATE, Actions-only; GitHub Releases Stable-only.

## P5.1.277 — AI học chủ động từ kênh chưa phân loại / Electron 4.23.362
- Feature priority: NEW — Học chủ động từ các kênh chưa có chủ đề EPG: xếp hạng độ không chắc chắn của Naive Bayes, hiển thị năm kênh ưu tiên, cho người dùng gán nhãn trực tiếp, không phỏng đoán khi thiếu nhãn hay tự phát video.
- Feature class: AI
- Evidence: Node unit kiểm tra xếp hạng bất định, giới hạn, loại kênh đã dạy và không sửa nguồn; Electron 1920×1080 thao tác trong thư mục Chưa có chủ đề EPG, chọn chủ đề, ghi nhãn, thấy bộ đếm tăng và bản ghi cục bộ, giữ nguyên playlist. Ảnh trước/sau và QA phải được xác minh từ CI.
- User action: TV → WatchFlow → AI hợp gu → Thư mục EPG → mở Chưa có chủ đề EPG → Dạy AI nhanh → chọn chủ đề và Ghi nhãn; trình tự học theo các trường hợp không chắc chắn nhất.
- Privacy: Không có tìm kiếm web nền, không gọi backend, không thay playlist, không tự phát; chỉ lưu nhãn và danh tính kênh tối đa 1000 trong máy, có thể xóa cùng mô hình phân loại.
- Electron screenshot: positron-p51277-active-teach-before-1920x1080-real.png / positron-p51277-active-teach-after-1920x1080-real.png.
- Trạng thái: CANDIDATE / Actions-only, GitHub Releases chỉ giữ Stable.

## P5.1.276 — Quản lý mô hình học AI và xóa riêng / Electron 4.23.361
- Feature priority: NEW — Bảng quản lý giúp kiểm tra ba mô hình học thực Logistic, Naive Bayes, UCB cùng dữ liệu/dung lượng từng mô hình và xóa riêng, không đụng đến playlist, guide hoặc mô hình học còn lại.
- Feature class: AI
- Evidence: Kiểm thử Node xác nhận giao diện có mô hình thật và xóa hai bước không phụ thuộc hộp thoại native; QA Electron 1920×1080 cần chụp ảnh trước/sau, kiểm tra phản hồi Hợp gu làm tăng số quan sát, xóa lần thứ hai đưa về 0 và giữ nguyên bố cục. Chỉ coi đạt sau khi CI và ảnh được kiểm chứng.
- User action: TV → WatchFlow → ✦ AI hợp gu → Mô hình AI trên máy → xem Tiêu chuẩn/Smart và trọng số riêng; nhấn Xóa mô hình → Xác nhận xóa. Các thuật toán này tích hợp sẵn, không cần tải.
- Privacy: Chỉ thay đổi trọng số học trên máy sau thao tác; không tự gửi URL M3U, nội dung EPG hoặc hành vi lên mạng; playlist, EPG và Favorites giữ nguyên.
- Electron screenshot: positron-p51276-model-manager-before-1920x1080-real.png / positron-p51276-model-manager-after-1920x1080-real.png.
- Trạng thái: CANDIDATE, Actions-only; GitHub Releases Stable-only.



## P5.1.275 — Chỉ mục EPG tái sử dụng và chủ động quét lại / Electron 4.23.360
- Feature priority: NEW — Lập chỉ mục kênh/chương trình theo XMLTV rồi dùng lại khi thay đổi giao diện, mở thư mục hoặc cập nhật chỉ báo số kênh, thay vì quét toàn bộ 561 kênh mỗi lần hiển thị. Người dùng có nút **Quét lại EPG** trong Thư mục EPG và Chương trình EPG; thay đổi nguồn, EPG có nhận diện mới hoặc qua mốc thời gian tự làm mới kết quả. Giữ nguyên trạng thái mở/đóng các thư mục khi giao diện được cập nhật.
- Feature class: BREAKTHROUGH
- Evidence: Kiểm thử Node và Electron thực kiểm tra hai lần render liên tiếp không tăng số lượt phân tích chương trình, thư mục đã đóng không tự bật lại, nhấn Quét lại EPG tăng chỉ số quét đúng một lần, trạng thái thông báo quét lại xuất hiện và focus trở về nút quét. Chụp trước/sau 1920x1080, đo không tràn ngang và không tác động phát kênh hoặc playlist. Cache chỉ lưu nhóm/tên/giờ XMLTV trong RAM, tự hết hạn khi dữ liệu thay đổi hoặc sang khung giờ tiếp theo.
- User action: TV → WatchFlow → ✦ AI hợp gu → Thư mục EPG hoặc Chương trình EPG → Quét lại EPG. Phần mở/đóng thư mục được giữ nguyên khi ứng dụng làm mới kết quả.
- Privacy: Không tự tải nguồn từ Internet, không lưu URL M3U hoặc lịch sử xem trong cache mới; tự động nhận diện thay đổi nguồn và EPG cục bộ, chỉ mục mất khi thoát ứng dụng.
- Electron screenshot: positron-p51275-index-before-1920x1080-real.png / positron-p51275-index-after-1920x1080-real.png.
- Trạng thái: CANDIDATE; chỉ lưu bản thử nghiệm ở nhánh và Actions, GitHub Releases Stable-only.

## P5.1.274 — Tìm chương trình EPG xuyên chủ đề không dấu / Electron 4.23.359
- Feature priority: NEW — Thêm khám phá chương trình XMLTV theo từ khóa trên toàn bộ các chủ đề, tên chương trình và kênh, hỗ trợ dấu/không dấu; chương trình đa nhãn chỉ liệt kê một lần trong kết quả. Tìm trực tiếp trong tập lịch 24 giờ đã nạp, không tự quét hay phát video.
- Feature class: BREAKTHROUGH
- Evidence: Kiểm thử lõi với bản tin thời sự kết hợp bóng đá và khoa học giáo dục chứng minh tìm không dấu, tìm đa từ, khử trùng cùng chương trình đa chủ đề và không thay đổi dữ liệu kênh. Kiểm thử Electron thật chụp trước/sau 1920x1080 khi nhập BONG DA, kiểm tra một kết quả, focus giữ trên ô nhập, không tự phát, không tràn ngang; xóa từ khóa khôi phục các thư mục EPG. Chỉ công nhận đạt khi CI và ảnh đã xác minh.
- User action: TV → WatchFlow → ✦ AI hợp gu → Chương trình EPG → nhập từ khóa; mở kết quả và bấm Xem kênh. Xóa từ khóa để quay về danh mục chương trình.
- Privacy: Tìm tại thiết bị trên XMLTV đã nhập, không gửi M3U, stream URL, tên kênh, lịch sử hoặc từ khóa lên Internet. Đây là chức năng tìm kiếm văn bản, không gọi là ML.
- Electron screenshot: positron-p51274-programme-search-before-1920x1080-real.png / positron-p51274-programme-search-after-1920x1080-real.png.
- Trạng thái: CANDIDATE; chỉ lưu bản thử nghiệm ở nhánh và Actions, Releases dành cho Stable.

## P5.1.273 — Thư mục chương trình EPG 24h đa chủ đề / Electron 4.23.358
- Feature priority: NEW — Thêm màn hình **Chương trình EPG** cho phép khám phá lịch phát thật theo chủ đề, không chỉ gom kênh. Một chương trình thời sự kết hợp bóng đá có thể xuất hiện đồng thời trong Tin tức và Thể thao, xem tên/giờ/kênh và chủ động chọn xem kênh; chỉ dùng XMLTV đã tải.
- Feature class: BREAKTHROUGH
- Evidence: Regression với 3 kênh và XMLTV có chương trình thời sự + bóng đá, khoa học + giáo dục, chương trình không khớp chủ đề và chương trình hết hạn: đầu vào đa nhãn phải nằm trong đúng thư mục, loại trùng/timestamp sai, playlist bất biến. Electron thật chuyển từ Thư mục EPG sang Chương trình EPG, kiểm tra tám chủ đề và lịch hẹn, trước/sau PNG gốc 1920x1080, không autoplay, không tràn.
- User action: TV → WatchFlow → ✦ AI hợp gu → Chương trình EPG. Mở thư mục chương trình theo chủ đề để xem lịch 24 giờ tới từ XMLTV và bấm ▶ Xem kênh khi muốn phát; nếu không có EPG thì hiển thị thông báo rõ ràng.
- Privacy: Không tự tải web/stream, không gửi tên kênh, M3U, lịch xem hay nhãn lên Internet; phân loại chương trình bằng quy tắc nhận dạng văn bản, không mạo nhận ML, không sửa playlist.
- Electron screenshot: positron-p51273-epg-programmes-before-1920x1080-real.png / positron-p51273-epg-programmes-after-1920x1080-real.png.
- Trạng thái: CANDIDATE tới khi đủ Node regression, QA PNG thật đã mở soát, 6/6 CI, Release cùng bộ cài được xác minh.

## P5.1.272 — Thư mục EPG đa nhãn tự động / Electron 4.23.357
- Feature priority: NEW — Thêm thư viện chủ đề EPG ảo tự phân loại toàn bộ danh sách kênh trên thiết bị từ các chương trình XMLTV hiện có; một kênh có thể xuất hiện đồng thời trong Thể thao, Tin tức, Phim, Thiếu nhi hoặc các thư mục khác mà không làm thay đổi M3U gốc.
- Feature class: BREAKTHROUGH
- Evidence: Node regression mô phỏng kênh thời sự và bóng đá phải nằm đồng thời hai nhóm, kênh phim hoạt hình nằm Phim và Thiếu nhi; kênh không có XMLTV phải vào Chưa có chủ đề. CI mở chế độ trên Electron 1920x1080 với fixture EPG nội bộ, đo số thư mục, kiểm tra không tự phát, không đổi ID nguồn và hai PNG before/after thật.
- User action: TV → WatchFlow → ✦ AI hợp gu → Thư mục EPG. Nhấn vào tên thư mục để mở danh sách kênh cùng chủ đề, chọn kênh để phát. Danh sách được tạo từ EPG đã nạp và tự làm mới khi mở lại, kênh thiếu chủ đề vẫn xem được trong Chưa có chủ đề EPG.
- Privacy: Duyệt dữ liệu XMLTV đã tải trong máy; không quét Internet, không gửi danh sách/URL/hành vi, không tự phát hoặc sửa nguồn. Tính năng nhóm EPG dựa trên luật chủ đề, không nhận là ML; mô hình học Naive Bayes P271 vẫn tách biệt và chỉ học khi người dùng bật quyền.
- Electron screenshot: positron-p51272-epg-folders-before-1920x1080-real.png / positron-p51272-epg-folders-after-1920x1080-real.png.
- Trạng thái: CANDIDATE cho tới khi xem ảnh thật, test, Actions và Release bất biến thành công.

## P5.1.271 — AI tự học phân loại chủ đề / Electron 4.23.356
- Feature priority: NEW — Bổ sung **Dạy AI phân loại** trên từng kênh khi có quyền học, sử dụng mô hình Multinomial Naive Bayes huấn luyện online từ các nhãn chủ đề do người dùng tự xác nhận. Sau khi có ít nhất hai nhóm đủ ví dụ, AI có thể gợi ý chủ đề cho kênh tương tự chưa khớp quy tắc tên hoặc EPG; kết quả phải vượt ngưỡng tin cậy, và EPG thực luôn được ưu tiên.
- Feature class: AI
- Evidence: Train hai ví dụ giáo dục “Atlas Academy” và một ví dụ thời sự, dự đoán chính xác một kênh “Atlas Academy” khác chưa gán nhãn; kiểm tra xác suất, không bịa khi ít dữ liệu; Electron thực 1920×1080 hiển thị select thể loại, người dùng chọn và bộ đếm nhãn tăng mà không autoplay hay đổi nguồn.
- User action: TV → WatchFlow → ✦ AI hợp gu → bật học sở thích → chọn thể loại ở “Dạy AI phân loại” trên kênh. Mô hình tại máy cập nhật tần suất token và có thể nhận diện tên/nhóm kênh tương tự. Bấm “Xóa dữ liệu học” để xóa cả mô hình học nhãn.
- Privacy: Chỉ lưu bảng đếm từ khóa và nhóm chủ đề trên máy, không tải tên, URL hoặc lịch sử kênh lên máy chủ, không ghi riêng tên đầy đủ và không suy đoán EPG khi không có. Wikipedia vẫn chỉ gọi khi người dùng tự nhấn.
- Electron screenshot: positron-p51271-ai-teach-before-1920x1080-real.png / positron-p51271-ai-teach-after-1920x1080-real.png; mở ảnh thật trước khi xác nhận.
- Trạng thái: CANDIDATE tới khi test, ảnh thực và toàn bộ CI/release thành công.

## P5.1.270 — AI khám phá theo contextual bandit / Electron 4.23.355
- Feature priority: NEW — Chế độ **Khám phá AI** tính điểm UCB cho chủ đề ít được đánh giá kết hợp xác suất logistic đã học thực tế, chọn ra danh sách đa dạng, tránh lặp quá nhiều kênh cùng chủ đề và giảm dần mức khám phá khi chủ đề được phản hồi.
- Feature class: AI
- Evidence: Kiểm thử 25 lần thích thể thao, 18 lần không thích thời sự, chủ đề thiếu nhi chưa từng đánh giá; phần thưởng UCB của thiếu nhi phải cao hơn thể thao; giữ playlist, không tự phát. Screenshot Electron 1920×1080 trước/sau chuyển sang nút Khám phá AI và kiểm tra consent/geometry.
- User action: TV → WatchFlow → ✦ AI hợp gu → bật học sở thích → Khám phá AI. Nhấn Hợp gu/Không hợp để cập nhật mô hình logistic và thống kê chủ đề trên máy; nút tự khóa nếu chưa đồng ý học và Xóa dữ liệu học xóa cả bộ đếm.
- Privacy: Chỉ lưu số lần đánh giá theo loại nội dung, không lưu danh tính kênh/URL/M3U, không tải dữ liệu riêng lên Internet, không tự chuyển hay phát kênh.
- Electron screenshot: positron-p51270-ai-bandit-before-1920x1080-real.png / positron-p51270-ai-bandit-after-1920x1080-real.png cần mở kiểm tra bằng mắt.
- Trạng thái: CANDIDATE tới khi test, ảnh thực, 6 CI jobs và Release được xác minh.

## P5.1.269 — AI lập lịch xem 24 giờ tránh trùng giờ / Electron 4.23.354
- Feature priority: NEW — WatchFlow Intelligence có chế độ **Lịch AI 24h** tối ưu lịch xem không trùng giờ. Thuật toán weighted interval scheduling chọn tối đa 8 chương trình từ XMLTV thật theo trọng số logistic học từ sở thích; chương trình chồng thời gian cạnh tranh cùng một vị trí, không bịa lịch khi thiếu EPG.
- Feature class: AI
- Evidence: Node tests kiểm thử 3 chương trình xung đột (2 chương trình thể thao liên tiếp và 1 thời sự chồng giờ), 20 phản hồi thể thao tích cực / 20 phản hồi thời sự tiêu cực; thuật toán phải chọn hai chương trình thể thao không trùng. Electron CDP phải chụp hai ảnh 1920x1080 trong app thật khi đổi từ Lịch EPG hợp gu sang Lịch AI 24h; assert không phát kênh, không đổi playlist, có mode button tương tác và viewport không tràn.
- User action: TV → WatchFlow → ✦ AI hợp gu → Lịch AI 24h. Xem các chương trình được đề xuất theo giờ và kênh, nhấn ▶ Xem kênh khi muốn phát; phản hồi Hợp gu/Không hợp sẽ huấn luyện mô hình theo chính chủ đề và thời điểm của chương trình đã chọn.
- Privacy: Chỉ dữ liệu XMLTV đã nạp và trọng số học cục bộ theo opt-in, không gửi hành vi/M3U/stream URL ra Internet; không phát tự động, không tạo lịch giả khi không có guide. Chế độ lịch xem không thêm nhắc hay sửa playlist.
- Electron screenshot: positron-p51269-ai-plan-before-1920x1080-real.png / positron-p51269-ai-plan-after-1920x1080-real.png, từ Electron thật và cần mở soát bằng mắt.
- Trạng thái: CANDIDATE tới khi unit/UI, ảnh thật 1920x1080, Windows EXE, Mac DMG, Actions và Release xác minh thành công.

## P5.1.268 — AI nhắc chương trình hợp gu đúng lúc / Electron 4.23.353
- Feature priority: NEW — Bổ sung công cụ **Nhắc trong ứng dụng** cho WatchFlow Intelligence. Khi người xem chủ động bật học và bật nhắc, ứng dụng định kỳ kiểm tra XMLTV đã tải, lấy chương trình gần giờ chiếu và dùng **mô hình logistic đã học từ hành vi/đánh giá** để thông báo chương trình có xác suất hợp gu đạt ngưỡng. Chỉ hiển thị lời nhắc cục bộ, không tự phát kênh, không gửi hành vi lên mạng, không mở thông báo OS khi chưa xin quyền.
- Feature class: AI
- Evidence: Unit test bắt buộc có ít nhất 3 quan sát học, xác suất đạt ngưỡng và chương trình XMLTV trong khoảng giờ sắp chiếu; loại lịch quá xa, đã kết thúc, sai timestamp; thử 20 phản hồi tích cực thể thao và 20 phản hồi tiêu cực tin tức để đổi mô hình. Test UI xác minh quyền bật học + quyền nhắc riêng. Electron screenshot phải trực tiếp nhìn thấy tiêu đề AI và checkbox nhắc trong viewport, trong khi Mix cũ ẩn hẳn, không chỉ DOM hidden=false; kiểm tra khi đóng/mở WatchFlow vẫn đúng, không autoplay/playlist mutation.
- User action: TV → WatchFlow → ✦ AI hợp gu → bật học sở thích → tích **Nhắc trong ứng dụng khi AI tìm thấy chương trình hợp gu sắp phát**. Ứng dụng còn mở sẽ hiển thị lời nhắc 1 lần khi có lịch phù hợp (ngưỡng dự đoán ≥62%) sắp bắt đầu; không tự xem. Tắt học tự tắt nhắc; xóa mô hình xóa lựa chọn nhắc.
- Sửa lỗi chặn: ảnh Electron P5.1.267 cho thấy Mix che khuất nội dung AI sau khi mở lại. P5.1.268 dùng trạng thái exclusive CSS và đồng bộ khi mở để AI có thể thực sự nhìn thấy; QA chặn nếu AI nằm ngoài khung nhìn.
- Privacy: chỉ XMLTV từ nguồn đã nạp, trọng số local-first, mặc định tắt học và nhắc; không theo dõi khi không đồng ý. Tra cứu Wikipedia tiếp tục chỉ theo nút chủ động riêng.
- Electron screenshot: positron-p51268-ai-alerts-before-1920x1080-real.png / positron-p51268-ai-alerts-after-1920x1080-real.png, lấy từ Electron CDP và cần được mở xem bằng mắt.
- Trạng thái: CANDIDATE cho tới khi Node tests, ảnh native 1920×1080, Windows EXE, macOS DMG, Actions và Release bất biến đạt.


## P5.1.267 — AI lịch EPG hợp gu từ chương trình sắp chiếu / Electron 4.23.352
- Feature priority: NEW — Một chế độ mới **Lịch EPG hợp gu** trong WatchFlow Intelligence: dùng EPG XMLTV hiện có để tìm chương trình sẽ bắt đầu trong 8 giờ tới, không bịa giờ hoặc tiêu đề; xếp chương trình theo mức độ phù hợp nhờ trọng số logistic học từ phản hồi và thời lượng xem, cá nhân hóa theo giờ phát và loại nội dung. Phân loại chủ đề từ tên/mô tả EPG dùng luật rõ ràng (không quảng cáo là LLM), còn xếp hạng bằng mô hình học thực.
- Feature class: AI
- Evidence: Node tests xây fixture XMLTV với chương trình thể thao và thời sự, 12 phản hồi tích cực thể thao + 9 tiêu cực tin tức phải làm thứ tự xếp hạng thay đổi. Test bảo toàn playlist, lọc giờ quá khứ/quá xa/không hợp lệ và khử trùng. Electron CDP kiểm tra chuyển chế độ trong WatchFlow và chụp before/after 1920×1080, không autoplay.
- User action: TV → WatchFlow → ✦ AI → Lịch EPG hợp gu. Xem giờ phát và tên chương trình từ XMLTV, nhấn Xem kênh khi muốn phát; quay lại Kênh hợp gu để xem đề xuất kênh. Tra cứu Wikipedia vẫn chỉ thực hiện theo nút của từng kênh.
- Privacy: Local-first, mặc định không học, có quyền bật/tắt/xóa; không tải EPG mạng tùy tiện, không gửi M3U, stream URL, trọng số hoặc lịch sử xem lên Wikipedia.
- Electron screenshot: positron-p51267-ai-epg-before-1920x1080-real.png / positron-p51267-ai-epg-after-1920x1080-real.png; chỉ tính hoàn thành sau khi CI, ảnh soát bằng mắt, EXE/DMG và Release được xác minh.
- Trạng thái: CANDIDATE cho tới khi tất cả bằng chứng đạt.


## P5.1.266 — WatchFlow Intelligence: học máy sở thích, phân loại EPG và tìm chủ đề trên Wikipedia / Electron 4.23.351
- Feature priority: NEW — WatchFlow Intelligence với thuật toán học máy hồi quy logistic cập nhật trọng số dựa trên thời lượng xem ≥35 giây có hình hoặc đánh giá Hợp gu/Không hợp; phân loại theo chương trình XMLTV đang/sắp chiếu; tra cứu Wikipedia theo tên kênh và chỉ khi bấm nút, không gửi playlist, URL hoặc lịch sử xem lên mạng.
- Feature class: AI
- Evidence: Bộ kiểm thử EPG gán tin tức/thể thao bằng XMLTV thật với thời gian phát, loại chương trình lỗi/quá hạn, 10 phản hồi tích cực thể thao và 6 phản hồi tiêu cực tin tức phải làm thay đổi trọng số thực và thứ hạng; kiểm thử Wikipedia chỉ gắn bài khớp tên, không tự gửi dữ liệu; Electron QA kiểm tra mở bảng AI, giữ playlist và không tự phát. QA ảnh 1920×1080 cần xác minh tại Actions.
- User action: TV → WatchFlow → ✦ AI hợp gu; bật cho phép học trên thiết bị, xem kênh có hình ít nhất 35 giây hoặc bấm Hợp gu/Không hợp; dùng Tra cứu web riêng từng kênh khi cần biết chủ đề; bấm Xóa dữ liệu học để xóa trọng số.
- Electron screenshot: positron-p51266-intelligence-after-1920x1080-real.png
- Electron before/after: positron-p51266-intelligence-before-1920x1080-real.png / positron-p51266-intelligence-after-1920x1080-real.png. Ảnh chỉ có giá trị khi do Electron CI tạo thật và lưu đúng phiên bản.
- Trạng thái CANDIDATE cho tới khi Node tests, Electron screenshot, build Windows x64, bản phát hành bất biến được kiểm chứng. Wikipedia cần có mạng và có thể không có bài trùng khớp.

## P5.1.265 — Đi tới nguồn bằng Enter/Space / Electron 4.23.350
- Feature priority: NEW — Người dùng bàn phím có thể focus một hàng trong Chi tiết nguồn rồi bấm Enter hoặc Space để mở thẻ nguồn tương ứng; giữ nguyên điều khiển nút Đi tới và không can thiệp vào phát kênh.
- Electron screenshot: positron-p51265-source-enter-after-1920x1080-real.png
- User action: Nguồn IPTV → Chi tiết nguồn → dùng ↑/↓ chọn nguồn rồi Enter/Space; thẻ gốc được focus/viền xanh, có nút trở về chi tiết.
- Electron QA: ảnh trước/sau 1920×1080 và 720px; xác minh cả hai phím, không autoplay, playlist/source bất biến, không tràn ngang.
- Trạng thái CANDIDATE cho tới khi Actions 6/6, ảnh Electron được xem và Release bất biến.


## P5.1.264 — Đặt lại bộ lọc chi tiết nguồn / Electron 4.23.349
- Feature priority: NEW — Một nút “Đặt lại” khôi phục đồng thời tìm kiếm, bộ lọc Bật/Tắt và thứ tự nguồn ban đầu. Nút chỉ khả dụng khi điều kiện tìm/lọc/sắp xếp đang khác mặc định; không sửa nguồn, playlist, Favorites hay video phát.
- Electron screenshot: positron-p51264-source-reset-after-1920x1080-real.png
- User action: Nguồn IPTV → Chi tiết nguồn → tìm CATEGORY, chọn Đang bật và Ít kênh trước → nhấn Đặt lại để xem lại 2/2 nguồn; focus trở về ô tìm kiếm.
- Electron QA: chụp trước/sau 1920×1080 cùng ảnh 720px; so dữ liệu nguồn/kênh bất biến, không autoplay, không tràn ngang.
- Trạng thái CANDIDATE: cần xác minh Actions 6/6, mở xem ảnh Electron và release bất biến.


## P5.1.263 — Điều hướng danh sách nguồn bằng phím mũi tên / Electron 4.23.348
- Feature priority: NEW — Duyệt các hàng trong Chi tiết nguồn bằng mũi tên Lên/Xuống, tự chuyển focus rõ ràng và quay vòng khi tới đầu/cuối; chặn phím khỏi shortcut TV bên ngoài, không thay đổi playlist hoặc phát kênh.
- Electron screenshot: positron-p51263-source-keyboard-after-1920x1080-real.png
- User action: Mở Nguồn IPTV → Chi tiết nguồn, dùng Tab tới hàng nguồn đầu và bấm ↓/↑ để đổi hàng đang chọn; viền xanh cho biết focus, danh sách vẫn giữ thứ tự lọc/sắp xếp.
- Electron QA: `positron-p51263-source-keyboard-before-1920x1080-real.png` / `positron-p51263-source-keyboard-after-1920x1080-real.png` / `positron-p51263-source-keyboard-720-real.png`; kiểm tra focus, wrap, tab stop, không autoplay, không tràn ngang và dữ liệu bất biến.

## P5.1.262 — Trở lại chi tiết nguồn đã chọn / Electron 4.23.347
- Feature priority: NEW — Thêm nút trở lại ngay trên thẻ nguồn sau khi dùng Đi tới, cuộn lại đúng hàng chi tiết trước đó và làm nổi bật dòng nguồn; giữ ID nguồn sau khi sắp xếp, không sửa playlist hoặc phát video.
- Electron screenshot: positron-p51262-source-return-after-1920x1080-real.png
- User action: Mở Chi tiết nguồn, nhấn “Đi tới” ở một hàng để tới thẻ gốc; trên thẻ được tô viền nhấn “↖ Chi tiết” để quay lại hàng nguồn đúng vị trí trước đó, không phải cuộn thủ công.
- Electron QA: `positron-p51262-source-return-before-1920x1080-real.png` / `positron-p51262-source-return-after-1920x1080-real.png` / `positron-p51262-source-return-720-real.png`; kiểm tra focus, highlight, xóa nút tạm, không autoplay và dữ liệu bất biến.

## P5.1.261 — Đi tới thẻ nguồn từ bảng chi tiết / Electron 4.23.346
- Feature priority: NEW — Bấm trực tiếp từ dòng nguồn trong phần Chi tiết nguồn để tìm và làm nổi bật thẻ nguồn gốc bên dưới, giữ đúng ID nguồn dù bảng chi tiết đã sắp xếp; không thay đổi playlist hoặc tự phát video.
- Electron screenshot: positron-p51261-source-jump-after-1920x1080-real.png
- User action: Mở Nguồn IPTV → Chi tiết nguồn → chọn sắp xếp Ít kênh trước → nhấn “Đi tới” cạnh nguồn muốn quản lý; thẻ nguồn tương ứng sẽ cuộn vào vùng xem và được viền nổi bật.
- Electron QA: `positron-p51261-source-jump-before-1920x1080-real.png` / `positron-p51261-source-jump-after-1920x1080-real.png` / `positron-p51261-source-jump-720-real.png`; xác minh focus, ID nguồn, vị trí thẻ, dữ liệu bất biến, không autoplay và không tràn ngang.

## P5.1.260 — Sắp xếp nguồn theo số kênh hoặc tên / Electron 4.23.345
- Feature priority: NEW — Cho phép xem nguồn nhiều kênh nhất hoặc ít kênh nhất ở đầu bảng chi tiết, hoặc sắp xếp tên A–Z; chỉ thay đổi thứ tự hiển thị bảng phụ, hoàn toàn giữ nguyên dữ liệu M3U và thứ tự nguồn gốc.
- Electron screenshot: positron-p51260-source-sort-after-1920x1080-real.png
- User action: Mở Nguồn IPTV → Chi tiết nguồn → mục “Thứ tự gốc”, chọn “Ít kênh trước” để tìm nhanh playlist 9 kênh trước playlist 552 kênh. Có thể chọn “Nhiều kênh trước” hoặc “Tên A–Z”.
- Electron QA: `positron-p51260-source-sort-before-1920x1080-real.png` / `positron-p51260-source-sort-after-1920x1080-real.png` / `positron-p51260-source-sort-720-real.png`; xác minh thứ tự thực, không thay đổi playlist, không tự phát kênh, không tràn ngang.

## P5.1.259 — Lọc nhanh nguồn bật/tắt trong chi tiết IPTV / Electron 4.23.344
- Feature priority: NEW — Có bộ chọn trạng thái Tất cả / Đang bật / Đang tắt ngay trong chi tiết nguồn. Thao tác lọc phối hợp với tìm kiếm theo tên, công khai số nguồn phù hợp và không đổi dữ liệu playlist, Favorites hoặc kênh phát.
- Electron screenshot: positron-p51259-source-status-after-1920x1080-real.png
- User action: Mở Nguồn IPTV → Chi tiết nguồn, chọn Đang tắt để kiểm tra nguồn tắt mà không cần cuộn danh sách playlist dài; chuyển Đang bật hoặc Tất cả để xem các nguồn tương ứng.
- Electron QA: `positron-p51259-source-status-before-1920x1080-real.png` / `positron-p51259-source-status-after-1920x1080-real.png` / `positron-p51259-source-status-720-real.png`; so khớp metadata, 720px, không autoplay và không thay đổi nguồn, chỉ hoàn thành khi nhìn ảnh thực và CI/release đạt.

## P5.1.258 — Tìm kiếm trong danh sách chi tiết nguồn IPTV / Electron 4.23.343
- Feature priority: NEW — Bổ sung ô tìm nguồn ngay sau khi mở “Chi tiết nguồn”, tìm không phân biệt hoa/thường và dấu tiếng Việt trên **toàn bộ danh sách nguồn**, không chỉ 30 dòng đầu. Danh sách chi tiết có cuộn riêng và thông báo khi không có kết quả.
- Không gọi playback, không ghi dữ liệu nguồn/M3U, giữ số kênh/trạng thái từng nguồn và có thể thu gọn như trước.
- Electron screenshot: positron-p51258-source-search-after-1920x1080-real.png
- User action: Mở Quản lý nguồn IPTV, bấm “Chi tiết nguồn”, gõ tên vào ô tìm ngay bên dưới để lọc những nguồn phù hợp; xóa nội dung tìm để xem lại toàn bộ.
- Electron QA: `positron-p51258-source-search-before-1920x1080-real.png` / `positron-p51258-source-search-after-1920x1080-real.png` / `positron-p51258-source-search-720-real.png`. CI kiểm tra đúng một nguồn được lọc, dữ liệu và playback bất biến, không tràn ngang. Chỉ công nhận vòng khi đã xem PNG thật và CI hoàn tất.

## P5.1.257 — Mở chi tiết nguồn và số kênh từ thẻ thống kê / Electron 4.23.342
- Feature priority: NEW — Thêm nút Chi tiết nguồn ngay cạnh thống kê thư viện. Khi bấm, ứng dụng liệt kê tên từng nguồn, số kênh thuộc nguồn và trạng thái Bật/Tắt, có thể đóng lại; bản lớn giới hạn hiển thị 30 nguồn để tránh làm nặng giao diện. Tất cả chỉ đọc, không thay đổi playlist.
- Electron screenshot: positron-p51257-source-details-after-1920x1080-real.png
- User action: Vào Nguồn IPTV, bấm “Chi tiết nguồn” cạnh chip số liệu để xem nguồn nào có bao nhiêu kênh và nguồn nào đang tắt; bấm “Ẩn chi tiết” để thu gọn.
- Electron QA: `positron-p51257-source-details-before-1920x1080-real.png` / `positron-p51257-source-details-after-1920x1080-real.png` và `positron-p51257-source-details-720-real.png`, so sánh tên/trạng thái/số kênh với store, không sửa nguồn, không autoplay, không tràn ngang, test/CI phải đạt mới công bố.


## P5.1.256 — Thống kê nguồn đang bật và tổng kênh ngay trong tiêu đề Nguồn IPTV / Electron 4.23.341
- Feature priority: NEW — Hiển thị thẻ số liệu `2/2 nguồn bật · 561 kênh` theo thư viện thực, tự cập nhật khi số lượng nguồn/kênh trong footer chính thay đổi. Giúp nhận ra nguồn đang tắt ngay trên màn quản lý thay vì phải tìm nút trạng thái; chỉ đọc dữ liệu, không phát kênh hay lưu nguồn.
- Electron screenshot: positron-p51256-inventory-after-1920x1080-real.png
- User action: Mở trang Nguồn IPTV và xem thống kê ngay dưới phần mô tả; khi thêm/xóa hoặc bật/tắt nguồn, thống kê tổng và số nguồn đang bật theo trạng thái mới.
- Electron QA: `positron-p51256-inventory-before-1920x1080-real.png` / `positron-p51256-inventory-after-1920x1080-real.png` (1920x1080), thêm `positron-p51256-inventory-720-real.png` (720px), kiểm tra dữ liệu từ store, không tràn ngang, không mutate M3U/Favorites/playback; chỉ công nhận sau CI và mở ảnh.


## P5.1.255 — Nút quay lại kênh ngay trên trang Nguồn IPTV / Electron 4.23.340
- Feature priority: NEW — Thêm nút một chạm ở phần đầu trang Nguồn IPTV, hiện số kênh đã duyệt gần nhất và quay về kênh ấy mà không phát video; dùng chung cơ chế với Alt+Shift+L. Nút tự vô hiệu khi chưa có dấu vị trí và không thay đổi M3U, Favorites, playback hoặc cài đặt.
- Electron screenshot: positron-p51255-return-button-after-1920x1080-real.png
- User action: Chọn một hàng kênh trên TV, mở Nguồn IPTV, bấm nút “↩ Kênh 412” trong phần tiêu đề để trở về hàng kênh đã chọn, không cần nhớ phím tắt.
- Electron QA: đối chiếu `positron-p51255-return-button-before-1920x1080-real.png` và `positron-p51255-return-button-after-1920x1080-real.png`, test click và đo focus/center/overflow/dữ liệu. Trạng thái release chỉ xác nhận sau CI và mở ảnh thật.


## P5.1.254 — Alt+Shift+L quay lại kênh từ trang khác / Electron 4.23.339
- Feature priority: NEW — Alt+Shift+L cho phép quay lại TV từ Nguồn IPTV, EPG hoặc Cài đặt, tìm đúng kênh vừa duyệt và căn giữa danh sách. Chỉ dùng bookmark trong phiên, không chiếm phím khi nhập liệu, không tự phát và không thay đổi playlist, Favorites hay nguồn.
- Electron screenshot: positron-p51254-cross-page-after-1920x1080-real.png
- User action: Sau khi duyệt một hàng kênh ở trang TV, mở Nguồn IPTV hoặc EPG rồi nhấn Alt+Shift+L để quay thẳng về hàng kênh đó, không cần tự chuyển về TV.
- Electron QA: `positron-p51254-cross-page-before-1920x1080-real.png` và `positron-p51254-cross-page-after-1920x1080-real.png`; phải xem ảnh thật, đo focus/kích thước và xác minh CI trước khi đánh dấu hoàn thành.


## P5.1.243 — Shift+R mở/thoát Vừa xem mà không cần chuột / Electron 4.23.328
- Feature priority: NEW — Thêm phím Shift+R ngay tại hàng kênh để mở lọc Vừa xem. Ảnh P5.1.242 cho thấy khi lịch sử rỗng không còn hàng nào để focus, do đó Shift+R trên chip Vừa xem cũng quay lại Tất cả và trả focus về kênh đầu tiên. Cho phép thao tác hai chiều bằng bàn phím, không tự phát, không sửa Favorites hay nguồn.
- Electron screenshot: positron-p51243-keyboard-recent-after-1920x1080-real.png
- User action: Focus một hàng kênh TV và nhấn Shift+R để mở Vừa xem; khi lịch sử trống, chip Vừa xem nhận focus, nhấn Shift+R lần nữa để khôi phục danh sách.
- Electron QA: `positron-p51243-keyboard-recent-before-1920x1080-real.png` và `positron-p51243-keyboard-recent-after-1920x1080-real.png`; kiểm tra bàn phím, focus, số kênh và Favorites bất biến.


## P5.1.242 — Chip báo mọi bộ lọc kênh ẩn / Electron 4.23.327
- Feature priority: NEW — Mở rộng chip báo trạng thái P5.1.241 từ riêng Yêu thích sang mọi tab lọc native, gồm Vừa xem, Sống, Die và Chưa rõ. Khi tab bị thu gọn hoặc lọc ra 0 kênh, người dùng vẫn nhìn thấy tên bộ lọc, số kênh và hành động Xem tất cả để tránh hiểu nhầm mất playlist. Màu chip Vừa xem dịu hơn và mọi thao tác không thay đổi Favorites, playback hay nguồn.
- Electron screenshot: positron-p51242-recent-filter-after-1920x1080-real.png
- User action: Vào trang TV chọn bộ lọc Vừa xem, thấy chip màu xanh báo chính xác chế độ hiện tại ngay dưới ô tìm; bấm Xem tất cả để khôi phục toàn bộ danh sách.
- Electron QA: ảnh `positron-p51242-recent-filter-before-1920x1080-real.png` và `positron-p51242-recent-filter-after-1920x1080-real.png`; kiểm tra chip xuất hiện, vừa cột, màu đúng và một chạm xóa lọc.


## P5.1.241 — Chip lọc Yêu thích có nút Xem tất cả / Electron 4.23.326
- Feature priority: NEW — Khi Shift+F lọc còn 20 kênh, ảnh P5.1.240 chỉ báo 20/561 mà không nêu bộ lọc đang bật, rất dễ hiểu nhầm mất kênh. Thêm chip nhỏ trực tiếp dưới ô tìm để hiển thị `Yêu thích · 20` cùng hành động `Xem tất cả`, khôi phục danh sách bằng bộ lọc native và giữ focus; không thay đổi dữ liệu Favorites hoặc IPTV.
- Electron screenshot: positron-p51241-favorite-chip-after-1920x1080-real.png
- User action: Từ danh sách kênh nhấn Shift+F, nhìn chip Yêu thích dưới ô tìm; nhấn Xem tất cả trên chip để bỏ lọc và quay về danh sách đầy đủ.
- Electron QA: ảnh trước `positron-p51241-favorite-chip-before-1920x1080-real.png`, sau `positron-p51241-favorite-chip-after-1920x1080-real.png`; kiểm tra chip hiện, không vượt chiều rộng panel, xóa lọc và giữ nguyên Favorites.


## P5.1.240 — Shift+F lọc nhanh yêu thích không thay đổi dấu sao / Electron 4.23.325
- Feature priority: NEW — Thêm phím tắt Shift+F trong danh sách kênh để luân phiên bộ lọc Tất cả/Yêu thích và giữ focus trên hàng đầu. Trước đây Shift+F bị hiểu nhầm là F và đảo dấu sao, dễ thay đổi dữ liệu yêu thích ngoài ý muốn. Bản mới chỉ chuyển bộ lọc sẵn có, tuyệt đối không ghi M3U hoặc thay đổi Favorites.
- Electron screenshot: positron-p51240-shift-favorites-after-1920x1080-real.png
- User action: Focus một hàng trong danh sách TV, nhấn Shift+F để chỉ xem kênh yêu thích, nhấn lại Shift+F để quay về tất cả. Nhấn F thường mới đổi dấu sao.
- Electron QA: so sánh `positron-p51240-shift-favorites-before-1920x1080-real.png` với `positron-p51240-shift-favorites-after-1920x1080-real.png`, kiểm tra favorites bất biến trước/sau.


## P5.1.239 — Escape đóng bảng nhảy kênh từ danh sách / Electron 4.23.324
- Feature priority: NEW — Bổ sung phím Escape để đóng ngay bảng nhảy kênh/nhóm khi đang focus một hàng kênh, giảm chiều cao phần biểu mẫu và trả lại không gian duyệt kênh mà không phải quay về nút đóng. Không bắt đầu playback, không đổi M3U/EPG/Favorites và không thay đổi lịch sử nhóm.
- Electron screenshot: positron-p51239-escape-jump-after-1920x1080-real.png
- User action: Trên trang TV nhấn Alt+J từ danh sách để mở bảng nhảy, nhấn Escape khi vẫn focus một kênh để thu bảng và giữ focus ở đúng kênh trước đó.
- Electron QA: `positron-p51239-escape-jump-before-1920x1080-real.png` và `positron-p51239-escape-jump-after-1920x1080-real.png`, phải mở nhìn sau khi CI chụp thật.
- Version: 4.23.324; chỉ coi phát hành sau đủ test / capture / build / release.


## P5.1.238 — Không cướp focus khi đang nhập với Alt+J/Alt+G / Electron 4.23.323
- Feature priority: NEW — Tăng khả năng điều hướng bằng bàn phím có nhận biết ngữ cảnh: Alt+J/Alt+G chỉ bật bảng nhảy khi ngoài vùng soạn thảo, trong ô tìm kiếm hoặc biểu mẫu người dùng tiếp tục nhập không mất focus, bảo toàn dữ liệu và thao tác video hiện tại. Giải quyết việc phím tắt toàn cục can thiệp vào chỉnh sửa nội dung.
- Giữ nguyên thao tác Alt+J/Alt+G khi focus ngoài các ô nhập; không tự phát kênh, không thay đổi nguồn M3U, lịch sử hay danh sách Yêu thích.
- Electron screenshot: positron-p51238-shortcut-guard-after-1920x1080-real.png
- Electron QA: `positron-p51238-shortcut-guard-before-1920x1080-real.png`, `positron-p51238-shortcut-guard-after-1920x1080-real.png`; chỉ coi đạt khi workflow thành công và ảnh sau đã được xem trực tiếp.
- User action: Focus vào ô Tìm kênh rồi nhấn Alt+J hoặc Alt+G để tiếp tục gõ; rời ô nhập, focus hàng kênh và nhấn Alt+J để mở bảng nhảy kênh đúng ý.


## P5.1.237 — Alt+←/Alt+→ điều hướng lịch sử nhóm / Electron 4.23.322
- Feature priority: NEW — Điều hướng lịch sử nhóm trực tiếp từ hàng kênh bằng tổ hợp Alt+Mũi tên trái/phải, giúp người dùng điều khiển bằng bàn phím mà không phải di chuyển focus lên nút Nhóm trước/Nhóm sau; phím vẫn giữ chức năng soạn thảo khi đang ở ô nhập.
- Electron screenshot: positron-p51237-keyboard-history-after-1920x1080-real.png
- User action: Trên trang TV dùng Alt+G chọn nhóm 03 rồi Alt+← quay về nhóm 01, Alt+→ đi lại nhóm 03; focus vào kênh đầu nhóm và không tự phát video.
- Ảnh P5.1.236 cho thấy nút Nhóm sau hoạt động và không chồng nút, nhưng để sử dụng người xem phải rời vị trí đang focus trong danh sách kênh để bấm lên thanh trên.
- Cơ chế: thêm aria-keyshortcuts và handler kênh ưu tiên Alt+Arrow trước xử lý mũi tên bình thường, bỏ qua input và trang ngoài TV; giữ nguyên M3U/EPG/Favorites/playback.
- CI: chạy build Windows/Mac song song với Electron capture sau khi Node test xanh; Release vẫn bắt buộc test + capture + build đạt, không bỏ kiểm thử.
- QA: Node regression, Electron thật 1920×1080, đo phím Alt+ArrowLeft/Right, focus 001↔121, không autoplay hoặc tràn, ảnh before/after.
- Trạng thái: CANDIDATE đến khi đủ test, screenshot-review, build và Release.



## P5.1.236 — Nhóm sau: quay lại nhóm vừa rời sau thao tác Back / Electron 4.23.321
- Feature priority: NEW — Thêm nút “↷ Nhóm sau” chỉ xuất hiện sau khi người xem quay về nhóm trước, hỗ trợ tiến lại nhóm đã duyệt mà không phải tìm kiếm hay ghi nhớ thư mục vừa xem; việc chọn nhóm mới chủ động sẽ xóa hướng tiến không còn hợp lệ.
- Electron screenshot: positron-p51236-group-forward-after-1920x1080-real.png
- User action: Trên trang TV mở Alt+G để chuyển từ nhóm 01 sang nhóm 03, nhấn “↶ Nhóm trước” để về 01 rồi nhấn “↷ Nhóm sau” để trở lại 03, tất cả thao tác chỉ chuyển focus chứ không tự phát kênh.
- Ảnh P5.1.235 đã soát: sau khi Back về 01, nút Back đúng là tự ẩn nhưng người xem chưa có đường tiến trở lại nhóm 03 đã rời.
- Cơ chế: forward stack tối đa 10 nhóm trong RAM, mỗi lần quay lại lưu đích tiến; khi đi tới nhóm khác bằng menu trực tiếp sẽ xóa redo; render nút phù hợp bằng hidden + aria label, không sửa dữ liệu IPTV.
- QA: Node regression và hai ảnh Electron thật 1920×1080, xác nhận focus 001→121, nút Back/Forward chuyển trạng thái, không autoplay, không tràn.
- Trạng thái: CANDIDATE cho tới khi test/ảnh/build/Release được xác minh.



## P5.1.235 — Quay về nhóm trước mà không lặp lại nhóm hiện tại / Electron 4.23.320
- Feature priority: NEW — Lịch sử điều hướng nhóm theo phiên chỉ giữ một vị trí cho mỗi nhóm và tự loại đích quay lại trùng nhóm đang xem, giúp nút “Nhóm trước” không quay vòng vô ích hoặc hiển thị nhầm sau khi trở về.
- Electron screenshot: positron-p51235-history-dedupe-after-1920x1080-real.png
- User action: Trên trang TV, nhấn Alt+G để chuyển từ nhóm 01 sang nhóm 03, sau đó nhấn “↶ Nhóm trước” để về nhóm 01; nút quay lại sẽ tự ẩn nếu không còn nhóm thực sự khác để quay về.
- Lỗi phát hiện từ hai ảnh Electron P5.1.233 trước/sau: sau khi quay về 01, nút “Nhóm trước” vẫn đưa ra chính 01 do lịch sử thêm trùng từ các lượt điều hướng trước đó.
- Cơ chế: gỡ entry trùng trước push, bỏ self-reference khi pop và dọn phần đuôi lịch sử trùng nhóm focus; không thay stream, autoplay, playlist, EPG hoặc Favorites.
- QA: Node regression, Electron thật 1920×1080 before/after, focus đúng QA 001, nút tự ẩn, không phát video và không tràn.
- Trạng thái: CANDIDATE cho tới khi Node, Electron screenshot-review, build và Release được xác minh.



## P5.1.234 — Tìm đúng nhóm có Đ viết hoa bằng chữ không dấu / Electron 4.23.319
- Feature priority: NEW — Hỗ trợ tìm tên thư mục tiếng Việt có chữ Đ viết hoa bằng từ khóa không dấu ngay trong bộ chọn nhóm, giúp người xem truy cập đúng dữ liệu danh sách kênh mà không cần đổi tên thư mục hoặc mở video.
- Electron screenshot: positron-p51234-vietnamese-group-after-1920x1080-real.png
- User action: Mở trang TV và nhấn Alt+G, nhập `dai truyen hinh` để chọn nhóm mang tên `ĐÀI TRUYỀN HÌNH` rồi dùng nút Đến nhóm nếu muốn chuyển focus.
- Từ mã P233: bộ lọc tên nhóm loại dấu rồi thay chữ đ trước khi chuyển chữ hoa thành thường; do đó tên ĐÀI TRUYỀN HÌNH không khớp khi gõ dai truyen hinh.
- Bản sửa đặt chuyển thường trước khi thay đ→d; ảnh hưởng duy nhất bộ lọc nhóm cục bộ. Không sửa nguồn IPTV, playlist, Favorites, playback hoặc EPG.
- Regression Node kiểm tra ĐÀI/Đại/đài; QA Electron thật 1920×1080 với fixture tên nhóm, ảnh before/after, 1 kết quả, không autoplay, không tràn.
- Trạng thái: CANDIDATE cho tới khi test/ảnh/Release xác minh.


## P5.1.233 — Quay về nhóm vừa rời / Electron 4.23.318
- Feature priority: NEW — Người dùng nhảy từ nhóm 01 sang một nhóm bất kỳ có thể quay lại nhóm cũ trong một lần nhấn, kể cả khi hai nhóm cách xa nhau; lịch sử focus nhóm trong phiên hoàn toàn tách biệt lịch sử phát video và không ghi đè dữ liệu playlist.
- Electron screenshot: positron-p51233-group-history-after-1920x1080-real.png
- User action: Mở trang TV, tập trung vào kênh nhóm 01 rồi nhấn Alt+G để nhảy sang nhóm 03; trong hộp chọn nhóm xuất hiện ↶ Nhóm trước. Nhấn nút này để quay về nhóm 01 mà không phát kênh.
- QA: Electron thật 1920×1080, 561 kênh, xác minh nút quay lại chỉ xuất hiện khi có lịch sử, trả focus về kênh nhóm trước, không tự phát hoặc sửa dữ liệu.
- CI optimization: build Mac/Windows có thể chạy song song với QA sau khi Node test xanh; Release vẫn bắt buộc cả capture và build thành công.
- CANDIDATE tới khi test, ảnh thật đã mở và Release đủ bộ cài.


## P5.1.232 — Tìm nhanh nhóm kênh theo tên / Electron 4.23.317
- Feature priority: NEW — Khi có hàng chục thư mục, người dùng có thể gõ một phần tên để thu hẹp nhóm ngay trong bộ chọn Alt+G, thay vì bấm tới từng nhóm; hỗ trợ tên tiếng Việt không dấu. Đồng thời sửa lỗi ảnh P5.1.231 cho thấy nhãn “Đến nhóm” chồng lên ô chọn.
- Electron screenshot: positron-p51232-group-search-after-1920x1080-real.png
- User action: Mở trang TV, nhấn Alt+G, gõ tên nhóm (ví dụ other), danh sách nhóm chỉ còn kết quả phù hợp; nhấn Enter hoặc Đến nhóm để chuyển focus tới kênh đầu, không tự phát.
- QA: Electron thật 1920×1080, 561 kênh QA, bộ đếm kết quả, kiểm tra hình học chống chồng nhãn, không thay đổi playlist và không tự phát; lưu ảnh before/after và mở ảnh soát.
- P5.1.231 được phát hành từ commit trước khi người dùng/AI duyệt ảnh, nên tag cũ được giữ bất biến; bản P5.1.232 mới mới bao gồm sửa chồng nhãn.
- CANDIDATE tới khi test/ảnh/CI và Release đầy đủ.


## P5.1.231 — Bộ chọn nhóm kênh trực tiếp qua Alt+G / Electron 4.23.316
- Feature priority: NEW — Sau khi chuyển nhóm tuần tự đã hoạt động, người dùng có hàng chục nhóm kênh cần nhảy trực tiếp tới bất kỳ nhóm nào bằng menu chọn có nhãn rõ ràng và hỗ trợ bàn phím; có thể mở nhóm thu gọn qua thao tác gốc.
- Electron screenshot: positron-p51231-group-picker-after-1920x1080-real.png
- User action: Trên trang TV, nhấn Alt+G để mở bộ chọn Nhóm, chọn một nhóm đang hiển thị rồi bấm Đến nhóm hoặc Enter. Hàng kênh đầu nhóm được focus; chỉ khi nhấn Enter trên hàng đó mới phát video.
- QA: 561 kênh kiểm thử cục bộ, Electron thật trước/sau 1920×1080, xác nhận đúng nhóm, không tự phát, không tràn ngang, giữ nguyên danh sách và playback; Node test và CI 6/6.
- CANDIDATE đến khi mở ảnh Electron thật, test và Release đạt.


## P5.1.230 — Chuyển nhóm kênh bằng phím trái/phải / Electron 4.23.315
- Feature priority: NEW — Chọn một kênh rồi nhấn → để tới đầu nhóm mở kế tiếp, ← để về đầu nhóm trước. Bỏ qua nhóm thu gọn, giữ nguyên luồng phát, dữ liệu playlist và Favorites.
- User action: Trên trang TV, focus một hàng kênh rồi nhấn mũi tên phải để tới đầu nhóm kế tiếp đang mở, nhấn mũi tên trái để quay lại nhóm trước; nhấn Enter mới phát.
- Electron screenshot: positron-p51230-group-navigation-after-1920x1080-real.png
- QA: Electron thật 1920×1080 trước/sau, 561 kênh QA, kiểm tra focus, nội dung nhóm, vùng cuộn, no autoplay và không tràn.
- CANDIDATE đến khi Node test/ảnh thực đã mở/CI 6 jobs và Release được xác minh.


## P5.1.229 — Đánh dấu yêu thích ngay bằng phím F / Electron 4.23.314
- Feature priority: NEW — Người dùng đang duyệt hàng trăm kênh bằng phím mũi tên có thể nhấn F trên hàng kênh được focus để thêm/bỏ Yêu thích ngay lập tức, không cần rê chuột tới biểu tượng sao nhỏ và không làm chuyển hoặc phát kênh.
- Electron screenshot: positron-p51229-keyboard-favorite-after-1920x1080-real.png
- User action: Chọn hàng kênh bằng phím mũi tên hoặc số thứ tự; nhấn F để thêm yêu thích, nhấn F lần nữa để bỏ. Enter vẫn là thao tác phát kênh. Viền focus giữ nguyên để tiếp tục duyệt.
- QA Electron: ảnh trước/sau 1920×1080 chọn QA Channel 412, so sánh aria-pressed và màu sao, Favorites tăng một rồi giảm một, phục hồi dữ liệu thử nghiệm, không autoplay, không cuộn trang ngoài hoặc mất focus.
- Tận dụng nút sao gốc để giữ chức năng lưu, phản hồi, đồng bộ và tương thích với mọi bộ lọc.
- CANDIDATE cho tới khi test Node, ảnh Electron đã MỞ và Release thành công.


## P5.1.228 — Duyệt kênh bằng bàn phím, không cần chuột / Electron 4.23.313
- Feature priority: NEW — Người dùng có hàng trăm kênh có thể di chuyển focus bằng mũi tên lên xuống, Home, End, PageUp và PageDown mà không phải nhấn phát từng kênh; thêm viền focus rõ ràng và Alt+J mở ô nhảy tới số kênh, giữ nguyên video đang xem.
- Electron screenshot: positron-p51228-keyboard-channels-after-1920x1080-real.png
- User action: Chọn một kênh trong danh sách bằng Tab hoặc ô Nhảy theo số, dùng ↑/↓/PageUp/PageDown/Home/End để duyệt. Chỉ Enter mới phát; Alt+J mở ô nhập số kênh.
- QA Electron: ảnh before/after 1920×1080 từ Electron thật, focus kênh 400 → ArrowDown → PageDown, đo viền focus và vùng cuộn, End/Home, Alt+J, không làm cuộn trang TV hoặc tự phát kênh.
- Không thay đổi danh sách nguồn, Favorites, playback, DVR, Cast hoặc stream.
- CANDIDATE đến khi test Node, ảnh thực đã MỞ soát và release được xác minh.


## P5.1.227 — Nhảy kênh không cuộn cả trang video, tiêu đề gọn / Electron 4.23.312
- Feature priority: BLOCKER_FIX — Ảnh Electron P5.1.226 cho thấy nhảy tới kênh 250 kéo cả trang video lên, che khuất đầu sidebar và mép trên khung phát, trong khi ba nút tiêu đề khiến chữ xuống hai dòng; sửa đúng vùng cuộn để điều khiển TV vẫn luôn nhìn thấy.
- Electron screenshot: positron-p51227-jump-scroll-after-1920x1080-real.png
- User action: Nhập số 400 rồi chọn Đi. Chỉ danh sách kênh được cuộn tới đúng hàng; thanh tiêu đề và khung phát không dịch chuyển, không có stream nào tự phát.
- QA Electron: dùng ảnh P226 bị lỗi làm đầu vào; ảnh before/after thật P227, kiểm tra vùng cuộn ngoài không đổi, header hiển thị một dòng, player còn trong vùng nhìn, hàng 400 được focus.
- Giữ nguồn M3U, Favorites, DVR, phụ đề và Cast.
- CANDIDATE tới khi Node, ảnh thật đã MỞ, CI và Release đạt.


## P5.1.226 — Nhảy nhanh tới kênh theo số, không tự phát / Electron 4.23.311
- Feature priority: NEW — Khi playlist có hàng trăm kênh, người dùng có thể nhập số thứ tự để định vị kênh trong danh sách mà không phải cuộn qua hàng trăm mục hoặc làm gián đoạn video đang phát.
- Electron screenshot: positron-p51226-channel-jump-after-1920x1080-real.png
- User action: Mở TV, bấm biểu tượng Nhảy tới kênh theo số ở đầu danh sách, nhập số từ 1 đến số kênh đang có rồi bấm Đi hoặc Enter. Ứng dụng đặt bộ lọc về Tất cả, mở nhóm cần thiết và cuộn đến kênh, không phát; Escape đóng ô nhập.
- QA Electron: before/after 1920×1080 trên dữ liệu kiểm thử 561 kênh, chọn vị trí 250 rồi 350 bằng Enter, kiểm tra focus, scroll thực, không bật video, không thay nguồn; Escape hoàn trả focus.
- Không đụng dữ liệu playlist, thứ tự người dùng, quyền xem nguồn, Favorites hoặc logic phát trực tiếp.
- CANDIDATE đến khi Node, screenshot Electron đã MỞ, 6 jobs và release được xác minh.


## P5.1.225 — Giữ điều khiển phát video trong cửa sổ desktop / Electron 4.23.310
- Feature priority: BLOCKER_FIX — Các nút điều khiển phát video, âm lượng và chọn kênh bị đẩy xuống dưới vùng nhìn khi desktop rộng mà cửa sổ thấp, nên cần giới hạn riêng chiều cao stage để tránh cắt thao tác quan trọng mà không thay đổi dữ liệu người xem.
- Electron screenshot: positron-p51225-tv-controls-after-1920x1080-real.png
- User action: Mở TV trên desktop 1920×1080; hàng điều khiển Play và các thao tác bổ sung vẫn nằm trên thanh trạng thái thay vì phải cuộn.
- QA Electron: hai PNG before/after từ cùng ứng dụng thật, đo vị trí bottom của player và control card, kiểm tra không tràn ngang và giữ video trong tỷ lệ khung; riêng fullscreen giữ nguyên.
- Không sửa nguồn M3U, logic playback, Cast, DVR hay dữ liệu Favorites.
- CANDIDATE cho đến khi Node, Electron screenshot sau đã MỞ, 6 jobs và release được xác minh.


## P5.1.224 — Trạng thái nhập XMLTV hiển thị ngay trong EPG / 4.23.309
- Feature priority: NEW — Sau khi người dùng nhập hoặc hủy file XMLTV ngay từ trang Lịch phát sóng, phản hồi không còn bị giấu trong mục Cài đặt, tránh nhầm rằng ứng dụng treo hoặc mất dữ liệu EPG.
- Electron screenshot: positron-p51224-epg-feedback-after-1920x1080-real.png
- User action: Trên trang EPG chưa có dữ liệu, chọn Nhập file EPG từ máy, chọn hoặc hủy file. Ngay dưới nhóm nút sẽ xuất hiện trạng thái có thể đọc bằng trình đọc màn hình; nội dung trạng thái bên Cài đặt vẫn được giữ giống hệt.
- QA Electron screenshot: before/after 1920×1080 với dữ liệu tình huống hủy được mô phỏng qua hàm phản hồi cùng code path, kiểm tra aria-live, chuỗi status song song, giữ nguyên playlist và responsive 450px.
- Không đổi logic đọc file, xác nhận xóa dữ liệu, tính năng DVR, M3U hay playback.
- CANDIDATE đến khi Node/ảnh/CI 6 job/tag release được xác minh.


## P5.1.223 — Nhập XMLTV trực tiếp từ trạng thái EPG rỗng / Electron 4.23.308
- Feature priority: NEW — Người xem có file XMLTV hợp pháp trong máy có thể nhập trực tiếp từ trang Lịch phát sóng mà không phải đi vòng qua trang Cài đặt; dùng nguyên luồng kiểm tra, xác nhận và lưu của chức năng nhập hiện có.
- Electron screenshot: positron-p51223-epg-import-after-1920x1080-real.png
- User action: Khi chưa tải EPG, bấm Nhập file EPG từ máy ở dưới lời hướng dẫn. Trình chọn file hệ điều hành chạy qua chức năng gốc; xem và xác nhận việc thay dữ liệu EPG như trước, kênh và lịch ghi đã đặt không bị thay đổi.
- Screenshot QA: native Electron before/after 1920×1080, nút nằm dưới hướng dẫn, phím Enter chuyển tiếp click tới bộ nhập gốc (CI chặn hộp thoại hệ điều hành), 450px không tràn.
- Giữ nguyên chức năng Chọn nguồn EPG của P5.1.222; dữ liệu người dùng không bị thay đổi bởi việc hiển thị nút.
- CANDIDATE cho đến khi Node, Electron screenshot sau đã MỞ, 6 jobs và release được xác minh.


## P5.1.222 — Chọn nhanh nguồn EPG khi chưa tải dữ liệu / Electron 4.23.307
- Feature priority: NEW — Bổ sung nút chọn nguồn XMLTV ngay trong trạng thái rỗng của lịch phát sóng, giúp người dùng nhập và kiểm tra nguồn thay vì bị báo sai là danh sách kênh không khớp khi chưa tải lịch.
- Electron screenshot: positron-p51222-epg-source-after-1920x1080-real.png
- User action: Mở Lịch phát sóng khi EPG chưa tải, bấm Chọn nguồn EPG để đến Cài đặt, bật nguồn XMLTV hiện có hoặc nhập URL/file rồi tải lịch. Nút không tự tải dữ liệu hoặc thay đổi playlist.
- Kịch bản native Electron: hai ảnh trước/sau 1920×1080, soát trạng thái rỗng, Enter keyboard tới Cài đặt, viewport 720px, không tràn ngang; bài kiểm thử hồi quy tự động.
- Không sửa lịch ghi DVR, không đụng nguồn M3U, dữ liệu yêu thích, playback hoặc các nhánh khác.
- CANDIDATE cho tới khi test, ảnh sau mở bằng mắt, 6 CI jobs và Release bất biến thành công.


## P5.1.221 — Căn thẳng các nhãn EPG DVR / Electron 4.23.306
- Feature priority: BLOCKER_FIX — Các nhãn Bắt đầu và Kết thúc lệch hàng khiến việc chọn đúng thời điểm ghi video trở nên khó kiểm tra; sửa bố cục để tránh thao tác nhầm mà không thay đổi dữ liệu lịch hoặc luồng ghi hình.
- Electron screenshot: positron-p51221-dvr-form-after-1920x1080-real.png
- Input: ảnh Electron thật P5.1.219 1920×1080 có các nhãn Kênh, Tên chương trình, Bắt đầu và Kết thúc lệch dọc. Root cause: .dvr-form căn cuối với label chứa hàng nút giờ khác chiều cao.
- Sửa riêng Positron desktop >1050px: các nhãn căn cạnh trên, nút Đặt lịch ghi giữ cùng hàng input. Không sửa logic DVR, danh sách M3U, Favorites, stream.
- QA: ảnh Electron thực before (reproduced legacy bottom alignment) và after 1920×1080; geometry assert và viewport 720px.
- Trạng thái: CANDIDATE cho tới khi mở ảnh sau, Node tests, CI 6/6, release/tag mới được kiểm chứng.


## P5.1.220 — Mở rộng lịch sử khám phá tối đa 50 kênh / Electron 4.23.305
- Feature priority: NEW — Mã và ảnh Electron P5.1.219 cho thấy lịch sử có thể chứa 50 lần khám phá nhưng popup chỉ hiện 10 kênh gần nhất, khiến các kênh cũ không thể truy cập; thêm nút mở rộng/thu gọn.
- Electron screenshot: positron-p51220-history-more-after-1920x1080-real.png
- User action: Mở ☷ lịch sử khám phá; khi có trên 10 kênh, bấm Xem thêm N kênh để mở tối đa 50, hoặc Thu gọn về 10 kênh. Có thể tìm kiếm, lọc Yêu thích và sắp xếp.
- Tính năng: mặc định 10 mục; mở rộng đọc tối đa 50 mục phiên hiện tại từ trail/redo có sẵn, không phát video, không sửa nguồn, danh sách Favorites hay dữ liệu EPG. Có aria-expanded và focus được khôi phục.
- Electron before/after: positron-p51220-history-more-before-1920x1080-real.png và positron-p51220-history-more-after-1920x1080-real.png. QA tạo 16 lần khám phá không autoplay, xác minh 10→16→10, giữ playlist, 450px không tràn.
- Trạng thái: CANDIDATE tới khi Node, ảnh Electron mở kiểm, CI 6/6 và Release.

## P5.1.219 — Sắp xếp lịch sử khám phá theo tên / Electron 4.23.304
- Feature priority: NEW — Ảnh Electron thật P5.1.218 cho thấy tìm kiếm và lọc Yêu thích hoạt động nhưng lịch sử chỉ theo thời điểm khám phá; thêm chế độ tên A–Z và Z–A theo thứ tự tiếng Việt.
- Electron screenshot: positron-p51219-history-sort-after-1920x1080-real.png
- User action: Mở ☷ lịch sử khám phá, chọn Mới khám phá nhất, Tên kênh A–Z hoặc Tên kênh Z–A trong ô Sắp xếp; có thể kết hợp tìm và lọc Yêu thích.
- Tính năng: select native hỗ trợ bàn phím, dùng localeCompare vi và numeric true; chỉ sắp xếp bản sao dữ liệu hiển thị, không viết lịch sử, Favorites, M3U, EPG hay tự phát video.
- Electron before/after: positron-p51219-history-sort-before-1920x1080-real.png / positron-p51219-history-sort-after-1920x1080-real.png. QA: thứ tự A–Z/Z–A, hoàn nguyên gần nhất, không autoplay và viewport 450px.
- Trạng thái: CANDIDATE tới khi Node, ảnh Electron mở kiểm, CI 6/6 và release đủ assets.

## P5.1.218 — Lọc nhanh Yêu thích trong lịch sử khám phá / Electron 4.23.303
- Feature priority: NEW — Ảnh Electron thật P5.1.217 cho thấy nút sao mới đã giúp lưu kênh, nhưng danh sách lịch sử còn trộn kênh thường và kênh đã yêu thích. Thêm lọc theo Favorites trong phiên, kết hợp tìm kiếm.
- Electron screenshot: positron-p51218-favorites-filter-after-1920x1080-real.png
- User action: Mở ☷ lịch sử khám phá, nhấn ☆ Chỉ yêu thích để chỉ xem kênh đã lưu; bấm lại để xem toàn bộ; vẫn có thể tìm tên hoặc nhóm trong danh sách đang lọc.
- Tính năng: chỉ đọc dữ liệu Favorites sẵn có bằng OpenIPTVFavorites.has; lọc tại chỗ, không tự phát, không ghi hoặc sửa M3U và danh sách yêu thích; có aria-pressed và trạng thái rỗng riêng.
- Electron before/after: positron-p51218-favorites-filter-before-1920x1080-real.png / positron-p51218-favorites-filter-after-1920x1080-real.png. QA dùng một kênh yêu thích, một kênh thường; kiểm Enter bật lọc, tìm không khớp, tắt lọc, lưu dữ liệu không đổi, viewport 450px.
- Trạng thái: CANDIDATE tới khi Node, ảnh Electron đã mở kiểm, CI 6/6 và Release thành công.

## P5.1.217 — Đánh dấu Yêu thích trong lịch sử khám phá / Electron 4.23.302
- Feature priority: NEW — Ảnh Electron P5.1.216 cho thấy menu khám phá cho phép chọn phát lại và tìm kiếm nhưng thiếu thao tác lưu ngay kênh vừa thấy vào Yêu thích; thêm nút sao độc lập trong mỗi dòng.
- Electron screenshot: positron-p51217-history-favorite-after-1920x1080-real.png
- User action: Mở ☷ lịch sử kênh, nhấn sao ☆ bên cạnh kênh để thêm Yêu thích; nhấn ★ để bỏ, không cần phát kênh hoặc chuyển trang.
- Tính năng: sử dụng nguyên cơ chế OpenIPTVFavorites.toggle và IPTVState.save/render; nút sao và nút phát là hai button riêng. Lưu thất bại phải phục hồi dữ liệu cũ, không gây phát stream, có aria-pressed và điều hướng bàn phím.
- Electron before/after thật: positron-p51217-history-favorite-before-1920x1080-real.png và positron-p51217-history-favorite-after-1920x1080-real.png. QA kiểm trạng thái Favorites, không autoplay, bảo toàn danh sách kênh, rollback trong fixture, 450px không tràn.
- Trạng thái: CANDIDATE cho tới khi Node test, ảnh Electron mở soát, CI 6/6 và Release hoàn tất.

## P5.1.216 — Gõ tìm ngay khi mở lịch sử khám phá / Electron 4.23.301
- Feature priority: NEW — Mở menu với tiêu điểm ở ô tìm, gõ ngay và di chuyển hai hướng giữa kết quả bằng bàn phím; không tự phát kênh.
- Electron screenshot: positron-p51216-search-focus-after-1920x1080-real.png
- User action: Bấm ☷ trong thanh phát, gõ tên kênh ngay vào ô tìm, dùng ↑/↓ chọn kết quả rồi nhấn Enter để xem kênh.
- Quan sát từ ảnh Electron thật P5.1.215 ở 1920×1080 và mã thực tế: mở danh sách lịch sử tập trung vào lựa chọn đầu, không phải ô tìm nên bàn phím phải nhấn Tab hoặc click mới có thể nhập truy vấn.
- Sửa: mở ☷ tự focus ô tìm; gõ ngay để lọc kênh theo tên/nhóm; ArrowDown chọn kết quả đầu, ArrowUp chọn kết quả cuối; Enter mới phát, Escape đóng và trả focus về nút ☷.
- Không tự phát khi mở/tìm/chuyển focus, không cập nhật playlist, Favorites hoặc lưu lịch sử lên mạng.
- Ảnh bắt buộc Electron 1920×1080 trước/sau: `positron-p51216-search-focus-before-1920x1080-real.png`, `positron-p51216-search-focus-after-1920x1080-real.png`. Kiểm thêm viewport 450px, tiêu điểm và no autoplay.
- Trạng thái: CANDIDATE; chỉ công nhận khi CI, ảnh mở soát và release được xác minh.

## P5.1.215 — Tìm kiếm nhanh trong lịch sử khám phá kênh / Electron 4.23.300
- Feature priority: NEW — Ảnh P5.1.214 xác nhận lịch sử khám phá có nút chọn bằng bàn phím nhưng chưa có ô tìm khi nhiều kênh xuất hiện. Thêm tìm nhanh theo tên hoặc nhóm, hỗ trợ bỏ dấu tiếng Việt.
- Electron screenshot: positron-p51215-history-search-after-1920x1080-real.png
- User action: Mở ☷ từ thanh phát, nhập tên kênh hoặc tên nhóm vào ô Tìm trong lịch sử; kết quả lọc ngay, nhấn Enter để xem kênh đầu tiên. Nhấn ↓ từ ô tìm để dùng các phím mũi tên.
- Tính năng: tìm trong tối đa 10 kênh đang có trong lịch sử phiên; không yêu cầu mạng, không lưu truy vấn, không thay đổi playlist/Favorites, chỉ phát khi người dùng bấm Enter/click; có empty state khi không khớp và hỗ trợ viewport 450px.
- Before: `positron-p51215-history-search-before-1920x1080-real.png`; after: `positron-p51215-history-search-after-1920x1080-real.png`.
- QA: Electron 1920×1080 tìm và lọc một kênh, Enter để xem, giữ nguyên danh sách nguồn và bộ đếm khám phá, kiểm no-match và viewport 450px; ảnh thật trước/sau được mở soát.
- Status: CANDIDATE cho tới khi Node/Electron screenshot/build Release đều đạt.

## P5.1.214 — Điều hướng menu lịch sử bằng bàn phím/remote / Electron 4.23.299
- Feature priority: NEW — Ảnh P5.1.213 chứng minh menu lịch sử mở và chọn kênh bằng click nhưng thiếu di chuyển tiêu điểm có điều khiển với phím mũi tên. Thêm ↑/↓ chuyển lựa chọn và quay vòng, Home/End đến đầu/cuối; Enter thực hiện xem lại.
- Electron screenshot: positron-p51214-history-keys-after-1920x1080-real.png
- User action: Bấm nút ☷ mở danh sách kênh đã khám phá, nhấn ↑/↓ hoặc Home/End chọn kênh, Enter phát, Esc đóng. Chọn kênh không cần chuột.
- Tính năng: chỉ chuyển tiêu điểm khi điều hướng, không tự phát video; giữ tiêu điểm khi đóng menu, không thay đổi số lượt khám phá, playlist hay nguồn và hỗ trợ màn 450px.
- Before: `positron-p51214-history-keys-before-1920x1080-real.png`; after: `positron-p51214-history-keys-after-1920x1080-real.png`.
- QA: Electron thật 1920×1080 chụp focus trước/sau; kiểm ArrowDown/ArrowUp/Home/End/Enter, không autoplay khi chọn, no overflow 450px.
- Status: CANDIDATE chờ Node/Electron screenshot/build Release.

## P5.1.213 — Lịch sử kênh ngẫu nhiên chọn phát lại / Electron 4.23.298
- Feature priority: NEW — Từ ảnh P5.1.212, Back và Forward chỉ chuyển kênh từng bước. Menu mới mở trực tiếp tối đa 10 kênh vừa khám phá để chọn phát lại bằng một lần bấm.
- Electron screenshot: positron-p51213-random-history-after-1920x1080-real.png
- User action: Bấm Bất kỳ để khám phá kênh, nhấn ☷ trên thanh phát, chọn tên kênh để xem lại. Escape hoặc × đóng menu.
- Tính năng: dữ liệu chỉ trong bộ nhớ phiên; lọc kênh bị gỡ khỏi nguồn, không tăng số kênh đã khám phá và không sửa playlist/Favorites. Hỗ trợ focus bàn phím và màn 450px.
- Before: `positron-p51213-random-history-before-1920x1080-real.png`; after: `positron-p51213-random-history-after-1920x1080-real.png`.
- QA: Electron 1920×1080 mở popup, phát lại ID kênh đã khám phá, kiểm count/playlist bất biến, Escape và 450px không tràn.
- Status: CANDIDATE — chỉ công nhận sau khi Node, ảnh Electron, build/release đạt.

## P5.1.212 — Tiến tới trong lịch sử kênh ngẫu nhiên / Electron 4.23.297
- Feature priority: NEW — Ảnh P5.1.211 cho thấy nút ↶ cho phép quay về kênh khám phá trước, nhưng sau đó người xem không thể trở lại kênh vừa rời nếu không bấm Bất kỳ để lấy một kênh khác. Thêm nút tiến ↷ để điều hướng lịch sử hai chiều ngay trong thanh phát, tránh mất ngữ cảnh.
- Electron screenshot: positron-p51212-random-forward-after-1920x1080-real.png
- User action: Bấm Bất kỳ tối thiểu hai lần; bấm ↶ để quay lại, khi đó ↷ hiện ra, bấm ↷ để tiến trở lại kênh đã xem trước. Nếu khám phá kênh ngẫu nhiên mới, lịch sử tiến được xóa như hành vi điều hướng web.
- Tính năng: stack tiến riêng trong bộ nhớ phiên, tự lọc ID khi nguồn đổi, không làm thay đổi số kênh đã khám phá, không tự lưu hoặc sửa playlist. Giữ tiêu điểm bàn phím khi nút tự ẩn và hạn chế giao diện hẹp.
- Before: `positron-p51212-random-forward-before-1920x1080-real.png`; after: `positron-p51212-random-forward-after-1920x1080-real.png`.
- QA: Electron thật 1920×1080 thử hai kênh khác nhau bằng playChannel mock, Back rồi Forward trả đúng ID, số lượt giữ nguyên, không tràn ngang 450px, bản nguồn gốc bất biến.
- Status: CANDIDATE cho tới khi Node, ảnh, build/release đủ bằng chứng.


## P5.1.211 — Trở lại kênh ngẫu nhiên đã khám phá / Electron 4.23.296
- Feature priority: NEW — Sau ảnh Electron P5.1.210, thanh Bất kỳ đã có số lượt và nút làm mới nhưng chưa có thao tác quay lại khi vừa khám phá một kênh ngẫu nhiên thú vị rồi chuyển tiếp. Thêm nút quay lại theo lịch sử phiên khám phá để tiết kiệm thao tác tìm kênh và giữ ngữ cảnh.
- Electron screenshot: positron-p51211-random-back-after-1920x1080-real.png
- User action: Bấm Bất kỳ để khám phá hai kênh hoặc nhiều hơn. Nút ↶ sẽ hiện bên cạnh Bất kỳ; nhấn để mở lại kênh khám phá trước, có thể lùi nhiều bước. Làm mới lượt khám phá thì lịch sử tạm được xóa.
- Tính năng: lưu tối đa 50 ID kênh trong bộ nhớ phiên, không dùng mạng hoặc nguồn khác; bỏ ID khi danh sách nguồn thay đổi. Nút quay lại ẩn khi không còn ít nhất hai kênh trong lịch sử. Giữ điều khiển bàn phím focus khi nút tự ẩn. Không sửa Favorites/playlist hay tăng bộ đếm khi quay lại.
- Before: `positron-p51211-random-back-before-1920x1080-real.png`; after: `positron-p51211-random-back-after-1920x1080-real.png`.
- QA: Electron thật 1920×1080 chọn hai kênh khác nhau qua click, ảnh xuất hiện nút back, nhấn quay lại ID đầu tiên bằng bàn phím, kiểm bộ đếm không thay đổi, playlist bất biến, 450px không tràn ngang.
- Status: CANDIDATE chờ test/ảnh và Release xác minh.


## P5.1.210 — Tự cập nhật bộ đếm khám phá khi đổi nguồn / Electron 4.23.295
- Feature priority: NEW — Từ ảnh P5.1.209 và mã xử lý danh sách nguồn, bộ đếm Bất kỳ có thể tiếp tục ghi nhận các kênh đã xóa hoặc thay nguồn, dẫn tới tiến độ sai cho tới lúc người dùng tự bấm chuyển kênh tiếp. Bổ sung đồng bộ thông minh khi danh sách kênh được cập nhật, tránh khiến tiến độ kênh không còn tồn tại gây nhầm lẫn.
- Electron screenshot: positron-p51210-source-sync-after-1920x1080-real.png
- User action: Dùng Bất kỳ để khám phá kênh, sau đó cập nhật/xóa một nguồn IPTV trong Quản lý nguồn; khi danh sách kênh thay đổi, bộ đếm và trạng thái nút Làm mới tự điều chỉnh theo những kênh còn hợp lệ, không cần bấm Bất kỳ thêm một lần.
- Thay đổi: chỉ xóa các ID không còn hợp lệ trong tập tạm của phiên khám phá, cập nhật badge, tiến độ, aria-label và nút reset; không viết playlist, Favorites, đồng bộ hoặc ghi phát.
- Before: `positron-p51210-source-sync-before-1920x1080-real.png`; after: `positron-p51210-source-sync-after-1920x1080-real.png`.
- QA: Electron thật 1920×1080; mô phỏng thay đổi duy nhất bộ lọc đọc từ IPTVState trong fixture UI, kích hoạt native MutationObserver, xác minh bỏ ID cũ, đồng bộ badge/ARIA/reset; không sửa playlist hoặc phát thêm; kiểm tra lại viewport 450px.
- Status: CANDIDATE cho tới khi Node tests, ảnh Electron được mở, Mac/Windows build và Release xác minh.


## P5.1.209 — Tiến độ khám phá ngẫu nhiên có mẫu số / Electron 4.23.294
- Feature priority: NEW — Ảnh Electron P5.1.208 cho thấy nút Bất kỳ chỉ hiển thị số kênh đã thử trong phiên (1), không cho biết tổng số kênh đủ điều kiện. Thêm mẫu số trực tiếp để người xem biết đã khám phá bao nhiêu trong toàn bộ playlist hiện tại.
- Electron screenshot: positron-p51209-random-progress-after-1920x1080-real.png
- User action: Trên trang TV khi đã có nguồn, bấm Bất kỳ để thử một kênh; nhãn mới hiển thị số lượt đã chọn và tổng số kênh hợp lệ. Có thể bấm làm mới để bắt đầu lại, mẫu số tự ẩn khi bộ đếm bằng 0.
- Tính năng: nhãn tiến độ /tổng được cập nhật tại chỗ, chỉ đếm kênh có ID/link và không bị đánh dấu chết. Màn hẹp 450px ẩn mẫu số để giữ không gian điều khiển; giữ nguyên số đã chọn dạng badge, không thay playlist hay tự phát kênh.
- Before: `positron-p51209-random-progress-before-1920x1080-real.png`; after: `positron-p51209-random-progress-after-1920x1080-real.png`.
- QA: 1920×1080 Electron, phát thử qua nhấn nút và mock native player không tải stream, xác minh mẫu số chính xác, badge số, không sửa dữ liệu; thử lại tại 450px không tràn ngang.
- Status: CANDIDATE chờ CI, mở PNG sau, build Windows/macOS và Release xác minh.


## P5.1.208 — Giữ tiêu điểm khi làm mới khám phá ngẫu nhiên / Electron 4.23.293
- Feature priority: BLOCKER_FIX — Nút làm mới tự ẩn khi đang có tiêu điểm bàn phím khiến người dùng điều khiển từ xa mất vị trí tiếp tục thao tác chọn kênh phát; lỗi chặn trải nghiệm xem và không thể đi tiếp bằng Enter như mong đợi.
- Electron screenshot: positron-p51208-focus-return-after-1920x1080-real.png
- User action: Trong trình phát, khám phá một kênh ngẫu nhiên, dùng bàn phím Tab đến nút làm mới, nhấn Enter và tiếp tục nhấn nút Bất kỳ mà không cần tìm lại tiêu điểm.
- Thay đổi: ghi lại trạng thái focus ngay trước khi nút reset bị ẩn, chuyển focus sang Bất kỳ nếu nút còn hiện; không tự phát hoặc sửa playlist, chỉ xóa bộ đếm khám phá phiên hiện tại.
- Before: `positron-p51208-focus-return-before-1920x1080-real.png`; after: `positron-p51208-focus-return-after-1920x1080-real.png` (Electron CI phải tạo và mở xem).
- QA: Node regression cho source/focus/ảnh; Electron 1920×1080 nhấn Enter thực, kiểm nút reset ẩn, focus sang nút tiếp tục, counter về 0, kênh hiện tại/playlist giữ nguyên, kiểm 450px không tràn ngang.
- Status: CANDIDATE cho đến khi Node tests, Electron PNG đã được mở xem, Mac/Win build và GitHub Release verified.


## P5.1.198 — Hẹn giờ ghi ngày mai cùng giờ / Electron 4.23.283
- Feature priority: NEW — Ảnh Electron P5.1.197 thực tế cho thấy các nút bắt đầu nhanh chỉ có Sau 5, Sau 15, Sau 30 phút, không có cách chuyển lịch ghi sang ngày mai giữ nguyên giờ đã chọn. Bổ sung nút Ngày mai cùng giờ ở cả hai mẫu ghi hình để tiện lên lịch mà không nhập lại giờ kết thúc.
- Electron screenshot: positron-p51198-dvr-tomorrow-after-1920x1080-real.png
- User action: Mở Lịch phát sóng > Hẹn giờ ghi, đặt kênh và mốc thời gian rồi bấm Ngày mai cùng giờ để chuyển bắt đầu/kết thúc sang ngày kế tiếp, sau đó tự quyết định có Đặt lịch ghi hay không.
- Tính năng: Chọn ngày mai theo giờ máy và giữ giờ/phút bắt đầu đã nhập, giữ thời lượng nếu hợp lệ 1–480 phút, mặc định 60 phút nếu thiếu; cập nhật preview, không tự ghi, không phát và không chỉnh tên thủ công.
- Before: `positron-p51198-dvr-tomorrow-before-1920x1080-real.png`; after: `positron-p51198-dvr-tomorrow-after-1920x1080-real.png`.
- QA: xác minh giờ/phút được giữ, ngày +1, thời lượng 120 phút giữ nguyên, quick DVR vẫn có nút, không tràn ngang, không autoplay/submission hoặc sửa tên.
- Status: CANDIDATE cho đến khi CI pass, ảnh Electron thật được mở kiểm tra và release/tag/asset được xác minh.

## P5.1.197 — Sao chép lịch ghi và bỏ lặp tên kênh / Electron 4.23.282
- Feature priority: NEW — Ảnh Electron P5.1.196 thật ở 1920×1080 cho thấy dòng xem trước nhỏ, lặp kênh hai lần khi tên được tạo tự động và không thể sao chép nội dung để đối chiếu. Bổ sung nút sao chép theo yêu cầu, trạng thái thành công/thất bại và nội dung tóm tắt gọn dễ đọc.
- Electron screenshot: positron-p51197-dvr-copy-after-1920x1080-real.png
- User action: Mở Lịch phát sóng > Hẹn giờ ghi, chọn kênh, tên và giờ hợp lệ; bấm Sao chép lịch để lấy thông tin mà không tạo lịch.
- Tính năng: Nút **Sao chép lịch** chỉ khả dụng khi đủ dữ liệu hợp lệ; sử dụng quyền Clipboard của Electron nếu sẵn có, hiện phản hồi, không gửi dữ liệu đến mạng; khi tên tự sinh bắt đầu bằng tên kênh, hiển thị nguyên tên một lần. Chữ tóm tắt lớn hơn.
- QA: kiểm nút chỉ bật khi hợp lệ, bản sao chép giữ đầy đủ kênh/tên/giờ, từ chối copy dữ liệu thiếu, trả lại trạng thái sau sửa, không tự gửi lịch, không phát video, không tràn ngang.
- Before: `positron-p51197-dvr-copy-before-1920x1080-real.png`; after: `positron-p51197-dvr-copy-after-1920x1080-real.png`.
- Status: CANDIDATE cho đến khi ảnh Electron thật đã mở, CI xanh và Release được xác minh.

## P5.1.196 — Xem trước lịch ghi hình / Electron 4.23.281
- Feature priority: NEW — Ảnh Electron thật P5.1.195 cho thấy người dùng điền kênh, tên và hai mốc thời gian nhưng thiếu bước xem lại toàn bộ lịch. Thêm phần xem trước luôn cập nhật, cho phép phát hiện thời lượng sai trước khi người dùng chủ động xác nhận.
- Electron screenshot: positron-p51196-dvr-preview-after-1920x1080-real.png
- User action: Mở Lịch phát sóng > Hẹn giờ ghi, chọn kênh và nhập giờ; kiểm tra bảng Xem trước lịch ghi trước khi tự bấm Đặt lịch ghi.
- Ưu tiên thêm tính năng mới: ảnh Electron thật P5.1.195 cho thấy kênh, tên và giờ ghi đã nhập nhưng không có phần tổng hợp để kiểm lại trước khi xác nhận.
- Thêm **Xem trước lịch ghi** dưới biểu mẫu EPG, hiện kênh/tên/giờ/thời lượng địa phương; tự cập nhật theo thay đổi trong biểu mẫu, báo thiếu dữ liệu hoặc thời lượng sai/vượt 8 giờ.
- Tính năng chỉ đọc, không thay đổi kênh/playlist/tên/thời gian, không tự phát hoặc tạo lịch. Chỉ nút **Đặt lịch ghi** gốc tạo lịch.
- Before: `positron-p51196-dvr-preview-before-1920x1080-real.png`; after: `positron-p51196-dvr-preview-after-1920x1080-real.png`.
- QA: 12 kiểm tra Electron thật (hiển thị, trạng thái lỗi/thiếu, khôi phục, không phát/submit, không tràn ngang) và Node regression, 1920×1080.
- Trạng thái: CANDIDATE đến khi Actions, ảnh đã mở và Release được xác minh.

## P5.1.195 — Đặt tên bản ghi tự động theo kênh và giờ / Electron 4.23.280
- Feature priority: NEW — Ảnh P5.1.194 Electron thật cho thấy ô Tên chương trình vẫn rỗng ngay cả khi kênh và giờ ghi đã được chọn; người dùng cần gõ lại hoặc không thể lưu vì trường bắt buộc. Thêm nút gợi ý tên chính xác theo kênh/giờ, tuyệt đối không ghi đè tên tự nhập.
- Tính năng: nút “Tạo tên từ kênh và giờ” bên dưới Tên chương trình của mẫu EPG. Nhấn để điền tên kênh đã chọn và thời gian địa phương đã nhập (DD.MM.YYYY HH:mm), loại ký tự không an toàn; nếu người dùng đã nhập tên khác thì chỉ báo và giữ nguyên. Không đổi giờ, kênh, nguồn hay trạng thái ghi hình.
- Electron screenshot: positron-p51195-dvr-autoname-after-1920x1080-real.png
- Before screenshot: positron-p51195-dvr-autoname-before-1920x1080-real.png
- User action: Vào Lịch phát sóng > Hẹn giờ ghi hình, chọn kênh và giờ bắt đầu, để trống tên rồi bấm “Tạo tên từ kênh và giờ”; xem lại trước khi tự nhấn Đặt lịch ghi.
- QA: kiểm Electron 1920×1080 với nguồn QA Channel 001, ngày giờ hợp lệ; tên tự sinh gồm tên kênh và thời gian, không vượt maxlength, từ chối ghi đè tên thủ công, không submit, không phát video, không tràn ngang.
- Status: CANDIDATE đến khi Node, ảnh thật TRƯỚC/SAU đã mở, 6 job CI, Release và assets được xác minh.

## P5.1.194 — Chọn nhanh giờ bắt đầu ghi hình sau 5/15/30 phút / Electron 4.23.279
- Feature priority: NEW — Ảnh Electron P5.1.193 thực ở 1920×1080 cho thấy lịch ghi có các nút chọn thời lượng nhưng trường Bắt đầu vẫn cần nhập ngày giờ thủ công. Bổ sung chọn giờ bắt đầu từ hiện tại để giảm thao tác hẹn ghi, không gửi lịch khi chưa xác nhận.
- Tính năng: dưới giờ Bắt đầu có ba nút “Sau 5 phút”, “Sau 15 phút”, “Sau 30 phút” ở EPG và biểu mẫu ghi nhanh TV. Nhấn chỉ điền Bắt đầu dựa trên phút hiện tại, đồng thời dời Kết thúc để giữ thời lượng cũ nếu hợp lệ (1–480 phút), hoặc 60 phút khi thiếu/không hợp lệ. Tự cập nhật nhãn thời lượng và trạng thái preset P5.1.192/193.
- Electron screenshot: positron-p51194-dvr-start-after-after-1920x1080-real.png
- Before screenshot: positron-p51194-dvr-start-after-before-1920x1080-real.png
- User action: Mở Lịch phát sóng EPG hoặc ghi nhanh TV, nhấn “Sau 15 phút” bên dưới Bắt đầu, kiểm lại giờ kết thúc rồi tự chọn “Đặt lịch ghi” khi muốn tạo lịch.
- QA: Playwright trên Electron thật 1920×1080, chọn 15 phút kể từ hiện tại, bảo toàn thời lượng 120 phút, không tự submit hoặc phát, kiểm preset 120 còn active, có ba nút ở cả hai biểu mẫu và không tràn ngang.
- Status: CANDIDATE, chờ Node test, ảnh Electron TRƯỚC/SAU mở trực tiếp, CI build và release bất biến thành công.

## P5.1.193 — Nút DVR tự đánh dấu thời lượng 30/60/120 phút / Electron 4.23.278
- Feature priority: NEW — Ảnh Electron thực của P5.1.192 cho thấy thời lượng 1 giờ nhưng ba nút 30/60/120 phút có giao diện giống hệt nhau, khiến người xem khó xác định lựa chọn hiện tại khi chỉnh giờ ghi.
- Khi nhập Bắt đầu/Kết thúc, ứng dụng đánh dấu đúng nút có số phút tương ứng bằng aria-pressed và viền màu chủ đề; không có nút được chọn khi chỉnh giờ không khớp hoặc lịch sai.
- Electron screenshot: positron-p51193-dvr-selected-preset-after-1920x1080-real.png
- Before screenshot: positron-p51193-dvr-selected-preset-before-1920x1080-real.png
- User action: Từ Lịch phát sóng mở Hẹn giờ ghi hình, chọn +30, +60 hoặc +120 phút, nút tương ứng sáng lên; nhập tay thời gian khác sẽ tự làm mới trạng thái.
- QA: Electron thật 1920×1080, chọn 60 phút, sửa 65 phút rồi chọn 120 phút, kiểm End 12:20, preview hai giờ, không submit hoặc autoplay, ảnh before/after và không tràn ngang.
- Status: CANDIDATE tới khi test, soát ảnh sau, CI build và Release được xác minh.

## P5.1.192 — Thời lượng ghi hình trực tiếp và cảnh báo 8 giờ / Electron 4.23.277
- Feature priority: NEW — Ảnh Electron thật P5.1.191 cho thấy nút chọn thời lượng 30/60/120 phút đã hoạt động, nhưng form không có thông tin tổng thời lượng và chưa cảnh báo trực quan khi người dùng sửa giờ kết thúc sai. Thêm dòng kiểm tra trực tiếp cho cả EPG DVR và ghi nhanh TV mà không can thiệp luồng ghi hình.
- Hiển thị số giờ/phút ngay khi nhập thời gian; nếu kết thúc không sau bắt đầu hoặc vượt 8 giờ, báo rõ lỗi. Không tự thay đổi giờ nhập, không tự tạo lịch, không phát video, giữ xác thực DVR native.
- Electron screenshot: positron-p51192-dvr-duration-after-1920x1080-real.png
- Before screenshot: positron-p51192-dvr-duration-before-1920x1080-real.png
- User action: Mở EPG > Hẹn giờ ghi hình, nhập giờ bắt đầu/kết thúc hoặc bấm nút +30/+60/+120 phút; dòng Thời lượng ghi cập nhật tự động, báo lỗi nếu giờ kết thúc quá sớm hoặc dài hơn 8 giờ. Tương tự tại TV > Hẹn giờ ghi.
- QA: Electron thật 1920×1080, giờ 10:20–11:20 hiện 1 giờ; thử 09:20 cảnh báo sai thứ tự; thử 20:20 cảnh báo vượt 8 giờ; mẫu ghi nhanh 10:20–10:50 hiển thị 30 phút; không submit, không phát, không tràn ngang; chụp và mở ảnh TRƯỚC/SAU.
- Status: CANDIDATE cho tới khi Node tests, Electron screenshot review, CI, build và phát hành được xác minh.


## P5.1.191 — Chọn nhanh thời lượng DVR 30/60/120 phút / Electron 4.23.276
- Feature priority: NEW — Ảnh EPG Electron thật P5.1.190 ở 1920×1080 cho thấy hẹn giờ ghi hình phải nhập thủ công cả thời gian Bắt đầu và Kết thúc. Thêm nút cộng 30, 60, 120 phút dưới trường Kết thúc ở cả lịch ghi trên EPG và biểu mẫu ghi nhanh trên TV.
- Nút chỉ tính và điền giá trị Kết thúc theo thời gian Bắt đầu ở múi giờ cục bộ; kích hoạt input/change để form gốc kiểm tra. Không tự đặt lịch, không khởi chạy DVR, không sửa nguồn M3U, danh sách kênh hoặc quyền xem.
- Electron screenshot: positron-p51191-dvr-presets-after-1920x1080-real.png
- Before screenshot: positron-p51191-dvr-presets-before-1920x1080-real.png
- User action: Mở Lịch phát sóng EPG > Hẹn giờ ghi hình, chọn giờ bắt đầu rồi bấm +30 phút, +60 phút hoặc +120 phút bên dưới giờ kết thúc; sau khi xem lại chỉ bấm Đặt lịch ghi nếu muốn lưu. Biểu mẫu ghi nhanh trên TV cũng có ba nút này.
- QA: ảnh Electron 1920×1080 trước/sau với cùng form, bắt đầu 23/11/2026 10:20, bấm +60 và kiểm Kết thúc 11:20; form không submit, kênh không phát, cả hai form có 3 preset và không tràn ngang.
- Status: CANDIDATE, chờ Node, ảnh Electron sau, build và Release.


## P5.1.190 — Bấm lại tab TV để trở về khung phát / Electron 4.23.275
- Feature priority: NEW — Ảnh Electron P5.1.189 1920×1080 cho thấy đầu trình phát bị khuất khi đang ở trang TV nhưng cuộn còn sâu; thao tác chọn TV khi tab đã active không quay về vùng video vì setPage chỉ đặt lại scroll ở lần chuyển tab.
- Khi chọn lại nút TV đang active, cuộn nội dung về đầu trình phát ngay. Chỉ áp dụng cho trang TV, không chuyển kênh, không tự phát và không thay đổi các tab/thiết lập khác.
- Electron screenshot: positron-p51190-tv-reselect-after-1920x1080-real.png
- Before screenshot: positron-p51190-tv-reselect-before-1920x1080-real.png
- User action: Ở màn hình TV khi đã cuộn xuống danh sách, nhấn lại biểu tượng TV trên thanh bên; ứng dụng đưa phần trình phát lên đầu, giữ nguyên kênh đang xem và các danh sách đã lưu.
- QA: Electron thật 1920×1080 chủ động cuộn >150px, chụp trước; click nav TV đang active, kiểm tra scrollTop về 0, tab vẫn active, lựa chọn kênh giữ nguyên và không tràn ngang; chụp rồi mở ảnh sau.
- Status: CANDIDATE, chờ CI, kiểm thử ảnh, build và Release.


## P5.1.189 — Sắp xếp gợi ý Yêu thích A–Z / Z–A / theo nguồn / Electron 4.23.274
- Feature priority: NEW — Ảnh Electron thật P5.1.188 đã dàn đủ sáu cột gợi ý nhưng chỉ có tìm kiếm và lọc nhóm, chưa có cách sắp xếp các kênh chưa yêu thích khi nguồn chứa hàng trăm kênh. Thêm tùy chọn hiển thị Theo nguồn, Tên A–Z, Tên Z–A theo thứ tự tiếng Việt.
- Lựa chọn chỉ sắp xếp mảng gợi ý đã lọc trước khi phân trang; giữ nguyên thứ tự nguồn M3U, Favorites đã lưu, trạng thái kênh hiện tại và nút lưu hàng loạt, không tự phát video.
- Electron screenshot: positron-p51189-favorite-sort-after-1920x1080-real.png
- Before screenshot: positron-p51189-favorite-sort-before-1920x1080-real.png
- User action: Trong Yêu thích, dưới mục Gợi ý thêm vào Yêu thích chọn Thứ tự rồi chọn Theo nguồn, Tên A–Z hoặc Tên Z–A; danh sách chuyển ngay, trở về trang đầu và vẫn giữ nhóm, tìm kiếm, số kênh mỗi trang.
- QA: Regional với 12 kênh/trang, so sánh toàn bộ 12 nhãn thực tế với thứ tự dự kiến tính từ nguồn đang bật bằng Intl.Collator tiếng Việt ở cả ba chế độ; 20 Favorites giữ nguyên, không autoplay hoặc tràn ngang, chụp và soát ảnh Electron thật 1920×1080.
- Status: CANDIDATE cho đến khi Node, screenshot review, CI, build và GitHub Release được xác minh.


## P5.1.188 — Gợi ý Yêu thích đủ rộng trên desktop / Electron 4.23.273
- Feature priority: NEW — Thêm chế độ dàn gợi ý toàn chiều rộng desktop giúp duyệt kênh nhanh hơn, dựa trên ảnh Electron P5.1.187 thật ở 1920×1080 cho thấy phần gợi ý chỉ chiếm 1180px, để thừa vùng trống rộng bên phải, trong khi danh sách Yêu thích phía trên dùng đủ chiều ngang.
- Với desktop từ 1600px, mở rộng riêng khối gợi ý theo bề ngang vùng nội dung, tự bố trí 6 cột dễ đọc. Giữ 4 cột ở laptop, 2/1 cột ở máy hẹp; không đụng dữ liệu M3U/Favorites, phát video hoặc phân trang.
- Electron screenshot: positron-p51188-favorite-wide-after-1920x1080-real.png
- Before screenshot: positron-p51188-favorite-wide-before-1920x1080-real.png
- Ảnh P187 nguồn đã mở trực tiếp: positron-p51187-favorite-direct-page-after-1920x1080-real.png.
- User action: Mở mục Yêu thích với màn hình desktop rộng từ 1600px, khối gợi ý tự dùng chiều rộng còn trống và dàn thành sáu cột dễ xem; không cần đổi cài đặt.
- QA: panel ≥1600px, 6 cột ở 1920, 12 thẻ, 20 Favorites không đổi, không autoplay và không tràn ngang; Node regression.
- Trạng thái: CANDIDATE, chờ CI, trực tiếp xem PNG sau và xác minh EXE/DMG.


## P5.1.187 — Đi thẳng tới trang gợi ý / Electron 4.23.272
- Feature priority: NEW — Ảnh P5.1.186 hiển thị Trang 9/9 và Trước/Tiếp, nhưng chưa thể tới trang số bất kỳ khi nguồn có hàng chục hoặc hàng trăm trang.
- Thêm ô số “Đến trang” với giới hạn 1..tổng trang, nhập và nhấn Enter hoặc đổi giá trị để nhảy trực tiếp; tự kẹp số quá nhỏ/lớn, đồng bộ chỉ số và số kênh, giữ nguyên tìm kiếm/nhóm/pageSize và dữ liệu nguồn.
- Electron screenshot: positron-p51187-favorite-direct-page-after-1920x1080-real.png
- Before screenshot: positron-p51187-favorite-direct-page-before-1920x1080-real.png
- User action: Vào Yêu thích, chọn nhóm và số kênh/trang, nhập số vào Đến trang rồi nhấn Enter; số ngoài phạm vi tự chuyển về trang đầu hoặc cuối.
- QA: 100 kênh Regional / 12 = 9 trang, nhập 7 tới đúng kênh 093–104, nhập 99 về 9/9 có bốn kênh, nhập 0 về 1/9; giữ 20 Favorites, không autoplay/overflow.
- Status: CANDIDATE cho tới khi kiểm thử Electron, soi ảnh và Release EXE/DMG.

## P5.1.186 — Phân trang gợi ý Trước / Tiếp / Trang x/y / Electron 4.23.271
- Feature priority: NEW — Ảnh P5.1.185 có hàng trăm kênh gợi ý nhưng chỉ có Gợi ý khác, không biết đang ở trang nào, không quay lại trang trước và vòng lặp cũ có thể lặp kênh ở trang cuối.
- Thêm nút Trước, chỉ số Trang x/y (aria-live), giữ nút Gợi ý khác để tiến tiếp; phân trang theo các lát cắt không trùng kênh. Trang cuối đúng số còn lại, nút Lưu cả N phản ánh số hiện tại, chức năng cũ vẫn giữ và không tự phát video.
- Electron screenshot: positron-p51186-favorite-paging-after-1920x1080-real.png
- Before screenshot: positron-p51186-favorite-paging-before-1920x1080-real.png
- User action: Trong Yêu thích, chọn nhóm và số kênh, bấm Trước hoặc Gợi ý khác để chuyển trang, đọc chỉ số Trang x/y; tới trang cuối chỉ còn số kênh chưa được hiển thị.
- QA: 100 kênh Regional và 12 kênh/trang = 9 trang, trang cuối đúng 4 kênh 117–120, quay lại trang đầu và trang 2 không trùng, giữ 20 Favorites, không playback/overflow.
- Status: CANDIDATE chờ QA/ảnh thực và release Windows/Mac.

## P5.1.185 — Nhóm gợi ý truy cập nhanh có số kênh / Electron 4.23.270
- Feature priority: NEW — Ảnh Electron P5.1.184 có dropdown nhóm nhưng không biết số kênh từng nhóm trước khi chọn; duyệt 541 kênh mất thời gian.
- Thêm dải nút truy cập nhanh các nhóm nhiều kênh với đếm số lượng thực từ kênh còn gợi ý, đánh dấu nhóm đang chọn bằng aria-pressed; chọn Tất cả khôi phục. Dropdown hiện số lượng từng nhóm và tổng kênh; không can thiệp M3U, favoriteKeys hay phát video.
- Electron screenshot: positron-p51185-group-quick-after-1920x1080-real.png
- Before screenshot: positron-p51185-group-quick-before-1920x1080-real.png
- User action: Vào Yêu thích, chọn một nút nhóm nổi bật có số kênh, hoặc chọn Tất cả; bộ lọc nhóm và tìm kiếm trước đây vẫn giữ nguyên.
- QA: ghi nhận đúng 100 kênh Regional, 541 ứng viên tổng, trạng thái bấm, 12 chip thuộc Regional, reset All, không autoplay/overflow; screenshot Electron thật 1920×1080.
- Status: CANDIDATE đến khi mở soát PNG thật và Release Windows/Mac đạt.

## P5.1.184 — Lọc gợi ý Yêu thích theo nhóm / Electron 4.23.269
- Feature priority: NEW — Ảnh P5.1.183 chứng minh có 553 kênh chưa lưu nhưng gợi ý không phân loại theo nhóm; tìm bằng mắt còn rườm rà.
- Thêm dropdown nhóm được tạo trực tiếp từ metadata nguồn đang bật, chỉ lọc tên nhóm thực có kênh chưa đánh dấu sao. Kết hợp tìm kiếm không dấu và lựa chọn 6/12/24 kênh, nút Lưu cả N vẫn theo số thẻ được lọc. Tập dữ liệu nguồn và favoriteKeys giữ nguyên.
- Electron screenshot: positron-p51184-favorite-group-after-1920x1080-real.png
- Before screenshot: positron-p51184-favorite-group-before-1920x1080-real.png
- User action: Vào Yêu thích, chọn Nhóm để xem riêng kênh trong nhóm, nhập tên nếu muốn lọc tiếp; chọn Tất cả nhóm để quay lại toàn bộ gợi ý.
- QA: dropdown hiển thị nhóm thực, 12 kênh thuộc nhóm Regional, kết hợp tìm QA Channel 050, reset toàn bộ, không autoplay/overflow; screenshot Electron trước/sau 1920×1080.
- Status: CANDIDATE đến khi QA/CI và EXE/DMG Release được xác minh.

## P5.1.183 — Gợi ý Yêu thích 6/12/24 kênh / Electron 4.23.268
- Feature priority: NEW — Ảnh Electron P5.1.182 cho thấy 6 gợi ý bị bó trong card 720px trên desktop rộng 1920px, duyệt nhiều kênh mất thao tác.
- Viewer chọn 6, 12 hoặc 24 gợi ý, giữ mặc định sáu, nút Gợi ý khác nhảy đúng số đang chọn, Lưu cả N chỉ lưu kênh hiển thị sau nhấn chủ động. Tăng panel lên tối đa 1180px, 4/2/1 cột responsive.
- Không tự phát, không sửa M3U, không lưu số chọn vào dữ liệu nguồn. Có aria-label và focus-visible.
- Electron screenshot: positron-p51183-favorite-suggestions-after-1920x1080-real.png
- Before screenshot: positron-p51183-favorite-suggestions-before-1920x1080-real.png
- User action: Vào Yêu thích, chọn Số kênh 6/12/24 để duyệt nhiều gợi ý; dùng Lưu cả N kênh chỉ khi muốn đánh dấu tất cả gợi ý đang hiện.
- QA cần: 12 chip, 4 cột, 8 Favorites giữ nguyên trước lưu, batch thêm đúng 12, tổng 20, không autoplay/overflow, trả về 6.
- Status: CANDIDATE cho đến khi ảnh Electron thật đã được mở soát và Release EXE/DMG xác minh.

## P5.1.182 — Sắp xếp Yêu thích theo tên / Electron 4.23.267
- Feature priority: NEW — Từ ảnh Electron P181 nhận thấy danh sách 8 Favorites thiếu điều khiển sắp xếp, khó tìm bằng mắt ở thư viện nhiều kênh.
- Thêm select “Thứ tự ban đầu / Tên A–Z / Tên Z–A” cạnh ô tìm kiếm; Intl.Collator('vi') và CSS order, không ghi thay đổi vào favoriteKeys, M3U hay trạng thái trình phát.
- Phục hồi ngay thứ tự ban đầu và vẫn hỗ trợ lọc; aria-label, focus-visible.
- Before P181: positron-p51181-readable-favorites-after-1920x1080-real.png đã mở và soát; cần ảnh Electron P182 before/after, 8-card, sort, filter, no autoplay, no overflow.
- Electron screenshot: positron-p51182-favorites-sort-after-1920x1080-real.png
- User action: Vào Yêu thích, chọn Sắp xếp và đổi Tên A–Z hoặc Tên Z–A; chọn Thứ tự ban đầu để quay lại.
- Status: CANDIDATE cho tới khi mở và xác minh screenshot cùng Release EXE/DMG.

## P5.1.181 — Sửa lưới Yêu thích 6 cột hẹp/cắt tên / Electron 4.23.266
- Feature priority: BLOCKER_FIX — Ảnh P5.1.180 xác nhận lỗi cắt tên Yêu thích khiến người xem không nhận diện chính xác kênh trước khi bấm phát video, nguy cơ chọn sai kênh; đây là lỗi cản trở sử dụng cốt lõi.
- Visual bug confirmed from real screenshot P5.1.180: khi lưu 6 kênh một lần tổng 8 Favorites, auto-fit grid dàn thành 6 cột hẹp, tên "QA Ch..." bị ellipsis và metadata dồn 4 dòng.
- Root cause: giao diện dùng `.favorite-grid` responsive chung với `--ui-grid-min` của chế độ hiển thị hiện tại, kích thước cột quá nhỏ cho thẻ gồm logo + hai nút + tên.
- Fix: chỉ override `#page-fav #favoriteList.favorite-grid` trong Positron bằng min-width 390px/cột, giữ auto-fit; dưới 760px dùng một cột. Không sửa hệ thống grid Sources/EPG, không xóa/sửa Favorites hay trình phát.
- Input screenshot true native Electron: `positron-p51180-bulk-favorites-after-1920x1080-real.png` trong Release P5.1.180.
- Electron screenshot: positron-p51181-readable-favorites-after-1920x1080-real.png
- Before screenshot: positron-p51181-readable-favorites-before-1920x1080-real.png (Electron thật với CSS sáu cột tái hiện lỗi đã quan sát; ảnh P180 nguyên gốc vẫn được lưu riêng).
- Regression: Node + chín kiểm tra DOM Electron, gồm 8 cards, 2–4 cột ở desktop, card >=345px, tên không tràn/cắt, favorite count, gợi ý còn nguyên, không autoplay/overflow.
- Status: CANDIDATE đến khi ảnh và release EXE/DMG được xác minh.

## P5.1.180 — Lưu nhiều kênh gợi ý vào Yêu thích bằng một nhấn / Electron 4.23.265
- Feature priority: NEW — Ảnh Electron thật P5.1.179 cho thấy tìm ra kênh gợi ý dễ hơn nhưng người xem vẫn phải nhấn ☆ nhiều lần để lưu một nhóm sáu kênh. Thêm thao tác Lưu cả N kênh chỉ lưu danh sách gợi ý hiện tại khi có nhấn chủ động, không sửa playlist hoặc tự phát.
- User action: Mở Yêu thích có ít nhất một kênh → xem nhóm gợi ý hoặc lọc theo tên/nhóm → bấm Lưu cả N kênh để đánh dấu yêu thích toàn bộ danh sách N kênh đang hiển thị.
- Electron screenshot: positron-p51180-bulk-favorites-after-1920x1080-real.png
- Baseline P5.1.179 thật đã xem: `positron-p51179-search-suggestions-after-1920x1080-real.png`, tìm được một kênh QA 050 nhưng thao tác thêm vẫn là từng nút.
- Không hiện nút lưu nhiều nếu ít hơn hai kênh; chỉ xử lý metadata của những kênh đã có; kiểm tra lại trạng thái favorites trước khi toggle để tránh đảo sai, chỉ save/render một lượt, không gọi player.
- Regression: Node test và chín điều kiện QA Electron 1920×1080 trước/sau, bao gồm lưu đủ sáu, đếm 8 Favorites, giữ playlist, không autoplay, không tràn ngang.
- Trạng thái: CANDIDATE; chỉ hoàn thành sau khi Node/Electron screenshot mở bằng mắt và Windows/macOS release xác minh.

## P5.1.179 — Tìm trực tiếp trong 559 kênh gợi ý / Electron 4.23.264
- Feature priority: NEW — Ảnh Electron thật P5.1.178 cho thấy Gợi ý khác đã duyệt sáu kênh mỗi lần nhưng không có cách tìm tên hoặc nhóm khi 559 kênh chưa sao. Bổ sung bộ tìm riêng ngay trong khu vực gợi ý, hỗ trợ tiếng Việt không dấu, không ảnh hưởng bộ lọc của Favorites đã lưu.
- User action: Mở Yêu thích có ít nhất một kênh → gõ tên hoặc nhóm trong ô Tìm kênh để thêm → chọn ☆ để lưu hoặc xóa từ khóa để xem các nhóm kênh tiếp.
- Electron screenshot: positron-p51179-search-suggestions-after-1920x1080-real.png
- Baseline P5.1.178 thật đã mở: `positron-p51178-rotate-favorites-after-1920x1080-real.png` cho thấy gợi ý kênh 009–014, không có ô tìm kênh chưa sao.
- Giữ focus/caret khi nhập, trạng thái không tìm thấy có nhãn, tối đa sáu gợi ý mỗi lượt, không gọi phát video và không thay đổi playlist/Favorites khi tìm.
- Regression: Node test và chín điều kiện QA Electron thật 1920×1080 trước/sau, đảm bảo input, filter, không autoplay, không tràn ngang, giữ Favorites và dữ liệu playlist.
- Trạng thái: CANDIDATE; chỉ tính hoàn thành sau khi Node/Electron screenshots được mở soát và Release đã xác minh.

## P5.1.178 — Gợi ý khác để duyệt thêm kênh Yêu thích / Electron 4.23.263
- Feature priority: NEW — Ảnh Electron thật P5.1.176 cho thấy bảng Gợi ý thêm vào Yêu thích chỉ có sáu kênh đầu dù còn hàng trăm kênh chưa đánh sao. Thêm nút Gợi ý khác để duyệt các nhóm sáu kênh chưa sao tiếp theo mà không sửa playlist và không tự phát.
- User action: Mở trang Yêu thích có ít nhất một kênh → bấm Gợi ý khác để thấy sáu kênh tiếp theo → bấm ☆ ở kênh mong muốn để thêm vào Yêu thích.
- Electron screenshot: positron-p51178-rotate-favorites-after-1920x1080-real.png
- Baseline đã mở bằng mắt: `positron-p51176-more-favorites-after-1920x1080-real.png` với hai thẻ Favorite và sáu gợi ý; chưa có điều khiển chuyển nhóm.
- Giữ focus sau khi đổi danh sách; nút chỉ hiện nếu còn hơn sáu kênh chưa sao. Không gọi player, fetch URL, import hoặc sửa playlist.
- Regression: Node test + chín điều kiện QA Electron thật 1920×1080 trước/sau kiểm tra không tự phát, không đổi Favorites, không tràn ngang và focus.
- Trạng thái: CANDIDATE; chỉ tính hoàn thành khi Node/ảnh đã mở soát và release EXE/DMG được xác minh.

## P5.1.177 — Tìm kiếm không dấu trong Yêu thích / Electron 4.23.262
- Feature priority: NEW — Ảnh thực P5.1.176 đã có 2 thẻ yêu thích với số lượng có thể tăng liên tục; trang chưa có ô tìm riêng theo tên/nhóm. Bổ sung thanh tìm kênh trong Yêu thích, hỗ trợ tiếng Việt không dấu, case-insensitive, trả về số hiển thị X / tổng mà không thay đổi số kênh yêu thích thật.
- User action: Mở trang Yêu thích đang có nhiều thẻ → nhập một phần tên hoặc nhóm vào ô Tìm trong Yêu thích → chỉ còn thẻ phù hợp; xóa từ khóa để trở lại danh sách đầy đủ.
- Electron screenshot: positron-p51177-search-favorites-after-1920x1080-real.png
- Baseline đã mở bằng mắt: `positron-p51176-more-favorites-after-1920x1080-real.png` với QA Channel 001, 002 và 6 gợi ý còn lại.
- Lọc hiển thị bằng DOM `hidden`, không sửa playlist/favoriteKeys, không kích hoạt player, tự áp lại bộ lọc sau khi user thêm/bỏ favorite; thông báo trạng thái `aria-live=polite`.
- Regression: kiểm tra selector/normalization và 9 phép DOM QA Electron 1920×1080, ảnh trước/sau, giữ dữ liệu và không playback.
- Trạng thái: CANDIDATE tới khi Node+Electron thật xem ảnh+Release EXE/DMG thành công.

## P5.1.176 — Gợi ý thêm Yêu thích sau kênh đầu tiên / Electron 4.23.261
- Feature priority: NEW — Ảnh Electron thật P5.1.175 sau thao tác cho thấy QA Channel 001 là thẻ Yêu thích duy nhất, còn phần lớn trang trống, trong khi 560 kênh khác đã nhập. Bổ sung bảng Gợi ý thêm vào Yêu thích ở cuối danh sách khi đã có Favorites, với tối đa 6 kênh chưa đánh dấu sao; bấm ☆ lưu trực tiếp, không phát.
- User action: Mở Yêu thích đã có ít nhất một kênh → chọn ☆ tại bảng Gợi ý thêm vào Yêu thích → kênh tiếp theo xuất hiện trong danh sách ngay lập tức, cập nhật số sao.
- Electron screenshot: positron-p51176-more-favorites-after-1920x1080-real.png
- Nguồn ảnh: đã mở P5.1.175 `positron-p51175-quick-favorite-after-1920x1080-real.png`, thấy một thẻ kênh và phần trống lớn bên dưới.
- Bảng gợi ý nằm ngoài danh sách do app render nên bền khi cập nhật, tự ẩn khi Favorites trống và không hiển thị kênh đã sao; chỉ đọc metadata từ nguồn đang bật, lưu khi nhấn nút. Bố cục 3/2/1 cột theo viewport.
- Regression: test trạng thái có thẻ/trống, không gợi ý kênh đã sao, nút focus, toggle/save/render không tự phát, chụp ảnh Electron 1920x1080 trước/sau và đo 9 trạng thái.
- Trạng thái: CANDIDATE; phải xác minh Node+ảnh Electron thật mở bằng mắt+Release có EXE/DMG để tính hoàn thành.

## P5.1.175 — Thêm nhanh kênh vào Yêu thích ngay trong empty state / Electron 4.23.260
- Feature priority: NEW — Ảnh Electron thật P5.1.174 cho thấy trang Yêu thích đang trống nhưng có 561 kênh và CTA phải chuyển sang TV. Tạo cụm chọn nhanh tối đa 6 kênh đang bật, bấm ☆ bên cạnh tên kênh sẽ đánh dấu yêu thích ngay tại đây, không cần mở player. Đồng thời CTA tới TV xóa từ khóa QA Channel 011 cũ để trả lại toàn bộ 561 kênh.
- User action: Mở Yêu thích khi chưa có kênh yêu thích nhưng đã có nguồn → chọn một trong tối đa 6 nút ☆ kênh được gợi ý → kênh đó xuất hiện thành thẻ Yêu thích; có thể mở TV để chọn thêm kênh khác.
- Electron screenshot: positron-p51175-quick-favorite-after-1920x1080-real.png
- Baseline: đã mở trực tiếp ảnh Electron P5.1.174 `positron-p51174-favorite-action-before-1920x1080-real.png` (empty state) và `positron-p51174-favorite-action-after-1920x1080-real.png` (TV còn bộ lọc cũ).
- Chỉ dùng metadata các kênh có sẵn và favorites-core đã tích hợp, không thay playlist, stream, EPG hoặc kích hoạt phát tự động. Yêu thích chỉ lưu khi bấm nút; không gợi ý kênh đã thích; giao diện responsive 1–2 cột.
- Regression: kiểm tra 6 lựa chọn, hành động toggle + save/render, giữ nguyên playlist, focus, ảnh Electron 1920×1080 trước/sau + DOM assertions no autoplay.
- Trạng thái: CANDIDATE; cần Node + ảnh Electron thật mở soát + Release x64/DMG hoàn chỉnh để tính vòng.

## P5.1.174 — Yêu thích trống dẫn đúng tới TV thay vì Quản lý nguồn / Electron 4.23.259
- Feature priority: NEW — Ảnh Electron thật P5.1.173 tại trang Yêu thích cho thấy 561 kênh đã nhập nhưng danh sách chưa có sao, nút CTA vẫn ghi Quản lý nguồn IPTV; dẫn người dùng sang việc thêm nguồn không liên quan. CTA giờ đổi theo dữ liệu hiện có: có kênh → Xem kênh để đánh dấu ★ (quay về TV, focus ô tìm); không có kênh → Quản lý nguồn IPTV.
- User action: Mở Yêu thích khi đã có kênh nhưng chưa đánh dấu sao → bấm Xem kênh để đánh dấu ★ → tự đến TV và focus tìm kênh; việc đánh dấu sao vẫn do người dùng thực hiện.
- Electron screenshot: positron-p51174-favorite-action-after-1920x1080-real.png
- Baseline thật đã mở: `positron-p51173-desktop-1920x1080-yeu-thich-real.png` hiện nút Quản lý nguồn IPTV dù có 561 kênh.
- Không sửa danh sách kênh, Favorites lưu trữ, URL stream hoặc phát tự động. Duy trì nhánh fallback tới Sources khi chưa có nguồn; mở rộng bài test P5.1.9 thay vì bỏ assert.
- Kiểm thử mới: Node regression hai nhánh, ảnh Electron 1920×1080 trước/sau, xác minh trang TV, focus, danh sách hiển thị, không autoplay/không thay đổi nguồn.
- Trạng thái: CANDIDATE — phải xác minh Node + ảnh Electron thật + Release installers trước khi tính vòng.

## P5.1.173 — Quay lại đúng vị trí kiểm kê sau khi tìm kênh / Electron 4.23.258
- Feature priority: NEW — Ảnh Electron P5.1.172 cho thấy bấm Tìm sẽ đưa đúng một kênh lên TV nhưng người dùng phải tìm lại vị trí kiểm kê; bổ sung nút ↩ Kiểm kê · trang N xuất hiện cạnh ô tìm TV chỉ sau thao tác định vị, quay về đúng trang kênh thiếu logo đang xử lý mà không mất bộ lọc.
- User action: Từ Thư viện → Kênh thiếu logo → sang trang 2 → bấm Tìm một kênh → chọn ↩ Kiểm kê · trang 2 ngay dưới ô tìm để quay lại đúng trang thứ hai và tiếp tục rà soát.
- Electron screenshot: positron-p51173-return-inspection-after-1920x1080-real.png
- Baseline thực đã mở: `positron-p51172-locate-channel-after-1920x1080-real.png` của P5.1.172, danh sách TV đã lọc chỉ 1 kênh; nút quay lại chưa có.
- Chỉ thêm trạng thái phiên giao diện, không đọc/ghi URL stream, không đổi Favorites, M3U, EPG hay playback; nút ẩn khi không sử dụng.
- Chứng cứ cần: unit kiểm tra phiên trang/hidden/focus, Electron 1920×1080 ảnh before/after, 10 kiểm tra đóng/mở, số trang/range, no-autoplay, no-mutation.
- Trạng thái: CANDIDATE, phải có Node + ảnh Electron đã nhìn + Release asset thật trước khi tính vòng.

## P5.1.172 — Tìm đúng kênh thiếu logo trong danh sách TV / Electron 4.23.257
- Feature priority: NEW — Ảnh Electron thật P5.1.171 cho thấy trang kiểm kê hiển thị kênh 11–20 trong khi danh sách TV bên trái còn kênh 1–10, thiếu cầu nối tìm đúng kênh để người dùng sửa hoặc xem thông tin. Thêm nút Tìm cho mỗi hàng, đặt ô tìm trong TV theo đúng tên kênh và mở bộ lọc Tất cả.
- User action: Mở Thư viện → Kênh thiếu logo → chuyển tới trang cần kiểm tra → bấm Tìm cạnh kênh muốn định vị; panel đóng, tab TV hiện danh sách đã lọc theo tên, chỉ phát khi người dùng chủ động bấm kênh.
- Electron screenshot: positron-p51172-locate-channel-after-1920x1080-real.png
- Nguồn quyết định: đã mở ảnh thật P5.1.171 `positron-p51171-visible-range-after-1920x1080-real.png` thấy bảng kiểm kê và danh sách kênh chính chưa liên thông. Không tự phát, không thay playlist hoặc URL, không gọi mạng.
- Kiểm thử mới: Node regression giữ nguyên textContent/aria-label/nút có focus, Electron 1920×1080 trước/sau và 10 phép đo trạng thái TV, bộ lọc, tên, focus, không autoplay, không đụng nguồn.
- Trạng thái: CANDIDATE — chỉ tính hoàn thành khi Node + Electron screenshot thật xem bằng mắt + GitHub Release x64/DMG đạt.

## P5.1.171 — Phạm vi kênh thực đang xem / Electron 4.23.256
- Electron screenshot: positron-p51171-visible-range-after-1920x1080-real.png
- User action: Mở Thư viện → Kênh thiếu logo → chuyển trang hoặc đổi số kênh/trang; quan sát dòng Đang xem X–Y / tổng kênh ngay dưới thanh phân trang.
- Feature priority: NEW — Ảnh thật P5.1.170 cho thấy Trang 1 / 57 nhưng không nêu đang xem kênh số mấy trong 561 kênh. Thêm nhãn Đang xem 1–10 / 561 kênh, cập nhật theo bộ lọc, phân trang 10/25/50; danh sách rỗng có thông báo rõ.
- Baseline: ảnh Electron `positron-p51170-clear-filters-after-1920x1080-real.png` từ Actions 44986538072, đã trực tiếp mở xem.
- Không thay đổi playlist, URL, EPG, Cast, PiP và hành vi playback. Dùng trạng thái `aria-live=polite` cho công cụ đọc màn hình.
- Chứng cứ yêu cầu: Node unit test trang đầu/sau/cuối/rỗng; Electron screenshot `positron-p51171-visible-range-before-1920x1080-real.png` / `positron-p51171-visible-range-after-1920x1080-real.png`; kiểm tra geometry, HTML, không autoplay, dữ liệu nguồn.
- Trạng thái: CANDIDATE cho tới khi CI, mở ảnh sau và Release x64/DMG xác minh thành công.

## P5.1.170 — Xóa nhanh toàn bộ bộ lọc Thư viện / Electron 4.23.255
- Feature priority: NEW — Cho phép đưa năm điều kiện tìm kiếm, nhóm, EPG, thứ tự và mật độ phân trang về mặc định chỉ với một lần bấm, thay vì hoàn nguyên từng ô khi kiểm kê danh sách nhiều kênh.
- User action: Mở Thư viện → Kênh thiếu logo → thay đổi ít nhất một bộ lọc → bấm nút Xóa bộ lọc cạnh Xuất CSV để trở về tất cả kênh, thứ tự playlist, 10 kênh/trang.
- Electron screenshot: positron-p51170-clear-filters-after-1920x1080-real.png
- Ảnh TRƯỚC/SAU Electron thực 1920×1080: positron-p51170-clear-filters-before-1920x1080-real.png / positron-p51170-clear-filters-after-1920x1080-real.png. Ảnh P5.1.169 đã được trực tiếp mở làm nền, nhận thấy thiếu thao tác reset nhanh.
- Chỉ thay đổi DOM state cục bộ, không sửa playlist, không xóa cấu hình, không phát video hay gọi mạng. Nút chỉ xuất hiện khi có điều kiện lọc khác mặc định; sau khi bấm đưa focus về ô tìm kiếm.
- Kiểm thử: Node regression 5 giá trị mặc định/focus/không có delete/play; Electron QA áp dụng tìm kiếm + EPG + sort + page size, chụp trước, bấm reset, soát ảnh, kiểm chứng 13 điều kiện và dữ liệu playlist không đổi.
- Trạng thái: CANDIDATE; chỉ tính vòng sau khi Node, ảnh Electron và Release thực sự đã xác minh.

## P5.1.169 — Lọc kênh thiếu logo theo mã EPG / Electron 4.23.254
- Feature priority: NEW — Cho phép phát hiện kênh vừa thiếu logo vừa thiếu mã nhận diện EPG hoặc có EPG nhưng thiếu logo, hỗ trợ người dùng tự ưu tiên sửa metadata thư viện lớn mà không thay đổi playlist.
- User action: Mở Thư viện → Kênh thiếu logo → chọn Mọi tình trạng EPG, Thiếu cả mã EPG hoặc Đã có mã EPG; kết hợp tìm kiếm, lọc nhóm, sắp xếp, phân trang và xuất CSV theo đúng tập đã lọc.
- Electron screenshot: positron-p51169-epg-filter-after-1920x1080-real.png
- Ảnh Electron thật 1920×1080 trước/sau: positron-p51169-epg-filter-before-1920x1080-real.png / positron-p51169-epg-filter-after-1920x1080-real.png. Đầu vào quyết định: P5.1.168 ảnh Thư viện thật đã mở soát, chức năng mới đặt gần bộ lọc sẵn có và bảo toàn thanh phân trang.
- Logic cục bộ: lọc tvgId trong metadata hiện có, không gọi mạng, không sửa stream URL, không phát kênh, không xóa playlist; CSV chỉ chứa tên/nhóm và tôn trọng lọc EPG.
- Kiểm thử: Node fixture kênh có/không có tvgId và logo, combo nhóm/tìm kiếm, CSV an toàn; Electron QA xác minh chọn bộ lọc, đếm hàng, hiển thị trạng thái rỗng, điều hướng phân trang, dữ liệu không rò URL; ảnh trước/sau 16:9.
- Trạng thái: CANDIDATE — chỉ tính vòng sau khi Node, Electron screenshot review và GitHub Release đủ EXE/DMG thành công.

## P5.1.168 — Thanh phân trang kênh thiếu logo luôn dễ thao tác / Electron 4.23.253
- Feature priority: BLOCKER_FIX — Thanh điều hướng phân trang dữ liệu thư viện bị che khỏi vùng nhìn khiến người dùng không mở được những trang kênh còn lại khi danh sách lớn; đưa nút lên trên vùng cuộn giúp truy cập đầy đủ.
- Electron screenshot: positron-p51168-pager-visible-after-1920x1080-real.png
- Ảnh TRƯỚC THAO TÁC (Electron P168): positron-p51168-pager-before-1920x1080-real.png; ảnh TRƯỚC SỬA mã là P5.1.167 đã kiểm chứng trên release cũ.
- Ảnh INPUT thực tế P5.1.167: `positron-p51167-missing-page-size-after-1920x1080-real.png` có nhóm Trước / Trang / Đến / Tiếp chỉ lộ một phần ở mép dưới bảng Thư viện khi danh sách dài.
- Nguyên nhân trong mã: đặt thanh phân trang sau `#poLibraryMissingRows` trong panel có max-height và scroll.
- Sửa thực chất: chuyển điều hướng lên TRƯỚC danh sách, tách rõ bằng đường viền nhẹ; giữ scroll danh sách, tìm kiếm, lọc, sắp xếp, số hàng 10/25/50 và xuất CSV.
- Test: Node regression thứ tự phần tử; Electron CDP xác minh thanh nằm trọn trong panel và trên danh sách, nút Tiếp hit-test được, bấm Tiếp / Trước chạy đúng, 1920×1080 PNG.
- Ảnh AFTER từ Electron cần kiểm chứng qua Actions: `positron-p51168-pager-visible-after-1920x1080-real.png`.
- Trạng thái: CANDIDATE; không tính vòng đạt cho đến khi xem ảnh thật, test và Release/tag bất biến đều thành công.

## P5.1.167 — Thay đổi số kênh thiếu logo mỗi trang / Electron 4.23.252
- Feature priority: NEW — Duyệt 10, 25 hoặc 50 kênh thiếu logo mỗi trang; thao tác nhanh với thư viện lớn (ảnh gốc có 432 kênh thiếu logo), không cần nhấn Tiếp hàng chục lần.
- User action: Thư viện → Kênh thiếu logo → chọn 10 / 25 / 50 kênh/trang; bộ lọc, tìm kiếm, nhảy trang và xuất CSV vẫn bảo toàn giá trị, tự tính lại số trang, quay về trang 1 sau đổi mật độ.
- Electron screenshot: positron-p51167-missing-page-size-after-1920x1080-real.png
- Ảnh thật trước/sau 1920×1080: positron-p51167-missing-page-size-before-1920x1080-real.png / positron-p51167-missing-page-size-after-1920x1080-real.png.
- Test fixture 57 kênh kiểm tra số hàng 10/25/50, trang cuối, đi tới trang, CSV toàn bộ, không sửa dữ liệu playlist, không thử stream thật.
- Status: CANDIDATE — chờ 810+ test, Electron screenshot review, build Windows x64/macOS và Release.

## P5.1.166 — Lọc tên kênh trùng theo nguồn và Xóa lọc / Electron 4.23.251
- Feature priority: NEW — Thêm bộ lọc tên kênh trùng giữa nhiều nguồn, trong một nguồn hoặc thiếu mã nguồn, giúp rà soát metadata nhanh và tránh nhầm kênh khi trùng tên giữa nhiều playlist.
- User action: Mở Thư viện → Tên kênh trùng → chọn chế độ lọc nguồn; khi ô tìm kiếm còn từ khóa cũ bấm Xóa lọc để hiện danh sách đầy đủ, không cần xóa từng ký tự. Xuất CSV vẫn tôn trọng bộ lọc nguồn.
- Electron screenshot: positron-p51166-duplicate-scope-after-1920x1080-real.png
- Ảnh thật trước/sau (1920×1080): positron-p51166-duplicate-scope-before-1920x1080-real.png / positron-p51166-duplicate-scope-after-1920x1080-real.png.
- Core filtering hoàn toàn local/read-only; không xuất URL stream hoặc sourceId, không thay đổi M3U hoặc tự động phát; regression theo 4 chế độ nguồn.
- Status: CANDIDATE — chưa phát hành tới khi Node, Electron screenshot review, build và Release đạt.

## P5.1.165 — Xuất CSV tên kênh trùng / Electron 4.23.250
- Feature priority: NEW — Xuất bảng metadata có thể đối chiếu toàn bộ tên kênh trùng theo bộ lọc, giúp rà soát hàng trăm kênh mà không phải sửa playlist hoặc mở từng trang.
- User action: Thư viện → Tên kênh trùng → tìm tên hoặc nhóm → Xuất CSV; ghi toàn bộ kết quả được lọc vào file tải về.
- CSV gồm tên, số kênh, số nhóm, số nguồn và nhóm; UTF-8 BOM, chống công thức Excel; không xuất URL stream hay ID nguồn, không truy cập mạng và không thay đổi playlist.
- Electron screenshot: positron-p51165-duplicate-csv-after-1920x1080-real.png
- Ảnh Electron 16:9: positron-p51165-duplicate-csv-before-1920x1080-real.png / positron-p51165-duplicate-csv-after-1920x1080-real.png.
- Regression và UI QA với dữ liệu metadata mẫu; không xem là kiểm chứng playback. 
- Status: CANDIDATE — chờ Actions, soát ảnh và xác minh Release.

## P5.1.164 — Phát hiện tên kênh trùng trong thư viện / Electron 4.23.249
- Feature priority: NEW — Phát hiện các tên kênh bị nhập lặp trong playlist hoặc nhiều nguồn để rà soát thư viện lớn; phân biệt tên khác dấu tiếng Việt, không tự xóa kênh.
- User action: Mở Thư viện → Tên kênh trùng → mở danh sách, tìm theo tên hoặc nhóm, xem số kênh, số nhóm và số nguồn có tên trùng; dùng Trước/Tiếp để xem những trang còn lại.
- Electron screenshot: positron-p51164-duplicates-after-1920x1080-real.png
- Before: positron-p51164-duplicates-before-1920x1080-real.png; After: positron-p51164-duplicates-after-1920x1080-real.png, ảnh Electron thực 1920×1080.
- Dữ liệu chỉ đọc; chuẩn hóa khoảng trắng, NFC, chữ hoa/thường nhưng giữ dấu; không truy xuất/hiển thị URL, không nhập mạng, không xóa playlist, không tự phát video.
- Regression: Unit fixture đa nguồn, tiếng Việt, nhóm, tìm kiếm, phân trang, không rò URL; Electron UI 16:9 có trạng thái rỗng và ảnh trước/sau.
- Status: PUBLISHED_AND_VERIFIED — 806 Node tests (801 pass, 5 skipped, 0 fail), Electron QA 9/9 + tìm kiếm, 6/6 Actions, 16 Release assets; https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.249-p5.1.164

## P5.1.163 — Xuất CSV kênh thiếu logo an toàn / Electron 4.23.248
- Feature priority: NEW — Thư viện → Kênh thiếu logo → lọc/tìm/sắp xếp → **Xuất CSV** tất cả kênh khớp, không chỉ 10 hàng hiện tại.
- User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm, tìm hoặc sắp xếp → bấm Xuất CSV, nhận file tên và nhóm kênh trong thư mục Tải xuống.
- Electron screenshot: positron-p51163-csv-after-1920x1080-real.png
- CSV UTF-8 BOM tương thích Excel, chỉ Tên kênh/Nhóm; không chứa URL stream, M3U, EPG, tài khoản hay thông tin nguồn. Không gọi mạng hoặc phát video.
- Chống CSV formula injection, dấu nháy và xuống dòng; thứ tự playlist gốc không đổi.
- Node regression: >50 hàng, lọc, sắp xếp, thoát công thức. Electron UI 1920×1080 before/after, kiểm tra tạo Blob; không giả nhận đã thử Save As của hệ điều hành.
- Ảnh trước: positron-p51163-csv-before-1920x1080-real.png; sau: positron-p51163-csv-after-1920x1080-real.png.
- Trạng thái PUBLISHED_AND_VERIFIED — 804 Node tests (799 pass, 5 skipped, 0 fail), Electron QA CSV 10/10, 6/6 Actions, 16 Release assets; https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.248-p5.1.163

## P5.1.162 — Chuyển nhanh tới trang bất kỳ trong thư viện / Electron 4.23.247
- Feature priority: NEW — Nhập trực tiếp trang muốn xem ở bảng kênh thiếu logo thay vì bấm nút Tiếp liên tục khi thư viện có hàng chục trang; tự giới hạn trong khoảng trang hợp lệ, tránh mất vị trí.
- User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm hoặc tìm kiếm → nhập số trang trong ô cạnh nút Trước/Tiếp rồi nhấn Enter hoặc nút Đến để chuyển ngay.
- Electron screenshot: positron-p51162-jump-page-after-1920x1080-real.png
- Before: positron-p51162-jump-page-before-1920x1080-real.png; After: positron-p51162-jump-page-after-1920x1080-real.png, chụp từ Electron thật 1920×1080.
- Logic: số trang không hợp lệ sẽ giữ vị trí; số ngoài giới hạn được chặn ở trang đầu/cuối, không thay đổi thứ tự playlist, URL stream, EPG, Favorites hay playback.
- Status: CANDIDATE — cần Node tests, chụp/soát ảnh Electron, build Windows/macOS, xác minh Release bất biến.

## P5.1.161 — Sắp xếp kênh thiếu logo A–Z/Z–A / Electron 4.23.246
- Feature priority: NEW — Hỗ trợ sắp xếp những kênh thiếu logo theo tên tăng/giảm với so sánh số tự nhiên, để nhanh chóng phát hiện và rà soát các kênh có tên tương tự trong thư viện lớn.
- User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm tùy ý → chọn Thứ tự playlist, Tên kênh A–Z hoặc Tên kênh Z–A để sắp xếp riêng danh sách trên màn hình.
- Electron screenshot: positron-p51161-sort-missing-after-1920x1080-real.png
- Before: positron-p51161-sort-missing-before-1920x1080-real.png; After: positron-p51161-sort-missing-after-1920x1080-real.png, phải chụp và kiểm tra thật 1920×1080.
- Duy trì thứ tự playlist như mặc định; sắp xếp danh sách lọc sao chép chỉ trong bộ nhớ, không sửa M3U, URL stream, EPG, Favorites hoặc phát video.
- Status: CANDIDATE — cần Node tests, chụp/soát ảnh Electron, build Windows/macOS, chứng thực Release.

## P5.1.160.1 — Hoàn thiện lọc nhóm và minh chứng Electron / 4.23.245
- Feature priority: BLOCKER_FIX — Sửa lỗi kiểm chứng CI khi bộ lọc nhóm đang hoạt động nhưng ảnh Electron sau thao tác không cho thấy điều khiển, bảo đảm hình ảnh đại diện đúng giao diện được phát hành.
- Electron screenshot: positron-p511601-group-filter-after-1920x1080-real.png
- Before: positron-p511601-group-filter-before-1920x1080-real.png; After: positron-p511601-group-filter-after-1920x1080-real.png, từ Electron thật 1920×1080.
- UX: cuộn đúng vị trí bộ lọc thiếu logo, giữ tiêu đề Thư viện và che nội dung cuộn phía trên tiêu đề.
- Giữ nguyên release/tag P5.1.160, xuất bản bản vá P5.1.160.1 với SemVer 4.23.245 và tag mới, không force-push, không sửa M3U/URL người dùng.
- Status: CANDIDATE — cần test, chụp/mở ảnh, build và xác minh phát hành độc lập.

## P5.1.160 — Lọc kênh thiếu logo theo nhóm / Electron 4.23.244
- Feature priority: NEW — Thêm lựa chọn nhóm riêng trong danh sách kênh thiếu logo, hiển thị số kênh từng nhóm và kết hợp tìm theo tên không dấu, giảm thao tác với thư viện hàng trăm kênh.
- User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm trong ô “Tất cả nhóm thiếu logo”; có thể nhập tiếp tên kênh để tìm trong riêng nhóm đã chọn.
- Electron screenshot: positron-p51160-group-filter-after-1920x1080-real.png
- Before: positron-p51160-group-filter-before-1920x1080-real.png; After: positron-p51160-group-filter-after-1920x1080-real.png, ảnh Electron thật 16:9 phải được mở soát trước khi công nhận.
- Sửa UX phát hiện từ ảnh P159: header bảng Thư viện giữ hiển thị khi cuộn, mở bảng về đầu trang.
- Chỉ đọc metadata tên, nhóm và trạng thái URL logo; không động tới URL stream, playlist, EPG, playback hoặc dữ liệu người dùng.
- Status: CANDIDATE — chờ Node tests, Electron screenshot review và xác minh Release hoặc build artifact.

## P5.1.159 — Tìm kiếm kênh thiếu logo / Electron 4.23.243
- Feature priority: NEW — Thêm tìm kiếm kênh chưa có logo theo tên hoặc nhóm, hỗ trợ tiếng Việt không dấu để người dùng không phải duyệt từng trang trong playlist lớn.
- User action: Mở Thư viện → Kênh thiếu logo → nhập tên hoặc nhóm; danh sách cập nhật ngay và xoá tìm kiếm để xem lại tất cả.
- Electron screenshot: positron-p51159-search-missing-after-1920x1080-real.png
- Before: positron-p51159-search-missing-before-1920x1080-real.png; After: positron-p51159-search-missing-after-1920x1080-real.png (phải thực sự mở kiểm tra).
- Không truy cập mạng, URL stream, playback hoặc thay đổi M3U/Favorites. Có test logic, không dấu, pagination và ảnh 16:9.
- Status: CANDIDATE, chỉ hoàn thành khi Node/CI, ảnh Electron và phát hành/artifact được xác minh.

## P5.1.158 — Chẩn đoán kênh thiếu logo / Electron 4.23.242
- Feature priority: NEW — Từ tỷ lệ logo 0/561 nhìn thấy trên ảnh Electron P5.1.157, bổ sung danh sách các kênh chưa có URL logo, chia trang 10 kênh để người dùng xác định metadata thiếu.
- User action: Thư viện → Kênh thiếu logo → Trước / Tiếp; hiển thị tên và nhóm từ playlist đã nhập, không tự quét mạng và không bổ sung logo giả.
- Electron screenshot: positron-p51158-missing-logos-after-1920x1080-real.png
- Before: positron-p51158-missing-logos-before-1920x1080-real.png
- After: positron-p51158-missing-logos-after-1920x1080-real.png (chỉ công nhận khi chụp và trực tiếp xem ảnh Electron thật).
- Logic: hàm thuần missingLogos() trả total, offset, limit, rows không lộ URL stream; có regression cho danh sách rỗng, phân trang, bất biến playlist.
- Status: CANDIDATE, chờ CI/UI và việc xác minh installer/Release.

## P5.1.157 — Phân bố kênh theo nhóm / Electron v4.23.241
- Feature priority: NEW — Thêm danh sách nhóm kênh với số lượng và thanh tỷ lệ ngay trong Bản đồ thư viện; có thể mở thêm từng 5 nhóm mà không cần tải nguồn mới hoặc thử phát.
- User action: Bấm Thư viện, xem Phân bố kênh theo nhóm; nhấn Xem thêm 5 nhóm để đọc tiếp, chọn Thu gọn danh sách khi đã xem hết.
- Electron screenshot: positron-p51157-groups-after-1920x1080-real.png
- Before: positron-p51157-groups-before-1920x1080-real.png; After: positron-p51157-groups-after-1920x1080-real.png.
- Quyền riêng tư: dữ liệu cục bộ, tên nhóm qua textContent, không tải mạng, không thay đổi playlist, Favorites hoặc phát video.
- Trạng thái: CANDIDATE cho tới khi CI, ảnh Electron thật mở soát, release và bộ cài xác minh.

## P5.1.156 — Bản đồ thư viện kênh ngoại tuyến / Electron v4.23.240
- Feature priority: NEW — Thêm bảng Library Pulse riêng trong thanh trên: đếm số kênh, số nguồn, số nhóm, trạng thái khả dụng đã được lưu, URL logo và mã EPG của dữ liệu hiện có.
- User action: Chọn Thư viện, xem các thẻ thống kê và thanh mức độ hoàn thiện metadata; nhấn Cập nhật để đọc lại dữ liệu hiện hành hoặc Escape để đóng.
- Electron screenshot: positron-p51156-library-pulse-after-1920x1080-real.png
- Before: positron-p51156-library-pulse-before-1920x1080-real.png; After: positron-p51156-library-pulse-after-1920x1080-real.png.
- Bảo vệ: phân tích tại máy, không tải nguồn mới, không phát IPTV, không kiểm tra mạng hoặc suy đoán EPG/khả năng phát hiện tại; label chỉ phản ánh metadata đã lưu.
- Trạng thái ban đầu: CANDIDATE tới khi QA/CI/release được xác minh.

## P5.1.155 — Dọn banner nổi, giữ nhật ký / Electron v4.23.239
- Feature priority: NEW — Thêm thao tác Dọn banner để người dùng đóng nhanh toàn bộ banner đang che trình phát, không phải chạm từng toast và không làm mất dòng nhật ký đã ghi.
- User action: Mở Thông báo và bấm Dọn banner; các banner thành công/cảnh báo/lỗi đang nổi biến mất theo thao tác chủ động, nhưng nội dung và số mục trong Nhật ký giữ nguyên.
- Electron screenshot: positron-p51155-dismiss-toasts-after-1920x1080-real.png
- Before: positron-p51155-dismiss-toasts-before-1920x1080-real.png; After: positron-p51155-dismiss-toasts-after-1920x1080-real.png.
- Bảo vệ: không phát kênh, không sửa M3U, Favorites hoặc cấu hình, và không can thiệp thông báo mới sau thao tác.
- CI: chuyển nhóm concurrency sang SHA từng commit để không chặn các bản nâng cấp khác; Release bị HTTP 403 sẽ được báo lỗi rõ và lưu EXE/DMG vào artifact fallback, không nhận là đã phát hành.
- Trạng thái ban đầu: CANDIDATE cho tới khi QA ảnh Electron, CI và Release được xác minh.

## P5.1.154 — Chế độ Không làm phiền khi xem TV / Electron v4.23.238
- Feature priority: NEW — Bổ sung công tắc Ẩn xác nhận nổi để giảm banner che nội dung video, nhưng vẫn ghi toàn bộ sự kiện vào nhật ký phiên và luôn giữ banner cảnh báo/lỗi quan trọng.
- User action: Mở Thông báo, bấm Ẩn xác nhận nổi: Bật; các thông báo thành công mới không che màn hình nhưng vẫn xem được trong Nhật ký. Bấm lại để tắt chế độ.
- Electron screenshot: positron-p51154-quiet-mode-after-1920x1080-real.png
- Before: positron-p51154-quiet-mode-before-1920x1080-real.png; After: positron-p51154-quiet-mode-after-1920x1080-real.png. Soát ảnh Electron thật khi QA chạy xong.
- Bảo vệ: không ẩn cảnh báo/lỗi, không đổi thời gian tự biến mất, không ghi dữ liệu xuống đĩa hoặc ảnh hưởng phát kênh.
- Trạng thái ban đầu: CANDIDATE cho tới khi CI/QA/Release được xác minh.

## P5.1.153 — Tìm trong nhật ký thông báo bằng từ khóa không dấu / Electron v4.23.237
- Feature priority: NEW — Cho phép tìm kiếm nội dung thông báo ngay trong nhật ký 30 mục theo từ khóa tiếng Việt có hoặc không có dấu, kết hợp bộ lọc loại thông báo mà không xóa dữ liệu.
- User action: Mở Thông báo, nhập từ khóa trong ô Tìm trong thông báo; có thể gõ ket noi để tìm kết nối, hoặc nhấn Xóa tìm kiếm để khôi phục danh sách.
- Electron screenshot: positron-p51153-notice-search-after-1920x1080-real.png
- Before: positron-p51153-notice-search-before-1920x1080-real.png; After: positron-p51153-notice-search-after-1920x1080-real.png. Ảnh chỉ được xác minh sau khi mở Electron thật.
- Riêng tư: tìm cục bộ trong RAM, không gọi mạng, không tự phát hay thay đổi M3U; tự xóa lịch sử khi đóng ứng dụng.
- Trạng thái ban đầu: CANDIDATE tới khi QA ảnh Electron, CI và Release xác minh.

## P5.1.152 — Lọc nhật ký theo loại thông báo / Electron v4.23.236
- Feature priority: NEW — Cho phép tìm nhanh cảnh báo, lỗi và xác nhận thành công trong nhật ký tối đa 30 mục bằng bộ lọc không phá hủy, phù hợp khi phải kiểm tra nhiều thông báo.
- User action: Mở Thông báo ở thanh trên, bấm Cảnh báo / Lỗi / Hoàn thành để chỉ xem loại tương ứng; chọn Tất cả để khôi phục toàn bộ danh sách.
- Electron screenshot: positron-p51152-alert-filter-after-1920x1080-real.png
- Before: positron-p51152-alert-filter-before-1920x1080-real.png; After: positron-p51152-alert-filter-after-1920x1080-real.png (phải mở ảnh Electron thật để xác minh).
- Dữ liệu: không xóa thông báo khi lọc, không thay đổi M3U/EPG/nhắc lịch, không phát video, không truy cập mạng.
- Trạng thái ban đầu: CANDIDATE cho tới khi QA screenshot, CI và installer Release xác minh.

## P5.1.151 — Nhật ký thông báo của phiên chạy / Electron v4.23.235
- Feature priority: NEW — Thêm nhật ký tối đa 30 thông báo thành công, cảnh báo và lỗi trong phiên để có thể xem lại sau khi thông báo nổi tự hết hạn mà không lưu dữ liệu riêng xuống đĩa.
- User action: Bấm Thông báo trên thanh trên để xem nội dung và thời điểm thông báo; chọn Xóa lịch sử hoặc Đóng/Escape. Lịch sử tự xóa khi thoát ứng dụng.
- Electron screenshot: positron-p51151-notification-archive-after-1920x1080-real.png
- Before: positron-p51151-notification-archive-before-1920x1080-real.png; After: positron-p51151-notification-archive-after-1920x1080-real.png. Chỉ xác minh ảnh sau khi mở PNG Electron thật.
- Bảo vệ: giới hạn 30 mục trong RAM, phân biệt cảnh báo và lỗi, không truy cập playlist, không gọi mạng hay tự phát kênh.
- Trạng thái: CANDIDATE cho đến khi CI và Release cùng bộ cài xác minh.

## P5.1.150 — Trung tâm thông báo gọn, xem lại thông báo khi cần / Electron v4.23.234

- Feature priority: NEW — Thêm nút "Xem thêm N thông báo" cho các xác nhận thành công còn hiệu lực, mặc định thu gọn chỉ hiện thông báo mới nhất. Bấm để mở lại rồi bấm thu gọn. Cảnh báo và lỗi không bị ẩn, người dùng vẫn có thể đóng từng thông báo, và bộ hẹn tự tắt 5,5 giây không thay đổi. Không ghi thông báo lên đĩa và không sửa playlist/player.
- Baseline screenshot đã MỞ trực tiếp: `positron-p51149-desktop-1920x1080-trang-chu-real.png` từ CI P5.1.149. Bảy banner xanh chắn khu vực Yêu thích/Xem gần đây trên desktop 1920×1080.
- User action: Khi thao tác nhiều, chỉ một thông báo thành công mới nhất và một nút Xem thêm xuất hiện; bấm Xem thêm để đọc lại những thông báo vẫn còn trên màn hình, bấm Thu gọn để giải phóng không gian.
- Electron screenshot: positron-p51150-toast-centre-after-1920x1080-real.png
- Before (bộ thử mở rộng, tái hiện 7 banner): `positron-p51150-toast-centre-before-1920x1080-real.png`. After (chỉ hiện 1 thông báo): `positron-p51150-toast-centre-after-1920x1080-real.png`. Bản P5.1.149 có ảnh desktop thật cho tình trạng trước khi sửa. Có thêm ảnh collapsed/expanded để kiểm tra trạng thái tương tác.
- QA: tạo 7 sự kiện thông báo thành công thật trong ứng dụng và một cảnh báo; xác minh 1/7 thành công hiển thị khi thu gọn, 7/7 khi mở, cảnh báo vẫn hiển thị, không tràn ngang, không phát kênh, không sửa playlist; Node + native Electron + kiểm tra ảnh.
- Trạng thái: ĐÃ XÁC MINH — Actions `44965060471` 6/6 thành công; 780 Node tests (775 pass, 5 skipped, 0 fail); Electron 1920×1080 và 10/10 native toast QA pass, hai ảnh trước/sau đã mở; release bất biến `positron/v4.23.234-p5.1.150` và EXE/DMG/SHA256SUMS đã xác minh.

## P5.1.149 — Chọn nhắc EPG trước 5/10/15/30 phút / Electron v4.23.233

- Feature priority: NEW — Chọn thông báo XMLTV trước 5, 10, 15 hoặc 30 phút; mỗi lịch giữ thời điểm riêng. Lịch cũ không có leadMinutes vẫn mặc định 10 phút; không đụng nguồn và không autoplay.
- User action: Trong Chọn kênh, bật lọc Sắp chiếu hoặc Đang chiếu (EPG), mở Bộ lọc, chọn Nhắc trước 5/10/15/30 phút rồi bấm chuông trên thẻ kênh. Bấm lại để hủy như P5.1.148.
- Electron screenshot: positron-p51149-reminder-lead-after-450-real.png
- Before: positron-p51149-reminder-lead-before-450-real.png. Baseline P5.1.148 Electron 450px đã được tải và trực tiếp mở.
- QA: Node regression + Electron thật 450px dùng EPG metadata cục bộ; chọn 30 phút, lưu đúng leadMinutes, chuông trạng thái đã lưu, playlist không đổi, không autoplay, không overflow. 6 CI jobs, manual screenshot review và immutable release.
- Trạng thái: CANDIDATE đến khi CI, ảnh và Release xác minh.

## P5.1.148 — Hủy hoặc bật lại lịch nhắc EPG ngay bằng chuông / Electron v4.23.232

- Feature priority: NEW — Nút chuông nhắc lịch ngay trên thẻ kênh nay thể hiện rõ đã lưu/chưa lưu, và cho phép bấm lần nữa để hủy đúng một chương trình đã nhắc; sử dụng lịch XMLTV đã nhập và dịch vụ nhắc nội bộ hiện có, không tự phát và không tác động lịch khác.
- User action: Mở Chọn kênh và bật bộ lọc EPG, tìm chương trình sắp chiếu rồi nhấn chuông để lưu; chuông đổi màu và trạng thái đã nhắc. Nhấn lại chuông để hủy, không phải tìm vào màn EPG và không cần tải nguồn ngoài.
- Electron screenshot: positron-p51148-cancel-reminder-after-450-real.png
- Ảnh trước: positron-p51148-cancel-reminder-before-450-real.png. Ảnh sau khi hủy: positron-p51148-cancel-reminder-canceled-450-real.png.
- Bằng chứng từ ảnh P5.1.147: nút chuông sau khi thêm lịch vẫn giữ hình thức giống chưa lưu; người xem khó biết đã nhắc hay chưa, và chưa có thao tác hủy trực tiếp. P5.1.148 sửa trạng thái lưu có thể kiểm chứng và bổ sung thao tác hủy có kiểm soát.
- Kiểm thử: Node hồi quy và Electron thật 450px; lưu nhắc cho chương trình tương lai, xác minh aria-pressed, localStorage, hủy chính xác ID nhắc, không xóa lịch khác, playlist bất biến, không tự phát, ảnh trước/sau và không tràn ngang.
- Trạng thái: CANDIDATE — chỉ tính vòng hoàn tất sau khi CI, ảnh Electron, bộ cài Windows/Mac và phát hành được xác minh.

## P5.1.147 — Nhắc trước 10 phút ngay trên kênh có chương trình sắp chiếu / Electron v4.23.231

- Feature priority: NEW — Thêm nút chuông độc lập trên thẻ kênh có lịch XMLTV sắp chiếu, cho phép đặt nhắc trước 10 phút bằng hệ thống nhắc lịch thật đã có; không cần mở trang EPG và tuyệt đối không tự phát video.
- User action: Trong Chọn kênh bật “Sắp chiếu” hoặc “Đang chiếu (EPG)”, tìm kênh có chương trình tiếp theo, nhấn nút chuông ở góc phải trên để lưu nhắc. Nhấn lần nữa nhận thông báo đã có nhắc, không tạo lịch trùng.
- Electron screenshot: positron-p51147-epg-reminder-after-450-real.png
- Ảnh trước: positron-p51147-epg-reminder-before-450-real.png.
- Bằng chứng nguyên nhân: P5.1.146 có lịch và thanh tiến độ EPG nhưng người xem phải chuyển sang trang EPG để đặt lịch. Bản này kết nối thẻ kênh với hàm nhắc của mô-đun nâng cao, truyền chính xác EPG ID/time và giữ nguyên tương tác nút Xem và Yêu thích.
- Kiểm thử: Node hồi quy và Electron thực 450px; thêm nhắc chương trình XMLTV +35 phút, xác minh localStorage lưu ID và tên kênh, không tạo bản sao khi bấm lại, giữ nguyên playlist, không tự phát, ảnh trước/sau và không tràn ngang.
- Trạng thái: CANDIDATE — chưa tính vòng hoàn tất khi CI, ảnh thực và EXE/DMG chưa được xác minh.

## P5.1.146 — Thanh tiến độ và phút còn lại theo lịch XMLTV / Electron v4.23.230

- Feature priority: NEW — Xem tiến độ ước tính của chương trình **theo lịch EPG**, gồm thanh phần trăm và số phút còn lại. Không mô tả là tiến độ phát video thực tế.
- User action: TV → Chọn kênh → Bộ lọc → “Có chương trình đang chiếu (EPG)”, xem “Theo lịch EPG: 50% · còn 15 phút” trên thẻ kênh. Không có dữ liệu EPG hợp lệ hoặc tắt bộ lọc thì ẩn tiến độ.
- Không tự phát kênh, không truy cập link streaming, không tải lịch ngoài hay ghi dữ liệu playlist. Dùng chính thời điểm bắt đầu và kết thúc XMLTV.
- Electron screenshot: positron-p51146-epg-progress-after-450-real.png
- Kịch bản Electron 450px: `positron-p51146-epg-progress-before-450-real.png`, `positron-p51146-epg-progress-after-450-real.png` với chương trình 30 phút giữa thời lượng và chương trình kế tiếp.
- Node regression: thời điểm đầu, giữa, cuối, thiếu thời gian; Electron: hiện %/phút còn lại, giao diện xếp hàng không chồng nhau, tắt EPG thì ẩn tiến độ, dữ liệu nguồn không đổi, không tự phát, không tràn ngang.
- Trạng thái: CANDIDATE cho đến khi workflow và ảnh Electron thực tế/EXE được xác minh.

## P5.1.145 — Tùy chỉnh mốc lọc EPG sắp chiếu 15, 30, 60 phút / Electron v4.23.229

- Feature priority: NEW — Cho phép chọn khoảng thời gian 15, 30 hoặc 60 phút khi lọc chương trình sắp chiếu. Danh sách thay đổi tức thì theo giờ phát thật từ XMLTV đã nhập, không tự tải thêm lịch hay tác động playlist.
- User action: Mở TV → Chọn kênh → Bộ lọc → bật “Sắp chiếu” → chọn “Khoảng thời gian” 15, 30 hoặc 60 phút. Hệ thống cập nhật bộ lọc ngay, người dùng tắt chế độ để trở về danh sách đầy đủ.
- Electron screenshot: positron-p51145-time-window-after-450-real.png
- Ảnh trước: positron-p51145-time-window-before-450-real.png. Bộ lọc 15 phút đưa về thông báo trống có cách xóa, 30 phút chỉ giữ kênh sắp bắt đầu sau 20 phút, 60 phút hiện thêm kênh sau 50 phút.
- Kiểm thử: Node và Electron 450px thử đủ ba mốc, giấu ô khoảng thời gian khi tắt bộ lọc, vẫn giữ dữ liệu nguồn, không autoplay/không tràn ngang. CANDIDATE cho tới khi CI và EXE được xác minh.

## P5.1.144 — Sắp xếp chương trình EPG sắp phát sớm nhất / Electron v4.23.228

- Feature priority: NEW — Thêm tùy chọn sắp xếp kênh theo thời điểm bắt đầu chương trình tiếp theo từ lịch XMLTV thực tế đã nhập; kênh chưa có EPG vẫn giữ lại cuối danh sách và không mất nguồn.
- User action: Mở TV → Chọn kênh → Bộ lọc → Sắp xếp → “Chương trình sắp phát sớm nhất (EPG)”; các kênh có chương trình gần tới đứng đầu, trên thẻ hiện giờ và tên chương trình. Chọn “Tên A → Z” để trở về như cũ.
- Electron screenshot: positron-p51144-earliest-epg-after-450-real.png
- Ảnh trước: positron-p51144-earliest-epg-before-450-real.png. Bộ lọc EPG là tùy chọn, không tự tìm mạng, thay playlist, phát kênh hoặc tạo nhắc lịch.
- Kiểm thử: Node và Electron thực 450px với hai kênh có lịch bắt đầu sau 8 và 44 phút; kênh bắt đầu sớm đứng trước, kênh không có EPG vẫn nằm trong danh sách, phục hồi sắp xếp được, không autoplay hoặc tràn ngang.
- Trạng thái: CANDIDATE — chỉ xác nhận sau khi GitHub Actions kiểm thử/chụp ảnh/build thành công, kiểm tra nguồn ảnh và EXE.

## P5.1.143 — Lọc chương trình sắp chiếu trong 60 phút / Electron v4.23.227

- Feature priority: NEW — Lọc kênh có chương trình sẽ bắt đầu trong 60 phút tới từ EPG/XMLTV đã nhập, kể cả kênh chưa có chương trình đang phát. Hiện giờ phát và tên, tìm tên không dấu. Tách biệt và loại trừ bộ lọc “Đang chiếu”.
- User action: TV → Chọn kênh → Bộ lọc → “Sắp chiếu trong 60 phút (EPG)”; tìm “phim sap chieu”. Không tự mở nguồn phát, đặt lịch nhắc, tải XMLTV mới hay thay đổi playlist.
- Kiểm thử: Node regression, Electron thật 450px; fixture XMLTV có một chương trình sau 20 phút và một chương trình sau 90 phút; chỉ kênh đúng hạn hiện, tên tìm được, tắt lẫn nhau, kiểm tra không autoplay, không sửa nguồn và không tràn ngang.
- Electron screenshot: positron-p51143-soon-filter-after-450-real.png
- Ảnh trước: positron-p51143-soon-filter-before-450-real.png.
- Sửa cùng phiên bản: màn hình 450px từ ảnh P5.1.142 cho thấy EPG và tên kênh bị bó thành cột không đọc được; dùng bố cục EPG theo chiều dọc, giữ nút yêu thích độc lập và bổ sung cổng QA đo độ rộng/không chồng hàng.
- Trạng thái: CANDIDATE — chỉ xác nhận khi GitHub Actions và Release thực tế thành công.

## P5.1.142 — Xem lịch chương trình tiếp theo ngay trên thẻ kênh / Electron v4.23.226

- Feature priority: NEW — Hiển thị tên và giờ bắt đầu chương trình sắp phát bên dưới chương trình hiện tại trên thẻ kênh, chỉ khi người dùng bật bộ lọc EPG và chỉ từ lịch XMLTV có thật đã nhập; không tự mở nguồn ngoài, tự phát video hay đặt nhắc lịch.
- User action: Mở TV → Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; thẻ kênh sẽ hiện “Theo EPG: ...” và “Tiếp theo HH:MM: ...” khi lịch XMLTV có chương trình kế tiếp.
- Electron screenshot: positron-p51142-next-programme-after-450-real.png
- Ảnh đầu vào: positron-p51141-programme-title-search-after-450-real.png, ảnh Electron thực 450px đã mở kiểm tra: thẻ chỉ hiển thị tên chương trình đang chiếu, không có lịch tiếp theo; ảnh chụp còn có toast QA cũ ở chân màn hình, cần tiếp tục tối ưu bằng cách tách dữ liệu thử nghiệm.
- Kiểm thử: Node regression và QA Electron 450px với một kênh metadata cục bộ, guide có 2 chương trình tiếp nối; xác minh nhãn hiện tại, giờ bắt đầu/tên kế tiếp, ẩn khi tắt EPG, không đổi dữ liệu playlist, không tự phát và không tràn ngang.
- Trạng thái: CANDIDATE — chưa tính một vòng hoàn tất trước khi kiểm tra toàn bộ Actions, mở ảnh thật và xác minh bộ cài Windows/Mac.

## P5.1.141 — Tìm theo tên chương trình đang chiếu / Electron v4.23.225

- Feature priority: NEW — Cho phép tìm kênh bằng **tên chương trình đang chiếu** từ XMLTV hiện có ngay trong giao diện TV, không cần mở trang Lịch phát sóng; tìm tiếng Việt không dấu và nhiều từ linh hoạt. Chỉ bật tính năng khi người dùng chủ động lọc EPG.
- User action: Mở Chọn kênh → Bộ lọc → Có chương trình đang chiếu (EPG), nhập tên chương trình như “tin yeu thich” để tìm kênh đang có chương trình đó theo XMLTV; nhấn vào thẻ mới phát.
- Electron screenshot: positron-p51141-programme-title-search-after-450-real.png
- Ảnh đầu vào: positron-p51140-epg-current-filter-after-450-real.png của vòng trước; mở rộng tính năng lọc EPG thành tìm tên chương trình có ích.
- Kiểm thử: Node regression, Electron 450px với XMLTV metadata chỉ tồn tại cục bộ; tên chương trình “Bản tin yêu thích QA” tìm được qua truy vấn không dấu “tin yeu thich” dù từ khóa không có trong tên kênh; không tự phát, dữ liệu nguồn bất biến và không tràn ngang.
- Sửa QA tiếp nối: ID kênh thực có thể chứa dấu `|`, nên so sánh ID qua chuỗi nối/split không bảo toàn danh tính. Giữ nguyên mảng ID gốc và so sánh hai mảng đã sort bằng JSON, không giảm điều kiện dữ liệu bất biến.
- Sửa kiểm thử hồi quy P5.1.139 trong cùng phiên bản: thay so sánh danh sách kênh khả dụng phát sinh (có thể được dựng lại khi native render) bằng so sánh bất biến tập bản ghi kênh thực lưu trong `store.channels` (ID, sourceId, URL, tên, nhóm) và trạng thái bật nguồn trong `store.sources`. Vẫn bắt buộc kiểm chứng không tự phát và thứ tự hiển thị yêu thích đúng.
- Trạng thái: CANDIDATE — xác minh CI, screenshot và Release thực tế trước khi đếm vòng 06/20.

## P5.1.140 — Lọc kênh đang có chương trình từ XMLTV / Electron v4.23.224

- Feature priority: NEW — Thêm bộ lọc chỉ hiển thị các kênh có chương trình hiện tại trong lịch EPG/XMLTV đã nhập, kèm tên chương trình ngay trên thẻ; không dự đoán lịch phát và không kiểm tra hoặc tự mở luồng mạng.
- User action: Mở Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; chọn kênh có tên chương trình theo lịch, hoặc tắt bộ lọc để xem toàn bộ.
- Electron screenshot: positron-p51140-epg-current-filter-after-450-real.png
- Ảnh đầu vào: positron-p51139-favorites-first-after-450-real.png của phiên bản trước; giữ nguyên các tùy chọn sắp xếp và thao tác kênh.
- Kiểm thử: Node regression, ảnh Electron 450px trước/sau; chèn tạm metadata XMLTV đúng khoảng thời gian cho một kênh QA, chỉ đúng kênh đó còn hiển thị và có tên chương trình; không sửa playlist, không phát, không tràn ngang, khôi phục guide gốc sau kiểm tra.
- Sửa CI trong cùng phiên bản: bài test phục hồi tìm kiếm P5.1.132 còn đóng đinh biểu thức cũ; cập nhật kiểm chứng bao gồm bộ lọc EPG mới và việc tắt bộ lọc khi xóa điều kiện tìm kiếm. Không loại bỏ bất kỳ assertion hành vi nào.
- Sửa hồi quy P5.1.139 trong cùng phiên bản: QA đã sai khi yêu cầu thứ tự trả về của danh sách kênh không đổi sau thao tác yêu thích. Giữ kiểm tra số lượng và **tập ID kênh** bất biến, cho phép renderer sắp xếp giao diện mà không báo nhầm thay đổi playlist.
- Trạng thái: CANDIDATE — cần xác minh CI/ảnh chụp Electron thực và Release Windows/Mac, không tính hoàn tất trước đó.

## P5.1.139 — Ưu tiên kênh yêu thích lên đầu / Electron v4.23.223

- Feature priority: NEW — Thêm tùy chọn sắp xếp “Yêu thích lên đầu” trong danh sách kênh, đưa kênh đã đánh dấu sao lên trước nhưng giữ các kênh khác theo thứ tự tên; chỉ thay đổi cách hiển thị, không sửa playlist hay dữ liệu nguồn.
- User action: Mở Chọn kênh, mở Bộ lọc rồi chọn Sắp xếp → Yêu thích lên đầu; có thể trở lại Tên A → Z/Z → A ngay lập tức.
- Electron screenshot: positron-p51139-favorites-first-after-450-real.png
- Ảnh đầu vào: positron-p51138-page-navigation-after-450-real.png trong giao diện Electron 450px có danh sách nhiều trang nhưng chưa có tùy chọn đưa kênh yêu thích lên đầu.
- Kiểm thử: Node regression và Electron thật tại 450px; bật dấu sao cho kênh QA, chọn sắp xếp, kiểm tra mọi thẻ yêu thích ở đầu, dữ liệu nguồn bất biến, không autoplay, không tràn ngang, có ảnh trước/sau.
- Sửa CI cùng phiên bản: chờ đúng kênh đầu tiên QA Channel 001 và 18 thẻ thực thay vì so cứng tổng 552; bộ dữ liệu QA đã bổ sung các nhóm mới. Không làm lỏng kiểm chứng focus, điều hướng hoặc không tự phát.
- Trạng thái: CANDIDATE — chỉ ghi vòng 04/20 hoàn tất khi CI, ảnh Electron và Release Windows/Mac thực sự đạt.

## P5.1.138 — Chuyển trang kênh bằng PageDown/PageUp / Electron v4.23.222

- Feature priority: NEW — Duyệt xuyên qua các trang kênh dài chỉ bằng hai phím PageDown/PageUp, giữ tiêu điểm vào thẻ ở trang mới và không tự phát; hữu ích khi danh sách có hàng trăm kênh.
- User action: Mở Chọn kênh, dùng Enter chọn thẻ rồi nhấn PageDown để sang trang kế tiếp và chọn kênh đầu; PageUp trở về trang trước và chọn thẻ cuối, nhấn Enter trên thẻ mới phát.
- Electron screenshot: positron-p51138-page-navigation-after-450-real.png
- Ảnh đầu vào: P5.1.137 với positron-p51137-arrow-navigation-after-450-real.png đã mở xem; phím mũi tên hoạt động nhưng chưa có chuyển trang bằng bàn phím.
- Kiểm thử: Node regression, QA Electron 450px với danh sách nhiều hơn 18 kênh; PageDown/Up đi đúng 2 trang, giữ truy vấn, focus, không autoplay, không tràn và có aria-keyshortcuts.
- Sửa lỗi CI trong cùng phiên bản: quá trình refresh danh sách có thể làm mất focus của thẻ (P5.1.137 QA bị fail và phím mũi tên có thể kích hoạt shortcut toàn ứng dụng); lưu channelId đang focus và trả về thẻ khi render. QA chờ đúng số kết quả tìm kiếm 552 rồi mới thao tác.
- Trạng thái: CANDIDATE, chưa tính hoàn thành khi chưa xác minh ảnh và Release.

## P5.1.137 — Duyệt thẻ kênh bằng phím mũi tên / Electron v4.23.221

- Feature priority: NEW — Điều hướng các kênh ngay trong Chọn kênh bằng bốn phím mũi tên và Home/End, bám đúng vị trí thẻ ở cả dạng lưới và danh sách; không cần Tab qua từng nút yêu thích và không tự phát video.
- User action: Mở Chọn kênh, nhập “QA Channel” rồi Enter để chọn thẻ đầu tiên; dùng ← → ↑ ↓ để di chuyển theo vị trí kênh, Home về đầu và End tới cuối; chỉ Enter trên thẻ mới phát.
- Electron screenshot: positron-p51137-arrow-navigation-after-450-real.png
- Ảnh đầu vào: positron-p51136-search-enter-after-450-real.png Electron thật 450px đã mở soát; kết quả đầu tiên có viền focus nhưng thiếu điều hướng liên tục giữa các thẻ.
- Kiểm thử: Node và QA Electron thật 450px; danh sách 18 thẻ, ArrowRight chọn kênh 002, ArrowDown giữ cột, ArrowLeft, Home/End; chế độ danh sách dùng ArrowDown; giữ nguyên playlist, không autoplay và không tràn ngang.
- Trạng thái: CANDIDATE — chỉ đánh dấu vòng 02/20 khi CI, ảnh trước/sau và Release EXE/DMG đạt.

## P5.1.136 — Enter chọn kết quả tìm kênh / Electron v4.23.220

- Feature priority: NEW — Chuyển tiêu điểm bàn phím tới thẻ kênh phù hợp đầu tiên sau khi tìm kiếm, tránh phải dùng chuột và không tự phát hoặc thay đổi dữ liệu người dùng.
- User action: Mở Chọn kênh ở TV, nhập tên kênh vào Tìm kiếm rồi nhấn Enter để chọn thẻ đầu tiên; nhấn Enter thêm lần nữa trên thẻ mới phát kênh nếu muốn.
- Electron screenshot: positron-p51136-search-enter-after-450-real.png
- Ảnh đầu vào: positron-p51135-reordered-search-450-real.png đã mở xem trực tiếp, hiển thị đúng kết quả lọc nhưng chưa có thao tác Enter chọn nhanh.
- Kiểm thử: Node regression, QA Electron 450px có kênh được nhập cục bộ; xác minh focus đúng, không autoplay, không khớp giữ focus ở tìm kiếm, không tràn ngang.
- Trạng thái: CANDIDATE — cần xác minh CI, mở ảnh thực tế mới và bộ cài trước khi tính hoàn tất.

## P5.1.135 — Tìm kênh nhiều từ không đúng thứ tự / Electron v4.23.219

- Feature priority: NEW — Tìm được kênh bằng nhiều từ khóa trong tên và nhóm dù đảo thứ tự, có khoảng trắng lặp hoặc gõ tiếng Việt không dấu; không truy cập URL, không tự phát video và không đổi dữ liệu.
- User action: Mở Chọn kênh, gõ "001 Channel QA" hoặc "qa 001" vào Tìm kiếm; kết quả "QA Channel 001" xuất hiện mà không cần gõ chính xác thứ tự.
- Electron screenshot: positron-p51135-reordered-search-450-real.png

- Ảnh đầu vào: P5.1.134 giao diện chọn kênh 450px, đã mở xem trực tiếp.
- Kiểm thử: Node regression và Electron thực với truy vấn đảo từ, khoảng trắng, kết quả chính xác, không tự phát và không tràn ngang.
- Trạng thái: CANDIDATE — chưa tính vòng hoàn tất trước khi kiểm tra CI, ảnh Electron và bộ cài.

## P5.1.134 — Unified native SVG Favorite stars / Electron v4.23.218

- Feature priority: NEW — Add direct F keyboard toggle to each focused channel card, saving or removing an existing native Favorite without starting playback, with focus restored for repeated use.
- User action: Focus any channel tile using Tab or a mouse click, then press F to mark it as Favorite; press F again on the same tile to undo without playing the stream.
- Electron screenshot: positron-p51134-favorite-hotkey-f-450-real.png


- Input: visually opened genuine P5.1.133 450px Electron PNG `positron-p51133-compact-card-title-star-450-real.png`. Card titles are now readable but Favorite controls still use uneven, very small OS-dependent Unicode ★/☆ glyphs, conflicting with native monochrome controls.
- Repair: native 20px SVG star geometry inside existing separate Favorite buttons; keep real button/keyboard/focus/aria-label/aria-pressed behavior and persistence. Selected star uses currentColor fill; unselected remains hollow. No stream, M3U, EPG, favorites data model or autoplay changes.
- Regression: Node asserts SVG setup and scoped CSS; real 450px Electron before/after images compare unpressed/pressed state, keyboard-independent mouse toggle, aria accessibility, native geometry and safe undo.
- Evidence: `positron-p51134-favorite-native-svg-before-450-real.png`, `positron-p51134-favorite-native-svg-after-450-real.png`.
- CANDIDATE pending CI full suite, actual PNG review, installer verification.

## P5.1.133 — Keep compact channel titles readable above Favorite stars / Electron v4.23.217

- P5.1.132 genuine Electron screenshot `positron-p51132-empty-search-clear-after-450-real.png` shows two-column 450px grid cards whose long "QA Channel 00…" labels are truncated beside the separate bottom Favorite star.
- Root cause: native chooser white-space:nowrap plus P5.1.118 star overlay and 46px right padding leave too little label width.
- Fix only in multi-result compact native GRID (not list, not wide single-result): reserve a dedicated 34px bottom action row; allow name to wrap to two lines; center the original 34px independent Favorite control below the title. Preserve native play action, keyboard and stored Favorite keys.
- True Electron QA: 450px long QA Channel card title rendered without clipping/overlap, favorite button separate and reachable, 18 native cards, no overflow and no autoplay. After PNG `positron-p51133-compact-card-title-star-450-real.png`.
- CANDIDATE until CI and visual review, installer/build verification.

## P5.1.132 — Recover from empty channel search without reimporting / Electron v4.23.216

- Input: genuine P5.1.131 real 450px Electron screenshot `positron-p51131-ascii-d-search-450-real.png` exposes the prominent channel search. Source review reveals All-tab no-results state has only generic text; unlike Favorites and Recent, it has no actionable path to clear filters.
- Fix: when there are imported channels but no search results on All and search/group filters are active, add one native "Xóa bộ lọc và xem tất cả kênh" button. On click clear query and group, render all 18 page-1 cards and restore search focus. Existing CSS reused.
- QA: real Electron 450px no-match query `zz-no-channel`, screenshot before and after clicking native reset, verify empty message, reachable button, focus, restored cards, group cleared, no autoplay/overflow.
- Screenshots: `positron-p51132-empty-search-clear-before-450-real.png`, `positron-p51132-empty-search-clear-after-450-real.png`.
- CANDIDATE until native QA+installers verified; do not count release without assets.

## P5.1.131 — Search 'đ' using ASCII 'd' in channel library / Electron v4.23.215

- Baseline: genuine P5.1.130 450px Electron screenshot `positron-p51130-border-mask-450-real.png` shows native channel search. Source inspection reveals NFD strips accents but does not decompose Vietnamese đ/Đ, so typing `dia phuong` cannot match "TH địa phương".
- Fix: append `replace(/đ/g,'d')` after lower-casing in the native chooser search normalizer; applies equally to typed text, channel names and group names. Original metadata is unchanged.
- Actual Electron regression: with nine locally imported QA category records, search `dia phuong` must return precisely "TH QA 1" (original group "TH địa phương"), live 1-channel status and focus; clearing restores 18 cards. No IPTV playback, favorites or playlist changes.
- Screenshot: `positron-p51131-ascii-d-search-450-real.png`; Node regression checks the normalization and authentic Electron scenario.
- CANDIDATE until QA screenshot manual review and immutable Release builds verified.

## P5.1.130 — Cover clipped category-chip outline alongside sticky reset / Electron v4.23.214

- Input: actual P5.1.129 450px Electron screenshot `positron-p51129-right-mask-450-real.png` opened and enlarged. The ghost letter is gone but a detached curved chip border remains visible immediately RIGHT of the pinned "Tất cả" chip.
- Root: the conditional 18px pseudo-mask from P5.1.129 removes text, but stops before the neighboring chip's border at about 23–27px.
- Fix: adjust conditional right mask to 30px; leave mask completely off at scrollLeft=0. Native group chips, selection, playlist, keyboard, play controls and local state unchanged.
- Test: Node asset/code assertions and real Electron 450px screenshot; verify span and pointer hit test across curved border, native "Thiếu nhi" chip remains visible/clickable, filter active, no overflow and no autoplay. New real screenshot `positron-p51130-border-mask-450-real.png`.
- CANDIDATE until CI, genuine after-image review, release assets and checksums.

## P5.1.129 — Repair clipped group-chip text in compact Electron / v4.23.213

- Baseline: opened genuine P5.1.128 450px Electron screenshot `positron-p51128-dropdown-chip-450-real.png` from Actions #44948172418, revealing a stray clipped letter RIGHT of sticky "Tất cả" after selecting "Tin tức".
- Root cause: P5.1.126 masks the left side only. Horizontal scroll after P5.1.128 dropdown selection leaves a small category fragment visible at the right.
- Fix: native scroll synchronization toggles `po-groups-scrolled`; scoped right-side `::after` mask applies only while scrolled. No changes to playlist, playback, favorites, stored data or group semantics.
- Regression: Node syntax/asset assertions and true Electron 450px screenshot QA of computed mask, hit-testing, active filter, reset and no-autoplay. After: `positron-p51129-right-mask-450-real.png`.
- CANDIDATE pending Actions verification, opened after-image review and immutable Release installers.

## P5.1.107 — Replace font-dependent compact channel chooser icons with SVG / Electron v4.23.191

- Actual P5.1.106 native Electron TV screenshots at 450px/540px: channel chooser tabs and grid/list toggles still use platform text-glyph symbols (▣, ☆, ◷, ▦, ☷) rather than a coherent icon set. Some appear like isolated small squares.
- Root cause: old renderer/web-channel-chooser-v42371.js hardcodes text glyphs into the chooser's button HTML.
- Fix inside Positron branch only: render five deterministic SVG icons, preserve all existing click listeners, role/tab selection, channel playlist data, and no-autoplay semantics. Give grid/list toggles explicit accessible names.
- Regression: real Electron 450px QA validates exactly 5 icons, icon visibility, full readable tab labels, grid/list accessibility and zero header overflow, and captures `positron-p51107-chooser-native-svg-450-real.png`.
- Candidate until CI, actual image review, and immutable release asset verification.

## P5.1.106 — Empty WatchFlow without a horizontal scrollbar / Electron v4.23.190

- Real screenshot P5.1.105 `positron-watchflow-1360-night-real.png` reveals a horizontal scrollbar in compact no-source WatchFlow.
- Root cause: P5.1.100 sticky header has -18px horizontal margins, but compact empty playlist uses 15px padding.
- Scoped fix matches the 15px padding, preserving playback, saved bookmarks, other modal modes and user data.
- Strict CDP/Electron proof: `panel.scrollWidth <= panel.clientWidth+1`; screenshot `positron-p51106-empty-watchflow-no-horizontal-scroll-real.png`.
- Do not count complete before CI and screenshot visual inspection.

## P5.1.101 — Search within all privately saved Watch Later channels / Electron v4.23.185

- Evidence from actual P5.1.100 Electron screenshot and source: saved Watch Later entries are accessible in batches but up to 80 entries require many manual scroll/reveal actions to find a particular channel.
- Provide a persistent accessible search field on the Continue screen. Filter locally resolved saved channel titles or group names, with Vietnamese accent-insensitive matching, and show result counts. No URL search, network requests, data upload, playlist changes or automatic playback. The local-only bookmark schema remains unchanged.
- Keep the search input separate from re-rendered cards to preserve keyboard focus as results change. Retain the existing eight-at-a-time paging for the unfiltered list.
- Pure Node regression test covers matching title/group, diacritics, never searching stream URLs or unsaved channels. Real Electron CDP QA searches the twelfth item in a synthetic local 12-channel bookmark list, checks no autoplay / no storage changes, and takes screenshot `positron-p51101-watch-later-search-552-real.png`.
- Candidate until all tests, screenshot review and immutable release assets have actually been verified.

## P5.1.100 — WatchFlow header and mode tabs remain visible in long saved lists / Electron v4.23.184

- Real P5.1.98 Electron screenshots of 12 saved bookmarks demonstrate that the close icon and mode tabs disappear after scrolling to the end, even with accessible bookmark pagination.
- Keep header and mode selector sticky in the existing WatchFlow dialog, using compact typography and dark background while preserving the native TV transport, EPG, and local-only saved state.
- Test with 12 synthetic metadata-only saved channels on actual Electron CDP. Assert scrollability, header/nav position, hit-testable close icon, non-obstruction of native player, no autoplay, and close/reopen. Capture `positron-p51100-watch-later-sticky-552-real.png`.
- Node regression guards CSS and real Electron QA setup. This is a new source revision, not a relabel of 70 historic screenshot scenarios. Release verification is independent and may be blocked by GitHub token HTTP 403.

## P5.1.99 — Upcoming programme in WatchFlow directly from XMLTV / Electron v4.23.183

- Feature: extend actual Now cards with the first Next XMLTV programme and its local start time. Reuse `IPTVGuide.current()` and existing channel/manual mappings, EPG offset and user's device time zone. Never infer a programme title from a channel or network search.
- Show Next only if its schedule starts after the present instant, has valid end time, an actual title and starts within 12 hours. Avoid misleading 'up next tomorrow' from incomplete guides. Do not load extra sources, auto-play a channel or alter native playlists.
- UI stays inside existing WatchFlow cards, beneath true Now (if any), truncates long metadata but exposes full title in tooltip. Native Lưu / Xem controls preserved.
- Tests: pure unit cases for active future, finished, missing/stale, invalid metadata; Electron 552-channel metadata-only scenario temporarily provides synthetic current+next XMLTV on one actual QA channel, verifies exactly one Next row, no auto-play and captures `positron-p5199-next-epg-watchflow-552-real.png`.
- Inherits the P5.1.98 follow-up correction resetting WatchFlow scroll on mode change, preventing lower cards obscuring title/navigation. Complete only after reading real screenshot and CI installers/release.

## P5.1.98 — On-air XMLTV programme titles in WatchFlow recommendations / Electron v4.23.182

- Research basis: the imported XMLTV guide already backs native EPG search and reminders, but WatchFlow cards show only channel names and source health. IPTVnator's channel list offers Now/Next EPG inline; copy no external assets/code.
- Enhancement: add only the **currently airing** actual XMLTV programme title under relevant WatchFlow card names, using the existing guide from `IPTVExtras.getGuide()`, `IPTVGuide.current()`, manual channel mapping and saved EPG offset. One line of readable text with full title in a tooltip. No programme title is shown without matching, currently active guide data; no guessed programme info.
- Security/privacy: no external URL/EPG fetch, automatic discovery, AI guessing, playlist mutation, history logging or autoplay. Labels use `textContent` instead of HTML. Works with local-only data and still works when EPG is not installed.
- Tests: new pure metadata adapter `renderer/positron-onair-core.js`; Node tests for start/end boundary, timezone-adjusted offset, no guide and malformed metadata; real Electron 552-channel synthetic metadata QA temporarily injects exactly one XMLTV programme title and checks one card shows it without autoplay, then restores original guide. New screenshot `positron-p5198-live-epg-watchflow-552-real.png`.
- A future phase may offer programme explanations, filter by current programmes, and guide-based recommendation ordering after independent consent and quality tests. Current release implements only verified Now UI, not semantic AI.

## P5.1.97 — Watch Later pagination: all saved channels reachable / Electron v4.23.181

- Fixed a confirmed accessibility and functionality gap: Watch Later retained up to 80 bookmarks but Continue displayed only the first eight, making entries 9–80 unreachable.
- Continue now shows the count of available saved channels, initially renders eight, and offers an accessible "Xem thêm" control in groups of eight. Native playback remains explicit and does not start on saving or expanding.
- The private local bookmark store is unchanged, with no added URLs, credentials, or playlists.
- Added Node regression and real Electron CDP QA with 12 synthetic metadata-only bookmarked channels, expanding 8 to 12, testing their actions and no automatic playback; `positron-p5197-watch-later-many-552-real.png` is the visual evidence.
- Prior P5.1.96 and its release remain immutable. CI result and assets require independent verification.

## P5.1.96 — WatchFlow Xem sau: private local channel bookmarks / Electron v4.23.180

- Feature motivation: real open-source IPTV ecosystem increasingly has favorites, history and quick-return interfaces; the existing native history intentionally records only decoded playback, so a separate deliberate 'Xem sau' saves a choice even when the user has not played it. Related research: `POSITRON_FEATURE_RESEARCH_NEXT20_20261121.md`.
- Implementation: from the original WatchFlow Mix/Similar/Continue cards, add keyboard-accessible `Lưu` / `Bỏ lưu` beside the existing native `Xem`. In the existing Tiếp tab, saved channels appear in a `Để xem sau` section above native successfully played history; no new sixth tab crowds the modal. Save toggle never starts playback; playback remains explicit `IPTVState.playChannel(id)` click.
- Local-only privacy: `positron.watch-later.v1` stores only a deterministic fingerprint of source ID (never raw source ID), normalized non-URL channel key and timestamp; does not save playlist, stream URL, token, credentials or EPG. 80 entry cap; malformed/untrusted storage filtered; matches only the original source after ID/URL refresh; dead/inactive channels are not recommended or silently deleted from storage. localStorage failure reports failure rather than false success.
- Tests: native `tests/positron-watch-later.test.cjs` covers privacy, source isolation, URL refresh, redaction, invalid input, cap and no autoplay. Real Electron screenshot QA inserts 552 synthetic metadata channels, clicks Save, confirms local-only persisted fields, opens Tiếp, sees saved card, checks no stream, captures `positron-p5196-watch-later-552-real.png`, then removes synthetic entry. Existing Similar test retains exactly 5 real play actions after a separate Save button was added.
- **Not verified until full Node, screenshot visual review, Windows/macOS packaging and immutable Release pass.** No other branches modified.

## P5.1.95 — Correct visible overlay of WatchFlow scroll cue / v4.23.179

- Direct manual review of the REAL P5.1.94 Electron screenshot `positron-p5194-watchflow-scroll-cue-552-real.png` revealed an important new defect: the indicator `↓ Cuộn xuống để xem thêm kênh` sat over the third Mix card's `Xem` button. Pointer-events:none made the button technically clickable, but visual occlusion is unacceptable. P5.1.94 was therefore not counted as a fully reviewed round.
- Cause: indicator was an absolute-positioned child at the bottom of a 390px, scroll-clipped dialog.
- Fix: mount scroll indicator inside the actual dynamic Mix heading and use relative inline layout, not absolute overlap; keep the existing geometry-based visibility, hide at bottom/close/when not needed and preserve native player transport and no-autoplay.
- New Node regression verifies inline DOM hierarchy and no overlay style. Real Electron 1360×820 QA asserts all five buttons exist and indicator rectangle has zero overlap with every card button, remains visible when needed and no IPTV stream starts. New authentic screenshot: `positron-p5195-watchflow-inline-scroll-cue-552-real.png`.
- Distinct P5.1.95 SemVer/tag preserves immutable P5.1.94 records while delivering screenshot-grounded correction. This correction belongs to the same uploaded batch round 02; count only after after-image manually opened, tests and release assets verified.

## P5.1.94 — Expose hidden WatchFlow Mix suggestions when desktop panel scrolls / v4.23.178

- Input: manually opened genuine P5.1.93 Electron screenshot `positron-p5193-group-balanced-mix-552-real.png` at 1360×820. The 390px bounded dialog displays just 2–3 of the five Mix results and its small native scrollbar does not clearly signal that the remaining channels can be reached. The 450px screenshot shows all five cards without this problem.
- Root cause: the fixed-height desktop popup protects native playback controls but has no scroll-affordance state tied to card visibility.
- Fix: preserve the current 390px max-height and native playback, source files, and user preferences; add a passive on-panel visual cue `↓ Cuộn xuống để xem thêm kênh` only when the final recommendation card is actually outside the panel bounds. Recompute on scroll, resize, mode switch and reopen; hide when the last card becomes visible or panel closes, prevent pointer interception.
- Regression: Node assertions for cue presence, geometry, aria and pointer-safe style; real Electron QA at 1360×820 checks cue visible, hides after scrolling to end, no autoplay and dialog clears player controls; screenshot `positron-p5194-watchflow-scroll-cue-552-real.png` for direct inspection. Not counted complete until after-image/release verified.

## P5.1.93 — Balance daily Mix source groups with equal playback evidence / v4.23.177

- Baseline: opened genuine Electron P5.1.92 `positron-p5192-local-calendar-mix-552-real.png` from run `44910897473`, screenshot artifact `14709677582`. The five Mix suggestions had Main=3, Regional=1, Other=1, even though all QA streams were equally unverified; current Mix promised variety.
- Root cause: the final alphabetical `dailyMix` filler did not account for groups already selected. Keep source status/playback evidence as the first ranking criterion, and balance source-group counts only among channels with the same evidence score. A local-day hash supplies stable but rotating ties.
- New regression tests: 3 groups × 14 channels, 5 picks with [1,2,2] group counts on four dates, no duplicates, different dates rotate, and an actually proven stream remains included. Native Electron 552-channel QA measures rendered card group counts, no autoplay and generates `positron-p5193-group-balanced-mix-552-real.png`.
- This version is a candidate until test, native screenshot opening, CI and immutable installer assets are verified. No playlist/history modifications and no network or streaming during QA.

## P5.1.92 — Correct daily Mix and Smart Zap calendar day / v4.23.176

- Input: opened *real Electron* P5.1.91 `positron-watchflow-plus-mix-552-metadata-qa-real.png`: user-facing heading promises `Mix 5 kênh hôm nay`. The existing implementation used `new Date().toISOString().slice(0,10)` in both WatchFlow UI and underlying smart suggestion engine, incorrectly rotating daily recommendations at **07:00 local time in Vietnam (UTC+7)** instead of local midnight.
- Added pure `localDay(date)` helper using the device Date local year/month/day. The Mix UI and engine defaults now use the local day consistently, including Smart Zap. Explicit date arguments remain supported, and recommendation health/dedup/privacy continue unchanged.
- New Node regression launches child processes in `TZ=Asia/Bangkok` and `TZ=UTC` for the **same instant** 2026-11-20T18:30:00Z and confirms Nov21 in Bangkok but Nov20 UTC. Real Electron QA asserts five Mix recommendations remain clickable, mode selected, never autoplay, and local date key; captures `positron-p5192-local-calendar-mix-552-real.png`.
- No network, automatic playlist import, recording/stream access, or personal time-zone data storage.

## P5.1.91 — Match native Play/Pause glyphs to Web original SVG / v4.23.175

- Input: actual P5.1.90 Electron screenshot `positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png`. The legacy Electron Play triangle was made with CSS `clip-path:polygon(...)` and pause using `linear-gradient`, unlike the modern verified SVG icon set from `web/online/web-player-icons.css`.
- Read the **Web branch only** and bring its exact SVG data URI masks for Play and Pause into the Positron-specific media CSS. Restore 22×22 consistent stroke geometry. Preserve the existing original Play button, click handlers, MutationObserver deriving state from native app glyph, disabled style, current theme colors, player and media IPC; no other branch changed.
- Native Electron CDP QA temporarily updates only decorative Play text (without clicks, playback or network requests), asserts CSS SVG mask, 22px sizing, proper switch to Pause and restoration, then captures `positron-p5191-web-play-svg-552-metadata-real.png`.
- Node regression asserts masks, Web-origin geometry and native handler wiring. Do not claim feature tested until QA screenshot is opened and CI passes.

## P5.1.90 — Hide experimental Video Lab when nothing is selected / v4.23.174

- Input: actual P5.1.89 Electron 1360×820 screenshot `positron-p5189-player-ready-subtitle-552-metadata-real.png` shows an active-looking `Video Lab · Beta` control while the player has no selected channel. Source `renderer/video-enhancement-electron-v42375.js` confirms its AI enhancement pipeline is not connected; original button opens a UI-only experimental panel and saves settings but does not enable live AI upscaling.
- Remove that dead-end from the **unselected** player UI only. Keep button and settings in DOM, restore it when native selected channel exists, and collapse its panel when selection ends. Monitor native title and component initialization rather than mutating playlists or media pipeline.
- Node tests and real Electron metadata-only QA assert the button is hidden and not taking space with no current channel; with a temporarily stubbed channel selection it becomes visible, and after restoring native state it hides again, all without starting video. Screenshot `positron-p5190-player-ready-video-lab-hidden-552-metadata-real.png`.
- No model installation, upscaling, autoplay, user preferences deletion, or changes to other branches.

## P5.1.89 — Native player status reflects available channels / v4.23.173

- Input: actual P5.1.88 Electron 1360×820 screenshot `positron-p5188-player-ready-552-metadata-real.png` shows 552 imported native channels and a useful explicit start action, yet the status under the video still says `Nhập danh sách để bắt đầu` (import a playlist to begin).
- Synchronize only the native *default* `#playingSubtitle` hint with native enabled-channel count. Change the default to `Chọn kênh để bắt đầu` when channels are present, restore the original import hint when none are. Never overwrite status labels after a user stops video or when a channel is already selected or playing.
- Add Node assertion and real Electron metadata screenshot `positron-p5189-player-ready-subtitle-552-metadata-real.png`, including a CDP check that UI state and caption agree and playback remains stopped.
- No playlist changes, imports, autoplay, caption, DVR or stream requests.

## P5.1.88 — Real playlist-aware TV onboarding / v4.23.172

- Input: opened actual P5.1.87 Electron 1360×820 screenshot `positron-p5-visual-only-552-channels.png`. Although 552 native channels were already in the sidebar, the video's empty state still misleadingly asked the user to import a playlist, and offered only `Mở file M3U` and `Thêm URL`.
- Keep the native no-playlist onboarding intact. When enabled native channels are available, show `Chọn kênh để xem` and accurate channel count, preserve the file/URL buttons in DOM but hide them, and offer `Xem kênh đầu tiên` which invokes the existing `IPTVState.playChannel(first.id)` **only after a real user click**. The first eligible enabled source is used; dead and missing-link channels are not selected. No autoplay, playlist mutation or network lookup.
- Observe native `channelMeta` for source import/removal updates; restore original import actions when there are zero enabled channels. Preserve the existing player, playback and source data.
- New Node regression and actual Electron screenshot `positron-p5188-player-ready-552-metadata-real.png` inspect the imported 552-channel state and assert original import controls remain in DOM, new action visible, text accurate, and playback never starts during QA.
- Counts as complete only after UI screenshot opened and full CI/release success.

## P5.1.87 — WatchFlow tabs stay readable / v4.23.171

- Input: manually opened real Electron P5.1.86 screenshot `positron-watchflow-plus-similar-552-metadata-qa-real.png` at 1360×820. The navigation tab formerly labeled “Xem tiếp” rendered as visibly truncated “Xem ti…”.
- Replace the short visible label with “Tiếp”; the accessible `aria-label` and `title` remain the complete “Tiếp tục xem”. No watch-history, stream, channel, or EPG behavior changes.
- Add regression assertions and **real Electron DOM geometry checks** for five mode-label widths (span.scrollWidth <= span.clientWidth) in the same populated WatchFlow screenshot, retaining existing nav overflow and button-width validations.
- Only count the round after Node tests, real Electron screenshot/manual review, all platform builds, and immutable release verification succeed.

## P5.1.86 — Prevent WatchFlow dialog from covering native player / v4.23.170

- Visual input is the actual Electron 1360×820 screenshot from P5.1.85 at `p5-20-rounds/positron-watchflow-plus-similar-552-metadata-qa-real.png`; popup (top ~72, bottom ~680) covered the entire right part of native player controls (top ~487).
- Fix desktop-short viewport WatchFlow popup to a 390px *border-box* maximum with an internal scroll bar. Keep five clickable native metadata suggestions and keyboard-accessible controls; don't alter native playback, playlists, history, or recommendations.
- New real Electron CDP assertion requires 12px clearance above native player controls, internal vertical scrolling, and all five recommendation buttons; captures the same Similar state for before/after comparison. No streaming or automatic playback is performed.
- P5.1.86 round will only count complete after CI build/release and manual inspection of new screenshot.

## P5.1.85 — WatchFlow Plus Similar ranking / v4.23.169

- Inspected the actual P5.1.84 Electron WatchFlow screenshots. The Similar code first sorted by exact source group but then resorted all matches by playback score and alphabetical name, erasing group ordering for equally proven streams.
- Fixed evidence-first ordering with same-group as the next tie-breaker. Proven streams retain priority over unverified streams. Input playlists and watch history remain untouched.
- Added unit regression for same-group order and non-mutation, plus metadata-only Electron Similar screenshot assertion/capture. Never starts IPTV playback.
- This is one new patch cycle, not an assertion of 20 completed rounds; inspect CI and image before marking it complete.

## P5.1.80 — WatchFlow Plus / v4.23.164

- **Smart Zap**: một nút chuyển sang kênh khác theo tình trạng nguồn, bỏ kênh đã chết, tránh kênh đang phát và kênh vừa chuyển; chỉ phát sau thao tác người dùng.
- **Tiếp tục xem**: đọc lịch sử phát đã xác minh khung hình, sử dụng native Recent Channels, không ghi nhận việc phát không thành công.
- **Cùng gu**: đề xuất kênh cùng nhóm hay cùng thể loại với kênh hiện tại hoặc đã xem, không yêu cầu API/EPG bên ngoài.
- **Mix 5 hôm nay**: gợi ý năm kênh thuộc nhiều thể loại/nhóm, danh sách theo ngày; không tự chạy bất kỳ kênh nào.
- **QA**: Node regression tests, ảnh screenshot UI thật với 552 kênh giả lập metadata-only; không truy cập các luồng từ bộ QA.

# Positron P5 · 20 scoped upgrades (v4.23.84)

This release preserves all P4.1 source data/feature logic. It adds **20 independent CSS/UX upgrade gates** in `renderer/positron-twenty.css`, a small accessibility companion, and **20 new actual Electron screenshot scenarios** (not AI-generated screenshots). Legacy P4 50-round audit remains in place. The screenshot checks are not a claim of 20 independent AI self-repair cycles.

01. Increase keyboard target legibility.
02. Improve channel-list scrolling.
03. Prevent long channel labels breaking shelves.
04. Clarify secondary-filter disclosure.
05. Show player-tool disclosure selection.
06. Polish narrow-navigation hit areas.
07. Unify source-hub row surfaces.
08. Keep EPG search clear on dark themes.
09. Improve Doctor diagnostic readability.
10. Make Settings controls easier to navigate.
11. Keep Favorite cards within viewport.
12. Refine player control focus and grouping.
13. Distinguish disabled actions safely.
14. Make volume navigation keyboard-friendly.
15. Avoid caption toolbar clipping.
16. Keep status and subtitles readable.
17. Unify popup and modal keyboard focus.
18. Prevent advanced tools horizontal overflow.
19. Adapt forms at tablet widths.
20. Protect compact viewports without hiding features.

## Verification
- npm test and JavaScript syntax checks including Positron P5.
- Real Electron Xvfb/CDP: existing P4 50-stage audit plus 20 P5 page/theme/viewport scenarios.
- Windows x64 Setup + Portable, macOS Intel + Apple Silicon installers, separate immutable `positron/v4.23.84-p5.1` tag.
- Streaming with authorized live M3U, GPU decoding, PiP/AirPlay/Cast, DVR and Timeshift require physical-device validation; successful CI is not that validation.

## P5.1 real screenshot repair
- Inspected real Electron screenshots 14 and 15 and found bright white strips around Smart Discovery.
- The underlying `.source-hub-section` retained legacy light-theme background. Override only in Positron and test the computed surface luminance in both Sources screenshot rounds.

- Repaired screenshot workflow artifact filename assertions for P5.1 without renaming the real PNG files.
- Replaced OS-dependent orange emoji in Prev/Stop/Next (and fullscreen Prev/Next) with accessible monochrome inline SVG on the existing native buttons.
- Hid the duplicate brand icon under the sidebar toggle in the 54px icon rail; added real Electron screenshot assertions for both fixes.

## P5.1.1 — v4.23.85
- Correct the stale `P4 · 50 VÒNG` sidebar badge visible in the real P5.1 Electron Settings screenshot. Keep the current product label aligned with `P5.1.1`.
- Bump package and document title; update the immutable CI release tag and Windows/macOS installer checks for v4.23.85. The baseline P5.1 screenshot evidence remains historical and does not count as a newly captured repair round.
- Add a regression assertion for the sidebar badge. Actual Electron after-screenshots and CI must be independently reviewed before this is counted as a complete 20-round iteration.

## P5.1.2 — v4.23.86
- P5.1.1 screenshot `positron-p5-18-real.png` Settings revealed the replacement P5.1.1 badge partly hidden under the hamburger button. Fix with a compact release badge `P5.1.2`.
- Extend real Electron screenshot audit with badge clipping and menu intersection checks on desktop widths; preserve all IPTV state and playback.

## P5.1.3 — v4.23.87
- From real P5.1.2 Electron TV screenshot at 450px: the fullscreen control appeared as a tiny unclear glyph beside Cast/PiP.
- Replace its content with a clear stroke SVG while retaining the original button node and playback/fullscreen event handlers.
- Add real-Electron audit assertion that fullscreen button carries its SVG, and a source regression test. Maintain independent version/build/release tag and unchanged user data.

## NEW 20-round series · round 01/20 · P5.1.4 / v4.23.88
- Baseline is immutable P5.1.3, verified HEAD `d654707cd3b8440f6218814fd1b9dff6333c8da6` and real Electron screenshots from release.
- Issue: TV header at 450px rendered `Xem tr...`; root cause is desktop page name being shortened via CSS ellipsis in narrow heading container.
- Add semantic short page titles at narrow viewport while retaining the full title as text; add screenshot audit assertions and unit regression. No data or playback routines touched.
- Round completion pending actual GitHub Actions test/capture, visual after-screenshot inspection, and independent release verification.

## NEW 20-round series · round 02/20 · P5.1.5 / v4.23.89
- Input is real Electron `positron-p5-15-real.png` from P5.1.4 Sources at width 720px; toolbar page label `Nguồn...` was cut.
- Extend the original accessible full-text page title + short visible caption treatment to 760px (icon-rail breakpoint), preserving all page actions and native player controls.
- Add screenshot audit checks for Sources at 720px and the existing compact TV view. Release pending independent test, visual screenshot review, and CI results.

## NEW 20-round series · round 03/20 · P5.1.6 / v4.23.90
- Input from real P5.1.5 Sources 720 screenshot: Smart IPTV Discovery header section formed a near-black rectangular band RGB(9,15,30) against source navigation RGB(20,33,56).
- Correct root cause `.p20-07 #page-sources .source-hub-section` legacy `var(--po-bg)` override to consistent `var(--po-card)`; preserve dark contrast from P5.1 and add computed-background parity check in actual Electron screenshots.
- Round pending fresh screenshot validation, source tests, builds and immutable release.

- P5.1.6 in-round screenshot follow-up: parent section matched color, but `renderer/positron-fifty.css` forced `.source-hub-heading` back to `--po-bg`. Overridden with same card color and added real computed-style screenshot assertion for child.

## P5.1.7 · v4.23.91 – P5.1.6 incomplete screenshot-repair follow-up
- P5.1.6 real Electron screenshot proved that the Discovery parent background was fixed but `.source-hub-heading` remained a black band due to a separate P4 override. This version carries the verified child override and explicit screenshot regression for both child and parent.
- Version bumped to avoid overwriting an immutable P5.1.6 tag if its earlier concurrent workflow publishes; neither the old release nor its history are changed. Count as continuation of NEW round 03, not a new independent bugfix cycle.

## NEW screenshot-feedback series · Round 01/20 · P5.1.8 / 4.23.92
- Input: P5.1.7 real Electron `positron-p5-20-real.png` (Favorites 600px) and `positron-p5-09-real.png` (TV 450px), from successful run 44847464628.
- Problem: duplicated theme diamond and full label persist in compact toolbar. Root cause: P4 icon-only font-size selector loses CSS specificity to topbar button styling.
- P5-only fix: force 36px monochrome icon-only theme button below 600px without replacing listeners or accessibility labels. Adds Node test and Electron screenshot computed-style checks at 600/540/450.
- Evidence requires a new successful workflow, real after-image visual inspection, and immutable release asset verification. Do not count this round merely from a commit.

## NEW screenshot-feedback series · Round 02/20 · P5.1.9 / 4.23.93
- Input: real P5.1.8 / 600px Favorites screenshot `positron-p5-20-real.png`, reviewed after successful CI. Empty list has no action to add or reactivate an IPTV source, forcing users to hunt through the rail.
- Fix: additive `Quản lý nguồn IPTV` button inside the native empty state; uses the existing `IPTVState.setPage('sources')` without changing favorites storage, source data or playback.
- Regression: Node source assertions and a real Electron screenshot test that the action is visible and navigates to Sources; return to Favorites for screenshot.
- CI/release/manual after-image review must be separately confirmed.

## Screenshot-feedback series · Round 03/20 · P5.1.10 / 4.23.94
- Input: actual P5.1.9 600px Favorites screenshot after round 02 (successful Actions 44851699538): the previous generic empty-state copy says "when adding a source again" despite exactly zero sources; a new user gets misleading advice.
- Fix: text-only, non-destructive guidance based on live `#sourceCount` (0 vs active sources). Observe source changes, retain native Favorites list and the functional Sources CTA from P5.1.9.
- Regression: Node source test plus real Electron screenshot computed-text validation in Favorites, with the 70-scenario capture suite and full macOS/Windows CI.
- Pending after screenshot manual inspection, green jobs, and independent release confirmation.

## Screenshot-feedback series · Round 04/20 · P5.1.11 / 4.23.95
- Input: verified actual P5.1.10 Electron TV screenshot `positron-p5-09-real.png` at 450px. In the playback toolbar, next-program label is rendered as `Chưa có lịch tiếp ...`, losing the full EPG status.
- Root cause: strong inherited toolbar `white-space:nowrap!important;text-overflow:ellipsis!important` on EPG programme names, even when the mobile card has available vertical height.
- Fix: narrow-width (<=540px) Positron-only two-line-capable labels using normal whitespace/word wrapping, preserving programme IDs and original EPG navigation.
- Regression: source-level assertion plus actual Electron computed whiteSpace/textOverflow/scroll metrics for TV at 540 and 450; no programme or playback state changed.
- Await fresh screenshot manually reviewed and 6-job immutable release.

## Screenshot-feedback series · Round 05/20 · P5.1.12 / 4.23.96
- Input: actual P5.1.11 Settings screenshot at 1360px (`positron-p5-18-real.png`) shows command search label clipped with ellipsis ("Tìm kênh, trang, công cu..."). Real TV 450px shows the old tiny hard-to-recognize `⌕` glyph.
- Fix: concise visible label `Tìm kênh / trang`, dedicated monochrome scalable SVG magnifier and full accessible name. Preserve existing click, keyboard shortcut and original search modal.
- Regression: real Electron screenshot detects SVG, exact visible label, no desktop truncation, and checks button still opens/closes the command palette in Settings; Node source test.
- Await completed screenshot review, full CI and immutable release before certifying.

## Screenshot-feedback series · Round 06/20 · P5.1.13 / 4.23.97
- Input: actual P5.1.12 screenshot `positron-p5-18-real.png` Settings at 1360px. Native status text in 206px sidebar is visibly truncated as `Sẵn sàng • FFmpeg tích hợp: đ...`.
- Root cause: older P4 sidebar CSS `white-space:nowrap!important; overflow:hidden; text-overflow:ellipsis` despite enough vertical space for two lines.
- Fix: scope P5-only compact status to natural text wrap at desktop widths, minimum footer height and live full-value tooltip; preserve the real status updates and storage.
- Regression: real Electron computed whiteSpace, scroll/client height and text/title synchronization in settings; Node test. Pending manually inspecting new PNG and verifying immutable CI release.

## NEW user-file series · Round 01/20 · P5.1.14 / v4.23.98
- Baseline: P5.1.13, commit `bae4512d54c468daa2c57501494342eccb252704`, real Electron screenshot `p5-20-rounds/positron-p5-15-real.png` from Actions run 44853659787 and artifact 14686940738. The real image was opened and shows the native Smart Discovery scan-limit option truncated at 720px.
- Root cause: the text `Kiểm tra tất cả (không giới hạn)` is longer than the responsive native select width; page-level overflow checks miss internal select clipping.
- Fix: Positron-only presentation change of `option[value=all]` to `Tất cả kênh`, retaining selected value, source consent, channel limit semantics and a full native option tooltip; the help paragraph still clarifies unlimited scanning.
- Regression: Node source assertion, actual Electron Sources 720px screenshot assertion for unchanged `value=all`, new label and measured text width with space for the native arrow.
- Completion depends on independent CI, manual inspection of new real after-screenshot and all immutable release assets; no round should count from commit alone.

## Screenshot-feedback series · Round 07/20 · P5.1.15 / 4.23.99
- Input: latest externally updated P5.1.14 actual Doctor screenshot `positron-p5-19-real.png` at 1360px, CI run 44853954573. Six zero metrics give no actionable route to import a playlist. P5.1.14's unrelated Smart Discovery scan-limit fix is preserved.
- Fix: show theme-aware `Quản lý nguồn IPTV` button and explanatory message only when `#navCount` is zero, hide reactively when channels become available; preserve Doctor diagnostics.
- Regression: Node checks and real Electron Doctor screenshot/action click routes to Sources and back. QA/release verification must be separate.
- **Version coordination:** Previous attempt on P5.1.13 was discarded because a separate safe P5.1.14 commit advanced HEAD. This repair builds on latest HEAD, not force-pushed.

## New user-file series · Round 02/20 · P5.1.16 / 4.23.100
- Input: P5.1.15 actual Electron TV screenshot at 450px, `p5-20-rounds/positron-p5-09-real.png` from Actions 44854248390/artifact 14686737277, opened and reviewed.
- Finding: volume speaker is still `◖))` platform-specific Unicode, visually inconsistent with the existing SVG prev/stop/next and fullscreen icons.
- Root cause: the original HTML `label.volume-icon[for=volume]` has literal sound text rather than a vector. Make an SVG speaker icon in the existing Positron JS without changing label or range input nodes, volume listeners, playback or persistence.
- Regression: Electron screenshots for all TV viewports assert volume SVG exists, >=16px, and original `for=volume` link; Node source test checks structure and CSS.
- Completion must await green test, actual after screenshot opened, installers and release status. Do not call GitHub Release available if Actions token is denied HTTP 403.

## New user-file series · Round 03/20 · P5.1.17 / v4.23.101
- Input: actual P5.1.16 Electron TV screenshot at 450px `p5-20-rounds/positron-p5-09-real.png`, Actions 44854598346, capture artifact 14686174338, opened and reviewed.
- Visual defect: the existing Cast/AirPlay and PiP controls still show small OS-dependent square glyphs, inconsistent with SVG playback, volume, and fullscreen icons.
- Root cause: literal `▣` prefixes in native button contents. Replace *only* contents of existing `#castBtn` and `#pipBtn` with monochrome line SVG plus the readable original labels; preserve the exact buttons, listeners, aria labels, source/playback and user settings.
- New regression: Node source test plus Electron 20-case TV screenshot assertions for SVG presence, >=14px icon width, labels and ARIA on both buttons across width/theme variants. No hardware Cast or actual PiP operation is claimed from UI tests.
- Certification pending fresh Node tests, opened real after screenshot, CI installers and Release status (GitHub Actions token currently has 403 Release rights error).

## New user-file series · Round 04/20 · P5.1.18 / v4.23.102
- Input: P5.1.17 real Electron screenshot `p5-20-rounds/positron-p5-20-real.png`, Favorites at 600px, artifact 14687865062, opened and reviewed. Also examined the 450px TV screenshot.
- Defect: bottom live status text is very dim and ellipsized even though there is unused footer width. It obscures readiness/FFmpeg state on smaller windows.
- Root cause: legacy `.footer #footerText` enforces nowrap/ellipsis plus a multi-column footer grid even when its task dock is hidden. The original foreground is low contrast.
- Fix Positron-only CSS: readable 12px high-contrast status color, normal wrapping, and a 1-column footer only for <=760px while task dock is hidden. Leave footer text, live updates and task dock logic untouched.
- QA: add Electron screenshot computed-style, contrast ratio >=4.5:1, and text scroll dimension assertions at 600/540/450. Node regression test asserts scoping. Do not claim video-stream tests.
- Await Node and Electron screenshot, opened after-image, installers and immutable release evidence before marking completed.

### P5.1.18 follow-up: QA test parser root-cause correction
- Initial Node tests were green but Electron audit stopped at TV 600px with contrast ratio 0. Inspecting the audit source showed the new regexp written as `/\\d+/` in JavaScript source, which matches literal backslash instead of numeric RGB channels; no valid foreground/background luminance could be parsed.
- Correct the **test parser** to `/\d+(?:\.\d+)?/g` and add source regression. Keep the UI contrast CSS and SemVer exactly P5.1.18 / 4.23.102; rerun real Electron screenshots and determine success with actual computed contrast. No assertion is disabled or weakened.

## New user-file series · Round 05/20 · P5.1.19 / v4.23.103
- Input: P5.1.18 actual Electron TV 1360px screenshot `p5-20-rounds/positron-p5-01-real.png` (visible channel finder), plus keyboard QA of two existing keydown listeners.
- Found root cause: `renderer/positron.js` handles unmodified `/` first and opens global command palette. Later `renderer/positron-twenty.js` documents and handles `/` as a channel search shortcut on TV, but never receives an unconsumed event after the first handler opens the palette.
- Fix only the original Positron keyboard routing: when on TV and a visible channel search control exists, let the later listener focus it. Preserve command palette shortcut `Ctrl/⌘+K`, Escape closing, and slash-to-palette fallback when channel finder is hidden. Do not change player/source data or keyboard handling on other branches.
- Actual Electron regression: synthesize keydowns in desktop TV to verify slash focus, palette remains closed, Ctrl+K opens it and Escape closes; capture extra real image `positron-p5-19-slash-search-real.png` and maintain the 20 standard screenshot cases.
- Completion pending CI tests, screenshot image inspection and builder/release evidence.

## New user-file series · Round 06/20 · P5.1.20 / v4.23.104
- Input: P5.1.19 real Electron screenshot `p5-20-rounds/positron-p5-01-real.png`, TV desktop (Linux GitHub runner) opened and reviewed. Top command-palette toolbar still displays Mac-specific `⌘ K` even on Linux and Windows.
- Root cause: hard-coded `<kbd>⌘ K</kbd>` in the original Positron toolbar. The implementation already supports Ctrl+K and Meta+K but misleadingly labels every platform as Mac.
- Fix: set only the displayed shortcut hint and tooltip from the renderer platform. Keep the actual key handler, command palette, controls and `aria-keyshortcuts=Control+K Meta+K` unchanged. Mac gets `⌘ K`; Windows/Linux get `Ctrl K`.
- New regression: Node source check and actual Electron screenshots/DOM assertions for platform-appropriate label and full ARIA shortcuts on all P5 cases. No external data touched.
- Completion pending real after-screenshot review, CI and installer checks.

## P5.1.21 / v4.23.105 — independent screenshot repair round 01/20
- Input: actual P5.1.20 Electron TV screenshot positron-p5-09-real.png at 450px. The selected native fallback stream link is visibly truncated to Chua c....
- Root cause: the video-fit selector, fallback-link selector and Favorite button share a constrained narrow row.
- Fix: make the native stream select full width in its own row at <=540px; preserve original events, stream values, Favorites and persisted data.
- Tests: Node source regression, actual Electron option-text width and viewport-boundary checks. Post-patch screenshot/CI/release must be verified before completion.
- External release blocker: P5.1.18 and P5.1.19 Actions release jobs failed HTTP 403 Resource not accessible by integration despite successful tests, screenshots and installers.

## P5.1.22 — v4.23.106 (independent screenshot repair round 02/20)
- Input: real P5.1.21 Electron TV 450px after-image, toolbar Focus button displays an ambiguous square glyph.
- Root cause: P4 compact CSS paints a static square pseudo-element while native focus state changes only textual glyphs; the compact toolbar hides those glyphs.
- Fix: replace the icon with a monochrome SVG on the existing button; toggle paths for focus/restore, maintain native event and aria-pressed with descriptive label.
- Tests: Electron UI test clicks Focus twice at 450px, verifies aria-pressed, changed SVG path and recovery; Node source regression; screenshot visual review and installers/release pending verification.

## P5.1.23 — v4.23.107 (independent screenshot repair round 03/20)
- Input: actual P5.1.22 Electron 720px Sources screenshot positron-p5-15-real.png: the no-playlist empty guidance occupies excessive vertical space and pushes Smart Discovery down.
- Root cause: legacy .empty-list has 30px vertical padding and the following source section has 24px top margin, regardless of available viewport.
- Fix: on <=800px only when #sourcesList contains the empty-list, reduce the guidance padding to 12px and the subsequent Discovery margin to 12px. Existing source card layouts and IPTV data untouched.
- Tests: real Electron screenshot audit measures empty guidance height/padding and gap; Node source regression; release/after-screenshot review pending.

## P5.1.24 — v4.23.108 (independent screenshot repair round 04/20)
- Input: actual P5.1.23 Electron EPG 720px screenshot positron-p5-17-real.png shows an orange OS emoji before scheduled DVR heading while other Positron icons are monochrome.
- Root cause: hard-coded Unicode record glyph in the static DVR heading has platform-specific emoji rendering.
- Fix: use scoped inline recording SVG preserving heading text and dynamic localization, without altering DVR form, data, listeners or scheduling.
- Regression: real Electron EPG screenshots assert SVG presence/size/aria and unchanged DVR heading; Node source test; after-image/release pending.

## P5.1.25 — v4.23.109 (independent screenshot repair round 05/20)
- Input: P5.1.24 actual Electron EPG 720px screenshot shows a blank but enabled DVR channel select below the recording folder even though the user has zero sources.
- Root cause: dvr-ui.js updateChannels replaces options with an empty list and leaves the native selection enabled; no useful empty state is displayed.
- Fix in Positron UI layer: add a disabled clear no-channel placeholder, preserve native channel selection/listeners and re-enable automatically whenever real options appear; do not alter DVR storage or scheduling.
- Tests: Electron asserts disabled + placeholder on EPG 1360/720 and injects only an ephemeral DOM option to prove re-enable/re-disable; Node source regression. After-image and release pending.

## New screenshot-driven batch · Round 01/20 · P5.1.26 / v4.23.110
- Baseline P5.1.25 HEAD `f6243b50bb641e408d72201854f3ab129ec51b6b`, P5.1.24 real Electron Doctor 1360px screenshot from Actions artifact 14688244941. P5.1.25 changes DVR only, so Doctor screenshot shows unchanged before-state.
- Visual defect: while six channel metrics show zero, Doctor exposes live 'Chẩn đoán ngay', 'Phân tích' and 'Kiểm tra theo phạm vi' actions next to an existing source-management message.
- Fix: disable these analysis actions only when no channels exist, describe the disabled state with the existing source hint, and restore their native buttons whenever channels appear. Preserve previous reports, exports, sources, listeners and streaming state.
- Validation: source regression plus real Electron screenshot/DOM lifecycle assertion; this round is provisional until a successful CI run, opened after-image and release assets are verified. One independent fix/version, not twenty renamed tests.

## Screenshot-driven batch · Round 02/20 · P5.1.27 / v4.23.111
- Input: visually opened real P5.1.26 Electron Doctor 1360px screenshot, capture artifact 14688743177; prior version correctly disables Doctor Run/Analyze/Verify with zero sources, but top 'Kiểm tra link sâu' remains enabled.
- Root cause: P5.1.26 dynamic zero-channel guard omitted the original `#doctorDeepCheck` action.
- Repair: extend the existing state-preserving guard, including ARIA hint and automatic restoration on channel availability. Keep export and source-management CTA usable and preserve native diagnostics on loaded channels.
- Regression: Node/source assertions and real Electron screenshot lifecycle assertions now cover four actions. This round requires successful capture, opened after-image and actual build/release state to certify.

## Screenshot-driven batch · Round 03/20 · P5.1.28 / v4.23.112
- Input: actual P5.1.27 Electron Sources 1360px image from capture artifact 14689552049, opened and reviewed; empty-source guidance measured 83px high with 30px top/bottom padding and 24px gap to Smart Discovery.
- Root cause: existing P5.1.23 compact no-playlist CSS is limited to max-width 800px; desktop retains oversized legacy empty-state spacing.
- Fix: add a desktop-only min-width 801px no-source selector using the same compact layout (12px padding and margin), preserving populated lists, source data and Discovery navigation.
- Regression: Electron Sources 1360px geometry assertions (height <=57, padding <=14px, gap <=20px) and Node source check; require actual next screenshot review, CI and immutable release before confirming completion.

## Screenshot-driven batch · Round 04/20 · P5.1.29 / v4.23.113
- Input: actual P5.1.28 Electron Sources 1360px screenshot from capture artifact 14689292042, opened; the 'Trạng thái' status-filter label wraps onto two short lines while adjacent search stretches to fill the row.
- Root cause: base .smart-result-filters flex container allows label to shrink despite available room; search input claims flexible width.
- Fix: P5-only, no-storage-change no-wrap and non-shrinking status filter label with search input flexible width; preserve select and search listeners and full keyboard navigation.
- Regression: Node source assertion and real Electron screenshot audit count text line rects, white-space and flexShrink across Sources views, plus UI overflow checks. Completion requires full CI, visual after-image and release evidence.

## Screenshot-driven batch · Round 05/20 · P5.1.30 / v4.23.114
- Input: actual P5.1.29 Electron EPG 1360px image from capture artifact 14689795888, opened; DVR channel select is disabled showing 'Chưa có kênh để ghi hình' but the green 'Đặt lịch ghi' submit remains visibly clickable.
- Root cause: P5.1.25 guarded `#dvrChannel` only, not the native `#dvrAdd` form submit.
- Repair: reuse same channel observer to disable the native DVR submission when no channel options exist, link its ARIA description to the channel selector, restore exactly when channels return, preserve all scheduled jobs, title/date fields, callbacks, recordings and data.
- Regression: real Electron EPG 1360/720 screenshots, DOM assertions and lifecycle simulation (empty → populated → empty) for both selector and submit; Node source assertions. Version and release require full CI and manual screenshot review.

## Screenshot-driven batch · Round 06/20 · P5.1.31 / v4.23.115
- Input: actual P5.1.30 Electron TV 450px screenshot from capture artifact 14690060103, opened; compact disclosure displays English 'Timeshift · Ghi hình · Công cụ' even though the app calls the feature 'Tua lại' elsewhere.
- Root cause: `renderer/positron-fifty.js` hardcoded the old mixed-language label and tooltip in `syncTools`.
- Repair: use 'Tua lại' in the closed disclosure and tooltip, preserving the native open/close state machine, ARIA expanded state and content visibility; do not touch streaming logic.
- Regression: real Electron TV 450px screenshot after reopening/closing the tools disclosure, assert tooltip, visible Vietnamese wording and click transitions. Node source regression. Tag/build only after full verification.

## Screenshot-driven batch · Round 07/20 · P5.1.32 / v4.23.116
- Input: real P5.1.31 Electron TV 450px screenshot, actual capture artifact 14690160671, opened; header Studio theme selection appears as a tiny font-dependent diamond. Audit confirms the old `::before` uses content `"◈"`.
- Root cause: P5.1.8 compact button emulates an icon with font glyph despite the other toolbar controls using theme-aware SVG.
- Fix: give the existing native Studio button a monochrome half-circle SVG + readable desktop label; hide previous pseudo glyph at compact breakpoints, preserving aria-label, title, expanded state, click listener and palette persistence.
- Regression: Node syntax/source; real Electron 450/600 screenshots assert vector dimensions, no pseudo-glyph and open/close Studio menu lifecycle. Require CI success, opened PNG and release validation.

## Screenshot-driven batch · Round 08/20 · P5.1.33 / v4.23.117
- Input: P5.1.32 Electron TV 450px real screenshot from capture artifact 14689029565, opened; right-hand favorite star is active-looking even when 'Chưa chọn kênh' is shown.
- Root cause: native `updatePlayerFavorite()` updates pressed style but does not disable the action when current channel is null.
- Repair: a nonintrusive Positron guard references `window.IPTVState.getCurrent()` (native selection), disables only the no-channel star, supplies accessible description via playingTitle, and re-enables on native title/pressed state changes; leaves Favorites store, events, current channel and playback untouched.
- Regression: static tests and real Electron 450px screenshot/DOM assertions for no-channel disabled icon and accessibility. Requires after-screenshot inspection and full CI validation before certification.

## File (8) batch · Round 01/20 · P5.1.34 / v4.23.118
- Direct visual input: opened real P5.1.32 Electron EPG 1360px screenshot (capture artifact 14689029565). The following P5.1.33 commit only altered TV Favorites, leaving this EPG state unchanged.
- Observed: disabled no-channel `Đặt lịch ghi` retains a vivid teal active-action appearance; P5.1.30 CSS only changed opacity.
- Repair: neutral theme-aware disabled background, text and border, grayscale and not-allowed cursor, only when `[data-positron-no-channels=true]` is set. Native scheduling form/re-enable logic and all M3U data untouched.
- Validate: Node source regression and Electron screenshots with style assertions on both EPG viewports. New screenshot must be opened and checked before certifying the round.

## File (8) batch · Round 02/20 · P5.1.35 / v4.23.119
- Input: actually opened P5.1.34 EPG 1360px screenshot from GitHub Actions artifact 14690910182. The disabled DVR action is now neutral, but its small square recording glyph remains font/platform-dependent.
- Repair: insert currentColor recording SVG inside existing `#dvrAdd` button and keep original button/form listeners. The label remains `Đặt lịch ghi`, the vector is aria-hidden, and P5.1.34 neutral disabled style still applies.
- Regression: Node source test and actual Electron EPG screenshot assertions for vector presence, accessible button caption, disabled guard and color at 1360/720; complete only after visual review and release check.

## File (8) batch · Round 03/20 · P5.1.36 / v4.23.120
- Baseline: opened real P5.1.35 Electron EPG 1360px / 720px screenshots from captured artifact 14690880372; program search guidance text is very faint on a dark background.
- Fix `#epgSearchResults` foreground and typography with a narrowly scoped Positron theme-aware rule, without modifying EPG parsing, searches, schedules, channels, or persistent data.
- Regression: real Electron screenshot audit at both widths asserts computed luma >= 140, font 13px, full opacity and zero horizontal overflow; Node source tests. Must visually review after captures before counting the round.

## File (8) batch · Round 04/20 · P5.1.37 / v4.23.121
- Input: opened P5.1.36 real Electron TV 450px screenshot from artifact 14690358283; main purple Play appears enabled although zero playlists/channels are loaded.
- Native Play normally auto-starts first enabled channel. Disable it only when no channels exist and no current playing channel can resume. Use a MutationObserver on channel counter and current-title state to restore native action when channels become available; never replace button listeners.
- Regression: real Electron TV 450px screenshot and Node assertion for disabled guard, opacity, cursor, dynamic 0→1→0 restoration; do not count until screenshot review and release verification.

P5.1.37 same-round screenshot feedback: Electron capture failed TV 450px at computed Play opacity after a native legacy selector forced 1 with `!important`. Corrected exact selector specificity on Positron disabled Play, preserving real active-play theme styling. Re-run full test+screenshots before release; do not count failed first attempt.

## File (8) batch · Round 05/20 · P5.1.38 / v4.23.122
- Input: inspected P5.1.37 corrected actual Electron TV 450px capture artifact 14690836496; Play now has `opacity=0.5` when no channel, but adjacent Prev / Stop / Next still look enabled with zero channels.
- Repair: scope a stateful disabled guard to the native three transport buttons; Prev/Next reactivate with channels while Stop requires a current selected channel. Keep all original listeners and the current playback state intact.
- Verify: Node source tests and actual TV Electron audit at 450px check disabled styling, dynamic simulated 0→1→0 channel counter lifecycle, zero overflow. Capture/release must succeed before the round counts.

## File (8) batch · Round 06/20 · P5.1.39 / v4.23.123
- Input: opened P5.1.38 actual Electron TV at 450px (artifact 14690444645); main and navigation controls correctly disabled with no channel, while Cast/AirPlay and PiP still look available.
- Confirmed root cause: native Cast click handler in `renderer/app.js` only emits 'Chọn kênh trước' warning with no current channel; PiP requires a selected video. Keep native button nodes, SVG icons and event handlers, guard only missing-current case and restore when a channel is selected.
- Regression: Electron 450px real screenshot computed disabled status, SVG retained and contrast for Cast/PiP, with Node source tests; playback/Cast discovery with actual legal streams remains untested.

## File (8) batch · Round 07/20 · P5.1.40 / v4.23.124
- Input: opened actual P5.1.39 Electron TV 450px screenshot artifact 14690383363; main controls and Cast/PiP are now appropriately disabled with zero channels, but the large `▶` in the empty-video panel remains bright and looks clickable although it has no event handler.
- Repair: replace only the original `.empty-icon` text with a simple currentColor television SVG (`aria-hidden`, non-interactive), retain real import buttons, video DOM and native logic. Theme-aware muted color reduces false button affordance.
- Regression: full Node tests and real TV 450px Electron screenshot asserts vector, aria-hidden, no leftover glyph and 28px sizing; version and immutable release metadata advanced. Requires screenshot review, CI and release verification.

## File (8) batch · Round 08/20 · P5.1.41 / v4.23.125
- Input: opened actual P5.1.40 Electron Settings 1360px screenshot from artifact 14691385846; logged-out Supabase account panel is >300px tall before any PiP/Theme/Backup setting accordions.
- Repair: Positron-only desktop CSS compresses logged-out card padding, header, status, help link and footer spacing; preserves OTP/email input and submit button native min-height 44px, no auth logic or data changes. Logged-in/mobile unaffected by `:has(#portableCloudEmailForm:not([hidden]))` and `@media(min-width:900px)`.
- Regression: real Electron Settings screenshot checks card height 200–290px, input/button >=42px, status visible; Node CSS source test. Must inspect after image and verify CI/release before counting.

## File (8) batch · Round 09/20 · P5.1.43 / v4.23.127
- Input: opened P5.1.41 actual Electron Doctor at 1360px, artifact 14691221839. Zero-channel guard correctly disables analyses, but primary buttons `Chẩn đoán ngay` and `Phân tích` still show light beige, unlike disabled secondary actions.
- Cause: legacy primary button palette has greater visual emphasis, not overridden by empty-source guard.
- Repair: state-specific Positron Doctor CSS enforces neutral background/text, grayscale and disabled pointer only for four buttons with `:disabled[data-positron-no-channels=true]`. Native analysis, source data, report/export untouched.
- Regression: Node source test; real Electron screenshot check each Doctor button is disabled, guarded and neutral with background luma <140. Await direct screenshot review/CI/release before certifying.


## File (9) · New repair round 01/20 · P5.1.43 / v4.23.127
- Baseline verified: P5.1.43 HEAD ef5eae4e54bf; actual screenshot P5.1.41 Sources at 720px showed the source catalog already set to iptv-org/country/VN, but the initial status still said to select a catalog first; P5.1.43 only adjusted Doctor, so this Sources issue persisted.
- Correct only Smart Discovery initial source guidance in Positron renderer; leave default catalog, network fetch, consent, playlists, streaming and existing event handlers untouched.
- Add Node assertion and real Electron Sources screenshot audit of select value and status. Screenshot review, CI and Release assets must be checked before marking the new round complete.

P5.1.43 same-round regression repair: first CI run 44864848127 failed 2/606 Node tests (native i18n audit) because the edited default Source instruction had no translations. Added full offline translations for 16 non-Vietnamese locales in `renderer/i18n.js`, kept original dictionaries/streams untouched, added localization coverage test. Retest CI and actual Electron screenshot before certification.\n
## File (8) batch · Round 10/20 · P5.1.44 / v4.23.128
- Read actual P5.1.43 Electron Favorites 600x820 screenshot (artifact 14691567509): no-source instructions/CTA stranded near y230–320, large unused empty region below.
- Center the existing empty Favorites CTA within compact viewport via scoped CSS without touching channel data, source button listeners or nonempty/desktop lists; geometry audit checks top>=300 and button above status footer.
- Correct P5.1.43 workflow tag mismatch: new version's tag is `positron/v4.23.128-p5.1.44`, matching displayed version, instead of carrying prior p5.1.42 suffix. Retain historical tags/commits.
- Real Electron screenshot and full Node CI pending, do not mark complete before opening image and verification.

## File (9), screenshot-driven round 02/20 — P5.1.45 / v4.23.129
- Input: actual P5.1.44 Electron screenshot positron-p5-17-real.png (720px). EPG missing-data text asks users to open Settings and find 'Cập nhật EPG ngay', while visible action is 'Nguồn EPG'.
- Root cause: renderer/features.js EPG empty fallback text did not match existing epgSettingsBtn, which opens the EPG settings section.
- Fix only default missing-data prose and translate all 17 native locales. Do not change EPG fetch, XMLTV, reminders, recordings or playlist data.
- Add Node regression and Electron audit checks at EPG 1360px and 720px, synchronize build version and stale CI artifact naming.
- Await CI, actual after screenshot, build and release verification; release token HTTP 403 remains a blocker.

## File (9) screenshot-driven repair round 03/20 — Positron P5.1.46 / v4.23.130
- Evidence: opened P5.1.45 genuine Electron EPG screenshots at 720px / 1360px. Unavailable DVR recording form, date fields, and disabled Add Schedule consume substantial viewport space when there are zero channels.
- Preserve native form and saved schedules. Only hide unusable form/help for zero source channels; retain recording directory, history, actions. Display existing localized no-channel status and Quản lý nguồn IPTV shortcut, automatically restore form if a channel becomes selectable.
- Add Node regression and actual Electron screenshot audits of both sizes, plus live DOM simulation of channel arrival/removal proving reversibility.
- Release consistency correction: P5.1.45 / v4.23.129 CI succeeded but produced a GitHub Release with INCONSISTENT tag positron/v4.23.129-p5.1.44. Preserve that immutable tag; P5.1.46 workflow explicitly uses positron/v4.23.130-p5.1.46, with test verifying package.json SemVer + P-label. Do not claim P5.1.45 was correctly tagged.
- Test, capture, Windows and macOS builds, Release asset verification remain prerequisites for certification.

P5.1.46 same-version CI repair: run 44866650681 failed 2/611 because historical Positron test assertions still expected P5.1.44 release tag and P5.1.45 badge while actual manifest, workflow and badge correctly specify P5.1.46. Correct these assertions to dynamically derive the P-label from package.json description; never suppress mismatch. New test/capture/build/release required.

## File (9) round 04/20 — P5.1.47 / 4.23.131
- Observed in actual P5.1.46 Electron 720px/1360px EPG screenshots: no channels, DVR schedule form correctly hidden, but native status still displays "Sẵn sàng đặt lịch ghi..." despite scheduling impossible.
- Cause: renderer/dvr-ui.js originally sets an unconditional idle-ready status on first load; Positron P5.1.46 suppressed the form only.
- Repair strictly Positron-local: while no schedulable channel and native text equals its known idle-ready message (including offline locale translation), hide only that specific status. Keep native message in DOM and show it again if a channel arrives. Never suppress actual DVR errors, ongoing recording statuses, saved schedules, or folder controls.
- Add Node and real Electron 720px/1360px screenshot checks, including synthetic selectable channel/rollback to verify restoration and no phantom readiness.
- Continue SemVer/P-label increment and immutable release tag validation.

## File (9), round 05/20 — P5.1.48 / v4.23.132
- Input: visually opened P5.1.47 actual Electron EPG 1360px screenshot. It shows zero channels yet guide footer blames unmatched XMLTV/tvg-id in an existing playlist, which cannot be accurate when there is no playlist.
- Root cause: renderer/features.js renderEPG() uses the same empty-guide text regardless of channels.length.
- Repair: branch on actual channel count. When there are zero channels, instruct to add an M3U playlist through Quản lý nguồn. When channels exist but EPG has no matches, preserve the original matching/tvg-id guidance.
- Build the empty node using textContent rather than innerHTML; add all 16 non-Vietnamese offline translations and Electron screenshot assertion for 720px and 1360px guide.
- Preserve EPG data/offset/cache, source import, existing programmes and favorites. Await individual CI/release proof.

## File (9) round 06/20 — P5.1.51 / v4.23.135
- Real screenshot P5.1.48 EPG 1360px/720px shows 0 channels but ↻ Tải lại EPG is highlighted and clickable; native refreshEPG() only warns instead of loading because no M3U playlist.
- Root cause: no-channel UI state omitted from reload button guard; native EPG data and service are not modified.
- Positron only: disable the reload CTA while zero channels, mark precisely when Positron owns this disabled state, style muted, restore only own state once navCount changes. Do not override native in-flight load (`epgLoadBtn.disabled`).
- Add real Electron snapshot assertion at 1360px/720px and synthetic nav-count 0→1→0 transition proving reversible control. Keep the Nguồn EPG button enabled and playlist/cached guide/EPG data intact.
- Check separate CI/test/screenshots/build and immutable tag before certification.

## P5.1.51 — Screenshot-reviewed DVR empty-state repair
- Inspected actual P5.1.49 Electron EPG screenshot at 720px (`positron-p5-17-real.png`): empty DVR history offered manual scheduling while no IPTV channels exist.
- `renderer/dvr-ui.js` now provides source-import guidance when there are no recordable HTTP(S) channels, while preserving EPG/manual-schedule instructions when channels are available. Existing jobs and DVR APIs unchanged.
- Added Node source regression test and version-synchronized Windows scripts. Require fresh Electron screenshot and full CI/build before certification.

## P5.1.51 — Real EPG screenshot review: no-data search guidance
- P5.1.50 inherits the verified real Electron P5.1.49 EPG 720px screenshot showing no EPG guide alongside an active programme-search control.
- When the user searches without any EPG programmes, `renderer/advanced.js` now explains that guide data must be loaded through Nguồn EPG instead of presenting the misleading no-match result. Normal EPG searching and reminders are untouched once programmes exist.
- Add regression tests; require GitHub CI, real Electron screenshots, Windows and Mac builds and immutable release verification before marking complete.

## Positron P5.1.52 (Electron 4.23.136) — remove nonfunctional EPG clutter in empty state
- Reference: P5.1.51 actual Electron screenshot `positron-p5-17-real.png` (EPG 720px) and `positron-p5-16-real.png` (EPG 1360px), verified from workflow 44869443462.
- Root cause: programme-search, manual XMLTV mapping and offset controls were rendered unconditionally even when there were zero loaded EPG programmes. This used screen space but those operations could not produce useful results.
- New Positron-only UI state hides the EPG channel filter and advanced search/mapping/offset row **only** when the current guide contains no programmes. Original DOM, handlers and saved values are unchanged, and a native EPG summary mutation automatically restores controls when XMLTV programmes appear.
- The visible Nguồn EPG button, empty-guide explanation, cached guide, DVR and all playback settings remain intact. No features or user data are deleted.
- Regression: assert real Electron empty state at 1360px and 720px; emulate a temporary in-memory guide entry to verify controls reappear and disappear again; assert all native controls still exist. No synthetic screenshot is accepted as a real streaming test.
- Requires new GitHub Actions test, screenshots, both Windows x64 EXE installers and macOS builds before release is verified.

## Positron P5.1.53 (Electron 4.23.137) — remove duplicate empty EPG search copy; refresh live guide search
- Input: actual P5.1.52 Electron 720px EPG screenshot `positron-p5-17-real.png` from workflow 44870313583, visually opened and compared with P5.1.51.
- Found: after the P5.1.52 no-guide filters are hidden, `#epgSearchResults` still repeats an almost identical no-guide message already supplied by the native `#epgSummary`.
- Also found potential runtime stale text: after an asynchronous EPG load, previously rendered search results could keep the no-data message even though programme controls are restored.
- Repair: Positron-only empty-state CSS hides just redundant search status while guide is empty; original native EPG summary and Nguồn EPG remain visible. When programme data first becomes available on the active EPG page, reuse existing `IPTVProAdvanced.onPage('epg')` to refresh search-result text; user inputs, saved mappings and guide are preserved.
- Tests: real Electron audit at EPG 1360px/720px checks suppression plus reversible show/hide and verifies search text updates when temporary in-memory QA programme appears. Screenshot audit is not proof of live TV playback.
- Release condition: full tests + actual before/after Electron screenshots + Windows/macOS packaging + non-overwriting tag P5.1.53.

## Positron P5.1.54 / Electron 4.23.138 — TV and media controls overhaul
- User-provided real Windows 1536x960 screenshot of a populated IPTV playlist revealed visual clutter: oversized gold round Pause, weak icon consistency, harsh multi-layer cards and tight channel/transport/player columns.
- Redesign the TV workspace as a calmer flat dark layout with 188px app navigation, 244px max channel list, reduced header/padding, gentle selection and uncluttered cards. Media transport is now a compact 44px rounded-square Play/Pause surface and consistent 20px outline SVG icons for navigation, Cast, PiP and fullscreen.
- Preserve actual DOM button identities and native Electron playback handlers; CSS pseudo icon mirrors native '▶' / 'Ⅱ' via data-po-playing without changing player internals or stream URLs. Keyboard aria-label and tooltips track native state.
- Reference local user playlist `iptv.m3u` inspected offline only: 552 entries in 52 groups, 552 logo attributes, 515 HTTPS / 37 HTTP stream URLs; 226 entries have no tvg-id. The user playlist, its potentially sensitive URLs and access credentials are NOT committed or uploaded. No live URL playback or network access was asserted; verify stream usage rights before testing playback.
- New files: `renderer/positron-media-v2.css` and `renderer/positron-media-v2.js`, loaded last to safely outrank the accumulated legacy player/theme CSS, without changing Mac/Windows media pipeline or EPG.
- Regression: JS syntax, source-preserving static tests, real Electron 20-screen P5/50-screen P4 screenshot audit (compact Play size, vector output, native pause/play state transitions) plus macOS and Windows EXE builders. Do not report installer success until artifacts exist.

## Positron P5.1.55 / Electron 4.23.139 — TV-first layout architecture
- Trigger: user's real Windows screenshot and candid review of P5.1.54. Cosmetic recoloring cannot fix the three-competing-panel hierarchy, oversized sidebar, stacked media and redundant tool strips.
- Adds a **default 76px navigation rail** with original full navigation always reachable via a reversible Expand button (210px). Reuses all original page controls, commands, persistence, roles and keyboard handlers. Additional tool icons are real inlined outline SVGs; every native nav button gets a descriptive tooltip and ARIA name.
- Reclaims the extra full-width tools bar: moves existing `#positronToolsToggle` into transport output controls without replacing the native handler; the original P4 advanced tools remain in their collapsible region and fully functional. Moves the existing secondary filter button into the channel search field. No controls or settings are deleted.
- Focuses the main video: narrower channel list, neutral slate surfaces without shiny gradients, compact 51px header, calm channel selection, single media row where space permits, and retaining EPG/alternate-link selectors below. The known P4 high-specificity 52px rounded Play CSS is explicitly overridden by the current 43px square media control. The video element, fullscreen overlay, live captions, playback pipeline and source data are never restyled or rewritten.
- Metadata-only visual QA: after the existing 70 real-Electron empty-state screenshots, import an **ephemeral synthetic 552-channel M3U** with nonresolving example.invalid media URLs to verify a populated channel list at desktop width. This is not a live stream playback test. No content, tokens or stream URLs from the user-supplied M3U are published to CI or GitHub.
- Adds static regression tests for navigation affordances, non-destructive tools/filter relocation and compatibility with native playback; Electron screenshots also assert the rail expands and collapses, Play stays square, and hidden secondary actions remain reachable.
- Follow-up acceptance must rely on actual screenshots, 0-test-failure CI and confirmed Windows x64 EXE installers, not version numbers alone.


## P5.1.56 / v4.23.140 · HORIZON — full-product redesign + WatchFlow
- Source: reviewed actual P5.1.55 Electron TV 1360×823 capture, Actions #44872760322 (artifact #14694268911). The latest capture had 50 successful P4 screenshot iterations but failed the P5 audit because a persisted intentionally expanded navigation rail was incorrectly required to be <=90px. P5.1.55 has NOT been certified/released.
- Product-level redesign: new final stylesheet `positron-horizon-v4.css` unifies navigation, top command bar, channel library, cinematic stage, player docking, EPG strip and the visuals of Sources, Doctor, Settings, Health and other secondary pages. Removes excessive panel chrome, introduces one restrained mint accent, increases hierarchy, restores a larger video area and keeps responsive/accessible controls. The original playback/video-fit, captions, network, DRM, source-consent, backend and data functions are untouched.
- New functional workflow: WatchFlow. On-demand recommendations from actual enabled native channels, modes News/Sports/Movies/Music/Kids/All, verified-status priority, recently played boost, explainable evidence, skip suggestions without repeats until exhausted, one-click native play, and a rights-conscious no-playlist setup path. Fully local: no generated channel URLs, remote AI claims, EPG fabrications, network requests or silent autoplay/imports.
- Real testing: new pure `positron-watchflow-core.js` plus `positron-horizon-v4.js`, Node fixtures in `tests/positron-watchflow.test.cjs`; Electron capture audit adds WatchFlow open/close + topic count and recognizes intentional rail expanded/compact states rather than failing valid preferences.
- Explicit verification requirement: do not claim release, successful Windows EXE, or full visual approval until this commit's Actions tests, 70 real Electron captures, image review, builds and release assets are inspected. No previous source branch is modified.

### P5.1.56 follow-up · screenshot-found sidebar conflict
- First Horizon Node tests passed, but Electron capture run #44873746200 failed: P4's `.p50-01 #appShell > #appSidebar` specificity still forced 206px even while the new Horizon compact rail state was selected.
- Root-cause fix adds a more specific compact 68px / explicit expanded 206px layout rule; native hidden-sidebar preference remains respected, removes the duplicate legacy burger and gives empty-player onboarding the actual full stage instead of a nested inset rectangle.
- Electron audit now **clicks** expand/compact twice and checks measured widths plus restoration, and captures an additional real WatchFlow panel screenshot. No version bump: same P5.1.56 round; build release remains pending fresh CI confirmation.

### P5.1.56 screenshot follow-up #2
- CI attempt #44874090231 reached the redesigned TV 1360 screenshot and the interactive WatchFlow capture. It detected a second inherited P50 style conflict at 1250px: search label max-width:110px clipped visible text.
- The 1360px screenshot also showed overflowing native sidebar labels after the width issue was fixed. Horizon now explicitly hides only rail text in compact mode (keeping SVG and full tooltip/ARIA) and restores it in expanded mode. At 1000–1280px the command button allows its actual text width, avoiding ellipsis. These are substantive visual regressions found in actual Electron captures, not simulated placeholders.
- Retest same immutable P5.1.56 target until UI audit and CI succeed; no misleading release claim.


## P5.1.57 / v4.23.141 · Horizon visual QA and WatchFlow native integration
- Baseline: P5.1.56 v4.23.140, git SHA 38a28739b8e003f59cb3b863bc8df4a0ddb10e2b, all six GitHub Actions jobs successful and actual Setup/Portable Windows x64 and Mac DMGs published. Do not change or overwrite that immutable release.
- Actual Electron WatchFlow 1360 screenshot review discovered dark/low-contrast heading on the panel from legacy Studio theme cascade. The final Horizon layer now uses high-specificity accessible pale title, and the Electron audit asserts computed RGB > 200.
- WatchFlow integration QA now opens the actual Electron panel after importing the existing 552 strictly metadata-only synthetic QA channels into native IPTVState: confirms 552 eligible channels, 3 native action cards, three *different* suggestions after 'Gợi ý khác', captures a populated WatchFlow PNG, and asserts no channel was played or URL accessed.
- No changes to M3U ownership, streaming, Favorites, EPG, encrypted sources, Supabase, platform integrations or media pipeline. Reverify Node, 70 real Electron screenshot cases, Windows/macOS builds, and immutable new tag before certifying.


## P5.1.58 / v4.23.142 — Compact Favorites title duplication from real Electron screenshot
- Previous release: P5.1.57 / v4.23.141 HEAD 3a8bd1b6c80b5bb6165db1990915f61c47074f6f, successful CI 44874945170.
- Opened actual Electron screenshot at 600px: `p5-20-rounds/positron-p5-20-real.png`. Top header displayed "Kênh yêu thíchYêu thích" simultaneously.
- Root cause: Horizon later style `#positronBar .p-heading strong{font-size:13px!important}` overrides compact P5 `font-size:0` while short `::after` text remains visible.
- Fix: scoped Horizon-only responsive strong/::after rules; keep full accessible native text and render one short visual label. Add native Electron computed font-size/pseudo assertions and Node regression.
- Verification gate: native CI capture and post-change PNG review, full Node tests, Windows/macOS artifacts, immutable release check. No playback/source code changed.


## P5.1.59 / v4.23.143 — Horizon scrollbar contrast consistency, screen-based follow-up
- Input: Genuine P5.1.58 TV 600px, TV 1360px and populated 552-channel WatchFlow screenshots: legacy bright purple scrollbars persist despite muted-teal Horizon transport palette.
- Root cause: ui-polish global scroll style derives thumb from legacy --ui-primary, while Horizon only set --po-accent.
- Scope correction: set --iptv-scroll-thumb / --iptv-scroll-track only under .po-v3.po-horizon. Preserve scrollbar functionality, user playlists and other themes, add real Electron computed-style tests at 600px and 1360px, leave stream playback unchanged.
- Gate: full Node test, actual Electron before/after PNG review, Mac/Windows CI and unique release tag. No claim until checks pass.


## P5.1.60 / v4.23.144 — WatchFlow diversified recommendations by native playlist group
- Genuine prior P5.1.59 WatchFlow QA screenshot with 552 metadata-only channels displays three adjacent QA Channel 004/005/006 recommendations all within "01 Main channels" although there are three source groups.
- Root cause: deterministic score/name sort returned the first 3 without source-group diversity.
- Change: retain score-based evidence priority; for same/nearly equal score (within 18 points), pick one per distinct native group before filling remaining slots. Refresh still excludes already-seen items, never changes native data, never requests or plays streams.
- Regression: two Node tests ensure 3 distinct groups, preservation of proven live preference, immutability; Electron metadata QA asserts first three and refreshed three cover 3 native groups; re-open real PNG to confirm.
- CI/release: pending validation. No claim of testing actual IPTV playback; local metadata only.


## P5.1.61 / v4.23.145 — Channel group header dark contrast from native 552-channel screenshot
- Input: P5.1.60 actual Electron 552-channel WatchFlow QA PNG shows bright lavender/white folder header "01 Main channels" with purple text in an otherwise dark/turquoise Horizon UI.
- Root cause: legacy theme and UI-preset CSS styles for .folder-header are applied after native metadata imports and are not overridden by the Horizon layer.
- Fix: scope the populated folder header background/foreground (and arrow/count) to Horizon dark teal; preserve folder click/drag events and source data. Test computed dark RGB background and teal ink in native Electron after importing 552 metadata-only QA channels.
- Before/after real PNG manual review, Node, multi-platform build and immutable release required to certify.


## P5.1.62 / v4.23.146 — Legacy AI/CC toolbar purple color persists inside Horizon
- Input: P5.1.61 native Electron TV 600px PNG p5-20-rounds/positron-p5-07-real.png, personally opened. Visually purple "CC Phụ đề · Dịch · Giọng nói" chip amongst teal Horizon controls.
- Root cause: legacy renderer/unified-ai-inline-v1.css declares #bd83ec border, #322044 background, #c587f2 CC badge !important. Positron previous palettes also leave global --ui-primary / --accent inconsistent.
- Repair: only Horizon skin explicitly defines coherent root accent variables and scoped AI toggle/button/mark/hover colors, retaining existing native control listeners, keyboard interaction, playlist, caption, translate and TTS behavior.
- Proof gate: full Node unit, screenshot Electron TV 600/1360 computed palette/assertions, manually opened AFTER PNG; six-job Mac/Win immutable release.


## P5.1.63 / v4.23.147 — Empty WatchFlow must not hide playlist import
- Input: P5.1.62 real Electron 1360px `positron-watchflow-1360-night-real.png`, run 44894869647, personally reviewed; the 440px fixed panel intersects the main player URL-import action.
- Cause: WatchFlow's popup never differentiated zero native channels from available recommendations, showing six unusable genre filters and a wide overlay.
- Code: mark empty playlist at render, narrow the popup to 310px above 1280px, hide unused category filters and keep the native sources entry in its empty state. Populated channel recommendations and playback code remain unchanged.
- Evidence gate: Node regression, three-theme 1360px real Electron geometry assertions for non-overlap with #emptyUrlBtn, new after PNG screenshot review, multi-platform CI release verification. Do not certify before those checks.


## P5.1.64 / v4.23.148 — Empty WatchFlow overlaps primary player heading
- Input: P5.1.63 real Electron screenshots `positron-watchflow-1360-night-real.png` and Aurora counterpart from Actions run 44896009698, personally reviewed. The smaller panel stopped obscuring the M3U and URL buttons but still covered the far-right portion of the native "Sẵn sàng xem truyền hình" heading.
- Root cause: the no-source panel redundantly repeats intro help above its empty-state card, extending from y72 to roughly y370 over the heading. The empty card already contains the source-access explanation and call to action.
- Fix: hide only the redundant WatchFlow intro paragraph when there are zero native channels; do not change populated recommendations, button listeners or playlist data.
- Regression: three real Electron 1360px themes calculate two-dimensional overlay intersection against both the native `#emptyPlayer h2` and Add URL. Reopen after screenshots and confirm build/release before counting the round.


## P5.1.65 / v4.23.149 — Restore keyboard navigation inside WatchFlow
- Input: Actual P5.1.64 Electron 1360px open WatchFlow screenshot and source-level interaction review: the floating dialog's `openPanel()` leaves active keyboard focus on the topbar trigger because the dialog is appended at end of `<body>`; Tab cannot immediately reach its useful actions.
- Fix: Focus the native Add IPTV source action in the empty-playlist state, or the selected genre button when channels exist. Restore focus to the WatchFlow topbar trigger when closing from within dialog. Add visible focus ring. Preserve Escape to close and underlying playlist behavior.
- Verification gate: new native Electron three-theme DOM focus in/out tests, Node regression and screenshot comparisons, no invented streams or autoplay; build/release only after screenshots have been opened.


## P5.1.66 / v4.23.150 — WatchFlow close button too small and platform-dependent
- Input: actual P5.1.65 Electron 1360px WatchFlow screenshot, downloaded from run 44896707674 and visually reviewed. The upper-right close button uses a generic × glyph in a 30×30 px target, unlike new native monochrome line icons.
- Fix: replace glyph with 20px currentColor inline SVG in same original button; raise close target to 42×42px without changing native close, Escape or focus behavior, keep source playlists untouched.
- Proof gate: real Electron screenshot and DOM check actual target >=40px + SVG across 3 themes, plus Node test, Windows+Mac CI, explicit separate release validation.


## P5.1.67 / v4.23.151 — WatchFlow persists over other pages on keyboard navigation
- Input: native Electron P5.1.66 screenshots showed overlay anchored to the global topbar. Source inspection confirmed dismissal only on document pointerdown and Escape; keyboard-triggered navigation does not emit pointerdown, so popup can remain over Sources/Settings.
- Fix: observe only real TV page active class. If user navigates away, close WatchFlow without mutating current playlist, selected channel or any source. Preserve existing pointer/Escape pathways.
- Regression: native Electron in three themes opens WatchFlow, invokes real IPTVState.setPage('sources'), checks hidden/aria-expanded, restores TV page and verifies active; Node guards source wiring. Build/screenshots/immutable release separately required.


## P5.1.68 / v4.23.152 — Compact advanced-menu button renders overlapping icons
- Input: personally opened P5.1.67 actual Electron 600px TV screenshot `positron-p5-07-real.png`, run 44897365785. Sidebar control around y245 shows extra teal grid protruding left of a three-dot glyph inside a big selected pill.
- Root cause: `renderer/positron-fifty.js` writes a legacy text icon via `syncMore()` while P4 compact styles add a `::before` glyph and `::first-letter` override. Competing pseudo/text icons overlap and overflow the intended 49px rail width.
- Fix: create exactly one four-tile inline SVG in the existing native disclosure button, preserve JS event, aria-expanded, local storage and label in expanded rail; suppress legacy pseudo glyphs under scoped Horizon CSS.
- Regression: actual Electron 600px TV screenshot audit checks one SVG with 4 tiles, pseudo content none, no text spill/overflow, visible icon ~20px; Node test guards replacement DOM and styles. Build+Release pending.


## P5.1.69 / v4.23.153 — Fifth Sources jump tool wraps on its own row
- Input: P5.1.68 real Electron 720px Sources screenshot from CI run 44897915228, personally inspected. Source navigation displays Smart Discovery, Nguồn hiện có, Thu thập and Gộp kênh on the first row, with Kiểm tra & sửa stranded on a second row, wasting vertical space.
- Cause: legacy `.sources-hub-nav{flex-wrap:wrap}` with button 16px horizontal padding forces an orphan fifth tab at 720px.
- Fix: in Horizon Sources at <=900px, use compact 10px button padding, nowrap flex, accessible horizontal overflow scroll on narrower viewports. Preserve native data-source-jump and input behaviors.
- Regression: native Electron 720px Sources assert five buttons, same y for first/last, nowrap, overflow-x auto and no whole-document scroll spill. Node guard and visual before/after. Build+release pending.


## P5.1.70 / v4.23.154 — Sources tool navigation lacks active section feedback
- Input: real P5.1.69 720px Sources screenshot from run 44898216081 (read after single-row fix): five equal dark tabs offer no clue which in-page tool section is selected.
- Root cause: original data-source-jump native buttons scroll but do not indicate selection with ARIA/current styling. This makes section navigation hard to orient when the sources view contains long tools.
- Fix: existing buttons now expose exactly one `aria-current=location` and high-contrast teal selection; clicking each native button updates visual and screen-reader feedback without replacing source jump listeners or mutating IPTV data.
- Regression: real Electron 720px Sources verifies exactly one active destination `smartDiscoverySection` by default and its computed border color, preserving previous no-wrap/overflow checks. Node regression guards event and ARIA wiring, pending screenshots/build.

## P5.1.71 — WatchFlow contextual to TV (new 20-round batch 01)
- Actual P5.1.70 Sources screenshots at 1360 and 720px show TV-specific WatchFlow in source management.
- Opening is now guarded to TV; changing tabs hides the button and dialog, keeps focus accessible, and restores WatchFlow on return. Native channel rank, play events, playlists, preferences and rights consent are untouched.
- New regression + real Electron UI assertions. CI/screenshot/release pending verification.

## P5.1.72 — Smart Discovery with ordered, usable filters (new 20-round batch 02)
- P5.1.71 real Electron Sources screenshots show the primary Discover button between Country and Scan scope, and Cancel separated onto a new row at 1360px.
- Reorder actual native DOM fields so keyboard tab order matches display; use Horizon-only responsive 4-column desktop, 2-column tablet and 1-column narrow Discovery layout. Keep catalog, country, unlimited scope, concurrency, Verify and Cancel IDs/events intact.
- Node regression plus actual Electron geometry assertions validate four fields above Find, paired Verify/Cancel and no horizontal overflow. CI and after-images pending.

## P5.1.73 — labeled and safe DVR recording path (new batch 03/20)
- P5.1.72 real Electron EPG 720 screenshot revealed an unlabeled absolute path beside the folder control. It will wrap badly for long localized user profiles.
- Added a labeled path field while retaining native `#dvrDirectory` and `#dvrChooseDir`, responsive grid and complete hover tooltip mirrored from the actual native path via MutationObserver. No filesystem calls or data mutations.
- Added real Electron QA simulating a very long directory and checking path clipping, full title, visible button, row placement and horizontal overflow, plus Node guard.
- Build and screenshot reviews to be verified from P5.1.73 Actions before marking round complete.

## P5.1.74 — no-source TV workspace uses laptop height intelligently (new batch 04/20)
- P5.1.73 actual Electron TV at 1360x820 displayed a 538px empty video stage, pushing useful controls below the fold.
- On desktop viewports shorter than 900px, only the no-video stage is shortened to provide access to controls. It retains a fluid floor of 280px and bypasses fullscreen. When the player starts video, the original native 16:9 frame remains unchanged.
- Node and real-Electron regression intentionally toggle the empty illustration to verify the live aspect ratio is preserved and the original empty state is restored before screenshots.
- Actual CI and screenshot comparison to be verified before release credit.

## P5.1.75 — truthful Video Lab beta (new batch 05/20)
- P5.1.74 real TV screenshot shows a prominent ‘Nâng cao video bằng AI’ control even though Electron implementation explicitly lacks any live upscale backend; its Apply button does not affect streams.
- Renamed to ‘Video Lab · Beta’, added honest warning tooltip, renamed fake Apply to capability status, and de-emphasized beta visual chrome. Preserved experimental benchmark, settings, data and real playback.
- Added Node mock-browser regression and actual Electron interactions for open/close, beta label, backend warning and non-fake action.
- Screenshot/CI/build/release pending verification.

## P5.1.76 — Smart Doctor zero-source onboarding (new batch 06/20)
- Real P5.1.75 Electron Doctor with 0 playlist channels shows a large noninteractive V3 diagnostics page after the native message to add sources.
- Keep the native import action, safety report and six counters but collapse unused V3/V2 analytics until native channels exist. Observe channel count and automatically restore all original controls on import, without modifying user preferences/history.
- Node regression plus real Electron zero-source and 552 metadata-only source tests confirm both phases; screenshot capture and CI release require verification.

## P5.1.77 — Doctor source CTA screenshot smoke regression (new batch 01/20)
- P5.1.76 capture failed: screenshot shows the native `#positronDoctorSources` source-import action, but added QA mistakenly looked for an element inside `#doctorReport`.
- Check the actual native action's visibility and text, simulate its click and assert successful navigation to the native Sources page, then restore Doctor. Preserve empty V2/V3 hiding and full restoration when channels exist.
- Add regression for the correct selector; new CI screenshot/build/release remain unverified until Actions completes.

## P5.1.78 — Focused empty Doctor onboarding (new batch 02/20)
- P5.1.77 actual no-source Electron Doctor screenshot still had six zero-value metrics taking an entire horizontal row, despite advanced diagnostic panels being correctly hidden.
- While native channel count is zero, hide only `.doctor-metrics` and render a purposeful, labeled introduction with direct access to native source manager; keep both original Doctor V2/V3 sections, all report DOM, and preferences untouched. Restore the complete metric dashboard automatically when actual native channels are added.
- Add Node regression and Electron screenshot assertions for zero-source metrics being hidden and restored after 552 metadata-only channels. No real playback claimed. CI/build/release pending.

## P5.1.79 — Understandable player tools disclosure (new batch 03/20)
- P5.1.78 real Electron TV shows a trailing `•••` icon that does not communicate the Timeshift/recording/tool collection and looks out-of-place against the other monochrome player icons.
- Render a monochrome sliders SVG as part of the existing native toggle in `positron-fifty.js`, overriding only the legacy pseudo-element dots; retain the actual button, its localized text, click handler, aria-expanded, tooltip and saved open/closed state.
- Extend real Electron CDP checks for vector presence, pseudo removal and icon survival across open/close transitions. Add Node regression. CI/release pending.

## P5.1.81 — Single-row WatchFlow Plus toolbar (this batch round 04/20)
- Actual P5.1.80 Electron mix screenshot showed the new five modes wrapped awkwardly into two rows, covering player content and reducing the visible card list.
- Shorten only the visual button captions and preserve complete localized names via aria-label/title. Force one logical row at desktop and allow horizontal scrolling for very narrow screens; maintain all five mode buttons, Smart Zap manual-only playback and keyboard controls.
- Add CDP actual layout assertions and a 450px Electron screenshot, plus Node regression; version tag/CI prerelease remain subject to Actions verification.

P5.1.81 follow-up: real Electron capture found nav overflow; replace flexible nowrap with five measured grid tracks, shorter text plus full aria, and richer screenshot/overflow assertions. Preserve the same version while retrying.

## P5.1.82 — Single-row mobile channel chooser (new batch round 05/20)
- The freshly reviewed P5.1.81 real 450px Electron screenshot revealed that the native `webChannelChooser` beneath the overlay wraps its three filter tabs into two rows, pushing the Recent tab down and wasting scarce height.
- Under 600px, retain all three native tabs and both layout toggles in a 3-column CSS grid + compact two-button view control, with readable focus states and theme-aware selected color. Do not remove controls or alter filtering behavior.
- Add actual 450px TV screenshot and CDP geometry regression on tab count, one-row alignment, no horizontal overflow and both view controls; CI/build/release pending.

## P5.1.83 — Compact player secondary controls under 600px (batch round 06/20)
- P5.1.82 actual 450px TV screenshot had a tiny 200px video and 160px secondary control panel, with two select dropdowns needlessly stacked despite room for them side by side.
- Grid layout now keeps EPG on its own row, fit + manual backup URL + favorite in a common row. All native controls remain addressable, no state or playlist changes.
- CDP validates same row, usable widths, no overflow and reduced height at actual 450px Electron. Screenshot in `positron-p5-chooser-450-metadata-qa-real.png`; full CI/release pending.

## P5.1.84 — Actionable empty channel sidebar (new batch round 07/20)
- Actual P5.1.83 TV Electron screenshot shows the channel sidebar occupying substantial space with passive no-channel text and no direct action, in contrast to the functional main player CTA.
- When native IPTVState.getChannels() has zero channels, replace only the native no-channel description with a compact title, explanation and real source-management CTA. The existing channel list and all metadata/favorites are untouched. MutationObserver tracks native list re-renders; after importing a playlist, the native list appears normally.
- Add regression and Electron CDP click-to-Sources + restore; screenshots and CI/installer remain pending.

## P5.1.102 — Watch Later multi-word, group and quality-aware search (new 20-round batch 01/20)
- Opened real P5.1.101 screenshot `positron-p51101-watch-later-search-552-real.png`: searching only a contiguous substring cannot find saved `QA Channel 001` with cross-field `main 001`, although native group metadata is present.
- Keep personal bookmarks local; search accent-insensitively across multiple title/group terms, in any order. Do not strip HD, FHD or 4K query tokens as bookmark fingerprints do; punctuation-only input must not accidentally reveal all saved channels.
- Add Node regression for cross-field queries, non-saved exclusions and URL privacy. Add actual Electron screenshot and DOM checks for `main 001`, preserved focus, no auto playback, unchanged local bookmark data.
- Do not count the round complete until the updated CI screenshot is opened and inspected, tests pass, and an immutable P5.1.102 release is verified.

## P5.1.103 — Stop silent Watch Later bookmark eviction at 80 (new batch 02/20)
- Followed the P5.1.102 real `positron-p51102-watch-later-multiterm-552-real.png` screenshot and its saved-list status back into `toggle()`: with 80 saved channels, the 81st was inserted at the front and `compact()` discarded the oldest without warning.
- Preserve all prior bookmarks: refuse a new save at capacity with `{ok:false,reason:'full'}`; existing saved channels may still be removed, and a new channel may be saved after freeing a slot.
- Present a clear local toast and capacity hint, without changing playlist, playback, URLs, or account data.
- Add Node regression for 80-to-81 attempt and removal/retry. Extend native Electron QA with real before/after shots of the 80-bookmark state, checking the 81st 'Lưu' button cannot mutate storage or auto-start video. Release only after screenshot review and all six CI jobs.

## P5.1.104 — Inform about dormant Watch Later bookmarks without deleting them (new batch 03/20)
- Reviewed actual P5.1.103 Electron screenshot `positron-p51103-watchlater-cap-after-real.png`, inspected the strict 80-entry limit and found stored bookmarks for dead/removed channels are silently hidden by `visible()`; users may think saved data vanished.
- Add `unavailable(rows,channels)` to count fingerprints with no currently playable matching native channel, source-scoped and without checking stream URLs externally. UI shows a quiet privacy-preserving note while keeping all bookmarks in localStorage for source recovery. No auto-delete, autoplay or network fetch.
- Add Node regression for dead, missing, wrong-source and blank-URL channels, and native Electron QA under a 552-channel metadata-only dataset. Capture `positron-p51104-watchlater-unavailable-552-real.png`, audit note geometry, unchanged bookmarks and idle player.
- Pending: verify screenshot by opening real PNG and CI release Windows Setup/Portable + Mac DMG before counting.

## P5.1.105 — Explicit two-step cleanup of unavailable bookmarks (new batch 04/20)
- Opened P5.1.104 actual Electron screenshot `positron-p51104-watchlater-unavailable-552-real.png`: status notice tells users a source is unavailable but gives no way to free dormant saved slots while retaining healthy bookmarks.
- Add opt-in details manager. Display only sanitized normalized bookmark keys, never source URL, token or full M3U. On first click change the action to `Xác nhận bỏ` without any data write; on second confirm revalidate that the selected fingerprint is still unavailable before removing only that bookmark from localStorage. Never auto-remove when source is offline.
- Node regression ensures source restored between clicks cannot be mistakenly deleted; native Electron QA checks first-click no deletion, second click exactly one deletion, original available card survives and no stream plays. Screenshot `positron-p51105-dormant-manage-before-real.png` and `-after-real.png`.
- No claim completed until screenshots reviewed and prerelease asset checks pass.


## P5.1.108 / v4.23.192 — Native quota notification clears compact sidebar (new batch 01/20)
- Input: directly opened real P5.1.107 450px Electron screenshot `positron-p51107-chooser-native-svg-450-real.png`: Watch Later quota toast begins near x46 and crosses the 54px icon rail.
- Cause: the shared native `.toast-area` uses right:24px/max-width:380px with no left constraint for the compact sidebar.
- Fix: Positron-only <=600px notification lane left:66px/right:12px; text wraps safely and the visual toast does not intercept taps. Native toast content, timers, IPTV data and playback remain untouched.
- Regression: Node source assertion and real Electron 450px measured sidebar clearance, viewport bounds, overflow and message height. Capture `positron-p51108-toast-clear-of-sidebar-450-real.png`. CI/release/screenshot review must be checked before marking this round complete.


## P5.1.109 / v4.23.193 — Avoid repeated identical native toast notifications (new batch round 02/20)
- Input: P5.1.108 real 450px Electron `positron-p51108-toast-clear-of-sidebar-450-real.png`, directly inspected: two identical quota banners cover the lower channel list during QA. The second banner was introduced by an audit fixture, but the underlying native toast function was independently confirmed to append every identical notification without deduplication.
- Root: native `renderer/app.js` `toast()` creates a new DOM node on every call, with no active-notification key. Repeated user clicks can stack the same error.
- Fix: coalesce only the same text + severity while the previous toast is still mounted. Different messages or severity remain visible; timeout still removes existing toast after 5.5 seconds. Existing IPTV data, local playlist, player, source and accessibility live region are unchanged.
- Regression: Node executes extracted native toast function with a DOM stub to verify same/different messages, severity and expiry, plus native Electron 450px invokes IPTVState.toast twice and captures `positron-p51109-native-toast-dedupe-450-real.png` after asserting exactly one message.
- Status: candidate until GitHub Actions, native screenshot review, immutable release and installers are verified.


## P5.1.110 / v4.23.194 — Unplayed 450px player no longer hides the channel library (new batch round 03/20)
- Input: directly viewed native Electron P5.1.109 screenshot `positron-p51109-native-toast-dedupe-450-real.png`: 552 synthetic metadata-only channels exist, but the empty player consumes a full 203px, pushing their chooser almost below the 820px viewport.
- Root: the 16:9 ratio is applied to the video stage even in idle mode, when no picture must be preserved. P5.1.74 compacted desktop idle stage only above 900px viewport width.
- Fix: when viewport <=600x900 only, compact idle onboarding canvas to 164px, remove decorative empty TV icon on narrow view, tighten text/CTA spacing. Native playback retains original 16:9 stage immediately as soon as the empty illustration hides, and remains untouched at fullscreen or larger screens. No playlist or stream changes.
- Regression: Node guard + real Electron 450px frame height, CTA bounds, channel heading access, aspect after temporarily hiding empty state and restoration; actual image `positron-p51110-compact-idle-player-450-real.png` must be opened and reviewed.
- Status: candidate; full CI, image review and immutable release pending verification.


## P5.1.111 / v4.23.195 — Real one-row channel groups and sticky horizontal position (new batch round 04/20)
- Input: manually inspected P5.1.110 genuine Electron 450x820 screenshot `positron-p51110-compact-idle-player-450-real.png`: 11 popular group buttons spill across three rows above search, making the first channel tiles hard to reach above the fold.
- Root: the native `.web-chooser-chips` flex container wraps under 600px, and `renderGroups()` replaces all buttons (resetting scrollLeft) after every selection.
- Fix: Positron <=600px horizontal overflow strip with native buttons all present + focus accessible; `renderGroups()` saves/restores scrollLeft to prevent jumping to the start after selecting a chip near the right side. Group filtering and playlist never altered.
- QA: Node regression and real Electron 450px single row, scrollable, rightmost selection position retained, search and channel grid higher in viewport, no horizontal document overflow/autoplay. Screenshot `positron-p51111-single-row-chips-450-real.png` must be opened before counting completion.
- Status: candidate until CI/installer assets and screenshot reviewed.


## P5.1.112 / v4.23.196 — Two readable channel cards per row on 450px (new batch round 05/20)
- Input: genuine manually opened P5.1.111 Electron `positron-p51111-compact-filters-450-real.png`: at 450px the grid renders three 100px cards across the content column, each with large generic TV art and a channel name forced onto one truncated line.
- Cause: legacy `web-channel-chooser-v42371.css` uses 80px minimum columns at <=650px and single-line ellipsis for labels, making channel titles hard to identify.
- Fix: narrow <=500x900 unplayed/regular grid (not list mode) uses 2 equal columns with min 145px card width and two-line names; original native channel button, click, logo, pagination, stream logic and responsive desktop layout stay untouched.
- Tests: Node source/assertion + actual Electron 450px measured two-column placement, label wrap, keyboard buttons, no document overflow, no autoplay and real screenshot `positron-p51112-readable-channel-cards-450-real.png` to open/review.
- Release status: candidate until verified full CI, screenshot review and immutable installers.


## P5.1.113 / v4.23.197 — Keyboard-accessible native channel chooser (new batch round 01/20)
- Baseline: manually opened real P5.1.112 Electron 450px screenshot containing three native chooser tabs. Static inspection found role=tablist but no ArrowLeft/ArrowRight/Home/End handler or roving tabindex.
- Fix: preserve original native click-to-select, add directional/Home/End keyboard focus, selected tab only in Tab sequence, aria-controls; Favorites/Recent/channel playback and stored data unchanged.
- Regression: Node assertions + real Electron CDP key presses, focus/selected states, wraparound, no autoplay/overflow, actual screenshot positron-p51113-keyboard-favorites-tab-450-real.png. CANDIDATE until CI, manual review, installer assets verified.


## P5.1.114 / v4.23.198 — Actionable Favorites/Recent empty states (file-triggered batch round 02/20)
- Input: manually opened real P5.1.113 Electron screenshot positron-p51113-keyboard-favorites-tab-450-real.png. After keyboard selection of Favorites, 552 channels were loaded but UI incorrectly said generic "Không tìm thấy kênh phù hợp" and showed disabled page 1 / 1.
- Root: chooser renderer reused generic no-results branch for genuinely empty Favorites/Recent lists and always rendered a pager for zero matches.
- Fix: context-specific empty messages for Favorites and Recent, native "Xem tất cả kênh" action that clears local search/group filters and restores All tab focus without autoplay; hide pager on one-page or empty results; preserve playlist and favorites data.
- Regression: Node source tests + real Electron CDP 450px empty UI, button focus/click, channel restoration, no playback/overflow, screenshot positron-p51114-favorite-empty-action-450-real.png. Candidate until CI, opened screenshot, release assets verified.


## P5.1.115 / v4.23.199 — Suppress duplicate compact empty mini panels (file-triggered batch round 03/20)
- Baseline: genuine manually viewed P5.1.114 450px Electron screenshot positron-p51114-favorite-empty-action-450-real.png: active Favorites tab correctly explains empty state, but a second lower empty Favorites mini panel repeats the same instruction.
- Root: chooser always renders sidebar Favorites and Recent mini panels regardless of active tab and their empty data.
- Fix: mark only duplicate empty mini section on its own active tab and hide it only <=650px via scoped CSS. Keep mini section on All, other tabs, desktop, and when actually populated. No stored data, filtering or playback changed.
- Regression: Node asserts + real Electron CDP view of Favorites/Recent/All with one section hidden and restored, no autoplay or overflow, screenshot positron-p51115-no-duplicate-favorite-450-real.png. Candidate until CI + manual screenshot review + release.


## P5.1.116 / v4.23.200 — Real category quick filters, no phantom group chips (file-triggered round 04/20)
- Baseline: manually opened genuine P5.1.115 450px Electron screenshot positron-p51115-no-duplicate-favorite-450-real.png shows VTV/VTC/HTV/K+ category chips despite 552 synthetic QA channels belonging only to generic groups; source inspection confirms all chips were shown whenever any channels existed. Clicking a nonexistent group's chip silently reset group=All.
- Root: renderGroups() used only available.size, did not check each group's presence; fallback to group.value='' for absent label; clicked chip lost focus on replacement.
- Fix: quick chips only for actually imported group names (TH matches a separate token rather than the beginning of Thể thao). Selected chip state now uses aria-pressed; native keyboard focus restored after filtering; no changes to stream playback or saved playlists.
- Regression: preserve previous P111 accessible horizontal-rail checks by adding nine metadata-only QA channels in genuine groups (non-playing), omit K+ to assert absent chip, test VTV filters to exactly one channel, returns to All 561 records, focus restored, no autoplay/overflow; real screenshot positron-p51116-real-category-filter-450-real.png. Candidate until CI + screenshot inspection + installer verified.


## P5.1.117 / v4.23.201 — Full-width readable single filtered channel tile (file-triggered round 05/20)
- Baseline: genuine P5.1.116 Electron screenshot at 450px positron-p51116-real-category-filter-450-real.png, VTV filter works but its single result occupies only the first of two columns, leaving a conspicuous empty half.
- Cause: two-column responsive grid applies even when only one button is visible on the page.
- Fix: compact-only :only-child channel button spans all grid columns and uses a horizontal logo-title arrangement with original click-to-play, keyboard and list mode preserved; multi-result grid remains two columns.
- Regression: real Electron 450px check single result >=300px width, horizontal, readable, focus preserved, no autoplay/overflow, and after clearing filter first two buttons remain side by side; screenshot positron-p51117-single-result-wide-card-450-real.png. Candidate until CI/manual image review/release.


### Verified previous round P5.1.116
- P5.1.116 / v4.23.200 final HEAD `68bf5505bc72a73853284574dc3106bfad7e9973`; immutable release `positron/v4.23.200-p5.1.116` and GitHub Actions `44934384750` with 6/6 jobs success.
- Node 716 tests: 711 passed, 5 skipped, zero failed. True Electron 450px screenshot `positron-p51116-real-category-filter-450-real.png` manually opened; 10/10 category checks passed with no playback and no horizontal overflow. Windows Setup/Portable x64 and Mac Intel/ARM64 release assets API-verified.


## P5.1.118 / v4.23.202 — Direct channel bookmark without playback (file-triggered round 06/20)
- Baseline: opened genuine P5.1.117 Electron 450px screenshot positron-p51117-single-result-wide-card-450-real.png: VTV QA card can play but has no favorite action, while Favorite empty state tells user to press a star. Users must play first to access player-only star.
- Fix: each main grid tile keeps original native Play button and gains a separate accessible native Favorite button as a sibling, not nested inside Play. Uses existing OpenIPTVFavorites.toggle/getStore/save/render, stable favorite keys, persistence and in-memory rollback if save fails; native Favorites tab reactivity preserved. Compact side mini cards remain native Play buttons.
- Affected CSS: add wrapper as grid cell, keep P117 one-result full-width behavior, subtle native star with aria-pressed and focus; multi-channel grid, video playback and stored sources unchanged.
- Regression: Node plus real Electron CDP 450px QA bookmark VTV without playback, verify store/localStorage stable key, keyboard focus, Favorite tab entry, undo and persist removal, return All. Screenshot positron-p51118-direct-favorite-channel-450-real.png. Candidate until test/visual/release.

### Verified previous round P5.1.117
- Final HEAD `15a29463a11da0679caa367515362c74bfec8029`, tag `positron/v4.23.201-p5.1.117`, Actions `44934939463` success 6/6. Node 717: 712 pass, 5 skipped. Real Electron screenshot `positron-p51117-single-result-wide-card-450-real.png` opened; 9/9 P117 checks pass, all four installer assets verified.


## P5.1.119 / v4.23.203 — Live Favorites count badge on chooser tab (file-triggered round 07/20)
- Baseline: manually opened actual P5.1.118 450px Electron screenshot positron-p51118-direct-favorite-channel-450-real.png. Channel tile shows a saved star but Favorites tab shows no count; only transient toasts confirm progress.
- Fix: add badge AFTER legacy SVG tab-icon replacement, update its count on every native chooser render from favorites.visible(store), hide at zero, use aria-label "Yêu thích, N kênh", overlay small pill near icon without taking width away from 450px tab row; no playlist data mutation.
- Regression: real Electron 450px favoriting metadata-only VTV, visible 1 badge and accessible count, no overflow/autoplay; unstar must hide badge and speak count 0, screenshot positron-p51119-favorite-count-badge-450-real.png. Candidate until CI, opened screenshot, release verified.

### Verified previous round P5.1.118
- Final HEAD `9751d3c02c2a293c63301f066b16b079a2d884ff`, immutable tag `positron/v4.23.202-p5.1.118`, GitHub Actions `44935525440` 6/6 success. Node 718: 713 passed, 5 skipped, no failure. Real screenshot opened, 13/13 direct Favorite assertions true including stored key, remove/reverse, focus and no playback; 4 binary release assets verified.

## P5.1.120 / v4.23.204 — Compact success notification stack (new file-triggered 01/20)
- Baseline: actual Electron P5.1.119 screenshot `positron-p51119-favorite-count-badge-450-real.png`, directly opened: three green confirmation banners obscure channel tiles at 450px.
- Root: distinct native success notifications all remain visible for 5.5s; duplicate guard only suppresses identical messages.
- Fix: compact Positron-only CSS shows latest success while retaining warning/error notices, expiry timers and desktop behavior.
- Real Electron 450px regression with three benign fixture notices, warning visibility, sidebar clearance and no overflow; after screenshot `positron-p51120-compact-toast-stack-450-real.png`.
- Candidate until CI, direct image review, immutable release and installers are verified.

## P5.1.121 / v4.23.205 — Dismiss individual toast without waiting (new file-triggered round 02/20)
- Baseline actual P5.1.120 450px Electron after-image directly inspected: latest single success toast still covers a channel tile until its 5.5s expiry; no close button.
- Isolated Positron DOM observer adds keyboard/touch accessible native close button to each notification; original toast data, severity, auto expiration and app playback remain unchanged.
- Scoped contrast and 32px pointer target; real Electron screenshot `positron-p51121-toast-dismiss-visible-450-real.png` and QA must test mouse click and keyboard Enter, proper accessible label and no overflow.
- Candidate until full CI 6/6, actual image opening and immutable binary release verification.


## P5.1.122 / v4.23.206 — Preserve keyboard focus after dismissing toast (new batch 01/20)
- Baseline: P5.1.121 actual Electron 450px image `positron-p51121-toast-dismiss-visible-450-real.png`, directly inspected.
- Root: deleting a focused toast close button returns keyboard focus to the page body, not the user's previous control.
- Fix: track last genuinely focused control outside #toastArea and restore if still connected and enabled. Preserve native toast timers, severity, M3U, favorites and playback.
- Actual Electron QA: focus #webChooserSearch, append isolated warning toast, press Enter to dismiss, assert return focus/no overflow; after-image `positron-p51122-toast-focus-return-450-real.png`. Node syntax guard. Candidate until CI and image/release verification.


## P5.1.123 / v4.23.207 — Dock routine success notifications to footer (new batch 02/20)
- Input: genuine P5.1.122 Electron 450x820 after-image `positron-p51122-toast-focus-return-450-real.png`, manually opened: native confirmation banner still covers lower channel cards.
- Root: narrow-view native #toastArea bottom:45px fixed overlay overlaps channels, even with P120 single-toast and P121 manual close.
- Fix: at <=600px, success-only notifications dock into 36px existing footer strip at bottom:2px. Long success text ellipsizes, X remains 32x32. Any warnings or errors restore original elevated position/height and severity. Core native toast timers, state, channel data and playback untouched.
- Electron QA: real 450px footer and toast DOM bounding boxes, warning persistence, no overflow, photo `positron-p51123-success-toast-footer-450-real.png`. Candidate until all six CI jobs, direct visual review and installer Release verified.

## P5.1.124 / Electron v4.23.208 — Mouse-wheel access to compact channel groups
- Baseline: actual P5.1.123 450px Electron screenshot `positron-p51123-success-toast-footer-450-real.png` downloaded and manually opened.
- Root: native horizontal chip rail not navigable using standard vertical mouse wheel, later categories offscreen; bright scroll track visually dominates compact layout.
- Fix: wheel-to-horizontal navigation while rail can move, release native page scroll at edges, toned scroll indicator. Preserve touch, keyboard, group filters, favorite data, playlist and media transport.
- Verification: new Node regression, actual Electron 450px wheel/color/edge/overflow checks and screenshot `positron-p51124-chip-wheel-450-real.png`. Candidate pending CI, direct after-image and immutable binary release.

## P5.1.125 / Electron v4.23.209 — Always-available All Channels reset on narrow screens
- Input: genuine manually reviewed P5.1.124 Electron 450x820 after-image `positron-p51124-chip-wheel-450-real.png`: group chip rail scrolled right after a real mouse-wheel event, causing the first `Tất cả` reset chip to disappear.
- Root: horizontal native scroll container moves the reset chip together with category choices.
- Fix: make only the first native chip position:sticky at the left edge <=600px, preserving the full group catalog, native wheel/touch/keyboard, focus restoration and playlist/player behavior. It remains a normal button, no duplicate UI.
- New regression: Node test and actual Electron 450px screenshot `positron-p51125-pinned-all-450-real.png` plus geometry, hit-target, actual filter switch/reset, focus, overflow checks.
- Status: candidate pending 6/6 CI, manual after-image review, and immutable Release binaries verification.

## P5.1.126 / Electron v4.23.210 — Hide clipped category labels behind pinned All reset
- Input: direct visual review of P5.1.125 actual Electron 450x820 screenshot `positron-p51125-pinned-all-450-real.png`. The native sticky All chip works and 9/9 QA passes, but fragments of underlying horizontally scrolled chip text remain visible in the narrow margin at its left.
- Root cause: sticky chip overlays only its own border box, while the 10px scroll-lane padding shows clipped neighboring labels.
- Fix: add a scoped 22px dark mask using the original first chip's own ::before and let it capture pointer events, preventing invisible category selection in the masked region. Do not remove native group controls or modify playlists/playback.
- Regression: Node source test; real Electron computed pseudo style, masked hit-test, no-overflow, new screenshot `positron-p51126-pinned-all-masked-450-real.png`. Pending full CI and immutable Release.

## P5.1.127 / Electron v4.23.211 — Native keyboard navigation across compact channel groups
- Input: directly opened genuine P5.1.126 450px Electron screenshot `positron-p51126-pinned-all-masked-450-real.png`. The long horizontal quick-group row has several hidden choices but supports only Tab and pointer/wheel, not expected left/right/Home/End navigation for keyboard and remote-style controls.
- Root: each category is a button and event handlers cover click only; the keyboard arrow handlers implemented earlier serve the separate All/Favorites/Recent tabs, not the group row.
- Fix: add an event listener scoped to the native category row to focus previous/next/start/end buttons and scroll their target into view; changes no filters until explicit Enter/Space, preserves All button, no auto-play or source mutation.
- Regression: Node source test plus real Electron 450px End/Enter/Home/Enter sequence; focus, selection deferral, native group apply/reset, no overflow, screenshot `positron-p51127-category-keys-450-real.png`. Candidate until full CI/manual after-image and immutable installer release.

## P5.1.128 / Electron v4.23.212 — Synchronize advanced category selection with quick-chip rail
- Input: opened genuine P5.1.127 450px Electron screenshot `positron-p51127-category-keys-450-real.png`. The scrolled quick-category row clearly shows distant chips. Source examination reveals the separate advanced group dropdown updates data but simply restores the old horizontal scroll; the newly active chip can be outside the visible area.
- Root: native group 'change' handler calls render() only; renderGroups restores the previous scroll position regardless of a selection made from the advanced dropdown. Native quick-chip clicks already preserve their own position and must continue to work.
- Fix: on explicit dropdown group change, scroll only the currently active matching quick chip into view; resetting to All restores the rail start. Preserve original chip click focus restoration, no group/playlist write or automatic playback.
- Regression: Node source test, real Electron selects 'Tin tức' in native dropdown from leftmost rail, validates active/visible chip and zero overflow, then resets via dropdown and checks rail starts at zero. Photo `positron-p51128-dropdown-chip-450-real.png`. Candidate pending CI/after-image inspection/immutable installer release.

### P5.1.128 CI release correction (same version, new commit)
- Release job reached a real GitHub HTTP 422: `body is too long (maximum is 125000 characters)`. The complete historical changelog outgrew GitHub's Release body limit.
- Keep the historical `POSITRON_P5_CHANGELOG.md` intact in the bundled source, publish short notes with a pointer to the full file, and add a Node regression assertion against using full changelog as release notes.
- No UI code, filter semantics, 450px Electron screenshot requirements, tags or previous versions were altered. Round 05 remains candidate until a fresh full CI run and immutable Release pass.


## P5.1.199 / 4.23.284 — Đồng bộ tên ghi hình tạo tự động (CANDIDATE)
- Feature priority: NEW — Tên được ứng dụng tạo từ kênh và giờ nay tự cập nhật khi người xem đổi thời gian ghi hoặc kênh, tránh tạo lịch với tên sai ngày nhưng vẫn bảo vệ nhãn nhập tay.
- User action: Mở Lịch phát sóng, tạo tên từ kênh và giờ, sau đó chọn Ngày mai cùng giờ hoặc sửa giờ bắt đầu để thấy tên tự cập nhật.
- Electron screenshot: positron-p51199-dvr-title-sync-after-1920x1080-real.png
- Sửa lỗi nhìn thấy trên ảnh thật P5.1.198: tên tự tạo giữ ngày cũ sau khi bấm Ngày mai cùng giờ.
- Tên do Positron tạo trong phiên và chưa được chỉnh tay sẽ đổi theo giờ/kênh; tên thủ công và tên đã lưu giữ nguyên.
- Regression Node và Electron 1920×1080 before/after, kiểm chứng CI và release bất biến.


## P5.1.200 / 4.23.285 — Xác nhận thay tên lịch ghi bằng hai lần nhấn (CANDIDATE)
- Feature priority: NEW — Khi đã có tên ghi hình tự nhập, nút tạo tên tự động cho phép xác nhận rõ ràng bằng hai lần nhấn thay vì bắt xóa tên cũ; tránh ghi đè vô ý và giảm bước thao tác.
- User action: Vào Lịch phát sóng, nhập tên riêng, bấm Tạo tên từ kênh và giờ một lần để xem xác nhận, bấm lần hai để thay hoặc nhấn Escape để hủy.
- Electron screenshot: positron-p51200-dvr-replace-after-1920x1080-real.png
- Ba ảnh Electron 1920×1080 trước, trong lúc xác nhận, sau khi thực hiện; kiểm thử nút và input thay đổi không gây ghi lịch/auto-play.
- Không chỉnh nhánh khác, bảo toàn dữ liệu người dùng và giữ tất cả tag trước.


## P5.1.201 / 4.23.286 — Hoàn tác lần thay tên bản ghi vừa xác nhận (CANDIDATE)
- Feature priority: NEW — Cho phép khôi phục đúng tên chương trình người dùng vừa thay bằng nút hoàn tác một lần, tránh mất tên nhập thủ công khi họ đổi ý và không làm thay đổi bất cứ lịch ghi nào.
- User action: Mở Lịch phát sóng, nhập tên riêng, xác nhận hai lần thay tên theo kênh, rồi nhấn Hoàn tác thay tên để trở về tên trước đó.
- Electron screenshot: positron-p51201-dvr-undo-after-1920x1080-real.png
- Ảnh Electron trước thay, sau thay có nút hoàn tác, và sau khôi phục; kiểm thử trạng thái hết hiệu lực khi người dùng tự sửa tiếp.
- Không sửa dữ liệu nguồn, lịch ghi đã lưu hoặc nhánh khác.


## P5.1.202 / 4.23.287 — Gia hạn lịch ghi thêm 15 phút, giới hạn tối đa 8 giờ (CANDIDATE)
- Feature priority: NEW — Giữ nguyên kênh và giờ bắt đầu, cho phép gia hạn mốc kết thúc thêm 15 phút khi chương trình thể thao hoặc trực tiếp kéo dài.
- User action: Vào Lịch phát sóng → Hẹn giờ ghi hình, chọn thời gian bắt đầu/kết thúc hợp lệ, nhấn “Gia hạn +15 phút”; có cả trên mẫu ghi nhanh từ TV.
- Chỉ điều chỉnh giờ kết thúc của biểu mẫu, không tự đặt lịch, không tự phát kênh, không thay playlist hay lịch ghi đã lưu. Không cho gia hạn vượt 8 giờ; trường không hợp lệ được cảnh báo.
- Electron screenshot: positron-p51202-dvr-extend-after-1920x1080-real.png
- Real Electron QA: positron-p51202-dvr-extend-before-1920x1080-real.png và positron-p51202-dvr-extend-after-1920x1080-real.png (chờ CI và mở ảnh thực).


## P5.1.203 / 4.23.288 — Thông báo TV không che nút phát/âm lượng (CANDIDATE)
- Feature priority: NEW — Khi xem truyền hình trên desktop, thông báo được đưa đến vùng góc phía trên; nút mở danh sách nổi vẫn bấm được nhưng không che thanh phát và âm lượng, trong khi cảnh báo quan trọng cùng lịch sử trên thanh đầu vẫn truy cập được.
- User action: Mở trang Xem truyền hình trên desktop và thực hiện thao tác phát sinh thông báo; điều khiển Play/Volume không còn bị banner che. Bấm Thông báo trên thanh trên để xem nhật ký.
- Electron screenshot: positron-p51203-tv-toast-safe-after-1920x1080-real.png
- Đầu vào: ảnh Electron thật P5.1.202 1920×1080 tại trang TV, nút “Xem thêm 6 thông báo” và banner bên dưới đang đè lên âm lượng/phần dưới player.
- Chỉ thay CSS scoped desktop TV tối thiểu 1000px, bảo toàn cảnh báo, archive và hành vi giao diện 450px; QA P203 chạy Electron trước/sau và đo geometry.


## P5.1.204 / 4.23.289 — Khám phá kênh ngẫu nhiên từ trang TV (CANDIDATE)
- Feature priority: NEW — Khi có nhiều kênh đã nhập nhưng chưa chọn kênh để xem, nút “Khám phá kênh ngẫu nhiên” giúp tìm nội dung mới thay vì luôn bắt đầu từ kênh thứ nhất; không chọn kênh chết/thiếu URL, không tự chạy lúc mở app.
- User action: Mở trang Xem truyền hình, khi chưa chọn kênh hãy nhấn Khám phá kênh ngẫu nhiên; ứng dụng chọn một kênh hợp lệ bằng hành động rõ ràng của người xem.
- Electron screenshot: positron-p51204-tv-random-after-1920x1080-real.png
- Ảnh Electron P5.1.203 thực cho thấy màn hình TV chỉ có Xem kênh đầu tiên, chưa có cách khám phá bất kỳ kênh nào. Nút mới chỉ có hiệu lực khi có kênh dùng được, thử nghiệm bằng stub chọn kênh an toàn trong Electron (không khẳng định luồng IPTV đã chạy).
- Regression bảo toàn thứ tự playlist, kênh, EPG, DVR, không tự phát video, có focus keyboard và giao diện mobile hẹp.

## P5.1.205 / Electron 4.23.290 — Đổi kênh ngẫu nhiên ngay khi xem (CANDIDATE)
- Feature priority: NEW — Người xem có thể khám phá kênh ngẫu nhiên khác ngay khi đang phát thay vì phải trở về màn hình chưa chọn kênh.
- User action: Tại Xem truyền hình, khi có từ hai kênh hợp lệ, nhấn biểu tượng xúc xắc Bất kỳ bên cạnh nút Kênh sau.
- Electron screenshot: positron-p51205-tv-switch-after-1920x1080-real.png
- Đã trực tiếp mở screenshot P5.1.204 thực 1920×1080 từ CI run 45016102045, thấy nút Khám phá ngẫu nhiên chỉ nằm trong empty player.
- Bổ sung nút xúc xắc sau Kênh sau trên native transport, chỉ hiển thị khi có từ 2 kênh hợp lệ và chỉ phát kênh khác sau nhấn chuột. Không tự phát, không ghi dữ liệu playlist.
- Regression Node kiểm tra điều khiển, CSS/keyboard và tái sử dụng thuật toán chọn kênh bỏ qua kênh hiện tại. Cần CI thật, ảnh trước/sau và soát PNG để xác nhận release, chưa kiểm thử playback thực.

## P5.1.206 / Electron 4.23.291 — Khám phá ngẫu nhiên không lặp kênh (CANDIDATE)
- Feature priority: NEW — Người xem dùng nút Bất kỳ nhiều lần mà tránh chọn lại các kênh đã được khám phá trong cùng chu kỳ; khi hết tập hợp hợp lệ mới mở vòng khám phá tiếp, tăng sự đa dạng.
- User action: Trên màn hình Xem truyền hình, nhấn Bất kỳ nhiều lần; huy hiệu số đếm các kênh đã chọn trong chu kỳ hiện tại, hoạt động ngay trong trình phát.
- Electron screenshot: positron-p51206-random-cycle-after-1920x1080-real.png
- Đã trực tiếp mở và soi ảnh Electron thật của P5.1.205 1920×1080: nút Bất kỳ hoạt động nhưng thiếu dấu hiệu tiến độ và có thể lặp các kênh đã chọn sau vài lượt. P206 bổ sung bộ nhớ phiên không lưu cloud, tự loại ID không còn trong source, không tự mở player khi khởi động.
- QA dự kiến: Node regression, Electron two-click stub, screenshot before/after thực 1920×1080 với pixel khác nhau, không tràn ở 450px; chưa thử stream live trên TV/GPU.

## P5.1.207 / Electron 4.23.292 — Làm mới vòng khám phá ngẫu nhiên (CANDIDATE)
- Feature priority: NEW — Thêm nút làm mới trực tiếp trên thanh phát để người xem bắt đầu một lượt khám phá ngẫu nhiên mới bất cứ khi nào, không cần chờ đi hết toàn bộ danh sách hợp lệ.
- User action: Sau khi nhấn Bất kỳ ít nhất một lần, nhấn nút ↻ ngay bên cạnh để xóa bộ đếm lượt khám phá hiện tại rồi bắt đầu chọn lại từ đầu.
- Electron screenshot: positron-p51207-random-reset-after-1920x1080-real.png
- Baseline đã MỞ: P5.1.206 có huy hiệu số đếm bên cạnh Bất kỳ, không tràn ngang; lượt random không lặp nhưng chưa có cách chủ động reset. Nút mới chỉ xóa Set trong RAM, không tự gọi playChannel và không làm mất playlist, Favorites hoặc lịch sử người dùng.
- QA: Node regression, Electron stub xác minh reset không phát, đếm về 0, dùng lại thì đếm từ 1; hai PNG thật 1920×1080 khác pixel và viewport 450px không tràn. Chờ kết quả CI/Release.


## P5.1.244 / Electron 4.23.329 — Gõ số để nhảy nhanh tới kênh (CANDIDATE)
- Feature priority: NEW — Gõ chữ số 0–9 khi focus hàng kênh để mở hộp nhảy số, nhập tiếp và nhấn Enter để đi tới kênh; không tự phát hoặc đổi nguồn.
- User action: Focus một hàng kênh trong Xem truyền hình; gõ 412 rồi Enter để chuyển tiêu điểm tới kênh 412, Escape để hủy.
- Electron screenshot: positron-p51244-direct-number-after-1920x1080-real.png
- QA: Ảnh Electron thật 1920×1080 trước/sau; kiểm tra focus, playlist, Favorites, và không tự phát. Chưa hoàn tất nếu thiếu CI/ảnh soát/release.


## P5.1.245 / Electron 4.23.330 — Đồng bộ nhóm với kênh đang chọn (CANDIDATE)
- Feature priority: NEW — Hộp chọn nhóm trong trình nhảy kênh tự chỉ đúng nhóm của hàng kênh được focus sau thao tác bằng bàn phím, thay vì duy trì lựa chọn cũ.
- User action: Tại Xem truyền hình, focus một hàng kênh và gõ 412 Enter; ô Đến nhóm hiển thị 03 · Other channels đúng với QA Channel 412.
- Electron screenshot: positron-p51245-focus-group-after-1920x1080-real.png
- Đầu vào từ ảnh Electron thật P5.1.244 đã mở: người dùng focus QA Channel 412 thuộc nhóm 03 nhưng hộp nhóm vẫn ghi 01.
- QA: ảnh Electron 1920×1080 trước/sau, group 01→03, focus kênh 412, không tự phát, nguồn và Favorites không đổi.
- Chỉ coi HOÀN THÀNH khi CI, soát ảnh và release đủ bằng chứng.


## P5.1.246 / Electron 4.23.331 — Ctrl+Enter nhảy kênh rồi thu gọn bảng (CANDIDATE)
- Feature priority: NEW — Khi nhập số kênh, Ctrl+Enter (Mac có thể Command+Enter) nhảy đến hàng kênh rồi tự thu gọn công cụ, trả lại không gian danh sách và giữ tiêu điểm đúng hàng; Enter thông thường vẫn để mở bảng cho tác vụ tiếp.
- User action: Tại Xem truyền hình, chọn hàng kênh, gõ 412 rồi Ctrl+Enter để tới QA Channel 412 mà không tự phát, đồng thời bảng nhập số thu gọn.
- Electron screenshot: positron-p51246-quick-close-after-1920x1080-real.png
- Bằng chứng đầu vào: đã trực tiếp xem ảnh SAU P5.1.245, bảng nhảy cao chiếm diện tích danh sách sau khi thao tác hoàn tất.
- QA: kiểm tra Ctrl+Enter và điều khiển truy cập; focus, visibility, playlist, Favorites và playback không đổi; 1920×1080 before/after.
- Cần CI, ảnh thật mở soát và release hoàn chỉnh để tính vòng hoàn tất.


## P5.1.247 / Electron 4.23.332 — Hiện vị trí kênh đang chọn (CANDIDATE)
- Feature priority: NEW — Dưới tổng số kênh ở tiêu đề danh sách có nhãn nhỏ "Kênh 412/561" được cập nhật khi focus bằng bàn phím hoặc nhảy số. Hữu ích với các kênh tên giống nhau, không cần mở lại bảng nhảy.
- User action: Chọn một kênh bằng mũi tên hoặc gõ 412 Ctrl+Enter; nhãn vị trí hiện theo hàng đang chọn; không phát video.
- Electron screenshot: positron-p51247-focus-index-after-1920x1080-real.png
- Đầu vào ảnh Electron P5.1.246 đã MỞ: danh sách có hàng QA Channel 412 được tô sáng nhưng tiêu đề chỉ báo 561/561, không hiển thị vị trí hàng.
- QA: ảnh 1920x1080 trước/sau, nhãn đổi từ Kênh 1/561 sang 412/561, aria-live, không tràn hoặc sửa dữ liệu M3U/Favorites.
- Chỉ hoàn thành sau Node/Electron QA và release bất biến.


## P5.1.248 / Electron 4.23.333 — Alt+Shift+J điền sẵn số kênh đang focus (CANDIDATE)
- Feature priority: NEW — Trên danh sách kênh đang focus, Alt+Shift+J mở bảng nhảy và tự điền số hàng đang chọn để sửa sang một kênh lân cận; Alt+J vẫn mở ô trống như trước.
- User action: Sau khi chọn vị trí kênh 412/561, nhấn Alt+Shift+J để ô số đã có 412; sửa thành 413 rồi Enter nếu muốn, không tự phát.
- Electron screenshot: positron-p51248-prefill-index-after-1920x1080-real.png
- Đầu vào từ ảnh thật P5.1.247: nhãn vị trí 412/561 đã hiển thị nhưng bảng nhảy khi mở vẫn trống.
- QA: giữ Alt+J cũ, test phím mới, panel mở, number=412, focus số, dữ liệu IPTV/Favorites không đổi, ảnh 1920x1080.
- Chỉ coi hoàn thành khi release và bộ ảnh Electron được xác minh, mở soát.


## P5.1.249 / Electron 4.23.334 — Escape hủy rồi trở về hàng kênh đang chọn (CANDIDATE)
- Feature priority: NEW — Khi mở bảng nhảy số từ một hàng kênh đang focus, phím Escape hủy và trả tiêu điểm về đúng hàng đó, để tiếp tục duyệt bằng lên/xuống. Trước đây Escape chỉ trả focus về nút mở bảng, gây đứt dòng điều hướng.
- User action: Chọn QA Channel 412, Alt+Shift+J, Escape: bảng đóng và kênh 412 sáng trở lại; nếu mở từ thanh công cụ thì Escape tiếp tục focus nút như cũ.
- Electron screenshot: positron-p51249-escape-focus-after-1920x1080-real.png
- Đầu vào ảnh thật P5.1.248: bảng nhập 412 chiếm focus và hàng kênh 412 mất focus; cần khôi phục đúng nguồn khi hủy.
- QA: ảnh Electron trước/sau 1920x1080, restore focus hàng 412, no autoplay/favorites mutation, legacy toggle Escape; regression Node.
- Chỉ hoàn tất sau CI, mở ảnh và release bất biến thành công.

## P5.1.250 / Electron 4.23.335 — Ẩn chỉ báo vị trí đã cũ (HOÀN TẤT)
- Feature priority: NEW — Thêm tương tác mới tự ẩn chỉ báo vị trí đang chọn khi người dùng đưa tiêu điểm ra khỏi danh sách kênh, không hiển thị sai trạng thái và không tác động việc phát video hay dữ liệu playlist.
- Electron screenshot: positron-p51250-focus-badge-after-1920x1080-real.png
- User action: Focus một hàng kênh để xem vị trí, chuyển Tab sang thanh công cụ để ẩn nhãn; khi mở bộ nhảy kênh Alt+Shift+J rồi Escape, vị trí được giữ và khôi phục.
- Dựa trên ảnh Electron thật P5.1.249: chỉ báo `Kênh 412/561` nằm dưới bộ đếm. Kiểm tra mã phát hiện chỉ có `focusin` cập nhật nên nhãn vẫn hiển thị khi đã rời danh sách.
- Sửa: `focusout` xóa vị trí focus cũ khi chuyển sang thanh công cụ; tạm giữ vị trí gốc khi hộp nhảy số mở và khôi phục khi Escape. Không đọc/sửa dữ liệu luồng M3U hay Favorites.
- QA: `positron-p51250-focus-badge-before-1920x1080-real.png` và `positron-p51250-focus-badge-after-1920x1080-real.png`, kiểm tra giữ focus, không tự phát và dữ liệu bất biến.
- Chỉ hoàn thành khi CI, ảnh sau đã MỞ và release mới được kiểm chứng.

## P5.1.251 / Electron 4.23.336 — Alt+Shift+L quay lại hàng kênh vừa duyệt (HOÀN TẤT)
- Feature priority: NEW — Thêm phím tắt Alt+Shift+L trở lại đúng hàng kênh từng được focus trước khi chuyển sang thanh công cụ; tận dụng ghi nhớ vị trí trong phiên làm việc, không ghi dữ liệu hay tự phát video.
- Electron screenshot: positron-p51251-return-to-row-after-1920x1080-real.png
- User action: Khi đang duyệt kênh bất kỳ, chuyển sang thanh công cụ rồi nhấn Alt+Shift+L để quay lại ngay hàng kênh cũ, có viền focus và vị trí chính xác.
- Đầu vào: ảnh P5.1.250 SAU đã trực tiếp mở xem; nhãn vị trí 412/561 đã được ẩn đúng khi focus ra toolbar nhưng không có thao tác quay lại nhanh bằng bàn phím.
- Kiểm thử: before/after Electron thật 1920×1080, giữ dữ liệu Favorites/Playlist và không làm video tự phát. Chờ CI và release trước khi tính vòng hoàn tất.

## P5.1.252 / Electron 4.23.337 — Quay lại kênh cả sau khi đổi bộ lọc (HOÀN TẤT)
- Feature priority: NEW — Khi người dùng lọc Yêu thích hoặc Vừa xem làm mất hàng kênh cũ khỏi DOM, Alt+Shift+L ghi nhớ ID kênh ổn định, tự trở về bộ lọc Tất cả nếu cần và focus đúng kênh, không sửa nội dung playlist hay tự phát video.
- Electron screenshot: positron-p51252-resume-filter-after-1920x1080-real.png
- User action: Đang focus kênh 412, chọn bộ lọc Yêu thích rồi nhấn Alt+Shift+L từ thanh công cụ để khôi phục danh sách đầy đủ và trở lại chính kênh 412.
- Đầu vào ảnh P5.1.251 đã trực tiếp MỞ: hàng 412 focus lại đúng, nhưng mã chỉ lưu tham chiếu DOM của hàng; khi bộ lọc dựng lại danh sách, tham chiếu này bị mất tính hợp lệ.
- Kiểm thử: 2 ảnh Electron 1920×1080 khác biệt; dữ liệu Favorites và M3U không đổi, không phát stream. Đợi CI / release thực trước khi tính thành công.

## P5.1.253 / Electron 4.23.338 — Căn giữa hàng kênh được khôi phục (CANDIDATE)
- Feature priority: NEW — Khi dùng Alt+Shift+L quay lại hàng kênh đã duyệt, danh sách cuộn tự động căn hàng đó gần giữa panel để người xem có thể thấy các kênh lân cận cả phía trên và dưới, không chỉ nhìn hàng sát mép cuối.
- Electron screenshot: positron-p51253-centered-row-after-1920x1080-real.png
- User action: Focus QA Channel 412, chuyển sang thanh công cụ rồi Alt+Shift+L để quay lại. Hàng đang chọn hiện gần trung tâm danh sách thay vì cạnh dưới, cuộn không ảnh hưởng vùng nội dung ngoài.
- Đầu vào: ĐÃ MỞ ảnh Electron thật P5.1.252 SAU; hàng 412 được focus nhưng nằm sát mép dưới panel, thiếu bối cảnh duyệt.
- QA: đo hình học vị trí row trước/sau, ảnh Electron 1920×1080, không phát video hoặc thay đổi M3U/Favorites; chỉ hoàn tất sau CI/release.


## P5.1.279 — Không tự đóng danh sách chưa phân loại
- Feature priority: BLOCKER_FIX — CI không thể build bản phát hành khi kiểm thử P272 đã lỗi sau P278, đồng thời danh sách con đang mở bị đóng lúc dạy AI và render lại, khiến người dùng không xem hết dữ liệu.
- Feature class: AI
- User action: Vào WatchFlow Intelligence, mở Thư mục EPG, mở Chưa có chủ đề, mở danh sách đầy đủ rồi Bỏ qua hoặc render lại; cả hai thư mục vẫn phải mở.
- Electron screenshot: positron-p51279-folders-persist-after-1920x1080-real.png
- Evidence: Native Electron QA tests opening the nested unclassified-channel disclosure, rerendering WatchFlow and checking rawOpen, parentOpen, cached scans, playlist immutability and no automatic playback.
- Sửa trạng thái mở danh sách con trong thư mục EPG ảo khi WatchFlow Intelligence render lại hoặc khi người dùng dạy AI, bỏ qua kênh.
- Đồng bộ kiểm thử P272 với DOM lồng thực tế P278; kiểm tra cả nhánh thư mục thường và danh sách kênh con, không xóa assertion.
- Thêm smoke test Electron P279: mở danh sách, render lại, xác thực trạng thái, cache, không tự phát và playlist nguyên vẹn; ghi 2 PNG 1920×1080.
- Release thử nghiệm tắt, chỉ build và giữ artifact trong GitHub Actions theo chính sách chỉ public bản stable.
