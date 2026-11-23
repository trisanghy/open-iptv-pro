# Positron — checkpoint 20 vòng mới (23/11/2026)

Baseline: HEAD `95c1e1682c01cdc1820b60dfcd4bf929d0dbd05b`, P5.1.278 / v4.23.363.
CI gốc: https://github.com/trisanghy/open-iptv-pro/actions/runs/45100262588 — 985 pass / 1 fail / 5 skipped. Test P272 còn kiểm chuỗi DOM cũ, P278 đã bọc danh sách vào disclosure riêng.
Ảnh Electron baseline đã trực tiếp mở: `positron-p51277-active-teach-after-1920x1080-real.png` (Actions 45099187436); P278 chưa chụp vì test thất bại.

Vòng 01 dự kiến P5.1.279:
- Mục tiêu: không tự thu danh sách kênh chưa phân loại khi giao diện AI render lại; sửa regression test cũ, vẫn giữ kiểm tra danh sách kênh.
- Source: renderer/positron-intelligence.js; tests/positron-intelligence.test.cjs; scripts/positron-20-extension.cjs.
- Test Electron mới: mở danh sách con, gọi render lại, kiểm tra parent và child vẫn open, không quét lại, không tự phát, playlist không đổi.
- Ảnh cần xác minh: `positron-p51279-folders-persist-before-1920x1080-real.png` / after.
- Trạng thái: **CHƯA ĐẠT** cho tới khi CI và ảnh Electron được tải, MỞ xem trực tiếp.
- Không có kết luận về stream/GPU/DVR/Cast trên máy thật.

## Đợt mới từ P5.1.279 — 23/11/2026
- Baseline đã xác minh: HEAD 03cb3e724ebc7032132466d7b4bfa031d50e0ebe; P5.1.279 v4.23.364; Actions 45101613049 có test/capture/Win x64/Mac ARM/x64 thành công, release skip theo Stable-only.
- Ảnh thật đã tải và trực tiếp MỞ: positron-p51279-folders-persist-before-1920x1080-real.png, positron-p51279-folders-persist-after-1920x1080-real.png. Danh sách con giữ open sau render; phần Dạy AI ở nhóm chưa phân loại đang hiển thị năm ứng viên.
- Vòng 01 dự kiến P5.1.280: khắc phục giới hạn Bỏ qua chạy vòng lặp năm ứng viên; thêm hàng đợi không lặp qua nhiều hơn năm kênh, khôi phục bỏ qua trong phiên. Không cập nhật mô hình khi bỏ qua, không đổi M3U và không tự phát.
- Bằng chứng phải có: Node regression, trước/sau Electron 1920x1080 mới, mở trực tiếp ảnh sau, commit SHA, Actions/Artifacts. Trạng thái CHƯA ĐẠT cho đến khi kiểm chứng đầy đủ.

### CI repair P5.1.280
- Run 45105567504: 993 tests, 972 pass / 16 fail / 5 skipped. Blocker: 4.23.364 vẫn còn trong title HTML, Windows launcher và workflow build/tag, đồng thời workflow trỏ sai ảnh P280 folders-persist thay vì ảnh P279 và chưa kiểm chứng cặp P280 active-queue.
- Khắc phục trên cùng nhãn P5.1.280, không tính phiên bản/vòng mới; giữ test nghiêm ngặt, không bỏ assertion. Chỉ tính vòng khi CI và ảnh thật đạt.
