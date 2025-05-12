# Epic_5003_ServiceLayerArchitecture

> **Guidance:**  
> Each Guild role must update its own section below, using its icon and a datetime stamp.  
> The only mandatory roles are:  
> - 🗂️ **KANBAN**: Tracks what must be done, who is assigned, and current status.  
> - 🧭 **SCOUT**: Records research, discoveries, and risks.  
> - 🛠️ **BUILDER / PATCH / TINKER**: Notes implementation details, blockers, and technical choices.  
>  
> All updates, decisions, and recommendations **must** be made in this document, clearly marked by role and timestamp.  
> Add other roles as needed, following the same pattern.  
>  
> **Include at least one architecture diagram, graphical summary, or annotated visual for each Epic and for each major phase.**  
> Store images in the Epic folder and embed them below.

## 🗂️ KANBAN (Required)
_What must be done, who is assigned, and current status.  
All task assignments and workflow status updates go here._  
**Last updated:** 2025-05-12 15:30

- [ ] Create architectural diagram for service layer pattern
- [ ] Identify all API call locations in current codebase
- [ ] Classify API calls by domain (events, venues, users, etc.)
- [ ] Implement Phase 1: Foundation & Core Services
- [ ] Implement Phase 2: Location & Authentication Services
- [ ] Implement Phase 3: User & Organizer Services
- [ ] Implement Phase 4: Utility & Support Services
- [ ] Implement Phase 5: Testing & Documentation

## 🧭 SCOUT (Required)
_Research, discoveries, risks, and open questions.  
Document findings and recommendations here._  
**Last updated:** 2025-05-12 15:30

- Initial survey reveals most API calls are embedded directly in hook implementations (useEvents.js, etc.)
- The venueService.js implementation provides a good pattern to follow for other services
- Current hooks are often performing multiple roles (state management, API calls, data transformation)
- Circular dependencies exist between contexts, which services can help resolve
- The codebase would benefit from consistent error handling and caching strategies

## 🛠️ BUILDER / TINKER (Required)
_Implementation details, blockers, and technical choices.  
This section may be labeled as **BUILDER**, **PATCH**, or **TINKER**—use whichever role is appropriate.  
Document what was built, how, and any issues encountered._  
**Last updated:** 2025-05-12 15:30

- The service layer pattern should follow these principles:
  - Services are placed in `src/services/` directory
  - Services export functions for API operations (get, create, update, delete)
  - Each service focuses on a specific domain (events, venues, auth, etc.)
  - Services handle error management, retries, and request formatting
  - Services abstract away API endpoints from components/hooks

---

### Architecture & Visuals

_A diagram will be created to show the service layer architecture and its relationship with hooks, contexts, and components._

```
Planned diagram: Service Layer Architecture showing:
1. Component → Hook → Service → API flow
2. Service layer composition
3. Before/after comparison of component to API relationship
```

---

### Summary

This Epic will implement a comprehensive service layer throughout the TangoTiempo application, extracting API calls and data fetching logic from hooks and components into dedicated service modules. This architectural change will improve code organization, testability, and maintainability while resolving current architectural issues.

### Scope

**Inclusions:**  
- Creation of a complete service layer in `src/services/`
- Refactoring of all API calls from hooks into appropriate services
- Implementation of consistent error handling and retry logic
- Resolution of circular dependencies between contexts
- Addition of service-level caching where appropriate
- Documentation of service patterns and interfaces
- Unit tests for all services

**Exclusions:**  
- UI component refactoring (except where needed for service integration)
- Visual design changes
- Feature additions beyond current functionality
- Backend API changes
- Database schema modifications

### Motivation

The current codebase mixes concerns in hook implementations, with API calls, state management, and UI logic often in the same file. This creates:

1. **Maintainability issues**: Changes to API interactions affect hook implementations
2. **Testing challenges**: Hooks with API calls are difficult to test in isolation
3. **Code duplication**: Similar API call patterns repeated across hooks
4. **Circular dependencies**: Context files importing from each other
5. **Inconsistent error handling**: Each hook handles errors differently

A service layer will address these issues by:
- Separating concerns clearly
- Providing a consistent interface for data operations
- Centralizing error handling and caching strategies
- Making the codebase more testable
- Facilitating future extensions

