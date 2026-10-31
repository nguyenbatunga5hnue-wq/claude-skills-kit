# Bộ skill Claude Code của tôi: tổng hợp và lời nhắn cài đặt

Khi bắt đầu dự án mới: mở session Claude Code, **đính kèm file `claude-skills-kit.tar.gz`**,
rồi dán nguyên khối "Lời nhắn để dán" bên dưới.
(Nếu bộ kit đã có trên GitHub, bỏ file đính kèm và thay bước 1 bằng `git clone <url repo>`.)

---

## Lời nhắn để dán

```text
Cài bộ skill Claude Code của tôi cho dự án này:

1. Giải nén file claude-skills-kit.tar.gz tôi vừa đính kèm vào ~/claude-skills-kit
   (nếu không thấy file, hỏi tôi, đừng tự tạo lại nội dung).
2. Đọc ~/claude-skills-kit/install.sh trước khi chạy, rồi chạy:
     bash ~/claude-skills-kit/install.sh --project .
   Lệnh này cài skill vào .claude/skills/ của dự án này (thêm --libs . nếu dự án cần
   thư viện animation/3D/video; bỏ --project . nếu muốn cài cho mọi dự án).
   Script tải skill bên thứ ba ở đúng commit đã kiểm tra; không dùng --latest.
3. Không ghi đè file nào của dự án ngoài các thư mục skill cùng tên.
4. Báo lại: số skill đã cài, plugin nào cài lỗi, và việc tôi cần làm thêm
   (khởi động lại session, API key còn thiếu).
```

---

## Danh sách đã cài (62 skill, 19 plugin, 21 thư viện)

### Skill tự tạo (3), nằm trong bộ kit
| Skill | Dùng khi |
|---|---|
| `teacher-tribute-film` | Làm phim tri ân 20/11: brief → kịch bản → visual bible → âm thanh → sản xuất → hậu kỳ |
| `shot-list-generator` | Biến kịch bản đã duyệt thành shot list CSV có timecode, kèm script kiểm tra và lịch quay |
| `quality-control` | Kiểm tra kịch bản, shot list và video (loudness, khung đen, phụ đề tiếng Việt, thông số xuất) |

### Skill bên thứ ba (59), tải từ repo gốc theo commit đã khóa
| Nguồn | Skill |
|---|---|
| remotion-dev/skills (12) | remotion-best-practices, -create, -render, -studio, -captions, -maps, -markup, -multimedia, -interactivity, -saas, -docs, -upgrade |
| greensock/gsap-skills (8) | gsap-core, -timeline, -scrolltrigger, -react, -frameworks, -plugins, -utils, -performance |
| motiondivision/ai-kit (1) | motion |
| anthropics/skills (19) | frontend-design, canvas-design, algorithmic-art, theme-factory, brand-guidelines, slack-gif-creator, web-artifacts-builder, webapp-testing, mcp-builder, claude-api, docx, pdf, pptx, xlsx, doc-coauthoring, internal-comms, skill-creator, academy-guide, discernment-nudge |
| ComposioHQ/awesome-claude-skills (18) | content-research-writer, twitter-algorithm-optimizer, competitive-ads-extractor, domain-name-brainstormer, lead-research-assistant, meeting-insights-analyzer, invoice-organizer, file-organizer, tailored-resume-generator, raffle-winner-picker, changelog-generator, developer-growth-analysis, langsmith-fetch, skill-share, image-enhancer, video-downloader, connect, connect-apps |
| akseolabs-seo/cinematic-ui (1) | cinematic-ui |

### Plugin (19), từ anthropics/claude-plugins-official
feature-dev, code-review, pr-review-toolkit, code-simplifier, commit-commands, code-modernization,
claude-security, security-guidance, claude-code-setup, claude-md-management, hookify, plugin-dev,
agent-sdk-dev, mcp-server-dev, playwright, context7, playground, math-olympiad, math-proof

### Thư viện npm (`--libs`) và công cụ
svgo, satori, gsap, animejs, motion, @rive-app/canvas, @lottiefiles/dotlottie-web, remotion,
@remotion/cli, @motion-canvas/core, @motion-canvas/2d, three, @react-three/fiber, @react-three/drei,
@react-three/rapier, @react-three/postprocessing, postprocessing, howler, mediabunny, react, react-dom.
FFmpeg cài riêng (`apt install ffmpeg` / `brew install ffmpeg`).

### API key một số skill cần
`COMPOSIO_API_KEY` (connect, connect-apps) · `LANGSMITH_API_KEY` (langsmith-fetch) ·
`ELEVENLABS_API_KEY` hoặc TTS khác (giọng đọc Remotion)

### Đã xem xét nhưng không cài
- antigravity.google: là IDE desktop của Google, không phải skill
- DenisHumen/cinema-skills: repo mới có khung, chưa có skill nào
- 836 skill composio-skills/*: cần Rube MCP, cài theo app khi cần
