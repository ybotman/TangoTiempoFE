1. ./layout.js

   • Role: Defines the overall layout for the application, wrapping pages and components with common UI elements.
   • Features: Likely includes shared components such as headers, footers, and navigation.

2. ./calendar

   • Leave blank for now.

3. ./calendar/page.js

   • Role: The main Page. Returns the Header, SiteMenuBar, Calendar, and footer eventually
   • Features: Displays the calendar, manages event rendering, and user interaction with events.

4. ./page.js

   • Role: The redirect to @/calendar/page

5. ./auth

   • Directory for all firebase auth code.

6. ./auth/signup

   • the firebase sign up page directory

7. ./auth/signup/page.js

   • Role: Handles the user signup page.
   • Features: Displays the signup form, validates user input, and communicates with the backend to create new user accounts.

8. ./auth/signup/pageSignUpPage.cy.js

   • Role: Cypress test for the signup page.
   • Features: Tests the signup functionality to ensure it works as expected in end-to-end testing.

9. ./auth/login

   • the firebase login up page directory

10. ./auth/login/page.js

    • Role: Displays the login page.
    • Features: Renders the login form and handles authentication logic.

11. ./utils

    • Role: Contains utility functions used across the application.
    • Features: General purpose scripts and helpers.

12. ./utils/transformEvents.js

    • Role: Transforms event data into a usable format for display.
    • Features: Processes raw event data from the API or backend into a format suitable for FullCalendar.

13. ./utils/categoryColors.js

    • Role: Returns colors based on categories.
    • Features: Provides color codes for different event categories to style the UI consistently.

14. ./utils/firebase.js

    • Role: Handles Firebase configuration and services.
    • Features: Manages Firebase authentication and database interaction.

15. ./utils/EventCreateRules.js

    • Role: Defines rules for event creation. Currently empty.
    • Features: Ensures that newly created events follow specific business logic and validation.

16. ./utils/images.js

    • Role: Manages image processing. Currenty empty.
    • Features: Handles image uploads, resizing, and optimization.

17. ./components/UI

    • all UI components

18. ./components/UI/SiteHeader.js

    • Role: Renders the main site header.
    • Features: Image header, branding, BuyMeCoffee, etc

19. ./components/UI/SiteMenuBar.js

    • Role: Provides the site’s navigation menu, RegionsSelection (For event calling API), hamburger, auth login/logout, Post filters UI (category, tags(later), organzier).
    • Features: Contains menu items for navigating between pages or sections.

20. ./components/UI/PostFilter.js

    • Role: Post API pull, Filters events or posts based on categories and organizers.
    • Features: Allows users to apply filters to displayed content.

21. ./components/Modals

    • the Modals. there will be much more here.

22. ./components/Modals/EventDetailsModal.js

    • Role: Displays detailed event information.
    • Features: Pop-up modal showing event details like time, description, and participants.

23. ./components/Modals/EventCRUDModal.js

    • Role: Handles event create, update, delete operations. Not working.
    • Features: Modal for managing events with create, edit, and delete functionalities.

24. ./hooks/useRegions.js

    • Role: Custom hook for fetching and managing region data.
    • Features: Provides region-related logic for the app, possibly including data fetching and state management.

25. ./hooks/usePostFilter.js

    • Role: Custom hook for handling post API call event filtering.
    • Features: Manages the logic for filtering posts/events based on various criteria like categories tags and organizers.

26. ./hooks/useCalendarPage.js

    • Role: Custom hook for managing the state of the calendar page. datesSet from the calendar are sent to the API with region info.
    • Features: Handles event fetching, calendar data transformations, and filtering. Call the Event API for region/divsion/city selction

27. ./hooks/useAuth.js

    • Role: Custom hook for handling authentication state.
    • Features: Manages login, logout, and session handling logic.

28. ./hooks/useSiteMenuBar.js

    • Role: Manages state and interactions for the site’s menu bar.
    • Features: Includes logic for handling active states, user roles, and navigation.

29. ./hooks/useOrganizers.js

    • Role: Custom hook for managing organizer data.
    • Features: Fetches and provides data related to event organizers.

30. ./hooks/useEvents.js

    • Role: Fetches and manages event data.
    • Features: Provides event data, likely including fetching from an API and transforming the data for use.

31. ./hooks/useCategories.js

    • Role: Manages event category data.
    • Features: Fetches categories and provides category data for filtering events.
