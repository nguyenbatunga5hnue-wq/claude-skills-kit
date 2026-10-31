#!/bin/bash
# SessionStart hook: in Claude Code cloud sessions, install every skill and plugin
# from this kit into ~/.claude (user level), so they are available in this session
# and in other repositories opened alongside it.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

skills_dir="$HOME/.claude/skills"
hashes="$skills_dir/.claude-skills-kit.sha256"
log="$HOME/.claude/claude-skills-kit-install.log"

current_hashes() {
  # The hook, the installer (it holds the pinned commits and plugin list) and the custom skills
  { echo .claude/hooks/session-start.sh; echo install.sh; find .claude/skills -type f | sort; } \
    | xargs sha256sum
}

# Skip when the same kit version is already installed (the hash file lives inside
# the skills folder, so it disappears if the skills are removed)
if [ -f "$hashes" ] && [ -f "$skills_dir/remotion-best-practices/SKILL.md" ] \
   && current_hashes | cmp -s - "$hashes"; then
  echo "claude-skills-kit: skills already installed (log: $log)"
  exit 0
fi

rm -f "$hashes"
mkdir -p "$skills_dir"
# Installer output goes to a log; only one summary line reaches the session context
bash ./install.sh > "$log" 2>&1
current_hashes > "$hashes"

failed=$(grep -c '^  ! ' "$log" || true)
echo "claude-skills-kit: $(grep -o 'Installed [0-9]* skill(s)' "$log") into $skills_dir; plugin failures: $failed (log: $log)"