### Changes

**Frontend:**  
- New service files for each domain (events, venues, auth, etc.)
- Refactored hooks to use services instead of direct API calls
- Updated context providers to use services for data fetching
- Consistent error handling across services
- Service-level caching implementation

**API Integration:**  
- No changes to actual endpoints
- Improved error handling and retry logic
- Consistent parameter formatting and response processing
- Better request timeout and cancelation handling

**Testing:**  
- Unit tests for all services
- Mock services for component testing

### Risks & Mitigations

| Risk | Mitigation |
|-------|------------|
| Regression in API functionality | Comprehensive testing after each phase; services implemented one at a time |
| Inconsistency in service implementations | Clear service pattern documentation; code reviews focused on pattern adherence |
| Performance impact from additional abstraction layer | Performance monitoring; caching implementation where beneficial |
| Circular dependencies proving difficult to resolve | Shared utility functions; interim adapter pattern if needed |
| Scope creep during refactoring | Clear phase boundaries; strict adherence to "same functionality" principle |

### Rollback Strategy

Each phase will be implemented on its own branch and merged only when complete and tested. Rollback involves:

1. Revert the specific phase branch merge
2. Return to the previous branch for that phase
3. If necessary, revert configuration changes (jsconfig.json paths)

### Dependencies

- Current venueService.js pattern
- Existing hook implementations
- Next.js configuration (jsconfig.json for path aliases)

### Linked Epics

- Related to PMR_Geolocation_Hierarchy.md (will help resolve circular dependencies)

### Owner

TangoTiempo engineering team

---

### Phases

Each Epic is divided into multiple phases.  
**Each phase:**
- Has its own branch (e.g., `epic/5003-phase-1-foundation`)
- Is worked on and committed independently
- Must be completed, reviewed, and merged before the next phase starts
- May refactor existing code as needed
- **All phase-specific actions, decisions, and notes must be recorded in the role sections above and in the phase table below**

#### Phase Table

| Phase    | Status         | Branch Name                        | Last Updated | Description                  |
|----------|---------------|------------------------------------|--------------|------------------------------|
| Phase 1  | ⏳ Pending     | epic/5003-phase-1-foundation       | 2025-05-12   | Foundation & Core Services   |
| Phase 2  | ⏳ Pending     | epic/5003-phase-2-location-auth    | -            | Location & Authentication    |
| Phase 3  | ⏳ Pending     | epic/5003-phase-3-user-organizer   | -            | User & Organizer Services    |
| Phase 4  | ⏳ Pending     | epic/5003-phase-4-utility         | -            | Utility & Support Services   |
| Phase 5  | ⏳ Pending     | epic/5003-phase-5-testing         | -            | Testing & Documentation      |

---

### Phase Details

#### Phase 1: Foundation & Core Services

**Goals:**  
- Establish the service layer pattern and infrastructure
- Create core services for events and venues
- Improve hook implementations for these domains

**Tasks:**

| Status  | Task                                           | Last Updated |
|---------|------------------------------------------------|--------------|
| ⏳ Pending | Document service pattern standards              | 2025-05-12   |
| ⏳ Pending | Create serviceUtils.js for common functionality  | 2025-05-12   |
| ⏳ Pending | Implement eventService.js                       | 2025-05-12   |
| ⏳ Pending | Update useEvents.js to use eventService          | 2025-05-12   |
| ⏳ Pending | Refine venueService.js to match new pattern      | 2025-05-12   |
| ⏳ Pending | Update useVenues.js to use venueService          | 2025-05-12   |
| ⏳ Pending | Add basic error handling in core services        | 2025-05-12   |
| ⏳ Pending | Ensure jsconfig.json properly maps service paths | 2025-05-12   |

**Rollback (if needed):**  
- Revert to original hook implementations
- Remove service files
- Reset jsconfig.json paths if modified

**Notes:**  
- This phase builds on the venueService.js pattern already in place
- Focus on establishing the pattern more than extensive refactoring

#### Phase 2: Location & Authentication Services

**Goals:**  
- Address circular dependencies in location contexts
- Extract authentication logic to dedicated services
- Improve initialization flow for location and auth

**Tasks:**

