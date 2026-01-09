# Map-My-Seat Improvement Plan

**Created:** 2026-01-08
**Approach:** Sequential Phases (Technical Quality → UX → Features → Integrations)

---

## Phase 1: Technical Quality

**Goal:** Solidify the foundation before building on it.

### 1.1 Complete Test Coverage
- Complete the untracked test files (`GradebookUploader.test.jsx`, `StudentConstraints.test.jsx`)
- Add integration tests for critical user flows (signup → create period → add students → generate chart)
- Add accessibility tests using jest-axe
- Target 90%+ coverage across backend and frontend

### 1.2 Fix Known Issues
- Resolve database column naming inconsistencies in test helpers (`seat_randomize`, `ese_is_priority`)
- Standardize error response formatting across all routes
- Add missing seating chart CRUD routes (model exists but routes incomplete)

### 1.3 Improve Architecture
- Add request validation middleware that returns consistent error shapes
- Implement proper database connection pooling for production
- Add structured logging (request IDs, timing, errors)
- Create a health check endpoint for monitoring

### 1.4 Deployment & DevOps
- Set up CI/CD pipeline (run tests on PR, deploy on merge)
- Configure environment-specific database connections
- Add database backup strategy
- Set up error tracking (Sentry or similar)

**Exit criteria:** All tests pass, 90%+ coverage, CI/CD running, production monitoring in place.

---

## Phase 2: User Experience

**Goal:** Make current features delightful and intuitive.

### 2.1 Seating Chart Interaction
- Add drag-and-drop to manually swap students between seats
- Show student details on hover (grade, flags like ESE/ELL/504)
- Add undo/redo for manual adjustments
- Visual indicators for constraint violations (students who should be separated are adjacent)

### 2.2 Student Management
- Improve CSV import with preview step, column mapping, and error highlighting
- Add bulk edit capabilities (select multiple students, update flags)
- Show validation errors inline rather than as alerts
- Add search/filter for large class rosters

### 2.3 Classroom Layout
- Visual drag-and-drop classroom designer instead of just rows/columns
- Support irregular layouts (L-shaped rooms, grouped tables, lab benches)
- Save layout templates for reuse across classrooms
- Add "front of room" indicator for priority seating context

### 2.4 Mobile Experience
- Responsive seating chart that works on tablets (common in classrooms)
- Touch-friendly drag-and-drop
- Quick actions for common tasks (regenerate, export PDF)

### 2.5 General Polish
- Add loading states and skeleton screens
- Improve empty states with helpful onboarding prompts
- Add keyboard shortcuts for power users
- Dark mode support

**Exit criteria:** Drag-and-drop working, CSV import redesigned, mobile-friendly, consistent loading/empty states.

---

## Phase 3: New Features

**Goal:** Expand capabilities to solve more teacher problems.

### 3.1 Advanced Seating Algorithms
- **Behavior-based placement:** Separate known troublemakers, cluster focused students
- **Academic grouping:** Create mixed-ability or same-ability table groups
- **Social dynamics:** Input friend/conflict relationships, optimize for learning environment
- **Vision/hearing priority:** Place students with needs near board/speaker

### 3.2 Multiple Chart Management
- Save multiple seating arrangements per classroom (group work layout vs. test layout)
- Quick switch between saved arrangements
- Compare two arrangements side-by-side
- Duplicate and modify existing charts

### 3.3 Student Groups & Table Teams
- Define table groups (4-6 students working together)
- Auto-generate balanced groups based on criteria (mixed gender, mixed ability)
- Assign group names/numbers for easy reference
- Track group composition history

### 3.4 Analytics & Insights
- Seating history per student (where have they sat over time?)
- Constraint satisfaction reporting (how well does this chart meet your preferences?)
- Class composition summary (gender balance, ESE/ELL distribution)
- Export data for IEP meetings or parent conferences

### 3.5 Collaboration
- Share read-only chart view with substitute teachers (via link)
- Co-teacher access to same classrooms
- Admin view across all teachers in a school

**Exit criteria:** At least 2 new algorithms, multiple charts per room, group management, basic analytics dashboard.

---

## Phase 4: Integrations

**Goal:** Connect to where teachers already work, reducing manual data entry.

### 4.1 Student Information System (SIS) Import
- **Google Classroom:** Pull class rosters and student names automatically
- **Clever:** Single sign-on and roster sync (covers many SIS platforms)
- **ClassLink:** Alternative SSO and roster provider
- **CSV enhancement:** Support common export formats from PowerSchool, Infinite Campus, Skyward

### 4.2 Learning Management System (LMS) Sync
- Push seating charts to Google Classroom as announcements
- Embed seating chart view in Canvas or Schoology
- Sync student lists bidirectionally

### 4.3 Export Enhancements
- Export to Google Slides (editable seating chart template)
- Export to PowerPoint
- Print-optimized layouts (multiple charts per page for sub folders)
- Export student groups as formatted lists

### 4.4 Calendar Integration
- Google Calendar: Show which seating chart is active for today
- Schedule automatic chart rotations (new random chart every Monday)
- Remind teachers to update charts at grading periods

### 4.5 Authentication Expansion
- Google SSO (most schools use Google Workspace)
- Microsoft SSO (for Microsoft 365 schools)
- Clever SSO (instant access for supported districts)

**Exit criteria:** Google Classroom roster import working, Google SSO available, enhanced export formats, at least one LMS embed option.

---

## Summary

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Technical Quality | 90%+ test coverage, CI/CD, monitoring |
| 2 | User Experience | Drag-and-drop, better CSV import, mobile support |
| 3 | New Features | Advanced algorithms, groups, analytics |
| 4 | Integrations | Google Classroom, SSO, enhanced exports |

Each phase builds on the previous, creating a solid foundation before adding complexity.
