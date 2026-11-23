# Positron — Đợt 20 vòng mới, bắt đầu sau P5.1.300

## Vòng 01 — P5.1.301: ĐẠT
- Sửa cảnh báo coverage bị đẩy dưới danh sách; cảnh báo hiển thị trước details và nút xác nhận có màu rủi ro, aria-describedby.
- Commit 8ec333440d559cd82b5169307f48b0b8015c8703, QA fix a1087f39a7a629895ef9954f31459b50e9901753.
- Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/45150068150: test/capture/Windows x64/Mac x64/ARM64 success.
- Ảnh Electron đã mở: positron-p51301-coverage-warning-before-1920x1080-real.png, positron-p51301-coverage-warning-after-1920x1080-real.png.
- qa301 11/11 true; issue dẫn sang vòng 02 là đọc danh sách quá dài, các dòng cuối bị CTA sticky che.

## Vòng 02 — P5.1.302: ĐẠT
- Thêm “Mở ngay tên kênh có nguy cơ” từ cảnh báo nhóm, mở thông tin rủi ro và đưa ví dụ kênh vào vùng đọc rõ.
- Commit 5815ea6613d23ef610ccea6111bf88ab8bf724b5.
- Actions https://github.com/trisanghy/open-iptv-pro/actions/runs/45151303832: test/capture/Windows x64/Mac ARM64/x64 success.
- Ảnh Electron đã mở: positron-p51302-risk-jump-before-1920x1080-real.png và positron-p51302-risk-jump-after-1920x1080-real.png.
- qa302 10/10 true, model/playlist không đổi; screenshot sau cho thấy nhóm 0/15 không rủi ro vẫn chen trong danh sách.

## Vòng 03 — P5.1.303: CANDIDATE
- Thêm bộ lọc read-only chỉ nhóm có mất dự đoán, loại zero-loss khỏi danh sách và báo số nhóm; không giảm các đánh giá nguy cơ tổng, không thay đổi trọng số AI.
- Node test + Electron QA qa303 dự kiến tạo positron-p51303-risk-only-before-1920x1080-real.png và positron-p51303-risk-only-after-1920x1080-real.png.
- Chưa tính hoàn tất trước khi CI, tải và mở xem ảnh, kiểm tra artifact.

## Vòng 04–20
Chưa thực hiện. Mỗi vòng yêu cầu commit/version, test, ảnh Electron trước/sau, mở ảnh trực tiếp và báo cáo.


## Đợt mới sau P5.1.304 — 23/11/2026
- Vòng 01/20 — P5.1.305: ĐẠT. Khắc phục tỷ lệ 0/0 gây hiểu sai, chẩn đoán độ chắc chắn trước/sau; 1015 tests pass, 5 skip; 10/10 QA P305, Windows/macOS builds success, soát trực tiếp ảnh 1920×1080. GitHub Actions 45166821071.
- Vòng 02/20 — P5.1.306: CANDIDATE. Ảnh cuối P305 hiển thị lời khẳng định “Chưa phát hiện chuyển chủ đề” dù không có kênh chung đủ chắc chắn. Sửa thông báo thành “chưa thể kết luận”, thêm thống kê bốn nhóm độ chắc chắn và tên kênh mẫu theo yêu cầu người xem. Test/ảnh/build đang chờ; KHÔNG tính hoàn thành trước khi soát ảnh thật.

## P5.1.307 — CANDIDATE
- Bổ sung tên mẫu của nhóm kênh cả hai mô hình đều chưa đủ chắc chắn, bảo vệ URL, chỉ đọc, kèm regression và QA ảnh Electron trước/sau. Chỉ đánh dấu hoàn thành sau CI xanh và đã mở xem ảnh thật.

- Trực tiếp mở PNG Electron P5.1.306: thấy dòng ví dụ bị CTA khôi phục sticky che ở cạnh dưới. P5.1.307 bổ sung khoảng cuộn và QA kiểm tra hàng ví dụ nằm trên CTA; ảnh P5.1.307 vẫn cần xác minh.

## P5.1.308 — CANDIDATE
- Dựa trên ảnh thật P5.1.307: bổ sung nút dẫn tới hàng đợi dạy AI từ danh sách kênh chưa chắc chắn. Không tự bật quyền, không tự cập nhật mô hình hay phát kênh. CI Electron cần xác minh hàng đợi và focus sau điều hướng.

## P5.1.309 — CANDIDATE
- Từ ảnh Electron P5.1.308: CTA khôi phục vẫn nổi ở cuối khi đang chọn nhãn dạy AI. Bổ sung trạng thái nhập chưa xác nhận tách khỏi dạy AI, ẩn CTA trong trainer và nút quay về preview, giữ nguyên dữ liệu/đồng ý, QA bảo vệ việc phát kênh. Chờ ảnh P309 và kiểm thử.

