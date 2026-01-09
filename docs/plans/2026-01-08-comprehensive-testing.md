# Comprehensive Testing Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Achieve 90%+ test coverage across backend and frontend, eliminating bugs through systematic testing.

**Architecture:** TDD approach - write failing tests first, then minimal implementation fixes. Backend tests use Jest with supertest and database transactions for isolation. Frontend tests use React Testing Library with mocked API responses.

**Tech Stack:** Jest, Supertest, React Testing Library, Vitest (frontend)

---

## Phase 1: Backend Critical Gaps

### Task 1: StudentConstraint Model Tests

**Files:**
- Create: `backend/models/studentConstraint.test.js`
- Reference: `backend/models/studentConstraint.js`
- Reference: `backend/models/_testCommon.js`

**Step 1: Create test file with setup**

```javascript
"use strict";

const StudentConstraint = require("./studentConstraint");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testStudentIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
```

**Step 2: Add test for creating a constraint**

```javascript
describe("create", () => {
  test("works: creates keep-together constraint", async () => {
    const constraint = await StudentConstraint.create({
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_together",
    });

    expect(constraint).toEqual({
      id: expect.any(Number),
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_together",
    });
  });

  test("works: creates keep-apart constraint", async () => {
    const constraint = await StudentConstraint.create({
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_apart",
    });

    expect(constraint).toEqual({
      id: expect.any(Number),
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_apart",
    });
  });

  test("bad request with invalid constraint type", async () => {
    try {
      await StudentConstraint.create({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "invalid_type",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
```

**Step 3: Run test to verify it fails**

Run: `cd backend && npm test -- studentConstraint.test.js`
Expected: Tests may fail if _testCommon doesn't export testStudentIds

**Step 4: Update _testCommon.js to export student IDs**

Add to `backend/models/_testCommon.js`:
```javascript
const testStudentIds = [];

// In commonBeforeAll, after inserting students:
const studentResults = await db("students").select("id");
testStudentIds.push(...studentResults.map(s => s.id));

// Export:
module.exports = {
  // ... existing exports
  testStudentIds,
};
```

**Step 5: Add tests for getByPeriod**

```javascript
describe("getByPeriod", () => {
  test("works: returns constraints for period", async () => {
    // First create a constraint
    await StudentConstraint.create({
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_together",
    });

    const constraints = await StudentConstraint.getByPeriod(testPeriodIds[0]);
    expect(constraints.length).toBeGreaterThan(0);
    expect(constraints[0]).toEqual({
      id: expect.any(Number),
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_together",
      student1Name: expect.any(String),
      student2Name: expect.any(String),
    });
  });

  test("returns empty array for period with no constraints", async () => {
    const constraints = await StudentConstraint.getByPeriod(99999);
    expect(constraints).toEqual([]);
  });
});
```

**Step 6: Add tests for delete**

```javascript
describe("delete", () => {
  test("works: deletes constraint", async () => {
    const constraint = await StudentConstraint.create({
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_apart",
    });

    await StudentConstraint.delete(constraint.id);

    const constraints = await StudentConstraint.getByPeriod(testPeriodIds[0]);
    const found = constraints.find(c => c.id === constraint.id);
    expect(found).toBeUndefined();
  });

  test("not found if no such constraint", async () => {
    try {
      await StudentConstraint.delete(99999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
```

**Step 7: Run all model tests**

Run: `cd backend && npm test -- studentConstraint.test.js`
Expected: All tests PASS

**Step 8: Commit**

```bash
git add backend/models/studentConstraint.test.js backend/models/_testCommon.js
git commit -m "test: add StudentConstraint model tests"
```

---

### Task 2: Classrooms Route Tests

**Files:**
- Create: `backend/routes/classrooms.test.js`
- Reference: `backend/routes/classrooms.js`
- Reference: `backend/routes/_testCommon.js`

**Step 1: Create test file with setup**

```javascript
"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  testClassroomIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
```

**Step 2: Add GET /classrooms/:username tests**

