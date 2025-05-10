# FEATURE_3003_OrganizerSelectionModal

## Summary
This feature adds a new "Select Organizer" menu option to the hamburger menu, allowing users to filter events based on multiple selected organizers. The organizers will be displayed in a modal with a multi-column layout and checkbox selection, with options to navigate to organizer profiles and filter by recently active organizers.

## Motivation
- Enhance user experience by providing additional filtering capabilities
- Allow users to focus on events from specific organizers they're interested in
- Provide more granular control over the content displayed in calendar views
- Enable quick navigation to organizer profile pages

## Scope
- **In-Scope:**
  - New "Select Organizer" menu item in the hamburger menu
  - Multi-select modal for organizers with checkbox interface
  - Client-side filtering of events based on selected organizers
  - Initial server-side filtering based on user's location context
  - Toggle for "Recently Active Organizers Only"
  - Placeholder buttons for navigation to organizer profile pages
  - Search functionality within the modal
  - Sorting organizers alphabetically for easy selection

- **Out-of-Scope:**
  - Changes to the backend API or data model
  - Adding, editing, or managing organizers
  - Changes to event creation or editing workflows
  - Implementation of actual organizer profile pages

## Feature Behavior
| Area       | Behavior Description                                  |
|------------|--------------------------------------------------------|
| UI         | - New menu item in hamburger menu, positioned between "Select Nearest City" and "Select Venue"<br>- Modal with multi-column organizer list (2 columns)<br>- Checkbox selection for multiple organizers<br>- Search box for quick filtering<br>- Toggle for "Recently Active Organizers Only"<br>- Buttons to navigate to organizer profiles<br>- "Select All" and "Clear All" options<br>- "Apply" and "Cancel" buttons<br>- Visual indication of active filters |
| API        | - Use existing endpoints, no new API changes required<br>- Filter organizers server-side by isActive:true and matching region to user's context |
| Backend    | - No backend changes required (client-side filtering for selected organizers) |
| Integration | - Integration with GeoLocationContext for region-based filtering<br>- Integration with existing event display and filtering system<br>- Post-API filter similar to category filtering in PostFilter component |

## Design
The modal will present organizers in a clean, two-column layout with:
- Header with title, search box, and filter toggle
- Selection controls (Select All, Clear All)
- Multi-column scrollable list of organizers with checkboxes
- Each organizer row includes a link button to future profile page
- Footer with selected count and action buttons

## Tasks
| Status         | Task                                                      | Last Updated  |
|----------------|-----------------------------------------------------------|---------------|
| ⏳ Pending      | Create OrganizerSelectionModal component with checkboxes   | 2025-05-09    |
| ⏳ Pending      | Implement multi-column layout and search functionality     | 2025-05-09    |
| ⏳ Pending      | Add "Recently Active Organizers" toggle                    | 2025-05-09    |
| ⏳ Pending      | Add placeholder navigation buttons to organizer profiles   | 2025-05-09    |
| ⏳ Pending      | Add "Select Organizer" option to hamburger menu           | 2025-05-09    |
| ⏳ Pending      | Create useOrganizerFilter hook for post-API filtering      | 2025-05-09    |
| ⏳ Pending      | Integrate with event display filtering in calendar view    | 2025-05-09    |
| ⏳ Pending      | Add visual indication for active organizer filters         | 2025-05-09    |
| ⏳ Pending      | Implement local storage persistence for selections         | 2025-05-09    |
| ⏳ Pending      | Write tests for organizer selection functionality          | 2025-05-09    |
| ⏳ Pending      | Final review and testing                                   | 2025-05-09    |

## Rollback Plan
If rollback is required:
- Remove the "Select Organizer" menu item from hamburger menu
- Remove the OrganizerSelectionModal component
- Remove the useOrganizerFilter hook
- Clear any stored organizer selections from local storage
- Revert to standard filtering without organizer selection

## Dependencies
- Existing hamburger menu component (SidebarDrawer.js)
- Existing events filtering system (useEvents.js)
- Organizer data model and API (useOrganizers.js)
- GeoLocationContext for region-based filtering
- Local storage for persisting selections

## Technical Implementation Notes
- **Filtering Approach**:
  1. Server-side: Filter organizers by `isActive: true` and matching region using GeoLocationContext
  2. UI Filtering: Allow further filtering by "Recently Active" toggle and search box
  3. Event Filtering: Apply selected organizers as a post-API filter on events

- **Performance Considerations**:
  - Cache organizer selections in local storage to persist between sessions
  - Implement efficient filtering to maintain smooth UI experience
  - Use virtualized lists if organizer count becomes very large

- **User Experience**:
  - Provide clear visual feedback when filters are active
  - Ensure accessibility of checkbox controls and search
  - Maintain responsive design for all screen sizes

## Linked Issues / Docs
- Related to venue selection functionality (Feature_3001_VenueSelectionModal)
- Uses similar filtering approach as category filters in PostFilter component

## Owner
Claude

## Timeline
| Milestone | Date       |
|-----------|------------|
| Created   | 2025-05-09 |
| First Dev | -          |
| Review    | -          |
| Completed | -          |