# AI-Guild Version History

## Current Version: 1.05
**Release Date:** 2025-01-06

### Version 1.05 Changes
- Added .guild-config for branch management
- Integrated JIRA tools with AI-Guild roles
- Added Self-Introspective Analysis Mode
- Implemented PROJECTGUILD for Guild improvement tickets
- Enhanced startup process with config validation

### Version 1.04 Changes
- Initial public release
- Core role system implementation
- Playbook structure established
- Git workflow integration

## Version Numbering Scheme

**Format:** MAJOR.MINOR

- **MAJOR**: Significant architectural changes or breaking changes
- **MINOR**: New features, role additions, or process improvements

## Checking Version

The AI-Guild version is stored in:
1. `.guild-config` - GUILD_VERSION variable
2. `Guild Overview.md` - Header version
3. This file - Detailed changelog

## Upgrade Instructions

When updating the AI-Guild:
1. Pull latest changes from origin
2. Check VERSION.md for breaking changes
3. Update .guild-config if needed
4. Review any new playbooks or role changes
5. Run startup process to validate configuration