```javascript
describe("GET /classrooms/:username", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.classrooms).toEqual(expect.any(Array));
  });

  test("works for admin", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${adminToken()}`);

    expect(resp.statusCode).toEqual(200);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .get("/classrooms/u1")
      .set("authorization", `Bearer ${u2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async () => {
    const resp = await request(app).get("/classrooms/u1");
    expect(resp.statusCode).toEqual(401);
  });
});
```

**Step 3: Add POST /classrooms/:username tests**

```javascript
describe("POST /classrooms/:username", () => {
  const newClassroom = {
    classroomName: "Room 101",
    rows: 5,
    columns: 6,
  };

  test("works for correct user", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send(newClassroom)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.classroom).toEqual({
      id: expect.any(Number),
      classroomName: "Room 101",
      rows: 5,
      columns: 6,
      userUsername: "u1",
    });
  });

  test("bad request with missing data", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ classroomName: "Room 101" })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async () => {
    const resp = await request(app)
      .post("/classrooms/u1")
      .send({ ...newClassroom, rows: -1 })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});
```

**Step 4: Add GET /classrooms/:username/:classroomId tests**

```javascript
describe("GET /classrooms/:username/:classroomId", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .get(`/classrooms/u1/${testClassroomIds[0]}`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.classroom).toEqual({
      id: testClassroomIds[0],
      classroomName: expect.any(String),
      rows: expect.any(Number),
      columns: expect.any(Number),
      userUsername: "u1",
    });
  });

  test("not found for no such classroom", async () => {
    const resp = await request(app)
      .get("/classrooms/u1/99999")
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
```

**Step 5: Add PATCH /classrooms/:username/:classroomId tests**

```javascript
describe("PATCH /classrooms/:username/:classroomId", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .patch(`/classrooms/u1/${testClassroomIds[0]}`)
      .send({ classroomName: "Updated Room" })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.classroom.classroomName).toEqual("Updated Room");
  });

  test("bad request with invalid field", async () => {
    const resp = await request(app)
      .patch(`/classrooms/u1/${testClassroomIds[0]}`)
      .send({ invalidField: "value" })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });
});
```

**Step 6: Add DELETE /classrooms/:username/:classroomId tests**

```javascript
describe("DELETE /classrooms/:username/:classroomId", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .delete(`/classrooms/u1/${testClassroomIds[0]}`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: testClassroomIds[0] });
  });

  test("not found for no such classroom", async () => {
    const resp = await request(app)
      .delete("/classrooms/u1/99999")
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
```

**Step 7: Update _testCommon.js to export classroom IDs**

Add to `backend/routes/_testCommon.js`:
```javascript
const testClassroomIds = [];

// In commonBeforeAll, after creating classrooms:
const classroomResults = await db("classrooms").select("id");
testClassroomIds.push(...classroomResults.map(c => c.id));

module.exports = {
  // ... existing exports
  testClassroomIds,
};
```

**Step 8: Run route tests**

Run: `cd backend && npm test -- routes/classrooms.test.js`
Expected: All tests PASS

**Step 9: Commit**

```bash
git add backend/routes/classrooms.test.js backend/routes/_testCommon.js
git commit -m "test: add classrooms route tests"
```

---

### Task 3: Constraints Route Tests

**Files:**
- Create: `backend/routes/constraints.test.js`
- Reference: `backend/routes/constraints.js`
- Reference: `backend/routes/_testCommon.js`

**Step 1: Create test file with setup**

```javascript
"use strict";

const request = require("supertest");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
  testPeriodIds,
  testStudentIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);
```

**Step 2: Add POST /constraints/:username/:periodId tests**

```javascript
describe("POST /constraints/:username/:periodId", () => {
  test("works for correct user", async () => {
    const resp = await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "keep_together",
      })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(201);
    expect(resp.body.constraint).toEqual({
      id: expect.any(Number),
      studentId1: testStudentIds[0],
      studentId2: testStudentIds[1],
      constraintType: "keep_together",
    });
  });

  test("bad request with invalid constraint type", async () => {
    const resp = await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "invalid",
      })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with same student", async () => {
    const resp = await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[0],
        constraintType: "keep_together",
      })
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(400);
  });

  test("unauth for wrong user", async () => {
    const resp = await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "keep_together",
      })
      .set("authorization", `Bearer ${u2Token()}`);

    expect(resp.statusCode).toEqual(401);
  });
});
```

**Step 3: Add GET /constraints/:username/:periodId tests**

```javascript
describe("GET /constraints/:username/:periodId", () => {
  test("works for correct user", async () => {
    // First create a constraint
    await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "keep_apart",
      })
      .set("authorization", `Bearer ${u1Token()}`);

    const resp = await request(app)
      .get(`/constraints/u1/${testPeriodIds[0]}`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.constraints).toEqual(expect.any(Array));
    expect(resp.body.constraints.length).toBeGreaterThan(0);
  });

  test("returns empty array for period with no constraints", async () => {
    const resp = await request(app)
      .get(`/constraints/u1/${testPeriodIds[0]}`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body.constraints).toEqual([]);
  });
});
```

**Step 4: Add DELETE /constraints/:username/:periodId/:constraintId tests**

```javascript
describe("DELETE /constraints/:username/:periodId/:constraintId", () => {
  test("works for correct user", async () => {
    // First create a constraint
    const createResp = await request(app)
      .post(`/constraints/u1/${testPeriodIds[0]}`)
      .send({
        studentId1: testStudentIds[0],
        studentId2: testStudentIds[1],
        constraintType: "keep_together",
      })
      .set("authorization", `Bearer ${u1Token()}`);

    const constraintId = createResp.body.constraint.id;

    const resp = await request(app)
      .delete(`/constraints/u1/${testPeriodIds[0]}/${constraintId}`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: constraintId });
  });

  test("not found for no such constraint", async () => {
    const resp = await request(app)
      .delete(`/constraints/u1/${testPeriodIds[0]}/99999`)
      .set("authorization", `Bearer ${u1Token()}`);

    expect(resp.statusCode).toEqual(404);
  });
});
```

**Step 5: Update _testCommon.js to export student and period IDs**

Ensure `backend/routes/_testCommon.js` exports:
```javascript
const testPeriodIds = [];
const testStudentIds = [];

// In commonBeforeAll:
const periodResults = await db("periods").select("id");
testPeriodIds.push(...periodResults.map(p => p.id));

const studentResults = await db("students").select("id");
testStudentIds.push(...studentResults.map(s => s.id));

module.exports = {
  // ... existing exports
  testPeriodIds,
  testStudentIds,
};
```

**Step 6: Run constraint route tests**

Run: `cd backend && npm test -- routes/constraints.test.js`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add backend/routes/constraints.test.js backend/routes/_testCommon.js
git commit -m "test: add constraints route tests"
```

---

## Phase 2: Frontend Critical Gaps

### Task 4: API Client Tests

**Files:**
- Create: `frontend/src/api.test.js`
- Reference: `frontend/src/api.js`

**Step 1: Create test file with mock setup**

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SeatingApi from './api';

// Mock fetch globally
global.fetch = vi.fn();

describe('SeatingApi', () => {
  beforeEach(() => {
    SeatingApi.token = 'test-token';
    fetch.mockClear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});
```

**Step 2: Add authentication method tests**

```javascript
describe('Authentication', () => {
  it('login sends correct request and returns token', async () => {
    const mockResponse = { token: 'new-token' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await SeatingApi.login({ username: 'test', password: 'pass' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/token'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'test', password: 'pass' }),
      })
    );
    expect(result).toEqual('new-token');
  });

  it('signup sends correct request and returns token', async () => {
    const mockResponse = { token: 'new-token' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await SeatingApi.signup({
      username: 'test',
      password: 'pass',
      email: 'test@test.com',
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/register'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual('new-token');
  });
});
```

**Step 3: Add user method tests**

```javascript
describe('User methods', () => {
  it('getCurrentUser fetches user data', async () => {
    const mockUser = { username: 'test', email: 'test@test.com' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const result = await SeatingApi.getCurrentUser('test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
    expect(result).toEqual(mockUser);
  });

  it('updateUser sends PATCH request', async () => {
    const mockUser = { username: 'test', email: 'new@test.com' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });

    const result = await SeatingApi.updateUser('test', { email: 'new@test.com' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/users/test'),
      expect.objectContaining({ method: 'PATCH' })
    );
    expect(result).toEqual(mockUser);
  });
});
```

**Step 4: Add period method tests**

```javascript
describe('Period methods', () => {
  it('getPeriods fetches periods list', async () => {
    const mockPeriods = [{ id: 1, periodName: 'Period 1' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ periods: mockPeriods }),
    });

    const result = await SeatingApi.getPeriods('test');

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/periods/test'),
      expect.any(Object)
    );
    expect(result).toEqual(mockPeriods);
  });

  it('createPeriod sends POST request', async () => {
    const mockPeriod = { id: 1, periodName: 'New Period' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ period: mockPeriod }),
    });

    const result = await SeatingApi.createPeriod('test', { periodName: 'New Period' });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/periods/test'),
      expect.objectContaining({ method: 'POST' })
    );
    expect(result).toEqual(mockPeriod);
  });

  it('deletePeriod sends DELETE request', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: 1 }),
    });

    await SeatingApi.deletePeriod('test', 1);

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/periods/test/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});
```

**Step 5: Add error handling tests**

```javascript
describe('Error handling', () => {
  it('throws error on failed request', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: 'Not found' } }),
    });

    await expect(SeatingApi.getCurrentUser('nonexistent'))
      .rejects.toThrow('Not found');
  });

  it('handles network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(SeatingApi.getCurrentUser('test'))
      .rejects.toThrow('Network error');
  });
});
```

**Step 6: Run API tests**

Run: `cd frontend && npm test -- api.test.js`
Expected: All tests PASS

**Step 7: Commit**

```bash
git add frontend/src/api.test.js
git commit -m "test: add SeatingApi client tests"
```

---

### Task 5: UserContext Tests

**Files:**
- Create: `frontend/src/auth/UserContext.test.jsx`
- Reference: `frontend/src/auth/UserContext.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { UserProvider, useUser } from './UserContext';
import SeatingApi from '../api';

// Mock the API
vi.mock('../api', () => ({
  default: {
    token: null,
    getCurrentUser: vi.fn(),
  },
}));

// Test component to consume context
function TestConsumer() {
  const { currentUser, setCurrentUser, logout } = useUser();
  return (
    <div>
      <span data-testid="username">{currentUser?.username || 'none'}</span>
      <button onClick={() => setCurrentUser({ username: 'newuser' })}>
        Set User
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('UserContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });
});
```

**Step 2: Add provider rendering tests**

```javascript
it('provides null user by default', () => {
  render(
    <UserProvider>
      <TestConsumer />
    </UserProvider>
  );

  expect(screen.getByTestId('username')).toHaveTextContent('none');
});

it('loads user from token on mount', async () => {
  localStorage.setItem('seating-token', 'test-token');
  SeatingApi.getCurrentUser.mockResolvedValueOnce({ username: 'loaded' });

  render(
    <UserProvider>
      <TestConsumer />
    </UserProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('username')).toHaveTextContent('loaded');
  });
});
```

**Step 3: Add setCurrentUser and logout tests**

```javascript
it('setCurrentUser updates context', async () => {
  render(
    <UserProvider>
      <TestConsumer />
    </UserProvider>
  );

  await act(async () => {
    screen.getByText('Set User').click();
  });

  expect(screen.getByTestId('username')).toHaveTextContent('newuser');
});

it('logout clears user and token', async () => {
  localStorage.setItem('seating-token', 'test-token');
  SeatingApi.getCurrentUser.mockResolvedValueOnce({ username: 'test' });

  render(
    <UserProvider>
      <TestConsumer />
    </UserProvider>
  );

  await waitFor(() => {
    expect(screen.getByTestId('username')).toHaveTextContent('test');
  });

  await act(async () => {
    screen.getByText('Logout').click();
  });

  expect(screen.getByTestId('username')).toHaveTextContent('none');
  expect(localStorage.getItem('seating-token')).toBeNull();
});
```

**Step 4: Run context tests**

Run: `cd frontend && npm test -- UserContext.test.jsx`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add frontend/src/auth/UserContext.test.jsx
git commit -m "test: add UserContext tests"
```

---

### Task 6: Custom Hooks Tests

**Files:**
- Create: `frontend/src/hooks/useAutosave.test.js`
- Create: `frontend/src/hooks/useFormValidation.test.js`
- Create: `frontend/src/hooks/useKeyboardShortcuts.test.js`

**Step 1: Create useAutosave test file**

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAutosave from './useAutosave';

describe('useAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls save function after delay', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutosave({ data: { name: 'test' }, onSave: saveFn, delay: 1000 })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).toHaveBeenCalledWith({ name: 'test' });
  });

  it('debounces rapid changes', async () => {
    const saveFn = vi.fn().mockResolvedValue(undefined);
    const { rerender } = renderHook(
      ({ data }) => useAutosave({ data, onSave: saveFn, delay: 1000 }),
      { initialProps: { data: { name: 'a' } } }
    );

    rerender({ data: { name: 'ab' } });
    rerender({ data: { name: 'abc' } });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(saveFn).toHaveBeenCalledTimes(1);
    expect(saveFn).toHaveBeenCalledWith({ name: 'abc' });
  });
});
```

**Step 2: Create useFormValidation test file**

```javascript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useFormValidation from './useFormValidation';

describe('useFormValidation', () => {
  const rules = {
    email: (value) => !value.includes('@') ? 'Invalid email' : null,
    password: (value) => value.length < 6 ? 'Too short' : null,
  };

  it('returns no errors for valid data', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: 'test@test.com', password: '123456' }, rules)
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('returns errors for invalid data', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: 'invalid', password: '123' }, rules)
    );

    expect(result.current.errors.email).toBe('Invalid email');
    expect(result.current.errors.password).toBe('Too short');
    expect(result.current.isValid).toBe(false);
  });

  it('validates single field', () => {
    const { result } = renderHook(() =>
      useFormValidation({ email: '', password: '' }, rules)
    );

    act(() => {
      result.current.validateField('email', 'bad');
    });

    expect(result.current.errors.email).toBe('Invalid email');
  });
});
```

**Step 3: Create useKeyboardShortcuts test file**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { fireEvent } from '@testing-library/dom';
import useKeyboardShortcuts from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  it('calls handler for registered shortcut', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 's': handler }));

    fireEvent.keyDown(document, { key: 's', ctrlKey: true });

    expect(handler).toHaveBeenCalled();
  });

  it('does not call handler without modifier key', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcuts({ 's': handler }));

    fireEvent.keyDown(document, { key: 's' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('cleans up listeners on unmount', () => {
    const handler = vi.fn();
    const { unmount } = renderHook(() => useKeyboardShortcuts({ 's': handler }));

    unmount();
    fireEvent.keyDown(document, { key: 's', ctrlKey: true });

    expect(handler).not.toHaveBeenCalled();
  });
});
```

**Step 4: Run hooks tests**

Run: `cd frontend && npm test -- hooks/`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add frontend/src/hooks/*.test.js
git commit -m "test: add custom hooks tests"
```

