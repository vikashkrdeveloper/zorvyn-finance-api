# Zorvyn Finance Data API

This is the backend for the Finance Dashboard system, supporting role-based access control, secure authentication via tokens, user and record management, aggregated analytics, and more.

## Objective
To demonstrate scalable, robust, and clean backend architecture adhering to the assigned business rules.

### Key Technology Stack
* Node.js + Express (TypeScript)
* Database: MongoDB + Mongoose (chosen for agile data schemas and complex aggregations)
* Validation: Zod (for runtime schema validation)
* Auth: JWT Access and Refresh Tokens
* Docs: Swagger UI
* Testing: Jest & Supertest

## Features Built
1. **User and Role Management**: Viewer, Analyst, and Admin roles implemented securely. 
2. **Financial Records Management**: Fully functional CRUD with search and advanced filtering (soft-delete implemented).
3. **Dashboard APIs**: Using MongoDB aggregation pipelines, created endpoints to compute expenses, incomes, net-balance, category totals.
4. **Access Control**: Robust Middlewares (`protect` & `restrictTo`) strictly enforcing role bounds. By default, the first user to register receives the `ADMIN` role.
5. **Errors & Reliability**: Custom Error Handling App-level class. Safe CatchAsync wrappers for all controllers avoiding unhandled promise rejections. Rate limiting built in by default using `express-rate-limit`. Global exception handling in `server.ts`.

## Local Setup

### Pre-requisites
1. Node.js v18+
2. MongoDB running locally on port `27017` or a valid remote Mongo URI cluster.

### Execution
1. Install dependencies:
```bash
npm install
```
2. Build & Watch in Development:
```bash
npm run dev
```

The API will run on `http://localhost:8080/`.

### API Documentation (Swagger)
While running the application, visit `http://localhost:8080/api-docs` to access the interactive Swagger interface.

### Running Tests
Automated JWT & Authentication flow integration tests are provided. To execute:
```bash
npm run test
```
