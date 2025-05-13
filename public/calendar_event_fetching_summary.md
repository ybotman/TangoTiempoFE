# Calendar Event Fetching and Post-Process Filtering Summary

## 1. How the Calendar Gets Events from the API
- The calendar uses a custom React hook (`useEvents`) to fetch events from the backend API.
- The API endpoint is `/api/events` and requires an `appId` parameter (set via the environment variable `NEXT_PUBLIC_APPLICATION_ID`, typically `1` for Tango).
- The API call includes additional query parameters for filtering, such as date range (`start`, `end`), region, division, city, venue, and category.
- Example API call:
  ```js
  axios.get(`${process.env.NEXT_PUBLIC_BE_URL}/api/events`, {
    params: {
      appId: process.env.NEXT_PUBLIC_APPLICATION_ID,
      start, end, region, division, city, ...
    }
  })
  ```
- The API returns an array of event objects and pagination info.

## 2. Data Flow: From API to Calendar
- The fetched events are passed through a transformation function (`transformEvents`) to standardize field names and formats for the calendar UI.
- Example: mapping `startDate`/`endDate` to `start`/`end`, resolving venue/location fields, etc.
- The transformed events are then stored in state and rendered in the calendar component.

## 3. Post-Process Filtering (Category Selection)
- After fetching and transforming, events are further filtered on the client side using the `usePostFilter` hook and the `PostFilter` UI component.
- Users can select/deselect categories (e.g., Milonga, Practica, Festival) to show/hide events of those types.
- The filter logic checks if an event's category matches any of the active (selected) categories. If not, the event is hidden from the calendar view.
- Filtering is dynamic and can also include organizers and tags if needed.
- Example filter logic:
  ```js
  // In usePostFilter.js
  const filteredEvents = useMemo(() => {
    return events.filter(event =>
      activeCategories.includes(event.extendedProps.categoryFirst) ||
      activeCategories.includes(event.extendedProps.categorySecond) ||
      activeCategories.includes(event.extendedProps.categoryThird)
    );
  }, [events, activeCategories]);
  ```

## 4. Summary of Data Movement
- **API Call:** Calendar requests events from `/api/events` with `appId` and filters.
- **Transform:** Events are standardized for the calendar UI.
- **Post-Filter:** User-selected categories (and optionally organizers/tags) are applied client-side to further filter visible events.
- **Display:** Only events matching the post-filter are shown in the calendar.

---

This process ensures efficient server-side filtering (via API params) and flexible, interactive client-side filtering (via category selection and post-processing).
