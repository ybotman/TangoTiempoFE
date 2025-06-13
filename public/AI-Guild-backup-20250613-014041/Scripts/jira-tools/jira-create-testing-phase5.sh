#\!/bin/bash

# Create Phase 5 JIRA testing stories linked to Epic TIEMPO-70

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

# Phase 5 Stories
echo "Creating Phase 5 Stories..."

create_story \
    "Test Performance Optimization" \
    "performance,optimization" \
    "Optimize test execution speed and reliability.

## Acceptance Criteria:
- [ ] Profile slow tests
- [ ] Implement test parallelization
- [ ] Add test result caching
- [ ] Reduce test flakiness to <5%
- [ ] Optimize test data setup
- [ ] Minimize test dependencies
- [ ] Document optimization techniques" \
    5

create_story \
    "Advanced Testing Capabilities" \
    "advanced,monitoring" \
    "Implement advanced testing methodologies.

## Acceptance Criteria:
- [ ] Add contract testing between services
- [ ] Implement load testing for APIs
- [ ] Add security testing automation
- [ ] Create synthetic monitoring
- [ ] Add mutation testing
- [ ] Implement chaos engineering tests
- [ ] Document advanced patterns" \
    13

create_story \
    "Test Data Management" \
    "data,infrastructure" \
    "Create robust test data management system.

## Acceptance Criteria:
- [ ] Implement test data factories
- [ ] Create database seeding strategies
- [ ] Add test environment isolation
- [ ] Implement data cleanup routines
- [ ] Create data generation utilities
- [ ] Add data snapshot capabilities
- [ ] Document data strategies" \
    8

create_story \
    "Continuous Improvement" \
    "process,metrics" \
    "Establish ongoing testing improvement processes.

## Acceptance Criteria:
- [ ] Create testing metrics dashboard
- [ ] Schedule coverage reviews
- [ ] Plan test refactoring sprints
- [ ] Define new feature test requirements
- [ ] Create test health monitoring
- [ ] Establish testing SLAs
- [ ] Document improvement process" \
    5

echo "Phase 5 stories created\!"
