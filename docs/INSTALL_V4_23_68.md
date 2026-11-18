# Hướng dẫn cài đặt Open IPTV Pro v4.23.68

**Link Release:** https://github.com/trisanghy/open-iptv-pro/releases/tag/v4.23.68

| Nền tảng | Bộ cài Electron Desktop | Rust Lab Beta (tùy chọn) |
| --- | --- | --- |
| Mac Apple Silicon | Open-IPTV-Pro-4.23.68-mac-arm64.dmg | OpenIPTVPro-RustLab-v23.8.26-mac-universal.dmg |
| Mac Intel | Open-IPTV-Pro-4.23.68-mac-x64.dmg | DMG Universal như trên |
| Windows x64 | Open-IPTV-Pro-Setup-4.23.68-x64.exe hoặc Open-IPTV-Pro-4.23.68-x64.exe (Portable) | OpenIPTVPro-RustLab-v23.8.26-Windows-Setup-x64.exe hoặc Portable-x64.zip |
| Web | https://trisanghy.github.io/open-iptv-pro/ | Không áp dụng |

**Mac:** mở DMG, kéo app vào Applications. Nếu hệ điều hành báo chưa ký/notarize, hãy kiểm tra SHA-256 và nguồn GitHub trước khi dùng Open Anyway tại System Settings > Privacy & Security. Không tắt toàn bộ Gatekeeper. Rust Lab là app Beta riêng; sao lưu trước khi đổi.

**Windows:** dùng Setup để cài thông thường hoặc Portable EXE để chạy không cài; Rust Lab có thể cần WebView2 Runtime. Tránh chạy cùng một kho dữ liệu người dùng của hai engine nếu chưa sao lưu.

**Web:** mở đường dẫn Pages; một số stream bị trình duyệt chặn vì CORS/codec/autoplay/HTTPS. Cloud Sync chỉ khả dụng khi cấu hình Supabase và tài khoản đã được xác thực.

**Build Mac chỉ ra một .app, tự tải nguồn mới nhất:**

Electron:

    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'

Rust Lab:

    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/rust-tauri-v2/scripts/BUILD_RUSTLAB_MAC_ONE_ZIP_FAST.sh | bash'

**Kiểm SHA-256:** tải SHA256SUMS.txt cùng đủ bộ cài và chạy shasum -a 256 -c SHA256SUMS.txt trên Mac hoặc sha256sum -c SHA256SUMS.txt trên Linux. Windows PowerShell dùng Get-FileHash -Algorithm SHA256 để đối chiếu từng file. Không cài file không xác minh được nguồn.

Nếu Release chưa có đủ asset, xem GitHub Actions; workflow chỉ tạo Release sau khi cả kiểm thử và các build thành công. Bản tag/release lịch sử được giữ nguyên.

Khi gặp lỗi hình/sub/PiP: kiểm tra trạng thái video, codec và quyền trình duyệt; PiP có thể rơi về video gốc không CC nếu nguồn chặn CORS/DRM. TTS cần mô hình và tài nguyên máy, không cam kết trễ bằng 0.
