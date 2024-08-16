This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

/src
  /app
    /components
      /Modals       # Folder for modal components
      	•	Purpose: This folder is dedicated to modal components. Modals are popup windows that appear on top of the main content to display important information or collect user input.
	    •	Use Cases: You would store components like LoginModal, ConfirmationModal, or NotificationModal here. Each modal is typically a full-screen or centered popup that can be dismissed or acted upon.
      /UI           # Folder for UI components like buttons, cards, etc.
      	•	Purpose: This folder contains reusable UI (User Interface) components that can be used across the application to build the interface.
	    •	Use Cases: Store components like Button, Card, Dropdown, Spinner, etc. These are low-level building blocks used to create more complex components. For example, a Button component might be reused in forms, dialogs, and other parts of the UI.

      /Layout       # Folder for layout components (headers, footers)
      	•	Purpose: This folder is for layout components that define the structure and organization of your application’s pages. These components manage how different sections of the page fit together.
	    •	Use Cases: Store components like Header, Footer, Sidebar, or MainLayout. These components are often used to wrap pages and ensure a consistent layout across the app. For example, MainLayout might include the Header and Footer and wrap the page content.
      /Forms        # Folder for form components
	    •	Purpose: This folder is for components related to forms, specifically those that handle user input.
	    •	Use Cases: Store components like LoginForm, RegistrationForm, ContactForm, or InputField. These components can include the form’s structure, validation logic, and individual form fields.

    /hooks          # Custom hooks (useFetch, useAuth, etc.)
    /pages          # Next.js pages (index.js, about.js, etc.)
    /nkdir         # Global styles, CSS modules
    /utils          # Utility functions (formatters, API calls, etc.)
    /services       # API service files, data fetching logic
    /config         # Configuration files (e.g., API endpoints, env variables)
    /context        # React context providers (AuthContext, ThemeContext)
    /public         # Static assets like images, fonts
    /lib            # Reusable libraries, external scripts, etc.
  /tests              