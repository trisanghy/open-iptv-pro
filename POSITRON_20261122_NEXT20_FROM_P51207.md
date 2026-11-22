# Positron — vòng mới từ P5.1.207 (22/11/2026)

Phạm vi: chỉ `Positron`. Baseline HEAD `2e0d53a478a3361731e0f191e8b06c54a9436e42`, Electron 4.23.292, P5.1.207. Không liên quan các nhánh stable/web/rust/mobile.

## Vòng 01/20 — ứng viên P5.1.208 / Electron 4.23.293

- Bằng chứng nguồn: `renderer/positron-horizon-v4.js` nút `#poRandomCycleReset` xóa tập kênh rồi tự đặt `hidden=true`, nhưng không trả tiêu điểm cho nút điều khiển còn thấy được. Bàn phím/remote có thể mất vị trí tiếp tục.
- Baseline ảnh thực lấy từ Actions #45020339907: `p5-20-rounds/positron-p51207-random-reset-after-1920x1080-real.png` đã mở và nhìn, 1920×1080, nút Bất kỳ và Làm mới xuất hiện trên transport.
- Sửa: ghi trạng thái focus trước khi ẩn nút Reset; sau reset chuyển focus về `#poNextRandomChannel` khi nút đó còn hiển thị. Không phát video, không đụng playlist/favorites.
- Regression: `tests/positron-p5.test.cjs`; Electron test sẽ nhấn Enter thực ở nút Reset, soát focus/counter/current channel/playlist và chụp `positron-p51208-focus-return-before-1920x1080-real.png`, `positron-p51208-focus-return-after-1920x1080-real.png`.
- **ĐÃ HOÀN THÀNH**: GitHub Actions #45021828902 6/6 thành công; Ảnh trước/sau 1920×1080 được mở, kiểm focus, giữ playlist/current channel; tag bất biến `positron/v4.23.293-p5.1.208`, Release đã xác minh, đầy đủ Win EXE + Mac DMG.

## Vòng 02/20 — P5.1.209 / Electron 4.23.294 — ĐÃ HOÀN THÀNH
- Chọn từ ảnh P208: số kênh khám phá chỉ có tử số, không có tổng. Thêm mẫu số tổng số kênh hợp lệ với giao diện ẩn khi chưa khám phá hay viewport hẹp.
- Release bất biến `positron/v4.23.294-p5.1.209`, commit phát hành `61a62f3f416b1494aad43e17c75814d54112f49f`, Actions #45022454342 6/6 thành công, đã trực tiếp mở 2 PNG từ chính run đó: `positron-p51209-random-progress-before-1920x1080-real.png` và `positron-p51209-random-progress-after-1920x1080-real.png`, sau hiển thị 1/561 với fixture Electron hợp lệ. Assets EXE/DMG, source, ảnh, SHA256SUMS đã xác minh bằng API.
- Một commit sau release `0b188ef` chỉ bổ sung reset bộ đếm trong kịch bản QA để trước/sau dễ so sánh. Workflow chạy lại thành công test, ảnh, build nhưng *release* từ run này bị chặn vì tag P209 đã bất biến trỏ `61a62f3`; không đẩy lại tag. P209 vẫn phát hành nguyên vẹn từ run gốc.

## Vòng 03/20 — P5.1.210 / Electron 4.23.295 — ĐÃ HOÀN THÀNH
- Lỗi nguồn P209: `syncRandomProgress` đọc tổng kênh mới, nhưng `randomSeenIds` còn lưu ID nguồn cũ cho đến khi bấm Bất kỳ lần sau. Tiến độ có thể tạm sai sau cập nhật nguồn.
- Thay đổi đề xuất/triển khai: khi `syncPlayerIntro` chạy vì native channelMeta thay đổi, lọc tập ID tạm theo kênh hiện có; cập nhật badge/progress/reset/aria-label; không sửa playlist, không autoplay.
- Test dự kiến: `sourceChangeQA` với hai cặp kênh fixture và MutationObserver Electron thật; before/after `positron-p51210-source-sync-before-1920x1080-real.png`, `positron-p51210-source-sync-after-1920x1080-real.png`; Node regression và 450px. Chỉ đếm hoàn thành sau CI và trực tiếp mở PNG sau; release tag `positron/v4.23.295-p5.1.210` duy nhất nếu thành công.
- Đã xác minh: Actions #45023542761 6/6 success, ảnh Electron thật P210 trước/sau đã mở và soát, không tràn ngang, mock nguồn không làm thay đổi playlist. Release `positron/v4.23.295-p5.1.210` có đủ Setup/Portable EXE, DMG ARM/Intel, ảnh, SHA256SUMS.