---

## Phase 3: Component Coverage

### Task 7: StudentConstraints Component Tests

**Files:**
- Create: `frontend/src/students/StudentConstraints.test.jsx`
- Reference: `frontend/src/students/StudentConstraints.jsx`

**Step 1: Create test file with mocks**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import StudentConstraints from './StudentConstraints';
import SeatingApi from '../api';

vi.mock('../api', () => ({
  default: {
    getConstraints: vi.fn(),
    createConstraint: vi.fn(),
    deleteConstraint: vi.fn(),
    getStudents: vi.fn(),
  },
}));

const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
};

describe('StudentConstraints', () => {
  const mockStudents = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
  ];

  const mockConstraints = [
    { id: 1, studentId1: 1, studentId2: 2, constraintType: 'keep_together',
      student1Name: 'John Doe', student2Name: 'Jane Smith' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SeatingApi.getStudents.mockResolvedValue(mockStudents);
    SeatingApi.getConstraints.mockResolvedValue(mockConstraints);
  });
});
```

**Step 2: Add rendering tests**

```javascript
it('renders constraints list', async () => {
  renderWithProviders(
    <StudentConstraints username="test" periodId="1" />
  );

  await waitFor(() => {
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });
});

it('shows empty state when no constraints', async () => {
  SeatingApi.getConstraints.mockResolvedValue([]);

  renderWithProviders(
    <StudentConstraints username="test" periodId="1" />
  );

  await waitFor(() => {
    expect(screen.getByText(/no constraints/i)).toBeInTheDocument();
  });
});
```

**Step 3: Add interaction tests**

```javascript
it('creates new constraint', async () => {
  SeatingApi.createConstraint.mockResolvedValue({
    id: 2, studentId1: 1, studentId2: 2, constraintType: 'keep_apart'
  });

  renderWithProviders(
    <StudentConstraints username="test" periodId="1" />
  );

  await waitFor(() => {
    expect(screen.getByText(/add constraint/i)).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText(/add constraint/i));

  // Fill form and submit
  // ... (specific selectors depend on component implementation)
});

it('deletes constraint', async () => {
  SeatingApi.deleteConstraint.mockResolvedValue({ deleted: 1 });

  renderWithProviders(
    <StudentConstraints username="test" periodId="1" />
  );

  await waitFor(() => {
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });

  const deleteButton = screen.getByRole('button', { name: /delete/i });
  fireEvent.click(deleteButton);

  await waitFor(() => {
    expect(SeatingApi.deleteConstraint).toHaveBeenCalledWith('test', '1', 1);
  });
});
```

**Step 4: Run component tests**

Run: `cd frontend && npm test -- StudentConstraints.test.jsx`
Expected: All tests PASS

**Step 5: Commit**

```bash
git add frontend/src/students/StudentConstraints.test.jsx
git commit -m "test: add StudentConstraints component tests"
```

---

### Task 8: GradebookUploader Component Tests

**Files:**
- Create: `frontend/src/students/GradebookUploader.test.jsx`
- Reference: `frontend/src/students/GradebookUploader.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import GradebookUploader from './GradebookUploader';

const renderWithProviders = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('GradebookUploader', () => {
  const mockOnUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });
});
```

**Step 2: Add file upload tests**

```javascript
it('renders upload area', () => {
  renderWithProviders(<GradebookUploader onUpload={mockOnUpload} />);

  expect(screen.getByText(/upload/i)).toBeInTheDocument();
});

