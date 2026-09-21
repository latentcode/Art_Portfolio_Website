#!/usr/bin/env bash
set -euo pipefail

source_file="/workspace/assets/images/wotg_images/khaspur_portrait_gif.gif"
output_dir="/workspace/assets/images/optimized/wotg_images"
webm_file="$output_dir/khaspur_portrait.webm"
mp4_file="$output_dir/khaspur_portrait.mp4"
poster_file="$output_dir/khaspur_portrait-poster.webp"
mode="${1:-generate}"

case "$mode" in
  generate|check|dry-run) ;;
  *) echo "Usage: optimize-animation.sh [generate|check|dry-run]" >&2; exit 1 ;;
esac

if [[ "$mode" == "dry-run" ]]; then
  printf 'would generate %s, %s, and %s\n' "$webm_file" "$mp4_file" "$poster_file"
  exit 0
fi

if [[ "$mode" == "check" ]]; then
  for output_file in "$webm_file" "$mp4_file" "$poster_file"; do
    [[ -s "$output_file" ]] || { echo "Missing animation output: $output_file" >&2; exit 1; }
    [[ "$output_file" -nt "$source_file" ]] || { echo "Stale animation output: $output_file" >&2; exit 1; }
  done
  ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$webm_file" >/dev/null
  ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$mp4_file" >/dev/null
  echo "Animated hero assets are current."
  exit 0
fi

if [[ -s "$webm_file" && -s "$mp4_file" && -s "$poster_file" \
      && "$webm_file" -nt "$source_file" \
      && "$mp4_file" -nt "$source_file" \
      && "$poster_file" -nt "$source_file" ]]; then
  echo "Reused animated hero assets."
  exit 0
fi

mkdir -p "$output_dir"

ffmpeg -hide_banner -loglevel error -y \
  -i "$source_file" \
  -vf "scale='min(1440,iw)':-2:flags=lanczos" \
  -an -c:v libvpx-vp9 -crf 32 -b:v 0 -deadline good -cpu-used 2 \
  -pix_fmt yuv420p -row-mt 1 "$webm_file"

ffmpeg -hide_banner -loglevel error -y \
  -i "$source_file" \
  -vf "scale='min(1440,iw)':-2:flags=lanczos" \
  -an -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -movflags +faststart "$mp4_file"

ffmpeg -hide_banner -loglevel error -y \
  -i "$source_file" -frames:v 1 \
  -vf "scale='min(1440,iw)':-2:flags=lanczos" \
  -c:v libwebp -quality 85 "$poster_file"

printf 'Generated animated hero: WebM %s, MP4 %s, poster %s.\n' \
  "$(du -h "$webm_file" | cut -f1)" \
  "$(du -h "$mp4_file" | cut -f1)" \
  "$(du -h "$poster_file" | cut -f1)"