## Vòng 04/20 — P5.1.211 / Electron 4.23.296 — ĐÃ HOÀN THÀNH
- Phát hiện từ ảnh P210: thanh Bất kỳ có đếm và Reset nhưng không có thao tác trở lại kênh ngẫu nhiên vừa xem khi đã chuyển sang kênh tiếp.
- Đã sửa source: bộ nhớ lịch sử ngẫu nhiên tối đa 50 ID, nút ↶ trở lại kênh khám phá trước, chỉ hiện khi có ít nhất 2 ID, ẩn/giữ tiêu điểm bàn phím phù hợp; không đụng playlist và lượt khám phá không tăng khi quay lại.
- Test và ảnh bắt buộc: `randomBackQA`, `randomBackActionQA`, Electron 1920×1080 `positron-p51211-random-back-before-1920x1080-real.png` và `positron-p51211-random-back-after-1920x1080-real.png`, 450px, Node regression. Không đếm vòng 04 trước khi chạy và xem ảnh.
- Đã xác minh: Actions #45024273180 test/capture/Mac ARM/Mac x64/Windows x64/release success; trước/sau Electron 1920×1080 đã mở, nút ↶ xuất hiện khi có hai lượt, phép thử keyboard focus và playlist đều đạt. Release `positron/v4.23.296-p5.1.211` có đủ EXE/DMG/source/ảnh/SHA256SUMS.

## Vòng 05/20 — P5.1.212 / Electron 4.23.297 — ĐÃ HOÀN THÀNH
- Đầu vào từ ảnh P211: đã quay lại kênh ngẫu nhiên trước nhưng không có thao tác tiến lại khi người xem đổi ý. Thêm nút ↷ tiến theo lịch sử phiên sau Back, dùng stack riêng; bấm khám phá mới sẽ xóa ngăn tiến, source edit lọc ID cũ, không sửa kênh gốc.
- Test và ảnh P212: `forwardHistoryQA`, `forwardActionQA`, native Electron `positron-p51212-random-forward-before-1920x1080-real.png` và `positron-p51212-random-forward-after-1920x1080-real.png`, 450px và focus; chưa đếm hoàn tất khi CI chưa thành công hoặc chưa mở ảnh.
- Vòng 06–20: CHƯA LÀM; mỗi vòng phải đọc ảnh và CI phiên trước, sửa thực, tăng version và chỉ công bố release khi xác minh.

## Vòng 06/20 — P5.1.213 / Electron 4.23.298 — CANDIDATE
- Đã tải và mở ảnh thật before/after P5.1.212 từ Actions #45025012943 (6/6 success); đã xác minh Release P212 đầy đủ EXE, DMG, ảnh và SHA256SUMS.
- Phát hiện từ ảnh: điều khiển Back/Forward và Bất kỳ có sẵn nhưng người dùng chưa thể trực tiếp chọn lại kênh bất kỳ trong danh sách gần đây.
- Tính năng: menu ☷ hiển thị tối đa 10 kênh khám phá tạm trong phiên, có phát theo ID được chọn; không đổi M3U/Favorites, có Escape/focus và viewport 450px.
- QA bắt buộc: Node tests; historyOpenQA/historyPickQA/compact213; screenshot 1920×1080 before/after của Electron, ảnh SAU phải được mở xem.
- Chỉ công nhận hoàn tất sau khi CI 6/6, release assets và screenshot review đạt.
