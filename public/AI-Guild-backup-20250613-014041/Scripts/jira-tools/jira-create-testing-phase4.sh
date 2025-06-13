#\!/bin/bash

# Create Phase 4 JIRA testing stories linked to Epic TIEMPO-70

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

# Phase 4 Stories
echo "Creating Phase 4 Stories..."

create_story \
    "CI/CD Integration" \
    "devops,automation" \
    "Integrate testing into CI/CD pipeline with GitHub Actions.

## Acceptance Criteria:
- [ ] Create test workflow for PRs
- [ ] Set up parallel test execution
- [ ] Configure test result reporting
- [ ] Add coverage checks
- [ ] Create deployment gates
- [ ] Set up test artifact storage
- [ ] Document CI/CD process

## GitHub Actions Workflow:
\`\`\`yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Tests
        run: |
          npm test
          npm run test:e2e
\`\`\`" \
    8

create_story \
    "Pre-commit Hooks & Linting" \
    "quality,dx" \
    "Implement pre-commit hooks to ensure code quality.

## Acceptance Criteria:
- [ ] Install and configure Husky
- [ ] Run relevant tests on commit
- [ ] Integrate ESLint with tests
- [ ] Add Prettier formatting
- [ ] Create commit message validation
- [ ] Document hook bypass process
- [ ] Create developer guide" \
    3

create_story \
    "Visual & Accessibility Testing" \
    "a11y,visual" \
    "Add visual regression and accessibility testing capabilities.

## Acceptance Criteria:
- [ ] Implement Percy or similar for visual tests
- [ ] Add cypress-axe for accessibility
- [ ] Create visual test baseline
- [ ] Test color contrast compliance
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Document a11y standards" \
    8

create_story \
    "Test Documentation & Training" \
    "documentation,training" \
    "Create comprehensive testing documentation and examples.

## Acceptance Criteria:
- [ ] Create testing best practices guide
- [ ] Write test pattern examples
- [ ] Document test data management
- [ ] Create troubleshooting guide
- [ ] Build test recipe collection
- [ ] Create onboarding checklist
- [ ] Record training videos" \
    5

echo "Phase 4 stories created\!"
