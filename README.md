# claude-skills-kit

My Claude Code setup for video, animation and storytelling projects: custom skills,
an installer for third-party skills and plugins, and the motion library stack.

## Quick start

For a new project, see `SETUP-PROMPT.md`: a full inventory plus a message to paste into a new session.

In any Claude Code session (cloud or local):

```bash
git clone https://github.com/<you>/claude-skills-kit.git ~/claude-skills-kit
~/claude-skills-kit/install.sh
```

Then restart Claude Code or open a new session.

**Cloud sessions:** select this repo when starting a session. The SessionStart hook
(`.claude/hooks/session-start.sh`, registered in `.claude/settings.json`) runs
`install.sh` into `~/.claude` automatically. It runs only in cloud sessions
(`CLAUDE_CODE_REMOTE=true`), skips when the same kit version is already installed, and
logs to `~/.claude/claude-skills-kit-install.log`.

Options:

| Command | Effect |
|---|---|
| `./install.sh` | All skills to `~/.claude/skills` and all plugins |
| `./install.sh --project ~/my-video` | Skills only for one project (`~/my-video/.claude/skills`) |
| `./install.sh --libs ~/my-video` | Also install the npm libraries into that folder |
| `./install.sh --only custom` | Only the three custom skills (works offline) |
| `./install.sh --no-plugins` | Skip plugins |
| `./install.sh --latest` | Newest upstream commits instead of the reviewed pins (unreviewed) |

For cloud sessions you can put `~/claude-skills-kit/install.sh` in the environment's
setup script so that every new session starts with everything installed.

## Custom skills (in this repo, `.claude/skills/`)

| Skill | Purpose |
|---|---|
| `teacher-tribute-film` | Phase-gated workflow for a Vietnamese Teachers' Day (20/11) tribute film |
| `shot-list-generator` | Screenplay → timestamped shot-list CSV, plus a validator and shooting schedule (`scripts/validate_shot_list.py`) |
| `quality-control` | Screenplay / shot-list / final-video QC with `scripts/qc_video.py` (ffmpeg) and `scripts/check_srt.py` |

Cloning this repo as a project also makes these three available to Claude Code in
that project folder, because they live in `.claude/skills/`.

## Third-party skills (fetched by `install.sh` from the original repos)

Each source is pinned to the commit that was reviewed (see `pin_for()` in `install.sh`).
Skills are instructions for an agent with shell access, so to update: review the upstream
diff, then bump the SHA. `--latest` skips the pins and prints a warning.

| Source | Skills |
|---|---|
| [remotion-dev/skills](https://github.com/remotion-dev/skills) | 12 Remotion skills |
| [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 8 GSAP skills |
| [motiondivision/ai-kit](https://github.com/motiondivision/ai-kit) | `motion` |
| [anthropics/skills](https://github.com/anthropics/skills) | 19 Anthropic skills |
| [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | 18 unique community skills |
| [akseolabs-seo/cinematic-ui](https://github.com/akseolabs-seo/cinematic-ui) | `cinematic-ui` |

## Plugins (from [anthropics/claude-plugins-official](https://github.com/anthropics/claude-plugins-official))

agent-sdk-dev, claude-code-setup, claude-md-management, claude-security, code-modernization,
code-review, code-simplifier, commit-commands, feature-dev, hookify, math-olympiad, math-proof,
mcp-server-dev, plugin-dev, pr-review-toolkit, security-guidance, playground, playwright, context7

## Motion stack (`motion-stack/package.json`)

svgo, satori, gsap, animejs, motion, @rive-app/canvas, @lottiefiles/dotlottie-web, remotion,
@remotion/cli, @motion-canvas/core, @motion-canvas/2d, three, @react-three/fiber, drei, rapier,
postprocessing, howler, mediabunny, react, react-dom. FFmpeg is installed separately.

## Keys some skills need

`COMPOSIO_API_KEY` (connect, connect-apps) · `LANGSMITH_API_KEY` (langsmith-fetch) ·
a TTS key such as `ELEVENLABS_API_KEY` (Remotion voice-over).
