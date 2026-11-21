# Positron — Nhật ký tính năng và thay đổi Git bằng tiếng Việt

Toàn bộ tiêu đề và mô tả phiên bản trên trang Positron được hiển thị bằng tiếng Việt. Mỗi phiên bản là một dòng mở rộng để xem nội dung đã thay đổi, ảnh chụp Electron thật, trạng thái kiểm thử, commit gốc và tệp cài đặt (nếu có).

- **[Mở nhật ký phiên bản trên GitHub](FEATURES.md)** — danh sách tự cập nhật, bấm từng dòng để xem chi tiết.
- **[Mở nhật ký thay đổi Git bằng tiếng Việt](LOG_GIT_TIENG_VIET.md)** — diễn giải phiên bản và liên kết commit gốc, không thay đổi SHA hay lịch sử.
- **[Xem giao diện trang HTML](index.html)** — trang có lọc/tìm kiếm; bản đóng gói HTML tải ở GitHub Actions.
- **[Bản dịch chính xác theo phiên bản](vi.json)** — dữ liệu Việt hóa có thể bổ sung, đối chiếu với changelog và Release gốc.
- **[Quy tắc bắt buộc](../../POSITRON_FEATURE_RULES.md)** — ưu tiên tính năng mới; các mô tả, ghi chú và commit mới viết bằng tiếng Việt.

Mã nguồn trình tạo: `scripts/build-positron-feature-site.py`. Quy trình cập nhật: `.github/workflows/positron-feature-pages.yml`. Workflow tải GitHub Releases thật, ghép ảnh PNG từ gói kiểm thử Electron đúng phiên bản và cập nhật bảng GitHub mà không force-push. Nếu chưa có ảnh riêng hoặc chưa xuất bản Release, trang phải ghi rõ trạng thái.

**Giới hạn GitHub Pages:** môi trường hiện chỉ cho phép triển khai từ nhánh `web/online`. Không thay đổi trang Web đó. Bản nhật ký GitHub trên nhánh `Positron` hoạt động độc lập; Pages chỉ được bật khi có môi trường riêng được chủ sở hữu cho phép.

**Lưu ý về lịch sử:** GitHub không cho đổi ngôn ngữ các thông điệp commit cũ mà vẫn giữ nguyên SHA. Vì vậy trang Việt hóa diễn giải commit, giữ liên kết và bằng chứng gốc; các thông điệp commit mới từ workflow dùng tiếng Việt.
