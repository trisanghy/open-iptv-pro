# Kiểm thử Desktop 4.22.1 / Desktop test summary

- Đã chạy Node.js `npm test`: **87/87 đạt**.
- Hồi quy thêm: downloader stream dung lượng lớn/giới hạn sai, kết nối bị treo, SHA256, phát trực tiếp không ngắt sau 25 giây, đầy đủ FFmpeg/Timeshift, trình chọn đúng kiến trúc Windows/Mac.
- Giao diện Chromium: v4.22 (icon, repository, cập nhật, 8 ngôn ngữ) và v4.19 Full (Timeshift, Snapshot 32 luồng) đã đạt.
- Kiểm tra Bash syntax, JavaScript parse, cấu trúc GitHub Actions và tính toàn vẹn ZIP.
- **Chưa kiểm chứng** việc biên dịch DMG/EXE thực tế, chữ ký ứng dụng, phát IPTV trên thiết bị thật và workflow GitHub của tài khoản người dùng.
- **Chưa có lockfile trong ZIP** do môi trường không truy cập được npm registry. Script Mac publish sẽ thử tạo `package-lock.json` thực từ npm trên máy người dùng, rồi mới push.
- Android và iOS không thay đổi.
