# Hướng dẫn chỉnh sửa video TOEIC trên CapCut

Video dọc **1080×1920 (9:16)**, **30fps**, dài **15 giây**.

## Các thư mục

| Thư mục | Nội dung | Dùng khi |
|---|---|---|
| `01-video-hoan-chinh/` | Video đã ráp xong (có và không có âm thanh) | Muốn sửa nhẹ: cắt, chèn chữ, đổi nhạc |
| `02-nen/` | Nền chuyển động 15s (không chữ, không đồ họa) | Lớp dưới cùng khi ráp lại từ đầu |
| `03-lop-phong-xanh/` | Từng cảnh trên **phông xanh lá** (MP4) | CapCut **điện thoại** hoặc máy tính, dùng *Chroma key* |
| `04-lop-trong-suot-MOV/` | Từng cảnh **nền trong suốt** (ProRes 4444) | CapCut **máy tính**, viền đẹp nhất, không cần xóa phông |
| `05-am-thanh/` | Nhạc nền, hiệu ứng âm thanh, bản mix | Chỉnh âm lượng riêng, thay nhạc |
| `06-logo/` | Logo PNG nền trong suốt 1000×1000 | Dùng lại logo |

Mỗi cảnh có 2 bản:
- **`xx-ten-canh`**: có sẵn chữ.
- **`xx-ten-canh-khong-chu`**: chỉ có đồ họa (khung, thẻ, icon, biểu đồ…). Bạn tự gõ chữ bằng công cụ **Văn bản** của CapCut để sửa nội dung thoải mái.

> Thư mục `04-lop-trong-suot-MOV/` dung lượng lớn nên **không** được đẩy lên GitHub. Hãy tải trực tiếp từ phiên làm việc này.

## Cách ráp lại trên CapCut

1. Tạo dự án mới, chọn tỉ lệ **9:16**.
2. **Track chính:** `02-nen/nen-chuyen-dong-15s.mp4`.
3. **Lớp phủ** (*Lớp phủ / Overlay*): kéo các cảnh vào đúng mốc thời gian ở bảng dưới, phóng toàn màn hình.
   - File phông xanh: chọn clip → **Xóa phông nền → Chroma key** → chấm màu vào vùng xanh, **Cường độ ~ 20–30**, **Đổ bóng ~ 10–20** để hết viền xanh.
   - File MOV trong suốt: kéo vào là dùng được ngay.
4. Thêm các lớp chuyển cảnh `05-wipe-orange`, `06-wipe-blue` và thanh tiến độ `07-progress` lên trên cùng.
5. Âm thanh: thêm `nhac-nen.wav` và `hieu-ung-am-thanh.wav` từ giây 0. Có giọng đọc thì giảm nhạc nền xuống khoảng 30–40%.

## Mốc thời gian (timeline)

| Lớp | Bắt đầu | Kết thúc | Thời lượng |
|---|---|---|---|
| `01-hook` | 0:00.00 | 0:03.20 | 3.20s |
| `05-wipe-orange` (chuyển cảnh 1) | 0:02.80 | 0:03.47 | 0.67s |
| `02-intro` | 0:03.20 | 0:06.13 | 2.93s |
| `06-wipe-blue` (chuyển cảnh 2) | 0:05.80 | 0:06.47 | 0.67s |
| `03-benefits` | 0:06.13 | 0:11.00 | 4.87s |
| `05-wipe-orange` (chuyển cảnh 3) | 0:10.67 | 0:11.33 | 0.67s |
| `04-cta` | 0:11.00 | 0:15.00 | 4.00s |
| `07-progress` (thanh tiến độ) | 0:00.00 | 0:15.00 | 15.00s |

Hiệu ứng âm thanh đã khớp sẵn với các mốc trên: whoosh 0:00 và 0:01.25, riser và impact 0:03, "pop" 0:06.2 / 0:07.8 / 0:09.4, riser và impact 0:11, impact kết 0:14.

## Nội dung chữ (để gõ lại trên bản "không chữ")

**Cảnh 1, Hook (0–3.2s)**
- `TOEIC` (trắng, đậm) · `750+` (vàng, rất to, dấu `+` màu cam). Gợi ý: hiệu ứng chữ *đếm số* hoặc *phóng to*.
- `Chưa biết bắt đầu từ đâu?` xuất hiện ở khoảng giây 1.4, dấu `?` màu cam.

**Cảnh 2, Giới thiệu (3.2–6.1s)**
- `TOEIC` (xanh nhạt, giãn chữ) · `BREAKTHROUGH` (trắng, rất đậm)
- Trong khung viền vàng: `Lộ trình 3 tháng · Mất gốc → 750+`

**Cảnh 3, Lợi ích (6.1–11s)**
- Tiêu đề: `Vì sao chọn` / `TOEIC Breakthrough?` (dòng 2 màu vàng)
- Thẻ 1: `Lộ trình cá nhân hóa`, `Thiết kế riêng theo trình độ của bạn`
- Thẻ 2: `1.000+ câu luyện đề`, `Sát format đề thi thật mới nhất`
- Thẻ 3: `Cam kết đầu ra`, `Không đạt mục tiêu – học lại miễn phí`
- (Chữ trên thẻ màu xanh navy, dòng phụ màu xám `#55627F`)

**Cảnh 4, Kêu gọi (11–15s)**
- `ĐĂNG KÝ NGAY` (trắng)
- Trong con dấu: `GIẢM` · `30%` · `HỌC PHÍ`
- Nút trắng: `Đăng ký học thử miễn phí 👉`
- `☎ 0900 000 000` (vàng) · `Ưu đãi chỉ đến 30/11 · Số lượng có hạn`
- Cuối màn: `TOEIC Breakthrough`

> Tên khóa học, hotline, mức giảm giá và hạn ưu đãi đang là **nội dung mẫu**. Hãy thay bằng thông tin thật.

## Font chữ & màu sắc

- **Font:** *Inter* (ExtraBold / Black) hỗ trợ đầy đủ tiếng Việt. CapCut không có thì dùng *Be Vietnam Pro* hoặc *Montserrat*.

| Màu | Mã |
|---|---|
| Xanh navy (nền) | `#0B1B3F` |
| Xanh navy sáng | `#13306B` |
| Cam (điểm nhấn) | `#FF7A1A` |
| Vàng | `#FFC93C` |
| Xanh da trời | `#5AB8FF` |
| Trắng | `#FFFFFF` |

## Bản quyền âm thanh

Nhạc nền và hiệu ứng âm thanh được tạo bằng code riêng cho video này, **không vướng bản quyền**, dùng thoải mái trên TikTok, Facebook, YouTube.
