#!/bin/bash

# === CONFIG ===
REPO_URL="https://github.com/ybotman/ai-guild.git"
SPARSE_PATH="Claude/3.7 with code/AI-Guild"
TARGET_DIR="public/AI-Guild"
# Add additional files or folders to include (relative to repo root)
EXTRA_PATHS=(
  "Claude/3.7 with code/AI-Guild/git-AI-GUILD-Claude3.7-Sparce.sh"
  "Claude/3.7 with code/AI-Guild/move-this-file-to-root-CLAUDE.md"
  # Add more paths here if needed, e.g. "somefile.md" or "somefolder/"
)

# === START ===
echo "🔧 Setting up sparse checkout for AI-Guild..."

# Step 1: Make target directory if needed
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR" || exit 1

# Step 2: Init git repo if not already
if [ ! -d ".git" ]; then
  git init
fi

# Step 3: Set remote (reset if already set)
git remote remove origin 2>/dev/null
git remote add origin "$REPO_URL"

# Step 4: Enable sparse checkout
git config core.sparseCheckout true
mkdir -p .git/info

# Write sparse-checkout patterns
{
  echo "$SPARSE_PATH/**"
  for path in "${EXTRA_PATHS[@]}"; do
    echo "$path"
  done
} > .git/info/sparse-checkout

# Step 5: Reapply and pull the data
git sparse-checkout reapply
git pull origin main --depth=1

echo "✅ Done. AI-Guild synced into $TARGET_DIR"