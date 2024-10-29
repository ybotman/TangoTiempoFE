#!/bin/bash

# Step 1: Run the commitVersions.js script
echo "Running commitVersions.js..."
node src/app/utils/commitVersions.js

# Step 2: Stage and commit versions.json with the specified message
echo "Staging and committing versions.json..."
git add public/versions.json
git commit -m "Commit with Versions History"

# Step 3: Store the current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "Current branch is $current_branch"

# Step 4: Switch to the TEST branch
echo "Switching to TEST branch..."
git checkout TEST

# Step 5: Merge the current feature branch into TEST
echo "Merging $current_branch into TEST..."
git merge "$current_branch" -m "Merging $current_branch into TEST"

# Optional Step 6: Push changes to the remote TEST branch (if needed)
# echo "Pushing changes to remote TEST branch..."
# git push origin TEST

echo "Process complete!"