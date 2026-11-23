# POSITRON — CHECKPOINT P5.1.347, đợt 20 vòng mới

- Baseline: P5.1.346 / package 4.23.431, HEAD 8219f309f3a385295833f862fdca41a123ba4bf2; stable-only Release job disabled.
- Real baseline evidence: fast Electron workflow 45283577787, artifact 14870058226 (4 genuine screenshots, 1920×1080 and 720×900).
- Full workflow 45283577752 failed after P344: `scripts/positron-345-audit.cjs` awaited an AI panel that F6 intentionally would not open from the focused search editor. The full job failed; Windows/macOS build jobs succeeded but Release was skipped.
- P347 planned correction: focus real TV WatchFlow opener before F6 in P345; AI shortcut overlay closes when a mode is chosen; add independent Electron screenshots at 1920×1080 and 720×900, pointer and remote Enter checks.
- Acceptance: npm test green, P345→P346→P347 full serial capture, P347 before/after images directly reviewed, zero playlist/current channel/local model mutation.
- 20-round progress: do not count P347 until successful CI evidence and direct screenshot inspection. Never claim future rounds completed in advance.

- P347 first CI run 45285958995: 1061 pass, 8 fail, 5 skipped; stale version labels/changelog and evidence declarations must be corrected (assertions unchanged).
- P347 fast native Electron run 45285958935: expanded keyboard help intercepted mode pointer input; outside-pointer dismissal is now directly tested instead of using forced hidden clicks.

## P5.1.347 — bằng chứng vòng cải tiến
- HEAD thời điểm kiểm tra P347: b1e23d5a155108165ec400331ac957e30b3e0d4b.
- Full Node, Windows x64, mac ARM64/Intel CI trước đó: success 45286709984; latest full run 45287352330 đang kiểm tra khi ghi checkpoint.
- Fast Electron screenshot review: success 45287348167, artifact 14872072899.
- ĐÃ MỞ TRỰC TIẾP PNG thực của ứng dụng, trước/sau 720×900 và 1920×1080: sau khi chạm ngoài hộp hướng dẫn, các nút chế độ hiện đủ và WatchFlow còn mở.
- QA: 20 checks PASS, nguồn kênh [], current channel rỗng, local AI model null trước/sau, 4 SHA-256 lưu trong audit-p51347-auto-dismiss-mode.json.
- Giới hạn: chưa có nguồn xem thực hoặc khả năng kiểm tra GPU/Cast/DVR; GitHub Release stable-only disabled. Không nhận đã phát hành hoặc xác thực playback.

## P5.1.348 — kế tiếp
- Từ screenshot P347: hướng dẫn mở có thể phủ nút AI ở viewport 720px. Khi focus remote rời summary mà không nhấp chuột, Esc phải thu gọn hướng dẫn trước rồi mới đóng bảng ở lần Esc thứ hai.
- Implementer: renderer/positron-intelligence.js + native CDP script 348, screenshot in two viewports, private playlist/AI model state unchanged.
- Đếm đợt 20 mới: P347 có bằng chứng fast Electron thật, P348 chưa thực thi; không đếm các vòng chưa đủ test/ảnh và CI.

## P5.1.348 — QA screenshot và lưu vết
- Feature: Esc từ nút chế độ được focus thu gọn hộp hướng dẫn trước; Esc tiếp theo mới đóng WatchFlow.
- Real Electron fast run: 45288452957 success, artifact 14871604766; 21 checks PASS, 4 genuine PNG (1920×1080 & 720×900), opened directly in QA.
- Đánh giá bằng mắt: trước hướng dẫn che lưới các chế độ nhưng focus đang ở Kênh hợp gu; sau Esc hộp thu gọn, viền focus của Kênh hợp gu vẫn hiển thị, không cắt chữ/tràn. Dữ liệu playlist/current AI model không đổi.
- Full Node suite: workflow 45288453026 test success; capture/build chưa chốt khi ghi checkpoint này.
- Next issue from real images: expanded guide still OVERLAPS six modes; P349 will move guide underneath grid as bounded list with focusable PageDown scroll.
- Strict round count: P348 unconfirmed until full capture/build and cross-check complete; no immutable Release because stable-only policy.
