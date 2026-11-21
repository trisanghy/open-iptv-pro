# POSITRON · Đợt 20 vòng mới từ ngày 22/11/2026 (06:40 ICT)

- Chỉ nhánh Positron, repository `trisanghy/open-iptv-pro`; không chạm main hay các nhánh Electron, Rust, Web, Mobile.
- Baseline thực tế tại đầu đợt: HEAD `039e1bc6e639b38d8252f717d4d745350e6b730a`, P5.1.148 / Electron 4.23.232. Release https://github.com/trisanghy/open-iptv-pro/releases/tag/positron/v4.23.232-p5.1.148
- Đã tải và MỞ ẢNH THẬT `positron-p51148-cancel-reminder-after-450-real.png` từ CI 44960229561. Phát hiện UX: chỉ có nút nhắc 10 phút mặc định, chưa tùy chỉnh được.
- Vòng 01/20: candidate P5.1.149 / 4.23.233, nhắc 5/10/15/30 phút, cần xác minh CI, ảnh sau và Release trước khi đếm hoàn tất.
- Vòng 02–20: CHƯA BẮT ĐẦU. Chỉ làm sau khi nhìn ảnh/QA vòng 01.
- Quy tắc: mỗi vòng cần sửa thật, unit + native QA, screenshot Electron trước/sau, mở ảnh, commit/tag bất biến, Windows x64 + macOS install và checkpoint. 70 ảnh scenario CI không phải 20 vòng nâng cấp.
