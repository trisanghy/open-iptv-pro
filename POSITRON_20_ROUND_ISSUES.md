# Positron — New 20-round issue register

## Vòng 02/20 — P5.1.203 / Electron 4.23.288 — CANDIDATE
- Input: đã trực tiếp MỞ ảnh Electron P5.1.202 `positron-p51202-desktop-1920x1080-trang-chu-real.png` và thấy các banner thông báo che thanh âm lượng/transport TV.
- Sửa: ở desktop TV từ 1000px, ghim toast lên phía trên, chuyển cả nút Xem thêm nổi lên phía trên, giữ nút có thể bấm và nhật ký thông báo ở header và cảnh báo. Các màn hình khác không đổi.
- QA yêu cầu: ảnh Electron before/after 1920×1080, đo không overlap, test Node/legacy, CI 6/6, release bất biến; chỉ đánh dấu hoàn tất sau khi mở PNG thật.

## Vòng 01/20 đợt mới — P5.1.202 / Electron 4.23.287 — CANDIDATE
- Đầu vào: bộ ảnh Electron P5.1.201 before/after/restored đã tải và MỞ; biểu mẫu hiện tại chỉ có preset thời lượng, không có cách gia hạn mốc Kết thúc đang nhập.
- Tính năng: Gia hạn +15 phút cho EPG và ghi nhanh TV; không thay đổi Bắt đầu, cảnh báo trường không hợp lệ và giới hạn 8 giờ.
- Hoàn tất khi Node tests, Electron before/after 1920×1080 đã MỞ, push, CI 6/6, tag/release và bộ cài xác minh. Thiếu bất kỳ bước nào: CANDIDATE.

## Vòng 03/20 — P5.1.201 / Electron 4.23.286 — CANDIDATE
- Đầu vào: đã mở ba ảnh Electron P5.1.200 1920×1080 (before, confirm và after). Thay tên hai lần đã đúng nhưng sau khi tên cũ bị thay chưa có cách phục hồi ngay.
- Tính năng: nút “Hoàn tác thay tên” chỉ hiện sau một lần thay tên được xác nhận, khôi phục đúng tên nhập tay nếu người dùng chưa sửa thêm. Khi sửa nội dung/kênh/giờ thì trạng thái hoàn tác mất hiệu lực.
- Bằng chứng bắt buộc: Node regression; Electron 3 ảnh thật 1920×1080 before/after/restored đã MỞ; kiểm tra không tự ghi lịch, không phát video; CI 6/6 + release/tag/bộ cài mới. Hiện CANDIDATE.

## Vòng 02/20 — P5.1.200 / Electron 4.23.285 — CANDIDATE
- Đầu vào: ảnh Electron P5.1.199 after 1920×1080 đã MỞ, tên tạo tự động cập nhật chính xác nhưng kịch bản cố tạo tên khi có nhãn thủ công hiện thông báo yêu cầu xóa thủ công.
- Tính năng: thay vì bắt xóa tên, nút “Tạo tên từ kênh và giờ” chuyển sang xác nhận màu hổ phách ở lần đầu; lần nhấn thứ hai mới thay tên, có hủy Escape/sửa nội dung/bỏ focus. Không tự đặt lịch, không sửa M3U, không tự phát.
- Bắt buộc chứng minh bằng Node tests, Electron 3 ảnh thật 1920×1080 before/confirm/after đã mở, CI 6/6 và release mới bất biến; hiện CANDIDATE tới khi xác minh xong.

## P5.1.199 / Electron 4.23.284 — CANDIDATE (22/11/2026)
- Đã mở ảnh Electron thật P5.1.198 1920×1080: Bắt đầu 23/11 nhưng tên tạo tự động còn 22/11; nút tạo tên yêu cầu xóa tên cũ.
- Sửa trên Positron: chỉ đồng bộ tên được tạo bởi app trong phiên khi giờ bắt đầu/kênh thay đổi; bảo vệ tên thủ công, playlist, DVR và stream.
- Bắt buộc trước khi ghi VERIFIED: 11 QA Electron, ảnh 16:9 trước/sau đã mở, Node test, CI 6/6, release và installer thực.

