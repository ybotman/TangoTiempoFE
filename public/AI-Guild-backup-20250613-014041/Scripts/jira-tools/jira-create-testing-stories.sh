#\!/bin/bash

# Create JIRA testing stories linked to Epic TIEMPO-70

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
    local labels_array="[\"testing\", \"infrastructure\""
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

# Phase 1 Stories
echo "Creating Phase 1 Stories..."

create_story \
    "Set up Jest Infrastructure" \
    "frontend" \
    "Install and configure Jest testing framework across all frontend applications to enable unit and integration testing.

## Acceptance Criteria:
- [ ] Install Jest and React Testing Library in tangotiempo.com
- [ ] Install Jest and React Testing Library in harmonyjunction.org
- [ ] Install Jest and React Testing Library in calops
- [ ] Configure Jest for Next.js compatibility
- [ ] Create jest.config.js with proper module mappings
- [ ] Fix and successfully run existing 6 test files
- [ ] Create shared test utilities directory
- [ ] Document Jest setup process

## Technical Notes:
Dependencies to install:
\`\`\`bash
jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
@testing-library/user-event @types/jest
\`\`\`" \
    8

create_story \
    "Configure Test Scripts & Coverage" \
    "devops" \
    "Set up test execution scripts and code coverage reporting across all applications.

## Acceptance Criteria:
- [ ] Add test scripts to all package.json files
- [ ] Configure Istanbul/nyc for coverage reporting
- [ ] Set initial coverage thresholds (20%)
- [ ] Add coverage directories to .gitignore
- [ ] Create coverage badge generation
- [ ] Set up HTML coverage reports
- [ ] Document coverage goals and progression

## Scripts to Add:
\`\`\`json
{
  \"scripts\": {
    \"test\": \"jest\",
    \"test:watch\": \"jest --watch\",
    \"test:coverage\": \"jest --coverage\",
    \"test:ci\": \"jest --ci --coverage --maxWorkers=2\"
  }
}
\`\`\`" \
    5

create_story \
    "Establish Cypress Best Practices" \
    "e2e,frontend" \
    "Standardize Cypress configuration and establish best practices for E2E testing.

## Acceptance Criteria:
- [ ] Update all apps to Cypress v14.3.2
- [ ] Create page object pattern structure
- [ ] Set up test data fixtures
- [ ] Configure multiple environment support
- [ ] Create custom Cypress commands
- [ ] Remove error suppression anti-patterns
- [ ] Document E2E testing guidelines" \
    5

create_story \
    "Backend Testing Setup" \
    "backend,api" \
    "Initialize testing infrastructure for the calendar-be backend service.

## Acceptance Criteria:
- [ ] Install Jest and Supertest
- [ ] Configure Jest for Node.js/Express
- [ ] Set up test database configuration
- [ ] Create API testing utilities
- [ ] Add test scripts to package.json
- [ ] Create first smoke test
- [ ] Document backend testing approach" \
    5

create_story \
    "Verify Testing Tools Installation" \
    "frontend,backend,verification" \
    "New story to verify that all testing tools are properly installed and working across all applications.

## Acceptance Criteria:
- [ ] Run sample Jest test in each frontend app
- [ ] Run sample Cypress test in each frontend app
- [ ] Run sample API test in backend
- [ ] Verify coverage reports generate correctly
- [ ] Confirm all test scripts work
- [ ] Document any issues found
- [ ] Create troubleshooting guide" \
    3

echo "Phase 1 stories created\!"
