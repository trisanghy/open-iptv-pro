# OPEN IPTV PRO — POSITRON: CHECKPOINT ĐỢT 20 VÒNG MỚI NGÀY 23/11/2026

> Checkpoint trung thực cho đợt mới bắt đầu từ Positron P5.1.312 (Electron 4.23.397); không nhập nhằng với các vòng 20/50 lịch sử. Đã chứng minh **03/20 vòng**. Còn **17 vòng chưa thực hiện** (04–20). Không được tự nâng số vòng hay nhận chạy nền.

## Giới hạn nhánh và phát hành

- Repo duy nhất: `trisanghy/open-iptv-pro`.
- Chỉ nhánh `Positron`, đúng chữ hoa; không sửa `main`, `build-sources/electron-desktop`, `web/online`, Rust/Tauri, Mobile.
- Không force push, không sửa tag cũ, luôn kiểm tra HEAD/đối chiếu expected SHA trước ghi.
- GitHub Release stable-only: workflow `.github/workflows/positron-lab.yml` cố ý giữ `release: if: false`. Các bản thử nghiệm chỉ tải qua **Actions artifacts**, không đưa lên danh sách Stable Releases.
- Các ảnh dưới đây chụp từ Electron thực qua CI, được tải về và trực tiếp mở xem; test sử dụng playlist QA tổng hợp, **không xác nhận GPU, luồng IPTV có bản quyền, audio, Cast, DVR, Timeshift trên thiết bị thật**.

## Tiến độ thực tế

| Vòng | Version sản phẩm / app | Thay đổi mã độc lập và tác dụng | Commit tính năng | CI đã chứng minh | Test Node | QA Electron |
| --- | --- | --- | --- | --- | --- | --- |
| 01/20 | P5.1.313 / 4.23.398 | Kiểm chứng tệp JSON sao lưu AI do người dùng chọn lại; đối chiếu trọng số Logistic, Naive Bayes, UCB; không tự khôi phục hay thay playlist | `ca14956cea49fa5be4512833839e62838089f107` (sửa hồi quy `69a69484`, `226ca7f7`) | [45188159339](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339) — success | 1026 pass, 5 skipped, 0 fail | qa313: 9/9 |
| 02/20 | P5.1.314 / 4.23.399 | Đối chiếu ba thuật toán riêng; báo mô hình nào khác, số phản hồi/nhãn/chủ đề; cảnh báo dễ nhận biết | `8802294395ad6c797949d61cae2cedc0e038e8ba` | [45190345582](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582) — success | 1030 pass, 5 skipped, 0 fail | qa314: 9/9 |
| 03/20 | P5.1.315 / 4.23.400 | So sánh trọng số theo nội dung, không phụ thuộc thứ tự khóa JSON; vẫn phát hiện số liệu thay đổi thật | `86b7954ec4ae9279579dd6eaa9f6e4eed70be109` | [45192777758](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758) — success | 1031 pass, 5 skipped, 0 fail | qa315: 9/9 |

### Bằng chứng ảnh Electron chính xác

- P313 trước: `positron-p51313-ai-backup-verify-before-1920x1080-real.png`; sau: `positron-p51313-ai-backup-verify-after-1920x1080-real.png`; ZIP Actions [14824827771](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339/artifacts/14824827771).
- P314 trước: `positron-p51314-ai-model-diff-before-1920x1080-real.png`; sau: `positron-p51314-ai-model-diff-after-1920x1080-real.png`; ZIP Actions [14826252046](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582/artifacts/14826252046).
- P315 trước: `positron-p51315-ai-key-order-before-1920x1080-real.png`; sau: `positron-p51315-ai-key-order-after-1920x1080-real.png`; ZIP Actions [14826543363](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758/artifacts/14826543363).
- 6 PNG chính đều từ Electron thật, 1920×1080, đã mở bằng công cụ nhìn ảnh, nhìn thấy thông báo, bố cục, chữ/nút, không tràn ngang. QA JSON chứa các điều kiện trực tiếp về localStorage, playlist và auto-play. Mỗi vòng đều có ảnh trước và sau riêng, code/test/version/commit riêng.
- Các bản cài tương ứng trong Actions: P313 [Win x64](https://github.com/trisanghy/open-iptv-pro/actions/runs/45188159339/artifacts/14824507938); P314 [Win x64](https://github.com/trisanghy/open-iptv-pro/actions/runs/45190345582/artifacts/14825442744); P315 [Win x64](https://github.com/trisanghy/open-iptv-pro/actions/runs/45192777758/artifacts/14826024180). Cả 3 run build Mac ARM64 và Intel đều thành công.

## Đầu vào kế tiếp — vòng 04/20

1. Xác minh HEAD mới nhất của `Positron`, `package.json`, changelog, workflow và Actions. P5.1.315 / 4.23.400 chỉ là mốc checkpoint; nếu ai đó đã nâng version thì tiếp tục từ mốc mới, không ghi đè.
2. Mở ảnh cuối P315 (ở ZIP 14826543363) và xem trực tiếp khi quyết định sửa tiếp. Ảnh đã thấy phản hồi JSON đúng, nhưng vẫn có những vùng chữ nhỏ và quy trình kiểm chứng bản sao chỉ hoạt động khi chưa khởi động lại ứng dụng.
3. Ưu tiên cân nhắc: kiểm tra JSON sao lưu cũ sau khi mở lại app bằng **so sánh với mô hình AI hiện tại**, với giải thích rõ khác gì và không tự nhập; hoặc ưu tiên lỗi ảnh hưởng người dùng hơn nếu QA mới chỉ ra. Không được lặp lại tính năng P313–P315 chỉ để đủ số vòng.
4. Nếu tiếp tục từ P5.1.315 thì bản kế là **P5.1.316 / SemVer 4.23.401**, nhưng chỉ khi còn trống và đã làm test/ảnh. Từng vòng 04–20 phải có lỗi/tính năng có thực, mã/test/QA Electron/ảnh được MỞ SOÁT, commit SHA và bản vá nối tiếp, không gộp.
5. Trước mỗi push kiểm tra HEAD và dùng `expected_sha`, `force:false`; không ảnh giả, không đánh dấu vòng khi còn thiếu bằng chứng.
6. Khi có trục trặc, báo blocker chính xác và tạo checkpoint tiếp; không tuyên bố đã hoàn thành 20 vòng khi mới có 3.

### Mã quan trọng

`renderer/positron-intelligence-core.js`, `renderer/positron-intelligence.js`, `renderer/positron-intelligence.css`, `tests/positron-intelligence.test.cjs`, `scripts/positron-20-extension.cjs`, `renderer/positron.js`, `package.json`, `.github/workflows/positron-lab.yml`, `POSITRON_P5_CHANGELOG.md`.

**Sự thật:** 03/20 vòng mới hoàn thành. Không chạy nền. 17 vòng còn lại chưa được thực hiện trong lượt này.
