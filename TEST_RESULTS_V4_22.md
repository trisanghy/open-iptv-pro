# Kết quả kiểm thử Open IPTV Pro v4.22 Full

- Unit test: **82/82** đạt (`node --test tests/*.test.cjs`).
- UI Chromium mô phỏng (`python tests/ui_v422.py`): **đạt**, bao gồm 12 icon SVG, sidebar và đổi tiếng Việt/Anh, nhà phát hành cố định, kiểm tra cập nhật và tải bộ cài, progress.
- `bash -n BUILD_MAC.command` và `bash -n CAP_NHAT_GITHUB_V4_22_MAC.command`: đạt.
- Kiểm thử GitHub Releases khi tag không chuẩn và chọn file macOS ARM64, macOS x64, Windows x64: đạt bằng dữ liệu mô phỏng.
- Chưa thử cài bộ cập nhật trên Windows/Mac đã ký thực tế; chưa xác minh DMG/EXE build thành công và chưa tải một Release live.
- Không đụng vào phần Android/iOS.
