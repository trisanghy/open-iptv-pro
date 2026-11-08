# FFmpeg/FFprobe — giấy phép bên thứ ba

- Nhánh thử nghiệm **có đóng gói** `ffmpeg` và `ffprobe` từ các gói binary tĩnh khi build.
- `ffmpeg-static` được công bố với GPL-3.0-or-later cho package; các binary FFmpeg kèm theo có giấy phép riêng tùy cấu hình biên dịch.
- `@w6s/ffprobe-static` có JS wrapper theo MIT nhưng binary có thể chịu LGPL/GPL và điều kiện riêng.
- **Trước khi phát hành bộ cài công khai:** kiểm tra `ffmpeg -version` (cờ `--enable-gpl`/nonfree), giấy phép binary, nguồn mã nguồn tương ứng, attribution và nghĩa vụ phân phối theo từng build. MIT của ứng dụng không tự động bao phủ FFmpeg.
- Không được tuyên bố bản FFmpeg không bị cắt codec trừ khi đã kiểm tra cấu hình build và nhu cầu codec của ứng dụng gốc. Yêu cầu cố định ở đây là **không được bỏ FFmpeg/FFprobe ra khỏi bộ cài**.
