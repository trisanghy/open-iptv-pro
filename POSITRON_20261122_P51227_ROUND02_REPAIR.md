# Positron P5.1.227 — Sửa lỗi vòng 02 sau khi mở ảnh thật P5.1.226

## Bằng chứng P5.1.226 CHƯA ĐẠT
Ảnh Electron `positron-p51226-channel-jump-before-1920x1080-real.png` và `...after...` cho thấy tiêu đề Danh sách kênh xuống 2 dòng. Khi chọn 250, `scrollIntoView` kéo `.main .content` lên che đầu sidebar và player. P5.1.226 không được tính hoàn thành chỉ vì CI xanh.

## P5.1.227 sửa nguyên nhân gốc
Cuộn trực tiếp `#channelList.scrollTop` theo bounding rectangles để giữ vị trí trang TV và focus row. Thu nhỏ tiêu đề, giữ một dòng, không bỏ nút ẩn danh sách hay refresh. Ảnh before/after 1920×1080 đo outerPageStayed, headerOneLine, videoTopVisible, focus hàng 400; giữ playlist, stream, Favorite, DVR và Cast. CANDIDATE cho tới khi kiểm tra ảnh thật và Release.