it('accepts CSV file', async () => {
  renderWithProviders(<GradebookUploader onUpload={mockOnUpload} />);

  const csvContent = 'firstName,lastName\nJohn,Doe\nJane,Smith';
  const file = new File([csvContent], 'students.csv', { type: 'text/csv' });

  const input = screen.getByLabelText(/upload/i) ||
                document.querySelector('input[type="file"]');

  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(mockOnUpload).toHaveBeenCalled();
  });
});

it('rejects non-CSV file', async () => {
  renderWithProviders(<GradebookUploader onUpload={mockOnUpload} />);

  const file = new File(['content'], 'file.txt', { type: 'text/plain' });
  const input = document.querySelector('input[type="file"]');

  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText(/csv/i)).toBeInTheDocument();
  });
  expect(mockOnUpload).not.toHaveBeenCalled();
});

it('shows preview of parsed students', async () => {
  renderWithProviders(<GradebookUploader onUpload={mockOnUpload} />);

  const csvContent = 'firstName,lastName\nJohn,Doe\nJane,Smith';
  const file = new File([csvContent], 'students.csv', { type: 'text/csv' });
  const input = document.querySelector('input[type="file"]');

  fireEvent.change(input, { target: { files: [file] } });

  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
  });
});
```

**Step 3: Run component tests**

Run: `cd frontend && npm test -- GradebookUploader.test.jsx`
Expected: All tests PASS

**Step 4: Commit**

```bash
git add frontend/src/students/GradebookUploader.test.jsx
git commit -m "test: add GradebookUploader component tests"
```

---

### Task 9: ErrorBoundary Tests

**Files:**
- Create: `frontend/src/common/ErrorBoundary.test.jsx`
- Reference: `frontend/src/common/ErrorBoundary.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import ErrorBoundary from './ErrorBoundary';

