# Positron — New 20-round issue register

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