## Đợt hiện tại — P5.1.198 (CANDIDATE)
- Baseline từ ảnh Electron thật P5.1.197 đã MỞ: EPG có 3 chọn nhanh 5/15/30 phút nhưng không có cách chuyển mốc ghi sang ngày mai giữ cùng giờ.
- Giải pháp P5.1.198 / Electron 4.23.283: thêm nút Ngày mai cùng giờ trên cả mẫu EPG và ghi nhanh TV, giữ duration 1–480 phút và title, update preview, không gửi lịch.
- Phải có đủ Node, before/after thật 1920×1080 và MỞ soát ảnh, commit/6 CI jobs/Release; không tính các bài ảnh lịch sử là vòng sửa.

## Đợt hiện tại — vòng kế tiếp P5.1.197 (CANDIDATE)
- Đầu vào: ảnh Electron P5.1.196 thật trước/sau đã MỞ xem 1920×1080; ở ảnh sau, dòng lịch ghi nhỏ và lặp 'QA Channel 001' do tên auto đã có tên kênh.
- P5.1.197 / app 4.23.282: Sao chép lịch ghi khi hợp lệ, rõ ràng thông báo clipboard, bỏ lặp kênh trong tóm tắt; không ảnh hưởng DVR/playlist.
- Yêu cầu trước khi tính vòng hoàn thành: 12 QA Electron, hai PNG thật trước/sau, MỞ ảnh sau, Node 0 lỗi, build và tag release riêng. Giữ bản cũ bất biến.

## Vòng mới từ P5.1.195 — 22/11/2026
- Baseline đã MỞ: hai PNG Electron thật P5.1.195 before/after, 1920×1080; Actions 45004688211 6/6 jobs thành công; release `positron/v4.23.280-p5.1.195`.
- Lỗi UX từ ảnh: chưa xem lại lịch ghi kênh, tên và thời lượng trong một hàng trước khi bấm Đặt lịch.
- P5.1.196 / 4.23.281 (CANDIDATE): live preview read-only, xử lý nhập thiếu/sai giờ, test và screenshot trước/sau; chỉ ghi hoàn thành sau CI/Release và MỞ ảnh.
- Vòng kế phải dựa trên ảnh P196, không đếm kịch bản screenshot cũ thành vòng sửa mới.

## Vòng 03 đợt mới, 22/11/2026
- Baseline: P5.1.194 app 4.23.279, commit ff29ada0c777398a4fc8dcba36db4cd9c99dd474, CI 45004026363 6/6 jobs success, 839 Node pass / 5 skip; đã MỞ ảnh `positron-p51194-dvr-start-after-after-1920x1080-real.png` và xác nhận tự đặt Bắt đầu sau 15 phút, giữ 2 giờ.
- Phát hiện từ ảnh: ô “Tên chương trình” rỗng dù đã chọn QA Channel 001 và giờ bắt đầu; trường bắt buộc dễ khiến thao tác hẹn ghi thiếu bước.
- Vòng 03 P5.1.195/4.23.280 CANDIDATE: tạo tên theo kênh và giờ bằng nút riêng; bảo toàn tên thủ công. Đòi hỏi Node, Electron before/after 1920×1080, MỞ PNG, CI và release.
- Vòng tiếp theo: quan sát ảnh thực P195 trước khi quyết định cải tiến mới, không tính lại các vòng lịch sử.

## Đợt mới từ P5.1.193, 22/11/2026
- P5.1.193 / Electron 4.23.278, Actions 45003368885: 6/6 jobs thành công, 838 Node pass, 5 skip; release positron/v4.23.278-p5.1.193; đã MỞ trước/sau 1920×1080, trạng thái +60/+120 đúng, không tràn ngang.
- Vòng 02 P5.1.194 / 4.23.279 CANDIDATE: bổ sung giờ bắt đầu nhanh 5/15/30 phút từ thời điểm hiện tại; bảo toàn khoảng ghi, không tự submit. Chỉ tính hoàn thành khi mở ảnh sau, test đạt và release được xác minh.
- Ưu tiên vòng sau: từ ảnh P194 kiểm tra vị trí hai trường Bắt đầu/Kết thúc và khả năng thao tác bằng bàn phím ở cửa sổ hẹp; chọn tính năng thực sự cần thiết.

