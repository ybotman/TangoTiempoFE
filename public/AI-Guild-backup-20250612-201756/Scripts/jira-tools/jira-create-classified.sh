#!/bin/bash

# Create JIRA tickets with proper classification (broken/new, domain)

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Function to create classified ticket
create_ticket() {
    local title=$1
    local work_type=$2  # broken or new-feature
    local domain=$3     # events, venues, etc.
    local description=$4
    local issue_type=${5:-"Task"}
    
    # Build labels array
    local labels="[\"$work_type\", \"domain-$domain\", \"frontend\"]"
    
    echo "Creating ticket:"
    echo "  Title: $title"
    echo "  Type: $work_type"
    echo "  Domain: $domain"
    
    # Create JSON payload
    local json_payload=$(cat <<EOF
{
  "fields": {
    "project": {
      "key": "$PROJECT"
    },
    "summary": "$title",
    "description": "$description",
    "issuetype": {
      "name": "$issue_type"
    },
    "labels": $labels
  }
}
EOF
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
        echo "$ticket_key"
    else
        echo "❌ Failed to create ticket"
        echo "$response" | jq .
    fi
}

# Examples
if [ "$1" = "demo" ]; then
    echo "Creating demo tickets with classification..."
    echo
    
    # Example 1: Broken functionality
    create_ticket \
        "Event Modal: Venue Selection Not Saving (Broken)" \
        "broken" \
        "events" \
        "## Context\nThe venue selection in the event edit modal is not being saved when users click Save.\n\n## Domain\nPrimary: Events\nRelated: Venues\n\n## Symptoms\n- User selects new venue\n- Clicks Save\n- Modal closes but venue remains unchanged\n- No error messages shown\n\n## Acceptance Criteria\n- Venue changes are persisted\n- Success notification shown\n- Event list reflects new venue" \
        "Task"
    
    echo
    
    # Example 2: New feature
    create_ticket \
        "Add Bulk Event Import from CSV (New Feature)" \
        "new-feature" \
        "events" \
        "## Context\nRegional Organizers need to import multiple events at once from spreadsheets.\n\n## Domain\nPrimary: Events\nRelated: Organizers, Venues\n\n## Requirements\n- CSV upload interface\n- Column mapping UI\n- Validation and error reporting\n- Progress indicator for large files\n\n## Acceptance Criteria\n- Can upload CSV with 100+ events\n- Shows validation errors clearly\n- Creates all valid events\n- Reports success/failure count" \
        "Story"
    
    echo
    echo "Demo tickets created with proper classification!"
elif [ $# -ge 4 ]; then
    # Create ticket with provided parameters
    create_ticket "$1" "$2" "$3" "$4" "${5:-Task}"
else
    echo "Usage: $0 demo"
    echo "   or: $0 <title> <work_type> <domain> <description> [issue_type]"
    echo
    echo "Work types: broken, new-feature, enhancement, tech-debt"
    echo "Domains: events, venues, organizers, users, calendar, geo, auth"
fi