Here's a comprehensive list of JIRA CLI commands:

  AUTHENTICATION
  jira login                 # Login to JIRA
  jira logout                # Logout from JIRA
  jira me                    # Show current user info
  jira config                # Show/edit configuration

  ISSUE COMMANDS

  # Listing & Searching
  jira issue list                      # List issues
  jira issue list -a$(jira me)         # List your issues
  jira issue list -s"In Progress"      # List by status
  jira issue list -t"Bug"              # List by type
  jira issue list -q"JQL query"        # Custom JQL query
  jira issue list --history            # Recently viewed
  jira issue list --watching           # Issues you're watching
  jira issue list --created="2024"     # Filter by date

  # Creating
  jira issue create                    # Interactive create
  jira issue create -tBug -s"Summary" -d"Description" -pPROJECT
  jira issue create --template="bug"   # Use template
  jira issue create --parent=ABC-123   # Create subtask

  # Viewing & Editing
  jira issue view ABC-123              # View issue
  jira issue view ABC-123 --web        # Open in browser
  jira issue edit ABC-123              # Interactive edit
  jira issue edit ABC-123 -s"New Summary"
  jira issue edit ABC-123 --priority="High"
  jira issue delete ABC-123            # Delete issue

  # Assignment & Watchers
  jira issue assign ABC-123 john.doe   # Assign to user
  jira issue assign ABC-123 -d         # Assign to default (you)
  jira issue unassign ABC-123          # Remove assignee
  jira issue watch ABC-123             # Add yourself as watcher
  jira issue unwatch ABC-123           # Remove as watcher

  # Comments
  jira issue comment ABC-123           # Interactive comment
  jira issue comment ABC-123 -m"Text"  # Add comment
  jira issue comment list ABC-123      # List comments

  # Transitions/Workflow
  jira issue move ABC-123              # Interactive status change
  jira issue move ABC-123 "Done"       # Move to status
  jira issue transitions ABC-123       # Show available transitions

  # Work Logging
  jira issue worklog add ABC-123       # Log work
  jira issue worklog add ABC-123 -T"2h 30m" -m"Work done"
  jira issue worklog list ABC-123      # List work logs

  # Linking
  jira issue link ABC-123 DEF-456      # Link issues
  jira issue link ABC-123 DEF-456 --type="blocks"
  jira issue unlink ABC-123 DEF-456    # Remove link

  # Attachments
  jira issue attach ABC-123 file.pdf   # Attach file
  jira issue attach list ABC-123       # List attachments

  # Labels & Components
  jira issue label add ABC-123 "frontend"
  jira issue label remove ABC-123 "backend"
  jira issue component add ABC-123 "UI"

  SPRINT COMMANDS

  jira sprint list                     # List sprints
  jira sprint list --current           # Current sprint
  jira sprint list --future            # Future sprints
  jira sprint list --closed            # Past sprints
  jira sprint add ABC-123 15           # Add issue to sprint
  jira sprint remove ABC-123           # Remove from sprint

  BOARD COMMANDS

  jira board list                      # List boards
  jira board view 10                   # View board details

  PROJECT COMMANDS

  jira project list                    # List all projects
  jira project view PROJ               # View project details

  EPIC COMMANDS

  jira epic list                       # List epics
  jira epic create -s"Epic Name"       # Create epic
  jira epic add ABC-123 EPIC-100       # Add issue to epic
  jira epic remove ABC-123             # Remove from epic

  USER & TEAM

  jira user list                       # List users
  jira user search "john"              # Search users

  FILTERS & SEARCH

  jira filter list                     # List saved filters
  jira filter view 12345               # View filter results

  CUSTOM FIELDS

  jira fields list                     # List all fields
  jira issue edit ABC-123 --custom-field-10001="Value"

  EXPORT/IMPORT

  jira issue export ABC-123            # Export issue data
  jira issue export --format=json      # Export as JSON

  OPEN/BROWSE

  jira open                            # Open JIRA in browser
  jira open ABC-123                    # Open issue in browser
  jira browse ABC-123                  # Alias for open

  COMPLETION & HELP

  jira completion bash                 # Generate bash completion
  jira help                           # General help
  jira issue help                     # Issue command help
  jira issue list --help              # Specific command help

  COMMON FLAGS

  --project, -p     # Specify project
  --assignee, -a    # Specify assignee
  --type, -t        # Issue type
  --priority        # Priority level
  --status, -s      # Status
  --limit           # Limit results
  --no-input        # Non-interactive mode
  --debug           # Debug output
  --columns         # Customize output columns

  EXAMPLES OF COMPLEX USAGE

  # Create bug with all fields
  jira issue create -tBug -s"Login fails" -d"Users cannot login" \
    -pWEB --priority=High --assignee=john.doe --label=critical

  # List issues with custom columns
  jira issue list --columns=key,summary,status,assignee

  # Bulk operations
  jira issue list -q"project = WEB AND status = 'To Do'" | \
    xargs -I {} jira issue move {} "In Progress"

  # Custom JQL queries
  jira issue list -q"assignee = currentUser() AND sprint in openSprints()"

╭────────────────────────────────────────────────────────────────────────────────────────────────────────────