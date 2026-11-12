# Giao việc cho các agent con

Dùng trong phiên Claude Code trên máy tính, mở ở thư mục gốc repo `claude-skills-kit`, nhánh `film/giu-lua-screenplay`.
Agent chính đóng vai **điều phối**. Agent này khởi chạy 3 agent con song song (chạy nền), chờ cả ba xong rồi tự ghép bản tổng (bước 4).
Mọi đường dẫn bên dưới tính từ thư mục gốc repo.

Trước khi giao việc, agent điều phối cần:
1. `ls film/media` để biết tư liệu nào đã có. Đổi tên file mới cho dễ hiểu nếu cần (ví dụ `kyniem-01.mov`, `chuc-<ten>.mov`, `1A.mov`) và ghi danh sách vào `film/media/DANH-SACH.md`.
2. Chèn danh sách đó vào lệnh giao việc của từng agent, để cảnh nào có tư liệu thật thì dùng tư liệu thật thay placeholder.

---

## 1. Agent INTRO (0:00–0:55)

> Bạn là agent phụ trách PHẦN INTRO của phim tri ân 20/11 "Giữ lửa". Đọc kỹ film/parts/BRIEF.md trước tiên. Thư mục làm việc: film/parts/intro/.
>
> Phạm vi: 0:00–0:55, gồm cảnh 1 (Nhà bà), T1 (mặt bà → mặt mẹ), cảnh 2 (Mẹ), T2 (bút mẹ → bút thầy).
>
> 1. Thẻ mở đầu: màn hình đen, một dòng chữ thường nhỏ Be Vietnam Pro Light, ví dụ "nhà mình có một cây đèn dầu", fade in/out khoảng 3 giây. Có thể thêm tiêu đề "Giữ lửa" ở điểm hợp lý.
> 2. Dựng rough cut dài đúng 55 giây (1920x1080, 30 fps) bằng Remotion: tạo film/demo/src/Intro.tsx, đăng ký Composition "Intro" trong film/demo/src/Root.tsx (chỉ thêm). Tư liệu đặt trong film/demo/public/intro/.
>    - Cảnh 1 và T1: dùng tư liệu bà nếu có trong film/media; nếu chưa có thì làm placeholder trang nhã theo tông màu phim (nền ấm tối, mã cảnh và mô tả, chuyển động nhẹ), đúng thời lượng.
>    - Cảnh 2 + T2: mẹ ở film/media/me-day-lop.mov. Bản nối mẹ → thầy: film/export/me-va-con-noi.mp4 (mờ chuyển 15,0–16,0 giây, bút đỏ khớp vị trí). Chọn đoạn sao cho điểm nối bút đỏ rơi vào 0:52–0:55, và phần lớp IELTS sau điểm nối không vượt quá 0:55.
>    - Màu phần mẹ nhạt và ngả vàng hơn phần thầy (bảng "Thời mẹ" trong film/04-visual-bible.md).
>    - Phụ đề in cứng L1, L2 (Be Vietnam Pro Light, chữ thường, trắng 90%, giữa dưới, cách đáy ~8%). Ghi thời điểm vào/ra.
>    - Giữ tiếng gốc clip mẹ nhỏ làm nền. Không lo nhạc.
> 3. Render film/parts/intro/out/intro.mp4, trích khung hình xem lại, sửa.
> 4. Viết film/parts/intro/BAO-CAO.md: cấu trúc từng giây, file đầu ra, placeholder kèm mã cảnh (khớp film/05-kich-ban-quay.md), cách thay bằng clip thật, thời điểm phụ đề.
>
> Không commit/push git. Cuối cùng trả về tóm tắt ngắn.

## 2. Agent KỶ NIỆM VỚI HỌC SINH (0:55–3:18)

> Bạn là agent phụ trách PHẦN KỶ NIỆM VỚI HỌC SINH của phim tri ân 20/11 "Giữ lửa". Đọc kỹ film/parts/BRIEF.md trước tiên. Thư mục làm việc: film/parts/ky-niem/.
>
> Phạm vi: 0:55–3:18 (143 giây), gồm cảnh 3 (Lớp thầy), 4 (Đêm chấm bài), 5 (Hộp quà, thiệp), 6 (Lời chúc), 7 (Nến), T3 (ảnh in → tay bà).
>
> 1. Dựng rough cut đúng 143 giây (1920x1080, 30 fps) bằng Remotion: tạo film/demo/src/KyNiem.tsx, đăng ký Composition "KyNiem" trong film/demo/src/Root.tsx (chỉ thêm). Tư liệu đặt trong film/demo/public/ky-niem/.
>    - Cảnh 3 (30 giây): film/media/thay-chua-bai.mov (HDR → SDR; 2 giây đầu đã dùng cho điểm nối ở intro, nên bắt đầu từ đoạn lùi máy ra toàn cảnh) + các video kỷ niệm lớp trong film/media (dựng nhịp nhanh, 2–4 giây mỗi đoạn, chọn khoảnh khắc học sinh nói, sai, cười to). Thiếu thì placeholder "clip kỷ niệm lớp #n".
>    - Cảnh 4, 5: tư liệu thật nếu có, nếu không thì placeholder mã 4A–4D, 5A–5G. Cảnh 5 có hiệu ứng chữ thiệp viết tay hiện từng chữ (Dancing Script); dùng lời thật trên thiệp nếu có ảnh thiệp.
>    - Cảnh 6 (45 giây): video lời chúc trong film/media, mỗi lời chúc một đoạn, lower-third tên học sinh/khoá học chữ thường nhỏ, sắp từ nhẹ đến xúc động. Thiếu thì placeholder.
>    - Cảnh 7 + T3 (3:00–3:18): film/export/lop-thanh-anh.mp4 hoặc dựng lại từ film/demo/src/Photo.tsx cho vừa 18 giây. T3 là tay bà cầm ảnh in thật (placeholder nếu chưa có).
>    - Màu đúng tông thời thầy trong visual bible; cảnh nến để ánh lửa là nguồn sáng chính.
>    - Phụ đề in cứng L3–L11: L3–L4 cảnh 3, L5–L6 cảnh 4, L7–L9 cảnh 5, L10–L11 cuối cảnh 6/đầu cảnh 7. Ghi thời điểm theo giờ cả phim.
>    - Giữ tiếng gốc clip vừa phải; lời chúc phải nghe rõ. Không lo nhạc.
> 2. Render film/parts/ky-niem/out/ky-niem.mp4, trích khung hình xem lại, sửa.
> 3. Viết film/parts/ky-niem/BAO-CAO.md: cấu trúc theo giây cả phim, placeholder và tư liệu còn thiếu, cách thay, thời điểm phụ đề.
>
> Không đụng file của agent khác. Không commit/push git. Cuối cùng trả về tóm tắt ngắn.

