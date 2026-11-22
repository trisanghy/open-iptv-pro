# Nhật ký thay đổi Git — Positron (tiếng Việt)

Bản diễn giải theo phiên bản từ mã nguồn và GitHub Releases. SHA và liên kết commit nguyên gốc được giữ để đối chiếu.

## P5.1.235 — lịch sử nhóm bỏ điểm quay lại trùng nhóm hiện tại

**Ứng dụng:** 4.23.320 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Lịch sử điều hướng nhóm theo phiên chỉ giữ một vị trí cho mỗi nhóm và tự loại đích quay lại trùng nhóm đang xem, giúp nút “Nhóm trước” không quay vòng vô ích hoặc hiển thị nhầm sau khi trở về. Electron screenshot: positron-p51235-history-dedupe-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/e65f216e629350fcfaf9d4159b3cb0ac8d5a1be9)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/tree/Positron)

## P5.1.234 — Tìm đúng nhóm có Đ viết hoa bằng chữ không dấu / Electron 4.23.319

**Ứng dụng:** 4.23.319 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Hỗ trợ tìm tên thư mục tiếng Việt có chữ Đ viết hoa bằng từ khóa không dấu ngay trong bộ chọn nhóm, giúp người xem truy cập đúng dữ liệu danh sách kênh mà không cần đổi tên thư mục hoặc mở video. Electron screenshot: positron-p51234-vietnamese-group-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c7423143a230c9dde4f3552f729a6ada0dcc52e0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.319-p5.1.234)

## P5.1.233 — Quay về nhóm vừa rời / Electron 4.23.318

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Người dùng nhảy từ nhóm 01 sang một nhóm bất kỳ có thể quay lại nhóm cũ trong một lần nhấn, kể cả khi hai nhóm cách xa nhau; lịch sử focus nhóm trong phiên hoàn toàn tách biệt lịch sử phát video và không ghi đè dữ liệu playlist. Electron screenshot: positron-p51233-group-history-after-1920x1080-real.png

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.232 — Tìm nhanh nhóm kênh theo tên / Electron 4.23.317

**Ứng dụng:** 4.23.317 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Khi có hàng chục thư mục, người dùng có thể gõ một phần tên để thu hẹp nhóm ngay trong bộ chọn Alt+G, thay vì bấm tới từng nhóm; hỗ trợ tên tiếng Việt không dấu. Đồng thời sửa lỗi ảnh P5.1.231 cho thấy nhãn “Đến nhóm” chồng lên ô chọn. Electron screenshot: positron-p51232-group-search-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/bb0d388b064196f684708f01f8cedf82f8718652)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.317-p5.1.232)

## P5.1.231 — Bộ chọn nhóm kênh trực tiếp qua Alt+G / Electron 4.23.316

**Ứng dụng:** 4.23.316 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Sau khi chuyển nhóm tuần tự đã hoạt động, người dùng có hàng chục nhóm kênh cần nhảy trực tiếp tới bất kỳ nhóm nào bằng menu chọn có nhãn rõ ràng và hỗ trợ bàn phím; có thể mở nhóm thu gọn qua thao tác gốc. Electron screenshot: positron-p51231-group-picker-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c24456dc805be153e916fe2555483c4d13d88d85)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.316-p5.1.231)

## P5.1.230 — Chuyển nhóm kênh bằng phím trái/phải / Electron 4.23.315

**Ứng dụng:** 4.23.315 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Chọn một kênh rồi nhấn → để tới đầu nhóm mở kế tiếp, ← để về đầu nhóm trước. Bỏ qua nhóm thu gọn, giữ nguyên luồng phát, dữ liệu playlist và Favorites. User action: Trên trang TV, focus một hàng kênh rồi nhấn mũi tên phải để tới đầu nhóm kế tiếp đang mở, nhấn mũi tên trái để quay lại nhóm trước; nhấn Enter mới phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ef06c22c7cb84ec2ae62cbd8672dc0a79781cefc)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.315-p5.1.230)

## P5.1.229 — Đánh dấu yêu thích ngay bằng phím F / Electron 4.23.314

**Ứng dụng:** 4.23.314 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Người dùng đang duyệt hàng trăm kênh bằng phím mũi tên có thể nhấn F trên hàng kênh được focus để thêm/bỏ Yêu thích ngay lập tức, không cần rê chuột tới biểu tượng sao nhỏ và không làm chuyển hoặc phát kênh. Electron screenshot: positron-p51229-keyboard-favorite-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0b4614e9ce376a8b62899c1558b2644ee6a46e16)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.314-p5.1.229)

## P5.1.228 — Duyệt kênh bằng bàn phím, không cần chuột / Electron 4.23.313

**Ứng dụng:** 4.23.313 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Người dùng có hàng trăm kênh có thể di chuyển focus bằng mũi tên lên xuống, Home, End, PageUp và PageDown mà không phải nhấn phát từng kênh; thêm viền focus rõ ràng và Alt+J mở ô nhảy tới số kênh, giữ nguyên video đang xem. Electron screenshot: positron-p51228-keyboard-channels-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d0ea0be1b121c96c203a869c076280efbf7af1cd)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.313-p5.1.228)

## P5.1.227 — Nhảy kênh không cuộn cả trang video, tiêu đề gọn / Electron 4.23.312

**Ứng dụng:** 4.23.312 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Ảnh Electron P5.1.226 cho thấy nhảy tới kênh 250 kéo cả trang video lên, che khuất đầu sidebar và mép trên khung phát, trong khi ba nút tiêu đề khiến chữ xuống hai dòng; sửa đúng vùng cuộn để điều khiển TV vẫn luôn nhìn thấy. Electron screenshot: positron-p51227-jump-scroll-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/5e7c9bb8666289cfb14d06da4c4956fbd8ef91a0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.312-p5.1.227)

## P5.1.226 — Nhảy nhanh tới kênh theo số, không tự phát / Electron 4.23.311

**Ứng dụng:** 4.23.311 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Khi playlist có hàng trăm kênh, người dùng có thể nhập số thứ tự để định vị kênh trong danh sách mà không phải cuộn qua hàng trăm mục hoặc làm gián đoạn video đang phát. Electron screenshot: positron-p51226-channel-jump-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0b3ed40ff034e49e1ad99dd14dbc660a585dd035)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.311-p5.1.226)

## P5.1.225 — Giữ điều khiển phát video trong cửa sổ desktop / Electron 4.23.310

**Ứng dụng:** 4.23.310 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Các nút điều khiển phát video, âm lượng và chọn kênh bị đẩy xuống dưới vùng nhìn khi desktop rộng mà cửa sổ thấp, nên cần giới hạn riêng chiều cao stage để tránh cắt thao tác quan trọng mà không thay đổi dữ liệu người xem. Electron screenshot: positron-p51225-tv-controls-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/88fbb97fa7e16aaeb7c22d210aaec162e4ac6e95)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.310-p5.1.225)

## P5.1.224 — Trạng thái nhập XMLTV hiển thị ngay trong EPG / 4.23.309

**Ứng dụng:** 4.23.309 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Sau khi người dùng nhập hoặc hủy file XMLTV ngay từ trang Lịch phát sóng, phản hồi không còn bị giấu trong mục Cài đặt, tránh nhầm rằng ứng dụng treo hoặc mất dữ liệu EPG. Electron screenshot: positron-p51224-epg-feedback-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/be3e79f8049cae0ebd42a211c47b73577a991fce)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.309-p5.1.224)

## P5.1.223 — Nhập XMLTV trực tiếp từ trạng thái EPG rỗng / Electron 4.23.308

**Ứng dụng:** 4.23.308 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Người xem có file XMLTV hợp pháp trong máy có thể nhập trực tiếp từ trang Lịch phát sóng mà không phải đi vòng qua trang Cài đặt; dùng nguyên luồng kiểm tra, xác nhận và lưu của chức năng nhập hiện có. Electron screenshot: positron-p51223-epg-import-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/50bd3ac3820dbf615c5191abf5a7ac989691b51b)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.308-p5.1.223)

## P5.1.222 — Chọn nhanh nguồn EPG khi chưa tải dữ liệu / Electron 4.23.307

**Ứng dụng:** 4.23.307 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Bổ sung nút chọn nguồn XMLTV ngay trong trạng thái rỗng của lịch phát sóng, giúp người dùng nhập và kiểm tra nguồn thay vì bị báo sai là danh sách kênh không khớp khi chưa tải lịch. Electron screenshot: positron-p51222-epg-source-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/3848d687983751697f938c1e8c43c42273a5591c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.307-p5.1.222)

## P5.1.221 — Căn thẳng các nhãn EPG DVR / Electron 4.23.306

**Ứng dụng:** 4.23.306 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Các nhãn Bắt đầu và Kết thúc lệch hàng khiến việc chọn đúng thời điểm ghi video trở nên khó kiểm tra; sửa bố cục để tránh thao tác nhầm mà không thay đổi dữ liệu lịch hoặc luồng ghi hình. Electron screenshot: positron-p51221-dvr-form-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/57ad538afbea22ad2a867ebca6a8017e82235fa1)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.306-p5.1.221)

## P5.1.220 — Mở rộng lịch sử khám phá tối đa 50 kênh / Electron 4.23.305

**Ứng dụng:** 4.23.305 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Mã và ảnh Electron P5.1.219 cho thấy lịch sử có thể chứa 50 lần khám phá nhưng popup chỉ hiện 10 kênh gần nhất, khiến các kênh cũ không thể truy cập; thêm nút mở rộng/thu gọn. Electron screenshot: positron-p51220-history-more-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d1dd21a6f3662daa57a4ae5944f7617274259b07)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.305-p5.1.220)

## P5.1.219 — Sắp xếp lịch sử khám phá theo tên / Electron 4.23.304

**Ứng dụng:** 4.23.304 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.218 cho thấy tìm kiếm và lọc Yêu thích hoạt động nhưng lịch sử chỉ theo thời điểm khám phá; thêm chế độ tên A–Z và Z–A theo thứ tự tiếng Việt. Electron screenshot: positron-p51219-history-sort-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/816fa1741d35c0594bbc0f255ac903165a3aeb77)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.304-p5.1.219)

## P5.1.218 — Lọc nhanh Yêu thích trong lịch sử khám phá / Electron 4.23.303

**Ứng dụng:** 4.23.303 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.217 cho thấy nút sao mới đã giúp lưu kênh, nhưng danh sách lịch sử còn trộn kênh thường và kênh đã yêu thích. Thêm lọc theo Favorites trong phiên, kết hợp tìm kiếm. Electron screenshot: positron-p51218-favorites-filter-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/e7667a49aeec087a0f1c812e0a55eed4d7a954e0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.303-p5.1.218)

## P5.1.217 — Đánh dấu Yêu thích trong lịch sử khám phá / Electron 4.23.302

**Ứng dụng:** 4.23.302 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.216 cho thấy menu khám phá cho phép chọn phát lại và tìm kiếm nhưng thiếu thao tác lưu ngay kênh vừa thấy vào Yêu thích; thêm nút sao độc lập trong mỗi dòng. Electron screenshot: positron-p51217-history-favorite-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/31f35aac8c43f3a4af93522a0063a98fe2175b8b)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.302-p5.1.217)

## P5.1.216 — Gõ tìm ngay khi mở lịch sử khám phá / Electron 4.23.301

**Ứng dụng:** 4.23.301 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Mở menu với tiêu điểm ở ô tìm, gõ ngay và di chuyển hai hướng giữa kết quả bằng bàn phím; không tự phát kênh. Electron screenshot: positron-p51216-search-focus-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/18a791e1373a02601e398940f73075574d6b0b87)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.301-p5.1.216)

## P5.1.215 — Tìm kiếm nhanh trong lịch sử khám phá kênh / Electron 4.23.300

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Ảnh P5.1.214 xác nhận lịch sử khám phá có nút chọn bằng bàn phím nhưng chưa có ô tìm khi nhiều kênh xuất hiện. Thêm tìm nhanh theo tên hoặc nhóm, hỗ trợ bỏ dấu tiếng Việt. Electron screenshot: positron-p51215-history-search-after-1920x1080-real.png

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.214 — Điều hướng menu lịch sử bằng bàn phím/remote / Electron 4.23.299

**Ứng dụng:** 4.23.299 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.213 chứng minh menu lịch sử mở và chọn kênh bằng click nhưng thiếu di chuyển tiêu điểm có điều khiển với phím mũi tên. Thêm ↑/↓ chuyển lựa chọn và quay vòng, Home/End đến đầu/cuối; Enter thực hiện xem lại. Electron screenshot: positron-p51214-history-keys-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/010dd8f1ce13cc2d000fd4b600f40837c3f89e7a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.299-p5.1.214)

## P5.1.213 — Lịch sử kênh ngẫu nhiên chọn phát lại / Electron 4.23.298

**Ứng dụng:** 4.23.298 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Từ ảnh P5.1.212, Back và Forward chỉ chuyển kênh từng bước. Menu mới mở trực tiếp tối đa 10 kênh vừa khám phá để chọn phát lại bằng một lần bấm. Electron screenshot: positron-p51213-random-history-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/fccaef6054b3259c98de64e01198e3fa9f8efb9c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.298-p5.1.213)

## P5.1.212 — Tiến tới trong lịch sử kênh ngẫu nhiên / Electron 4.23.297

**Ứng dụng:** 4.23.297 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.211 cho thấy nút ↶ cho phép quay về kênh khám phá trước, nhưng sau đó người xem không thể trở lại kênh vừa rời nếu không bấm Bất kỳ để lấy một kênh khác. Thêm nút tiến ↷ để điều hướng lịch sử hai chiều ngay trong thanh phát, tránh mất ngữ cảnh. Electron screenshot: positron-p51212-random-forward-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/fe62662b4888ce02bd1fbac7d9a57fde4c6f3715)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.297-p5.1.212)

## P5.1.211 — Trở lại kênh ngẫu nhiên đã khám phá / Electron 4.23.296

