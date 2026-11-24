# Positron — Nhật ký tính năng và thay đổi Git bằng tiếng Việt

Toàn bộ tiêu đề và mô tả phiên bản trên trang Positron được hiển thị bằng tiếng Việt. Mỗi phiên bản là một dòng mở rộng để xem nội dung đã thay đổi, ảnh chụp Electron thật, trạng thái kiểm thử, commit gốc và tệp cài đặt (nếu có).

- **[Mở nhật ký phiên bản trên GitHub](FEATURES.md)** — danh sách tự cập nhật, bấm từng dòng để xem chi tiết.
- **[Mở nhật ký thay đổi Git bằng tiếng Việt](LOG_GIT_TIENG_VIET.md)** — diễn giải phiên bản và liên kết commit gốc, không thay đổi SHA hay lịch sử.
- **[Mở WEBSITE changelog tương tác](https://raw.githack.com/trisanghy/open-iptv-pro/Positron/docs/positron-features/index.html)** — xem từng phiên bản, lọc/tìm kiếm, mở ảnh Electron thật, tải EXE. Đây là bản xem trước HTML công khai qua GitHack, không thay đổi GitHub Pages đang phục vụ `web/online`. Nếu trang trung gian hiện thông báo an toàn, cần xác nhận để tiếp tục.
- **[Mở mã HTML trong repository](index.html)** — nguồn trang và bản đóng gói từ GitHub Actions; [bản GitHub tương tác](FEATURES.md) hoạt động ngay cả khi dịch vụ xem trước không truy cập được.
- **[Bản dịch chính xác theo phiên bản](vi.json)** — dữ liệu Việt hóa có thể bổ sung, đối chiếu với changelog và Release gốc.
- **[Quy tắc bắt buộc](../../POSITRON_FEATURE_RULES.md)** — ưu tiên tính năng mới; các mô tả, ghi chú và commit mới viết bằng tiếng Việt.

Mã nguồn trình tạo: `scripts/build-positron-feature-site.py`. Quy trình cập nhật: `.github/workflows/positron-feature-pages.yml`. Workflow lấy ảnh trước/sau từ QA Electron thật trên GitHub Actions, đối chiếu phiên bản và báo cáo PASS; lấy bộ cài EXE/DMG đóng trong ZIP từ build job thành công còn hạn. Giữ Release lịch sử, không tạo Release thử nghiệm và không force-push. Nếu chưa có ảnh hoặc bộ cài còn hạn, trang ghi rõ. CI tổng hợp và trạng thái build là hai thông tin riêng biệt. Tải artifact có thể cần đăng nhập GitHub.

**Giới hạn GitHub Pages:** môi trường hiện chỉ cho phép triển khai từ nhánh `web/online`. Không thay đổi trang Web đó. Bản nhật ký GitHub trên nhánh `Positron` hoạt động độc lập; Pages chỉ được bật khi có môi trường riêng được chủ sở hữu cho phép.

**Lưu ý về lịch sử:** GitHub không cho đổi ngôn ngữ các thông điệp commit cũ mà vẫn giữ nguyên SHA. Vì vậy trang Việt hóa diễn giải commit, giữ liên kết và bằng chứng gốc; các thông điệp commit mới từ workflow dùng tiếng Việt.
