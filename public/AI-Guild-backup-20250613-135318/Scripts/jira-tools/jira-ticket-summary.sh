#!/bin/bash

# JIRA Ticket Summary - Shows complete history, worklogs, and status

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

if [ $# -eq 0 ]; then
    echo "Usage: $0 <ticket>"
    exit 1
fi

TICKET=$1

echo "╔════════════════════════════════════════════════╗"
echo "║          AI-GUILD TICKET SUMMARY               ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Get ticket details
TICKET_DATA=$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    -H "Accept: application/json" \
    "$JIRA_URL/rest/api/2/issue/$TICKET?fields=summary,status,created,updated,description,issuetype")

echo "📋 TICKET: $TICKET"
echo "$TICKET_DATA" | jq -r '"Summary: \(.fields.summary)\nType: \(.fields.issuetype.name)\nStatus: \(.fields.status.name)\nCreated: \(.fields.created | split("T")[0])"'
echo ""

echo "📊 STATUS HISTORY:"
echo "─────────────────"
# Get changelog for status transitions
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    -H "Accept: application/json" \
    "$JIRA_URL/rest/api/2/issue/$TICKET?expand=changelog&fields=status" | \
    jq -r '.changelog.histories[] | 
        select(.items[].field == "status") | 
        "\(.created | split("T")[0] + " " + split("T")[1] | split(".")[0]) - \(.items[] | select(.field == "status") | .fromString + " → " + .toString)"' | \
    sort

echo ""
echo "⏱️  WORK LOG BY ROLE:"
echo "───────────────────"
WORKLOGS=$(curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    -H "Accept: application/json" \
    "$JIRA_URL/rest/api/2/issue/$TICKET/worklog")

# Parse and display worklogs
echo "$WORKLOGS" | jq -r '.worklogs[] | 
    "\(.comment | split("\n")[0] | gsub("AI-Guild Role: "; "")) - \(.timeSpent)\n  → \(.comment | split("\n") | .[3:] | select(. | contains("Handover")) | gsub("Handover to "; "Ready for: "))"' | \
    sed 's/^/• /'

# Calculate total time
TOTAL_SECONDS=$(echo "$WORKLOGS" | jq -r '.worklogs[].timeSpentSeconds' | awk '{sum+=$1} END {print sum}')
TOTAL_HOURS=$((TOTAL_SECONDS / 3600))
TOTAL_MINUTES=$(((TOTAL_SECONDS % 3600) / 60))

echo ""
echo "⏰ TOTAL TIME: ${TOTAL_HOURS}h ${TOTAL_MINUTES}m"
echo ""

echo "💬 RECENT ACTIVITY:"
echo "─────────────────"
# Get last 3 comments
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
    -H "Accept: application/json" \
    "$JIRA_URL/rest/api/2/issue/$TICKET/comment" | \
    jq -r '.comments[-3:] | reverse | .[] | 
        "[\(.created | split("T")[0])] \(.body | split("\n")[0])"' | \
    head -5

echo ""
echo "═══════════════════════════════════════════════"