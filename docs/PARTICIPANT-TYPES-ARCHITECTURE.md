# TangoTiempo Participant Types Architecture v2.0

**Date**: 2025-01-28
**Status**: Design Phase
**Author**: El Gotan & Ybot

## Executive Summary

This document outlines the architecture for expanding TangoTiempo from a binary user/organizer system to a comprehensive participant type ecosystem supporting DJs, Instructors, Orchestras, Taxi Dancers, Vendors, and more specialized roles within the tango community.

## Current State

### Existing Architecture
- **Authentication**: Firebase Auth (identity only)
- **User Data**: `userLogins` collection with `roleIds` array
- **Permissions**: Binary - organizer vs non-organizer
- **Admin Roles**: Already implemented via `roleIds`
  - SystemOwner, SystemAdmin, RegionalAdmin

### Key Problems
1. **Capability Conflation**: Permissions tied to "organizer" entity
2. **Limited Roles**: Only binary organizer/non-organizer distinction
3. **No Participant Types**: Missing DJ, Instructor, Vendor, etc.
4. **Rigid Permissions**: Can't have DJ who creates events vs DJ who only tags

## Agreed Architecture

### Core Principle: Flags on User, Capabilities in Code

Users have simple role flags, capabilities are defined in application code, not database.

### Data Model

```javascript
// userLogins collection - SIMPLE FLAGS ONLY
{
  firebaseUserId: "xxx",
  localUserInfo: {
    // SYSTEM ROLES (managed by cap-ops admin tool)
    roleIds: [
      { roleName: "SystemAdmin", _id: "..." },
      { roleName: "RegionalAdmin", _id: "..." }
    ],

    // PARTICIPANT TYPES (managed by cap-ops or self-service)
    tangoRoles: [
      "milonguero",    // Simple strings/flags
      "dj",
      "instructor",
      "organizer"
    ]
  }
}

// Separate collections for rich profile data
// djs collection
{
  djId: "dj_xxx",
  firebaseUserId: "xxx",
  profileUrl: "dj-carlos",
  displayName: "DJ Carlos",
  musicStyle: ["traditional", "nuevo"],
  biography: "...",
  playlists: [...],
  upcomingEvents: [...]
}
```

## Participant Types Matrix

### Base User Types

| Type | Auth Required | Description | Capabilities |
|------|---------------|-------------|--------------|
| **Anonymous** | No | Read-only calendar access | `view_calendar` |
| **Milonguero** | Yes | Logged-in dancer | `view_calendar`, `set_preferences`, `bookmark_events` |
| **Organizer** | Yes | Event creator (existing) | `create_events`, `modify_venues` |

### Specialized Participant Types

| Type | Profile URL | Event Capabilities | Page Features |
|------|------------|-------------------|---------------|
| **Orchestra** | `/orchestra/{name}` | `tag_event_orchestra`, `highlight_live_music` | Repertoire, schedule, members |
| **DJ** | `/dj/{username}` | `tag_event_dj`, `create_events`(TBD) | Music style, playlists, history |
| **Taxi Dancer** | `/taxi/{username}` | `tag_event_taxi` | Availability, styles, reviews |
| **Instrumentalist** | `/musician/{username}` | `tag_event_musician` | Instruments, affiliations |
| **Instructor** | `/instructor/{username}` | `create_events`, `tag_event_instructor` | Schedule, topics, certifications |
| **Maestro** | `/maestro/{username}` | `tag_event_maestro` | Orchestras, biography |
| **Performer** | `/performer/{username}` | `tag_event_performer` | Videos, shows, booking |
| **Vendor** | `/vendor/{username}` | `tag_event_vendor` | Products, presence, contact |

### System Admin Roles (Existing)

| Role | Scope | Special Capabilities |
|------|-------|---------------------|
| **SystemOwner** | Global | Base tables, config, financial |
| **SystemAdmin** | Global | Delete content, ban users, system health |
| **RegionalAdmin** | Regional | Approve organizers, resolve disputes |

## Capability Definitions (Code-Based)

