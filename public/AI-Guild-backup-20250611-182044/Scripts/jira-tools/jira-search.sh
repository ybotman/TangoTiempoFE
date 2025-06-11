#!/bin/bash

# Load common configuration
source "$(dirname "$0")/jira-common.sh"

# Search for issues
curl -s -u "$JIRA_EMAIL:$JIRA_TOKEN" \
  -H "Accept: application/json" \
  "$JIRA_URL/rest/api/2/search?jql=$1" | jq '.'
