#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
REPO_URL="https://github.com/ybotman/ai-guild.git"
SPARSE_PATH="Claude/3.7 with code/AI-Guild"
TARGET_DIR="AI-Guild"
BRANCH="main"

# 1. Verify we’re in the public/ folder
if [[ "$(basename "$PWD")" != "public" ]]; then
  echo "❌ Please cd into your-app/public before running this."
  exit 1
fi

# 2. Create target and enter it
mkdir -p "$TARGET_DIR"
cd "$TARGET_DIR"

# 3. Init & configure sparse-checkout
git init
git remote add origin "$REPO_URL"
git config core.sparseCheckout true

# 4. Specify the subfolder to pull
mkdir -p .git/info
echo "$SPARSE_PATH/**" > .git/info/sparse-checkout

# 5. Pull only that path
git fetch origin "$BRANCH" --depth=1
git checkout -B "$BRANCH" "origin/$BRANCH"

# Step 6: Flatten nested sparse directory into target root
echo "⚙️ Flattening '$SPARSE_PATH' into '$TARGET_DIR/'"
mv "$SPARSE_PATH"/* .
# Remove the top-level sparse parent directory
top_dir="${SPARSE_PATH%%/*}"
rm -rf "$top_dir"



echo "✅ Initialized sparse-checkout of '$SPARSE_PATH' into public/$TARGET_DIR/"

