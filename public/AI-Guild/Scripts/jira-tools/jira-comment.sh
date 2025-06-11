#!/bin/bash

# JIRA Comment Helper - Add findings, decisions, and role-based updates

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Function to add a role-based comment
add_comment() {
    local ticket=$1
    local role=$2
    local comment=$3
    
    # Role emoji mapping
    local role_prefix=""
    case $role in
        "Scout")
            role_prefix="🔍 **[Scout Finding]**"
            ;;
        "Architect")
            role_prefix="📐 **[Architect Decision]**"
            ;;
        "Builder")
            role_prefix="🔨 **[Builder Update]**"
            ;;
        "CRK")
            role_prefix="✅ **[CRK Review]**"
            ;;
        "Kanban")
            role_prefix="📋 **[Kanban Status]**"
            ;;
        *)
            role_prefix="💬 **[${role}]**"
            ;;
    esac
    
    # Format the comment with role prefix
    local formatted_comment="${role_prefix}\n\n${comment}"
    
    # Post comment to JIRA
    curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"body\": \"$formatted_comment\"}" \
        -X POST \
        "$JIRA_URL/rest/api/2/issue/$ticket/comment" | jq -r '.id // .errorMessages[]?'
    
    if [ $? -eq 0 ]; then
        echo "✅ Comment added to $ticket"
    else
        echo "❌ Failed to add comment"
    fi
}

# Main execution
if [ $# -lt 3 ]; then
    echo "Usage: $0 <ticket> <role> <comment>"
    echo ""
    echo "Examples:"
    echo "  $0 TIEMPO-57 Scout \"Found existing date picker component in SharedComponents\""
    echo "  $0 TIEMPO-57 Architect \"Decision: Reuse existing DatePicker with custom validation\""
    echo "  $0 TIEMPO-57 Builder \"Implemented validation logic, all tests passing\""
    echo "  $0 TIEMPO-57 CRK \"Code review complete - follows patterns, good test coverage\""
    echo ""
    echo "Supported roles: Scout, Architect, Builder, CRK, Kanban"
    exit 1
fi

add_comment "$1" "$2" "$3"