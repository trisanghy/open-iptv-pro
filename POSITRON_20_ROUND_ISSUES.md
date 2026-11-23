# POSITRON — NHẬT KÝ ĐỢT 20 VÒNG MỚI (khởi tạo 23/11/2026)

Mục tiêu: 20 cải tiến độc lập trên duy nhất nhánh `Positron`; mỗi cải tiến có sửa nguồn thật, bài test, screenshot Electron before/after đã MỞ, và một SemVer mới. Không tính 70 tình huống QA lịch sử thành 70 vòng mới. Không đụng main, web, Rust, Mobile hay Electron gốc.

## Baseline đã xác minh
- Repo: `trisanghy/open-iptv-pro`, branch `Positron`.
- HEAD ban đầu: `d95cc3ed417671d5f02a8c141acb2f58f27742f7`.
- Release đầu vào P5.1.271 / Electron 4.23.356; CI thành công: https://github.com/trisanghy/open-iptv-pro/actions/runs/45085935252 .
- Đã tải và MỞ PNG Electron P271 (dạy AI, 1920x1080). Thiếu thư mục chủ đề đa nhãn; vùng dạy AI gần sát đáy panel.

## Vòng 01 — P5.1.272 / 4.23.357 — ĐÃ PHÁT HÀNH
- Feature mới: thư mục chủ đề EPG đa nhãn ảo, một kênh ở nhiều nhóm từ XMLTV, danh sách chưa rõ chủ đề, không thay playlist hoặc tự phát.
- Đầu vào: ảnh P271, kiểm tra core topicFor và UI WatchFlow cũ.
- Commit tính năng `30168fa7f9d7ebc089ee8000286d8d419760f659` (11 files); sửa đồng bộ nhãn `b505ad87763fccd0e4fa34145024fdb2d63f8b2c`; sửa hồi quy chế độ 5 nút che ô Dạy AI với 3 cột `ce1311f91e91de56d904fa21384cbcc45efe2785`.
- Test: 983 total = 978 pass + 5 skip + 0 fail. Electron screenshot QA P272: 10/10 assertion pass (visible, selected, multiple groups, 561 channels rà soát, 557 chưa có nhãn trong fixture, no autoplay, no playlist mutation, no horizontal overflow).
- Đã MỞ PNG thật trước/sau 1920x1080 và screenshot P271 teacher sau fix, quan sát 8 thư mục từ XMLTV fixture, không cắt ngang.
- CI 6/6 thành công: https://github.com/trisanghy/open-iptv-pro/actions/runs/45088149663
- Bản phát hành bất biến đã xác minh: https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.357-p5.1.272
- Ảnh before/after: `p5-20-rounds/positron-p51272-epg-folders-before-1920x1080-real.png`, `p5-20-rounds/positron-p51272-epg-folders-after-1920x1080-real.png`; ZIP có trong Release.
- QA dùng kênh giả lập + EPG fixture, không tuyên bố phát live/Cast/GPU/DVR đã thử.

## Vòng 02 — P5.1.273 / 4.23.358 — CODE + QA ĐẠT, RELEASE KHÔNG CHO PHÉP
- Feature mới: chương trình XMLTV trong 24h được xếp đồng thời nhiều thư mục chủ đề, giờ phát và tên kênh thực từ guide, chỉ phát khi người dùng bấm. Giữ nhóm không rõ chủ đề, có giới hạn xử lý bảo vệ hiệu năng.
- Đầu vào: đã MỞ ảnh sau vòng 01, thư mục kênh chưa có danh mục từng chương trình và giờ phát.
- Commit: `a63eb3b154ee46b00e07d695d72cd5a63f2134fa` (12 files).
- Node: 985 total = 980 pass + 5 skip + 0 fail (bao gồm 2 bài P273).
- CI source run: https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882
- test, capture, Windows x64, macOS Intel, macOS ARM: tất cả thành công; QA P273 10/10 assertion pass; đã MỞ PNG thật 1920x1080 before/after và thấy dòng giờ phát/tiêu đề/kênh, không tràn/chồng.
- Ảnh: `p5-20-rounds/positron-p51273-epg-programmes-before-1920x1080-real.png`, `p5-20-rounds/positron-p51273-epg-programmes-after-1920x1080-real.png`.
- GitHub Release job thất bại HTTP 403 (workflow token `Resource not accessible by integration`). Bản cài hoàn chỉnh vẫn nằm ở Actions artifact **win-x64** https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14781025288 và fallback chứa tất cả OS https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14781070749; ảnh QA https://github.com/trisanghy/open-iptv-pro/actions/runs/45089043882/artifacts/14780930991 .
- Lịch sử đồng thời thay đổi chính sách **Stable-only GitHub Releases** qua `fe531483`, `6b67b80e`, `f860a0e3`: workflow mới giữ Positron builds trong Actions, `release.if: false`. **Không được tái bật release trên Positron chỉ để ép ra P273**; tôn trọng main stable-only. Không có tag/release P273 đã xác minh.
- Chưa đánh dấu P273 là vòng *đã phát hành*, dù mã, ảnh và ba build đã chứng minh.