Baseline P5.1.105: `937db5120885efefe32c62fe3a9476601e76955c`. Only the `Positron` branch is in scope. No force-push.

## Round 01/20 — P5.1.106 / v4.23.190 — VERIFIED
- Input: actual P5.1.105 Electron `positron-watchflow-1360-night-real.png` with compact WatchFlow horizontal scrollbar.
- Root: -18px sticky header margin mismatched 15px empty dialog padding.
- Fix & test: scoped margin/padding correction; strict `scrollWidth <= clientWidth+1` Electron assertion.
- Before: P5.1.105 `positron-watchflow-1360-night-real.png`. After: P5.1.106 `positron-p51106-empty-watchflow-no-horizontal-scroll-real.png`, directly visually inspected; scrollbar removed.
- Version release `positron/v4.23.190-p5.1.106`, final SHA `19746909a874bdcc659f6948319cee86f0eec1da`; Actions #44924483487 6/6 success; full EXE/DMG assets verified.
- Node 700 pass, 5 skip, 0 fail (705 total). **One actual repair round**, not the 70 older screenshot scenarios.

## Round 02/20 — P5.1.107 / v4.23.191 — CANDIDATE
- Input: actual P5.1.106 screenshots `positron-p5-08-real.png` (540px) and `positron-p5-09-real.png` (450px).
- Symptom: chooser tabs and grid/list controls still show font-dependent text glyphs in tiny/ambiguous squares.
- Root: five buttons in `renderer/web-channel-chooser-v42371.js` use ▣/☆/◷/▦/☷ directly.
- Fix: deterministic inline SVG in those 5 controls with readable text/ARIA labels, without altering any channel data or player behavior.
- Regression: Node source test; REAL Electron 450px DOM checks and screenshot `positron-p51107-chooser-native-svg-450-real.png`.
- Status: **not complete until CI, screenshot visual review and immutable Release succeed**.

## Future rounds
Evaluate defects revealed by real screenshot of previous build before making changes; prioritize video controls, keyboard accessibility, channel library, Watch Later, Cast/PiP, EPG/Sources, and small-screen layout. Remaining 18 are NOT yet completed.

## New upload — 22/11/2026
- Verified P5.1.128 HEAD 7003357116d97ec3d98c76af54071fd4e81b717d, Actions #44948172418 success.
- Opened genuine Electron baseline `p5-20-rounds/positron-p51128-dropdown-chip-450-real.png`.
- Defect: clipped neighbour-group letter visible to RIGHT of sticky "Tất cả" after selecting "Tin tức" on 450px.
- Proposed P5.1.129: conditional right-hand mask and real screenshot regression; count only after verified release and manual after-image review.

## Follow-up round 02 — input P5.1.129
- Directly opened P5.1.129 real screenshot `positron-p51129-right-mask-450-real.png` and enlarged the category rail. The text ghost is fixed, but a detached curved border still appears to the right of pinned "Tất cả".
- Planned P5.1.130 v4.23.214: widen conditional right mask to 30px; check "Thiếu nhi" remains independently hit-testable; genuine 450px Electron after PNG, Node test and immutable release required for completion.

## Planned round 03 — input P5.1.130 screenshot
- Genuine Electron `positron-p51130-border-mask-450-real.png`: previous curled-border defect no longer visible; native channel search clearly accessible.
- Source-grounded functional defect: normalize(NFD)+combining mark removal does not map Vietnamese đ/Đ to ASCII d.
- P5.1.131 v4.23.215: map đ→d in native chooser, real QA fixture `TH địa phương` queried as `dia phuong`, screenshot/keyboard/focus, clear restored; no playback.

## Planned round 04 — input genuine P5.1.131
- Real Electron screenshot of `dia phuong` shows channel search prominently; source reveals no actionable empty-state recovery for All-tab user typos.
- P5.1.132 v4.23.216: add reversible clear-filters button only for meaningful no-results search/group, never import/delete source or autoplay. Verify native before+after screenshots.

## Planned round 05 — P5.1.132 after-image
- Direct visual review of true `positron-p51132-empty-search-clear-after-450-real.png`: at 450px with 18 cards, labels like "QA Channel 00…" are truncated and collide vertically with their separate Favorite star button.
- P5.1.133 v4.23.217: only multi-card compact Grid: reserve star row and allow 2-line text; genuine Electron screenshot/hit geometry regression; no data changes.

