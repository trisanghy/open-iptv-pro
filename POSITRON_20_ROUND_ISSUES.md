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
