# P344 / vòng 01/20 — CANDIDATE
Baseline P5.1.343 / 4.23.428, HEAD 7b4830f8bceaf4551b6bc6582d9e9cb51aa566f4.
Đã mở trực tiếp ảnh Electron P343 trước/sau 720x900 từ GitHub Actions fast 45274413610, artifact 14864644387.
New: PageUp/PageDown di chuyển ±5 đề xuất AI khi focus nút Xem, clamp, không autoplay, model/M3U bất biến.
Blocker: CI capture 45274413917 fail P334 vì so tabGap=-93 sau khi P342 đã cuộn bảng để focus. Không xóa test: nay xác minh CSS margin 9px và heading/action không bị sticky bar che.
Tests: tests/positron-344.test.cjs; native Electron scripts/positron-344-audit.cjs, 4 PNG 1920/720. Chưa xác nhận pass cho đến khi CI+ảnh SAU đã mở; đây là candidate.
Stable Releases không phát hành từ nhánh này.
