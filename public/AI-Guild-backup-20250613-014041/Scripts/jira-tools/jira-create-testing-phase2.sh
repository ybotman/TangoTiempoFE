#\!/bin/bash

# Create Phase 2 JIRA testing stories linked to Epic TIEMPO-70

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

# Phase 2 Stories
echo "Creating Phase 2 Stories..."

create_story \
    "Core API Endpoint Tests" \
    "backend,api,priority-high" \
    "Implement comprehensive tests for critical backend API endpoints.

## Acceptance Criteria:
- [ ] Test all authentication endpoints (login, logout, refresh)
- [ ] Test event CRUD operations
- [ ] Test user management endpoints
- [ ] Test data validation and error cases
- [ ] Test authorization/permissions
- [ ] Achieve 80% coverage on tested endpoints
- [ ] Document API testing patterns

## Test Categories:
- Authentication flows
- Event operations (create, read, update, delete)
- User operations
- Error handling
- Input validation" \
    13

create_story \
    "Critical E2E User Journeys" \
    "e2e,frontend,priority-high" \
    "Create E2E tests for the most critical user workflows.

## Acceptance Criteria:
- [ ] Test complete registration flow
- [ ] Test login/logout flow
- [ ] Test event discovery and filtering
- [ ] Test event details viewing
- [ ] Test basic calendar interactions
- [ ] Test mobile responsive behavior
- [ ] Create reusable test helpers

## Test Scenarios:
\`\`\`javascript
// Example structure
describe('Critical User Journeys', () => {
  it('should complete full registration flow', () => {})
  it('should login and access protected routes', () => {})
  it('should discover and filter events', () => {})
  it('should view event details', () => {})
})
\`\`\`" \
    8

create_story \
    "Component Unit Tests - Authentication" \
    "frontend,auth" \
    "Create unit tests for all authentication-related components and utilities.

## Acceptance Criteria:
- [ ] Test Login component
- [ ] Test Logout functionality
- [ ] Test protected route components
- [ ] Test token management utilities
- [ ] Test auth context providers
- [ ] Test error states
- [ ] Achieve 90% coverage" \
    5

create_story \
    "Component Unit Tests - Events" \
    "frontend,events" \
    "Create unit tests for event-related components.

## Acceptance Criteria:
- [ ] Test EventCard component
- [ ] Test EventList component
- [ ] Test EventFilters component
- [ ] Test CalendarView component
- [ ] Test event utility functions
- [ ] Test loading and error states
- [ ] Achieve 85% coverage" \
    8

echo "Phase 2 stories created\!"