## Round 06 input — Positron P5.1.133 actual after image
- Opened P5.1.133 real `positron-p51133-compact-card-title-star-450-real.png`: title clipping fixed, but Unicode star glyph is tiny/visually inconsistent. P5.1.134 changes only presentation to consistent SVG while preserving the favorite toggle's native semantic and storage.
- Required Electron 450px before+after screenshots and aria-pressed / fill / undo QA, real release or fallback assets.

---

## Đợt mới 22/11/2026 — 20 vòng từ P5.1.167 (đã chứng minh 03/20)
**Các dòng dưới đây dùng ảnh Electron thật / CI, không gộp 70 screenshot checks thành 70 vòng sửa.**

| Vòng | Phiên bản | Input và vấn đề/tính năng | Giải pháp mã nguồn | Kiểm thử và ảnh thật | Release | Trạng thái |
|---|---|---|---|---|---|---|
| 01 | P5.1.168 / app 4.23.253 | Ảnh P5.1.167: thanh phân trang kênh thiếu logo bị khuất cuối popup | Đưa `#poLibraryMissingNav` lên trước vùng cuộn, CSS giữ nút trong panel | Node 808 đạt, 0 lỗi, 5 skipped; 7/7 phép đo Electron; `positron-p51168-pager-visible-after-1920x1080-real.png` đã mở | `positron/v4.23.253-p5.1.168`; CI 44985148784; commit `14265297ee9e49a053ec8e0440d9dfaddde59641` | HOÀN THÀNH |
| 02 | P5.1.169 / app 4.23.254 | Ảnh P5.1.168: thiếu cách phân loại kênh thiếu logo theo mã EPG | Bộ lọc EPG `all/missing-epg/with-epg`, kết hợp tìm/nhóm/sắp xếp/CSV, chỉ đọc dữ liệu | Node 809 đạt, 0 lỗi, 5 skipped; 13/13 Electron QA; `positron-p51169-epg-filter-after-1920x1080-real.png` đã mở | `positron/v4.23.254-p5.1.169`; CI 44986000752; commit `c4ecb019b4eb7863a919491b8865666699e25d79` | HOÀN THÀNH |
| 03 | P5.1.170 / app 4.23.255 | Ảnh P5.1.169: đã có 5 điều kiện lọc nhưng chưa thể khôi phục bằng một thao tác | Nút `Xóa bộ lọc`, khôi phục tìm, nhóm, EPG, sort và 10 kênh/trang, trả focus | Node 810 đạt, 0 lỗi, 5 skipped; 13/13 Electron QA; `positron-p51170-clear-filters-after-1920x1080-real.png` đã mở | `positron/v4.23.255-p5.1.170`; CI 44986538072; commit `b577e4d1bfa84bab81209ca0fec6e5b1e295998c` | HOÀN THÀNH |

### Các vòng 04–20: CHƯA THỰC HIỆN
- Đầu vào vòng 04: ảnh thật P5.1.170 phần Thư viện sau khi xóa bộ lọc. Quan sát: điều hướng hiện `Trang 1 / 57` nhưng không ghi rõ đang xem 1–10 trên 561 kênh. **Đề xuất khảo sát** bổ sung nhãn phạm vi 1–10/561; đây là đề xuất tính năng, không nhận là bug tái hiện nếu chưa chứng minh.
- Các đầu vào sau phải đến từ PNG/QA ngay vòng trước và bug/nhu cầu thực tế, không giả lập quy trình 20 vòng. Tiếp tục ở **P5.1.171**; nếu version app 4.23.256 chưa bị dùng, tăng SemVer hợp lệ theo HEAD thực tế.
- Rủi ro cần theo dõi: panel Thư viện có thanh cuộn riêng và danh sách cuộn riêng; kiểm tra bánh xe chuột/cảm ứng ở màn hẹp; không khẳng định đã thử nếu chưa có screenshot/hành vi tái hiện.
- Chưa thử: stream M3U có quyền sử dụng thật, xử lý GPU/audio, Cast thiết bị thật, DVR/Timeshift ngoài fixture Electron. CI UI và bộ cài thành công không xác nhận các mục này.
- Không thay đổi `main` hay nhánh khác, không force push, không thay tag cũ. Không trùng đếm 50 P4 + 20 P5 screenshot checks với 3 vòng code mới.

