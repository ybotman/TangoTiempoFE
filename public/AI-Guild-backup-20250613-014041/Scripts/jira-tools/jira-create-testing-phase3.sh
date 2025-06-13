#\!/bin/bash

# Create Phase 3 JIRA testing stories linked to Epic TIEMPO-70

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Epic key
EPIC_KEY="TIEMPO-70"

# Function to create story linked to epic
create_story() {
    local title=$1
    local labels=$2
    local description=$3
    local story_points=${4:-""}
    
    # Build labels array
    local labels_array="[\"testing\""
    IFS=',' read -ra LABEL_ITEMS <<< "$labels"
    for label in "${LABEL_ITEMS[@]}"; do
        labels_array="$labels_array, \"$label\""
    done
    labels_array="$labels_array]"
    
    echo "Creating story: $title"
    
    # Create JSON payload with epic link
    local json_payload=$(cat <<EOJSON
{
  "fields": {
    "project": {
      "key": "$PROJECT"
    },
    "summary": "$title",
    "description": "$description",
    "issuetype": {
      "name": "Story"
    },
    "labels": $labels_array,
    "customfield_10014": "$EPIC_KEY"
  }
}
EOJSON
)
    
    # Create ticket
    local response=$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
        -H "Accept: application/json" \
        -H "Content-Type: application/json" \
        -d "$json_payload" \
        -X POST \
        "$JIRA_URL/rest/api/2/issue")
    
    local ticket_key=$(echo "$response" | jq -r '.key // empty')
    
    if [ -n "$ticket_key" ]; then
        echo "✅ Created $ticket_key"
        
        # Add story points if provided
        if [ -n "$story_points" ]; then
            curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
                -H "Accept: application/json" \
                -H "Content-Type: application/json" \
                -d "{\"fields\": {\"customfield_10016\": $story_points}}" \
                -X PUT \
                "$JIRA_URL/rest/api/2/issue/$ticket_key" > /dev/null
        fi
    else
        echo "❌ Failed to create story"
        echo "$response" | jq .
    fi
}

# Phase 3 Stories
echo "Creating Phase 3 Stories..."

create_story \
    "Extended API Tests" \
    "backend,api" \
    "Expand API testing to secondary endpoints and complex scenarios.

## Acceptance Criteria:
- [ ] Test venue management endpoints
- [ ] Test organizer endpoints
- [ ] Test search and filter endpoints
- [ ] Test batch operations
- [ ] Test pagination
- [ ] Test rate limiting
- [ ] Test API versioning" \
    8

create_story \
    "Advanced E2E Scenarios" \
    "e2e,frontend" \
    "Implement E2E tests for complex multi-step workflows.

## Acceptance Criteria:
- [ ] Test event lifecycle (create → edit → delete)
- [ ] Test cross-application navigation
- [ ] Test error recovery scenarios
- [ ] Test offline functionality
- [ ] Test data persistence
- [ ] Test browser back/forward
- [ ] Test deep linking" \
    8

create_story \
    "Component Unit Tests - User Features" \
    "frontend,users" \
    "Create unit tests for user-related features.

## Acceptance Criteria:
- [ ] Test UserSettings components
- [ ] Test Favorites management
- [ ] Test Regional preferences
- [ ] Test Profile management
- [ ] Test notification preferences
- [ ] Test data export features
- [ ] Achieve 85% coverage" \
    5

create_story \
    "Integration Tests" \
    "integration" \
    "Create integration tests for service interactions.

## Acceptance Criteria:
- [ ] Test API client integrations
- [ ] Test context provider interactions
- [ ] Test service layer operations
- [ ] Test data transformations
- [ ] Test caching mechanisms
- [ ] Test error propagation
- [ ] Document integration patterns" \
    8

echo "Phase 3 stories created\!"
