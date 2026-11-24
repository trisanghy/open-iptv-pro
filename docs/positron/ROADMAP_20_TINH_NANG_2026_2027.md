# Roadmap Positron-only — 20 tính năng IPTV nâng cao
Ngày lập: 2026-11-24 (Asia/Bangkok). Tình trạng: KẾ HOẠCH — chưa triển khai các tính năng trong bảng này.

## Phạm vi bất biến
- Repo: `trisanghy/open-iptv-pro`.
- **Nhánh duy nhất được phép push: `Positron`**, mọi thao tác ghi phải kiểm tra HEAD+expected SHA, `force=false`. Trước mỗi tác vụ xác nhận branch hiện tại. Không tạo PR hoặc merge sang nhánh khác.
- **CẤM đụng** `main`, `web/online`, `build-sources/electron-desktop`, `experiment/rust-tauri-v2`, nhánh Tizen, Capacitor/iOS/Android hoặc bất kỳ nhánh nào khác.
- Các chức năng “đa thiết bị” chỉ thực hiện dưới dạng thành phần của desktop Positron, giao diện companion do Positron tự phục vụ, giao tiếp giữa nhiều instance Positron, hoặc backend tùy chọn đặt trong Positron. **Không tự động sửa ứng dụng TV, Web hay iPhone**. Tính năng cần app khác phải được coi là giới hạn phạm vi, không lén mở rộng.
- Không nhập playlist/stream/record tự động, không bỏ qua xác nhận nguồn nội dung hợp pháp, không trích xuất token/secret vào log, không public release CANDIDATE, không tag đè, không force-push.
- Theo nguyên tắc **1 feature thật = 1 phiên bản mới + 1 commit có kiểm thử**, nhưng không tăng phiên bản chỉ để đủ chỉ tiêu nếu feature chưa hoạt động. Mốc tham khảo sau baseline P5.1.351 là P5.1.352 đến P5.1.371; nếu HEAD thay đổi thì cấp số phiên bản tuần tự từ thực tế.

