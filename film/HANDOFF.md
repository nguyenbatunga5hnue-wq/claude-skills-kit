# Bàn giao: phim "Giữ lửa" (20/11), chuyển từ phiên cloud sang máy tính

Tài liệu này gom mọi thứ của phiên làm việc trên cloud, để tiếp tục trên máy tính bằng Claude Code.
**Nếu bạn là Claude trong phiên mới: đọc hết file này, rồi đọc film/parts/BRIEF.md và film/parts/AGENTS.md.**

## 1. Dự án là gì

- Người dùng là thầy giáo dạy IELTS (học sinh gọi là "thầy"). Phim tri ân 20/11 về chính thầy và gia đình ba thế hệ đứng lớp: **bà** (giáo viên nghỉ hưu, nghe kém) → **mẹ** (chủ nhiệm cấp 1) → **thầy**.
- Thông điệp: thầy truyền lửa, gieo mầm cho học trò, rồi học trò sưởi ấm lại thầy. Sợi chỉ xuyên suốt là **cây đèn dầu thật của bà**: chưa thắp ở đầu phim, đã thắp ở cuối. Nến của lớp nối với ngọn đèn đó. Phim mở và kết ở cùng khung cửa sổ nhà bà.
- Dài **3:35**, một bản nhạc piano và giọng dẫn của thầy. Màu ấm, bão hoà thấp, hoài niệm. Đăng Facebook.
- Giao tiếp với người dùng bằng **tiếng Việt**.

## 2. Tài liệu trong repo (nhánh `film/giu-lua-screenplay`)

| File | Nội dung |
|---|---|
| `film/parts/BRIEF.md` | **Tóm tắt chung**: dòng thời gian 8 cảnh, 11 câu lời dẫn, tư liệu, kỹ thuật, quy tắc |
| `film/parts/AGENTS.md` | Lệnh giao việc cho 3 agent con (intro, kỷ niệm, kịch bản và âm thanh) và các bước của agent điều phối |
| `film/05-kich-ban-quay.md` | Kịch bản quay: danh sách cảnh mã 1A–8E (⭐ là bắt buộc), lời dẫn L1–L11, câu hỏi cho bà, lịch quay, cài đặt máy |
| `film/04-visual-bible.md` | Quy chuẩn màu (công thức CapCut), font, cách quay, âm thanh |
| `film/03-screenplay.fountain` | Kịch bản v2 (4:15). **Đã bị thay** bằng bản 3:35 trong Google Doc, chỉ để tham khảo |
| `film/demo/` | Dự án Remotion: `Demo` (animatic cả phim 1280x720), `Photo` (clip nến đóng băng thành ảnh in) |
| `film/export/noi-video-me-con.sh` | Script ffmpeg nối clip mẹ → thầy bằng cú zoom khớp bút đỏ |

Kịch bản gốc của người dùng nằm trong Google Doc "kịch bản" (ID `1KrYGURXGVLllQS_5ckIIu17C6SPrB-xaFIfghtkNUtA`). Phía dưới bản gốc có phần góp ý và bản chỉnh sửa 3:35 ("GÓP Ý VÀ BẢN CHỈNH SỬA, LẦN 2").

## 3. Đã làm xong

