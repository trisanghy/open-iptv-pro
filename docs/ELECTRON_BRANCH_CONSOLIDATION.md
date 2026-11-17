# Hợp nhất 14 nhánh Electron về một nhánh

Nhánh phát triển Electron cố định: **build-sources/electron-desktop**.

Mã nguồn chạy chính dựa trên v4.23.66, gồm Live Translate, TTS/PiP, FFprobe và gợi ý cấu hình AI. Mọi nhánh cũ được bảo toàn bằng lịch sử commit/merge và tag lưu trữ trước khi xóa nhánh. Các prototype phân kỳ không tự động được kích hoạt vì có thể xung đột.

| Nhánh cũ | SHA | Tag lưu trữ | Trạng thái trước khi gộp |
| --- | --- | --- | --- |
| `experiment/electron-v42348-1-tts-duck-dedup` | [`94e1cf93040b`](https://github.com/trisanghy/open-iptv-pro/commit/94e1cf93040b3b28f204f55aebdf0729cadb50bf) | `archive/electron-legacy/electron-v42348-1-tts-duck-dedup` | divergent |
| `experiment/electron-v42349-vi-translation-premium-tts` | [`0e728da8b162`](https://github.com/trisanghy/open-iptv-pro/commit/0e728da8b16257a5fe43d4ae6182a3917943d0a0) | `archive/electron-legacy/electron-v42349-vi-translation-premium-tts` | divergent |
| `experiment/electron-v42350-direct-translation-tts` | [`48bb846e719b`](https://github.com/trisanghy/open-iptv-pro/commit/48bb846e719b483d4325c7ec86725e657b68c55e) | `archive/electron-legacy/electron-v42350-direct-translation-tts` | divergent |
| `experiment/electron-v42362-vietnamese-tts` | [`fe608ab0ba1e`](https://github.com/trisanghy/open-iptv-pro/commit/fe608ab0ba1e178e6bcd3b0fee692b3dd43289b5) | `archive/electron-legacy/electron-v42362-vietnamese-tts` | ancestor |
| `experiment/electron-v42363-auto-pip` | [`9d74e0692412`](https://github.com/trisanghy/open-iptv-pro/commit/9d74e0692412e607ec077e8867044267020605bf) | `archive/electron-legacy/electron-v42363-auto-pip` | ancestor |
| `experiment/electron-v42364-ffprobe-bundled` | [`11064b7ded3a`](https://github.com/trisanghy/open-iptv-pro/commit/11064b7ded3aef4e643f5440ad1f94e191919049) | `archive/electron-legacy/electron-v42364-ffprobe-bundled` | ancestor |
| `experiment/electron-v42365-ai-model-hardware-hints` | [`01a1fdae0403`](https://github.com/trisanghy/open-iptv-pro/commit/01a1fdae0403d019006b4816315d52774c0dd3d7) | `archive/electron-legacy/electron-v42365-ai-model-hardware-hints` | ancestor |
| `experiment/electron-v42366-tts-translate-stability` | [`7e741a705d8d`](https://github.com/trisanghy/open-iptv-pro/commit/7e741a705d8dc6740f4837974724c4994f5a9a59) | `archive/electron-legacy/electron-v42366-tts-translate-stability` | active |
| `experiment/electron-whisper-cdnfix-v42347` | [`3109fc0980b8`](https://github.com/trisanghy/open-iptv-pro/commit/3109fc0980b8f4684929232d4b591cf995b41e63) | `archive/electron-legacy/electron-whisper-cdnfix-v42347` | divergent |
| `experiment/google-translate-gemma-v42361` | [`1080d21be622`](https://github.com/trisanghy/open-iptv-pro/commit/1080d21be6229ca49d41ebb7c38f82927d7f1d7e) | `archive/electron-legacy/google-translate-gemma-v42361` | divergent |
| `experiment/native-webview-ffmpeg` | [`165f77c7cfa3`](https://github.com/trisanghy/open-iptv-pro/commit/165f77c7cfa33f4ccea3abd00fd79b333bfb3757) | `archive/electron-legacy/native-webview-ffmpeg` | divergent |
| `personal/mac-app-only-one-command-v42360` | [`6d1fedbe72be`](https://github.com/trisanghy/open-iptv-pro/commit/6d1fedbe72be4553bbd7ea2e1237c587b6618126) | `archive/electron-legacy/mac-app-only-one-command-v42360` | divergent |
| `iptv-build-source` | [`326bb5ea6ac2`](https://github.com/trisanghy/open-iptv-pro/commit/326bb5ea6ac2f711c2bb36e0843adb9cb1f8ee92) | `archive/electron-legacy/iptv-build-source` | divergent |
| `release/promote-electron-v4.23.60-main-20261117` | [`aa3a14eaea4d`](https://github.com/trisanghy/open-iptv-pro/commit/aa3a14eaea4d8c61c06611f0039c63a058db5c8b) | `archive/electron-legacy/promote-electron-v4.23.60-main-20261117` | ancestor |

## Lệnh build Mac duy nhất

    bash -c 'set -o pipefail; curl -fsSL https://raw.githubusercontent.com/trisanghy/open-iptv-pro/build-sources/electron-desktop/build-mac-electron.sh | bash'

Bản build cá nhân tự lấy version trong package.json, xuất đúng một .app, mở Finder và xóa source tạm. Bản public dùng build-mac-electron-public.sh hoặc Releases/immutable tags.

Lịch sử v4.23.66 có thể build lại từ tag electron-v4.23.66 thay vì phụ thuộc nhánh thử nghiệm đã dọn.

Không thay đổi main, Rust, Mobile, web/online hoặc các tag/Release đã phát hành.