**Ứng dụng:** 4.23.296 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Sau ảnh Electron P5.1.210, thanh Bất kỳ đã có số lượt và nút làm mới nhưng chưa có thao tác quay lại khi vừa khám phá một kênh ngẫu nhiên thú vị rồi chuyển tiếp. Thêm nút quay lại theo lịch sử phiên khám phá để tiết kiệm thao tác tìm kênh và giữ ngữ cảnh. Electron screenshot: positron-p51211-random-back-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7114bfbad4b3018e39d5da180b1b94d029e94a0d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.296-p5.1.211)

## P5.1.210 — Tự cập nhật bộ đếm khám phá khi đổi nguồn / Electron 4.23.295

**Ứng dụng:** 4.23.295 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Từ ảnh P5.1.209 và mã xử lý danh sách nguồn, bộ đếm Bất kỳ có thể tiếp tục ghi nhận các kênh đã xóa hoặc thay nguồn, dẫn tới tiến độ sai cho tới lúc người dùng tự bấm chuyển kênh tiếp. Bổ sung đồng bộ thông minh khi danh sách kênh được cập nhật, tránh khiến tiến độ kênh không còn tồn tại gây nhầm lẫn. Electron screenshot: positron-p51210-source-sync-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9cbd49228ed9ae4bba7c56edb8cabc2efe7d55e0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.295-p5.1.210)

## P5.1.209 — Tiến độ khám phá ngẫu nhiên có mẫu số / Electron 4.23.294

**Ứng dụng:** 4.23.294 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.208 cho thấy nút Bất kỳ chỉ hiển thị số kênh đã thử trong phiên (1), không cho biết tổng số kênh đủ điều kiện. Thêm mẫu số trực tiếp để người xem biết đã khám phá bao nhiêu trong toàn bộ playlist hiện tại. Electron screenshot: positron-p51209-random-progress-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/61a62f3f416b1494aad43e17c75814d54112f49f)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.294-p5.1.209)

## P5.1.208 — Giữ tiêu điểm khi làm mới khám phá ngẫu nhiên / Electron 4.23.293

**Ứng dụng:** 4.23.293 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Nút làm mới tự ẩn khi đang có tiêu điểm bàn phím khiến người dùng điều khiển từ xa mất vị trí tiếp tục thao tác chọn kênh phát; lỗi chặn trải nghiệm xem và không thể đi tiếp bằng Enter như mong đợi. Electron screenshot: positron-p51208-focus-return-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1dde6d67c651cd75710de0ea53d161c3d102528d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.293-p5.1.208)

## P5.1.207 — Electron 4.23.292 — Làm mới vòng khám phá ngẫu nhiên (CANDIDATE)

**Ứng dụng:** 4.23.292 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm nút làm mới trực tiếp trên thanh phát để người xem bắt đầu một lượt khám phá ngẫu nhiên mới bất cứ khi nào, không cần chờ đi hết toàn bộ danh sách hợp lệ. User action: Sau khi nhấn Bất kỳ ít nhất một lần, nhấn nút ↻ ngay bên cạnh để xóa bộ đếm lượt khám phá hiện tại rồi bắt đầu chọn lại từ đầu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/b9e283ba16cf68d174c8ac2feefef51c4414245c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.292-p5.1.207)

## P5.1.206 — Electron 4.23.291 — Khám phá ngẫu nhiên không lặp kênh (CANDIDATE)

**Ứng dụng:** 4.23.291 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Người xem dùng nút Bất kỳ nhiều lần mà tránh chọn lại các kênh đã được khám phá trong cùng chu kỳ; khi hết tập hợp hợp lệ mới mở vòng khám phá tiếp, tăng sự đa dạng. User action: Trên màn hình Xem truyền hình, nhấn Bất kỳ nhiều lần; huy hiệu số đếm các kênh đã chọn trong chu kỳ hiện tại, hoạt động ngay trong trình phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c6fa1983e7befaf3a8977bdcdcd3e1176f05d66c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.291-p5.1.206)

## P5.1.205 — Electron 4.23.290 — Đổi kênh ngẫu nhiên ngay khi xem (CANDIDATE)

**Ứng dụng:** 4.23.290 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Người xem có thể khám phá kênh ngẫu nhiên khác ngay khi đang phát thay vì phải trở về màn hình chưa chọn kênh. User action: Tại Xem truyền hình, khi có từ hai kênh hợp lệ, nhấn biểu tượng xúc xắc Bất kỳ bên cạnh nút Kênh sau.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0a82f74bdec68dd434affe332dd8e5bd94eb0f6a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.290-p5.1.205)

## P5.1.204 — 4.23.289 — Khám phá kênh ngẫu nhiên từ trang TV (CANDIDATE)

**Ứng dụng:** 4.23.289 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Khi có nhiều kênh đã nhập nhưng chưa chọn kênh để xem, nút “Khám phá kênh ngẫu nhiên” giúp tìm nội dung mới thay vì luôn bắt đầu từ kênh thứ nhất; không chọn kênh chết/thiếu URL, không tự chạy lúc mở app. User action: Mở trang Xem truyền hình, khi chưa chọn kênh hãy nhấn Khám phá kênh ngẫu nhiên; ứng dụng chọn một kênh hợp lệ bằng hành động rõ ràng của người xem.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9052de6fe686bbdae4a04b548e6e158590c5c5ba)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.289-p5.1.204)

## P5.1.203 — 4.23.288 — Thông báo TV không che nút phát/âm lượng (CANDIDATE)

**Ứng dụng:** 4.23.288 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Khi xem truyền hình trên desktop, thông báo được đưa đến vùng góc phía trên; nút mở danh sách nổi vẫn bấm được nhưng không che thanh phát và âm lượng, trong khi cảnh báo quan trọng cùng lịch sử trên thanh đầu vẫn truy cập được. User action: Mở trang Xem truyền hình trên desktop và thực hiện thao tác phát sinh thông báo; điều khiển Play/Volume không còn bị banner che. Bấm Thông báo trên thanh trên để xem nhật ký.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a8bf38dceee311551c452c8127c8614cf16639b2)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.288-p5.1.203)

## P5.1.202 — 4.23.287 — Gia hạn lịch ghi thêm 15 phút, giới hạn tối đa 8 giờ (CANDIDATE)

**Ứng dụng:** 4.23.287 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Giữ nguyên kênh và giờ bắt đầu, cho phép gia hạn mốc kết thúc thêm 15 phút khi chương trình thể thao hoặc trực tiếp kéo dài. User action: Vào Lịch phát sóng → Hẹn giờ ghi hình, chọn thời gian bắt đầu/kết thúc hợp lệ, nhấn “Gia hạn +15 phút”; có cả trên mẫu ghi nhanh từ TV.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/023d2800d24c25eb21673568f88fb6c2339e4cb5)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.287-p5.1.202)

## P5.1.201 — 4.23.286 — Hoàn tác lần thay tên bản ghi vừa xác nhận (CANDIDATE)

**Ứng dụng:** 4.23.286 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Cho phép khôi phục đúng tên chương trình người dùng vừa thay bằng nút hoàn tác một lần, tránh mất tên nhập thủ công khi họ đổi ý và không làm thay đổi bất cứ lịch ghi nào. User action: Mở Lịch phát sóng, nhập tên riêng, xác nhận hai lần thay tên theo kênh, rồi nhấn Hoàn tác thay tên để trở về tên trước đó.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/cf02d2a3c4e7aca3788d66ca5ef548bcfef5dd14)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.286-p5.1.201)

## P5.1.200 — 4.23.285 — Xác nhận thay tên lịch ghi bằng hai lần nhấn (CANDIDATE)

**Ứng dụng:** 4.23.285 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Khi đã có tên ghi hình tự nhập, nút tạo tên tự động cho phép xác nhận rõ ràng bằng hai lần nhấn thay vì bắt xóa tên cũ; tránh ghi đè vô ý và giảm bước thao tác. User action: Vào Lịch phát sóng, nhập tên riêng, bấm Tạo tên từ kênh và giờ một lần để xem xác nhận, bấm lần hai để thay hoặc nhấn Escape để hủy.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/59eb5d2427b5867b127eb26b547004a3d35b3c8e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.285-p5.1.200)

## P5.1.199 — 4.23.284 — Đồng bộ tên ghi hình tạo tự động (CANDIDATE)

**Ứng dụng:** 4.23.284 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Tên được ứng dụng tạo từ kênh và giờ nay tự cập nhật khi người xem đổi thời gian ghi hoặc kênh, tránh tạo lịch với tên sai ngày nhưng vẫn bảo vệ nhãn nhập tay. User action: Mở Lịch phát sóng, tạo tên từ kênh và giờ, sau đó chọn Ngày mai cùng giờ hoặc sửa giờ bắt đầu để thấy tên tự cập nhật.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9eb4ea091ac8e419caf488b644c0ae7639ec44fa)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.284-p5.1.199)

## P5.1.198 — Hẹn giờ ghi ngày mai cùng giờ / Electron 4.23.283

**Ứng dụng:** 4.23.283 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.197 thực tế cho thấy các nút bắt đầu nhanh chỉ có Sau 5, Sau 15, Sau 30 phút, không có cách chuyển lịch ghi sang ngày mai giữ nguyên giờ đã chọn. Bổ sung nút Ngày mai cùng giờ ở cả hai mẫu ghi hình để tiện lên lịch mà không nhập lại giờ kết thúc. Electron screenshot: positron-p51198-dvr-tomorrow-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/f84f7f4e84d3b5b398bded8c4111162797ce4810)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.283-p5.1.198)

## P5.1.197 — Sao chép lịch ghi và bỏ lặp tên kênh / Electron 4.23.282

**Ứng dụng:** 4.23.282 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.196 thật ở 1920×1080 cho thấy dòng xem trước nhỏ, lặp kênh hai lần khi tên được tạo tự động và không thể sao chép nội dung để đối chiếu. Bổ sung nút sao chép theo yêu cầu, trạng thái thành công/thất bại và nội dung tóm tắt gọn dễ đọc. Electron screenshot: positron-p51197-dvr-copy-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/70906dee44f4669c739051a079d9dc6bb7e251bd)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.282-p5.1.197)

## P5.1.196 — Xem trước lịch ghi hình / Electron 4.23.281

**Ứng dụng:** 4.23.281 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.195 cho thấy người dùng điền kênh, tên và hai mốc thời gian nhưng thiếu bước xem lại toàn bộ lịch. Thêm phần xem trước luôn cập nhật, cho phép phát hiện thời lượng sai trước khi người dùng chủ động xác nhận. Electron screenshot: positron-p51196-dvr-preview-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/35e66592acf4182cb74d412a2eb643abc241c049)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.281-p5.1.196)

## P5.1.195 — Đặt tên bản ghi tự động theo kênh và giờ / Electron 4.23.280

**Ứng dụng:** 4.23.280 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.194 Electron thật cho thấy ô Tên chương trình vẫn rỗng ngay cả khi kênh và giờ ghi đã được chọn; người dùng cần gõ lại hoặc không thể lưu vì trường bắt buộc. Thêm nút gợi ý tên chính xác theo kênh/giờ, tuyệt đối không ghi đè tên tự nhập. Tính năng: nút “Tạo tên từ kênh và giờ” bên dưới Tên chương trình của mẫu EPG. Nhấn để điền tên kênh đã chọn và thời gian địa phương đã nhập (DD.MM.YYYY HH:mm), loại ký tự không an toàn; nếu người dùng đã nhập tên khác thì chỉ báo và giữ nguyên. Không đổi giờ, kênh, nguồn hay trạng thái ghi hình.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/4c0af9abac7b5a596d024e423b04a7d947672f33)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.280-p5.1.195)

## P5.1.194 — Chọn nhanh giờ bắt đầu ghi hình sau 5/15/30 phút / Electron 4.23.279

**Ứng dụng:** 4.23.279 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.193 thực ở 1920×1080 cho thấy lịch ghi có các nút chọn thời lượng nhưng trường Bắt đầu vẫn cần nhập ngày giờ thủ công. Bổ sung chọn giờ bắt đầu từ hiện tại để giảm thao tác hẹn ghi, không gửi lịch khi chưa xác nhận. Tính năng: dưới giờ Bắt đầu có ba nút “Sau 5 phút”, “Sau 15 phút”, “Sau 30 phút” ở EPG và biểu mẫu ghi nhanh TV. Nhấn chỉ điền Bắt đầu dựa trên phút hiện tại, đồng thời dời Kết thúc để giữ thời lượng cũ nếu hợp lệ (1–480 phút), hoặc 60 phút khi thiếu/không hợp lệ. Tự cập nhật nhãn thời lượng và trạng thái preset P5.1.192/193.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ff29ada0c777398a4fc8dcba36db4cd9c99dd474)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.279-p5.1.194)

## P5.1.193 — Nút DVR tự đánh dấu thời lượng 30/60/120 phút / Electron 4.23.278

**Ứng dụng:** 4.23.278 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thực của P5.1.192 cho thấy thời lượng 1 giờ nhưng ba nút 30/60/120 phút có giao diện giống hệt nhau, khiến người xem khó xác định lựa chọn hiện tại khi chỉnh giờ ghi. Khi nhập Bắt đầu/Kết thúc, ứng dụng đánh dấu đúng nút có số phút tương ứng bằng aria-pressed và viền màu chủ đề; không có nút được chọn khi chỉnh giờ không khớp hoặc lịch sai.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/5074565d748fc23c50d1b26cb6523cf024a2388b)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.278-p5.1.193)

## P5.1.192 — Thời lượng ghi hình trực tiếp và cảnh báo 8 giờ / Electron 4.23.277

**Ứng dụng:** 4.23.277 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.191 cho thấy nút chọn thời lượng 30/60/120 phút đã hoạt động, nhưng form không có thông tin tổng thời lượng và chưa cảnh báo trực quan khi người dùng sửa giờ kết thúc sai. Thêm dòng kiểm tra trực tiếp cho cả EPG DVR và ghi nhanh TV mà không can thiệp luồng ghi hình. Hiển thị số giờ/phút ngay khi nhập thời gian; nếu kết thúc không sau bắt đầu hoặc vượt 8 giờ, báo rõ lỗi. Không tự thay đổi giờ nhập, không tự tạo lịch, không phát video, giữ xác thực DVR native.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1b90ff51eb4aa01d12b0b48e4483051b34118c70)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.277-p5.1.192)

