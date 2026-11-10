# Lớp học Editor: dựng video cùng Claude

Một trình dựng video chạy trên trình duyệt, giống quy trình "Claude dựng, người chỉnh" trong các video TikTok:

1. **Claude dựng bản đầu** bằng cách viết `project.json`: cắt cảnh, zoom từng cảnh, chữ graphic, chữ dẫn, nhãn.
2. **Bạn mở editor** để kéo chữ, đổi cỡ, sửa nội dung, dời khung hình, kéo điểm cắt trên timeline.
3. Muốn nhờ Claude thì **ghi chú vào ô "Ghi chú cho Claude"**, bấm **Lưu**, rồi nói với Claude: *"xem ghi chú trong editor"*.
4. Claude sửa `project.json`, editor **tự tải lại** (hiện thông báo "Claude vừa cập nhật dự án").
5. Bấm **Xuất video** để ra MP4 1080×1920 (9:16) cho TikTok/Reels.

Preview và file xuất dùng **chung một bộ vẽ** (`public/render.js`), nên thấy gì trên editor thì ra đúng như vậy.

## Chạy

```bash
npm install                                         # font Be Vietnam Pro (có tiếng Việt)
npm run media -- duong/dan/video.mov                # tạo proxy + khung hình để xuất
npm start                                           # mở http://localhost:4321
npm run export -- --out out/video.mp4               # xuất không cần mở editor (server phải đang chạy)
npm run notes                                       # in mọi ghi chú cho Claude
```

Cần: Node 18+, ffmpeg, Playwright + Chromium (để xuất).

Server chỉ nhận yêu cầu tới `localhost`/`127.0.0.1`. Nếu mở qua tên miền khác (proxy xem trước, máy khác trong mạng), chạy với `HOST=0.0.0.0 ALLOWED_HOSTS=ten-mien:cong npm start`.

## Cấu trúc `project.json`

| Trường | Ý nghĩa |
|---|---|
| `scenes[]` | Track **Cảnh**: `start`/`end` trên timeline, `srcIn` = lấy từ giây nào của video gốc, `zoom: [đầu, cuối]` (zoom chậm trong cảnh), `focus: [x, y]` (tâm khung, 0–1) |
| `layers[]` | Các lớp chữ. `track`: `graphic` (chữ to), `chu` (chữ dẫn/phụ đề), `them` (nhãn nhỏ) |
| `layers[].text` | `\n` để xuống dòng, `[từ]` để tô màu nhấn |
| `layers[].style` | `highlight` (nền vàng), `outline` (viền đen), `gold` (chữ vàng), `label` (nhãn), `subtitle` (phụ đề) |
| `layers[].anim` | `pop`, `fade`, `slide`, `type` (gõ chữ), `none` |
| `layers[].x`, `y`, `size` | Tâm chữ (0–1 theo khung 1080×1920) và cỡ chữ (px) |
| `note` | Ghi chú của người dùng cho Claude |
| `reply` | Claude trả lời ghi chú (hiện trong editor) |
| `edited` | Người dùng đã tự chỉnh thành phần này. Claude nên giữ nguyên |

## Quy trình cho Claude khi được nhờ "xem ghi chú trong editor"

1. `npm run notes` để đọc các ghi chú.
2. Sửa `project.json` theo ghi chú. Không đụng vào thứ người dùng đã chỉnh (`edited: true`) trừ khi ghi chú yêu cầu.
3. Với mỗi ghi chú đã xử lý: xoá `note`, ghi `reply` ngắn gọn ("Đã tăng cỡ chữ lên 110 và đổi sang nền vàng").
4. Editor tự tải lại. Kiểm tra bằng cách xuất thử vài khung hoặc cả video.

Mỗi lần bấm **Lưu**, bản trước được giữ trong `history/` (menu **Lịch sử…**).
