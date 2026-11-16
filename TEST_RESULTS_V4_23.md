# Kiểm thử Open IPTV Pro 4.23.0 · Smart Discovery + Doctor 3.0

- `npm test` trên Node.js 22.16.0: **106/106 đạt**, 0 fail, 0 skipped.
- Toàn bộ JavaScript/CJS: `node --check` đạt.
- HTML: 232 `id` duy nhất, đủ nút và trang Smart Discovery, Doctor 3.0.
- Test logic danh mục quốc gia, định dạng M3U, chuyển hướng độc hại, IP nội bộ, giới hạn dung lượng.
- Test điểm xếp hạng Doctor 3.0, đối chiếu `tvg-id`, chặn đề xuất thiếu bằng chứng và đề xuất link dự phòng có kiểm soát.
- Test thao tác giả lập: chỉ nhập kênh đã xác minh; bảo toàn bằng chứng; thêm link dự phòng khi xác nhận, hoàn tác khi cần.
- Xếp hạng 5.000 kênh trong khoảng vài chục ms trên môi trường kiểm thử (không phải benchmark chung cho các máy).
- **Chưa chạy bộ cài Electron đã đóng gói trên Windows/macOS**, chưa xác minh trực tiếp link IPTV thật theo mạng cụ thể và chưa push lên GitHub.
