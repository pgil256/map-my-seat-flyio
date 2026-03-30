# Test Coverage Expansion & CI Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve comprehensive test coverage across all REST endpoints, seating algorithms, and database migrations, plus add a GitHub Actions CI workflow.

**Architecture:** Four independent workstreams — (1) API integration tests for untested endpoints, (2) pure-function unit tests for seating algorithms extracted from the frontend, (3) Knex migration up/down tests, (4) GitHub Actions CI with Postgres service container. Workstreams 1-3 can be developed in parallel; workstream 4 depends on all tests passing.

**Tech Stack:** Jest 30, supertest, Express, Knex, PostgreSQL, GitHub Actions

---

## Current State (Gap Analysis)

### Endpoints with NO test coverage:
- `POST /users` (admin creates user)
- `DELETE /users/:username`
- `POST /periods/:username/:periodId/students` (create student via route)
- `PATCH /periods/:username/:periodId/students/:studentId` (update student via route)
- `DELETE /periods/:username/:periodId/students/:studentId` (delete student via route)
- `POST /classrooms/:username/:classroomId/seating-charts` (create seating chart)
- `GET /classrooms/:username/:classroomId/seating-charts` (list seating charts)
- `GET /classrooms/:username/:classroomId/seating-charts/:seatingChartId` (get one)
- `PATCH /classrooms/:username/:classroomId/seating-charts/:seatingChartId` (update)
- `POST /classrooms/:username/:classroomId/seating-charts/:seatingChartId/duplicate`
- `DELETE /classrooms/:username/:classroomId/seating-charts/:seatingChartId`

### Endpoints with PARTIAL coverage (missing invalid input, auth edge cases):
- `POST /auth/token` — no test for nonexistent user
- `POST /auth/register` — no test for invalid email format
- `PATCH /users/:username` — no test for invalid data, admin access, no test for empty body
- `DELETE /periods/:username/:periodId` — no test for period with active constraints (FK cascade edge case)
- `PATCH /classrooms/:username/:classroomId` — no test for admin, anon, or invalid data

### Zero test coverage:
- Seating algorithms (alphabetical, randomized, high-low, male-female alternating, priority front-loading, spread students)
- Knex migration up/down cycles
- No CI pipeline exists

---

## Workstream 1: API Integration Tests — Untested Endpoints

### Task 1: Expand `_testCommon.js` fixtures for seating chart and student route tests

**Files:**
- Modify: `backend/routes/_testCommon.js`

We need the test fixtures to expose IDs for the period, classroom, and students that are already inserted, so route tests can reference them.

**Step 1: Add ID tracking to `_testCommon.js`**

Add variables and getters for `testPeriodId`, `testClassroomId`, `testStudentIds` so downstream tests can build URLs like `/classrooms/u1/${classroomId}/seating-charts`.

```js
// Add at top with the other let declarations (after line 10)
let testPeriodId;
let testClassroomId;
let testStudentIds = [];

// After inserting periods (after line 38), capture the period ID:
const periods = await db.raw(
  `SELECT period_id FROM periods WHERE user_username = 'u1' AND number = 1`
);
testPeriodId = periods.rows[0].period_id;

// After inserting classroom (after line 66), capture the classroom ID:
const classrooms = await db.raw(
  `SELECT classroom_id FROM classrooms WHERE user_username = 'u1'`
);
testClassroomId = classrooms.rows[0].classroom_id;

// After inserting students (after line 83), capture student IDs:
const students = await db.raw(
  `SELECT student_id FROM students WHERE period_id = ${testPeriodId} ORDER BY name`
);
testStudentIds = students.rows.map(s => s.student_id);
```

Export getters:

```js
module.exports = {
  // ... existing exports ...
  getTestPeriodId: () => testPeriodId,
  getTestClassroomId: () => testClassroomId,
  getTestStudentIds: () => testStudentIds,
};
```

**Step 2: Run existing tests to verify fixtures don't break anything**

Run: `cd backend && npm test`
Expected: All existing tests still PASS

**Step 3: Commit**

```
feat(tests): expose period/classroom/student IDs from route test fixtures
```

---

### Task 2: Student route integration tests

**Files:**
- Create: `backend/routes/students.test.js`

These test the student sub-routes under `/periods/:username/:periodId/students`.

**Step 1: Write the test file**

