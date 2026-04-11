# Zorvyn Finance Data API

This is the backend for the Finance Dashboard system, supporting role-based access control (RBAC), secure authentication with session management, financial record tracking, and aggregated analytics.

## 🚀 Features

*   **User & Role Management**: RBAC with `Viewer`, `Analyst`, and `Admin` roles. Includes account status management (Active/Inactive) and soft deletes.
*   **Financial Records**: Full CRUD operations with search, pagination, and advanced filtering (by type, category, and date range).
*   **Dashboard Analytics**:
    *   Real-time overview (Total Income, Expenses, Net Balance).
    *   Category-wise spending breakdown.
    *   **Trends analysis**: Monthly income vs expense tracking for the last 6 months.
    *   Recent activity feed.
*   **Security & Reliability**:
    *   JWT Authentication with **Refresh Token Rotation** and session invalidation.
    *   Robust Input Validation using **Zod**.
    *   Global Error Handling & request rate limiting.
    *   Production-ready logging and security headers (Helmet, Morgan).
*   **API Documentation**: Interactive Swagger UI with dynamic environment detection.

## 🛠️ Technology Stack

*   **Runtime**: Node.js (TypeScript)
*   **Framework**: Express.js
*   **Database**: MongoDB + Mongoose
*   **Validation**: Zod
*   **Documentation**: Swagger (OpenAPI 3.0)
*   **Testing**: Jest + Supertest

## 📦 Getting Started

### Prerequisites
*   Node.js v18+
*   MongoDB (Local or Atlas)

### Installation
1.  Clone the repository and install dependencies:
    ```bash
    npm install
    ```
2.  Setup environment variables (Template provided in `.env.example`):
    ```bash
    cp .env.example .env
    ```

### Database Seeding (Optional)
To quickly populate the database with mock users and transaction data for evaluation:
```bash
npm run seed
```
*   **Admin**: `admin@zorvyn.com` / `password123`
*   **Analyst**: `analyst@zorvyn.com` / `password123`
*   **Viewer**: `viewer@zorvyn.com` / `password123`

### Running the Application
*   **Development**: `npm run dev` (with hot-reload)
*   **Production**: `npm run build && npm start`

## 📖 API Documentation

The project includes an interactive documentation portal powered by Swagger.

*   **Local**: [http://localhost:8080/api-docs](http://localhost:8080/api-docs)
*   **Production**: Automatically switches base URL based on `APP_URL` in `.env`.

## 🧪 Testing
Run the automated test suite to verify authentication and core logic:
```bash
npm test
```

## 📂 Project Structure
```text
src/
├── config/       # Database and app configurations
├── controllers/  # Business logic & request handling
├── middlewares/  # Auth, Validation, and Error guards
├── models/       # Mongoose data schemas
├── routes/       # API route definitions
├── services/     # (Optional) Reusable logic
├── utils/        # Generic helpers (JWT, Swagger, Seed)
└── validation/   # Zod schema definitions
```
