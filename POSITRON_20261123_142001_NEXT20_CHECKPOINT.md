# POSITRON — CHECKPOINT ĐỢT 20 VÒNG MỚI NGÀY 23/11/2026 (FILE 14:20:01)

> Đợt mới **bắt đầu sau P5.1.315**; không tính P313/P314/P315 là 3 vòng của đợt này. Chỉ nhánh `Positron`, repo `trisanghy/open-iptv-pro`. Không đụng main/Web/Rust/Mobile/Electron ổn định, không force push.

## 01/20 — P5.1.316 / Electron 4.23.401 — ĐÃ CHỨNG MINH

- AI: khi đối chiếu bản sao JSON, đếm số trường dữ liệu học khác nhau theo Logistic/Naive Bayes/UCB mà không làm lộ token/tên đặc trưng; không tính hoán vị thứ tự khóa JSON là sai lệch.
- Commits: `e0e2724f904de9f7ab1e38230d1e6d53edbb6fd5` + sửa hồi quy version/CI `c1be9763d008260f3b3445b2d8593a4d7479b1a5`, `6c4e835fd0a169e8b629d41f44b47cfa63fdd304`.
- Actions: https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544 — success, Node 1032 pass/5 skipped/0 fail, Electron QA316 9/9, Win x64/Mac ARM64/Mac Intel builds success.
- Ảnh Electron thực 1920x1080 tải về, MỞ và soát:
  - `positron-p51316-ai-delta-before-1920x1080-real.png`, SHA256 `83e87101ccd00130537215b6e6bd471cfd7a642929803580a75023d0d5662c8e`.
  - `positron-p51316-ai-delta-after-1920x1080-real.png`, SHA256 `ee31513ac3b5fd97f94cb82f31557a00fb8f4d70782dcbedaabbe8549185a4db`.
- Artifacts screenshot: https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14828477232 ; Win https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827878039 ; Mac ARM https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827661682 ; Mac Intel https://github.com/trisanghy/open-iptv-pro/actions/runs/45196269544/artifacts/14827329285.

## 02/20 — P5.1.317 / Electron 4.23.402 — ĐÃ CHỨNG MINH

- AI: đối chiếu tệp backup JSON từ phiên trước trực tiếp với mô hình ML hiện tại sau reload renderer, không cần export lại, không tự restore/ghi đè.
- Commit: `eeec05980f44e61705899200170db442dbd90fc6`.
- Actions: https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736 — Node 1033 pass/5 skipped/0 fail, QA Electron 7/7 đạt, capture success; Windows x64 và Mac Intel thành công. **Mac ARM64 đã success**; toàn workflow 45198091736 đã completed/success. Đủ quy trình 02/20.
- Ảnh thực 1920x1080 đã tải, MỞ và soát:
  - `positron-p51317-ai-restart-before-1920x1080-real.png`, SHA256 `038a1423f2cd0c96ab8811051dbfdea9feabdf31112e838b901c961cedcb870e`.
  - `positron-p51317-ai-restart-after-1920x1080-real.png`, SHA256 `d2883b1841536f785947d7aa88db5f64c2653ae9e9f3ab059f273dddc6e3e268`.
- Screenshot artifact https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14831040497 ; Win https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829845725 ; Mac Intel https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829302830.

- Mac ARM64: https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14831121482

## 03/20 — P5.1.318 / Electron 4.23.403 — CANDIDATE CHỜ QA ELECTRON / MAC ARM64

- AI: kết quả kiểm chứng JSON khác trọng số được trình bày đủ 3 thuật toán Logistic, Naive Bayes, UCB ngay trong Quản lý mô hình, thay vì chỉ có thể thấy sâu ở luồng Dạy AI. Không cho phép ghi đè hay lộ token.
- Commit: `9d33bcdc18ff9958731996a940262015af7a61a4`.
- Actions run https://github.com/trisanghy/open-iptv-pro/actions/runs/45200800416 : Node 1034 pass/5 skipped/0 fail. Windows x64 và Mac Intel có artifact; capture Electron + Mac ARM64 còn chờ tại checkpoint.
- Ảnh P318 kỳ vọng: `positron-p51318-ai-manager-diff-before-1920x1080-real.png`, `positron-p51318-ai-manager-diff-after-1920x1080-real.png`; không nhận ảnh đã mở nếu chưa tải/soát.
- Sau khi P318 thành công mới tính 03/20; nếu có lỗi, sửa trong cùng phiên bản và rerun CI.

## TIẾP TỤC NGAY KHI ĐỦ BẰNG CHỨNG

1. Xác minh HEAD/version, Actions run `45200800416`, tải và trực tiếp mở ảnh P318. Nếu QA/model manager và toàn build đạt thì nhận P5.1.318 là 03/20.
2. Lấy ảnh P318 làm đầu vào 04/20; chọn lỗi chức năng/UI/AI ưu tiên còn thật, sửa và chứng minh bằng ảnh Electron trước/sau.
3. Khi HEAD/version còn P5.1.318/4.23.403, bản mới tiếp theo là P5.1.319/4.23.404. Mỗi vòng phải có code/test/Electron before-after thực mở xem riêng/commit riêng, expected_sha + force:false, giữ stable-only Releases.
4. Chưa thực hiện vòng 04–20. Không báo đủ 20. CI không kiểm chứng live stream, GPU, audio, DVR hay Cast trên thiết bị thật. Không bịa ảnh/installer.

**Trạng thái cập nhật: 02/20 hoàn tất; 01/20 candidate P318; 17 vòng chưa thực hiện.**
