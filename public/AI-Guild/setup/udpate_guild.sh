#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
REPO_URL="https://github.com/ybotman/ai-guild.git"          # your remote
SPARSE_PATH="Claude/3.7 with code/AI-Guild"                 # what you pulled originally
TARGET_DIR="AI-Guild"                                       # local folder under public/
BRANCH="main"                                               # branch to sync

# 1) Ensure we’re in public/AI-Guild
if [[ "$(basename "$PWD")" != "$TARGET_DIR" ]]; then
  echo "❌ Please cd into your-app/public/$TARGET_DIR before running this."
  exit 1
fi

echo "🔄 Fetching latest '$BRANCH' from origin…"

# 2) Fetch & reset working tree to remote
git fetch origin "$BRANCH" --depth=1
git checkout -B "$BRANCH" "origin/$BRANCH"

# 3) Remove old files (preserve .git)
echo "🧹 Cleaning out old files…"
shopt -s extglob
rm -rf !(.git)

# 4) Re-flatten the sparse path into root
echo "⚙️  Flattening '$SPARSE_PATH' into ./"
mv $SPARSE_PATH/* .
# delete now-empty parent folders
top="${SPARSE_PATH%%/*}"
rm -rf "$top"

echo "✅ public/$TARGET_DIR is up to date." 