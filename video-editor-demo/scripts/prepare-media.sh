#!/usr/bin/env bash
# Prepare a source video for the editor:
#   bash scripts/prepare-media.sh path/to/video.mov
# Creates media/source.*, preview proxies (mp4 + webm) and 30fps JPEG frames for export.
set -euo pipefail
cd "$(dirname "$0")/.."
src="${1:-media/source.mov}"
mkdir -p media/frames
if [ "$(realpath "$src")" != "$(realpath -m media/source.mov)" ]; then cp "$src" media/source.mov; fi
rm -f media/frames/*.jpg
ffmpeg -v error -y -i media/source.mov -c:v libx264 -preset veryfast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart media/proxy.mp4 &
ffmpeg -v error -y -i media/source.mov -c:v libvpx-vp9 -b:v 1500k -deadline realtime -cpu-used 8 -row-mt 1 -c:a libopus media/proxy.webm &
ffmpeg -v error -y -i media/source.mov -vf fps=30 -q:v 3 media/frames/%05d.jpg &
wait
ffprobe -v error -select_streams v:0 -show_entries stream=width,height:format=duration -of compact media/source.mov
echo "Frames: $(ls media/frames | wc -l). Remember to update \"source\" in project.json."
