# Phase 1: Technical Foundation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Establish a solid technical foundation with better error handling, database improvements, TypeScript, and testing infrastructure.

**Architecture:** Incremental improvements to existing codebase. Database migrations add timestamps and indexes. Frontend gets error boundary and toast notifications. TypeScript added incrementally starting with shared types.

**Tech Stack:** TypeScript, Jest, Playwright, GitHub Actions, Chakra UI Toast

---

## Task 1: Database - Add Timestamps Migration

**Files:**
- Create: `backend/migrations/20260107120000_add_timestamps.js`

**Step 1: Create the migration file**

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("periods", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("students", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("classrooms", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    })
    .alterTable("seating_charts", (table) => {
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.timestamp("updated_at").defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("users", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("periods", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("students", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("classrooms", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    })
    .alterTable("seating_charts", (table) => {
      table.dropColumn("created_at");
      table.dropColumn("updated_at");
    });
};
```

**Step 2: Run migration**

Run: `cd backend && npx knex migrate:latest`
Expected: Migration completes successfully

**Step 3: Commit**

```bash
git add backend/migrations/20260107120000_add_timestamps.js
git commit -m "feat(db): add created_at and updated_at timestamps to all tables

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Database - Add Indexes Migration

**Files:**
- Create: `backend/migrations/20260107120001_add_indexes.js`

**Step 1: Create the migration file**

```javascript
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .alterTable("periods", (table) => {
      table.index("user_username", "idx_periods_user_username");
    })
    .alterTable("students", (table) => {
      table.index("period_id", "idx_students_period_id");
    })
    .alterTable("classrooms", (table) => {
      table.index("user_username", "idx_classrooms_user_username");
    })
    .alterTable("seating_charts", (table) => {
      table.index("classroom_id", "idx_seating_charts_classroom_id");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .alterTable("periods", (table) => {
      table.dropIndex("user_username", "idx_periods_user_username");
    })
    .alterTable("students", (table) => {
      table.dropIndex("period_id", "idx_students_period_id");
    })
    .alterTable("classrooms", (table) => {
      table.dropIndex("user_username", "idx_classrooms_user_username");
    })
    .alterTable("seating_charts", (table) => {
      table.dropIndex("classroom_id", "idx_seating_charts_classroom_id");
    });
};
```

**Step 2: Run migration**

Run: `cd backend && npx knex migrate:latest`
Expected: Migration completes successfully

**Step 3: Commit**

```bash
git add backend/migrations/20260107120001_add_indexes.js
git commit -m "feat(db): add indexes for frequently queried foreign keys

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Backend - Standardize Error Response Format

**Files:**
- Modify: `backend/expressError.js`
- Modify: `backend/app.js`

**Step 1: Update expressError.js with error codes**

Replace the entire file with:

```javascript
// Custom error classes with standardized error codes

class ExpressError extends Error {
  constructor(message, status, code = "UNKNOWN_ERROR") {
    super();
    this.message = message;
    this.status = status;
    this.code = code;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
    };
  }
}

class NotFoundError extends ExpressError {
  constructor(message = "Not Found") {
    super(message, 404, "NOT_FOUND");
  }
}

class UnauthorizedError extends ExpressError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

class BadRequestError extends ExpressError {
  constructor(message = "Bad Request") {
    super(message, 400, "BAD_REQUEST");
  }
}

class ForbiddenError extends ExpressError {
  constructor(message = "Forbidden") {
    super(message, 403, "FORBIDDEN");
  }
}

class ValidationError extends ExpressError {
  constructor(message = "Validation Failed", details = []) {
    super(message, 400, "VALIDATION_ERROR");
    this.details = details;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
    };
  }
}

module.exports = {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
  ValidationError,
};
```

**Step 2: Update error handler in app.js**

Find the generic error handler (around line 49) and replace it with:

```javascript
// Generic error handler
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);

  const status = err.status || 500;
  const response = err.toJSON ? err.toJSON() : {
    error: err.message || "Internal Server Error",
    code: "INTERNAL_ERROR",
    status: status,
  };

  return res.status(status).json(response);
});
```

**Step 3: Run backend tests**

Run: `cd backend && npm test`
Expected: All tests pass

**Step 4: Commit**

```bash
git add backend/expressError.js backend/app.js
git commit -m "feat(api): standardize error response format with error codes

