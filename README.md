# Zorvyn Finance Data API

This is the backend for the Finance Dashboard system, supporting role-based access control (RBAC), secure authentication with session management, financial record tracking, and aggregated analytics.

**Live Backend**: [https://zorvyn-finance-backend-y2ab.onrender.com/api-docs](https://zorvyn-finance-backend-y2ab.onrender.com/api-docs)  
**GitHub Repository**: [https://github.com/vikashkrdeveloper/zorvyn-finance-api.git](https://github.com/vikashkrdeveloper/zorvyn-finance-api.git)

## Features Implemented

*   **User and Role Management**: Secure registration, login, and profile management with RBAC support.
*   **Financial Records CRUD**: Complete management of income and expense records.
*   **Record Filtering**: Advanced filtering by Date Range, Category, and Record Type (Income/Expense).
*   **Dashboard Summary APIs**: Real-time aggregated data including total balance, category breakdown, and 6-month visual trends.
*   **Role Based Access Control**: Granular permissions for Viewer, Analyst, and Admin roles.
*   **Input Validation and Error Handling**: Centralized error management and robust schema validation using Zod.
*   **Data Persistence**: Reliable multi-document transactions and storage using MongoDB.

## Key Technical Highlights

*   **JWT Authentication**: Secure authentication with Refresh Token Rotation and session invalidation.
*   **Soft Deletes**: Universal soft-delete pattern implemented for Users and Financial Records.
*   **Security Headers**: Implementation of Helmet for secure HTTP headers.
*   **Rate Limiting**: Dynamic configuration for request rate limiting.

## Technology Stack

*   **Runtime**: Node.js (TypeScript)
*   **Framework**: Express.js
*   **Database**: MongoDB + Mongoose
*   **Validation**: Zod
*   **Documentation**: Swagger (OpenAPI 3.0)
*   **Testing**: Jest + Supertest

## Getting Started

### Prerequisites
*   Node.js v18+
*   MongoDB (Local or Atlas)

### Installation
1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```
2.  Setup environment variables (Template provided in .env.example):
    ```bash
    cp .env.example .env
    ```

### Database Seeding (Optional)
To quickly populate the database with mock users and transaction data for evaluation:
```bash
npm run seed
```
*   **Admin**: admin@zorvyn.com / password123
*   **Analyst**: analyst@zorvyn.com / password123
*   **Viewer**: viewer@zorvyn.com / password123

### Running the Application
*   **Development**: npm run dev (with hot-reload)
*   **Production**: npm run build && npm start

## API Documentation

The project includes an interactive documentation portal powered by Swagger.

*   **Local**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
*   **Production**: Automatically switches base URL based on APP_URL in .env.

## Testing
Run the automated test suite to verify authentication and core logic:
```bash
npm test
```

### Roles & Permissions

| Role | Permissions |
| :--- | :--- |
| **Viewer** | Can only view dashboard data and summaries. |
| **Analyst** | Can view all financial records and access dashboard insights. |
| **Admin** | Full access: Manage users, create/update/delete financial records. |

### Project Structure
```text
src/
├── config/       # Database and app configurations
├── controllers/  # Business logic and request handling
├── middlewares/  # Auth, Validation, and Error guards
├── models/       # Mongoose data schemas
├── routes/       # API route definitions
├── utils/        # Generic helpers (JWT, Swagger, Seed)
└── validation/   # Zod schema definitions
```