## P5.1.191 — Chọn nhanh thời lượng DVR 30/60/120 phút / Electron 4.23.276

**Ứng dụng:** 4.23.276 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh EPG Electron thật P5.1.190 ở 1920×1080 cho thấy hẹn giờ ghi hình phải nhập thủ công cả thời gian Bắt đầu và Kết thúc. Thêm nút cộng 30, 60, 120 phút dưới trường Kết thúc ở cả lịch ghi trên EPG và biểu mẫu ghi nhanh trên TV. Nút chỉ tính và điền giá trị Kết thúc theo thời gian Bắt đầu ở múi giờ cục bộ; kích hoạt input/change để form gốc kiểm tra. Không tự đặt lịch, không khởi chạy DVR, không sửa nguồn M3U, danh sách kênh hoặc quyền xem.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/324ce2606c258faa412d811b4acb95865f8c1c81)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.276-p5.1.191)

## P5.1.190 — Bấm lại tab TV để trở về khung phát / Electron 4.23.275

**Ứng dụng:** 4.23.275 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.189 1920×1080 cho thấy đầu trình phát bị khuất khi đang ở trang TV nhưng cuộn còn sâu; thao tác chọn TV khi tab đã active không quay về vùng video vì setPage chỉ đặt lại scroll ở lần chuyển tab. Khi chọn lại nút TV đang active, cuộn nội dung về đầu trình phát ngay. Chỉ áp dụng cho trang TV, không chuyển kênh, không tự phát và không thay đổi các tab/thiết lập khác.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/b8a22f0f8b7e0e533ad9fd264fde379b045733e8)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.275-p5.1.190)

## P5.1.189 — Sắp xếp gợi ý Yêu thích A–Z / Z–A / theo nguồn / Electron 4.23.274

**Ứng dụng:** 4.23.274 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.188 đã dàn đủ sáu cột gợi ý nhưng chỉ có tìm kiếm và lọc nhóm, chưa có cách sắp xếp các kênh chưa yêu thích khi nguồn chứa hàng trăm kênh. Thêm tùy chọn hiển thị Theo nguồn, Tên A–Z, Tên Z–A theo thứ tự tiếng Việt. Lựa chọn chỉ sắp xếp mảng gợi ý đã lọc trước khi phân trang; giữ nguyên thứ tự nguồn M3U, Favorites đã lưu, trạng thái kênh hiện tại và nút lưu hàng loạt, không tự phát video.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/61177c02fc3c2e727e1057034b65dd678fad3c16)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.274-p5.1.189)

## P5.1.188 — Gợi ý Yêu thích đủ rộng trên desktop / Electron 4.23.273

**Ứng dụng:** 4.23.273 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm chế độ dàn gợi ý toàn chiều rộng desktop giúp duyệt kênh nhanh hơn, dựa trên ảnh Electron P5.1.187 thật ở 1920×1080 cho thấy phần gợi ý chỉ chiếm 1180px, để thừa vùng trống rộng bên phải, trong khi danh sách Yêu thích phía trên dùng đủ chiều ngang. Với desktop từ 1600px, mở rộng riêng khối gợi ý theo bề ngang vùng nội dung, tự bố trí 6 cột dễ đọc. Giữ 4 cột ở laptop, 2/1 cột ở máy hẹp; không đụng dữ liệu M3U/Favorites, phát video hoặc phân trang.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/688f2740afdf66c424ce82dcd6aeb3e4391272a5)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.273-p5.1.188)

## P5.1.187 — Đi thẳng tới trang gợi ý / Electron 4.23.272

**Ứng dụng:** 4.23.272 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.186 hiển thị Trang 9/9 và Trước/Tiếp, nhưng chưa thể tới trang số bất kỳ khi nguồn có hàng chục hoặc hàng trăm trang. Thêm ô số “Đến trang” với giới hạn 1..tổng trang, nhập và nhấn Enter hoặc đổi giá trị để nhảy trực tiếp; tự kẹp số quá nhỏ/lớn, đồng bộ chỉ số và số kênh, giữ nguyên tìm kiếm/nhóm/pageSize và dữ liệu nguồn.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/93abc920f4197ca4e3724b8ce83411f23ddcaa7f)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.272-p5.1.187)

## P5.1.186 — Phân trang gợi ý Trước / Tiếp / Trang x/y / Electron 4.23.271

**Ứng dụng:** 4.23.271 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.185 có hàng trăm kênh gợi ý nhưng chỉ có Gợi ý khác, không biết đang ở trang nào, không quay lại trang trước và vòng lặp cũ có thể lặp kênh ở trang cuối. Thêm nút Trước, chỉ số Trang x/y (aria-live), giữ nút Gợi ý khác để tiến tiếp; phân trang theo các lát cắt không trùng kênh. Trang cuối đúng số còn lại, nút Lưu cả N phản ánh số hiện tại, chức năng cũ vẫn giữ và không tự phát video.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/3d990557bb77972a22f4e0d77ff55b7436da7bcb)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.271-p5.1.186)

## P5.1.185 — Nhóm gợi ý truy cập nhanh có số kênh / Electron 4.23.270

**Ứng dụng:** 4.23.270 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.184 có dropdown nhóm nhưng không biết số kênh từng nhóm trước khi chọn; duyệt 541 kênh mất thời gian. Thêm dải nút truy cập nhanh các nhóm nhiều kênh với đếm số lượng thực từ kênh còn gợi ý, đánh dấu nhóm đang chọn bằng aria-pressed; chọn Tất cả khôi phục. Dropdown hiện số lượng từng nhóm và tổng kênh; không can thiệp M3U, favoriteKeys hay phát video.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/cda6a6fe6f29798b3dda34faeab54ab5f648f452)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.270-p5.1.185)

## P5.1.184 — Lọc gợi ý Yêu thích theo nhóm / Electron 4.23.269

**Ứng dụng:** 4.23.269 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh P5.1.183 chứng minh có 553 kênh chưa lưu nhưng gợi ý không phân loại theo nhóm; tìm bằng mắt còn rườm rà. Thêm dropdown nhóm được tạo trực tiếp từ metadata nguồn đang bật, chỉ lọc tên nhóm thực có kênh chưa đánh dấu sao. Kết hợp tìm kiếm không dấu và lựa chọn 6/12/24 kênh, nút Lưu cả N vẫn theo số thẻ được lọc. Tập dữ liệu nguồn và favoriteKeys giữ nguyên.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/4f8caf8a4166a6cf47b655ad5a63fdf3a0352e89)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.269-p5.1.184)

## P5.1.183 — Gợi ý Yêu thích 6/12/24 kênh / Electron 4.23.268

**Ứng dụng:** 4.23.268 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.182 cho thấy 6 gợi ý bị bó trong card 720px trên desktop rộng 1920px, duyệt nhiều kênh mất thao tác. Viewer chọn 6, 12 hoặc 24 gợi ý, giữ mặc định sáu, nút Gợi ý khác nhảy đúng số đang chọn, Lưu cả N chỉ lưu kênh hiển thị sau nhấn chủ động. Tăng panel lên tối đa 1180px, 4/2/1 cột responsive.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c27cf4ce68b224a24d6c2a0e63e281b670a61974)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.268-p5.1.183)

## P5.1.182 — Sắp xếp Yêu thích theo tên / Electron 4.23.267

**Ứng dụng:** 4.23.267 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Từ ảnh Electron P181 nhận thấy danh sách 8 Favorites thiếu điều khiển sắp xếp, khó tìm bằng mắt ở thư viện nhiều kênh. Thêm select “Thứ tự ban đầu / Tên A–Z / Tên Z–A” cạnh ô tìm kiếm; Intl.Collator('vi') và CSS order, không ghi thay đổi vào favoriteKeys, M3U hay trạng thái trình phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/38923e0aa8f2fd1715eb6892999ddacb3139e869)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.267-p5.1.182)

## P5.1.181 — Sửa lưới Yêu thích 6 cột hẹp/cắt tên / Electron 4.23.266

**Ứng dụng:** 4.23.266 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Ảnh P5.1.180 xác nhận lỗi cắt tên Yêu thích khiến người xem không nhận diện chính xác kênh trước khi bấm phát video, nguy cơ chọn sai kênh; đây là lỗi cản trở sử dụng cốt lõi. Visual bug confirmed from real screenshot P5.1.180: khi lưu 6 kênh một lần tổng 8 Favorites, auto-fit grid dàn thành 6 cột hẹp, tên "QA Ch..." bị ellipsis và metadata dồn 4 dòng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/93edf7c6aea472f95462e1606ef9d7597526bb60)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.266-p5.1.181)

## P5.1.180 — Lưu nhiều kênh gợi ý vào Yêu thích bằng một nhấn / Electron 4.23.265

**Ứng dụng:** 4.23.265 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.179 cho thấy tìm ra kênh gợi ý dễ hơn nhưng người xem vẫn phải nhấn ☆ nhiều lần để lưu một nhóm sáu kênh. Thêm thao tác Lưu cả N kênh chỉ lưu danh sách gợi ý hiện tại khi có nhấn chủ động, không sửa playlist hoặc tự phát. User action: Mở Yêu thích có ít nhất một kênh → xem nhóm gợi ý hoặc lọc theo tên/nhóm → bấm Lưu cả N kênh để đánh dấu yêu thích toàn bộ danh sách N kênh đang hiển thị.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7324378988794dfed8c96fc16bdbd3bad9083b94)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.265-p5.1.180)

## P5.1.179 — Tìm trực tiếp trong 559 kênh gợi ý / Electron 4.23.264

**Ứng dụng:** 4.23.264 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.178 cho thấy Gợi ý khác đã duyệt sáu kênh mỗi lần nhưng không có cách tìm tên hoặc nhóm khi 559 kênh chưa sao. Bổ sung bộ tìm riêng ngay trong khu vực gợi ý, hỗ trợ tiếng Việt không dấu, không ảnh hưởng bộ lọc của Favorites đã lưu. User action: Mở Yêu thích có ít nhất một kênh → gõ tên hoặc nhóm trong ô Tìm kênh để thêm → chọn ☆ để lưu hoặc xóa từ khóa để xem các nhóm kênh tiếp.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/f6f2736a5f91cc3904ffc2f692439e803440529f)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.264-p5.1.179)

## P5.1.178 — Gợi ý khác để duyệt thêm kênh Yêu thích / Electron 4.23.263

**Ứng dụng:** 4.23.263 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.176 cho thấy bảng Gợi ý thêm vào Yêu thích chỉ có sáu kênh đầu dù còn hàng trăm kênh chưa đánh sao. Thêm nút Gợi ý khác để duyệt các nhóm sáu kênh chưa sao tiếp theo mà không sửa playlist và không tự phát. User action: Mở trang Yêu thích có ít nhất một kênh → bấm Gợi ý khác để thấy sáu kênh tiếp theo → bấm ☆ ở kênh mong muốn để thêm vào Yêu thích.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/433dcac2d6833063948cf6bad53c980ebe4d7896)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.263-p5.1.178)

## P5.1.177 — Tìm kiếm không dấu trong Yêu thích / Electron 4.23.262

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Ảnh thực P5.1.176 đã có 2 thẻ yêu thích với số lượng có thể tăng liên tục; trang chưa có ô tìm riêng theo tên/nhóm. Bổ sung thanh tìm kênh trong Yêu thích, hỗ trợ tiếng Việt không dấu, case-insensitive, trả về số hiển thị X / tổng mà không thay đổi số kênh yêu thích thật. User action: Mở trang Yêu thích đang có nhiều thẻ → nhập một phần tên hoặc nhóm vào ô Tìm trong Yêu thích → chỉ còn thẻ phù hợp; xóa từ khóa để trở lại danh sách đầy đủ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.176 — Gợi ý thêm Yêu thích sau kênh đầu tiên / Electron 4.23.261

**Ứng dụng:** 4.23.261 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.175 sau thao tác cho thấy QA Channel 001 là thẻ Yêu thích duy nhất, còn phần lớn trang trống, trong khi 560 kênh khác đã nhập. Bổ sung bảng Gợi ý thêm vào Yêu thích ở cuối danh sách khi đã có Favorites, với tối đa 6 kênh chưa đánh dấu sao; bấm ☆ lưu trực tiếp, không phát. User action: Mở Yêu thích đã có ít nhất một kênh → chọn ☆ tại bảng Gợi ý thêm vào Yêu thích → kênh tiếp theo xuất hiện trong danh sách ngay lập tức, cập nhật số sao.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/12f85294771a70492470a5183470e1f157512326)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.261-p5.1.176)

## P5.1.175 — Thêm nhanh kênh vào Yêu thích ngay trong empty state / Electron 4.23.260

**Ứng dụng:** 4.23.260 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.174 cho thấy trang Yêu thích đang trống nhưng có 561 kênh và CTA phải chuyển sang TV. Tạo cụm chọn nhanh tối đa 6 kênh đang bật, bấm ☆ bên cạnh tên kênh sẽ đánh dấu yêu thích ngay tại đây, không cần mở player. Đồng thời CTA tới TV xóa từ khóa QA Channel 011 cũ để trả lại toàn bộ 561 kênh. User action: Mở Yêu thích khi chưa có kênh yêu thích nhưng đã có nguồn → chọn một trong tối đa 6 nút ☆ kênh được gợi ý → kênh đó xuất hiện thành thẻ Yêu thích; có thể mở TV để chọn thêm kênh khác.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c4da69de4d8d282026a8cd48cf6d24f019eff9cc)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.260-p5.1.175)

## P5.1.174 — Yêu thích trống dẫn đúng tới TV thay vì Quản lý nguồn / Electron 4.23.259

**Ứng dụng:** 4.23.259 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.173 tại trang Yêu thích cho thấy 561 kênh đã nhập nhưng danh sách chưa có sao, nút CTA vẫn ghi Quản lý nguồn IPTV; dẫn người dùng sang việc thêm nguồn không liên quan. CTA giờ đổi theo dữ liệu hiện có: có kênh → Xem kênh để đánh dấu ★ (quay về TV, focus ô tìm); không có kênh → Quản lý nguồn IPTV. User action: Mở Yêu thích khi đã có kênh nhưng chưa đánh dấu sao → bấm Xem kênh để đánh dấu ★ → tự đến TV và focus tìm kênh; việc đánh dấu sao vẫn do người dùng thực hiện.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/240af7385b31dc55da55264675cd05ae2f14df44)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.259-p5.1.174)

