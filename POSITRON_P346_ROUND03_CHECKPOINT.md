# Positron P5.1.346 — candidate vòng 03/20 (24/11/2026)
- Input: ĐÃ MỞ ảnh thật P345 ở 720x900 và desktop; mở guide che mất phần mô tả dưới, dù cuộn vẫn được; Esc đóng guide trước giúp remote quay lại nhanh.
- Thay đổi: renderer/positron-intelligence.js: Esc trong native details thu gọn, trả focus về summary, không đóng modal; hideAI reset trạng thái help.
- Test: scripts/positron-346-audit.cjs bốn ảnh Electron before/after, tests/positron-346.test.cjs, đo panel/focus/noOverflow/source/player/model, Enter/F6 regression.
- Tình trạng: Chưa tính thành công trước khi CI và PNG after được trực tiếp mở soát. Các vòng 04–20 chưa thực hiện.
- Không force push, tag/release bất biến, Stable-only public.