## P5.1.310 — CANDIDATE
- Từ ảnh P5.1.309, WatchFlow AI hẹp ở desktop. Thêm Đọc rộng/Thu gọn tùy chọn; CI sẽ xác minh Electron ở 1920 và 720px; chỉ tính sau soát ảnh.

## QA repair P5.1.310 — CI 45177813399
- Job capture failed at P271: teacherVisible=false although labelCountOnScreen, learnedOnChoice, actualNB true. Opened real Electron P271 before: teacher select is cut by panel bottom.
- Scroll teacher into viewport before geometry verification, then align replacement after DOM rerender. Keep assertions, no autoplay or data mutation. Candidate until CI green and new screenshot opened.

## Đợt mới từ P5.1.310 — Vòng 01/20: P5.1.311 (ĐẠT)
- Baseline P5.1.310 / Electron 4.23.395: Actions 45179155802 đã đạt test/capture/Windows/Mac; qa310 9/9 true, mở cả ảnh wide-reading trước/sau 1920×1080.
- Lỗi trong mã: huấn luyện Naive Bayes cập nhật RAM trước save; nếu localStorage đầy, nhãn mất khi khởi động lại. Sửa giao dịch ghi nhãn có rollback trọng số và hàng đợi; QA ép lỗi quota tại khóa AI riêng, kiểm tra playlist không đổi và no-autoplay.
- ĐẠT sau CI 45181291993: 1024/1029 Node tests pass, 5 skipped, 0 fail; 5/5 job test/capture/Windows x64/macOS x64/ARM64 thành công; qa311 7/7 true. Đã tải và mở hai PNG P311 trước/sau 1920×1080 từ artifact 14822051859. Ảnh sau cho thấy lỗi màu chữ xanh dễ nhầm với thành công → ưu tiên P312.

## Đợt hiện tại — Vòng 02/20: P5.1.312 (ĐẠT)
- Input: mở ảnh P311 sau và thấy trạng thái Không lưu được nhãn AI vẫn màu xanh giống thành công, thiếu lối sao lưu trọng số an toàn tại chỗ.
- Thêm cảnh báo màu hổ phách, role alert assertive và nút xuất JSON từ AI trainer, ẩn khi không có lỗi. Không xóa mô hình, playlist, EPG hoặc Favorites. QA312 click thao tác thực tế, đối chiếu model/playlist và ảnh trước/sau.
- ĐẠT sau CI 45183357907: 1025/1030 test pass, 5 skipped, 0 failed; 5/5 job test/capture/Windows x64/Mac ARM64/x64 thành công; qa312 10/10 true. Đã tải/mở hai PNG P312 before/after từ artifact 14821993814. Cảnh báo hổ phách dễ nhận biết và nút sao lưu chỉ xuất hiện khi lỗi; mô hình/playlist vẫn nguyên.

## Vòng 03/20 → 20/20 — CHƯA THỰC HIỆN
- Ảnh P312 sau: giao diện phản hồi đã yêu cầu tải JSON nhưng chưa hiển thị tên tệp/kích thước hay kiểm chứng trực tiếp tính toàn vẹn tệp vừa xuất. Cơ hội P313: kiểm tra/sao lưu mô hình có xác thực cấu trúc và thông tin kiểm chứng rõ ràng, không gửi dữ liệu lên mạng, chỉ sau thao tác người dùng.
- Baseline mới nhất hoàn tất đã xác minh: P5.1.312, Electron 4.23.397, commit c94c1c9d179d4d9dbf10cc008b51c92685d8775a; QA repair/website bot HEAD có thể mới hơn. Phải đọc lại HEAD và package.json trước sửa.
- Đợt này mới có 2/20 vòng đủ tiêu chí; không trộn 70 ảnh test tích lũy của CI vào số vòng sửa mới.

## Đợt tiếp theo từ P5.1.320 — 23/11/2026
- Baseline P5.1.320 / Electron 4.23.405; HEAD 157c6d5eaeab360530ae147d974e728f92f915f0; Actions 45205998261 test/capture/build Win & Mac success, release skipped.
- Đã tải artifact 14833832765 và mở ảnh trước/sau P320 thực 1920×1080; tiêu đề AI bị cuộn một phần dưới nav sticky.
- Vòng 01/20 — P5.1.321 CANDIDATE: thêm nút ↑ Đầu AI có điều kiện trong header sticky; test và ảnh P321 trước/sau; chưa tính hoàn thành trước CI và soát ảnh sau.
- Vòng 02–20: chưa thực hiện; không lấy số screenshot tích lũy làm số vòng mới.

- P5.1.321 QA đã xác minh: 1037 tests pass/5 skipped, QA321 9/9, capture và build Win/Mac success; hai ảnh Electron đã mở soát; không public Release.
- P322 vòng 02/20 CANDIDATE: ảnh sau P321 cho thấy header ghi “Xem gì bây giờ?” không khớp AI; cập nhật nhãn theo mode và bảo toàn trạng thái; chờ CI/ảnh mới.

