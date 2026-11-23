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

## 02/20 — P5.1.317 / Electron 4.23.402 — CANDIDATE CHỜ MAC ARM64

- AI: đối chiếu tệp backup JSON từ phiên trước trực tiếp với mô hình ML hiện tại sau reload renderer, không cần export lại, không tự restore/ghi đè.
- Commit: `eeec05980f44e61705899200170db442dbd90fc6`.
- Actions: https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736 — Node 1033 pass/5 skipped/0 fail, QA Electron 7/7 đạt, capture success; Windows x64 và Mac Intel thành công. **Mac ARM64 vẫn đang queued tại thời điểm checkpoint, vì vậy CHƯA nhận đủ quy trình 02/20**.
- Ảnh thực 1920x1080 đã tải, MỞ và soát:
  - `positron-p51317-ai-restart-before-1920x1080-real.png`, SHA256 `038a1423f2cd0c96ab8811051dbfdea9feabdf31112e838b901c961cedcb870e`.
  - `positron-p51317-ai-restart-after-1920x1080-real.png`, SHA256 `d2883b1841536f785947d7aa88db5f64c2653ae9e9f3ab059f273dddc6e3e268`.
- Screenshot artifact https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14831040497 ; Win https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829845725 ; Mac Intel https://github.com/trisanghy/open-iptv-pro/actions/runs/45198091736/artifacts/14829302830.

## TIẾP TỤC NGAY KHI ĐỦ BẰNG CHỨNG

1. Xác minh HEAD, version, Actions run `45198091736` và artifact Mac ARM64. Nếu success + ảnh đã mở như ghi trên thì nhận P5.1.317 là **02/20**, còn 18 vòng.
2. Lấy ảnh P317 làm đầu vào cho 03/20; chẩn đoán rằng khi chọn JSON khác trọng số, phần Quản lý mô hình chỉ báo status trong khi chi tiết từng mô hình đang nằm sâu trong Dạy AI. Cân nhắc đưa chẩn đoán read-only 3 thuật toán vào ngay phần Quản lý mô hình; hoặc ưu tiên bug thực tế nghiêm trọng hơn.
3. Khi HEAD/version còn P5.1.317/4.23.402, bản mới tiếp theo là P5.1.318/4.23.403. Mỗi vòng phải có code/test/Electron before-after thực mở xem riêng/commit riêng, expected_sha + force:false, giữ stable-only Releases.
4. Chưa thực hiện vòng 03–20. Không báo đủ 20. CI không kiểm chứng live stream, GPU, audio, DVR hay Cast trên thiết bị thật. Không bịa ảnh/installer.

**Trạng thái ghi checkpoint: 01/20 hoàn tất; 01/20 candidate; 18 vòng chưa thực hiện.**
