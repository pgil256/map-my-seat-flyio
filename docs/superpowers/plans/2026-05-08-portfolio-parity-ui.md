# Portfolio Parity UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Map My Seat portfolio-ready by aligning demo/live behavior, tightening the visual system, improving the core teacher workflows, refreshing docs, and verifying the full path.

**Architecture:** Keep the existing React/Vite/Chakra frontend and Express backend. Add small shared demo helpers so the landing preview, demo mode, and seating chart render from one fixture shape. Refine UI through reusable theme/component patterns, then apply them to the workflow screens without changing core solver behavior.

**Tech Stack:** React 18, Chakra UI, React Router v6, Vitest/React Testing Library, Express, Knex, PostgreSQL.

---

### Task 1: Demo And Route Parity

**Files:**
- Modify: `frontend/src/demo/demoData.js`
- Modify: `frontend/src/demo/DemoContext.jsx`
- Modify: `frontend/src/home/HeroPreview.jsx`
- Modify: `frontend/src/home/LandingPage.jsx`
- Modify: `frontend/src/seating/SeatingChart.jsx`
- Modify: `frontend/src/classroom/ClassroomRedirect.jsx`
- Modify: `frontend/src/routes/AppRouter.jsx`
- Modify: `frontend/src/api.js`
- Modify: `backend/models/classroom.js`
- Modify: `backend/routes/classrooms.js`
- Test: focused frontend/backend tests for route/API parity

- [x] Add failing tests that prove classroom id routes load the requested classroom and demo API methods match real API return shapes.
- [x] Implement classroom-by-id API support.
- [x] Make seating chart route params explicit and backwards compatible where tests still expect old URLs.
- [x] Derive landing preview from the same demo fixture used by demo mode.
- [x] Run focused parity tests.

### Task 2: Design System Polish

**Files:**
- Modify: `frontend/src/theme/colors.js`
- Modify: `frontend/src/theme/typography.js`
- Modify: `frontend/src/theme/index.js`
- Modify: `frontend/src/index.css`
- Modify: shared common/navigation components as needed

- [x] Remove negative letter spacing and over-bright teal dominance.
- [x] Standardize professional button/card/input/table variants.
- [x] Keep the product quiet, dense, and work-focused.
- [x] Run focused theme/component tests where present.

### Task 3: Core Workflow Screens

**Files:**
- Modify: `frontend/src/home/Home.jsx`
- Modify: `frontend/src/periods/PeriodForm.jsx`
- Modify: `frontend/src/students/StudentForm.jsx`
- Modify: `frontend/src/students/StudentConstraints.jsx`
- Modify: `frontend/src/classroom/Classroom.jsx`
- Modify: `frontend/src/classroom/ClassroomForm.jsx`
- Modify: `frontend/src/classroom/ClassroomList.jsx`
- Modify: `frontend/src/seating/SeatingChart.jsx`

- [x] Make dashboard next-action driven.
- [x] Convert periods/students from scattered cards to calmer management layouts.
- [x] Make classroom editor a toolbar plus workspace.
- [x] Make seating chart read as the primary product surface with score, rules, and actions.
- [x] Run focused frontend tests after each screen group.

### Task 4: Docs And Screenshots

**Files:**
- Modify: `README.md`
- Modify: `docs/CASE_STUDY.md`
- Replace: `docs/screenshots/*.png` and `docs/screenshots/demo.gif` if browser capture succeeds

- [x] Refresh copy to describe the final demo workflow accurately.
- [x] Capture current local UI screenshots after build/dev server verification.
- [x] Ensure docs no longer point at stale visuals.

### Task 5: Final Verification

**Commands:**
- `npm run test:frontend`
- `npm run test:backend`
- `cd frontend && npm run lint`
- `npm run build`
- Browser verification of landing, demo launch, roster, classroom editor, seating chart, drag-to-swap, re-optimize, print/export where feasible.

- [x] Run every command fresh.
- [x] Inspect failures and fix regressions.
- [x] Report exact verification status.
