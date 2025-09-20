#!/bin/bash
# JIRA Webhook Server - Receives and processes JIRA webhook events
# Usage: ./jira-webhook-server.sh [port]

# Source configuration
SCRIPT_DIR="$(dirname "$0")"
source "$SCRIPT_DIR/jira-config.sh"

PORT="${1:-8088}"
WEBHOOK_LOG="$SCRIPT_DIR/webhook.log"
WEBHOOK_HANDLERS="$SCRIPT_DIR/webhook-handlers"

# ============================================
# WEBHOOK EVENT HANDLERS
# ============================================

handle_issue_created() {
    local payload="$1"
    local issue_key=$(echo "$payload" | extract_field '.issue.key')
    local summary=$(echo "$payload" | extract_field '.issue.fields.summary')
    local creator=$(echo "$payload" | extract_field '.user.displayName')
    
    echo "[CREATED] $issue_key: $summary (by $creator)" >> "$WEBHOOK_LOG"
    
    # Trigger custom actions
    if [ -f "$WEBHOOK_HANDLERS/on-issue-created.sh" ]; then
        "$WEBHOOK_HANDLERS/on-issue-created.sh" "$issue_key" "$payload"
    fi
}

handle_issue_updated() {
    local payload="$1"
    local issue_key=$(echo "$payload" | extract_field '.issue.key')
    local user=$(echo "$payload" | extract_field '.user.displayName')
    
    # Check what changed
    local changelog=$(echo "$payload" | jq -r '.changelog.items[]' 2>/dev/null)
    
    echo "[UPDATED] $issue_key by $user" >> "$WEBHOOK_LOG"
    
    # Check for status changes
    if echo "$payload" | grep -q '"field":"status"'; then
        local from_status=$(echo "$payload" | jq -r '.changelog.items[] | select(.field=="status") | .fromString')
        local to_status=$(echo "$payload" | jq -r '.changelog.items[] | select(.field=="status") | .toString')
        echo "  Status: $from_status → $to_status" >> "$WEBHOOK_LOG"
        
        # Trigger status-specific handlers
        if [ -f "$WEBHOOK_HANDLERS/on-status-change.sh" ]; then
            "$WEBHOOK_HANDLERS/on-status-change.sh" "$issue_key" "$from_status" "$to_status" "$payload"
        fi
    fi
    
    if [ -f "$WEBHOOK_HANDLERS/on-issue-updated.sh" ]; then
        "$WEBHOOK_HANDLERS/on-issue-updated.sh" "$issue_key" "$payload"
    fi
}

handle_issue_deleted() {
    local payload="$1"
    local issue_key=$(echo "$payload" | extract_field '.issue.key')
    
    echo "[DELETED] $issue_key" >> "$WEBHOOK_LOG"
    
    if [ -f "$WEBHOOK_HANDLERS/on-issue-deleted.sh" ]; then
        "$WEBHOOK_HANDLERS/on-issue-deleted.sh" "$issue_key" "$payload"
    fi
}

handle_comment_created() {
    local payload="$1"
    local issue_key=$(echo "$payload" | extract_field '.issue.key')
    local commenter=$(echo "$payload" | extract_field '.comment.author.displayName')
    local comment=$(echo "$payload" | extract_field '.comment.body' | head -c 100)
    
    echo "[COMMENT] $issue_key: $commenter: $comment..." >> "$WEBHOOK_LOG"
    
    if [ -f "$WEBHOOK_HANDLERS/on-comment-created.sh" ]; then
        "$WEBHOOK_HANDLERS/on-comment-created.sh" "$issue_key" "$payload"
    fi
}

# ============================================
# WEBHOOK SERVER
# ============================================

echo "Starting JIRA Webhook Server on port $PORT..." >&2
echo "Webhook log: $WEBHOOK_LOG" >&2
echo "Handler directory: $WEBHOOK_HANDLERS" >&2

# Create handler directory if it doesn't exist
mkdir -p "$WEBHOOK_HANDLERS"

# Simple HTTP server using nc (netcat)
while true; do
    # Read the HTTP request
    REQUEST=$(echo -e "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\nOK" | nc -l "$PORT" -w 1)
    
    if [ -z "$REQUEST" ]; then
        continue
    fi
    
    # Extract the JSON payload (after the headers)
    PAYLOAD=$(echo "$REQUEST" | sed -n '/^$/,$ p' | tail -n +2)
    
    if [ -z "$PAYLOAD" ]; then
        continue
    fi
    
    # Log raw webhook
    echo "=== $(date) ===" >> "$WEBHOOK_LOG"
    echo "$PAYLOAD" | jq '.' >> "$WEBHOOK_LOG" 2>/dev/null || echo "$PAYLOAD" >> "$WEBHOOK_LOG"
    
    # Determine webhook event type
    EVENT_TYPE=$(echo "$PAYLOAD" | extract_field '.webhookEvent')
    
    case "$EVENT_TYPE" in
        "jira:issue_created")
            handle_issue_created "$PAYLOAD"
            ;;
        "jira:issue_updated")
            handle_issue_updated "$PAYLOAD"
            ;;
        "jira:issue_deleted")
            handle_issue_deleted "$PAYLOAD"
            ;;
        "comment_created")
            handle_comment_created "$PAYLOAD"
            ;;
        *)
            echo "[UNKNOWN] Event type: $EVENT_TYPE" >> "$WEBHOOK_LOG"
            ;;
    esac
done