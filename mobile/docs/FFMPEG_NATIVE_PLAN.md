# Kế hoạch FFmpeg / FFprobe cho Mobile (không cắt tính năng khi hoàn thiện)

## Vì sao không copy `ffmpeg-static` từ desktop?

`ffmpeg-static` trong dự án Electron/Node cung cấp executable cho hệ điều hành desktop. iOS không cho phép tự do spawn executable CLI bên trong bundle ứng dụng như Electron; Android mới cũng có rào cản thực thi binary trong vùng dữ liệu app. Cần FFmpeg **thư viện native** build riêng cho iOS arm64 và Android arm64-v8a/armeabi-v7a/x86_64.

## Các cách triển khai

1. **FFmpegKitNext**: theo README dự án FFmpegKit (cập nhật 7/2026), FFmpegKit đời cũ đã retired, bản mới phát triển dưới dạng **source only**. Build source để tạo XCFramework iOS và AAR/so Android, tích hợp bridge Capacitor cho `snapshot`, `record`, `timeshift`, `ffprobe`.
2. **Tự build FFmpeg 7/8**: Android NDK → .so; iOS Xcode → static libraries/XCFramework, lược bỏ tính năng có giấy phép gây xung đột, tạo bridge Swift/Kotlin gọi trực tiếp libavformat/libavcodec. Tốn công nhất nhưng chủ động bảo trì.
3. **Media3/AVFoundation native thay phần giải mã**: cho playback và DVR native; chỉ cần FFmpeg cho snapshot đặc biệt, transcoding và stream relay.
4. **Server hỗ trợ FFmpeg**: chạy desktop/VPS transcoding, mobile gọi API. Đây là tính năng bổ sung có phụ thuộc máy chủ, không phải offline và cần biện pháp bảo mật URL token; không chọn làm mặc định.

## Không nên

- Dùng artifact `com.arthenica:ffmpeg-kit-*` cũ đã bị xóa Maven Central năm 2025.
- Đổi tên FFmpegKitNext thành FFmpeg full mà không thực sự build/đóng gói thư viện.
- Dùng `window.captureStream()` trên video DRM/CORS rồi tuyên bố snapshot hoạt động trên mọi kênh.

## Contract bridge đề xuất

```ts
interface MobileFFmpeg {
  snapshot(input: string, targetFile: string, headers?: Record<string,string>): Promise<{file: string}>;
  probe(input: string): Promise<{streams: unknown[], duration: number|null}>;
  startTimeshift(input: string, bufferSeconds: 300): Promise<{sessionId: string}>;
  readTimeshift(sessionId: string, offsetSeconds: number): Promise<{playbackUri: string}>;
  stopTimeshift(sessionId: string): Promise<void>;
  record(input: string, targetFile: string): Promise<{recordingId: string}>;
}
```

Cần chạy kiểm thử trên **iPhone 15 Pro Max iOS 26** và Android thật; quản lý background processing, dung lượng bộ đệm, sandbox, codec, DRM và GPL/LGPL.
