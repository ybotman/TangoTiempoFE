ch#!/bin/bash
echo "🔍 Checking AI Guild version..."

# Fetch latest info
git fetch origin 2>/dev/null

# Check status in simple terms
if git status -uno | grep -q "up to date"; then
    echo "✅ You're using the current AI Guild from GitHub"
elif git status -uno | grep -q "behind"; then
    echo "⚠️ Your AI Guild is outdated - please run: git pull"
elif git status -uno | grep -q "ahead"; then
    echo "📝 You have local AI Guild changes not pushed to GitHub"
else
    echo "❓ AI Guild status unclear - check 'git status'"
fi

Upon agreeement of above (if there is not changes that go right to this step)

Then you are to 
**STARTUP the GIULD**
# Concatenate all startup and lifecycle docs into one file
cat public/AI-Guild/Startup/*.md public/AI-Guild/Lifecycle/*.md > combined-guild-docs.md

# Then read the single combined file
After that summerzie you findings

# then you are to ask if there is any Appl Playbooks to read they are in 
AI-Guild/Playbooks/Applications/
-- List and number ach folder.
-- if the users resonds with the Number OR the fodler then
-- cat all the *.md for each folder and read the combined-appl-playbooks-<appl>.md
