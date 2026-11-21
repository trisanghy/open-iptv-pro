# Positron Feature Lab — nhật ký các chức năng theo phiên bản

Trang giới thiệu mỗi bản P5.1.x bằng một dòng có thể mở rộng. Khi mở dòng sẽ thấy mô tả, ảnh chụp ứng dụng Electron thực (nếu có), commit, release và liên kết Windows EXE.

- **Trang mở ngay trên GitHub:** [FEATURES.md](FEATURES.md) — danh sách mỗi phiên bản một dòng, bấm để mở ảnh và mô tả.
- **HTML có thể tải:** GitHub Actions artifact positron-feature-website.
- **GitHub Pages:** hiện chỉ cho phép triển khai từ nhánh web/online; không thay đổi cấu hình vì sẽ ảnh hưởng site Web.
- **Trang nguồn:** [index.html](index.html)
- **Tự động hóa:** [positron-feature-pages.yml](../../.github/workflows/positron-feature-pages.yml), mỗi commit Positron sẽ tự tạo và commit FEATURES.md + catalog.json + PNG từ GitHub Release lên chính nhánh Positron bằng push fast-forward, không force push. GitHub Pages deploy tắt theo mặc định để bảo vệ web/online.
- **Tạo dữ liệu:** [build-positron-feature-site.py](../../scripts/build-positron-feature-site.py), lấy GitHub Releases thật và ảnh PNG trong gói 20-Real-Screenshots.zip của release gần nhất. Chỉ gắn ảnh cùng đúng số phiên bản, không gán sai phiên bản, không giả ảnh.
- **Live release listing:** mỗi lần mở trang, trình duyệt truy vấn GitHub public Releases API để hiển thị release mới. Nếu API chạm giới hạn, trang vẫn có bản dữ liệu catalog.json được đóng gói ở lần chạy workflow gần nhất.
- **CANDIDATE:** phiên bản có trong mã nguồn nhưng chưa có Release được trình bày khác với bản đã phát hành.

**Đường dẫn sử dụng ngay:** https://github.com/trisanghy/open-iptv-pro/blob/Positron/docs/positron-features/FEATURES.md . Đây là trang Markdown do GitHub hiển thị, không cần đổi Pages source. Chỉ bật POSITRON_PAGES_ENABLED=true khi có Pages độc lập được phép deploy Positron. Không tuyên bố GitHub Pages đã trực tuyến trước khi deploy thành công. Việc tạo trang này không sửa mã trình phát IPTV, playlist, tag phát hành hoặc nhánh khác.
