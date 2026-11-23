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

## CHECKPOINT ĐỢT MỚI — 2026-11-23 — 01/20 ĐÃ HOÀN THÀNH
- Nền ban đầu: P5.1.279 v4.23.364, HEAD 03cb3e724ebc7032132466d7b4bfa031d50e0ebe.
- Vòng 01/20 P5.1.280 v4.23.365: GitHub commits ba5cd38ab8378a6c2712d06ca962c21579527d43 (tính năng) và f6758a23b4888f8603ab9df8376d9c4c9bc2a39e (fix đồng bộ version/workflow); không tạo release thử nghiệm vì chính sách Stable-only.
- Actions build & capture: https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336 — SUCCESS: 988 tests passed, 5 skipped, 0 failed; job capture Electron success; Windows x64, Mac arm64, Mac x64 builds success, release skipped theo chính sách.
- Artifacts: Windows x64 14787043326; Mac arm64 14787382799; Mac x64 14786464917; Electron screenshots 14786983727. GitHub screenshot link https://github.com/trisanghy/open-iptv-pro/actions/runs/45105835336/artifacts/14786983727.
- Ảnh thật đã trực tiếp MỞ/soát trong chat: positron-p51280-active-queue-before-1920x1080-real.png và positron-p51280-active-queue-after-1920x1080-real.png. Vì môi trường mở ZIP cục bộ lỗi, workflow bridge 45107410299 xuất nguyên PNG qua GitHub Actions log để mở và xem trực tiếp. Trong ảnh SAU: “6 đã bỏ qua trong phiên”, nút “Xem lại 6 kênh đã bỏ qua”, có đề xuất kênh tiếp theo, không quan sát thấy nút/nhãn bị chồng hay cắt tại vùng sửa. Đây là 01 vòng đầy đủ; KHÔNG đếm 20.
- Chưa làm Vòng 02. Quan sát tiếp từ ảnh P280: Khi người xem dạy một nhãn sai bằng Ghi nhãn & tiếp, ứng dụng thiếu hoàn tác riêng, chỉ quản lý xóa toàn mô hình. Ưu tiên kế tiếp P5.1.281 là thêm Undo nhãn AI cuối cùng bằng snapshot mô hình + taughtIds trong phiên, thử khôi phục chính xác mô hình có dữ liệu cũ, không tự phát/đổi M3U; yêu cầu Node+Electron before/after/undo, xem ảnh, build và version riêng. KHÔNG tuyên bố P281 đã được commit.
- Chỉ sửa nhánh Positron; trước mỗi lần làm lại kiểm tra HEAD mới nhất vì bot tài liệu có thể tự commit; dùng expected_sha và force:false. Không sửa main/nhánh khác và không xuất các candidate lên GitHub Releases.

## Đợt mới tiếp nhận tệp 23/11/2026 11:50 +07
- HEAD baseline bd565c29a3020739f47ea3198fb72dcbf1c03bdb, P5.1.283 / 4.23.368; Actions 45113392896 thành công (test, capture, Win x64, Mac x64/arm64). Release skipped theo Stable-only.
- Đã TẢI và MỞ hai PNG Electron thật P283 trước/sau từ artifact 14791140087; không thấy chồng nút tại khu vực vừa thêm.
- Vòng đầu P5.1.284: xuất JSON của ba thuật toán học AI riêng, không xuất dữ liệu M3U, URL hoặc ID kênh; test chống rò rỉ và QA before/after. Trạng thái CHƯA ĐẠT cho tới khi build + mở ảnh sau.

## Vòng 01/20 P5.1.284 — ĐẠT (23/11/2026)
- Commit tính năng 40a2e226441378a244dcb824cc531211eb51fbe4; QA fix d5abf87d0b11598197089f71c865e568bb17625e. CI 45116563561: 992 pass, 5 skipped, 0 fail, capture và Win/Mac builds success.
- Bộ ảnh thật artifact 14792206663 đã tải, mở và soát TRƯỚC/SAU; nội dung thông báo sao lưu xuất hiện, không tràn/chồng trong vùng quản lý. Dữ liệu M3U, playback, ML storage bất biến.
- Vòng 02/20 — P5.1.285 từ ảnh P284: chưa có nút khôi phục, cần xem trước và xác nhận trước khi ghi trọng số, không ảnh hưởng dữ liệu kênh.