### Nguồn release/ảnh đã xác minh
- P5.1.168: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.253-p5.1.168
- P5.1.169: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.254-p5.1.169
- P5.1.170: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.255-p5.1.170


## Tiếp nối P5.1.177 — P5.1.178 (CANDIDATE)
- Input ảnh Electron thật P5.1.176 `positron-p51176-more-favorites-after-1920x1080-real.png`: sáu gợi ý cố định trong hàng trăm kênh.
- Thêm điều hướng Gợi ý khác duyệt các kênh chưa đánh dấu sao, không autoplay, không lưu Favorites nếu người dùng chưa bấm ☆.
- Chỉ tính vòng khi Node pass, Electron screenshot trước/sau được mở kiểm tra trực tiếp, CI build + Release Windows/Mac xác minh thành công.


## P5.1.179 (CANDIDATE) — tìm trong nhiều kênh gợi ý
- Đọc ảnh Electron thật P5.1.178: sáu gợi ý đổi 003–008 sang 009–014, nhưng hơn 500 kênh khác không tìm nhanh được.
- Thêm ô Tìm kênh để thêm, tìm theo tên/nhóm không dấu, chỉ xem metadata trong danh sách đang bật và chưa sao.
- Phải kiểm chứng Node, 9 QA trong Electron, chụp/mở PNG 1920×1080 before/after, Windows/macOS Release hoặc fallback 403. Không đánh dấu hoàn thành khi còn thiếu.


## P5.1.180 (CANDIDATE) — thao tác lưu nhiều kênh
- Ảnh thật P5.1.179 đã mở: bộ tìm đề xuất có kết quả rõ, nhưng mỗi kênh phải tự đánh dấu sao. Khi sáu gợi ý cần lưu cần sáu thao tác.
- Thêm nút Lưu cả N kênh chủ động, kiểm tra lại favorites hiện tại và save/render một lần. Không xóa nguồn, không autoplay.
- Bằng chứng bắt buộc: 9 QA trên Electron thật, Node xanh, hai ảnh trước/sau trực tiếp soát, release EXE/DMG có tài sản được xác minh.


## P5.1.181 (CANDIDATE) — lỗi từ PNG vòng P5.1.180
- Ảnh TRƯỚC đã mở: `positron-p51180-bulk-favorites-after-1920x1080-real.png`; hiển thị 8 Favorites trên 6 cột chật, tên cắt "QA Ch..." và small text tự xuống dòng.
- Nguyên nhân: `.favorite-grid` kế thừa auto-fit min-width nhỏ từ `--ui-grid-min`, vốn dùng chung cả các trang.
- Sửa riêng trong Positron: grid min 390px/cột, một cột ở viewport hẹp; giữ logic Favorites và ứng dụng nguyên trạng.
- Cần ảnh SAU thật `positron-p51181-readable-favorites-after-1920x1080-real.png`, QA đo số cột, card width/title clipping; verify CI EXE/DMG + release.

## P5.1.182 (CANDIDATE) — từ PNG P181
- Input: ảnh Electron P181 `positron-p51181-readable-favorites-after-1920x1080-real.png` có tám thẻ rõ tên nhưng thiếu sort.
- Change: danh sách sắp xếp theo A–Z/Z–A/ban đầu, presentation-only; giữ Favorites, nguồn, playback.
- Regression: source test, Electron `favoriteNameSortQA`, `searchAfterSortQA`, `restoredSortQA`.
- Screenshots cần: `positron-p51182-favorites-sort-before-1920x1080-real.png`, `positron-p51182-favorites-sort-after-1920x1080-real.png`.
- CANDIDATE trước CI/soát ảnh/Release.

