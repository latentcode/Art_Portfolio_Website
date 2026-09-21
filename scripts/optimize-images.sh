#!/usr/bin/env bash
set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
image_name="portfolio-image-tools"

docker build --tag "$image_name" "$script_dir/image-tools"
docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$repo_dir:/workspace" \
  --workdir /workspace \
  "$image_name" node /tool/optimize-images.mjs "$@"

animation_mode="generate"
for argument in "$@"; do
  case "$argument" in
    --check) animation_mode="check" ;;
    --dry-run) animation_mode="dry-run" ;;
  esac
done

docker run --rm \
  --user "$(id -u):$(id -g)" \
  --volume "$repo_dir:/workspace" \
  --workdir /workspace \
  "$image_name" /tool/optimize-animation.sh "$animation_mode"
