#!/bin/bash
# JIRA Configuration - Centralized settings for all JIRA scripts
# This file is sourced by all other JIRA scripts

# ============================================
# CONFIGURATION SECTION
# ============================================

# JIRA Instance
export JIRA_BASE_URL="https://hdtsllc.atlassian.net"
export JIRA_API_VERSION="3"

# Authentication (will be loaded from secure storage)
# Method 1: Environment variables (recommended for CI/CD)
if [ -n "$JIRA_EMAIL" ] && [ -n "$JIRA_API_TOKEN" ]; then
    export JIRA_AUTH="$JIRA_EMAIL:$JIRA_API_TOKEN"
fi

# Method 2: .env file (for local development)
if [ -f "$(dirname "$0")/../../.env" ]; then
    source "$(dirname "$0")/../../.env"
    if [ -n "$JIRA_EMAIL" ] && [ -n "$JIRA_API_TOKEN" ]; then
        export JIRA_AUTH="$JIRA_EMAIL:$JIRA_API_TOKEN"
    fi
fi

# Method 3: Keychain (macOS)
if [ -z "$JIRA_AUTH" ] && command -v security &> /dev/null; then
    JIRA_EMAIL=$(security find-generic-password -s "jira-email" -w 2>/dev/null || echo "")
    JIRA_TOKEN=$(security find-generic-password -s "jira-api-token" -w 2>/dev/null || echo "")
    if [ -n "$JIRA_EMAIL" ] && [ -n "$JIRA_TOKEN" ]; then
        export JIRA_AUTH="$JIRA_EMAIL:$JIRA_TOKEN"
    fi
fi

# Get current project key based on directory
get_project_key() {
    local dir_name=$(basename "$(pwd)")
    case "$dir_name" in
        "calendar-be")
            echo "CALBE"
            ;;
        "tangotiempo.com")
            echo "TIEMPO"
            ;;
        *)
            echo "CALBE"
            ;;
    esac
}

# Default project (can be overridden)
export JIRA_PROJECT="${JIRA_PROJECT:-$(get_project_key)}"

# ============================================
# UTILITY FUNCTIONS
# ============================================

# Check if authentication is configured
check_auth() {
    if [ -z "$JIRA_AUTH" ]; then
        echo "Error: JIRA authentication not configured" >&2
        echo "Please set JIRA_EMAIL and JIRA_API_TOKEN environment variables" >&2
        echo "Or add them to .env file" >&2
        echo "Or store in macOS keychain:" >&2
        echo "  security add-generic-password -s 'jira-email' -a 'jira' -w 'your-email@example.com'" >&2
        echo "  security add-generic-password -s 'jira-api-token' -a 'jira' -w 'your-api-token'" >&2
        return 1
    fi
    return 0
}

# Make authenticated API request
jira_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if ! check_auth; then
        return 1
    fi
    
    local url="${JIRA_BASE_URL}/rest/api/${JIRA_API_VERSION}${endpoint}"
    local auth_header="Authorization: Basic $(echo -n "$JIRA_AUTH" | base64)"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "$auth_header" \
            -H "Content-Type: application/json" \
            -H "Accept: application/json" \
            -d "$data" \
            "$url"
    else
        curl -s -X "$method" \
            -H "$auth_header" \
            -H "Accept: application/json" \
            "$url"
    fi
}

# Format JSON output with jq if available
format_json() {
    if command -v jq &> /dev/null; then
        jq '.'
    else
        cat
    fi
}

# Extract specific field from JSON
extract_field() {
    local field="$1"
    if command -v jq &> /dev/null; then
        jq -r "$field"
    else
        # Basic grep fallback for simple fields
        grep -o "\"$field\":[^,}]*" | cut -d':' -f2- | tr -d '", '
    fi
}

# Convert text to ADF format
text_to_adf() {
    local text="$1"
    cat <<EOF
{
  "type": "doc",
  "version": 1,
  "content": [
    {
      "type": "paragraph",
      "content": [
        {
          "type": "text",
          "text": "$text"
        }
      ]
    }
  ]
}
EOF
}

# ============================================
# COMMON ISSUE TYPES (for reference)
# ============================================
# bug -> Bug
# story -> Story  
# task -> Task
# epic -> Epic
# subtask -> Sub-task

# ============================================
# COMMON PRIORITIES (for reference)
# ============================================
# highest -> Highest
# high -> High
# medium -> Medium
# low -> Low
# lowest -> Lowest

# ============================================
# STATUS TRANSITIONS (for reference)
# ============================================
# todo -> To Do
# progress -> In Progress
# review -> In Review
# done -> Done
# blocked -> Blocked

# Export functions for use in other scripts
export -f check_auth
export -f jira_request
export -f format_json
export -f extract_field
export -f text_to_adf
export -f get_project_key