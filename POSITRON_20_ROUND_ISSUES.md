# POSITRON 20 ROUND ISSUES — ĐỢT MỚI TỪ P5.1.336

- Baseline đã kiểm tra: P5.1.336, app 4.23.421, code commit 854c274c7796d8e35ac772c3afb57591c4dbebb3, HEAD tài liệu 5312f0d5342798621c904965d783bf559a1c8eb3.
- Bằng chứng baseline: GitHub Actions 45261280987, artifact positron-fast-round 14859314068; đã mở PNG Electron thật 1920x1080 và 720x900; audit P336 khẳng định focus J/K 2/3, không tràn, không autoplay; chỉ kênh synthetic QA.
- Vấn đề 01 [vừa, xác minh bằng đọc mã]: Badge Gợi ý N/M chỉ đổi khi Alt+Shift+J/K, không cập nhật khi di chuyển focus bằng Tab / chuột / remote; có thể công bố sai vị trí. Repro: nhấn J (1/3), chuyển focus sang nút Xem ở thẻ 2 bằng Tab, nhãn vẫn 1/3. Nguyên nhân: thiếu focusin delegation. Tiêu chí: focus/card badge đồng bộ, không phát kênh, không thay M3U/model; hình 1920 và 720.
- Bản sửa dự kiến P337: renderer/positron-intelligence.js, tests/positron-intelligence.test.cjs, scripts/positron-337-audit.cjs; trạng thái CANDIDATE chưa tính hoàn tất trước khi CI/ảnh.
- Đợt 20 vòng không được đánh dấu hoàn tất theo số commit; vòng tiếp theo chỉ được chọn từ lỗi/tính năng còn tồn và kết quả ảnh thực của P337.
- Hạn chế: chưa kiểm chứng stream IPTV, GPU, DVR, AirPlay/Cast trên thiết bị thật; tag và release Stable không tự động phát hành.

## Vòng 01/20 — P5.1.337 / 4.23.422
- Thực thi: commits 71e2116b, 060d8b4c, 4ba2b883 và 8a6e834f (cùng nhãn P337); các commit docs tự động có thể xuất hiện sau.
- Kết quả: Actions Node 1.053 pass / 5 skip / 0 fail; fast Electron run 45264613574 PASS; full CI 45264613661 PASS cho Node + capture + Windows x64 + mac ARM/x64; release intentionally skipped stable-only.
- Ảnh Electron thật đã MỞ và soát 1920×1080 / 720×900: trước focus thẻ thứ 2 nhưng badge 1/N; sau focus thẻ thứ 3 badge 3/N; không tràn, không autoplay, model/playlist không đổi. Artifact fast QA có thể tải từ run 45264613574; bộ cài từ full CI.
- Phát hiện cho vòng 02: P335 cho phép di chuyển sang gợi ý tiếp theo (K) nhưng chưa có thao tác đi lùi tới gợi ý trước. Người dùng phải Tab qua các nút phản hồi, bất tiện với remote.
- Quy tắc phát hành: AGENTS.md chỉ cho phép GitHub Releases Stable từ main; các bản Positron thử nghiệm dùng Actions artifacts. Không tuyên bố release P337.

## Vòng 02/20 — P5.1.338 / 4.23.423 (CANDIDATE)
- Feature class: AI. Mục tiêu: Alt+Shift+P đưa focus tới gợi ý trước, quay về cuối nếu ở đầu; dùng cùng bộ counter P337; không tự phát, bảo toàn dữ liệu.
- Cần xác minh: test Node, Electron before/after 1920×1080 và 720×900, mở PNG, screenshot geometry, CI Mac/Win, artifacts SHA. Không đánh dấu hoàn thành trước khi các bằng chứng có thật.

## Vòng 02/20 — P5.1.338 / 4.23.423
- Commit tính năng: cba8548e75890958781dd6fe1f817612079d616c. Native fast QA run 45266137637 PASS, 16 checks; Node 1.054 pass / 5 skipped / 0 fail; Windows x64 + Mac arm64 + Mac Intel build PASSED trong full CI 45266137724; capture/full regression theo Actions run.
- Đã MỞ PNG Electron P338 trước/sau 1920×1080/720×900. Ấn Alt+Shift+P từ gợi ý 1/3 tới gợi ý 3/3; tiếp P tới 2/3; K lại tới 3/3; không autoplay, model và nguồn dữ liệu không đổi.
- Lỗi nhìn thấy từ ảnh P338 720: tiêu đề gợi ý 1 có thể bị che khi danh sách cuộn và thanh sticky luôn hiện, người dùng không nhận diện kênh đang focus nếu chỉ nhìn nút Xem.
- Vòng 03 đầu vào: hiển thị tên kênh đang chọn trong header sticky, có tooltip đầy đủ, không tràn hay che nút; chỉ tính khi QA/ảnh thật pass.

## Vòng 03/20 — P5.1.339 / 4.23.424 (CANDIDATE)
- New AI channel context. Chờ QA native, Node test, bản dựng và ảnh đã trực tiếp mở xem. Giữ các phiên bản/tags/Release bất biến.

- P338 full capture 45266137724: historical P335 audit failed on exact aria-keyshortcuts equality after P338 legitimately added P. P339 corrective patch treats the shortcut attribute as a whitespace-separated token list, still requires K and preserves the new P. Not counted as independent feature.
- P339 initial fast QA 45267409859: found actual chip title "1. QA P339 Giải trí" while expected "QA P339 Giải trí". Cause: escaped regex in generated source matched literal \\d instead of digits. Corrected by numeric character class and preserved full hover tooltip. Must re-run native screenshots.