// Suppress console.error for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});
afterAll(() => {
  console.error = originalError;
});

// Component that throws
function BrokenComponent() {
  throw new Error('Test error');
}

function WorkingComponent() {
  return <div>Working</div>;
}

const renderWithProviders = (ui) => {
  return render(<ChakraProvider>{ui}</ChakraProvider>);
};

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Working')).toBeInTheDocument();
  });

  it('renders fallback UI on error', () => {
    renderWithProviders(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('displays error message', () => {
    renderWithProviders(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- ErrorBoundary.test.jsx`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add frontend/src/common/ErrorBoundary.test.jsx
git commit -m "test: add ErrorBoundary tests"
```

---

### Task 10: MobileNav Tests

**Files:**
- Create: `frontend/src/navigation/MobileNav.test.jsx`
- Reference: `frontend/src/navigation/MobileNav.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import MobileNav from './MobileNav';
import { UserProvider } from '../auth/UserContext';

vi.mock('../api', () => ({
  default: { token: 'test-token', getCurrentUser: vi.fn() },
}));

const renderWithProviders = (ui, { user = null } = {}) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>
        <UserProvider value={{ currentUser: user, setCurrentUser: vi.fn(), logout: vi.fn() }}>
          {ui}
        </UserProvider>
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('MobileNav', () => {
  it('renders hamburger menu button', () => {
    renderWithProviders(<MobileNav />);

    expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
  });

  it('opens menu on button click', () => {
    renderWithProviders(<MobileNav />, { user: { username: 'test' } });

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    expect(screen.getByText(/periods/i)).toBeInTheDocument();
  });

  it('shows login/signup when logged out', () => {
    renderWithProviders(<MobileNav />);

    fireEvent.click(screen.getByRole('button', { name: /menu/i }));

    expect(screen.getByText(/login/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });
});
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- MobileNav.test.jsx`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add frontend/src/navigation/MobileNav.test.jsx
git commit -m "test: add MobileNav tests"
```

---

## Phase 4: Integration & Edge Cases

### Task 11: Seating Chart Integration Tests

**Files:**
- Create: `frontend/src/seating/SeatingChart.integration.test.jsx`

**Step 1: Create integration test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import SeatingChart from './SeatingChart';
import SeatingApi from '../api';

vi.mock('../api');

const renderSeatingChart = (classroomId = '1') => {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[`/classrooms/test/${classroomId}`]}>
        <Routes>
          <Route
            path="/classrooms/:username/:classroomId"
            element={<SeatingChart />}
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  );
};

describe('SeatingChart Integration', () => {
  const mockClassroom = {
    id: 1,
    classroomName: 'Room 101',
    rows: 4,
    columns: 5,
  };

  const mockStudents = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SeatingApi.getClassroom.mockResolvedValue(mockClassroom);
    SeatingApi.getStudents.mockResolvedValue(mockStudents);
    SeatingApi.getSeatingChart.mockResolvedValue(null);
  });

  it('renders classroom grid with correct dimensions', async () => {
    renderSeatingChart();

    await waitFor(() => {
      const seats = screen.getAllByRole('button');
      // 4 rows x 5 columns = 20 seats
      expect(seats.length).toBeGreaterThanOrEqual(20);
    });
  });

  it('allows drag and drop of students to seats', async () => {
    renderSeatingChart();

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    // Drag student to seat
    const student = screen.getByText('John');
    const seat = screen.getAllByRole('button')[0];

    fireEvent.dragStart(student);
    fireEvent.drop(seat);

    await waitFor(() => {
      expect(seat).toHaveTextContent('John');
    });
  });

  it('saves seating arrangement', async () => {
    SeatingApi.saveSeatingChart.mockResolvedValue({ id: 1 });
    renderSeatingChart();

    await waitFor(() => {
      expect(screen.getByText(/save/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/save/i));

    await waitFor(() => {
      expect(SeatingApi.saveSeatingChart).toHaveBeenCalled();
    });
  });
});
```

**Step 2: Run integration tests**

Run: `cd frontend && npm test -- integration`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add frontend/src/seating/SeatingChart.integration.test.jsx
git commit -m "test: add SeatingChart integration tests"
```

---

### Task 12: Backend Error Handling Tests

**Files:**
- Create: `backend/expressError.test.js`

**Step 1: Create error class tests**

```javascript
"use strict";

const {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} = require("./expressError");

describe("ExpressError", () => {
  test("creates error with message and status", () => {
    const err = new ExpressError("Test error", 418);
    expect(err.message).toBe("Test error");
    expect(err.status).toBe(418);
  });

  test("is instance of Error", () => {
    const err = new ExpressError("Test", 500);
    expect(err instanceof Error).toBeTruthy();
  });
});

describe("NotFoundError", () => {
  test("creates 404 error with default message", () => {
    const err = new NotFoundError();
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
  });

  test("creates 404 error with custom message", () => {
    const err = new NotFoundError("Resource missing");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Resource missing");
  });
});

describe("UnauthorizedError", () => {
  test("creates 401 error with default message", () => {
    const err = new UnauthorizedError();
    expect(err.status).toBe(401);
    expect(err.message).toBe("Unauthorized");
  });
});

describe("BadRequestError", () => {
  test("creates 400 error with default message", () => {
    const err = new BadRequestError();
    expect(err.status).toBe(400);
    expect(err.message).toBe("Bad Request");
  });
});

describe("ForbiddenError", () => {
  test("creates 403 error with default message", () => {
    const err = new ForbiddenError();
    expect(err.status).toBe(403);
    expect(err.message).toBe("Forbidden");
  });
});
```

**Step 2: Run error tests**

Run: `cd backend && npm test -- expressError.test.js`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add backend/expressError.test.js
git commit -m "test: add ExpressError class tests"
```

---

### Task 13: Seating Chart History Tests

**Files:**
- Create: `frontend/src/seating/SeatingChartHistory.test.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import SeatingChartHistory from './SeatingChartHistory';
import SeatingApi from '../api';

vi.mock('../api');

const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
};

describe('SeatingChartHistory', () => {
  const mockHistory = [
    { id: 1, createdAt: '2024-01-15T10:00:00Z', name: 'Chart 1' },
    { id: 2, createdAt: '2024-01-16T10:00:00Z', name: 'Chart 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SeatingApi.getSeatingChartHistory.mockResolvedValue(mockHistory);
  });

  it('renders history list', async () => {
    renderWithProviders(
      <SeatingChartHistory username="test" classroomId="1" />
    );

    await waitFor(() => {
      expect(screen.getByText('Chart 1')).toBeInTheDocument();
      expect(screen.getByText('Chart 2')).toBeInTheDocument();
    });
  });

  it('shows empty state when no history', async () => {
    SeatingApi.getSeatingChartHistory.mockResolvedValue([]);

    renderWithProviders(
      <SeatingChartHistory username="test" classroomId="1" />
    );

    await waitFor(() => {
      expect(screen.getByText(/no history/i)).toBeInTheDocument();
    });
  });

  it('allows restoring previous chart', async () => {
    const onRestore = vi.fn();
    renderWithProviders(
      <SeatingChartHistory
        username="test"
        classroomId="1"
        onRestore={onRestore}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Chart 1')).toBeInTheDocument();
    });

    const restoreButtons = screen.getAllByRole('button', { name: /restore/i });
    fireEvent.click(restoreButtons[0]);

    expect(onRestore).toHaveBeenCalledWith(mockHistory[0]);
  });
});
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- SeatingChartHistory.test.jsx`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add frontend/src/seating/SeatingChartHistory.test.jsx
git commit -m "test: add SeatingChartHistory tests"
```

---

### Task 14: ClassroomList Tests

**Files:**
- Create: `frontend/src/classroom/ClassroomList.test.jsx`

**Step 1: Create test file**

```javascript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import ClassroomList from './ClassroomList';
import SeatingApi from '../api';

vi.mock('../api');

const renderWithProviders = (ui) => {
  return render(
    <ChakraProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ChakraProvider>
  );
};

describe('ClassroomList', () => {
  const mockClassrooms = [
    { id: 1, classroomName: 'Room 101', rows: 5, columns: 6 },
    { id: 2, classroomName: 'Room 102', rows: 4, columns: 5 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    SeatingApi.getClassrooms.mockResolvedValue(mockClassrooms);
  });

  it('renders classrooms list', async () => {
    renderWithProviders(<ClassroomList username="test" />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
      expect(screen.getByText('Room 102')).toBeInTheDocument();
    });
  });

  it('shows empty state when no classrooms', async () => {
    SeatingApi.getClassrooms.mockResolvedValue([]);

    renderWithProviders(<ClassroomList username="test" />);

    await waitFor(() => {
      expect(screen.getByText(/no classrooms/i)).toBeInTheDocument();
    });
  });

  it('displays classroom dimensions', async () => {
    renderWithProviders(<ClassroomList username="test" />);

    await waitFor(() => {
      expect(screen.getByText(/5.*6/)).toBeInTheDocument(); // 5x6
      expect(screen.getByText(/4.*5/)).toBeInTheDocument(); // 4x5
    });
  });

  it('deletes classroom on confirm', async () => {
    SeatingApi.deleteClassroom.mockResolvedValue({ deleted: 1 });

    renderWithProviders(<ClassroomList username="test" />);

    await waitFor(() => {
      expect(screen.getByText('Room 101')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(SeatingApi.deleteClassroom).toHaveBeenCalledWith('test', 1);
    });
  });
});
```

**Step 2: Run tests**

Run: `cd frontend && npm test -- ClassroomList.test.jsx`
Expected: All tests PASS

**Step 3: Commit**

```bash
git add frontend/src/classroom/ClassroomList.test.jsx
git commit -m "test: add ClassroomList tests"
```

---

### Task 15: Run Full Test Suite & Coverage Report

**Step 1: Run all backend tests**

Run: `cd backend && npm test -- --coverage`
Expected: All tests PASS, coverage > 80%

**Step 2: Run all frontend tests**

Run: `cd frontend && npm test -- --coverage`
Expected: All tests PASS, coverage > 80%

**Step 3: Document any remaining gaps**

Create a summary of test coverage and any remaining gaps for follow-up.

**Step 4: Final commit**

```bash
git add -A
git commit -m "test: comprehensive test suite complete"
```

---

## Summary

| Phase | Tasks | Coverage Area |
|-------|-------|---------------|
| 1 | 1-3 | Backend models & routes |
| 2 | 4-6 | Frontend API & contexts |
| 3 | 7-10 | React components |
| 4 | 11-15 | Integration & edge cases |

**Total Tasks:** 15
**Estimated Files Created:** 17 test files
**Target Coverage:** 90%+
