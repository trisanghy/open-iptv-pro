# Rust Lab v23.8.32 Beta — Vừa xem (bản đã kiểm thử)

- Thêm tab **◷ Vừa xem** trong Danh sách kênh bên cạnh Yêu thích.
- Ghi lịch sử **khi có video/âm thanh giải mã thành công**; không lưu những lần phát lỗi hay ảnh chụp kênh.
- Giữ 30 kênh gần nhất, không trùng, kênh mới nhất ở trên; bấm lại phát ngay. Tự di chuyển ID nếu playlist được làm mới và vẫn có nguồn và khóa kênh tương ứng.
- Tự chuyển đổi bằng chứng phát thành công `lastPlaybackAt` từ phiên bản trước sang danh sách Vừa xem (chỉ khi chưa có lịch sử). Nguồn tắt/xóa được ẩn, không mất dữ liệu cũ.
- Lưu lịch sử vào Rust Native Primary Store trên ổ đĩa; không bị giới hạn localStorage 5 MB. Không sửa dữ liệu Yêu thích.
- Nhóm ảo Vừa xem không nhận kéo thả chuyển thư mục; giữ thao tác phát và đánh dấu sao.
- Giữ bảo vệ **SSRF** đã có từ v23.8.30: kiểm tra DNS, IP và redirect của Smart Discovery, HLS và nguồn M3U.
- Bổ sung kiểm thử hồi quy. Không thay đổi main, Electron hoặc Web. Giữ nguyên các tag cũ.

Chỉ thêm và phát nội dung IPTV mà bạn có quyền sử dụng.