## 3. Agent KỊCH BẢN VÀ ÂM THANH

> Bạn là agent phụ trách KỊCH BẢN VÀ ÂM THANH của phim tri ân 20/11 "Giữ lửa". Đọc kỹ film/parts/BRIEF.md trước tiên. Thư mục làm việc: film/parts/kich-ban-am-thanh/. Có thể dùng skill quality-control và teacher-tribute-film.
>
> 1. film/parts/kich-ban-am-thanh/loi-dan.md: chốt 11 câu L1–L11, gán cảnh và thời điểm, kiểm tra tốc độ đọc (~3–3,5 âm tiết/giây), đề xuất chỉnh nếu câu quá dài nhưng giữ giọng mộc mạc; hướng dẫn thu âm (nhấn, ngừng, cảm xúc từng câu).
> 2. phu-de.srt: UTF-8 NFC, ≤ 42 ký tự/dòng, ≤ 2 dòng, ≥ 1 giây, theo giờ cả phim 0:00–3:35. Khớp với thời điểm trong BAO-CAO.md của intro và ky-niem nếu đã có; nếu chưa thì đề xuất và ghi rõ.
> 3. Nhạc nền film/media/nhac-nguoi-gieo-mam-xanh.mp3: phân tích (độ dài, đoạn lặng, cao trào; ffmpeg astats/ebur128/silencedetect). Lập cue sheet: cao trào rơi vào cảnh nến/lời chúc, hạ nhạc nhường lời dẫn/lời chúc. Render out/nhac-nen.wav đúng 215 giây, 48 kHz stereo. (Bản demo trước dùng: bỏ 1,6 giây đầu, hạ còn 0,45 ở 85–102 giây, còn 0,35 ở 135–180 giây, fade in 1 giây, fade out từ 209 giây trong 6 giây.)
> 4. Tiếng động tổng hợp bằng ffmpeg lavfi nếu được (quẹt diêm, room tone, lật trang) trong out/sfx/; nếu không giống thì ghi để người dùng thu thật.
> 5. tron-am.sh: trộn video + lời dẫn (khi có) + nhạc + sfx, ducking, loudnorm 2 lượt về −14 LUFS / ≤ −1 dBTP, in cứng phụ đề SRT bằng Be Vietnam Pro Light (font trong film/demo/node_modules/@fontsource/be-vietnam-pro; có thể cần chuyển woff2 → ttf), xuất H.264 1080p ~8 Mbps, AAC 48 kHz 192 kbps. Chạy thử với film/export/giu-lua-demo.mp4.
> 6. Ghi chú bản quyền nhạc "Người gieo mầm xanh" trên Facebook và phương án thay thế.
> 7. BAO-CAO.md: tóm tắt, file đầu ra, cue sheet, việc người dùng cần làm.
>
> Không đụng file của agent khác. Không commit/push git. Cuối cùng trả về tóm tắt ngắn.

## 4. Agent ĐIỀU PHỐI (agent chính, sau khi 3 agent con xong)

1. Đọc 3 file BAO-CAO.md. Đối chiếu thời lượng (intro 55 giây, ky-niem 143 giây, kết 17 giây) và thời điểm phụ đề giữa các agent, sửa chỗ lệch.
2. Dựng cảnh 8 (Kết, 3:18–3:35): bà cất ảnh vào album, đèn dầu đã thắp, cùng khung cửa sổ cảnh 1 (placeholder nếu chưa có), thẻ chữ kết.
3. Ghép thành film/parts/master/out/giu-lua-rough.mp4 (215 giây), rồi chạy film/parts/kich-ban-am-thanh/tron-am.sh để ra bản có nhạc, phụ đề, đúng chuẩn Facebook.
4. Chạy skill quality-control trên bản ghép. Viết film/parts/master/BAO-CAO.md: bản dựng, lỗi còn lại, **danh sách tư liệu người dùng còn phải quay/gửi** theo mã cảnh.
5. Commit code và tài liệu (không commit video), đẩy lên nhánh film/giu-lua-screenplay.
