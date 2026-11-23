# POSITRON — CHECKPOINT 03/20 VÒNG MỚI (24/11/2026)

## Phạm vi
- Repo: trisanghy/open-iptv-pro; nhánh duy nhất: `Positron`.
- Baseline xác minh: P5.1.323 / 4.23.408, HEAD `557361b9ab74340ca0f2999f1e0912c2c43803db`, Actions 45223486028.
- Tổng đã kiểm chứng: **03/20 vòng mới**. Không tính 17 vòng còn lại là đã làm.
- Phát hành: mọi bản hiện tại là CANDIDATE/experiment; workflow release skip do stable-only; không tạo public release/tag mới.

## Bảng phiên bản đã hoàn thành

| Vòng | Bản | Sửa thật | QA Electron thật | Node | CI | Ảnh và bộ cài |
|---|---|---|---|---|---|---|
| 01 | P5.1.324 / 4.23.409 | Nâng cả năm nút WatchFlow từ 35px lên 44px; giữ một hàng ở 720px | 11/11 QA; mở trực tiếp trước/sau 1920 và sau 720 | 1040 pass, 5 skip, 0 fail | [45230817039](https://github.com/trisanghy/open-iptv-pro/actions/runs/45230817039) | Screenshot artifact 14847601479; Windows 14846867848, mac ARM 14847347482, mac Intel 14847656175 |
| 02 | P5.1.325 / 4.23.410 | Điều hướng ←/→/Home/End giữa 5 chế độ bằng focus-only, không tự kích hoạt Zap | 17/17 QA; mở trực tiếp trước/sau 1920 và sau 720 | 1041 pass, 5 skip, 0 fail | [45234509867](https://github.com/trisanghy/open-iptv-pro/actions/runs/45234509867) | Screenshot artifact 14849585829; Windows 14847874554, mac ARM 14848686619, mac Intel 14849215805 |
| 03 | P5.1.326 / 4.23.411 | Nhãn “(sơ bộ)” cho AI học dưới 10 phản hồi, chú thích aria/tooltip, không sửa mô hình hay điểm | 11/11 QA; mở trực tiếp trước/sau 1920 và sau 720 | 1042 pass, 5 skip, 0 fail | [45236620519](https://github.com/trisanghy/open-iptv-pro/actions/runs/45236620519) | Screenshot artifact 14848624172; Windows 14849572087, mac Intel 14850361986, mac ARM xem Actions 45236620519 |

## Dấu vết Git
- P324 source `e124f3896e7138d39a943fd174fcc05e1ced9290`; QA/version repair `cb28492137a419d7f464e80dd7aa546d8b0027c1`.
- P325 source `cf55aff744d5a96c0241d6138f4395cc8891c0a8`; QA repair `42d8122bac0625985b0944024b22202d1c0c3e85`; workflow repair `4e5008e885b7495ca205411ad0ed02cee7a6d6bc`.
- P326 source `b716cf4039cb9787a0e18201df6b142d5771c610`. Trước khi tiếp tục phải đọc HEAD mới nhất vì có automation cập nhật tài liệu [skip ci] nối tiếp.
- Không force-push; mọi commit dùng expected_sha, force:false.

## Bằng chứng pixel SHA256
- P324 after desktop: b53491af69617b672f6f8ce16b7a7640d154debd820ce4c164e0f344d69c7ee9; after 720: c736a8f6fa3070c30df82b50bc7dd96ae937aa36e54c44a11d8b8b2f50503188.
- P325 after desktop: ce7c5ba3a4b7972e04ac61e8722a81248bd52a9e7ba9d4ddf9f70c72052588aa; after 720: beb86d7a0208d6ff770237b5038a250e1b6384cde0e3a8752290d99b6962403f.
- P326 after desktop: 1f206502a18636f5fc39feb630b7f9deaf94d93511a9cb2d11cd30b07c7f83d8; after 720: 33b05fc1a6d9efa8dc28e6a6696ffecfa602ecee45b5719af76069db89c89599.
- JSON QA trong từng screenshot artifact, file `audit-p51324-watchflow-tabs.json`, `audit-p51325-keyboard-modes.json`, `audit-p51326-ai-sample.json`.

## Giới hạn và tiếp tục
- Các screenshot lấy từ ứng dụng Electron thật bằng Xvfb/CDP, với nguồn kênh QA cục bộ hợp pháp (`example.invalid`) nên **không** chứng minh live stream, GPU, audio, Timeshift, DVR hay Cast trên thiết bị vật lý.
- 17 vòng NN=04–20 **chưa** được thực hiện, không nhận là phiên bản đã sửa.
- Vòng 04 phải lấy ảnh thật P326 làm đầu vào, đánh giá lỗi/feature thực chất; nếu không có lỗi phù hợp thì không tăng version hình thức.
- Tiếp tục từ nhãn sản phẩm P5.1.326 / SemVer 4.23.411, kiểm tra HEAD nhánh `Positron` trực tiếp trước sửa; mỗi vòng mới có source + test + ảnh thật được MỞ soát + commit/nhãn riêng. Không sửa nhánh khác hoặc ghi đè tag/release.