1. **Kịch bản**: v1 → v2, rồi bản 3:35 trong Google Doc (8 cảnh, có cảnh quà/thiệp, nến chỉ là cảnh nối với đèn dầu, lời chúc tách riêng).
2. **Phân tích màu** từ clip TikTok tham chiếu, viết thành `04-visual-bible.md`.
3. **Animatic demo** 3:35 bằng Remotion, có bản ghép nhạc "Người gieo mầm xanh".
4. **Tư vấn đăng Facebook**: 1080p H.264 ~8 Mbps, AAC 48 kHz, −14 LUFS, ≤ −1 dBTP, phụ đề in cứng. Nhạc có rủi ro bản quyền (bài hát + bản cover piano của người khác): đăng thử ở chế độ "Chỉ mình tôi" trước, hoặc thay bằng nhạc miễn phí bản quyền.
5. **Kịch bản quay** `05-kich-ban-quay.md`.
6. **Nối clip mẹ → thầy** (`me-va-con-noi.mp4`, 22,1 giây):
   - Clip mẹ cắt ở giây 16,0. Từ giây 14,0 hình đẩy zoom vào ngòi bút.
   - Mờ chuyển 1 giây (15,0–16,0). Ở giữa đoạn mờ, bút bi đỏ của mẹ và bút dạ đỏ của thầy trùng vị trí và cùng góc nghiêng.
   - Sau đó clip thầy lùi zoom ra toàn cảnh lớp.
   - Clip thầy được chuyển HDR → SDR và kéo ấm. Tiếng clip thầy +3,4 dB cho bằng clip mẹ.
   - Người dùng đã duyệt bản này.
7. **Clip nến → ảnh in** (`lop-thanh-anh.mp4`, 11,4 giây):
   - Khung hình cuối đóng băng, có chớp trắng và tiếng màn trập.
   - Hình thu nhỏ thành tấm ảnh in viền trắng nghiêng −3°, nền là chính ảnh làm mờ và tối. Ảnh ngả vàng dần, có vệt sáng lướt qua mặt ảnh.
   - Chữ viết tay "20 · 11 · 2026" hiện ở mép dưới. Ảnh lắc nhẹ như đang cầm trên tay, rồi tối dần.
8. **Chia việc cho agent**: đã viết BRIEF và AGENTS. Ba agent con đã chạy rồi bị **dừng theo yêu cầu**, vì người dùng sẽ làm trên máy tính với tư liệu thật. Chưa có sản phẩm nào của agent.

## 4. Việc tiếp theo

1. Người dùng chép tư liệu vào `film/media/` (mục 5).
2. Agent chính đọc `film/parts/AGENTS.md`, phân loại tư liệu mới, rồi chạy 3 agent con song song (chạy nền).
3. Khi 3 agent xong, agent chính làm bước điều phối: ghép bản 3:35, trộn âm, kiểm tra chất lượng, báo cáo danh sách tư liệu còn thiếu.
4. Còn mở:
   - Câu nói thật của bà: mẹ hỏi bà theo 5 câu gợi ý trong `05-kich-ban-quay.md`, chọn một câu.
   - Làm LUT `.cube` khi có clip quay thử.
   - Chọn nhạc miễn phí bản quyền thay thế nếu cần.
   - Xuất bản cuối cho Facebook.

## 5. Cài đặt trên máy tính

### Lấy code

```bash
git clone https://github.com/nguyenbatunga5hnue-wq/claude-skills-kit.git
```

```bash
cd claude-skills-kit
```

```bash
git checkout film/giu-lua-screenplay
```

Nếu đã clone repo từ trước, chỉ cần `git fetch origin` rồi `git checkout film/giu-lua-screenplay` và `git pull`.

### Công cụ cần có
- **Node.js 18 trở lên** và **ffmpeg** (cần có bộ lọc `zscale` để đổi clip HDR của iPhone; kiểm tra bằng `ffmpeg -filters | grep zscale`):
  - macOS: `brew install node ffmpeg`
  - Windows: cài Node từ nodejs.org và bản ffmpeg "full" của gyan.dev
- Cài Remotion cho dự án (chạy từ thư mục gốc repo):

```bash
cd film/demo && npm install
```

- Skill của repo (teacher-tribute-film, shot-list-generator, quality-control) nằm trong `.claude/skills` và tự có khi mở Claude Code ở thư mục repo. Muốn cài thêm bộ skill đầy đủ: `bash install.sh` ở thư mục gốc repo.

### Đặt tư liệu vào `film/media/` (không đưa lên git)

