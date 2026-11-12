# Brief chung cho các agent: phim "Giữ lửa" (20/11)

## Phim là gì
Phim tự sự cinematic 3:35 tri ân một thầy giáo IELTS (học sinh gọi là "thầy") và gia đình ba thế hệ đứng lớp:
bà (giáo viên đã nghỉ hưu, nghe kém) → mẹ (giáo viên chủ nhiệm cấp 1) → thầy (dạy IELTS).
Thông điệp: thầy truyền lửa, gieo mầm cho học trò, rồi chính học trò sưởi ấm lại thầy.
Sợi chỉ xuyên suốt: cây đèn dầu thật của bà, chưa thắp ở đầu phim, đã thắp ở cuối phim. Nến của cả lớp nối với ngọn đèn đó.
Phim mở và kết ở cùng khung cửa sổ nhà bà. Đăng Facebook: 1920x1080, H.264, AAC 48 kHz, −14 LUFS, đỉnh ≤ −1 dBTP, phụ đề tiếng Việt in cứng.

## Dòng thời gian (giây)
| Cảnh | Thời gian | Nội dung |
|---|---|---|
| 1 Nhà bà | 0:00–0:25 | Bà bên cửa sổ, lật album, ảnh bà thời trẻ, đèn dầu chưa thắp |
| T1 | 0:25–0:30 | Mặt bà trong ảnh cũ → mặt mẹ |
| 2 Mẹ | 0:30–0:52 | Mẹ đứng lớp, phấn "Bài 10", chữa vở bằng bút đỏ |
| T2 | 0:52–0:55 | Bút đỏ của mẹ → bút đỏ của thầy (ĐÃ CÓ: film/export/me-va-con-noi.mp4) |
| 3 Lớp thầy | 0:55–1:25 | Lớp IELTS, học sinh dám nói, dám sai, cười to |
| 4 Đêm | 1:25–1:42 | Chấm bài đến khuya, cơm nguội |
| 5 Hộp quà | 1:42–2:15 | Mở tủ quà, đọc thiệp |
| 6 Lời chúc | 2:15–3:00 | Video học sinh chúc 20/11 |
| 7 Nến | 3:00–3:15 | Cả lớp cầm nến (ĐÃ CÓ: film/export/lop-thanh-anh.mp4, kết thành tấm ảnh in "20 · 11 · 2026") |
| T3 | 3:15–3:18 | Tấm ảnh in → tay bà cầm ảnh thật |
| 8 Kết | 3:18–3:35 | Bà cất ảnh vào album, đèn dầu đã thắp, cùng khung cửa sổ cảnh 1 |

## Lời dẫn (giọng thầy, thu sau)
L1 "Nhà mình có ba thế hệ đứng lớp." · L2 "Bà truyền cho mẹ. Mẹ truyền cho mình." · L3 "Lớp của mình không có phấn trắng, bảng đen." · L4 "Nhưng có những đứa trẻ dám nói, dám sai, và dám cười thật to." · L5 "Cũng có những đêm chấm bài đến sáng, những bữa cơm nguội lúc nào không hay." · L6 "Có lúc mình tự hỏi, ngọn lửa trong mình còn đủ không." · L7 "Mỗi món quà là một khoá học, một lứa học trò." · L8 "Mình giữ hết." · L9 "Vì những đêm như thế này, mình lại mở ra đọc." · L10 "Mình cứ nghĩ, thầy là người thắp lửa…" · L11 "…hoá ra chính các em đã sưởi ấm lại cho mình."

## Tài liệu trong repo (đọc khi cần)
- film/04-visual-bible.md: màu (vàng be, bóng nâu ấm, sáng trắng kem, bão hoà thấp), font Be Vietnam Pro Light (phụ đề) và Dancing Script (chữ viết tay), cách dùng âm thanh.
- film/05-kich-ban-quay.md: danh sách cảnh cần quay (mã 1A–8E), lời dẫn, lịch quay.
- film/demo/: dự án Remotion 4 (cài bằng `npm install` trong film/demo; có @fontsource/be-vietnam-pro và dancing-script). src/Demo.tsx là animatic minh hoạ cả phim, src/Photo.tsx là hiệu ứng "đóng băng thành ảnh in". Dùng lại cách làm của chúng.

## Tư liệu thật hiện có
Tất cả tư liệu gốc đặt trong `film/media/` (thư mục này không đưa lên git). Tên chuẩn:
  - `film/media/me-day-lop.mov`: mẹ đứng lớp cấp 1 (854x480, 30 fps, SDR, 23,5 giây)
  - `film/media/thay-chua-bai.mov`: thầy chữa bài bằng bút dạ đỏ ở lớp IELTS (1080p60, HDR HLG, 7 giây)
  - `film/media/lop-cam-nen.mov`: cả lớp IELTS cầm nến (1080p60, HDR HLG, 6,9 giây)
  - `film/media/nhac-nguoi-gieo-mam-xanh.mp3`: nhạc "Người gieo mầm xanh" bản piano (có rủi ro bản quyền khi đăng Facebook)
  - Tư liệu mới người dùng thêm vào (video kỷ niệm, lời chúc, cảnh bà...) cũng nằm trong `film/media/`. Xem danh sách thực tế bằng `ls film/media`.
- Bản dựng đã có (tạo lại được bằng script, xem film/HANDOFF.md): `film/export/me-va-con-noi.mp4` (22,1 giây, đã nối mẹ → thầy, mờ chuyển 15,0–16,0 giây), `film/export/lop-thanh-anh.mp4` (11,4 giây, nến → ảnh in), `film/export/giu-lua-demo.mp4` (animatic cả phim).
- Có thể CHƯA có: cảnh bà, ảnh bà thời trẻ, đèn dầu, cảnh đêm, hộp quà, video lời chúc, giọng dẫn. Phần nào thiếu thì làm **placeholder** rõ ràng (thẻ chữ ghi mã cảnh, ví dụ "1A · tay bà lật album") để thay sau, KHÔNG bịa hình người thật.

## Kỹ thuật
- Clip iPhone HDR HLG → SDR: `zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p`
- Render Remotion (chạy trong film/demo, sau `npm install`): `npx remotion render src/index.ts <Id> <out.mp4> --concurrency=3 --log=error`. Ảnh tĩnh: `npx remotion still ... --frame=N`. Xem trước: `npm run studio`.
- Đầu ra 1920x1080, 30 fps.

## Quy tắc làm việc chung
- Mỗi agent CHỈ ghi vào thư mục của mình trong film/parts/<phần>/ (và, nếu cần Remotion, file src/<TênPhần>.tsx riêng trong film/demo/src kèm 1 dòng đăng ký Composition trong film/demo/src/Root.tsx; không sửa composition của người khác).
- Không git commit, không git push: agent điều phối chính sẽ commit.
- File video (.mp4, .mov, .wav) không đưa vào git; đặt trong film/parts/<phần>/out/.
- Mỗi agent viết film/parts/<phần>/BAO-CAO.md bằng tiếng Việt: đã làm gì, file đầu ra (đường dẫn, độ dài), phần nào là placeholder, việc người dùng cần cung cấp thêm.
- Tự xem lại sản phẩm bằng cách trích khung hình (ffmpeg tile) trước khi báo xong.
