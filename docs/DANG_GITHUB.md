# Đưa mã nguồn lên GitHub (repository PUBLIC mới)

**Đây là thao tác đăng *mã nguồn phần mềm*, không phải tải playlist `iptv.m3u` người dùng lên Gist.** Bạn nên tự kiểm tra repository trước khi công khai.

## Trên Mac

1. Giải nén gói dự án và mở thư mục `Open-IPTV-Pro-v4_1-GitHub-Ready`.
2. Nhấp đúp **`DANG_GITHUB_PUBLIC_MAC.command`** (hoặc chạy `bash DANG_GITHUB_PUBLIC_MAC.command` trong Terminal).
3. Máy cần `git` và **GitHub CLI (`gh`)**. Nếu thiếu Git, cài Apple Command Line Tools; nếu thiếu GitHub CLI, script sẽ đề nghị cài qua Homebrew hoặc dẫn tới trang GitHub CLI. Đây là công cụ để đăng dự án, **không phải phần bắt buộc đối với người dùng ứng dụng**.
4. Đăng nhập qua trình duyệt chính thức được GitHub CLI mở, **không dán token vào script**.
5. Nhập tên repo, mặc định `open-iptv-pro`. Script chỉ tạo **repo mới**; nếu trùng tên, nó sẽ dừng và không ghi đè.
6. Xem **danh sách file được phép đăng** và nhập chính xác `PUBLIC` để xác nhận.
7. Kiểm tra liên kết `https://github.com/<tài-khoản>/<tên-repo>` được in khi thành công.

## Trên Windows

Nhấp đúp `DANG_GITHUB_PUBLIC_WINDOWS.bat`, sau đó làm theo hướng dẫn PowerShell. Cần **Git for Windows** và **GitHub CLI**; dùng đăng nhập trình duyệt, không nhập token trực tiếp.

## Cách build installer bằng GitHub Actions

1. Vào repository → **Actions**.
2. Chọn **Build Open IPTV Pro (Windows + macOS)** → **Run workflow**.
3. Khi chạy thành công, tải **Artifacts** cho Mac Intel, Mac Apple Silicon hoặc Windows.
4. Bộ cài **chưa ký số**; việc build thành công không đồng nghĩa đã kiểm nghiệm trên mọi phiên bản hệ điều hành.

## Những gì được/không được đăng

Danh sách chính xác nằm trong `PUBLISH_FILES.txt`. Script chỉ `git add` những file này, bao gồm mã nguồn, MIT LICENSE, tài liệu, ảnh minh họa demo và workflows. Không đăng playlist cá nhân, file `.env`, token, thư mục cache, snapshot thật, `node_modules`, `dist`.

**Cảnh báo:** Bất cứ tệp mã nguồn hoặc ảnh nào bị sửa sau khi nhận bộ ZIP đều có thể chứa dữ liệu cá nhân. Đọc lại file mình định đăng, kể cả khi tên tệp nằm trong danh sách cho phép.
