#!/usr/bin/env bash
set -euo pipefail
# Clone version 1.0.4

# Check for model and version parameters
if [[ $# -lt 2 ]]; then
  echo "❌ Error: Model and version parameters required"
  echo "Usage: $0 <model> <version>"
  echo "Example: $0 Claude 1.1.1"
  echo "Available models: Claude, GitHub-Copilot, etc."
  echo "Available versions: 1.0.6, 1.1.0, 1.1.1, etc."
  exit 1
fi

MODEL="$1"
VERSION="$2"
echo "🎯 Cloning AI-Guild model: $MODEL, version: $VERSION"

# === CONFIG ===
REPO_URL="https://github.com/ybotman/ai-guild.git"
SPARSE_PATH="$MODEL/$VERSION/AI-Guild"
TARGET_DIR="public/AI-Guild"
BRANCH="main"

# Check if model/version exists in repository
echo "🔍 Checking if $MODEL/$VERSION exists in repository..."
TEMP_CHECK_DIR=$(mktemp -d)
cd "$TEMP_CHECK_DIR"
git init --quiet
git remote add origin "$REPO_URL"
git config core.sparseCheckout true
mkdir -p .git/info
echo "$SPARSE_PATH/**" > .git/info/sparse-checkout

if ! git fetch origin "$BRANCH" --depth=1 --quiet 2>/dev/null; then
  echo "❌ Error: Could not fetch from repository"
  rm -rf "$TEMP_CHECK_DIR"
  exit 1
fi

if ! git checkout -B "$BRANCH" "origin/$BRANCH" --quiet 2>/dev/null; then
  echo "❌ Error: Could not checkout branch"
  rm -rf "$TEMP_CHECK_DIR"
  exit 1
fi

if [[ ! -d "$SPARSE_PATH" ]]; then
  echo "❌ Error: Model $MODEL version $VERSION does not exist in repository"
  echo "Available models and versions:"
  find . -maxdepth 2 -type d -path "*/[0-9]*.[0-9]*.[0-9]*" 2>/dev/null | sort || echo "Could not list available models/versions"
  rm -rf "$TEMP_CHECK_DIR"
  exit 1
fi

echo "✅ Model $MODEL version $VERSION found in repository"
rm -rf "$TEMP_CHECK_DIR"
cd - > /dev/null

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

# 9. Copy NewCLAUDE.md to root CLAUDE.md (if it exists)
if [[ -f "$TEMP_DIR/$SPARSE_PATH/Setup/NewCLAUDE.md" ]]; then
  echo "📝 Copying NewCLAUDE.md to ./CLAUDE.md"
  cp "$TEMP_DIR/$SPARSE_PATH/Setup/NewCLAUDE.md" "./CLAUDE.md"
  echo "✅ Updated CLAUDE.md with latest version"
else
  echo "⚠️  Warning: $TEMP_DIR/$SPARSE_PATH/Setup/NewCLAUDE.md not found - skipping CLAUDE.md update"
fi

# 10. Cleanup temp directory
rm -rf "$TEMP_DIR"

echo "✅ Sparse-checkout of '$SPARSE_PATH' imported into $TARGET_DIR/"
