# Environment Variable Matrix

| **Category**   | **DEV**                            | **TEST**                            | **INTEGRATION**                               | **PROD**                            |
| -------------- | ---------------------------------- | ----------------------------------- | --------------------------------------------- | ----------------------------------- |
| **Database**   | `mongodb://localhost:27017/dev_db` | `mongodb://test-db-url/test_db`     | `mongodb://integration-db-url/integration_db` | `mongodb://prod-db-url/prod_db`     |
| **FrontEnd**   | `http://localhost:3000`            | `https://test-frontend.example.com` | `https://integration-frontend.example.com`    | `https://prod-frontend.example.com` |
| **BackEnd**    | `http://localhost:3001`            | `https://test-backend.example.com`  | `https://integration-backend.example.com`     | `https://prod-backend.example.com`  |
| **FireBase**   | `FIREBASE_DEV_CONFIG`              | `FIREBASE_TEST_CONFIG`              | `FIREBASE_INTEGRATION_CONFIG`                 | `FIREBASE_PROD_CONFIG`              |
| **Cloudinary** | `CLOUDINARY_DEV_CONFIG`            | `CLOUDINARY_TEST_CONFIG`            | `CLOUDINARY_INTEGRATION_CONFIG`               | `CLOUDINARY_PROD_CONFIG`            |

## Notes

- Replace the placeholders (`FIREBASE_DEV_CONFIG`, `CLOUDINARY_DEV_CONFIG`, etc.) with your actual Firebase and Cloudinary configuration strings.
- For local development, the `FrontEnd` and `BackEnd` URLs should point to `localhost` with the appropriate ports.
- Ensure that each environment has its respective configuration for database, frontend, backend, Firebase, and Cloudinary.