## P5.1.173 — Quay lại đúng vị trí kiểm kê sau khi tìm kênh / Electron 4.23.258

**Ứng dụng:** 4.23.258 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron P5.1.172 cho thấy bấm Tìm sẽ đưa đúng một kênh lên TV nhưng người dùng phải tìm lại vị trí kiểm kê; bổ sung nút ↩ Kiểm kê · trang N xuất hiện cạnh ô tìm TV chỉ sau thao tác định vị, quay về đúng trang kênh thiếu logo đang xử lý mà không mất bộ lọc. User action: Từ Thư viện → Kênh thiếu logo → sang trang 2 → bấm Tìm một kênh → chọn ↩ Kiểm kê · trang 2 ngay dưới ô tìm để quay lại đúng trang thứ hai và tiếp tục rà soát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1dd6895f7bde24deb17a19c4b3a4b86de072ce55)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.258-p5.1.173)

## P5.1.172 — Tìm đúng kênh thiếu logo trong danh sách TV / Electron 4.23.257

**Ứng dụng:** 4.23.257 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Ảnh Electron thật P5.1.171 cho thấy trang kiểm kê hiển thị kênh 11–20 trong khi danh sách TV bên trái còn kênh 1–10, thiếu cầu nối tìm đúng kênh để người dùng sửa hoặc xem thông tin. Thêm nút Tìm cho mỗi hàng, đặt ô tìm trong TV theo đúng tên kênh và mở bộ lọc Tất cả. User action: Mở Thư viện → Kênh thiếu logo → chuyển tới trang cần kiểm tra → bấm Tìm cạnh kênh muốn định vị; panel đóng, tab TV hiện danh sách đã lọc theo tên, chỉ phát khi người dùng chủ động bấm kênh.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/511b1331a809f62bd39c47abfbfb6048e3c27f19)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.257-p5.1.172)

## P5.1.171 — Phạm vi kênh thực đang xem / Electron 4.23.256

**Ứng dụng:** 4.23.256 · **Trạng thái:** Đã phát hành

Electron screenshot: positron-p51171-visible-range-after-1920x1080-real.png User action: Mở Thư viện → Kênh thiếu logo → chuyển trang hoặc đổi số kênh/trang; quan sát dòng Đang xem X–Y / tổng kênh ngay dưới thanh phân trang.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d41dac20e845cdbef5bea8d34cb4737be5887903)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.256-p5.1.171)

## P5.1.170 — Xóa nhanh toàn bộ bộ lọc Thư viện / Electron 4.23.255

**Ứng dụng:** 4.23.255 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Cho phép đưa năm điều kiện tìm kiếm, nhóm, EPG, thứ tự và mật độ phân trang về mặc định chỉ với một lần bấm, thay vì hoàn nguyên từng ô khi kiểm kê danh sách nhiều kênh. User action: Mở Thư viện → Kênh thiếu logo → thay đổi ít nhất một bộ lọc → bấm nút Xóa bộ lọc cạnh Xuất CSV để trở về tất cả kênh, thứ tự playlist, 10 kênh/trang.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/b577e4d1bfa84bab81209ca0fec6e5b1e295998c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.255-p5.1.170)

## P5.1.169 — Lọc kênh thiếu logo theo mã EPG / Electron 4.23.254

**Ứng dụng:** 4.23.254 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Cho phép phát hiện kênh vừa thiếu logo vừa thiếu mã nhận diện EPG hoặc có EPG nhưng thiếu logo, hỗ trợ người dùng tự ưu tiên sửa metadata thư viện lớn mà không thay đổi playlist. User action: Mở Thư viện → Kênh thiếu logo → chọn Mọi tình trạng EPG, Thiếu cả mã EPG hoặc Đã có mã EPG; kết hợp tìm kiếm, lọc nhóm, sắp xếp, phân trang và xuất CSV theo đúng tập đã lọc.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c4ecb019b4eb7863a919491b8865666699e25d79)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.254-p5.1.169)

## P5.1.168 — Thanh phân trang kênh thiếu logo luôn dễ thao tác / Electron 4.23.253

**Ứng dụng:** 4.23.253 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Thanh điều hướng phân trang dữ liệu thư viện bị che khỏi vùng nhìn khiến người dùng không mở được những trang kênh còn lại khi danh sách lớn; đưa nút lên trên vùng cuộn giúp truy cập đầy đủ. Electron screenshot: positron-p51168-pager-visible-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/14265297ee9e49a053ec8e0440d9dfaddde59641)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.253-p5.1.168)

## P5.1.167 — Thay đổi số kênh thiếu logo mỗi trang / Electron 4.23.252

**Ứng dụng:** 4.23.252 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Duyệt 10, 25 hoặc 50 kênh thiếu logo mỗi trang; thao tác nhanh với thư viện lớn (ảnh gốc có 432 kênh thiếu logo), không cần nhấn Tiếp hàng chục lần. User action: Thư viện → Kênh thiếu logo → chọn 10 / 25 / 50 kênh/trang; bộ lọc, tìm kiếm, nhảy trang và xuất CSV vẫn bảo toàn giá trị, tự tính lại số trang, quay về trang 1 sau đổi mật độ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7a66aabb01e3ca3167feef41cee6ba2756eb1ee9)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.252-p5.1.167)

## P5.1.166 — Lọc tên kênh trùng theo nguồn và Xóa lọc / Electron 4.23.251

**Ứng dụng:** 4.23.251 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm bộ lọc tên kênh trùng giữa nhiều nguồn, trong một nguồn hoặc thiếu mã nguồn, giúp rà soát metadata nhanh và tránh nhầm kênh khi trùng tên giữa nhiều playlist. User action: Mở Thư viện → Tên kênh trùng → chọn chế độ lọc nguồn; khi ô tìm kiếm còn từ khóa cũ bấm Xóa lọc để hiện danh sách đầy đủ, không cần xóa từng ký tự. Xuất CSV vẫn tôn trọng bộ lọc nguồn.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/3acc2ba80124e18d6ffacfe301583df6a60fdce8)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.251-p5.1.166)

## P5.1.165 — Xuất CSV tên kênh trùng / Electron 4.23.250

**Ứng dụng:** 4.23.250 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Xuất bảng metadata có thể đối chiếu toàn bộ tên kênh trùng theo bộ lọc, giúp rà soát hàng trăm kênh mà không phải sửa playlist hoặc mở từng trang. User action: Thư viện → Tên kênh trùng → tìm tên hoặc nhóm → Xuất CSV; ghi toàn bộ kết quả được lọc vào file tải về.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/936c1fb09c2e92eb275236dd960edee4111ed8c3)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.250-p5.1.165)

## P5.1.164 — Phát hiện tên kênh trùng trong thư viện / Electron 4.23.249

**Ứng dụng:** 4.23.249 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Phát hiện các tên kênh bị nhập lặp trong playlist hoặc nhiều nguồn để rà soát thư viện lớn; phân biệt tên khác dấu tiếng Việt, không tự xóa kênh. User action: Mở Thư viện → Tên kênh trùng → mở danh sách, tìm theo tên hoặc nhóm, xem số kênh, số nhóm và số nguồn có tên trùng; dùng Trước/Tiếp để xem những trang còn lại.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/752bfdb8f84196ac0b4b065a50b2650303b4179c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.249-p5.1.164)

## P5.1.163 — Xuất CSV kênh thiếu logo an toàn / Electron 4.23.248

**Ứng dụng:** 4.23.248 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thư viện → Kênh thiếu logo → lọc/tìm/sắp xếp → **Xuất CSV** tất cả kênh khớp, không chỉ 10 hàng hiện tại. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm, tìm hoặc sắp xếp → bấm Xuất CSV, nhận file tên và nhóm kênh trong thư mục Tải xuống.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a4a9f1e5d87d17716e5c89dd71d0bf57aaace4b9)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.248-p5.1.163)

## P5.1.162 — Chuyển nhanh tới trang bất kỳ trong thư viện / Electron 4.23.247

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Nhập trực tiếp trang muốn xem ở bảng kênh thiếu logo thay vì bấm nút Tiếp liên tục khi thư viện có hàng chục trang; tự giới hạn trong khoảng trang hợp lệ, tránh mất vị trí. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm hoặc tìm kiếm → nhập số trang trong ô cạnh nút Trước/Tiếp rồi nhấn Enter hoặc nút Đến để chuyển ngay.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.161 — Sắp xếp kênh thiếu logo A–Z/Z–A / Electron 4.23.246

**Ứng dụng:** 4.23.246 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Hỗ trợ sắp xếp những kênh thiếu logo theo tên tăng/giảm với so sánh số tự nhiên, để nhanh chóng phát hiện và rà soát các kênh có tên tương tự trong thư viện lớn. User action: Mở Thư viện → Kênh thiếu logo → chọn nhóm tùy ý → chọn Thứ tự playlist, Tên kênh A–Z hoặc Tên kênh Z–A để sắp xếp riêng danh sách trên màn hình.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/caba7377c1e7c484c9db78cd1e6ee8ec48d40182)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.246-p5.1.161)

## P5.1.160 — .1 — Hoàn thiện lọc nhóm và minh chứng Electron / 4.23.245

**Ứng dụng:** 4.23.244 · **Trạng thái:** Đã phát hành

Feature priority: BLOCKER_FIX — Sửa lỗi kiểm chứng CI khi bộ lọc nhóm đang hoạt động nhưng ảnh Electron sau thao tác không cho thấy điều khiển, bảo đảm hình ảnh đại diện đúng giao diện được phát hành. Electron screenshot: positron-p511601-group-filter-after-1920x1080-real.png

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/78ef17739da4e26d3e167d5f3dd02ff15670e953)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.244-p5.1.160)

## P5.1.159 — Tìm kiếm kênh thiếu logo / Electron 4.23.243

**Ứng dụng:** 4.23.243 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm tìm kiếm kênh chưa có logo theo tên hoặc nhóm, hỗ trợ tiếng Việt không dấu để người dùng không phải duyệt từng trang trong playlist lớn. User action: Mở Thư viện → Kênh thiếu logo → nhập tên hoặc nhóm; danh sách cập nhật ngay và xoá tìm kiếm để xem lại tất cả.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/88483997300e24fb6e19d4a7031edd230ca0cb46)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.243-p5.1.159)

## P5.1.158 — Chẩn đoán kênh thiếu logo / Electron 4.23.242

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Từ tỷ lệ logo 0/561 nhìn thấy trên ảnh Electron P5.1.157, bổ sung danh sách các kênh chưa có URL logo, chia trang 10 kênh để người dùng xác định metadata thiếu. User action: Thư viện → Kênh thiếu logo → Trước / Tiếp; hiển thị tên và nhóm từ playlist đã nhập, không tự quét mạng và không bổ sung logo giả.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.157 — Phân bố kênh theo nhóm

**Ứng dụng:** 4.23.241 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm danh sách nhóm kênh với số lượng và thanh tỷ lệ ngay trong Bản đồ thư viện; có thể mở thêm từng 5 nhóm mà không cần tải nguồn mới hoặc thử phát. User action: Bấm Thư viện, xem Phân bố kênh theo nhóm; nhấn Xem thêm 5 nhóm để đọc tiếp, chọn Thu gọn danh sách khi đã xem hết.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ca549834c5d2cdee64ecc6b7a8feb75f1be0e51c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.241-p5.1.157)

## P5.1.156 — Bản đồ thư viện kênh ngoại tuyến

**Ứng dụng:** 4.23.240 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Thêm bảng Library Pulse riêng trong thanh trên: đếm số kênh, số nguồn, số nhóm, trạng thái khả dụng đã được lưu, URL logo và mã EPG của dữ liệu hiện có. User action: Chọn Thư viện, xem các thẻ thống kê và thanh mức độ hoàn thiện metadata; nhấn Cập nhật để đọc lại dữ liệu hiện hành hoặc Escape để đóng.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.155 — Dọn banner nổi, giữ nhật ký

**Ứng dụng:** 4.23.239 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm thao tác Dọn banner để người dùng đóng nhanh toàn bộ banner đang che trình phát, không phải chạm từng toast và không làm mất dòng nhật ký đã ghi. User action: Mở Thông báo và bấm Dọn banner; các banner thành công/cảnh báo/lỗi đang nổi biến mất theo thao tác chủ động, nhưng nội dung và số mục trong Nhật ký giữ nguyên.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/98c9a6e5f9d77dc59f85a2a5515cb5e7e8a13647)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.239-p5.1.155)

## P5.1.154 — Chế độ Không làm phiền khi xem TV

**Ứng dụng:** 4.23.238 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Bổ sung công tắc Ẩn xác nhận nổi để giảm banner che nội dung video, nhưng vẫn ghi toàn bộ sự kiện vào nhật ký phiên và luôn giữ banner cảnh báo/lỗi quan trọng. User action: Mở Thông báo, bấm Ẩn xác nhận nổi: Bật; các thông báo thành công mới không che màn hình nhưng vẫn xem được trong Nhật ký. Bấm lại để tắt chế độ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.153 — Tìm trong nhật ký thông báo bằng từ khóa không dấu

**Ứng dụng:** 4.23.237 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Cho phép tìm kiếm nội dung thông báo ngay trong nhật ký 30 mục theo từ khóa tiếng Việt có hoặc không có dấu, kết hợp bộ lọc loại thông báo mà không xóa dữ liệu. User action: Mở Thông báo, nhập từ khóa trong ô Tìm trong thông báo; có thể gõ ket noi để tìm kết nối, hoặc nhấn Xóa tìm kiếm để khôi phục danh sách.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.152 — Lọc nhật ký theo loại thông báo

