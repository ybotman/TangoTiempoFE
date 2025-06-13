#!/bin/bash

# JIRA Transition Helper - Move tickets between statuses

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Function to get available transitions
get_transitions() {
    local ticket=$1
    echo "Available transitions for $ticket:"
    curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Accept: application/json" \
        "$JIRA_URL/rest/api/2/issue/$ticket/transitions" | \
        jq -r '.transitions[] | "\(.id): \(.name)"'
}

# Function to transition ticket
transition_ticket() {
    local ticket=$1
    local transition_id=$2
    local comment=$3
    
    echo "Transitioning $ticket with transition ID $transition_id..."
    
    # Transition the ticket
    curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"transition\": {\"id\": \"$transition_id\"}}" \
        -X POST \
        "$JIRA_URL/rest/api/2/issue/$ticket/transitions"
    
    # Add comment if provided
    if [ -n "$comment" ]; then
        curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"body\": \"$comment\"}" \
            -X POST \
            "$JIRA_URL/rest/api/2/issue/$ticket/comment" > /dev/null
    fi
    
    echo "✅ Transitioned successfully"
}

# Main execution
if [ $# -eq 0 ]; then
    echo "Usage: $0 <ticket> [transition_id] [comment]"
    echo "Example: $0 TIEMPO-57 21 'Starting work'"
    exit 1
fi

TICKET=$1

if [ $# -eq 1 ]; then
    # Just show available transitions
    get_transitions "$TICKET"
else
    # Perform transition
    TRANSITION_ID=$2
    COMMENT=${3:-""}
    transition_ticket "$TICKET" "$TRANSITION_ID" "$COMMENT"
fi