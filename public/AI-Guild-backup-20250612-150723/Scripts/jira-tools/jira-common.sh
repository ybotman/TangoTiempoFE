#!/bin/bash

# Common JIRA configuration loader
# Source this in all JIRA scripts: source ./jira-common.sh

# Look for config file in app root
CONFIG_FILE="${JIRA_CONFIG_FILE:-$(pwd)/.jira-config}"

if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
else
    echo "Error: No .jira-config file found"
    echo "Copy .jira-config.example to .jira-config and update with your settings"
    exit 1
fi

# Get token from keychain (secure storage)
JIRA_TOKEN=$(security find-generic-password -a "$(whoami)" -s "jira-api-token" -w 2>/dev/null)

if [ -z "$JIRA_TOKEN" ]; then
    echo "Error: No JIRA API token found in keychain"
    echo "Add token with: security add-generic-password -a \"\$(whoami)\" -s \"jira-api-token\" -w \"your-token\""
    exit 1
fi

# Validate required variables
if [ -z "$JIRA_URL" ] || [ -z "$JIRA_EMAIL" ] || [ -z "$PROJECT" ]; then
    echo "Error: Missing required configuration in .jira-config"
    echo "Required: JIRA_URL, JIRA_EMAIL, PROJECT"
    exit 1
fi