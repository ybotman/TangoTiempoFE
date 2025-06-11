#!/usr/bin/env bash
set -euo pipefail

# === CONFIG ===
REPO_URL="https://github.com/ybotman/ai-guild.git"
SPARSE_PATH="Claude/4.0 with Code and Jira/AI-Guild"
TARGET_DIR="public/AI-Guild"
BRANCH="main"

# 1. Verify we're in the root app directory (should have public/ folder)
if [[ ! -d "public" ]]; then
  echo "❌ Please run this from your app root directory (should contain public/ folder)"
  exit 1
fi

# 2. Backup existing target dir if it exists
if [[ -d "$TARGET_DIR" ]]; then
  timestamp=$(date +"%Y%m%d-%H%M%S")
  backup_dir="${TARGET_DIR}-backup-$timestamp"
  echo "📦 Backing up existing '$TARGET_DIR' to '$backup_dir'"
  mv "$TARGET_DIR" "$backup_dir"
fi

# 3. Create a temporary directory for the sparse clone
TEMP_DIR=$(mktemp -d)
echo "🔄 Creating sparse clone in temporary directory..."

# 4. Do the sparse clone in temp directory
cd "$TEMP_DIR"
git init
git remote add origin "$REPO_URL"
git config core.sparseCheckout true

# 5. Configure sparse-checkout
mkdir -p .git/info
echo "$SPARSE_PATH/**" > .git/info/sparse-checkout

# 6. Fetch and checkout
git fetch origin "$BRANCH" --depth=1
git checkout -B "$BRANCH" "origin/$BRANCH"

# 7. Go back to original directory and create target
cd - > /dev/null
mkdir -p "$TARGET_DIR"

# 8. Copy the sparse content and flatten
echo "⚙️ Copying and flattening '$SPARSE_PATH' to '$TARGET_DIR/'"
cp -r "$TEMP_DIR/$SPARSE_PATH"/* "$TARGET_DIR/"

# 9. Cleanup temp directory
rm -rf "$TEMP_DIR"

# 10. Copy NewCLAUDE.md to root claude.md (if it exists)
if [[ -f "$TARGET_DIR/Setup/NewCLAUDE.md" ]]; then
  echo "📝 Copying NewCLAUDE.md to ./claude.md"
  cp "$TARGET_DIR/Setup/NewCLAUDE.md" "./claude.md"
  echo "✅ Updated claude.md with latest version"
else
  echo "⚠️  Warning: $TARGET_DIR/Setup/NewCLAUDE.md not found - skipping claude.md update"
fi

echo "✅ Sparse-checkout of '$SPARSE_PATH' imported into $TARGET_DIR/"