# Hướng dẫn người dùng Open IPTV Pro Desktop v4.23.66

**Tải chính thức:** [GitHub Release Electron v4.23.66](https://github.com/trisanghy/open-iptv-pro/releases/tag/electron-v4.23.66). Đây là bản **thử nghiệm**; bản stable v4.23.60 vẫn được giữ nguyên.

## Chọn đúng bộ cài và xác thực
- Mac Apple Silicon: Open-IPTV-Pro-4.23.66-mac-arm64.dmg.
- Mac Intel: Open-IPTV-Pro-4.23.66-mac-x64.dmg.
- Windows 10/11 x64: Open-IPTV-Pro-Setup-4.23.66-x64.exe (installer) hoặc Open-IPTV-Pro-4.23.66-x64.exe (portable).
- Nhà phát triển: OpenIPTVPro_Source_v4.23.66.zip (Node.js 22+).
- Đọc SHA256SUMS.txt trong Assets: Mac dùng lệnh shasum -a 256 <đường-dẫn-tệp>; Windows PowerShell dùng Get-FileHash "<đường-dẫn-tệp>" -Algorithm SHA256.

Mac: mở DMG và kéo Open IPTV Pro.app vào Applications. Tệp chưa ký/notarize có thể bị chặn; sau khi xác minh nguồn và checksum, xem System Settings → Privacy & Security → Open Anyway (không cần tắt Gatekeeper). Windows: dùng Setup hoặc Portable đã kiểm tra checksum; SmartScreen có thể cảnh báo đối với phần mềm unsigned.

## Bật phụ đề, dịch và giọng đọc
1. Vào Xem truyền hình, thêm URL hoặc file playlist M3U bạn có quyền truy cập, chọn kênh.
2. Bật Live Caption; nhấn biểu tượng ⚙ → Nhận diện giọng nói để cài Whisper khi được yêu cầu.
3. Bật Live Translate và chọn ngôn ngữ đích. Argos hoạt động nhẹ; Hy-MT2 / Qwen3 MLX chỉ chạy trên Mac Apple Silicon. Cài riêng các mô hình cần dùng.
4. Bật Giọng dịch TTS, chọn giọng tiếng Việt: Piper (nhẹ), VieNeu 48 kHz, VietVoice giọng vùng miền hoặc F5 dùng mẫu giọng.
5. Nhấn Cài mô hình tự động rồi Nghe thử. Khi dùng F5, chọn WAV và nhập chính xác lời thoại mẫu, đồng thời xác nhận quyền sử dụng giọng. Model F5 tiếng Việt đã chọn chỉ dùng phi thương mại.
6. Điều chỉnh tốc độ nói và mức % âm lượng tiếng gốc để phù hợp.

Nếu VietVoice báo thiếu ffprobe, hãy chắc chắn chạy đúng app v4.23.66, không phải app cũ đang mở. Bản mới có FFprobe và FFmpeg tích hợp nên không cần Homebrew hoặc tải lại model.

## PiP và đa nhiệm
Khi video đang phát và rời Xem truyền hình sang Yêu thích, EPG hoặc Cài đặt, ứng dụng thử mở PiP; quay lại Xem truyền hình thì đóng PiP. Trong Cài đặt → Picture-in-Picture có hai lựa chọn riêng tự mở PiP khi thu nhỏ cửa sổ hoặc chuyển ứng dụng khác; mặc định tắt. Một cửa sổ bị che mà không mất tiêu điểm chưa chắc kích hoạt PiP. Tính năng còn phụ thuộc hệ điều hành và loại video.

## Bộ nhớ AI và gợi ý cấu hình
Trong ⚙ → Bộ nhớ AI đã tải, bạn thấy dung lượng thực đã dùng và nút Tải/Xóa ở mỗi model. Bên dưới tên có RAM tham khảo, CPU/Apple Silicon/MLX, dung lượng ổ trống gợi ý và thông báo khi RAM máy ít hơn mức gợi ý. Đây không phải cấu hình tối thiểu chính thức hay RAM trống thực tế. Model lớn có thể tốn nhiều RAM, nhất là khi IPTV, Whisper, dịch và TTS cùng hoạt động. Xóa model không xóa playlist, kênh yêu thích hay EPG.

## Build Mac dành cho chủ máy — chỉ một file app
Sao chép vào Terminal:
bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/experiment/electron-v42366-ai-model-hardware-hints/build-mac-v42366.sh | bash'

Build thành công script tự mở thư mục Downloads/Open_IPTV_Pro_APP_v4.23.66 chứa Open IPTV Pro.app, không để DMG hay ZIP nguồn trong thư mục đó. File public cho user khác nằm ở GitHub Release.

## Giới hạn và quyền riêng tư
Chất lượng, độ trễ của phụ đề/dịch/giọng phụ thuộc kênh, codec và máy. Mô hình AI/giọng mẫu có thể cần vài GB và phải được người dùng cài có chủ đích. Không chia sẻ playlist riêng, token hoặc giọng mẫu lên issue công khai; chỉ dùng các nguồn IPTV mà bạn có quyền truy cập. Đọc [Release Notes](../RELEASE_NOTES_ELECTRON_V4_23_65.md) và [Third-party notices](../THIRD_PARTY_NOTICES.md).

### English quick guide
Download the matching Mac ARM64/Intel DMG or Windows x64 Setup/Portable from the prerelease and verify SHA-256 against SHA256SUMS.txt. Import your authorized M3U, enable Live Caption/Translate, opt into local TTS models, and review model RAM/storage guidance under AI Settings. Hy-MT2 and Qwen3 MLX require Mac Apple Silicon. F5 Vietnamese weights are noncommercial and voice cloning requires permission. Unsigned binaries may prompt OS security warnings.


## Sửa lỗi v4.23.66 khi đổi mô hình dịch và nghe thử

Nếu trước đây ứng dụng báo `Cannot read properties of null (reading 'toString')` tại `hymt-service.cjs:174`, hãy đóng app cũ và mở phiên bản 4.23.66. Bộ dịch MLX có thể thoát khi thiếu RAM hoặc gặp lỗi runtime; bản mới sẽ hiển thị lỗi an toàn thay vì gây cửa sổ JavaScript Error. Khi có Argos phù hợp đã cài, hệ thống có thể chuyển tạm sang Argos để tiếp tục phụ đề.

Khi bấm **Nghe thử giọng đọc**, app sẽ tạm giữ câu phụ đề mới nhất trong hàng đợi. Khi WAV nghe thử kết thúc hoặc bị hủy/timeout, giọng đọc tự trở lại phụ đề đang đến. Đổi bộ dịch hoặc giọng trong lúc nghe thử sẽ hủy tác vụ cũ. Nếu mô hình quá nặng, chọn giọng Piper để giảm độ trễ. Các nút Caption/Translate và TTS đã được nhóm thành hai dòng gọn hơn, không loại bỏ lựa chọn.
