# Parallel Test Workstreams

Run these workstreams in separate Claude CLI sessions simultaneously.

**Note:** First fix the `_testCommon.js` schema issue (see Workstream 0), then launch parallel workstreams.

---

## Workstream 0: Fix Test Infrastructure (DO FIRST)

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

Fix `backend/models/_testCommon.js` - the classroom column names don't match the schema:
- `randomize` → `seat_randomize`
- `ESE_is_priority` → `ese_is_priority`
- `ELL_is_priority` → `ell_is_priority`
- `fivezerofour_is_priority` → `fivezerofour_is_priority`
- `EBD_is_priority` → `ebd_is_priority`

Also ensure `DELETE FROM student_constraints` is added before `DELETE FROM students`.

Verify: `cd backend && npm test -- student.test.js`

---

## Workstream 1: Backend Models & Routes

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. ✅ StudentConstraint Model Tests - `backend/models/studentConstraint.test.js` (created, needs infra fix)
2. Classrooms Route Tests - `backend/routes/classrooms.test.js`
3. Constraints Route Tests - `backend/routes/constraints.test.js`
4. ExpressError Tests - `backend/expressError.test.js`

### Commands:
```bash
cd backend && npm test -- models/studentConstraint.test.js
cd backend && npm test -- routes/classrooms.test.js
cd backend && npm test -- routes/constraints.test.js
cd backend && npm test -- expressError.test.js
```

---

## Workstream 2: Frontend API & Context

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. API Client Tests - `frontend/src/api.test.js`
2. UserContext Tests - `frontend/src/auth/UserContext.test.jsx`
3. ToastContext Tests - `frontend/src/common/ToastContext.test.jsx`

### Commands:
```bash
cd frontend && npm test -- api.test.js
cd frontend && npm test -- UserContext.test.jsx
cd frontend && npm test -- ToastContext.test.jsx
```

---

## Workstream 3: Frontend Hooks

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. useAutosave Tests - `frontend/src/hooks/useAutosave.test.js`
2. useFormValidation Tests - `frontend/src/hooks/useFormValidation.test.js`
3. useKeyboardShortcuts Tests - `frontend/src/hooks/useKeyboardShortcuts.test.js`

### Commands:
```bash
cd frontend && npm test -- hooks/
```

---

## Workstream 4: Frontend Student Components

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. StudentConstraints Tests - `frontend/src/students/StudentConstraints.test.jsx`
2. GradebookUploader Tests - `frontend/src/students/GradebookUploader.test.jsx`

### Commands:
```bash
cd frontend && npm test -- students/
```

---

## Workstream 5: Frontend Navigation & Common Components

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. MobileNav Tests - `frontend/src/navigation/MobileNav.test.jsx`
2. ErrorBoundary Tests - `frontend/src/common/ErrorBoundary.test.jsx`
3. EmptyState Tests - `frontend/src/common/EmptyState.test.jsx`

### Commands:
```bash
cd frontend && npm test -- navigation/
cd frontend && npm test -- common/ErrorBoundary.test.jsx
cd frontend && npm test -- common/EmptyState.test.jsx
```

---

## Workstream 6: Frontend Classroom & Seating Components

**Session command:** `cd /home/gilhooleyp/projects/map-my-seat`

### Tasks:
1. ClassroomList Tests - `frontend/src/classroom/ClassroomList.test.jsx`
2. SeatingChartHistory Tests - `frontend/src/seating/SeatingChartHistory.test.jsx`

### Commands:
```bash
cd frontend && npm test -- classroom/ClassroomList.test.jsx
cd frontend && npm test -- seating/SeatingChartHistory.test.jsx
```

---

## Dependency Graph

```
Workstream 0 (Infrastructure Fix)
        |
        v
   +---------+---------+---------+---------+---------+
   |         |         |         |         |         |
   v         v         v         v         v         v
  WS1      WS2       WS3       WS4       WS5       WS6
Backend   API/Ctx   Hooks    Students   Nav/Common Classroom
        \         |         |         |         /
         \        |         |         |        /
          \       |         |         |       /
           \      |         |         |      /
            v     v         v         v     v
              Final: Run full test suite
                    npm test (both dirs)
```

---

## Session Launch Commands

After Workstream 0 completes, launch these in separate terminals:

```bash
# Terminal 1 - Backend
claude "Execute Workstream 1 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."

# Terminal 2 - API/Context
claude "Execute Workstream 2 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."

# Terminal 3 - Hooks
claude "Execute Workstream 3 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."

# Terminal 4 - Student Components
claude "Execute Workstream 4 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."

# Terminal 5 - Nav/Common
claude "Execute Workstream 5 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."

# Terminal 6 - Classroom/Seating
claude "Execute Workstream 6 from docs/plans/parallel-test-workstreams.md. Create the test files, run tests, fix issues, commit."
```

---

## Merge Strategy

Each workstream works on different files, so merges should be clean. After all complete:

```bash
git log --oneline -20  # verify all commits
npm test               # run full suite
```
