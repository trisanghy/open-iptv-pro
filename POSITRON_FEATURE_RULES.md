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

## Cổng kiểm thử bắt buộc cho mọi phiên bản tiếp theo

Từ **P5.1.134**, mỗi phiên bản ứng dụng mới PHẢI khai báo quyết định ưu tiên ngay trong mục `## P5.1.x` tương ứng của `POSITRON_P5_CHANGELOG.md`. CI chặn phiên bản thiếu khai báo; không được tăng số bản để né quy tắc.

**Mặc định: tính năng mới.** Dùng đầy đủ ba trường:

- `Feature priority: NEW — <mô tả tính năng người xem thực sự sử dụng được>`
- `User action: <cách người dùng mở và sử dụng tính năng mới>`
- `Electron screenshot: <tên ảnh QA thật có chứa số phiên bản>`

**Ngoại lệ duy nhất:** lỗi thật nghiêm trọng ảnh hưởng phát hình/âm thanh, quyền riêng tư, dữ liệu, bảo mật, hoặc CI/build đang chặn phát hành. Khi đó khai báo:

- `Feature priority: BLOCKER_FIX — <lỗi, tác động và lý do phải sửa trước tính năng mới>`
- `Electron screenshot: <tên ảnh QA thật có chứa số phiên bản>`

Các dòng trên phải bắt đầu bằng `- ` trong changelog. Không coi đổi màu/viền/icon/spacing, đổi version, thêm test rỗng hay thay mockup là tính năng mới. Việc CI thông qua chỉ xác nhận đủ bằng chứng bắt buộc; vẫn phải kiểm tra tính năng thật bằng Electron và build Windows x64.

**Bộ gác quy tắc:** `tests/positron-feature-priority.test.cjs`. Workflow công bố nhật ký chạy bộ gác trước khi tạo website; các workflow phát hành dùng `npm test` để chạy lại tự động.

## Quy tắc ngôn ngữ — chỉ hiển thị tiếng Việt

Từ đây, **mọi nội dung dành cho người dùng trong nhánh Positron phải viết bằng tiếng Việt**: tiêu đề tính năng, chú thích, mô tả từng phiên bản, nhật ký thay đổi, nội dung website, nhãn trạng thái, hướng dẫn, ghi chú phát hành mới và thông điệp commit mới. Tên thư viện, mã lệnh, đường dẫn, thuật ngữ kỹ thuật, SHA, tên file, tên sản phẩm và mã phiên bản giữ nguyên khi cần để kiểm chứng.

- Website lấy bản dịch từ `docs/positron-features/vi.json`; dữ liệu các phiên bản mới phải được viết bằng tiếng Việt trực tiếp trong changelog. Không cho GitHub Release API ghi đè mô tả đã Việt hóa bằng nội dung tiếng Anh.
- Trang GitHub `docs/positron-features/FEATURES.md` và `LOG_GIT_TIENG_VIET.md` phải tự sinh từ dữ liệu phiên bản có kiểm chứng, ảnh thật của đúng phiên bản; không được bịa ảnh hoặc kết quả CI.
- **Không viết lại các commit lịch sử** (không force-push, không sửa tag, không thay đổi SHA). Thay vào đó có nhật ký giải thích bằng tiếng Việt kèm liên kết đến commit gốc. Các commit mới từ người và GitHub Actions phải dùng thông điệp tiếng Việt.
- Tên khóa bắt buộc cho máy như `Feature priority: NEW`, `User action:`, `Electron screenshot:`, `BLOCKER_FIX` giữ nguyên để kiểm thử tương thích, nhưng nội dung mô tả sau dấu phân cách phải viết bằng tiếng Việt.
- Nếu bản phát hành mới chưa có bản dịch được xác minh, trang ghi rõ đang chờ mô tả tiếng Việt, **không hiển thị nguyên văn tiếng Anh**.
