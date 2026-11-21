# Positron Feature Lab — nhật ký các chức năng theo phiên bản

Trang giới thiệu mỗi bản P5.1.x bằng một dòng có thể mở rộng. Khi mở dòng sẽ thấy mô tả, ảnh chụp ứng dụng Electron thực (nếu có), commit, release và liên kết Windows EXE.

- **Website dự kiến:** https://trisanghy.github.io/open-iptv-pro/positron-features/
- **Trang nguồn:** [index.html](index.html)
- **Tự động hóa:** [positron-feature-pages.yml](../../.github/workflows/positron-feature-pages.yml), chạy với mọi commit mới trên nhánh Positron hoặc qua workflow_dispatch.
- **Tạo dữ liệu:** [build-positron-feature-site.py](../../scripts/build-positron-feature-site.py), lấy GitHub Releases thật và ảnh PNG trong gói 20-Real-Screenshots.zip của release gần nhất. Chỉ gắn ảnh cùng đúng số phiên bản, không gán sai phiên bản, không giả ảnh.
- **Live release listing:** mỗi lần mở trang, trình duyệt truy vấn GitHub public Releases API để hiển thị release mới. Nếu API chạm giới hạn, trang vẫn có bản dữ liệu catalog.json được đóng gói ở lần chạy workflow gần nhất.
- **CANDIDATE:** phiên bản có trong mã nguồn nhưng chưa có Release được trình bày khác với bản đã phát hành.

**Lần đầu xuất bản:** vào repository Settings → Pages → Build and deployment → Source = **GitHub Actions**; sau đó chạy workflow Positron · Feature history website, xác nhận job Deploy to GitHub Pages kết luận success. Nếu nhánh có cập nhật liên tục, workflow cũ có thể bị hủy theo concurrency, chỉ workflow mới nhất được phép triển khai.

Không tuyên bố website đã trực tuyến trước khi GitHub trả kết quả triển khai thành công. Việc tạo trang này không sửa mã trình phát IPTV, playlist, tag phát hành hoặc nhánh khác.