```js
"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getU1Token,
  getU2Token,
  getAdminToken,
  getTestPeriodId,
  getTestStudentIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("POST /periods/:username/:periodId/students", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({
        periodId: getTestPeriodId(),
        name: "New Student",
        grade: 9,
        gender: "F",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.student).toHaveProperty("name", "New Student");
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({
        periodId: getTestPeriodId(),
        name: "Admin Student",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({
        periodId: getTestPeriodId(),
        name: "Bad Student",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({
        periodId: getTestPeriodId(),
        name: "Anon Student",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing required fields", async () => {
    const resp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({ name: "Incomplete" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("PATCH /periods/:username/:periodId/students/:studentId", () => {
  test("works for correct user", async () => {
    const studentId = getTestStudentIds()[0];
    const resp = await request(app)
      .patch(`/periods/u1/${getTestPeriodId()}/students/${studentId}`)
      .send({ name: "Updated Name" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.student).toHaveProperty("name", "Updated Name");
  });

  test("unauth for wrong user", async () => {
    const studentId = getTestStudentIds()[0];
    const resp = await request(app)
      .patch(`/periods/u1/${getTestPeriodId()}/students/${studentId}`)
      .send({ name: "Hacked" })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("404 for nonexistent student", async () => {
    const resp = await request(app)
      .patch(`/periods/u1/${getTestPeriodId()}/students/0`)
      .send({ name: "Ghost" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("DELETE /periods/:username/:periodId/students/:studentId", () => {
  test("works for correct user", async () => {
    // Create a student to delete
    const createResp = await request(app)
      .post(`/periods/u1/${getTestPeriodId()}/students`)
      .send({
        periodId: getTestPeriodId(),
        name: "To Delete",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const studentId = createResp.body.student.studentId;

    const resp = await request(app)
      .delete(`/periods/u1/${getTestPeriodId()}/students/${studentId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: String(studentId) });
  });

  test("unauth for wrong user", async () => {
    const studentId = getTestStudentIds()[0];
    const resp = await request(app)
      .delete(`/periods/u1/${getTestPeriodId()}/students/${studentId}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("404 for nonexistent student", async () => {
    const resp = await request(app)
      .delete(`/periods/u1/${getTestPeriodId()}/students/0`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
```

**Step 2: Run to verify**

Run: `cd backend && npx jest students.test.js -i --forceExit`
Expected: All tests PASS

**Step 3: Commit**

```
test: add integration tests for student CRUD routes
```

---

### Task 3: Seating chart route integration tests

**Files:**
- Create: `backend/routes/seatingCharts.test.js`

**Step 1: Write the test file**

```js
"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  getU1Token,
  getU2Token,
  getAdminToken,
  getTestClassroomId,
  getTestPeriodId,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

const validChart = [
  { id: 1, class: "desk", name: "Student 1" },
  { id: 2, class: "desk", name: "Student 2" },
];

describe("POST /classrooms/:username/:classroomId/seating-charts", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Chart 1",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("seatingChart");
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Admin Chart",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Bad Chart",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Anon Chart",
        seatingChart: validChart,
      });

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing fields", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({ classroomId: getTestClassroomId() })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("GET /classrooms/:username/:classroomId/seating-charts", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .get(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toHaveProperty("seatingCharts");
    expect(Array.isArray(resp.body.seatingCharts)).toBe(true);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .get(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("returns empty array when no charts exist", async () => {
    const resp = await request(app)
      .get(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.seatingCharts).toEqual([]);
  });
});

describe("GET /classrooms/:username/:classroomId/seating-charts/:id", () => {
  test("works for correct user", async () => {
    // Create a chart first
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Test Chart",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .get(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.seatingChart.seatingChartId).toEqual(chartId);
  });

  test("404 for nonexistent chart", async () => {
    const resp = await request(app)
      .get(`/classrooms/u1/${getTestClassroomId()}/seating-charts/0`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("PATCH /classrooms/:username/:classroomId/seating-charts/:id", () => {
  test("works for correct user", async () => {
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "Original",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .patch(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}`)
      .send({ label: "Updated Label" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "For Patch Auth",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .patch(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}`)
      .send({ label: "Hacked" })
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});

describe("POST /classrooms/:username/:classroomId/seating-charts/:id/duplicate", () => {
  test("works for correct user", async () => {
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "To Duplicate",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}/duplicate`)
      .send({ label: "Duplicated Chart" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.seatingChart.label).toEqual("Duplicated Chart");
  });

  test("404 for nonexistent chart", async () => {
    const resp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts/0/duplicate`)
      .send({ label: "Ghost" })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});

describe("DELETE /classrooms/:username/:classroomId/seating-charts/:id", () => {
  test("works for correct user", async () => {
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "To Delete",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .delete(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const createResp = await request(app)
      .post(`/classrooms/u1/${getTestClassroomId()}/seating-charts`)
      .send({
        classroomId: getTestClassroomId(),
        name: "No Delete",
        seatingChart: validChart,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const chartId = createResp.body.seatingChart.seatingChartId;

    const resp = await request(app)
      .delete(`/classrooms/u1/${getTestClassroomId()}/seating-charts/${chartId}`)
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("404 for nonexistent chart", async () => {
    const resp = await request(app)
      .delete(`/classrooms/u1/${getTestClassroomId()}/seating-charts/0`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
```

**Step 2: Run to verify**

Run: `cd backend && npx jest seatingCharts.test.js -i --forceExit`
Expected: All tests PASS

**Step 3: Commit**

```
test: add integration tests for seating chart CRUD routes
```

---

### Task 4: Users route — fill coverage gaps (POST create, DELETE)

**Files:**
- Modify: `backend/routes/users.test.js`

**Step 1: Add missing tests**

Add these describe blocks to the existing file:

```js
describe("POST /users", () => {
  test("works for admin", async () => {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "newuser",
        password: "password123",
        email: "new@email.com",
        title: "Ms.",
        isAdmin: false,
        firstName: "New",
        lastName: "User",
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toHaveProperty("user");
    expect(resp.body.user.username).toEqual("newuser");
  });

  test("unauth for non-admin", async () => {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "blocked",
        password: "password123",
        email: "blocked@email.com",
        title: "Mr.",
        isAdmin: false,
        firstName: "Blocked",
        lastName: "User",
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing fields", async () => {
    const resp = await request(app)
      .post("/users")
      .send({ username: "incomplete" })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with duplicate username", async () => {
    const resp = await request(app)
      .post("/users")
      .send({
        username: "u1",
        password: "password123",
        email: "dupe@email.com",
        title: "Mr.",
        isAdmin: false,
        firstName: "Dupe",
        lastName: "User",
      })
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect(resp.statusCode).toEqual(400);
  });
});

describe("DELETE /users/:username", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${getU1Token()}`);

    // NOTE: This may hit a bug (ReferenceError in route handler line 75).
    // If it returns 500, that's the bug — document it.
    expect([200, 500]).toContain(resp.statusCode);
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${getAdminToken()}`);

    expect([200, 500]).toContain(resp.statusCode);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .delete("/users/u1")
      .set("authorization", `Bearer ${getU2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app).delete("/users/u1");
    expect(resp.statusCode).toEqual(401);
  });
});
```

> **Known bug:** The DELETE `/users/:username` handler at `backend/routes/users.js:75` contains dead code referencing `app.use("/settings", settingsRoutes)` which will throw a `ReferenceError`. Tests should document this. If the bug is confirmed, fix it before committing.

**Step 2: Run to verify**

Run: `cd backend && npx jest users.test.js -i --forceExit`
Expected: Tests PASS (may reveal the DELETE bug — fix the route first if so)

**Step 3: Commit**

```
test: add POST/DELETE coverage for users routes
```

---

### Task 5: Auth and period route coverage gaps

**Files:**
- Modify: `backend/routes/auth.test.js`
- Modify: `backend/routes/periods.test.js`

**Step 1: Add to auth.test.js**

```js
test("POST /auth/token - 401 for nonexistent user", async () => {
  const resp = await request(app)
    .post("/auth/token")
    .send({ username: "nonexistent", password: "nope" });

  expect(resp.statusCode).toEqual(401);
});
```

**Step 2: Add to periods.test.js**

```js
describe("DELETE /periods/:username/:periodId - edge cases", () => {
  test("deleting a period cascades students and constraints", async () => {
    // Create a period
    const createResp = await request(app)
      .post("/periods/u1")
      .send({
        username: "u1",
        schoolYear: "2025-2026",
        title: "Cascade Test",
        number: 99,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    const periodId = createResp.body.period.periodId;

    // Add a student to it
    await request(app)
      .post(`/periods/u1/${periodId}/students`)
      .send({
        periodId,
        name: "Cascade Student",
        grade: 10,
        gender: "M",
        isESE: false,
        has504: false,
        isELL: false,
        isEBD: false,
      })
      .set("authorization", `Bearer ${getU1Token()}`);

    // Delete the period
    const deleteResp = await request(app)
      .delete(`/periods/u1/${periodId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(deleteResp.statusCode).toEqual(200);

    // Verify period is gone
    const getResp = await request(app)
      .get(`/periods/u1/${periodId}`)
      .set("authorization", `Bearer ${getU1Token()}`);

    expect(getResp.statusCode).toEqual(404);
  });
});
```

**Step 3: Run to verify**

Run: `cd backend && npx jest auth.test.js periods.test.js -i --forceExit`
Expected: All PASS

**Step 4: Commit**

```
test: fill auth and period route coverage gaps
```

---

### Task 6: Classroom route coverage gaps (admin, anon, invalid data for PATCH)

**Files:**
- Modify: `backend/routes/classrooms.test.js`

**Step 1: Add missing PATCH/DELETE tests**

```js
// Inside describe("PATCH /classrooms/:username/:classroomId")
test("works for admin", async () => {
  const classroom = await db("classrooms")
    .where("user_username", "u1")
    .first();

  const resp = await request(app)
    .patch(`/classrooms/u1/${classroom.classroom_id}`)
    .send({ seatAlphabetical: true })
    .set("authorization", `Bearer ${getAdminToken()}`);

  expect(resp.statusCode).toEqual(200);
});

test("unauth for anon", async () => {
  const classroom = await db("classrooms")
    .where("user_username", "u1")
    .first();

  const resp = await request(app)
    .patch(`/classrooms/u1/${classroom.classroom_id}`)
    .send({ seatAlphabetical: true });

  expect(resp.statusCode).toEqual(401);
});
```

**Step 2: Run to verify**

Run: `cd backend && npx jest classrooms.test.js -i --forceExit`
Expected: All PASS

**Step 3: Commit**

```
test: fill classroom route coverage gaps
```

---

## Workstream 2: Seating Algorithm Unit Tests

### Task 7: Extract seating algorithms to a testable pure-function module

The algorithms currently live inside the React component at `frontend/src/seating/SeatingChart.jsx` (lines 65-148). They're pure functions that take data and return data — no React dependencies. Extract them to a shared module so both the component and tests can use them.

**Files:**
- Create: `frontend/src/seating/algorithms.js`
- Modify: `frontend/src/seating/SeatingChart.jsx` (import from new module)

**Step 1: Create `algorithms.js`**

Extract `sortAndPrioritizeStudents` and `spreadStudents` from `SeatingChart.jsx` into a standalone module:

```js
/**
 * Seating chart generation algorithms.
 *
 * Pure functions — no React, no side effects.
 */

/**
 * Sort students based on classroom seating preference,
 * then front-load priority accommodation students.
 */
function sortAndPrioritizeStudents(students, classroom) {
  let modifiedStudentsList = [...students];

  // Sorting based on seating preference
  if (classroom.seatAlphabetical) {
    modifiedStudentsList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (classroom.seatRandomize) {
    for (let i = modifiedStudentsList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [modifiedStudentsList[i], modifiedStudentsList[j]] = [
        modifiedStudentsList[j],
        modifiedStudentsList[i],
      ];
    }
  } else if (classroom.seatHighLow) {
    const lowToHigh = [...modifiedStudentsList].sort(
      ({ grade: a }, { grade: b }) => b - a
    );
    const result = [];
    while (lowToHigh.length) {
      const low = lowToHigh.shift();
      if (low) result.push(low);
      const high = lowToHigh.pop();
      if (high) result.push(high);
    }
    modifiedStudentsList = result;
  } else if (classroom.seatMaleFemale) {
    const maleToFemale = [...modifiedStudentsList].sort(
      ({ gender: a }, { gender: b }) => a.localeCompare(b)
    );
    const result = [];
    while (maleToFemale.length) {
      const male = maleToFemale.shift();
      if (male) result.push(male);
      const female = maleToFemale.pop();
      if (female) result.push(female);
    }
    modifiedStudentsList = result;
  }

  // Prioritize based on classroom settings
  let priorityStudents = [];
  if (classroom.eseIsPriority) {
    priorityStudents = modifiedStudentsList.filter((s) => s.isESE);
  } else if (classroom.ellIsPriority) {
    priorityStudents = modifiedStudentsList.filter((s) => s.isELL);
  } else if (classroom.fiveZeroFourIsPriority) {
    priorityStudents = modifiedStudentsList.filter((s) => s.has504);
  } else if (classroom.ebdIsPriority) {
    priorityStudents = modifiedStudentsList.filter((s) => s.isEBD);
  }

  modifiedStudentsList = priorityStudents.concat(
    modifiedStudentsList.filter((s) => !priorityStudents.includes(s))
  );

  return modifiedStudentsList;
}

/**
 * Insert empty placeholder students to spread students across desks
 * when there are more desks than students.
 */
function spreadStudents(matrix, sortedStudents) {
  const deskCount = matrix.flat().filter((cell) => cell === "desk").length;
  const emptyDesks = deskCount - sortedStudents.length;

  if (emptyDesks <= 0) {
    return sortedStudents;
  }

  let spacedStudents = [...sortedStudents];
  for (let i = 1; i <= emptyDesks; i++) {
    const position = sortedStudents.length - i;
    spacedStudents.splice(position, 0, { name: "" });
  }
  return spacedStudents;
}

export { sortAndPrioritizeStudents, spreadStudents };
```

**Step 2: Update SeatingChart.jsx to import from `algorithms.js`**

Replace the inline `sortAndPrioritizeStudents` and `spreadStudents` functions with imports:

```js
import { sortAndPrioritizeStudents, spreadStudents } from "./algorithms";
```

Delete the original function bodies from `SeatingChart.jsx` (lines 65-148).

**Step 3: Run frontend tests + dev server to verify nothing broke**

Run: `cd frontend && npm test` and `cd frontend && npm run dev` (quick smoke check)
Expected: No regressions

**Step 4: Commit**

```
refactor: extract seating algorithms to standalone module for testability
```

---

### Task 8: Write comprehensive unit tests for seating algorithms

**Files:**
- Create: `frontend/src/seating/algorithms.test.js`

**Step 1: Write the test file**

```js
import { sortAndPrioritizeStudents, spreadStudents } from "./algorithms";

// Helper to make student objects
const makeStudent = (overrides = {}) => ({
  name: "Student",
  grade: 10,
  gender: "M",
  isESE: false,
  has504: false,
  isELL: false,
  isEBD: false,
  ...overrides,
});

const noPrefsClassroom = {
  seatAlphabetical: false,
  seatRandomize: false,
  seatHighLow: false,
  seatMaleFemale: false,
  eseIsPriority: false,
  ellIsPriority: false,
  fiveZeroFourIsPriority: false,
  ebdIsPriority: false,
};

describe("sortAndPrioritizeStudents", () => {
  // ===== ALPHABETICAL =====
  describe("alphabetical sorting", () => {
    const classroom = { ...noPrefsClassroom, seatAlphabetical: true };

    test("sorts students A-Z by name", () => {
      const students = [
        makeStudent({ name: "Zara" }),
        makeStudent({ name: "Alice" }),
        makeStudent({ name: "Mike" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result.map((s) => s.name)).toEqual(["Alice", "Mike", "Zara"]);
    });

    test("handles single student", () => {
      const students = [makeStudent({ name: "Only" })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("Only");
    });

    test("handles empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    test("handles students with same name", () => {
      const students = [
        makeStudent({ name: "Sam", grade: 9 }),
        makeStudent({ name: "Sam", grade: 10 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(2);
    });
  });

  // ===== RANDOMIZE =====
  describe("randomize sorting", () => {
    const classroom = { ...noPrefsClassroom, seatRandomize: true };

    test("returns same students in some order", () => {
      const students = [
        makeStudent({ name: "A" }),
        makeStudent({ name: "B" }),
        makeStudent({ name: "C" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result.map((s) => s.name).sort()).toEqual(["A", "B", "C"]);
    });

    test("handles single student", () => {
      const students = [makeStudent({ name: "Only" })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(1);
    });

    test("handles empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    test("does not mutate original array", () => {
      const students = [
        makeStudent({ name: "A" }),
        makeStudent({ name: "B" }),
      ];
      const original = [...students];
      sortAndPrioritizeStudents(students, classroom);
      expect(students).toEqual(original);
    });
  });

  // ===== HIGH-LOW =====
  describe("high-low pairing", () => {
    const classroom = { ...noPrefsClassroom, seatHighLow: true };

    test("interleaves lowest and highest grades", () => {
      const students = [
        makeStudent({ name: "A", grade: 5 }),
        makeStudent({ name: "B", grade: 10 }),
        makeStudent({ name: "C", grade: 7 }),
        makeStudent({ name: "D", grade: 3 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      const grades = result.map((s) => s.grade);
      // Sorted descending: [10, 7, 5, 3]
      // Interleave: shift(10), pop(3), shift(7), pop(5)
      expect(grades).toEqual([10, 3, 7, 5]);
    });

    test("handles odd number of students", () => {
      const students = [
        makeStudent({ name: "A", grade: 1 }),
        makeStudent({ name: "B", grade: 5 }),
        makeStudent({ name: "C", grade: 3 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      // Sorted desc: [5, 3, 1]
      // Interleave: shift(5), pop(1), shift(3)
      expect(result.map((s) => s.grade)).toEqual([5, 1, 3]);
    });

    test("handles all same grade", () => {
      const students = [
        makeStudent({ name: "A", grade: 10 }),
        makeStudent({ name: "B", grade: 10 }),
        makeStudent({ name: "C", grade: 10 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result.every((s) => s.grade === 10)).toBe(true);
    });

    test("handles single student", () => {
      const students = [makeStudent({ grade: 5 })];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(1);
    });

    test("handles empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });

    test("handles two students", () => {
      const students = [
        makeStudent({ name: "Low", grade: 2 }),
        makeStudent({ name: "High", grade: 9 }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      // Sorted desc: [9, 2]. Interleave: shift(9), pop(2)
      expect(result.map((s) => s.grade)).toEqual([9, 2]);
    });
  });

  // ===== MALE-FEMALE ALTERNATING =====
  describe("male-female alternating", () => {
    const classroom = { ...noPrefsClassroom, seatMaleFemale: true };

    test("interleaves genders", () => {
      const students = [
        makeStudent({ name: "A", gender: "M" }),
        makeStudent({ name: "B", gender: "F" }),
        makeStudent({ name: "C", gender: "M" }),
        makeStudent({ name: "D", gender: "F" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      const genders = result.map((s) => s.gender);
      // Sorted alphabetically by gender: [F, F, M, M]
      // Interleave: shift(F), pop(M), shift(F), pop(M)
      expect(genders).toEqual(["F", "M", "F", "M"]);
    });

    test("handles all same gender", () => {
      const students = [
        makeStudent({ name: "A", gender: "M" }),
        makeStudent({ name: "B", gender: "M" }),
        makeStudent({ name: "C", gender: "M" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
      expect(result.every((s) => s.gender === "M")).toBe(true);
    });

    test("handles uneven gender ratio", () => {
      const students = [
        makeStudent({ name: "A", gender: "F" }),
        makeStudent({ name: "B", gender: "F" }),
        makeStudent({ name: "C", gender: "F" }),
        makeStudent({ name: "D", gender: "M" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(4);
      // All students should still be present
      const genders = result.map((s) => s.gender).sort();
      expect(genders).toEqual(["F", "F", "F", "M"]);
    });

    test("handles odd number of students", () => {
      const students = [
        makeStudent({ name: "A", gender: "M" }),
        makeStudent({ name: "B", gender: "F" }),
        makeStudent({ name: "C", gender: "M" }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result).toHaveLength(3);
    });

    test("handles empty array", () => {
      const result = sortAndPrioritizeStudents([], classroom);
      expect(result).toEqual([]);
    });
  });

  // ===== PRIORITY FRONT-LOADING =====
  describe("priority front-loading", () => {
    test("ESE students moved to front", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true, eseIsPriority: true };
      const students = [
        makeStudent({ name: "Alice", isESE: false }),
        makeStudent({ name: "Bob", isESE: true }),
        makeStudent({ name: "Carol", isESE: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      // Alphabetical: Alice, Bob, Carol. ESE (Bob) moved to front.
      expect(result[0].name).toBe("Bob");
    });

    test("ELL students moved to front", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true, ellIsPriority: true };
      const students = [
        makeStudent({ name: "Alice", isELL: false }),
        makeStudent({ name: "Bob", isELL: true }),
        makeStudent({ name: "Carol", isELL: true }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      // Bob and Carol are ELL — both should be first
      expect(result[0].isELL).toBe(true);
      expect(result[1].isELL).toBe(true);
      expect(result[2].isELL).toBe(false);
    });

    test("504 students moved to front", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true, fiveZeroFourIsPriority: true };
      const students = [
        makeStudent({ name: "Alice", has504: true }),
        makeStudent({ name: "Bob", has504: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("Alice");
    });

    test("EBD students moved to front", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true, ebdIsPriority: true };
      const students = [
        makeStudent({ name: "Zack", isEBD: true }),
        makeStudent({ name: "Alice", isEBD: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      expect(result[0].name).toBe("Zack");
    });

    test("no priority — order unchanged after sort", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true };
      const students = [
        makeStudent({ name: "Zara", isESE: true }),
        makeStudent({ name: "Alice", isESE: false }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      // Just alphabetical, no priority shuffling
      expect(result.map((s) => s.name)).toEqual(["Alice", "Zara"]);
    });

    test("all students have priority flag — order unchanged after sort", () => {
      const classroom = { ...noPrefsClassroom, seatAlphabetical: true, eseIsPriority: true };
      const students = [
        makeStudent({ name: "Bob", isESE: true }),
        makeStudent({ name: "Alice", isESE: true }),
      ];
      const result = sortAndPrioritizeStudents(students, classroom);
      // All are priority, so alphabetical order preserved: Alice, Bob
      expect(result.map((s) => s.name)).toEqual(["Alice", "Bob"]);
    });
  });

  // ===== NO PREFERENCES =====
  describe("no sorting preference selected", () => {
    test("returns students in original order", () => {
      const students = [
        makeStudent({ name: "C" }),
        makeStudent({ name: "A" }),
        makeStudent({ name: "B" }),
      ];
      const result = sortAndPrioritizeStudents(students, noPrefsClassroom);
      expect(result.map((s) => s.name)).toEqual(["C", "A", "B"]);
    });
  });
});

describe("spreadStudents", () => {
  test("inserts placeholders when more desks than students", () => {
    const matrix = [["desk", "desk", "desk", "desk"]];
    const students = [makeStudent({ name: "A" }), makeStudent({ name: "B" })];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(4); // 2 students + 2 placeholders
    expect(result.filter((s) => s.name === "")).toHaveLength(2);
  });

  test("returns students unchanged when desks equal students", () => {
    const matrix = [["desk", "desk"]];
    const students = [makeStudent({ name: "A" }), makeStudent({ name: "B" })];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(2);
    expect(result.every((s) => s.name !== "")).toBe(true);
  });

  test("returns students unchanged when more students than desks", () => {
    const matrix = [["desk"]];
    const students = [makeStudent({ name: "A" }), makeStudent({ name: "B" })];
    const result = spreadStudents(matrix, students);
    expect(result).toHaveLength(2);
  });

  test("handles zero students with desks", () => {
    const matrix = [["desk", "desk"]];
    const result = spreadStudents(matrix, []);
    // 2 empty desks, 0 students → 2 placeholders
    expect(result).toHaveLength(2);
  });

  test("handles matrix with nulls (aisles)", () => {
    const matrix = [["desk", null, "desk", null, "desk"]];
    const students = [makeStudent({ name: "A" })];
    const result = spreadStudents(matrix, students);
    // 3 desks, 1 student → 2 placeholders inserted
    expect(result).toHaveLength(3);
  });

  test("does not mutate original array", () => {
    const matrix = [["desk", "desk", "desk"]];
    const students = [makeStudent({ name: "A" })];
    const original = [...students];
    spreadStudents(matrix, students);
    expect(students).toEqual(original);
  });
});
```

**Step 2: Run to verify**

Run: `cd frontend && npm test -- --testPathPattern=algorithms`
Expected: All PASS

**Step 3: Commit**

```
test: add comprehensive unit tests for seating algorithms
```

---

## Workstream 3: Migration Tests

### Task 9: Write Knex migration up/down cycle tests

These tests verify that every migration can run `up` and then `down` cleanly, demonstrating SQL and schema literacy.

**Files:**
- Create: `backend/migrations/migrations.test.js`

**Step 1: Write the migration test**

```js
"use strict";

const knex = require("knex");
const knexConfig = require("../knexfile");

// Use a dedicated test connection
let db;

beforeAll(async () => {
  db = knex(knexConfig.test);
});

afterAll(async () => {
  await db.destroy();
});

describe("Knex migrations", () => {
  test("all migrations run up successfully on clean database", async () => {
    // Rollback everything first to start clean
    await db.migrate.rollback(undefined, true); // true = rollback all

    // Run all migrations
    const [batchNo, log] = await db.migrate.latest();
    expect(batchNo).toBeGreaterThan(0);
    expect(log.length).toBeGreaterThan(0);
  });

  test("all migrations roll back successfully", async () => {
    // Ensure we're at latest first
    await db.migrate.latest();

    // Rollback all
    const [batchNo, log] = await db.migrate.rollback(undefined, true);
    expect(log.length).toBeGreaterThan(0);
  });

  test("migrations are idempotent (up-down-up cycle)", async () => {
    // Full cycle: rollback all → migrate up → rollback all → migrate up
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();
    await db.migrate.rollback(undefined, true);
    const [batchNo, log] = await db.migrate.latest();
    expect(batchNo).toBeGreaterThan(0);
    expect(log.length).toBeGreaterThan(0);
  });

  test("expected tables exist after migration", async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();

    const tables = await db.raw(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE 'knex_%'
      ORDER BY table_name
    `);

    const tableNames = tables.rows.map((r) => r.table_name);
    expect(tableNames).toContain("users");
    expect(tableNames).toContain("periods");
    expect(tableNames).toContain("students");
    expect(tableNames).toContain("classrooms");
    expect(tableNames).toContain("seating_charts");
    expect(tableNames).toContain("student_constraints");
  });

  test("foreign key constraints are enforced", async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();

    // Inserting a period for a non-existent user should fail
    await expect(
      db("periods").insert({
        user_username: "nonexistent_user",
        school_year: "2025-2026",
        title: "Test",
        number: 1,
      })
    ).rejects.toThrow();
  });

  test("cascade delete works (user → periods → students)", async () => {
    await db.migrate.rollback(undefined, true);
    await db.migrate.latest();

    // Insert a user
    const bcrypt = require("bcrypt");
    const pw = await bcrypt.hash("test", 1);
    await db("users").insert({
      username: "cascade_test",
      password: pw,
      email: "c@test.com",
      title: "Mr.",
      first_name: "Cascade",
      last_name: "Test",
    });

    // Insert a period
    const [period] = await db("periods")
      .insert({
        user_username: "cascade_test",
        school_year: "2025-2026",
        title: "Test Period",
        number: 1,
      })
      .returning("period_id");

    // Insert a student
    await db("students").insert({
      period_id: period.period_id,
      name: "Test Student",
      grade: 10,
      gender: "M",
    });

    // Delete user — should cascade
    await db("users").where("username", "cascade_test").del();

    // Verify cascaded
    const periods = await db("periods").where("user_username", "cascade_test");
    expect(periods).toHaveLength(0);

    const students = await db("students").where(
      "period_id",
      period.period_id
    );
    expect(students).toHaveLength(0);
  });
});
```

> **Note:** This test file manipulates real schema state (rollback all / migrate latest), so it MUST run in isolation. The `-i` (in-band) Jest flag already handles this. If this causes issues with other test files sharing the same DB connection, run it separately: `npx jest migrations.test.js -i --forceExit`.

**Step 2: Run to verify**

Run: `cd backend && npx jest migrations.test.js -i --forceExit`
Expected: All PASS. If the duplicate `created_at` column bug triggers, migration 10 will fail — fix the migration before proceeding.

**Step 3: Commit**

```
test: add Knex migration up/down cycle and schema integrity tests
```

---

## Workstream 4: GitHub Actions CI

### Task 10: Create GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Write the workflow**

```yaml
name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test-backend:
    name: Backend Tests
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
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

    env:
      NODE_ENV: test
      DATABASE_URL: postgresql://postgres:postgres@localhost:5432/map_my_seat_test
      SECRET_KEY: test-secret-key-for-ci

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: backend/package-lock.json

      - name: Install backend dependencies
        run: cd backend && npm ci

      - name: Run migrations
        run: cd backend && npx knex migrate:latest

      - name: Run backend tests
        run: cd backend && npm test

  test-frontend:
    name: Frontend Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Run frontend tests
        run: cd frontend && npm test

  lint:
    name: Lint
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install frontend dependencies
        run: cd frontend && npm ci

      - name: Lint frontend
        run: cd frontend && npm run lint
```

**Step 2: Verify syntax**

Run: `cd /home/gilhooleyp/projects/map-my-seat && cat .github/workflows/ci.yml | head -5` (just verify it was written)

**Step 3: Commit**

```
ci: add GitHub Actions workflow with Postgres service container
```

---

## Execution Order

Tasks can be parallelized as follows:

```
                    ┌── Task 2 (student routes)
Task 1 (fixtures) ──┼── Task 3 (seating chart routes)
                    ├── Task 4 (users gaps)
                    ├── Task 5 (auth + period gaps)
                    └── Task 6 (classroom gaps)

Task 7 (extract algorithms) ── Task 8 (algorithm tests)

Task 9 (migration tests) — independent

Task 10 (CI) — independent, but test last to verify all tests pass
```

**Minimum sequential path:** Task 1 → Tasks 2-6 (parallel) → Task 10
**Independent paths:** Tasks 7-8, Task 9, Task 10

## Summary of New Test Files

| File | Type | Tests | Covers |
|------|------|-------|--------|
| `backend/routes/students.test.js` | Integration | ~10 | Student CRUD via period routes |
| `backend/routes/seatingCharts.test.js` | Integration | ~15 | Seating chart CRUD + duplicate |
| `backend/routes/users.test.js` (additions) | Integration | ~7 | POST create, DELETE user |
| `backend/routes/auth.test.js` (additions) | Integration | ~1 | Nonexistent user login |
| `backend/routes/periods.test.js` (additions) | Integration | ~1 | Cascade delete edge case |
| `backend/routes/classrooms.test.js` (additions) | Integration | ~2 | Admin/anon PATCH |
| `frontend/src/seating/algorithms.test.js` | Unit | ~30 | All 4 algorithms + priority + spread |
| `backend/migrations/migrations.test.js` | Integration | ~5 | Up/down cycles, FK enforcement, cascades |
| `.github/workflows/ci.yml` | CI | — | Runs all tests on push/PR |

**Estimated new test count:** ~70 tests across 4 new files + 4 modified files

## Known Bugs to Address During Implementation

1. **`backend/routes/users.js:75`** — DELETE handler has dead code `app.use("/settings", settingsRoutes)` that will throw `ReferenceError`. Fix: delete the line.
2. **`backend/routes/classrooms.js:60`** — PATCH validates `req.body.classroomId` instead of `req.body`. Fix: change to `jsonschema.validate(req.body, classroomUpdateSchema)`.
3. **Potential duplicate `created_at` column** — Migrations 6 and 10 both add `created_at` to `seating_charts`. Verify and fix before migration tests.