**Ứng dụng:** 4.23.236 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Cho phép tìm nhanh cảnh báo, lỗi và xác nhận thành công trong nhật ký tối đa 30 mục bằng bộ lọc không phá hủy, phù hợp khi phải kiểm tra nhiều thông báo. User action: Mở Thông báo ở thanh trên, bấm Cảnh báo / Lỗi / Hoàn thành để chỉ xem loại tương ứng; chọn Tất cả để khôi phục toàn bộ danh sách.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/fb8572b91feb1d0047db68a1eeed4cfdc15e71e0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.236-p5.1.152)

## P5.1.151 — Nhật ký thông báo của phiên chạy

**Ứng dụng:** 4.23.235 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm nhật ký tối đa 30 thông báo thành công, cảnh báo và lỗi trong phiên để có thể xem lại sau khi thông báo nổi tự hết hạn mà không lưu dữ liệu riêng xuống đĩa. User action: Bấm Thông báo trên thanh trên để xem nội dung và thời điểm thông báo; chọn Xóa lịch sử hoặc Đóng/Escape. Lịch sử tự xóa khi thoát ứng dụng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6cb00b963173e2632315916e9896a8fee070dfe7)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.235-p5.1.151)

## P5.1.150 — Trung tâm thông báo gọn, xem lại thông báo khi cần

**Ứng dụng:** 4.23.234 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm nút "Xem thêm N thông báo" cho các xác nhận thành công còn hiệu lực, mặc định thu gọn chỉ hiện thông báo mới nhất. Bấm để mở lại rồi bấm thu gọn. Cảnh báo và lỗi không bị ẩn, người dùng vẫn có thể đóng từng thông báo, và bộ hẹn tự tắt 5,5 giây không thay đổi. Không ghi thông báo lên đĩa và không sửa playlist/player. User action: Khi thao tác nhiều, chỉ một thông báo thành công mới nhất và một nút Xem thêm xuất hiện; bấm Xem thêm để đọc lại những thông báo vẫn còn trên màn hình, bấm Thu gọn để giải phóng không gian.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/73ecdec3a25b805e791c2e8d48b5fc286fe72ac0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.234-p5.1.150)

## P5.1.149 — Chọn nhắc EPG trước 5/10/15/30 phút

**Ứng dụng:** 4.23.233 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Chọn thông báo XMLTV trước 5, 10, 15 hoặc 30 phút; mỗi lịch giữ thời điểm riêng. Lịch cũ không có leadMinutes vẫn mặc định 10 phút; không đụng nguồn và không autoplay. User action: Trong Chọn kênh, bật lọc Sắp chiếu hoặc Đang chiếu (EPG), mở Bộ lọc, chọn Nhắc trước 5/10/15/30 phút rồi bấm chuông trên thẻ kênh. Bấm lại để hủy như P5.1.148.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/e447a573a3acb2000cb4bd7d8ee6aefd2f511306)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.233-p5.1.149)

## P5.1.148 — Hủy hoặc bật lại lịch nhắc EPG ngay bằng chuông

**Ứng dụng:** 4.23.232 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Nút chuông nhắc lịch ngay trên thẻ kênh nay thể hiện rõ đã lưu/chưa lưu, và cho phép bấm lần nữa để hủy đúng một chương trình đã nhắc; sử dụng lịch XMLTV đã nhập và dịch vụ nhắc nội bộ hiện có, không tự phát và không tác động lịch khác. User action: Mở Chọn kênh và bật bộ lọc EPG, tìm chương trình sắp chiếu rồi nhấn chuông để lưu; chuông đổi màu và trạng thái đã nhắc. Nhấn lại chuông để hủy, không phải tìm vào màn EPG và không cần tải nguồn ngoài.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/681f1406615d9f0b6f4c7a6fc5c15a159ed62ac2)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.232-p5.1.148)

## P5.1.147 — Nhắc trước 10 phút ngay trên kênh có chương trình sắp chiếu

**Ứng dụng:** 4.23.231 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Thêm nút chuông độc lập trên thẻ kênh có lịch XMLTV sắp chiếu, cho phép đặt nhắc trước 10 phút bằng hệ thống nhắc lịch thật đã có; không cần mở trang EPG và tuyệt đối không tự phát video. User action: Trong Chọn kênh bật “Sắp chiếu” hoặc “Đang chiếu (EPG)”, tìm kênh có chương trình tiếp theo, nhấn nút chuông ở góc phải trên để lưu nhắc. Nhấn lần nữa nhận thông báo đã có nhắc, không tạo lịch trùng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/274567ce608e2d8e8f8a96681cdb5edb654f0de0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.231-p5.1.147)

## P5.1.146 — Thanh tiến độ và phút còn lại theo lịch XMLTV

**Ứng dụng:** 4.23.230 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Xem tiến độ ước tính của chương trình **theo lịch EPG**, gồm thanh phần trăm và số phút còn lại. Không mô tả là tiến độ phát video thực tế. User action: TV → Chọn kênh → Bộ lọc → “Có chương trình đang chiếu (EPG)”, xem “Theo lịch EPG: 50% · còn 15 phút” trên thẻ kênh. Không có dữ liệu EPG hợp lệ hoặc tắt bộ lọc thì ẩn tiến độ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.145 — Tùy chỉnh mốc lọc EPG sắp chiếu 15, 30, 60 phút

**Ứng dụng:** 4.23.229 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Cho phép chọn khoảng thời gian 15, 30 hoặc 60 phút khi lọc chương trình sắp chiếu. Danh sách thay đổi tức thì theo giờ phát thật từ XMLTV đã nhập, không tự tải thêm lịch hay tác động playlist. User action: Mở TV → Chọn kênh → Bộ lọc → bật “Sắp chiếu” → chọn “Khoảng thời gian” 15, 30 hoặc 60 phút. Hệ thống cập nhật bộ lọc ngay, người dùng tắt chế độ để trở về danh sách đầy đủ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.144 — Sắp xếp chương trình EPG sắp phát sớm nhất

**Ứng dụng:** 4.23.228 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Thêm tùy chọn sắp xếp kênh theo thời điểm bắt đầu chương trình tiếp theo từ lịch XMLTV thực tế đã nhập; kênh chưa có EPG vẫn giữ lại cuối danh sách và không mất nguồn. User action: Mở TV → Chọn kênh → Bộ lọc → Sắp xếp → “Chương trình sắp phát sớm nhất (EPG)”; các kênh có chương trình gần tới đứng đầu, trên thẻ hiện giờ và tên chương trình. Chọn “Tên A → Z” để trở về như cũ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.143 — Lọc chương trình sắp chiếu trong 60 phút

**Ứng dụng:** 4.23.227 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Lọc kênh có chương trình sẽ bắt đầu trong 60 phút tới từ EPG/XMLTV đã nhập, kể cả kênh chưa có chương trình đang phát. Hiện giờ phát và tên, tìm tên không dấu. Tách biệt và loại trừ bộ lọc “Đang chiếu”. User action: TV → Chọn kênh → Bộ lọc → “Sắp chiếu trong 60 phút (EPG)”; tìm “phim sap chieu”. Không tự mở nguồn phát, đặt lịch nhắc, tải XMLTV mới hay thay đổi playlist.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.142 — Xem lịch chương trình tiếp theo ngay trên thẻ kênh

**Ứng dụng:** 4.23.226 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Hiển thị tên và giờ bắt đầu chương trình sắp phát bên dưới chương trình hiện tại trên thẻ kênh, chỉ khi người dùng bật bộ lọc EPG và chỉ từ lịch XMLTV có thật đã nhập; không tự mở nguồn ngoài, tự phát video hay đặt nhắc lịch. User action: Mở TV → Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; thẻ kênh sẽ hiện “Theo EPG: ...” và “Tiếp theo HH:MM: ...” khi lịch XMLTV có chương trình kế tiếp.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.141 — Tìm theo tên chương trình đang chiếu

**Ứng dụng:** 4.23.225 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Cho phép tìm kênh bằng **tên chương trình đang chiếu** từ XMLTV hiện có ngay trong giao diện TV, không cần mở trang Lịch phát sóng; tìm tiếng Việt không dấu và nhiều từ linh hoạt. Chỉ bật tính năng khi người dùng chủ động lọc EPG. User action: Mở Chọn kênh → Bộ lọc → Có chương trình đang chiếu (EPG), nhập tên chương trình như “tin yeu thich” để tìm kênh đang có chương trình đó theo XMLTV; nhấn vào thẻ mới phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/361a2830232bc83a820cb5375c0be6cc9de8e704)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.225-p5.1.141)

## P5.1.140 — Lọc kênh đang có chương trình từ XMLTV

**Ứng dụng:** 4.23.224 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Thêm bộ lọc chỉ hiển thị các kênh có chương trình hiện tại trong lịch EPG/XMLTV đã nhập, kèm tên chương trình ngay trên thẻ; không dự đoán lịch phát và không kiểm tra hoặc tự mở luồng mạng. User action: Mở Chọn kênh → Bộ lọc → bật “Có chương trình đang chiếu (EPG)”; chọn kênh có tên chương trình theo lịch, hoặc tắt bộ lọc để xem toàn bộ.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.139 — Ưu tiên kênh yêu thích lên đầu

**Ứng dụng:** 4.23.223 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Thêm tùy chọn sắp xếp “Yêu thích lên đầu” trong danh sách kênh, đưa kênh đã đánh dấu sao lên trước nhưng giữ các kênh khác theo thứ tự tên; chỉ thay đổi cách hiển thị, không sửa playlist hay dữ liệu nguồn. User action: Mở Chọn kênh, mở Bộ lọc rồi chọn Sắp xếp → Yêu thích lên đầu; có thể trở lại Tên A → Z/Z → A ngay lập tức.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.138 — Chuyển trang kênh bằng PageDown/PageUp

**Ứng dụng:** 4.23.222 · **Trạng thái:** Chưa có bản phát hành

Feature priority: NEW — Duyệt xuyên qua các trang kênh dài chỉ bằng hai phím PageDown/PageUp, giữ tiêu điểm vào thẻ ở trang mới và không tự phát; hữu ích khi danh sách có hàng trăm kênh. User action: Mở Chọn kênh, dùng Enter chọn thẻ rồi nhấn PageDown để sang trang kế tiếp và chọn kênh đầu; PageUp trở về trang trước và chọn thẻ cuối, nhấn Enter trên thẻ mới phát.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.137 — Duyệt thẻ kênh bằng phím mũi tên

**Ứng dụng:** 4.23.221 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Điều hướng các kênh ngay trong Chọn kênh bằng bốn phím mũi tên và Home/End, bám đúng vị trí thẻ ở cả dạng lưới và danh sách; không cần Tab qua từng nút yêu thích và không tự phát video. User action: Mở Chọn kênh, nhập “QA Channel” rồi Enter để chọn thẻ đầu tiên; dùng ← → ↑ ↓ để di chuyển theo vị trí kênh, Home về đầu và End tới cuối; chỉ Enter trên thẻ mới phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6d8b23968e30a4264feca3cd58b44ace6d1720ee)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.221-p5.1.137)

## P5.1.136 — Enter chọn kết quả tìm kênh

**Ứng dụng:** 4.23.220 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Chuyển tiêu điểm bàn phím tới thẻ kênh phù hợp đầu tiên sau khi tìm kiếm, tránh phải dùng chuột và không tự phát hoặc thay đổi dữ liệu người dùng. User action: Mở Chọn kênh ở TV, nhập tên kênh vào Tìm kiếm rồi nhấn Enter để chọn thẻ đầu tiên; nhấn Enter thêm lần nữa trên thẻ mới phát kênh nếu muốn.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a883e66d3a727ee4e007253869dd811269c9bec3)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.220-p5.1.136)

## P5.1.135 — Tìm kênh nhiều từ không đúng thứ tự

**Ứng dụng:** 4.23.219 · **Trạng thái:** Đã phát hành

Feature priority: NEW — Tìm được kênh bằng nhiều từ khóa trong tên và nhóm dù đảo thứ tự, có khoảng trắng lặp hoặc gõ tiếng Việt không dấu; không truy cập URL, không tự phát video và không đổi dữ liệu. User action: Mở Chọn kênh, gõ "001 Channel QA" hoặc "qa 001" vào Tìm kiếm; kết quả "QA Channel 001" xuất hiện mà không cần gõ chính xác thứ tự.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/f257bf79031549cc75d4eb5f3beb463786930daf)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.219-p5.1.135)

## P5.1.134 — Nhấn F để thêm/bỏ Yêu thích và dùng biểu tượng sao SVG

**Ứng dụng:** 4.23.218 · **Trạng thái:** Đã phát hành

Khi chọn một thẻ kênh, nhấn phím F để thêm kênh vào Yêu thích; nhấn lần nữa để bỏ lưu mà không phát video. Nút sao sử dụng SVG 20 px đồng nhất thay ký tự phụ thuộc phông chữ, giữ nguyên dữ liệu đã lưu, thao tác chuột và bàn phím.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d973e0886eae15c9fed6f8bee1886639bbfaa46e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.218-p5.1.134)

## P5.1.133 — Tên kênh dễ đọc hơn, nút Yêu thích tách riêng

**Ứng dụng:** 4.23.217 · **Trạng thái:** Chưa có bản phát hành

Ở cửa sổ 450 px, tên kênh dài bị cắt cạnh nút hình sao. Bản này dành hàng riêng cho nút Yêu thích, cho phép tên kênh xuống hai dòng mà vẫn giữ nguyên thao tác phát và dữ liệu đã lưu.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.132 — Xóa nhanh bộ lọc khi tìm không thấy kênh

**Ứng dụng:** 4.23.216 · **Trạng thái:** Đã phát hành

Khi tìm kiếm hoặc chọn nhóm mà không có kết quả, xuất hiện nút “Xóa bộ lọc và xem tất cả kênh”. Nhấn nút sẽ xóa truy vấn, khôi phục danh sách và đưa con trỏ về ô tìm kiếm; không tự phát kênh.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/eab0be6a1e9e6873894becc3a472b117fb60cea2)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.216-p5.1.132)

## P5.1.131 — Tìm kênh tiếng Việt không dấu, kể cả chữ đ

**Ứng dụng:** 4.23.215 · **Trạng thái:** Chưa có bản phát hành