## P5.1.183 (CANDIDATE) — từ ảnh Electron P182
- Input: screenshot P182 gợi ý chỉ 6 chip trong card 720px, desktop 1920px bỏ trống phần lớn không gian.
- Feature: chọn 6/12/24 gợi ý, bảng rộng hơn 1180px, cập nhật next/bulk theo N; không sửa nguồn/phát video.
- QA: `favoriteSuggestion12QA`, `batchFavorite12QA`, `restoreSixQA`, ảnh Electron before/after P183 1920×1080.
- Chờ CI/release + mở ảnh trực tiếp, không tính VERIFIED trước đó.

## P5.1.184 (CANDIDATE) — nhóm kênh gợi ý từ ảnh P183
- Input: P183 cho 12 chip nhưng 553 ứng viên thuộc nhiều nhóm và chưa có dropdown lọc nhóm.
- Feature: nhóm theo M3U enabled, kết hợp search không dấu, pageSize 6/12/24 và bulk, không thay nguồn hay tự phát.
- QA: `favoriteRegionalQA`, `favoriteGroupSearchQA`, `resetGroupQA`, hai ảnh thực P184 before/after.
- Chờ test, mở PNG và release.

## P5.1.185 (CANDIDATE) — từ ảnh dropdown P184
- Input: 541 ứng viên, dropdown nhóm không hiển thị quy mô từng nhóm trước khi người dùng chọn.
- Feature: nhóm nổi bật một chạm, số kênh thực theo nguồn đang bật, aria-pressed, giữ group select + search.
- QA: `favoriteQuickGroupQA`, `favoriteQuickResetQA`, trước/sau PNG Electron 1920×1080.
- Chờ CI và mở ảnh/release.

## P5.1.186 (CANDIDATE) — từ ảnh P185
- Input: 541 gợi ý, bộ phân trang chỉ có Gợi ý khác, không có Trước/chỉ số và có nguy cơ lặp trang cuối.
- Feature: Trước/Tiếp + Trang x/y, trang cuối ngắn đúng dữ liệu, không trùng kênh/bulk đúng N.
- QA: `favoritePageLastQA`, `favoritePageNavigationQA`, PNG before/after Electron 1920×1080.
- Chờ CI và soát ảnh/release.

## P5.1.187 (CANDIDATE) — từ ảnh P186
- Input: hàng trăm gợi ý có chỉ số trang nhưng chưa có điều hướng trực tiếp tới trang số bất kỳ.
- Feature: ô nhập trang có Enter, clamp 1..tổng, giữ nguồn và phân trang.
- QA: `favoriteJumpSevenQA`, `favoriteJumpClampQA`, ảnh P187 before/after Electron 1920×1080.
- Chờ CI/ảnh/release.

## P5.1.188 (CANDIDATE) — ảnh Electron thật P187
- Input: `positron-p51187-favorite-direct-page-after-1920x1080-real.png` lấy từ GitHub Actions run 44998410884, đã mở xem trực tiếp.
- Triệu chứng: khối gợi ý cố định tối đa 1180px khi desktop 1920px, trong khi các thẻ Yêu thích phía trên dùng hết bề ngang; vùng trống bên phải quá lớn.
- Nguyên nhân gốc: CSS P183 `#positronFavoriteMore{max-width:1180px;width:min(100%,1180px)}`.
- Sửa: chỉ desktop ≥1600px mở rộng khối gợi ý và tăng thành 6 cột, không đổi viewport nhỏ, nguồn IPTV/Favorites hoặc trình phát.
- QA bắt buộc: `favoriteWideQA`, PNG sau `positron-p51188-favorite-wide-after-1920x1080-real.png`, Node regression; không tính hoàn thành trước khi có CI và mở soát ảnh.

- Bổ sung ảnh Electron BEFORE qua Playwright trên cùng trang P188 với CSS P187 tạm thời tái hiện, rồi phục hồi CSS P188 và chụp AFTER. Ảnh BEFORE là trạng thái thật của Electron, không phải bộ cài P187.

- P188 CI run 44999143948: Node 828/833 pass (5 skipped); capture thất bại ở P183 cũ vì assertion `desktopColumns===4` không còn phù hợp với tính năng mới 6 cột. Giữ toàn bộ checks và đổi yêu cầu thành đúng **6 cột** ở 1920, không hạ kiểm tra còn lại. Commit sửa tăng tiếp nối.

