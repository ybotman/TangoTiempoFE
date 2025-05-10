# Issue 1011: Hamburger Menu Location Mismatch

## Description
The hamburger menu always displays Detroit as the current location instead of the actual detected location (Boston). This occurs even when other parts of the UI correctly show Boston as the detected location.

## Problem
After the recent refactoring of the location context system, there's an inconsistency between the location shown in the hamburger menu and the actual location being used by the application. This suggests that different components are accessing location data through different paths or that location state updates aren't propagating correctly to all UI components.

## Steps to Reproduce
1. Launch the application
2. Note that the system properly defaults to Boston
3. Open the hamburger menu
4. Observe that the location shows "Detroit" instead of "Boston"

## Expected Behavior
The hamburger menu should display the same location (Boston) as the rest of the application.

## Technical Details
- The hamburger menu component likely uses a different access path to the location context
- May be related to how the SiteMenuBar.js or SidebarDrawer.js components access location data
- Could be caused by legacy references to the old context structure before refactoring

## Possible Solutions
- Ensure the hamburger menu component uses GeoLocationContext as the source of truth
- Update any references in SiteMenuBar.js or related components to use the current context pattern
- Review the initialization sequence to ensure location state is consistent across all contexts

## Priority
Medium - This is a UI consistency issue but doesn't prevent core functionality

## Dependencies
- Issue_1010_LocationContextHierarchicalRefactor.md

## Assigned To
Unassigned