Bổ sung quy đổi chữ “đ” thành “d” khi tìm kiếm. Ví dụ, gõ “dia phuong” có thể tìm nhóm “TH địa phương”. Tên và nhóm kênh gốc không bị thay đổi.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.130 — Ẩn phần viền thừa ở nút lọc nhóm kênh

**Ứng dụng:** 4.23.214 · **Trạng thái:** Chưa có bản phát hành

Mở rộng vùng che có điều kiện cho thanh nhóm kênh cuộn ngang, xử lý nét viền còn lộ cạnh “Tất cả”. Các nút nhóm bên cạnh vẫn bấm được và không ảnh hưởng phát kênh.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.129 — Sửa chữ nhóm kênh bị lộ cạnh nút “Tất cả”

**Ứng dụng:** 4.23.213 · **Trạng thái:** Đã phát hành

Theo ảnh Electron 450 px, một phần chữ của nhóm bị cuộn lọt ra cạnh nút “Tất cả”. Đồng bộ trạng thái cuộn và chỉ che phần chữ thừa khi thực sự cuộn ngang.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/c3754e3d196f4ef9354a93617f235cd89538166a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.213-p5.1.129)

## P5.1.128 — Tự đưa nhóm đang chọn vào vùng nhìn thấy

**Ứng dụng:** 4.23.212 · **Trạng thái:** Đã phát hành

Khi đổi nhóm bằng bộ lọc nâng cao, thanh nhóm kênh tự cuộn để hiện nút nhóm đang được chọn. Chọn “Tất cả” sẽ đưa thanh về đầu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7003357116d97ec3d98c76af54071fd4e81b717d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.212-p5.1.128)

## P5.1.127 — Dùng phím mũi tên để duyệt nhóm kênh

**Ứng dụng:** 4.23.211 · **Trạng thái:** Đã phát hành

Cho phép chuyển tiêu điểm giữa các nhóm bằng phím mũi tên, Home và End trên màn hình hẹp. Chỉ thay đổi bộ lọc khi người dùng chọn nhóm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/8bad7fc08d009c3529447d0389a176caabe30648)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.211-p5.1.127)

## P5.1.126 — Che tên nhóm kênh bị khuất sau nút “Tất cả”

**Ứng dụng:** 4.23.210 · **Trạng thái:** Đã phát hành

Thêm vùng che phía dưới nút “Tất cả” được ghim khi thanh nhóm cuộn ngang, tránh hiển thị chữ chồng và tránh chọn nhầm nhóm bị che.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9aac59d3c7b66e5689a2d3f24e3da76d704e8483)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.210-p5.1.126)

## P5.1.125 — Ghim nút “Tất cả” khi cuộn nhóm kênh

**Ứng dụng:** 4.23.209 · **Trạng thái:** Đã phát hành

Giữ nút đặt lại “Tất cả” ở mép trái của thanh nhóm kênh trên cửa sổ hẹp. Các nhóm còn lại vẫn hỗ trợ cuộn, cảm ứng và bàn phím.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/b7cc07b69b8c3d503edb39f3284add1695a658ac)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.209-p5.1.125)

## P5.1.124 — Cuộn nhóm kênh ngang bằng bánh xe chuột

**Ứng dụng:** 4.23.208 · **Trạng thái:** Đã phát hành

Dùng bánh xe chuột để di chuyển thanh nhóm kênh theo chiều ngang khi còn nội dung cần cuộn. Khi tới mép, trả thao tác cuộn về trang như bình thường.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/808e2f8ef5260b4bd9b41dc2747ce3113256181d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.208-p5.1.124)

## P5.1.123 — Thông báo trên màn hình nhỏ không che nội dung

**Ứng dụng:** 4.23.207 · **Trạng thái:** Đã phát hành

Đưa thông báo thành công vào dải gọn phía dưới và giữ nút đóng. Các thông báo cảnh báo/lỗi vẫn được ưu tiên hiển thị.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/38011da89d7b384431bbf3babb9da4f581674340)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.207-p5.1.123)

## P5.1.122 — Đóng thông báo và khôi phục vị trí bàn phím

**Ứng dụng:** 4.23.206 · **Trạng thái:** Đã phát hành

Khi đóng thông báo, tiêu điểm quay lại điều khiển trước đó thay vì bị mất. Giữ nguyên thời gian tự tắt, mức cảnh báo và các chức năng khác.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9b5676910c4e9c88250b68f49bfe47e8abcad956)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.206-p5.1.122)

## P5.1.121 — Thêm nút đóng thông báo bằng chuột hoặc bàn phím

**Ứng dụng:** 4.23.205 · **Trạng thái:** Đã phát hành

Bổ sung nút đóng có thể dùng bằng cảm ứng và bàn phím cho thông báo trong Positron. Không thay đổi nội dung và thời gian tự tắt của thông báo.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/daefa5bb1e8119c8d16ddbf22d7b04003881f5b7)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.205-p5.1.121)

## P5.1.120 — Rút gọn các thông báo thành công trên màn hình hẹp

**Ứng dụng:** 4.23.204 · **Trạng thái:** Đã phát hành

Chỉ hiện thông báo thành công mới nhất ở cửa sổ hẹp để không che danh sách kênh; cảnh báo, lỗi và bộ hẹn giờ vẫn hoạt động.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/2eec95e697ef50b9e2f2c1b420652515005423bc)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.204-p5.1.120)

## P5.1.119 — Hiển thị số kênh Yêu thích trực tiếp trên tab

**Ứng dụng:** 4.23.203 · **Trạng thái:** Đã phát hành

Thêm huy hiệu đếm số kênh đã lưu ở tab Yêu thích. Số được cập nhật khi thêm/bỏ sao và ẩn khi bằng không; có nhãn hỗ trợ truy cập.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/f3bd1bf867f939335eb2d96e555be9dd7408e81e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.203-p5.1.119)

## P5.1.118 — Đánh dấu Yêu thích ngay trên thẻ kênh

**Ứng dụng:** 4.23.202 · **Trạng thái:** Đã phát hành

Thêm nút hình sao riêng trên từng thẻ kênh. Người dùng có thể lưu hoặc bỏ Yêu thích mà không cần phát kênh trước.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9751d3c02c2a293c63301f066b16b079a2d884ff)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.202-p5.1.118)

## P5.1.117 — Một kênh lọc được hiển thị rộng và dễ đọc

**Ứng dụng:** 4.23.201 · **Trạng thái:** Đã phát hành

Khi chỉ còn một kênh trong kết quả lọc trên màn hình hẹp, thẻ kênh tự chiếm toàn bộ hàng thay vì bó hẹp trong nửa cột.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/15a29463a11da0679caa367515362c74bfec8029)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.201-p5.1.117)

## P5.1.116 — Chỉ hiển thị nhóm kênh thật trong danh sách

**Ứng dụng:** 4.23.200 · **Trạng thái:** Đã phát hành

Thanh lọc nhanh lấy nhóm có trong nguồn M3U đã nhập, không hiện nhóm rỗng. Trạng thái nút được chọn và khả năng dùng bàn phím được cải thiện.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/68bf5505bc72a73853284574dc3106bfad7e9973)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.200-p5.1.116)

## P5.1.115 — Bỏ hướng dẫn trùng ở Yêu thích và Gần đây

**Ứng dụng:** 4.23.199 · **Trạng thái:** Đã phát hành

Trên màn hình hẹp, ẩn bảng phụ rỗng bị lặp với thông báo chính của tab đang mở. Các bảng hữu ích khác vẫn được giữ lại.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/caf6a5bff4a115cac60f8474519e5d6101dfdd87)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.199-p5.1.115)

## P5.1.114 — Hướng dẫn rõ ràng khi Yêu thích hoặc Gần đây trống

**Ứng dụng:** 4.23.198 · **Trạng thái:** Đã phát hành

Phân biệt chưa có Yêu thích, chưa có lịch sử và lọc không ra kết quả. Thêm nút “Xem tất cả kênh” để quay lại thư viện.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/257422b56d81d4eca9c8efacfb1aeb4ebd2dab83)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.198-p5.1.114)

## P5.1.113 — Điều hướng các tab thư viện kênh bằng bàn phím

**Ứng dụng:** 4.23.197 · **Trạng thái:** Đã phát hành

Hỗ trợ phím mũi tên, Home và End để chuyển tab; giữ trạng thái được chọn, tiêu điểm và các thao tác chuột vốn có.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/e634e2c7c9da33ebb5c54043e4d212ab8d3a40a3)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.197-p5.1.113)

## P5.1.112 — Thẻ kênh hai cột dễ đọc hơn trên màn hình hẹp

**Ứng dụng:** 4.23.196 · **Trạng thái:** Đã phát hành

Thay lưới thẻ quá nhỏ bằng hai cột và cho phép tên kênh hiển thị nhiều dòng, tránh cắt mất tên.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/50a2f2e24710e1727b7fe6a31273cc2808bc30d0)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.196-p5.1.112)

## P5.1.111 — Bộ lọc nhóm kênh gọn trong một hàng cuộn

**Ứng dụng:** 4.23.195 · **Trạng thái:** Đã phát hành

Hiển thị nhóm trong một hàng cuộn ngang thay vì xuống nhiều dòng. Giữ vị trí thanh cuộn sau khi chọn nhóm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ba5a3f4b282ad68a4d5c270fe523935dbf35b00e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.195-p5.1.111)

## P5.1.110 — Thu gọn màn hình phát khi chưa chọn kênh

**Ứng dụng:** 4.23.194 · **Trạng thái:** Đã phát hành

Ở cửa sổ hẹp và chưa phát gì, thu gọn vùng giới thiệu để đưa phần tìm kênh lên cao hơn. Khung video thực vẫn giữ tỷ lệ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/75d4acb5bf940eb46ecb868476aca6bda33e99f4)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.194-p5.1.110)

## P5.1.109 — Không lặp thông báo đang hiển thị

**Ứng dụng:** 4.23.193 · **Trạng thái:** Đã phát hành

Nếu một thông báo cùng nội dung và mức độ vẫn đang mở, không tạo bản trùng. Thông báo khác hoặc mức cảnh báo khác vẫn xuất hiện.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1b2c5d4d55f3d60a9ff64f45529aa181d3a9454e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.193-p5.1.109)

## P5.1.108 — Thông báo không đè lên thanh biểu tượng

**Ứng dụng:** 4.23.192 · **Trạng thái:** Đã phát hành

Giới hạn vị trí thông báo trong cửa sổ hẹp để không che thanh điều hướng có biểu tượng bên trái.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a19d24c9858fba65cabc17c0ef478a861e44b0f1)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.192-p5.1.108)

## P5.1.107 — Thay biểu tượng chữ bằng SVG thống nhất

**Ứng dụng:** 4.23.191 · **Trạng thái:** Đã phát hành

Các nút tab thư viện kênh và chế độ xem dùng biểu tượng SVG thay cho ký tự phụ thuộc phông chữ. Thao tác và nhãn hỗ trợ truy cập được giữ nguyên.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ac4670a51959aef9a9e6917c85495184c460bf1a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.191-p5.1.107)

## P5.1.106 — Bỏ thanh cuộn ngang thừa trong WatchFlow trống

**Ứng dụng:** 4.23.190 · **Trạng thái:** Đã phát hành

Sửa khoảng cách ở hộp WatchFlow khi chưa có nguồn để không xuất hiện thanh cuộn ngang không cần thiết.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/19746909a874bdcc659f6948319cee86f0eec1da)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.190-p5.1.106)

## P5.1.105 — Dọn dấu trang mất nguồn bằng hai bước xác nhận

**Ứng dụng:** 4.23.189 · **Trạng thái:** Đã phát hành

Bổ sung thao tác xử lý dấu trang Xem sau không còn nguồn hợp lệ, có bước xác nhận rõ ràng để tránh xóa nhầm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/937db5120885efefe32c62fe3a9476601e76955c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.189-p5.1.105)

## P5.1.104 — Thông báo nguồn Xem sau không còn hoạt động

**Ứng dụng:** 4.23.188 · **Trạng thái:** Đã phát hành

Phát hiện dấu trang đã lưu nhưng nguồn không còn sẵn có; thông báo rõ tình trạng mà không tự xóa dữ liệu đã lưu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0e6a64d5d4dbcda6e4131a3375b414e63cb54a52)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.188-p5.1.104)

## P5.1.103 — Không tự loại dấu trang Xem sau khi đủ 80 mục

**Ứng dụng:** 4.23.187 · **Trạng thái:** Đã phát hành

Khi đạt giới hạn 80 kênh lưu Xem sau, ngăn việc âm thầm loại kênh cũ. Người dùng được thông báo để tự quyết định.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ff67dc0c2963ac5cc3c514fdebad65221e10e962)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.187-p5.1.103)

## P5.1.102 — Tìm Xem sau theo nhiều từ, nhóm và chất lượng

**Ứng dụng:** 4.23.186 · **Trạng thái:** Đã phát hành

Cải thiện tìm kiếm dấu trang đã lưu bằng nhiều từ khóa và thông tin nhóm/chất lượng, thay vì chỉ khớp chuỗi liền nhau.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/5efab277eaabfb558fed5434e4218408c6286e27)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.186-p5.1.102)

## P5.1.101 — Tìm kiếm trong toàn bộ danh sách Xem sau

**Ứng dụng:** 4.23.185 · **Trạng thái:** Đã phát hành

Thêm ô tìm kiếm cục bộ cho tối đa 80 kênh đã lưu Xem sau, hỗ trợ không dấu, không gửi dữ liệu lên mạng và không tự phát video.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a902ab2c34fc4b06e7e93dcbb89744c05593753f)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.185-p5.1.101)

## P5.1.100 — Giữ thanh tiêu đề WatchFlow khi cuộn danh sách dài

**Ứng dụng:** 4.23.184 · **Trạng thái:** Đã phát hành

Cố định tiêu đề và các tab WatchFlow khi cuộn sâu trong danh sách Xem sau, giúp nút đóng và điều hướng luôn dễ tìm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/060fbad7faebcf5715d3b3dc67e25927527d1041)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.184-p5.1.100)

## P5.1.99 — Xem chương trình sắp phát từ lịch XMLTV

