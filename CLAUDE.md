# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Map-My-Seat is an automated seating chart generator for K-12 teachers. Teachers register courses with students, define classroom layouts and seating preferences, then generate optimized seating arrangements.

## Development Commands

```bash
# Install dependencies (root, backend, frontend)
npm run install:all

# Start both frontend (5173) and backend (3001)
npm run dev

# Start only backend or frontend
npm run dev:backend
npm run dev:frontend

# Run all tests
npm test

# Run backend tests only (uses Jest with -i flag for isolation)
npm run test:backend

# Run frontend tests only
npm run test:frontend

# Lint frontend
cd frontend && npm run lint

# Database migrations
npm run migrate
npm run migrate:rollback
```

## Architecture

**Monorepo Structure:** Root package.json orchestrates `backend/` (Express API) and `frontend/` (React/Vite).

**Tech Stack:**
- Frontend: React 18, Vite, Chakra UI, React Router v6
- Backend: Express, Knex.js (query builder), PostgreSQL
- Auth: JWT tokens stored in localStorage

**Backend Pattern (Model-Route-Middleware):**
- `models/` - Database operations and business logic (singular names: `user.js`, `period.js`)
- `routes/` - HTTP handlers with JSON Schema validation (plural names: `users.js`, `periods.js`)
- `schemas/` - JSON Schema validation files for all route inputs
- `middleware/auth.js` - JWT authentication and authorization guards

**Frontend Pattern:**
- `api.js` - Centralized `SeatingApi` class with static `token` property for all backend calls
- `auth/UserContext.jsx` - React Context for app-wide auth state
- `routes/PrivateRoutes.jsx` - Guards that redirect unauthenticated users

**Database Conventions:**
- Column names use snake_case (`user_username`, `is_admin`)
- API returns camelCase (converted via Knex raw queries with AS aliases)
- Schema: users -> periods -> students, users -> classrooms -> seating_charts

## Key Patterns

**Authentication Flow:**
1. Login/signup returns JWT token
2. Frontend stores in localStorage as "seating-token"
3. `SeatingApi.token` is set globally
4. All requests include `Authorization: Bearer <token>` header
5. Backend `authenticateJWT` middleware validates and attaches user to `res.locals.user`

**Authorization Middleware:**
- `isLoggedIn` - Requires authenticated user
- `adminOnly` - Restricts to admin users
- `adminOrCorrectUser` - Allows admin OR the specific user for that resource

**API Routes Pattern:**
All routes are RESTful with username in path for user-scoped resources:
- `/periods/:username/:periodId/students/:studentId`
- `/classrooms/:username/:classroomId/seating-charts/:seatingChartId`

**Error Handling:**
Backend uses custom `ExpressError` classes (`NotFoundError`, `UnauthorizedError`, `BadRequestError`) that return appropriate HTTP status codes.

## Testing

Tests are colocated with source files (`*.test.js`, `*.test.jsx`). Backend tests use `_testCommon.js` files in `models/` and `routes/` for setup/teardown helpers.

## Environment Variables

Copy `.env.example` to `.env`. Key variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT signing key
- `VITE_API_BASE_URL` - Frontend API endpoint (for production builds)
