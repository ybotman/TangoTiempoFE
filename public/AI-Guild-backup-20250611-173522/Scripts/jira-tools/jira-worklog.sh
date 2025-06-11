#!/bin/bash

# JIRA Work Log Helper - Log time for each AI-Guild role

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Function to add work log entry
add_worklog() {
    local ticket=$1
    local role=$2
    local time_spent=$3
    local work_description=$4
    local started_time=${5:-$(date -u +"%Y-%m-%dT%H:%M:%S.000+0000")}
    
    echo "Adding worklog for $role on $ticket..."
    
    # Create worklog with clear role attribution
    # Use emoji and caps to make role obvious
    local role_prefix=""
    case $role in
        "Scout")
            role_prefix="🔍 SCOUT ROLE"
            ;;
        "Architect")
            role_prefix="📐 ARCHITECT ROLE"
            ;;
        "Builder")
            role_prefix="🔨 BUILDER ROLE"
            ;;
        "CRK")
            role_prefix="✅ CRK ROLE"
            ;;
        "Kanban")
            role_prefix="📋 KANBAN ROLE"
            ;;
        *)
            role_prefix="👤 $role"
            ;;
    esac
    
    local worklog_json=$(cat <<EOF
{
  "comment": "$role_prefix\n\n$work_description",
  "started": "$started_time",
  "timeSpent": "$time_spent"
}
EOF
)
    
    # Add worklog
    local response=$(curl -s -w "\n%{http_code}" -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$worklog_json" \
        -X POST \
        "$JIRA_URL/rest/api/2/issue/$ticket/worklog")
    
    local status_code=$(echo "$response" | tail -n1)
    
    if [ "$status_code" = "201" ]; then
        echo "✅ Logged $time_spent for $role"
    else
        echo "❌ Failed to log work (HTTP $status_code)"
    fi
}

# Function to add role-specific comment with attribution
add_role_comment() {
    local ticket=$1
    local role=$2
    local comment=$3
    
    # Add role prefix to make it clear who's commenting
    local prefixed_comment="**[AI-Guild: $role]**\n\n$comment"
    
    curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"body\": \"$prefixed_comment\"}" \
        -X POST \
        "$JIRA_URL/rest/api/2/issue/$ticket/comment" > /dev/null
}

# Function to view worklogs
view_worklogs() {
    local ticket=$1
    
    echo "Work logs for $ticket:"
    curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Accept: application/json" \
        "$JIRA_URL/rest/api/2/issue/$ticket/worklog" | \
        jq -r '.worklogs[] | "[\(.author.displayName)] \(.timeSpent) - \(.comment | split("\n")[0])"'
}

# Usage
if [ $# -eq 0 ]; then
    echo "Usage:"
    echo "  Add worklog: $0 add <ticket> <role> <time> <description>"
    echo "  View logs:   $0 view <ticket>"
    echo ""
    echo "Examples:"
    echo "  $0 add TIEMPO-57 Scout 20m 'Investigated codebase and found components'"
    echo "  $0 add TIEMPO-57 Builder 45m 'Implemented copy feature with tests'"
    echo "  $0 view TIEMPO-57"
    echo ""
    echo "Time format: 1h, 30m, 1h 30m, 2d, etc."
    exit 1
fi

COMMAND=$1

case $COMMAND in
    "add")
        if [ $# -lt 5 ]; then
            echo "Missing parameters for add command"
            exit 1
        fi
        add_worklog "$2" "$3" "$4" "$5"
        ;;
    "view")
        if [ $# -lt 2 ]; then
            echo "Missing ticket parameter"
            exit 1
        fi
        view_worklogs "$2"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        exit 1
        ;;
esac