## CHECKPOINT ĐÃ XÁC MINH — 23/11/2026, sau P5.1.322
**Đợt mới từ P5.1.320: 02/20 vòng sửa có thay đổi mã, test Node, QA Electron thật và soát ảnh trước/sau. Không đồng nhất với 70 ảnh test tích lũy.** Chỉ nhánh Positron. Release của bản thực nghiệm bị disable theo chính sách stable-only; các bộ cài nằm trong GitHub Actions, không nhận đã public release.

### Vòng 01 — P5.1.321 / Electron 4.23.406 — ĐẠT QA
- Code: 65d28d9437f225dbe47c7fa091df8bf1403538dd; repair 4141cb0beede9a4fa4773970b12d07ff43652b2c.
- CI: https://github.com/trisanghy/open-iptv-pro/actions/runs/45213107222 — 1037 Node pass, 5 skipped, 0 fail; capture, Win x64, macOS Intel/ARM success. Release skipped, không phát hành stable.
- QA321: 9/9 true (nút ↑ Đầu AI chỉ hiện khi đã cuộn, cuộn về đầu, focus, bảo toàn playlist/model/player, không tràn).
- PNG trước: positron-p51321-ai-return-before-1920x1080-real.png; SHA256 360315a50b6fb81477836207177914bc6672021fe1465d30d1b27eca1510618a
- PNG sau: positron-p51321-ai-return-after-1920x1080-real.png; SHA256 dcdf7de490412a1b568d0c72c68e0c4a200c91f1bc28399f3686ca7c983f92cf
- Hai PNG đã thực sự MỞ XEM: nút có trên header sticky khi cuộn, sau bấm đầu AI hiển thị, nút ẩn. Source ZIP Actions artifact 14835914716.
- Lỗi dẫn vòng 02: tiêu đề sticky vẫn ghi “Xem gì bây giờ?” khi AI đang bật.

### Vòng 02 — P5.1.322 / Electron 4.23.407 — ĐẠT QA (macOS ARM64 đang chờ xác minh build)
- Code: 834fc39e9fde32e056d3ef252a286644b8c186c2.
- CI: https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864 — 1038 Node pass, 5 skipped, 0 fail; capture QA322, Windows x64, macOS Intel x64 success; macOS ARM64 vẫn queued tại checkpoint. Release không công bố.
- QA322: 11/11 true (header theo chế độ AI, phục hồi khi rời AI/đóng/mở, aria-labelledby, bảo toàn playlist/model/player, không tràn).
- PNG trước: positron-p51322-ai-title-before-1920x1080-real.png; SHA256 7cb9d7050ac096ae0cf5db0ccd55e2a8056126e28f4190cdb88c541bdc99935b
- PNG sau: positron-p51322-ai-title-after-1920x1080-real.png; SHA256 7d34659f9d4766db3690a2aa9190dcbc2586d2521077ef054f81180101ac2095
- Hai PNG đã thực sự MỞ XEM: outer header đổi từ “Xem gì bây giờ?” sang “AI hợp gu”, nội dung card không bị che, không có tràn ngang; artifact 14837674301.
- Windows x64 Actions artifact: https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864/artifacts/14839580218
- Mac Intel x64 Actions artifact: https://github.com/trisanghy/open-iptv-pro/actions/runs/45215506864/artifacts/14838601170

### Vòng 03–20 — CHƯA THỰC HIỆN
- Ưu tiên vòng 03: ảnh P322 cho thấy bốn nút thao tác trong thẻ AI (Xem/Hợp gu/Không hợp/Tra cứu web) dùng chữ rất nhỏ và hit target khoảng 34px, khó thao tác remote/bàn phím. Kiểm tra computed geometry và tăng target tối thiểu hợp lý mà không làm tràn panel 528px/720px; test và screenshot thật trước/sau.
- Bắt đầu trên HEAD hiện hành, dự kiến label P5.1.323 / Electron 4.23.408 **nếu chưa có ai tăng phiên bản**. Không tự khẳng định đã hoàn thành vòng 03.
- Phải đọc file/hình thật hiện hành, re-verify branch HEAD/Actions/Release, không force push; một vòng = một bản vá riêng đã kiểm chứng.

## Vòng 03/20 — P5.1.323 / Electron 4.23.408 (CANDIDATE)
- Screenshot input: personally opened P322 before/after from Actions artifact 14837674301; first AI recommendation has four 34px-high actions.
- Patch: new 44px action hit areas, readable type and focus, mobile wrapping.
- Added Node test plus actual Electron before/after 1920×1080 and narrow 720×900 audit.
- Do not count as completed before CI AND direct image review.
