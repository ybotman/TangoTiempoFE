## Project Structure

### `/src`

This is the main source directory containing all the application code.

#### `/app`

Contains the core application components and logic.

- **`/components`**

  - **`/Modals`**:
    - **Purpose**: Dedicated to modal components, which are popup windows that appear on top of the main content to display important information or collect user input.
    - **Use Cases**: Store components like `LoginModal`, `ConfirmationModal`, or `NotificationModal`. These modals typically serve as full-screen or centered popups that can be dismissed or acted upon.
  - **`/UI`**:
    - **Purpose**: Contains reusable UI (User Interface) components used across the application to build the interface.
    - **Use Cases**: Store components like `Button`, `Card`, `Dropdown`, `Spinner`, etc. These components serve as low-level building blocks used to create more complex components. For example, a `Button` component might be reused in forms, dialogs, and other parts of the UI.
  - **`/Layout`**:
    - **Purpose**: Contains layout components that define the structure and organization of your application’s pages.
    - **Use Cases**: Store components like `Header`, `Footer`, `Sidebar`, or `MainLayout`. These components ensure a consistent layout across the app, such as wrapping pages with `MainLayout` to include a `Header` and `Footer`.
  - **`/Forms`**:
    - **Purpose**: Contains components related to forms, specifically those that handle user input.
    - **Use Cases**: Store components like `LoginForm`, `RegistrationForm`, `ContactForm`, or `InputField`. These components handle the structure, validation logic, and individual form fields.

- **`/hooks`**: Contains custom hooks like `useFetch`, `useAuth`, etc., to encapsulate and reuse logic across components.

- **`/pages`**: Contains Next.js pages like `index.js`, `about.js`, etc. Each file in this directory automatically becomes a route in the application.

- **`/styles`**: Contains global styles, CSS modules, and any related styling files.

- **`/utils`**: Houses utility functions such as formatters, API calls, and other helper functions.

- **`/services`**: Contains API service files and data fetching logic, abstracting the API calls into separate functions.

- **`/config`**: Holds configuration files, including API endpoints and environment variables.

- **`/context`**: Contains React context providers like `AuthContext`, `ThemeContext`, etc., for managing global state.

- **`/public`**: Stores static assets like images, fonts, and other files that need to be publicly accessible.

- **`/lib`**: Includes reusable libraries, external scripts, and other utility libraries that can be used across the application.

#### `/tests`

Contains all test files and related testing utilities. This is where unit tests, integration tests, and end-to-end tests are located.