| File gốc bạn đã gửi trong phiên cloud | Đổi tên thành |
|---|---|
| Video mẹ đứng lớp (`1K6VHRTSS_3P52PM.mov`) | `film/media/me-day-lop.mov` |
| Video thầy chữa bài (`IMG_0765.mov`) | `film/media/thay-chua-bai.mov` |
| Video cả lớp cầm nến (`IMG_0790.mov`) | `film/media/lop-cam-nen.mov` |
| Nhạc "Người gieo mầm xanh" piano (.mp3) | `film/media/nhac-nguoi-gieo-mam-xanh.mp3` |
| Tư liệu mới tải từ Drive | để nguyên trong `film/media/`, Claude sẽ phân loại |

Các bản dựng đã gửi trong chat (`me-va-con-noi.mp4`, `lop-thanh-anh.mp4`, `giu-lua-demo.mp4`, `giu-lua-demo-nhac.mp4`) đặt vào `film/export/`. Nếu không còn file, tạo lại bằng các lệnh dưới đây.

### Tạo lại các bản dựng

Nối mẹ → thầy (chạy từ thư mục gốc repo):

```bash
film/export/noi-video-me-con.sh film/media/me-day-lop.mov film/media/thay-chua-bai.mov film/export/me-va-con-noi.mp4
```

Nến → ảnh in. Bước 1, chuẩn bị tư liệu cho Remotion:

```bash
mkdir -p film/demo/public && ffmpeg -y -i film/media/lop-cam-nen.mov -map 0:v -map 0:a:0 -vf "zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,fps=30,eq=contrast=0.94:saturation=0.95,colorbalance=rm=0.03:bm=-0.05:rh=0.02:bh=-0.03" -c:v libx264 -crf 14 -c:a aac -b:a 192k -ar 48000 film/demo/public/lop.mp4
```

Bước 2, lấy khung hình cuối:

```bash
ffmpeg -y -sseof -0.1 -i film/demo/public/lop.mp4 -update 1 -q:v 1 film/demo/public/lop-cuoi.png
```

Bước 3, tạo tiếng màn trập:

```bash
ffmpeg -y -f lavfi -i "anoisesrc=d=0.04:c=white:a=0.9:r=48000" -f lavfi -i "anoisesrc=d=0.05:c=pink:a=0.8:r=48000" -filter_complex "[0]highpass=f=1800,afade=t=out:st=0:d=0.04[a];[1]highpass=f=900,lowpass=f=7000,afade=t=out:st=0:d=0.05,adelay=85[b];[a][b]amix=inputs=2:normalize=0,volume=-6dB,apad=pad_dur=0.3,aformat=channel_layouts=stereo" film/demo/public/shutter.wav
```

Bước 4, render:

```bash
cd film/demo && npm run render:photo
```

Animatic cũ (`Demo`) cũng render được: `cd film/demo && npm run render:demo`.

## 6. Ghi chú kỹ thuật đã rút ra

- **Clip iPhone HDR (HLG, Dolby Vision)**: luôn chuyển SDR bằng chuỗi `zscale ... tonemap=hable` ở trên, nếu không màu sẽ chói khi đăng. Kéo ấm nhẹ (`colorbalance`) cho hợp màu clip của mẹ.
- **ffmpeg zoom động**: `crop` chỉ tính `iw`/`ih` một lần lúc khởi tạo. Vì vậy vị trí crop phải viết theo `t` (xem `noi-video-me-con.sh`), không viết theo `iw-1920`.
- Clip mẹ chỉ có 480p, nên đoạn đẩy zoom bị mềm hình. Nếu có bản gốc nét hơn thì thay vào.
- Trên cloud, Remotion cần `--browser-executable`. Trên máy tính thì không cần, Remotion tự tải trình duyệt.
- Không commit video. `.gitignore` đã bỏ qua `*.mp4`, `*.wav`, `film/media/`, `film/parts/**/out/`, `film/demo/public/`.