| Status  | Task                                               | Last Updated |
|---------|--------------------------------------------------|--------------|
| ⏳ Pending | Create geoLocationService.js                       | -            |
| ⏳ Pending | Create masteredLocationService.js                  | -            |
| ⏳ Pending | Create authService.js for Firebase auth            | -            |
| ⏳ Pending | Update GeoLocationContext to use services          | -            |
| ⏳ Pending | Update MasteredLocationContext to use services     | -            |
| ⏳ Pending | Update AuthContext to use authService              | -            |
| ⏳ Pending | Resolve circular dependencies between contexts     | -            |
| ⏳ Pending | Implement proper initialization sequence           | -            |

**Rollback (if needed):**  
- Revert to original context implementations
- Remove service files

**Notes:**  
- This phase addresses the architectural issues described in Context Analisys.md
- Focus on resolving circular dependencies through service abstraction

#### Phase 3: User & Organizer Services

**Goals:**  
- Extract user profile and preferences logic
- Create organizer management services
- Implement caching for frequently used data

**Tasks:**

| Status  | Task                                           | Last Updated |
|---------|------------------------------------------------|--------------|
| ⏳ Pending | Create userService.js                           | -            |
| ⏳ Pending | Create organizerService.js                      | -            |
| ⏳ Pending | Implement client-side caching strategy          | -            |
| ⏳ Pending | Update useUserLogins.js to use userService      | -            |
| ⏳ Pending | Update useOrganizers.js to use organizerService | -            |
| ⏳ Pending | Update role-based components                    | -            |

**Rollback (if needed):**  
- Revert to original hook implementations
- Remove service files
- Remove caching implementation

**Notes:**  
- Caching is particularly important for organizer data which is used extensively

#### Phase 4: Utility & Support Services

**Goals:**  
- Create remaining secondary services
- Implement logging and analytics services
- Ensure consistent patterns across all services

**Tasks:**

| Status  | Task                                           | Last Updated |
|---------|------------------------------------------------|--------------|
| ⏳ Pending | Create image handling services                  | -            |
| ⏳ Pending | Implement analyticsService.js                   | -            |
| ⏳ Pending | Create loggingService.js                        | -            |
| ⏳ Pending | Add notification and other utility services     | -            |
| ⏳ Pending | Standardize all services to follow pattern      | -            |

**Rollback (if needed):**  
- Revert to original implementations
- Remove service files

**Notes:**  
- Focus on consistency and completing the service layer architecture

#### Phase 5: Testing & Documentation

**Goals:**  
- Add unit tests for all services
- Create comprehensive documentation
- Implement test mocks for services

**Tasks:**

| Status  | Task                                           | Last Updated |
|---------|------------------------------------------------|--------------|
| ⏳ Pending | Write unit tests for all services               | -            |
| ⏳ Pending | Create mock services for component testing      | -            |
| ⏳ Pending | Document service interfaces                     | -            |
| ⏳ Pending | Update README files with architecture info      | -            |
| ⏳ Pending | Create service usage examples                   | -            |

**Rollback (if needed):**  
- No significant risk - testing and documentation changes don't affect production code

**Notes:**  
- Focus on providing good developer documentation for future maintenance

---

### Timeline

| Stage        | Date       |
|--------------|------------|
| Start        | 2025-05-13 |
| Phase 1 Complete | TBD    |
| Phase 2 Complete | TBD    |
| Phase 3 Complete | TBD    |
| Phase 4 Complete | TBD    |
| Phase 5 Complete | TBD    |
| Final Review | TBD        |

---

### Status & Next Steps

This centralizes status across all phases.  
Keep this table updated continuously.

| Phase     | Status    | Next Step                          | Last Updated |
|-----------|-----------|-----------------------------------|--------------|
| Phase 1:  | ⏳ Pending | Create foundation and patterns     | 2025-05-12   |
| Phase 2:  | ⏳ Pending | Begin after Phase 1 complete       | 2025-05-12   |
| Phase 3:  | ⏳ Pending | Begin after Phase 2 complete       | 2025-05-12   |
| Phase 4:  | ⏳ Pending | Begin after Phase 3 complete       | 2025-05-12   |
| Phase 5:  | ⏳ Pending | Begin after Phase 4 complete       | 2025-05-12   |

✅ No more updating status in multiple places. This is the one source of truth.

---