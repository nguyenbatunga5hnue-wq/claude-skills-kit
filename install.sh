#!/usr/bin/env bash
# Reproduce this Claude Code setup: skills, plugins and the motion library stack.
#
#   ./install.sh                     # skills -> ~/.claude/skills, plugins, no npm libraries
#   ./install.sh --project <dir>     # skills -> <dir>/.claude/skills (only that project sees them)
#   ./install.sh --libs <dir>        # also npm-install the motion stack into <dir>
#   ./install.sh --no-plugins        # skip Claude Code plugins
#   ./install.sh --only custom       # only this repo's own skills (no network needed)
#   ./install.sh --latest            # use each source's newest commit instead of the pinned one
#
# Third-party skills are fetched from their original repositories (they keep their
# own licenses) at the commit pinned in pin_for() below, i.e. the version that was
# reviewed. Skills run as instructions for an agent with shell access, so review
# the diff before bumping a pin or using --latest.
# An existing skill folder with the same name is replaced; nothing else is touched.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${HOME}/.claude/skills"
LIBS_DIR=""
PLUGINS=1
ONLY=""
LATEST=0

# owner/repo -> reviewed commit (2026-10-31)
pin_for() {
  case "$1" in
    remotion-dev/skills) echo 30d4553ecd46fbc5212fd0ff006ae43af522158b ;;
    greensock/gsap-skills) echo aed9cfd3277740755f6bfc1155c7aa645403b760 ;;
    motiondivision/ai-kit) echo 1e424943582cbbdb6e3f410687e39f96451447bb ;;
    anthropics/skills) echo ca45fc496a3436251f191354091d557da31c15b5 ;;
    ComposioHQ/awesome-claude-skills) echo be2a406907dbc61b73e6827ded415c96139d13a2 ;;
    akseolabs-seo/cinematic-ui) echo 24a66c1d6140c21ec0d0e4d9ef663a97264003de ;;
    *) echo "" ;;
  esac
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project)    mkdir -p "${2:?--project needs a path}"; TARGET="$(cd "$2" && pwd)/.claude/skills"; shift 2 ;;
    --libs)       LIBS_DIR="${2:?--libs needs a path}"; shift 2 ;;
    --no-plugins) PLUGINS=0; shift ;;
    --only)       ONLY="${2:?--only needs a value}"; shift 2 ;;
    --latest)     LATEST=1; shift ;;
    -h|--help)    sed -n '2,19p' "$0"; exit 0 ;;
    *)            echo "unknown option: $1" >&2; exit 1 ;;
  esac
done

mkdir -p "$TARGET"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
count=0

install_dir() {  # <source skill dir>
  local src="${1%/}" name
  [[ -f "$src/SKILL.md" ]] || return 0
  name="$(basename "$src")"
  rm -rf "${TARGET:?}/$name"
  cp -R "$src" "$TARGET/$name"
  rm -rf "$TARGET/$name/.git"
  echo "  + $name"
  count=$((count + 1))
}

fetch() {  # <owner/repo> -> prints checkout dir; pinned via pin_for unless --latest
  local dest="$WORK/${1//\//_}" pin="$(pin_for "$1")" got
  if [[ $LATEST -eq 1 ]]; then
    git clone --quiet --depth 1 "https://github.com/$1.git" "$dest"
    echo "  ! $1 at latest $(git -C "$dest" rev-parse --short HEAD) (unreviewed)" >&2
  else
    [[ -n "$pin" ]] || { echo "no pin for $1" >&2; exit 1; }
    git init --quiet "$dest"
    git -C "$dest" fetch --quiet --depth 1 "https://github.com/$1.git" "$pin"
    git -C "$dest" checkout --quiet FETCH_HEAD
    got="$(git -C "$dest" rev-parse HEAD)"
    [[ "$got" == "$pin" ]] || { echo "pin mismatch for $1: $got != $pin" >&2; exit 1; }
  fi
  echo "$dest"
}