```javascript
// capabilities.config.js - SINGLE SOURCE OF TRUTH
const ROLE_CAPABILITIES = {
  // System roles
  SystemOwner: ["*"],  // Everything
  SystemAdmin: ["delete_any", "ban_user", "modify_config"],
  RegionalAdmin: ["approve_organizer", "act_on_behalf"],

  // Participant types
  organizer: ["create_events", "modify_venues"],
  dj: ["tag_event_dj", "create_dj_profile"],
  instructor: ["create_events", "tag_event_instructor"],
  orchestra: ["tag_event_orchestra", "highlight_live_music"],
  taxi: ["tag_event_taxi"],
  vendor: ["tag_event_vendor"],
  milonguero: ["bookmark_events", "set_preferences"]
};
```

## Implementation Gaps

### Backend Requirements

1. **New API Endpoints Needed**:
   ```
   GET  /api/participants/types         - List available types
   GET  /api/participants/{userId}/profile
   PUT  /api/participants/{userId}/types
   GET  /api/{type}/{username}         - Public profile pages
   POST /api/{type}s                   - Create type profile
   ```

2. **Database Collections to Add**:
   - `djs`
   - `instructors`
   - `orchestras`
   - `taxis`
   - `vendors`
   - `performers`
   - `maestros`
   - `instrumentalists`

3. **Authorization Middleware**:
   - Check tangoRoles against capability requirements
   - Combine with existing roleIds checks

### Frontend Requirements

1. **Profile Pages**:
   - Template system for each participant type
   - Public URLs: `/dj/{username}`, `/instructor/{username}`, etc.
   - Profile management interfaces

2. **Event Tagging UI**:
   - Add participants to events
   - Display participant badges on event pages
   - Filter events by participant

3. **Application Flow**:
   - Self-service application for participant types
   - Admin approval workflow (cap-ops integration)

## Migration Strategy

### Phase 1: Foundation (Month 1-2)
1. Extend `userLogins` schema with `tangoRoles` array
2. Keep existing `roleIds` and organizer system intact
3. Create capability configuration in code
4. Migrate existing users:
   ```javascript
   if (user.isOrganizer) user.tangoRoles = ["organizer"];
   if (!user.isOrganizer) user.tangoRoles = ["milonguero"];
   ```

### Phase 2: MVP Types (Month 3-4)
1. Implement 3 initial types: DJ, Instructor, Orchestra
2. Create profile collections and APIs
3. Build basic profile pages
4. Add event tagging functionality

### Phase 3: Full Rollout (Month 5-6)
1. Add remaining participant types
2. Implement cap-ops admin interface
3. Enable self-service applications
4. Launch public profile pages

## Technical Decisions

### Agreed Upon
- ✅ Flags on users, capabilities in code
- ✅ Separate collections for profile data
- ✅ Keep existing admin role system
- ✅ Multiple parallel roles allowed per user
- ✅ tangoRoles as field name

### Still To Decide
- ❓ Can DJs create events or only tag?
- ❓ Taxi dancer privacy implementation details
- ❓ Vendor marketplace features scope
- ❓ Profile URL structure: `/dj/{username}` vs `/profile/{username}?type=dj`

## Security Considerations

1. **Privacy**: Taxi dancers require request-to-view protection
2. **Trust Levels**: Verification system for professionals
3. **Content Moderation**: Admin tools for removing offensive profiles
4. **Rate Limiting**: Prevent spam profile creation

## Performance Considerations

1. **Caching**: Profile data should be cached
2. **Indexing**: tangoRoles array needs database index
3. **Lazy Loading**: Load type-specific collections only when needed
4. **CDN**: Profile images and media via CDN

## Success Metrics

- User adoption of new roles (target: 30% in 6 months)
- Profile completion rates (target: 70%)
- Event tagging frequency (target: 2.5 participants per event)
- Page load performance (target: <2s for profiles)

## Next Steps

1. [ ] Review and approve architecture with team
2. [ ] Create JIRA epic for participant types
3. [ ] Design cap-ops admin interface mockups
4. [ ] Build capability configuration module
5. [ ] Start Phase 1 implementation

## Related Documents

- Original system architecture documentation
- Current API specifications
- Cap-ops admin tool documentation
- Firebase authentication setup

---

*This document represents the agreed-upon architecture from strategic planning session on 2025-01-28.*