## P5.1.189 (CANDIDATE) — từ ảnh Electron P188 đã soi trực tiếp
- Input: `positron-p51188-favorite-wide-after-1920x1080-real.png`, tải từ Actions 44999409219 và đã mở xem; nhóm Regional có 100 kênh chưa yêu thích, nhưng bộ lọc chưa có lựa chọn sắp xếp.
- Feature: thêm dropdown Theo nguồn / Tên A–Z / Tên Z–A vào hàng tìm gợi ý; Collator tiếng Việt, đặt lại trang đầu khi đổi, giữ các bộ lọc và Favorites/playlist thật.
- QA: chụp Electron `positron-p51189-favorite-sort-before-1920x1080-real.png` và `positron-p51189-favorite-sort-after-1920x1080-real.png`, kiểm tra thứ tự 120..109, 021..032, số lượng và nguồn không bị đổi.
- Status: chưa công nhận hoàn thành trước CI, mở xem ảnh SAU và Release mới.

- CI P189 run 45000062232: Node 829 pass, 5 skip, 0 fail; Electron cũ kiểm tra cố định mã QA Channel 120/109 không khớp thực tế. Nâng phép thử so sánh toàn bộ 12 nhãn hiển thị với thứ tự dự kiến tính trực tiếp từ danh sách nguồn đã bật và Intl.Collator tiếng Việt, đồng thời chụp ảnh SAU trước assert và ghi log actual/expected. Không thay đổi thuật toán sắp xếp hay dữ liệu để che lỗi.

## P5.1.190 (CANDIDATE) — ảnh P189 đã xem trực tiếp
- Input: ảnh `positron-p51189-desktop-1920x1080-trang-chu-real.png` từ CI 45000491204 thực tế cho thấy phía trên video/đầu danh sách kênh bị che vì TV còn ở vị trí cuộn sâu.
- Root: `renderer/app.js` chỉ reset `.content.scrollTop` khi `last!==p`; nhấn lại TV khi `last===p==='tv'` giữ nguyên chỗ cuộn.
- Feature: nhấn tab TV đang active sẽ trở về đầu vùng video, không thay đổi current channel hoặc nguồn.
- QA: Playwright trên Electron chụp `positron-p51190-tv-reselect-before-1920x1080-real.png` khi cuộn, click nav TV, xác minh scroll về 0 và chụp `positron-p51190-tv-reselect-after-1920x1080-real.png`.
- Status: chưa công nhận hoàn thành trước khi build/CI/soát ảnh và Release.

## P5.1.191 (CANDIDATE) — ý tưởng từ ảnh EPG P190
- Input: `positron-p51190-desktop-1920x1080-lich-phat-song-real.png` đã mở trực tiếp; form Bắt đầu/Kết thúc nhập tay gây chậm thao tác và dễ gõ sai thời lượng.
- Feature: các preset +30/+60/+120 phút cập nhật riêng giờ Kết thúc của biểu mẫu DVR chính hoặc ghi nhanh; không submit tự động.
- QA: screenshot native Electron trước/sau `positron-p51191-dvr-presets-before-1920x1080-real.png` / `positron-p51191-dvr-presets-after-1920x1080-real.png`, kiểm end time +60 phút, không submit, không autoplay, không overflow.
- Status: chờ CI và xem PNG thật trước khi công nhận.

## P5.1.192 (CANDIDATE) — xem ảnh EPG Electron P191
- Input: `positron-p51191-dvr-presets-after-1920x1080-real.png` thật đã mở: preset nút nhỏ đúng chỗ nhưng không có phản hồi tổng thời lượng hoặc cảnh báo sai ngày giờ ngay trong biểu mẫu.
- Feature: output thời lượng động có `aria-live=polite`, tính từ start/end địa phương; cảnh báo kết thúc trước bắt đầu, khoảng >8 giờ. Áp dụng cả DVR EPG và TV, không chỉnh sửa dữ liệu nguồn.
- QA: Electron cùng trạng thái 1920×1080 chụp `positron-p51192-dvr-duration-before-1920x1080-real.png` và `positron-p51192-dvr-duration-after-1920x1080-real.png`; kiểm từng tình huống giờ, ghi nhanh, no submit và no autoplay.
- Status: chờ CI/ảnh và release.
