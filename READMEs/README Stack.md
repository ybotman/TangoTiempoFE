-----------
## Tech Stack
---

---

### Frontend

- **React.js**: The primary library used for building the user interface.
- **Next.js**: Used for server-side rendering and static site generation, optimizing performance and SEO.
- **MUI (Material-UI)**: Heavily reliant on the React UI framework used for implementing the design and layout with Material Design components.
- **FullCalendar**: A powerful and customizable JavaScript library used for displaying the calendar view and managing event scheduling. Leverage with MUI.
- **Axios/Fetch API**: For making HTTP requests to the backend API.
- **PropTypes** is widily used from 'prop-types'. This is necessary for our proper standards
- **eslint** is widely used

### Backend

- **Node.js**: The runtime environment used for running the server-side JavaScript code.
- **Express.js**: A fast and minimalist web framework for Node.js, used for building the RESTful API.
- **MongoDB**: A NoSQL database used for storing the application's data.
- **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js, providing a schema-based solution to model data.
- **Firebase**: Used for user authentication, real-time database, and role-based access control.

### Deployment and CI/CD

- **GitHub Actions**: Used for Continuous Integration (CI) and Continuous Deployment (CD) pipelines.
  -- well deplyoed for Dev to Test to Integration and Productio
  -- we have not integrated the test framework

### Testing

- **Jest**: A JavaScript testing framework used for unit and integration tests.
- **React Testing Library**: For testing React components with a focus on user interactions.
  -- CURRENTY NONE ARE DEPLOYED

### State Management

- **React Context API**: Used for managing global state across the application. Currently it is
  -- import PropTypes from 'prop-types';
  -- import { AuthProvider } from '@/contexts/AuthContext';
  -- import { RegionsProvider } from '@/contexts/RegionsContext';
  -- import { CalendarProvider } from '@/contexts/CalendarContext';
  -- import { PostFilterProvider } from '@/contexts/PostFilterContext';
  -- import { RoleProvider } from '@/contexts/RoleContext';
  --- <AuthProvider>
  --- <RegionsProvider>
  --- <RoleProvider>

### Version Control

- **Git**: Version control system used to track changes in the codebase.
- **GitHub**: Hosting service for Git repositories, facilitating collaboration and code review.
