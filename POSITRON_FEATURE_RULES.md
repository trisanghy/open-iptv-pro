# Positron — Quy tắc ưu tiên chức năng mới

**Ưu tiên số 1: thêm nhiều tính năng mới thiết thực cho người xem.** Không dùng nhiều vòng liên tiếp chỉ để tinh chỉnh màu, viền, khoảng cách hoặc đổi nhãn phiên bản. Chỉ ưu tiên sửa lỗi khi đó là lỗi phát hình/âm thanh, mất dữ liệu, bảo mật, CI không đạt, hoặc khiến tính năng mới không dùng được.

Mỗi vòng:
1. Kiểm tra HEAD của **nhánh Positron**; tuyệt đối không sửa main, Electron ổn định, Web, Mobile hoặc Rust/Tauri.
2. Nghiên cứu một nhu cầu có thật; kiểm tra tính năng có trùng với mã nguồn hiện tại hay không. Ưu tiên khám phá chương trình theo EPG, WatchFlow, Watch Later, điều khiển từ xa, nhắc lịch, kiểm soát nguồn và chẩn đoán có ích; không giả vờ có AI nếu chỉ sử dụng luật.
3. Thêm tính năng hoàn chỉnh, thao tác thực tế, không mất dữ liệu; giữ sự đồng ý trước khi truy cập nguồn bên ngoài và không tự động phát playlist.
4. Mỗi thay đổi một commit mới, tăng phiên bản, giữ tag bất biến; không force-push. Kiểm thử hồi quy, chụp màn hình **Electron thật** ở trạng thái có dữ liệu, tự xem lại ảnh và đối chiếu chức năng.
5. Sau commit, xác minh GitHub Actions và bộ cài Windows x64 Setup/Portable; các phiên bản chưa đạt CI, ảnh, release phải gắn trạng thái **CANDIDATE**, không báo hoàn tất.
6. **Bắt buộc công bố mỗi phiên bản thành một dòng trên website nhật ký Positron**. Bấm vào dòng sẽ hiện mô tả tính năng mới, ảnh chụp thật (nếu đã tồn tại), commit, CI và link tải phát hành. Không lấy ảnh phiên bản khác, không dựng ảnh như ảnh QA.
7. Nếu yêu cầu "liên tục", sử dụng GitHub workflow để cập nhật trang sau các commit; không tự nhận có tác vụ nền khi không có workflow hoặc tự động hóa thật.

**Trang dùng ngay trên GitHub:** docs/positron-features/FEATURES.md — các dòng mở rộng kèm ảnh kiểm thử Electron thật.

Website HTML source: docs/positron-features/index.html.
Auto generator: scripts/build-positron-feature-site.py.
Workflow: .github/workflows/positron-feature-pages.yml.

**Quan trọng:** GitHub Pages hiện đang chỉ cho phép nhánh web/online triển khai. **Không đổi nhánh nguồn Pages và không ghi đè website Web.** Mỗi commit Positron sẽ tự xuất bản trang Markdown có thể mở trực tiếp trong GitHub, cùng ảnh PNG thật trích từ Release. Bản HTML được tạo và giữ dưới dạng GitHub Actions artifact. Chỉ bật Pages riêng nếu chủ sở hữu tạo được môi trường/site độc lập, không ảnh hưởng web/online.
