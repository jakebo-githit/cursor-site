#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_BASE="/Volumes/ORICO1/OpenClawData/backups/cursor-site"
SNAP_DIR="$BACKUP_BASE/snapshots"
LOG_FILE="$BACKUP_BASE/backup-log.tsv"

if [[ ! -d "/Volumes/ORICO1" ]]; then
  echo "[backup] ORICO1 not mounted, skip" >&2
  exit 0
fi

mkdir -p "$SNAP_DIR"

cd "$REPO_DIR"
TS="$(date +%Y%m%d-%H%M%S)"
COMMIT="$(git rev-parse --short HEAD 2>/dev/null || echo no-commit)"
BRANCH="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
OUT="$SNAP_DIR/cursor-site-${TS}-${BRANCH}-${COMMIT}.tar.gz"

# 仅打包 Git 跟踪内容，避免 node_modules 等大文件
if git rev-parse --verify HEAD >/dev/null 2>&1; then
  git archive --format=tar.gz -o "$OUT" HEAD
else
  tar -czf "$OUT" --exclude .git .
fi

SIZE="$(du -h "$OUT" | awk '{print $1}')"

echo -e "${TS}\t${BRANCH}\t${COMMIT}\t${SIZE}\t${OUT}" >> "$LOG_FILE"
echo "[backup] saved $OUT ($SIZE)"
