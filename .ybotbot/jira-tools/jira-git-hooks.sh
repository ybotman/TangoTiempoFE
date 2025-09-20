#!/bin/bash
# Git hooks for JIRA integration
# Install these hooks in .git/hooks/

# Source configuration
JIRA_TOOLS_DIR="$(git rev-parse --show-toplevel)/.ybotbot/jira-tools"

# ============================================
# COMMIT-MSG HOOK
# ============================================
create_commit_msg_hook() {
    cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash
# Auto-add JIRA ticket reference to commit messages

COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat $COMMIT_MSG_FILE)

# Get current branch name
BRANCH=$(git branch --show-current)

# Extract JIRA ticket from branch name (e.g., feature/CALBE-55-fix-dst)
TICKET=$(echo $BRANCH | grep -oE '[A-Z]+-[0-9]+')

if [ -n "$TICKET" ]; then
    # Check if ticket is already in commit message
    if ! echo "$COMMIT_MSG" | grep -q "$TICKET"; then
        # Add ticket reference to beginning of commit message
        echo "[$TICKET] $COMMIT_MSG" > $COMMIT_MSG_FILE
    fi
fi
EOF
    chmod +x .git/hooks/commit-msg
    echo "Created commit-msg hook"
}

# ============================================
# POST-COMMIT HOOK
# ============================================
create_post_commit_hook() {
    cat > .git/hooks/post-commit << 'EOF'
#!/bin/bash
# Add JIRA comment after commit

JIRA_TOOLS="$(git rev-parse --show-toplevel)/.ybotbot/jira-tools"
BRANCH=$(git branch --show-current)
TICKET=$(echo $BRANCH | grep -oE '[A-Z]+-[0-9]+')

if [ -n "$TICKET" ] && [ -f "$JIRA_TOOLS/jira-comment.sh" ]; then
    COMMIT_SHA=$(git rev-parse HEAD)
    COMMIT_MSG=$(git log -1 --pretty=%B)
    AUTHOR=$(git log -1 --pretty=%an)
    
    COMMENT="Commit by $AUTHOR: $COMMIT_MSG (SHA: ${COMMIT_SHA:0:7})"
    "$JIRA_TOOLS/jira-comment.sh" "$TICKET" "$COMMENT" 2>/dev/null
fi
EOF
    chmod +x .git/hooks/post-commit
    echo "Created post-commit hook"
}

# ============================================
# PRE-PUSH HOOK
# ============================================
create_pre_push_hook() {
    cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
# Update JIRA status when pushing

JIRA_TOOLS="$(git rev-parse --show-toplevel)/.ybotbot/jira-tools"
BRANCH=$(git branch --show-current)
TICKET=$(echo $BRANCH | grep -oE '[A-Z]+-[0-9]+')

if [ -n "$TICKET" ] && [ -f "$JIRA_TOOLS/jira-transition.sh" ]; then
    # Check if pushing to main/master/develop
    while read local_ref local_sha remote_ref remote_sha; do
        if [[ "$remote_ref" =~ (main|master|develop|DEVL|TEST) ]]; then
            # Move ticket to "In Review" if not already
            "$JIRA_TOOLS/jira-transition.sh" "$TICKET" "In Review" 2>/dev/null
            "$JIRA_TOOLS/jira-comment.sh" "$TICKET" "🚀 Code pushed to ${remote_ref##*/}" 2>/dev/null
        fi
    done
fi
EOF
    chmod +x .git/hooks/pre-push
    echo "Created pre-push hook"
}

# ============================================
# CHECKOUT HOOK
# ============================================
create_post_checkout_hook() {
    cat > .git/hooks/post-checkout << 'EOF'
#!/bin/bash
# Transition JIRA ticket when switching branches

JIRA_TOOLS="$(git rev-parse --show-toplevel)/.ybotbot/jira-tools"
PREV_BRANCH=$1
NEW_BRANCH=$2
BRANCH_CHECKOUT=$3

if [ "$BRANCH_CHECKOUT" = "1" ]; then
    BRANCH=$(git branch --show-current)
    TICKET=$(echo $BRANCH | grep -oE '[A-Z]+-[0-9]+')
    
    if [ -n "$TICKET" ] && [ -f "$JIRA_TOOLS/jira-transition.sh" ]; then
        # Move to "In Progress" when checking out ticket branch
        "$JIRA_TOOLS/jira-transition.sh" "$TICKET" "In Progress" 2>/dev/null
        "$JIRA_TOOLS/jira-comment.sh" "$TICKET" "👨‍💻 Started work on branch: $BRANCH" 2>/dev/null
    fi
fi
EOF
    chmod +x .git/hooks/post-checkout
    echo "Created post-checkout hook"
}

# ============================================
# MAIN EXECUTION
# ============================================
ACTION="${1:-install}"

case "$ACTION" in
    install)
        echo "Installing JIRA git hooks..."
        create_commit_msg_hook
        create_post_commit_hook
        create_pre_push_hook
        create_post_checkout_hook
        echo ""
        echo "✅ Git hooks installed successfully!"
        echo ""
        echo "Hooks will:"
        echo "  - Auto-add JIRA ticket to commit messages"
        echo "  - Add commit info as JIRA comments"
        echo "  - Transition tickets based on git flow"
        echo "  - Update ticket when pushing to main branches"
        ;;
        
    uninstall)
        echo "Removing JIRA git hooks..."
        rm -f .git/hooks/commit-msg
        rm -f .git/hooks/post-commit
        rm -f .git/hooks/pre-push
        rm -f .git/hooks/post-checkout
        echo "✅ Git hooks removed"
        ;;
        
    *)
        echo "Usage: $0 [install|uninstall]"
        echo "  install   - Install JIRA integration git hooks"
        echo "  uninstall - Remove JIRA integration git hooks"
        exit 1
        ;;
esac