- Add error codes to all error types
- Add toJSON method for consistent serialization
- Add ValidationError class for form validation
- Update error handler to use new format

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Frontend - Create Toast Context for Notifications

**Files:**
- Create: `frontend/src/common/ToastContext.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: Create ToastContext.jsx**

```jsx
import { createContext, useContext } from "react";
import { useToast } from "@chakra-ui/react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const toast = useToast();

  const showToast = {
    success: (message, title = "Success") => {
      toast({
        title,
        description: message,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    error: (message, title = "Error") => {
      toast({
        title,
        description: message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    },
    warning: (message, title = "Warning") => {
      toast({
        title,
        description: message,
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    },
    info: (message, title = "Info") => {
      toast({
        title,
        description: message,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
  };

  return (
    <ToastContext.Provider value={showToast}>
      {children}
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useAppToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
```

**Step 2: Update App.jsx to include ToastProvider**

Add import at top:
```jsx
import { ToastProvider } from "./common/ToastContext";
```

Wrap the return JSX with ToastProvider (inside BrowserRouter, outside UserContext.Provider):

```jsx
return (
  <BrowserRouter>
    <ToastProvider>
      <UserContext.Provider value={{ currentUser, setCurrentUser }}>
        <div id="main">
          <Navigation logout={logout} />
          <AppRouter login={login} signup={signup} />
        </div>
      </UserContext.Provider>
    </ToastProvider>
  </BrowserRouter>
);
```

**Step 3: Test manually**

Run: `npm run dev`
Expected: App loads without errors

**Step 4: Commit**

```bash
git add frontend/src/common/ToastContext.jsx frontend/src/App.jsx
git commit -m "feat(ui): add toast notification system

- Create ToastContext with success/error/warning/info methods
- Integrate ToastProvider in App component

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Frontend - Create Error Boundary Component

**Files:**
- Create: `frontend/src/common/ErrorBoundary.jsx`
- Modify: `frontend/src/App.jsx`

**Step 1: Create ErrorBoundary.jsx**

```jsx
import { Component } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxW="container.md" py={10}>
          <VStack spacing={6}>
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              borderRadius="md"
              py={6}
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Something went wrong
              </AlertTitle>
              <AlertDescription maxWidth="sm">
                An unexpected error occurred. Please try refreshing the page or
                returning to the home page.
              </AlertDescription>
            </Alert>

            {import.meta.env.DEV && this.state.error && (
              <Box
                p={4}
                bg="gray.100"
                borderRadius="md"
                w="100%"
                overflow="auto"
              >
                <Text fontFamily="mono" fontSize="sm" color="red.600">
                  {this.state.error.toString()}
                </Text>
                {this.state.errorInfo && (
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    color="gray.600"
                    mt={2}
                    whiteSpace="pre-wrap"
                  >
                    {this.state.errorInfo.componentStack}
                  </Text>
                )}
              </Box>
            )}

            <Button colorScheme="blue" onClick={this.handleReset}>
              Return to Home
            </Button>
          </VStack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Step 2: Update App.jsx to include ErrorBoundary**

Add import at top:
```jsx
import ErrorBoundary from "./common/ErrorBoundary";
```

Wrap the entire return JSX with ErrorBoundary (as the outermost wrapper):

```jsx
return (
  <ErrorBoundary>
    <BrowserRouter>
      <ToastProvider>
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
          <div id="main">
            <Navigation logout={logout} />
            <AppRouter login={login} signup={signup} />
          </div>
        </UserContext.Provider>
      </ToastProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
```

**Step 3: Test manually**

Run: `npm run dev`
Expected: App loads without errors

**Step 4: Commit**

```bash
git add frontend/src/common/ErrorBoundary.jsx frontend/src/App.jsx
git commit -m "feat(ui): add error boundary for graceful error handling

- Show user-friendly error page on unhandled errors
- Display error details in development mode
- Provide return to home button for recovery

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Frontend - Update API Service with Better Error Handling

**Files:**
- Modify: `frontend/src/api.js`

**Step 1: Update api.js with improved error handling**

Replace the entire file with:

```javascript
import axios from "axios";

// Dynamic base URL for different environments
const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.MODE === "production" ? "/api" : "http://localhost:3001");

// API Error class for structured error handling
export class ApiError extends Error {
  constructor(message, code, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Class for interactive API requests
class SeatingApi {
  static token;

  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${SeatingApi.token}`,
      "Content-Type": "application/json",
    };
    const params = method === "get" ? data : {};

    try {
      return (await axios({ url, method, data, params, headers })).data;
    } catch (err) {
      console.error("API Error:", err.response);

      // Handle network errors
      if (!err.response) {
        throw new ApiError(
          "Unable to connect to server. Please check your internet connection.",
          "NETWORK_ERROR",
          0
        );
      }

      // Extract error details from response
      const { status } = err.response;
      const responseData = err.response.data;

      // Handle new standardized error format
      if (responseData.error && responseData.code) {
        throw new ApiError(
          responseData.error,
          responseData.code,
          status,
          responseData.details
        );
      }

      // Handle legacy error format for backwards compatibility
      if (responseData.error?.message) {
        const message = responseData.error.message;
        throw new ApiError(
          Array.isArray(message) ? message.join(", ") : message,
          "LEGACY_ERROR",
          status
        );
      }

      // Fallback for unknown error format
      throw new ApiError(
        "An unexpected error occurred",
        "UNKNOWN_ERROR",
        status
      );
    }
  }

  // Various routes to send to API

  // Routes related to user
  static async getCurrentUser(username) {
    let res = await this.request(`/users/${username}`);
    return res.user;
  }

  static async signup(data) {
    let res = await this.request("/auth/register", data, "post");
    return res.token;
  }

  static async login(data) {
    let res = await this.request("/auth/token", data, "post");
    return res.token;
  }

  static async saveUserProfile(username, data) {
    let res = await this.request(`/users/${username}`, data, "patch");
    return res.user;
  }

  // Period specific routes

  static async createPeriod(username, data) {
    let res = await this.request(`/periods/${username}`, data, "post");
    return res.period;
  }

  static async getPeriods(username) {
    let res = await this.request(`/periods/${username}`);
    return res.periods;
  }

  static async getPeriod(username, periodId) {
    let res = await this.request(`/periods/${username}/${periodId}`);
    return res.period;
  }

  static async updatePeriod(username, periodId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}`,
      data,
      "patch"
    );
    return res.period;
  }

  static async deletePeriod(username, periodId) {
    let res = await this.request(
      `/periods/${username}/${periodId}`,
      {},
      "delete"
    );
    return res.periodId;
  }

  // Student specific Routes
  static async createStudent(username, periodId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students`,
      data,
      "post"
    );
    return res.student;
  }

  static async updateStudent(username, periodId, studentId, data) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students/${studentId}`,
      data,
      "patch"
    );
    return res.student;
  }

  static async deleteStudent(username, periodId, studentId) {
    let res = await this.request(
      `/periods/${username}/${periodId}/students/${studentId}`,
      {},
      "delete"
    );
    return res.studentId;
  }

  // Classroom specific routes

  static async getClassroom(username) {
    let res = await this.request(`/classrooms/${username}`);
    return res.classroom;
  }

  static async createClassroom(username) {
    let res = await this.request(`/classrooms/${username}`, {}, "post");
    return res.classroom;
  }

  static async updateClassroom(username, classroomId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}`,
      data,
      "patch"
    );
    return res.classroom;
  }

  // Seating Chart Specific Routes

  static async createSeatingChart(username, classroomId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts`,
      data,
      "post"
    );
    return res.seatingChart;
  }

  static async getSeatingCharts(username, classroomId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts`
    );
    return res.seatingCharts;
  }

  static async getSeatingChart(username, classroomId, seatingChartId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`
    );
    return res.seatingChart;
  }

  static async updateSeatingChart(username, classroomId, seatingChartId, data) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`,
      data,
      "patch"
    );
    return res.seatingChart;
  }

  static async deleteSeatingChart(username, classroomId, seatingChartId) {
    let res = await this.request(
      `/classrooms/${username}/${classroomId}/seating-charts/${seatingChartId}`,
      {},
      "delete"
    );
    return res.seatingChart.number;
  }
}

export default SeatingApi;
```

**Step 2: Test manually**

Run: `npm run dev`
Expected: App loads and login/signup still work

**Step 3: Commit**

```bash
git add frontend/src/api.js
git commit -m "feat(api): improve error handling with ApiError class

- Add ApiError class for structured errors
- Handle network errors gracefully
- Support both new and legacy error formats
- Add error codes and details to thrown errors

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Frontend - Update App.jsx to Use Toast for Auth Errors

**Files:**
- Modify: `frontend/src/App.jsx`

**Step 1: Update App.jsx with toast notifications for auth**

Update the imports at the top:
```jsx
import { useState, useEffect, useCallback } from "react";
import { BrowserRouter } from "react-router-dom";
import useLocalStorage from "./hooks/LocalStorage";
import Navigation from "./navigation/Navigation";
import AppRouter from "./routes/AppRouter";
import SeatingApi, { ApiError } from "./api";
import UserContext from "./auth/UserContext";
import jwt from "jsonwebtoken";
import LoadingSpinner from "./common/LoadingSpinner";
import { ToastProvider, useAppToast } from "./common/ToastContext";
import ErrorBoundary from "./common/ErrorBoundary";
export const TOKEN_STORAGE_ID = "seating-token";
```

Create an inner component that uses the toast hook:

```jsx
function AppContent({ token, setToken }) {
  const [infoLoaded, setInfoLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const toast = useAppToast();

  console.debug(
    "App",
    "infoLoaded=",
    infoLoaded,
    "currentUser=",
    currentUser,
    "token=",
    token
  );

  // Get data associated with user, assign user token as state
  useEffect(
    function loadUserInfo() {
      async function getCurrentUser() {
        if (token) {
          try {
            let { username } = jwt.decode(token);
            SeatingApi.token = token;
            let currentUser = await SeatingApi.getCurrentUser(username);
            setCurrentUser(currentUser);
          } catch (err) {
            console.error("App loadUserInfo: problem loading", err);
            setCurrentUser(null);
            setToken(null);
            if (err instanceof ApiError) {
              toast.error(err.message);
            }
          }
        }
        setInfoLoaded(true);
      }
      setInfoLoaded(false);
      getCurrentUser();
    },
    [token, setToken, toast]
  );

  // On log out, nullify token
  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    toast.info("You have been logged out");
  }, [setToken, toast]);

  // On signup, send sign up data to api and create token
  async function signup(signupData) {
    try {
      let token = await SeatingApi.signup(signupData);
      setToken(token);
      toast.success("Account created successfully!");
      return { success: true };
    } catch (err) {
      console.error("signup failed", err);
      const message = err instanceof ApiError ? err.message : "Signup failed";
      toast.error(message);
      return { success: false, errors: [message] };
    }
  }

  // On user login, create token
  async function login(loginData) {
    try {
      let token = await SeatingApi.login(loginData);
      setToken(token);
      toast.success("Welcome back!");
      return { success: true };
    } catch (err) {
      console.error("login failed", err);
      const message = err instanceof ApiError ? err.message : "Login failed";
      toast.error(message);
      return { success: false, errors: [message] };
    }
  }

  if (!infoLoaded) return <LoadingSpinner />;

  // Modify homepage based on user context
  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      <div id="main">
        <Navigation logout={logout} />
        <AppRouter login={login} signup={signup} />
      </div>
    </UserContext.Provider>
  );
}

function App() {
  const [token, setToken] = useLocalStorage(TOKEN_STORAGE_ID);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AppContent token={token} setToken={setToken} />
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
```

**Step 2: Test manually**

Run: `npm run dev`
Expected:
- Login shows "Welcome back!" toast on success
- Signup shows "Account created successfully!" toast on success
- Failed auth shows error toast
- Logout shows "You have been logged out" info toast

**Step 3: Commit**

```bash
git add frontend/src/App.jsx
git commit -m "feat(ui): integrate toast notifications for auth operations

- Show success toasts for login/signup/logout
- Show error toasts for failed operations
- Use ApiError for better error messages

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Testing - Add Jest Coverage Configuration

**Files:**
- Modify: `backend/package.json`

**Step 1: Update backend package.json with coverage config**

Update the jest configuration in package.json:

```json
{
  "jest": {
    "testPathIgnorePatterns": [
      "/node_modules/",
      "config.js"
    ],
    "collectCoverageFrom": [
      "**/*.js",
      "!**/node_modules/**",
      "!**/migrations/**",
      "!**/coverage/**",
      "!knexfile.js",
      "!server.js"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 50,
        "functions": 50,
        "lines": 50,
        "statements": 50
      }
    }
  }
}
```

Add a coverage script:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest -i",
    "test:coverage": "jest -i --coverage"
  }
}
```

**Step 2: Run coverage**

Run: `cd backend && npm run test:coverage`
Expected: Coverage report generated showing current coverage percentages

**Step 3: Commit**

```bash
git add backend/package.json
git commit -m "feat(test): add jest coverage configuration

- Add collectCoverageFrom to target source files
- Add coverage thresholds at 50%
- Add test:coverage script

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 9: CI - Add GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create the CI workflow file**

```yaml
name: CI

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  test-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: map_my_seat_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Run migrations
        run: cd backend && npx knex migrate:latest
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/map_my_seat_test

      - name: Run backend tests
        run: cd backend && npm run test:coverage
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/map_my_seat_test
          SECRET_KEY: test-secret-key

  lint-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Run linter
        run: cd frontend && npm run lint

  build-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Build frontend
        run: cd frontend && npm run build
        env:
          VITE_API_BASE_URL: /api
```

**Step 2: Create workflows directory**

Run: `mkdir -p .github/workflows`

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat(ci): add GitHub Actions workflow

- Run backend tests with PostgreSQL service
- Run frontend linter
- Build frontend to catch build errors
- Use caching for faster builds

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 10: TypeScript - Setup Backend TypeScript Config

**Files:**
- Create: `backend/tsconfig.json`
- Modify: `backend/package.json`

**Step 1: Install TypeScript dependencies**

Run: `cd backend && npm install -D typescript @types/node @types/express @types/cors @types/morgan @types/jsonwebtoken @types/bcrypt ts-node`

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": false,
    "allowJs": true,
    "checkJs": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node"
  },
  "include": ["./**/*"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

**Step 3: Commit**

```bash
git add backend/tsconfig.json backend/package.json backend/package-lock.json
git commit -m "feat(ts): add TypeScript configuration to backend

- Install TypeScript and type definitions
- Configure for gradual migration (allowJs, no strict)
- Ready for incremental .js to .ts conversion

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 11: TypeScript - Setup Frontend TypeScript Config

**Files:**
- Create: `frontend/tsconfig.json`
- Modify: `frontend/package.json`

**Step 1: Install TypeScript dependencies**

Run: `cd frontend && npm install -D typescript @types/node`

**Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "allowJs": true,
    "checkJs": false,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 3: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.js"]
}
```

**Step 4: Commit**

```bash
git add frontend/tsconfig.json frontend/tsconfig.node.json frontend/package.json frontend/package-lock.json
git commit -m "feat(ts): add TypeScript configuration to frontend

- Install TypeScript
- Configure for gradual migration (allowJs, no strict)
- Set up for Vite bundler
- Ready for incremental .jsx to .tsx conversion

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 12: TypeScript - Create Shared Types File

**Files:**
- Create: `frontend/src/types/api.ts`

**Step 1: Create types directory and api.ts**

```typescript
// Shared TypeScript types for API responses and data models

// User types
export interface User {
  username: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface UserSignupData {
  username: string;
  password: string;
  email: string;
  title: string;
  firstName: string;
  lastName: string;
}

export interface UserLoginData {
  username: string;
  password: string;
}

// Period types
export interface Period {
  periodId: number;
  username: string;
  schoolYear: string;
  title: string;
  number: number;
}

export interface PeriodCreateData {
  schoolYear: string;
  title: string;
  number: number;
}

// Student types
export interface Student {
  studentId: number;
  periodId: number;
  name: string;
  grade: number | null;
  gender: string | null;
  isESE: boolean;
  has504: boolean;
  isELL: boolean;
  isEBD: boolean;
}

export interface StudentCreateData {
  name: string;
  grade?: number;
  gender?: string;
  isESE?: boolean;
  has504?: boolean;
  isELL?: boolean;
  isEBD?: boolean;
}

// Classroom types
export type CellType = "desk" | "teacher-desk" | null;
export type SeatingConfig = CellType[][];

export interface Classroom {
  classroomId: number;
  username: string;
  seatAlphabetical: boolean;
  seatRandomize: boolean;
  seatHighLow: boolean;
  seatMaleFemale: boolean;
  eseIsPriority: boolean;
  ellIsPriority: boolean;
  fiveZeroFourIsPriority: boolean;
  ebdIsPriority: boolean;
  seatingConfig: SeatingConfig;
}

export interface ClassroomUpdateData {
  seatAlphabetical?: boolean;
  seatRandomize?: boolean;
  seatHighLow?: boolean;
  seatMaleFemale?: boolean;
  eseIsPriority?: boolean;
  ellIsPriority?: boolean;
  fiveZeroFourIsPriority?: boolean;
  ebdIsPriority?: boolean;
  seatingConfig?: string;
}

// Seating Chart types
export interface SeatingChart {
  seatingChartId: number;
  classroomId: number;
  number: number;
  arrangement: Student[];
}

// API Error types
export interface ApiErrorResponse {
  error: string;
  code: string;
  status: number;
  details?: unknown;
}

// Auth response types
export interface AuthResponse {
  token: string;
}

export interface ApiSuccessResult {
  success: true;
}

export interface ApiFailureResult {
  success: false;
  errors: string[];
}

export type AuthResult = ApiSuccessResult | ApiFailureResult;
```

**Step 2: Commit**

```bash
mkdir -p frontend/src/types
git add frontend/src/types/api.ts
git commit -m "feat(ts): add shared TypeScript type definitions

- Define types for User, Period, Student, Classroom, SeatingChart
- Define API request/response types
- Ready for gradual adoption in components

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

After completing all tasks, Phase 1 will include:

1. **Database Improvements**
   - Timestamps on all tables (created_at, updated_at)
   - Indexes on foreign key columns for query performance

2. **Error Handling**
   - Standardized backend error format with error codes
   - Frontend ApiError class for structured errors
   - Toast notifications for user-facing errors
   - Error boundary for graceful crash handling

3. **Testing Infrastructure**
   - Jest coverage configuration with thresholds
   - GitHub Actions CI pipeline

4. **TypeScript Foundation**
   - TypeScript config for both frontend and backend
   - Shared type definitions ready for gradual migration
   - allowJs enabled for incremental adoption

Run all tasks sequentially. Each task builds on the previous ones.