**Ứng dụng:** 4.23.183 · **Trạng thái:** Chưa có bản phát hành

Bên cạnh chương trình đang phát, WatchFlow hiển thị chương trình tiếp theo và giờ bắt đầu khi có dữ liệu XMLTV hợp lệ. Không tự suy đoán tên chương trình.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.98 — Hiển thị tên chương trình đang phát trong WatchFlow

**Ứng dụng:** 4.23.182 · **Trạng thái:** Đã phát hành

Kết hợp dữ liệu lịch XMLTV đã nhập để thẻ gợi ý WatchFlow hiện chương trình đang phát, thay vì chỉ tên kênh.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/420ee5a4a8a0a31ab5b77565f034acae9d25d1a9)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.182-p5.1.98)

## P5.1.97 — Xem được mọi kênh đã lưu trong Xem sau

**Ứng dụng:** 4.23.181 · **Trạng thái:** Chưa có bản phát hành

Bổ sung cách duyệt các dấu trang vượt quá tám kênh đầu tiên, giúp truy cập đủ danh sách đã lưu.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.96 — Lưu kênh Xem sau riêng tư trên thiết bị

**Ứng dụng:** 4.23.180 · **Trạng thái:** Đã phát hành

Bổ sung danh sách Xem sau cục bộ để người dùng lưu kênh muốn quay lại. Không tải dữ liệu lên máy chủ và không tự phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/20aeb922547ba56061990cad948bbfadaedeef8b)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.180-p5.1.96)

## P5.1.95 — Sửa dấu hiệu cuộn WatchFlow bị che

**Ứng dụng:** 4.23.179 · **Trạng thái:** Đã phát hành

Điều chỉnh vị trí chỉ báo cuộn dựa trên ảnh kiểm thử thực, tránh lớp chỉ dẫn nằm đè lên nội dung thẻ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/8ae65c2a26c0da3d4bc605e1c5aa18283e82a020)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.179-p5.1.95)

## P5.1.94 — Báo hiệu còn gợi ý WatchFlow phía dưới

**Ứng dụng:** 4.23.178 · **Trạng thái:** Đã phát hành

Thêm dấu hiệu trực quan khi danh sách gợi ý WatchFlow còn nội dung bên dưới, giúp người dùng biết có thể cuộn xem thêm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/01c99e34d6d41ff7ca24a32f0704be839818ed92)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.178-p5.1.94)

## P5.1.93 — Phân bổ gợi ý Mix cân bằng giữa các nhóm nguồn

**Ứng dụng:** 4.23.177 · **Trạng thái:** Đã phát hành

Điều chỉnh cách chọn gợi ý Mix theo ngày để không tập trung quá nhiều kênh trong một nhóm, đồng thời vẫn dựa trên dữ liệu phát thực tế.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0d582fb30e70380537a9e3d3ac4258bfe83c60e5)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.177-p5.1.93)

## P5.1.92 — Tính đúng ngày địa phương cho Mix và Smart Zap

**Ứng dụng:** 4.23.176 · **Trạng thái:** Đã phát hành

Dùng ngày theo múi giờ của thiết bị khi tạo gợi ý Mix hằng ngày và chuyển kênh thông minh, tránh lệch ngày.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/720dbd1e0ab38a690a6d263b68300353d4726c68)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.176-p5.1.92)

## P5.1.91 — Đồng bộ biểu tượng Phát/Tạm dừng theo bản Web

**Ứng dụng:** 4.23.175 · **Trạng thái:** Chưa có bản phát hành

Sử dụng hình SVG Phát và Tạm dừng tương ứng với bộ biểu tượng trên nhánh Web, giữ kích thước và đường nét đồng nhất.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.90 — Ẩn thử nghiệm Video Lab khi chưa chọn kênh

**Ứng dụng:** 4.23.174 · **Trạng thái:** Đã phát hành

Không hiện công cụ Video Lab khi người dùng chưa chọn kênh, tránh nút dẫn vào tính năng chưa có nội dung. Cài đặt không bị xóa.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/8a49f9757459d137c2005762d50fa956b1c3a646)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.174-p5.1.90)

## P5.1.89 — Trạng thái trình phát phản ánh số kênh có sẵn

**Ứng dụng:** 4.23.173 · **Trạng thái:** Đã phát hành

Thay lời hướng dẫn mặc định dựa trên việc danh sách có kênh khả dụng hay không, giúp người dùng biết bước tiếp theo.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/2b3e6070e7f086dbd233e29224b9b09d04153dca)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.173-p5.1.89)

## P5.1.88 — Hướng dẫn bắt đầu xem dựa trên playlist thực

**Ứng dụng:** 4.23.172 · **Trạng thái:** Đã phát hành

Khi đã có danh sách kênh, hiển thị lời mời chọn kênh và số kênh thực tế. Khi chưa có nguồn, giữ hướng dẫn nhập danh sách.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6a6bc1def4b416d5e65d0405a251bf84e1639b48)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.172-p5.1.88)

## P5.1.87 — Tab Tiếp tục xem gọn và dễ đọc

**Ứng dụng:** 4.23.171 · **Trạng thái:** Đã phát hành

Rút gọn nhãn hiển thị thành “Tiếp” khi cần, trong khi nhãn đầy đủ “Tiếp tục xem” vẫn được giữ cho hỗ trợ truy cập.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ed257184254e6caa5994d6222b297975702a4bf6)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.171-p5.1.87)

## P5.1.86 — Hộp WatchFlow không che trình phát

**Ứng dụng:** 4.23.170 · **Trạng thái:** Đã phát hành

Giới hạn bố cục hộp gợi ý WatchFlow để không đè lên vùng video và các điều khiển quan trọng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/206892e2a1a5bc1899c6073a61304f95831e6327)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.170-p5.1.86)

## P5.1.85 — Xếp hạng kênh tương tự tốt hơn trong WatchFlow

**Ứng dụng:** 4.23.169 · **Trạng thái:** Đã phát hành

Điều chỉnh thứ tự gợi ý Tương tự để ưu tiên nhóm kênh phù hợp trước khi xét điểm chất lượng phát.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/a02d2b896f23c3e7a65d180a1bca961d37e48189)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.169-p5.1.85)

## P5.1.84 — Thêm thao tác hữu ích khi danh sách kênh trống

**Ứng dụng:** 4.23.168 · **Trạng thái:** Đã phát hành

Hiển thị hướng dẫn và thao tác nhập nguồn ngay ở thanh danh sách kênh khi chưa có kênh để xem.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/52134d193cc165e1dda8b0af70515fcb05ada71d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.168-p5.1.84)

## P5.1.83 — Điều khiển phụ của trình phát gọn hơn trên 600 px

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Sắp xếp lại các lựa chọn phụ của trình phát trên cửa sổ hẹp để tránh chiếm quá nhiều chiều cao.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.82 — Bộ chọn kênh một hàng trên màn hình nhỏ

**Ứng dụng:** 4.23.166 · **Trạng thái:** Đã phát hành

Các tab lọc của thư viện kênh được bố trí lại trên một hàng khi cửa sổ hẹp, hạn chế xuống dòng không cần thiết.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/30ca2f00d0a53bd566f70f3c5d6696b70599d1e2)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.166-p5.1.82)

## P5.1.81 — Thanh công cụ WatchFlow Plus nằm trên một hàng

**Ứng dụng:** 4.23.165 · **Trạng thái:** Đã phát hành

Sắp xếp các chế độ WatchFlow Plus thành một hàng dễ sử dụng, tránh chiếm vùng hiển thị của video và danh sách.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6db9594f383196554de53a0c961758b5089e6d86)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.165-p5.1.81)

## P5.1.80 — WatchFlow Plus: nhiều cách khám phá kênh

**Ứng dụng:** 4.23.164 · **Trạng thái:** Chưa có bản phát hành

Thử nghiệm các chế độ gợi ý và chuyển kênh nhanh, gồm Smart Zap và Mix, dựa trên thông tin nguồn và hành vi xem cục bộ; chỉ phát khi người dùng thao tác.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.79 — Tên công cụ trình phát rõ nghĩa hơn

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Thay nút dấu ba chấm khó hiểu bằng nhãn mở công cụ rõ hơn, giúp tìm Tua lại và ghi hình.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.78 — Màn hình chẩn đoán khi chưa có nguồn gọn hơn

**Ứng dụng:** 4.23.162 · **Trạng thái:** Đã phát hành

Ẩn các chỉ số bằng không chưa hữu ích ở trạng thái chưa nhập nguồn, tập trung vào hướng dẫn bắt đầu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/13bbcad98c2fc4670ad2484c831152f74a3881ea)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.162-p5.1.78)

## P5.1.77 — Kiểm tra lại nút nhập nguồn trong Chẩn đoán

**Ứng dụng:** 4.23.161 · **Trạng thái:** Đã phát hành

Bổ sung kiểm thử ảnh để xác minh nút nhập nguồn thật của trang Chẩn đoán khi chưa có kênh.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/77793fcbd5ea1731b9e205a6ec7ef7683f81b1dc)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.161-p5.1.77)

## P5.1.76 — Chẩn đoán thông minh cho trạng thái chưa có nguồn

**Ứng dụng:** Chưa xác minh · **Trạng thái:** Chưa có bản phát hành

Tập trung trang Chẩn đoán vào thao tác thêm nguồn trước khi hiển thị các bảng kiểm tra nâng cao chưa sử dụng được.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.75 — Thông báo rõ giới hạn Video Lab thử nghiệm

**Ứng dụng:** 4.23.159 · **Trạng thái:** Đã phát hành

Nêu rõ chức năng nâng cao hình ảnh bằng AI hiện chưa có hệ thống xử lý video trực tiếp đã xác minh, tránh gây hiểu nhầm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/81425eb71ddcf74f76edb7903273ccea08dcfd97)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.159-p5.1.75)

## P5.1.74 — Tận dụng chiều cao màn hình máy tính hợp lý

**Ứng dụng:** 4.23.158 · **Trạng thái:** Đã phát hành

Thu gọn vùng phát trống trên cửa sổ máy tính thấp để các điều khiển hữu ích không bị đẩy xuống dưới.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/364fc7e65cae890bf7ca989e9f915fdb087dad36)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.158-p5.1.74)

## P5.1.73 — Đường dẫn lưu bản ghi DVR rõ ràng và an toàn

**Ứng dụng:** 4.23.157 · **Trạng thái:** Đã phát hành

Cải thiện nhãn và cách trình bày đường dẫn lưu bản ghi, tránh chuỗi đường dẫn dài làm vỡ bố cục.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/795b1deb9c810179a1955f1aeba8903f2ebb909c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.157-p5.1.73)

## P5.1.72 — Sắp xếp bộ lọc Smart Discovery dễ dùng hơn

**Ứng dụng:** 4.23.156 · **Trạng thái:** Đã phát hành

Đưa các điều khiển khám phá nguồn về thứ tự thao tác tự nhiên, tránh các nút và lựa chọn nằm rời rạc.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6481d2418c44472468c11bccdddd58a38723e66c)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.156-p5.1.72)

## P5.1.71 — Chỉ mở WatchFlow đúng ngữ cảnh màn hình TV

**Ứng dụng:** 4.23.155 · **Trạng thái:** Đã phát hành

Ẩn thao tác WatchFlow khi đang quản lý nguồn và đóng bảng khi chuyển khỏi trang TV, giữ nguyên kênh và nguồn.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/711f0cae6a0e5f14f299b3df51039d6d8c2d2ab6)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.155-p5.1.71)

## P5.1.70 — Đánh dấu rõ mục đang chọn trong quản lý nguồn

**Ứng dụng:** 4.23.154 · **Trạng thái:** Đã phát hành

Tăng tương phản mục điều hướng đang chọn và gắn nhãn vị trí hiện tại cho công cụ hỗ trợ truy cập.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/329421a79d237f6e160a82c2445d7e2180b48fe8)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.154-p5.1.70)

## P5.1.69 — Sửa hàng điều hướng nguồn bị tách lẻ

**Ứng dụng:** 4.23.153 · **Trạng thái:** Đã phát hành

Điều chỉnh bố cục điều hướng quản lý nguồn ở cửa sổ khoảng 720 px để không còn một nút bị rớt xuống hàng riêng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/fa6cc662b8d3e6d9b7a2092684d630089e9ba929)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.153-p5.1.69)

## P5.1.68 — Thay biểu tượng menu bằng SVG bốn ô

**Ứng dụng:** 4.23.152 · **Trạng thái:** Chưa có bản phát hành

Đưa biểu tượng SVG bốn ô vào nút mở menu sẵn có, giữ nguyên nhãn, trạng thái mở và thao tác.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.67 — Tự đóng WatchFlow khi rời trang TV

**Ứng dụng:** 4.23.151 · **Trạng thái:** Chưa có bản phát hành

Theo dõi trang TV đang được mở và đóng bảng WatchFlow khi người dùng chuyển trang, không làm thay đổi dữ liệu hoặc kênh đang phát.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.66 — Nút đóng WatchFlow rõ và dễ bấm hơn

**Ứng dụng:** 4.23.150 · **Trạng thái:** Chưa có bản phát hành

Thay ký tự biểu tượng bằng SVG 20 px và mở rộng vùng chạm của nút đóng, giữ hỗ trợ phím Escape.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.65 — Khôi phục tiêu điểm sau khi đóng WatchFlow

**Ứng dụng:** 4.23.149 · **Trạng thái:** Chưa có bản phát hành

Sau khi đóng WatchFlow, đưa tiêu điểm về nút phù hợp ở trang TV để người dùng tiếp tục thao tác bằng bàn phím.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.64 — Ẩn đoạn giới thiệu WatchFlow thừa khi chưa có kênh

**Ứng dụng:** 4.23.148 · **Trạng thái:** Chưa có bản phát hành

Bỏ đoạn hướng dẫn lặp ở trạng thái trống, vẫn giữ nguyên bố cục và các gợi ý khi có kênh.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.63 — Hướng dẫn nhập nguồn rõ ràng trong WatchFlow trống

**Ứng dụng:** 4.23.147 · **Trạng thái:** Đã phát hành