## Blocker hiện hữu, không được bỏ qua
- Snapshot branch có package Electron 4.23.436 / P5.1.351 tại thời điểm lập kế hoạch.
- GitHub Actions [P5.1.351](https://github.com/trisanghy/open-iptv-pro/actions/runs/45293649622) **FAIL**: 5 Node tests liên quan version sidebar, title/renderer, bản đóng gói và PowerShell Windows (5/1079 thất bại, 5 skip). Không viết 20 feature mới cho tới khi sửa.
- GitHub Actions [P5.1.350](https://github.com/trisanghy/open-iptv-pro/actions/runs/45290246769) **FAIL capture**: native QA `P350` kỳ vọng playlist 0 nhưng môi trường đã có 561 kênh thử nghiệm. Fix hoặc isolate QA test, tuyệt đối không che lỗi bằng skip.
- **Gate 0:** Node full PASS + Electron native screenshots PASS 1920x1080 và 720x900 + artifact build Windows x64/Mac ARM64/Mac Intel PASS. Release stable vẫn khóa, không tuyên bố phát hành nếu bị skip.

## Lịch mục tiêu — hai tính năng/tuần, một lượt đầu tuần và một lượt giữa tuần
| Khung ngày (Việt Nam) | Giai đoạn | Phạm vi |
|---|---|---|
| 24–27/11/2026 | Ổn định CI P5.1.351 | Sửa 5 regression về phiên bản/UI/installer; xử lý QA P350 playlist giả; xác nhận build/capture/ảnh thật; không coi đạt nếu CI đỏ. |
| 30/11–04/12/2026 | Luồng phát I | (20) Stream Diagnostics Studio; (4) Self-Healing Playback |
| 07–11/12/2026 | Luồng phát II | (5) Smart Quality Engine; (3) Predictive FastZap |
| 14–18/12/2026 | AI + EPG I | (12) AI Auto EPG Repair; (11) WatchFlow AI Search |
| 21–25/12/2026 | AI + EPG II | (14) AI Programme Assistant; (15) AI Viewing Scheduler |
| 28/12/2026–01/01/2027 | Xem đa luồng | (1) Smart MultiView; (2) Connection Multiplexing |
| 04–08/01/2027 | DVR I | (6) Home DVR Server; (7) Smart DVR Rules |
| 11–15/01/2027 | Thư viện cá nhân | (9) Virtual Channels; (10) Smart Chapters / Skip Intro |
| 18–22/01/2027 | Bảo mật & quản trị | (18) Family Profiles & Parental PIN; (19) Cloud Control Center |
| 25–29/01/2027 | Kết nối phiên xem | (16) TV Pairing bằng QR; (17) Seamless Handoff |
| 01–05/02/2027 | DVR + AI nâng cao | (8) Cross-device Timeshift; (13) AI Live Recap |
| 08–12/02/2027 | Hệ thống hóa / dự phòng | Kiểm thử luồng thực được cấp quyền, soak test, benchmark, phân tích hiệu năng, kiểm tra restore/rollback và chốt 20 feature gates. |

Đây là **lịch mục tiêu, phụ thuộc chất lượng**: khi một gate thất bại, ưu tiên sửa rồi mới chuyển sang feature kế tiếp, báo rõ số mục chưa đạt; lịch có thể dịch sang phải. Lượt dự phòng 08–12/02/2027 dành cho tích hợp và đẩy backlog. Không gắn deadline với release tự động.

## Đặc tả 20 mục theo thứ tự phụ thuộc
- [ ] **Lượt 01/20 — #20 Stream Diagnostics Studio**: HTTP/HLS/DASH, codec, thời gian mở kênh, rebuffer, lỗi âm thanh; báo cáo không chứa URL/token nhạy cảm.
- [ ] **Lượt 02/20 — #4 Self-Healing Playback**: Retry giới hạn, backoff, fallback có kiểm chứng và log; không vòng lặp phát lại.
- [ ] **Lượt 03/20 — #5 Smart Quality Engine**: Chọn buffer/decoder/chất lượng dựa trên metrics; mặc định bảo toàn cấu hình cũ.
- [ ] **Lượt 04/20 — #3 Predictive FastZap**: Cache metadata/engine hints; không preload stream không được cho phép.
- [ ] **Lượt 05/20 — #12 AI Auto EPG Repair**: Fuzzy match + confidence threshold + undo; không tự gán khi mơ hồ.
- [ ] **Lượt 06/20 — #11 WatchFlow AI Search**: Tìm tiếng Việt tự nhiên dựa trên EPG/thư viện cục bộ; trả nguồn và không bịa lịch.
- [ ] **Lượt 07/20 — #14 AI Programme Assistant**: Metadata đã xác minh, phân biệt dữ liệu thực và dự đoán.
- [ ] **Lượt 08/20 — #15 AI Viewing Scheduler**: Đề xuất nhắc/ghi opt-in, không phát tự động hoặc ghi khi chưa đồng ý.
- [ ] **Lượt 09/20 — #1 Smart MultiView**: 2/4/9 view tùy GPU, giới hạn nguồn/codec; test tải & âm thanh từng ô.
- [ ] **Lượt 10/20 — #2 Connection Multiplexing**: Chỉ khi server và giao thức hỗ trợ; không dùng chung auth trái quyền hoặc tăng tải bất thường.
- [ ] **Lượt 11/20 — #6 Home DVR Server**: Dịch vụ riêng chạy trong Positron, bind localhost mặc định, lưu bản ghi có quyền; lịch hoạt động sau khi tắt cửa sổ chỉ khi user bật.
- [ ] **Lượt 12/20 — #7 Smart DVR Rules**: Series rules, duplicate detection, xung đột; kiểm tra dung lượng và quyền ghi.
- [ ] **Lượt 13/20 — #9 Virtual Channels**: Lịch phát ảo từ bản ghi/thư viện do người dùng sở hữu; không giả mạo EPG công cộng.
- [ ] **Lượt 14/20 — #10 Smart Chapters / Skip Intro**: Phân đoạn trong bản ghi; nút đề xuất bỏ qua có thể hoàn tác.
- [ ] **Lượt 15/20 — #18 Family Profiles & Parental PIN**: Profile tách dữ liệu, PIN hash+rate-limit, không thay đổi hồ sơ ngoài ý muốn.
- [ ] **Lượt 16/20 — #19 Cloud Control Center**: Trang quản lý nằm trong Positron, local-first; cloud opt-in, xác thực quyền, không ghi dữ liệu ngoài khi chưa cho phép.
- [ ] **Lượt 17/20 — #16 TV Pairing bằng QR**: QR pairing giữa các phiên Positron hoặc companion do Positron tự phục vụ; không thay đổi Tizen/iOS/Web của repo.
- [ ] **Lượt 18/20 — #17 Seamless Handoff**: Handoff giữa các phiên/instance Positron được ghép; thiết bị không chạy Positron nằm ngoài phạm vi.
- [ ] **Lượt 19/20 — #8 Cross-device Timeshift**: Chia sẻ buffer qua Home DVR Server giữa các instance Positron, bảo vệ LAN, quyền truy cập và thời gian lưu.
- [ ] **Lượt 20/20 — #13 AI Live Recap**: Tóm tắt từ bản ghi/phụ đề được cấp phép, riêng tư, opt-in, có độ trễ và giới hạn dữ liệu.

## Tiêu chí hoàn tất áp dụng cho từng mục
1. Scope git chỉ thay đổi nội dung của `Positron`; GitHub head `main` và các nhánh khác không nhận commit.
2. Tính năng mới thực sự hoạt động trong Positron (không chỉ nút/placeholder). Toggle để người dùng bật, có fallback khi không hỗ trợ.
3. Unit/integration/regression + native Electron 1920x1080 và 720x900, ảnh **before/after thật**, audit JSON + hash SHA256; kiểm tra ảnh đầu ra thực, không sinh ảnh giả.
4. CI test/capture/build Windows x64, Mac x64, Mac ARM64 PASS; không xem CANDIDATE là hoàn tất nếu full CI fail.
5. Không mất playlist, EPG, Favorites, Timeshift, DVR, Cast, Caption/TTS/AI hiện có; không autoplay khi chưa có tác động người dùng; bảo mật và quyền riêng tư nguyên vẹn.
6. Changelog, commit và báo cáo gồm feature, version, SHA, test, ảnh, URLs workflow, blockers/trạng thái.
7. Mọi dịch vụ mạng/điện thoại/TV không phải Positron chỉ là phần giao thức tương thích tùy chọn; **không cần và không được thay đổi bất kỳ nhánh ứng dụng khác**.

## Quy tắc tự dừng
- Nếu gặp blocker quyền truy cập, thiếu thiết bị/nguồn stream có quyền, không thể test thành thật, hoặc xung đột concurrent push: **không được ghi PASS giả**; dừng feature đó, báo blocker, giữ source như cũ.
- Không tự tạo nguồn IPTV không được cấp phép; không vượt cơ chế bảo vệ.
- Chỉ tiếp tục các mục chưa hoàn tất và chỉ khi baseline CI xanh.