echo "Skills -> $TARGET"

echo "[custom] this repo"
for d in "$ROOT"/.claude/skills/*/; do install_dir "$d"; done

if [[ "$ONLY" != "custom" ]]; then
  echo "[remotion-dev/skills]"
  src="$(fetch remotion-dev/skills)";        for d in "$src"/skills/*/; do install_dir "$d"; done
  echo "[greensock/gsap-skills]"
  src="$(fetch greensock/gsap-skills)";      for d in "$src"/skills/*/; do install_dir "$d"; done
  echo "[motiondivision/ai-kit]"
  src="$(fetch motiondivision/ai-kit)";      for d in "$src"/plugins/*/skills/*/; do install_dir "$d"; done
  echo "[anthropics/skills]"
  src="$(fetch anthropics/skills)";          for d in "$src"/skills/*/; do install_dir "$d"; done
  echo "[ComposioHQ/awesome-claude-skills] (unique skills only; official duplicates and the 800+ Rube MCP app skills are skipped)"
  src="$(fetch ComposioHQ/awesome-claude-skills)"
  for s in changelog-generator competitive-ads-extractor connect connect-apps content-research-writer \
           developer-growth-analysis domain-name-brainstormer file-organizer image-enhancer invoice-organizer \
           langsmith-fetch lead-research-assistant meeting-insights-analyzer raffle-winner-picker skill-share \
           tailored-resume-generator twitter-algorithm-optimizer video-downloader; do
    install_dir "$src/$s"
  done
  echo "[akseolabs-seo/cinematic-ui]"
  src="$(fetch akseolabs-seo/cinematic-ui)"
  mkdir -p "$WORK/cinematic-ui"
  cp -R "$src"/{SKILL.md,references,agents,CLAUDE.md,directors-library.md,skill.json,LICENSE,README.md} "$WORK/cinematic-ui/"
  install_dir "$WORK/cinematic-ui"
fi
echo "Installed $count skill(s)."

if [[ $PLUGINS -eq 1 && "$ONLY" != "custom" ]]; then
  if command -v claude >/dev/null 2>&1; then
    echo "Plugins (claude-plugins-official)"
    # Plugins come from Anthropic's official marketplace and follow its current catalog.
    claude plugin marketplace add anthropics/claude-plugins-official >/dev/null 2>&1 || true
    for p in agent-sdk-dev claude-code-setup claude-md-management claude-security code-modernization \
             code-review code-simplifier commit-commands feature-dev hookify math-olympiad math-proof \
             mcp-server-dev plugin-dev pr-review-toolkit security-guidance playground playwright context7; do
      if claude plugin install "$p@claude-plugins-official" -y >/dev/null 2>&1; then echo "  + $p"; else echo "  ! $p failed"; fi
    done
  else
    echo "Plugins skipped: 'claude' CLI not found."
  fi
fi

if [[ -n "$LIBS_DIR" ]]; then
  echo "Motion stack -> $LIBS_DIR"
  mkdir -p "$LIBS_DIR"
  if [[ -e "$LIBS_DIR/package.json" && ! "$LIBS_DIR/package.json" -ef "$ROOT/motion-stack/package.json" ]]; then
    echo "  $LIBS_DIR/package.json exists; not overwriting. Run: npm i \$(jq -r '.dependencies|keys[]' $ROOT/motion-stack/package.json)"
  else
    cp "$ROOT/motion-stack/package.json" "$ROOT/motion-stack/package-lock.json" "$LIBS_DIR/" 2>/dev/null || true
    (cd "$LIBS_DIR" && npm ci --no-audit --no-fund 2>/dev/null || npm install --no-audit --no-fund)
  fi
  command -v ffmpeg >/dev/null || echo "  note: ffmpeg not found; install it (apt install ffmpeg / brew install ffmpeg) or use 'npx remotion ffmpeg'."
fi

echo "Done. Restart Claude Code (or open a new session) to load new skills and plugins."
