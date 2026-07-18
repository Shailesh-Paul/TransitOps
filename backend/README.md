# TransitOps Backend

Transport Operations Management System Backend API.

## Tech Stack
- **Node.js**
- **Express.js**
- **MySQL** (`mysql2` package)
- **JWT Authentication**

## Application Structure

- `config/`: Application configuration variables and environment setup.
- `constants/`: Shared enums, static values, and magic numbers.
- `database/`: Database connection scripts and migration tools.
- `features/`: Domain-driven module folders containing routes, controllers, services, repositories, and validations.
- `middleware/`: Reusable custom Express middlewares (auth, RBAC, etc.).
- `routes/`: Global route aggregation and versioning (e.g., `/api/v1`).
- `uploads/`: Temporary local file storage.
- `utils/`: Common helper functions and error formatting.
- `validations/`: Global Joi/Zod request payload schemas.

## Scripts

- `npm start`: Runs the server (Production).
- `npm run dev`: Runs the server with Nodemon (Development).