Khi chưa có nguồn kênh, hiện cách thêm IPTV thay vì các bộ lọc thể loại không thể dùng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9d4bb04a21a502ead140bc9c167f4648a1b60520)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.147-p5.1.63)

## P5.1.62 — Đồng bộ màu thanh phụ đề CC trong giao diện Horizon

**Ứng dụng:** 4.23.146 · **Trạng thái:** Đã phát hành

Chỉnh màu các điều khiển phụ đề và AI theo bảng màu Horizon; không thay đổi hành vi công cụ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/9efed16d9ecf3fdaa7fdc01376ef97f347385d52)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.146-p5.1.62)

## P5.1.61 — Tăng độ tương phản thư mục có dữ liệu trong Horizon

**Ứng dụng:** 4.23.145 · **Trạng thái:** Đã phát hành

Chỉnh nền, chữ và mũi tên của thư mục có kênh để dễ đọc trên giao diện tối, không ảnh hưởng kéo thả.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7b532fa5adb0acbf2202b34c7c3eedc377c7a623)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.145-p5.1.61)

## P5.1.60 — Gợi ý WatchFlow cân bằng theo nhóm kênh

**Ứng dụng:** 4.23.144 · **Trạng thái:** Đã phát hành

Phân bổ gợi ý WatchFlow từ các nhóm nguồn khác nhau thay vì chọn liên tiếp quá nhiều kênh trong một nhóm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/8b16f057486172314c84a8e70235ce5e0e94a31e)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.144-p5.1.60)

## P5.1.59 — Đồng bộ màu thanh cuộn của Horizon

**Ứng dụng:** 4.23.143 · **Trạng thái:** Đã phát hành

Chỉnh màu thanh cuộn theo giao diện Horizon mà không thay đổi hành vi cuộn hoặc các chủ đề khác.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6e7778ba991cc427de34804278316673c0f97e35)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.143-p5.1.59)

## P5.1.58 — Sửa tiêu đề bị chật trên giao diện Horizon hẹp

**Ứng dụng:** 4.23.142 · **Trạng thái:** Đã phát hành

Sửa cách hiển thị tiêu đề ở cửa sổ khoảng 600 px theo ảnh Electron thực tế để không bị cắt, chồng chữ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/493595f8d143229f5399893218b0f19272647af2)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.142-p5.1.58)

## P5.1.57 — Hoàn thiện Horizon và WatchFlow có dữ liệu thử nghiệm

**Ứng dụng:** 4.23.141 · **Trạng thái:** Đã phát hành

Kiểm tra WatchFlow với dữ liệu kênh giả lập và sửa tiêu đề thiếu tương phản trên nền tối.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/3a8bd1b6c80b5bb6165db1990915f61c47074f6f)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.141-p5.1.57)

## P5.1.56 — Thiết kế lại Horizon và gợi ý WatchFlow cục bộ

**Ứng dụng:** 4.23.140 · **Trạng thái:** Đã phát hành

Bổ sung lớp bố cục Horizon và các gợi ý WatchFlow dựa trên dữ liệu có sẵn cục bộ, kèm ảnh kiểm thử Electron.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/38a28739b8e003f59cb3b863bc8df4a0ddb10e2b)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.140-p5.1.56)

## P5.1.54 — Tinh chỉnh điều khiển phát và không gian TV

**Ứng dụng:** 4.23.138 · **Trạng thái:** Đã phát hành

Điều chỉnh bộ công cụ phát video và bố cục trang TV, giữ các nguồn kênh và chức năng vốn có.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/e96ca46c8af19aa84c344c6df4430186b266e7b8)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.138-p5.1.54)

## P5.1.53 — Bỏ phần lịch EPG trống bị lặp và làm mới tìm kiếm

**Ứng dụng:** 4.23.137 · **Trạng thái:** Đã phát hành

Giảm nội dung EPG trùng khi chưa có dữ liệu và cải thiện cách trình bày ô tìm lịch.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1ac0fb93d1e9277a61702d17b885818c13da96e4)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.137-p5.1.53)

## P5.1.52 — Ẩn công cụ EPG chưa dùng được khi lịch chưa tải

**Ứng dụng:** 4.23.136 · **Trạng thái:** Đã phát hành

Không cho thao tác các công cụ lịch chương trình khi chưa có dữ liệu hướng dẫn truyền hình hợp lệ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/b4feb93fc39706b82497566a51fe1e66b6ac6716)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.136-p5.1.52)

## P5.1.51 — Sửa màn hình DVR trống theo ảnh kiểm thử

**Ứng dụng:** 4.23.135 · **Trạng thái:** Đã phát hành

Điều chỉnh trang ghi hình khi chưa có kênh, tránh hiển thị lịch hẹn không thể sử dụng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d70e5f7966926929c42cad6097307ce6df3c0eb5)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.135-p5.1.51)

## P5.1.46 — Thu gọn lịch DVR không khả dụng và sửa nhãn bản phát hành

**Ứng dụng:** 4.23.130 · **Trạng thái:** Đã phát hành

Cải thiện bố cục lịch ghi hình khi chưa có dữ liệu, đồng thời đồng bộ nhãn phiên bản.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/428217ada04e29b3092a35e13dca89c71d36e053)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.130-p5.1.46)

## P5.1.44 — Hướng dẫn thiết lập nguồn dữ liệu EPG

**Ứng dụng:** 4.23.129 · **Trạng thái:** Đã phát hành

Bổ sung hướng dẫn đưa nguồn lịch phát sóng vào ứng dụng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/41f754be653caf87ffed14c50604f9d272d1cbc7)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.129-p5.1.44)

## P5.1.32 — Thay biểu tượng chủ đề nhỏ bằng SVG một màu

**Ứng dụng:** 4.23.116 · **Trạng thái:** Đã phát hành

Dùng biểu tượng chủ đề dạng SVG thay cho ký tự hệ thống khó nhìn ở màn hình hẹp.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/ebd254689a615dd11f18d88f825267174f69b8de)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.116-p5.1.32)

## P5.1.31 — Việt hóa tên công cụ Tua lại

**Ứng dụng:** 4.23.115 · **Trạng thái:** Đã phát hành

Thay tên nút mở công cụ tua lại bằng lời tiếng Việt dễ hiểu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/62d490ffe41252dcaff472cc98ab86b9408160ad)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.115-p5.1.31)

## P5.1.28 — Sửa khoảng cách trang Nguồn khi chưa có dữ liệu

**Ứng dụng:** 4.23.112 · **Trạng thái:** Đã phát hành

Giảm các vùng trống dư trong trang quản lý nguồn trên máy tính.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/6f74ad62f9f1f60583acd7b50dcecea2eb5ac51a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.112-p5.1.28)

## P5.1.26 — Vô hiệu hóa kiểm tra Chẩn đoán khi chưa có kênh

**Ứng dụng:** 4.23.110 · **Trạng thái:** Đã phát hành

Không cho chạy thao tác phân tích chưa có dữ liệu trên trang Chẩn đoán, tránh báo cáo sai.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d31854697e0246d6d5da18486e74c1e074d93add)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.110-p5.1.26)

## P5.1.25 — Sửa nút xóa kênh khi chưa có kênh nào

**Ứng dụng:** 4.23.109 · **Trạng thái:** Chưa có bản phát hành

Đặt điều khiển ở trạng thái vô hiệu hóa rõ ràng khi chưa có kênh; tự kích hoạt lại khi có dữ liệu.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.24 — Biểu tượng ghi hình DVR rõ hơn

**Ứng dụng:** 4.23.108 · **Trạng thái:** Đã phát hành

Thay biểu tượng ghi hình bằng SVG đồng nhất mà không ảnh hưởng lịch hẹn và dữ liệu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/4c66a3d20d9d3c11b0555f8548c48da4e4605afd)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.108-p5.1.24)

## P5.1.23 — Thu gọn hướng dẫn Nguồn ở cửa sổ hẹp

**Ứng dụng:** 4.23.107 · **Trạng thái:** Chưa có bản phát hành

Giảm khoảng đệm của hướng dẫn nhập nguồn và khám phá nguồn khi chưa có danh sách.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

## P5.1.22 — Nút điều khiển hình ảnh SVG rõ ràng hơn

**Ứng dụng:** 4.23.106 · **Trạng thái:** Đã phát hành

Thay ký tự biểu tượng bằng SVG đơn sắc, giữ trạng thái bật/tắt và tên điều khiển.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d3d26dc1122d9671512162d555eba7bfc44c0914)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.106-p5.1.22)

## P5.1.21 — Sửa bố cục lựa chọn luồng phát trên cửa sổ nhỏ

**Ứng dụng:** 4.23.105 · **Trạng thái:** Đã phát hành

Đưa bộ chọn đường phát thành một hàng đủ rộng trong cửa sổ rất hẹp.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/073dbf4a530e8162111f271dee93d61a42dbfb57)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.105-p5.1.21)

## P5.1.20 — Phím tắt tìm kiếm phù hợp hệ điều hành

**Ứng dụng:** 4.23.104 · **Trạng thái:** Đã phát hành

Hiển thị gợi ý phím tắt tìm kiếm theo hệ điều hành đang sử dụng.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/0b7b8dc5575323a7675384ac1121fed4f620c873)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.104-p5.1.20)

## P5.1.16 — Biểu tượng âm lượng dạng vector

**Ứng dụng:** 4.23.100 · **Trạng thái:** Đã phát hành

Sử dụng biểu tượng âm lượng có nét đồng nhất, không phụ thuộc phông chữ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/5dec102bfa2fc0bafee67bf9ae404e1afed127dc)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.100-p5.1.16)

## P5.1.12 — Gợi ý phím tắt tìm kiếm dễ đọc hơn

**Ứng dụng:** 4.23.96 · **Trạng thái:** Đã phát hành

Chỉnh cách trình bày gợi ý phím tắt trong ô tìm kiếm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/02d681889b6e60cbfc38e79ce0b4d5edc8d34a43)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.96-p5.1.12)

## P5.1.11 — Tên chương trình EPG xuống dòng trên di động

**Ứng dụng:** 4.23.95 · **Trạng thái:** Đã phát hành

Cho phép tiêu đề chương trình dài hiển thị đủ dòng khi xem lịch trên màn hình nhỏ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/5dba72e2a1f037c3eb7f73fdd1fef11882c55e74)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.95-p5.1.11)

## P5.1.10 — Hướng dẫn thao tác Yêu thích theo ngữ cảnh

**Ứng dụng:** 4.23.94 · **Trạng thái:** Đã phát hành

Hiển thị lời hướng dẫn phù hợp khi chưa có hoặc đang xem danh sách Yêu thích.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/1321023c6d4b31eceea49f4e116381a462073195)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.94-p5.1.10)

## P5.1.9 — Điều hướng từ trạng thái Yêu thích trống

**Ứng dụng:** 4.23.93 · **Trạng thái:** Đã phát hành

Thêm đường quay về xem kênh khi danh sách Yêu thích chưa có mục nào.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/df5961b731893c12bc6903d7dda2e1c67e9f362d)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.93-p5.1.9)

## P5.1.8 — Sửa nút đổi chủ đề trên màn hình hẹp

**Ứng dụng:** 4.23.92 · **Trạng thái:** Đã phát hành

Tăng độ rõ của nút chuyển chủ đề và tránh chèn lên nội dung.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/58750a8f3decee1f2d85d9f368d80bf129d8f9b5)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.92-p5.1.8)

## P5.1.7 — Sửa nền tối còn sót trong Khám phá nguồn

**Ứng dụng:** 4.23.91 · **Trạng thái:** Đã phát hành

Theo ảnh Electron, vùng nền Khám phá nguồn đã cải thiện nhưng còn dải tối ở phần tiêu đề; tiếp tục sửa lớp giao diện này.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/72582484b91aca7c14f0e0665831c2d9b2be30e9)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.91-p5.1.7)

## P5.1.6 — Đồng bộ nền tối của Smart Discovery

**Ứng dụng:** 4.23.90 · **Trạng thái:** Đã phát hành

Sửa dải nền tối không phù hợp tại khu vực Khám phá nguồn.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/7a1a10ba7eaee1b17505a3d3e536ec3c17e8cf41)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.90-p5.1.6)

## P5.1.5 — Sửa tiêu đề trang Nguồn ở độ rộng 720 px

**Ứng dụng:** 4.23.89 · **Trạng thái:** Đã phát hành

Điều chỉnh tiêu đề Nguồn để không bị cắt bằng dấu ba chấm quá sớm.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/eb544b5a2f0501859a8ff4130e746f0bb90ec07a)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.89-p5.1.5)

## P5.1.4 — Sửa tiêu đề trang đang mở trên màn hình hẹp

**Ứng dụng:** 4.23.88 · **Trạng thái:** Đã phát hành

Cải thiện cách căn và hiển thị tiêu đề trang khi thanh điều hướng thu nhỏ.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/2a7e6ee43751c4d6b89b493bab1281c1add1fc13)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.88-p5.1.4)

## P5.1.3 — Nút Toàn màn hình rõ hơn

**Ứng dụng:** 4.23.87 · **Trạng thái:** Đã phát hành

Thay biểu tượng toàn màn hình khó nhận biết bằng hình vector dễ hiểu.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/d654707cd3b8440f6218814fd1b9dff6333c8da6)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.87-p5.1.3)

## P5.1.2 — Đặt lại vị trí huy hiệu phiên bản

**Ứng dụng:** 4.23.86 · **Trạng thái:** Đã phát hành

Sửa huy hiệu phiên bản bị che một phần bởi nút menu trên màn hình hẹp.

[Xem commit gốc](https://github.com/trisanghy/open-iptv-pro/commit/cf04f42baf8d58b86db63897ad3d7ae986f0a663)
[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.86-p5.1.2)

## P5.1.1 — Hiển thị đúng phiên bản Positron P5.1.1

**Ứng dụng:** 4.23.85 · **Trạng thái:** Chưa có bản phát hành

Thay nhãn phiên bản cũ còn sót ở thanh bên bằng nhãn Positron phù hợp.

[Bản phát hành hoặc mã nguồn](https://github.com/trisanghy/open-iptv-pro/blob/Positron/POSITRON_P5_CHANGELOG.md)