## Vòng 03–20 — CHƯA BẮT ĐẦU
- Đã có 2 thay đổi mới thật, 1 release xác minh, 1 bản có build/QA nhưng không Release do chính sách. Không được ghi 20/20.
- Đầu vào kỹ thuật cho 03: ảnh P273 sau (bảng chương trình đã có nhưng thiếu tìm kiếm/lọc chương trình không dấu, duyệt nhiều chương trình còn khó), rà soát tràn và focus tại viewport hẹp, không thêm tính năng giả.
- Tiếp tục các hạng mục ưu tiên: tìm chương trình EPG theo tên/kênh/chủ đề; tự cập nhật nhóm khi XMLTV/M3U thay đổi trong máy, không cần nhấn; mở nhiều chủ đề cho kênh; xử lý nhãn không rõ; gợi ý dựa trên hành vi có đồng ý. Mỗi vòng mới phải có commit/version, test, screenshot Electron before/after đã MỞ và báo cáo riêng.
- Trước mỗi lần ghi mới: kiểm tra HEAD, version, CI, policy release mới nhất, `expected_sha`, `force:false`. Không tự tạo tag hay di chuyển release cũ.
- Không có kiểm thử phát IPTV nguồn thực / GPU / DVR / Cast trên thiết bị.

**ĐIỂM PHỤC HỒI:** Tại thời điểm tạo nhật ký, sản phẩm mã mới nhất P5.1.273 / package 4.23.358 (release Actions-only); bắt đầu vòng 03 từ HEAD Positron mới nhất sau khi xác minh.

## Đợt mới từ tệp đính kèm 23/11/2026 — tiếp tục sau P5.1.273

Quy tắc áp dụng: chỉ nhánh `Positron`; **Stable-only GitHub Releases** (Positron dùng Actions artifacts, release job `if: false`); không force-push, không tính lại P272/P273 vào đợt này. Đây là đợt **MỚI** so với phần nhật ký lịch sử ở trên.

### Vòng 01/20 — P5.1.274 (4.23.359) — ĐÃ QA, Actions-only
- Tính năng NEW/BREAKTHROUGH: tìm chương trình XMLTV theo tên, tên kênh và chủ đề, có/không dấu; khử trùng giữa các thư mục và không tự phát.
- Commit chính `78d1a920cd1983e4e831e771e951482dba12f03e`; commit sửa assert CI Stable-only `2cc486dbd0f40ecfdd93587d7b357355003dfffe`.
- CI thành công: https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324 — 987 test, 982 pass, 5 skip, 0 fail; Electron screenshot job, Win Setup/Portable x64, Mac arm64/x64 đều xanh; Release skipped theo chính sách Stable-only.
- Ảnh Electron thật đã tải VÀ MỞ: `p5-20-rounds/positron-p51274-programme-search-before-1920x1080-real.png` và `p5-20-rounds/positron-p51274-programme-search-after-1920x1080-real.png`; input BONG DA, 1 kết quả, vẫn focus, không autoplay/overflow.
- Ảnh/QA Actions artifact: https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324/artifacts/14780949594
- Windows x64: https://github.com/trisanghy/open-iptv-pro/actions/runs/45092120324/artifacts/14781816591

### Vòng 02/20 — P5.1.275 (4.23.360) — ĐÃ QA, Actions-only
- Tính năng NEW/BREAKTHROUGH: chỉ mục EPG được tái dùng giữa các lần render, nút **Quét lại EPG**, tự làm mới khi playlist/EPG có thay đổi nhận diện được, và giữ trạng thái thư mục đã mở/đóng; bỏ trạng thái health của kênh khỏi khóa làm mới.
- Commit tính năng `b4af68fc4e65b68e21de79c9ce7bfc826077d1f3`; hai commit hoàn thiện `14a16db02fb795cbe0922272a457d66e03cef8b5` và `67aabf3c2c0b34aadafea78f3e01dfd29c0dd43c`.
- CI hoàn tất trên SHA mã nguồn cuối `67aabf3c2c0b34aadafea78f3e01dfd29c0dd43c`: https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205 — 988 tests, 983 pass, 5 skip, 0 fail; capture Electron, Win Setup/Portable x64, Mac arm64/x64 success, Release skipped đúng Stable-only.
- Bằng chứng Electron thật **ĐÃ TẢI VÀ MỞ SOÁT**: `positron-p51275-index-before-1920x1080-real.png` và `positron-p51275-index-after-1920x1080-real.png`; 1920x1080. QA: `cached=true`, `keptClosed=true`, `button=true`, nhấn quét lại tạo lượt scan mới, giao diện đổi thông báo sang `Đã quét lại từ EPG trên máy`, focus đúng nút, không tràn ngang. Bộ ảnh: https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14782238501 ; Windows x64: https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14782820842 ; Mac ARM: https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14782572050 ; Mac Intel: https://github.com/trisanghy/open-iptv-pro/actions/runs/45093436205/artifacts/14781829450
- **Tiến độ thực: 02/20 vòng hoàn thành và đã mở ảnh Electron, còn 18 vòng**. Không tạo Release thử nghiệm. Giới hạn: cache RAM không tồn tại sau khi thoát ứng dụng, chưa test nguồn/live stream thật.

### Vòng 03–20 của đợt 23/11 — CHƯA BẮT ĐẦU
- Không đánh dấu thêm vòng mới khi chưa có đủ thay đổi mã, test, PNG Electron đã mở, version/commit và bằng chứng riêng.
- Đầu vào vòng 03 từ ảnh P275: popover hover kênh `Xem trước (không tiếng)` xuất hiện màu trắng với khung video đen khi không có stream trong fixture, che vùng player. Cần kiểm tra nguồn và điều kiện hiển thị preview trước khi sửa; không kết luận stream thực lỗi chỉ từ fixture. Ưu tiên tiếp theo khác: chỉ mục bền giữa lần mở ứng dụng mà không lưu URL stream hoặc lịch sử; quản lý mô hình học máy, tinh giản nút AI và kiểm chứng đa nhãn EPG.
- Khi tiếp nối: xác minh HEAD/version mới nhất, ảnh và trạng thái Actions trước. Không tái bật Release prerelease, không chạm main/nhánh khác.
