# Map-My-Seat Improvement Plan

Comprehensive plan to improve user experience, add features, enhance technical quality, and strengthen portfolio appeal.

---

## Phase 1: Technical Foundation

Establish a solid base before adding features. These improvements reduce bugs and make future work easier.

### 1.1 Add TypeScript

Convert the codebase to TypeScript for better IDE support, catch errors at compile time, and demonstrate modern practices.

- [ ] Add TypeScript config to frontend (`tsconfig.json`)
- [ ] Add TypeScript config to backend (`tsconfig.json`)
- [ ] Convert frontend files incrementally (`.jsx` → `.tsx`)
- [ ] Convert backend files incrementally (`.js` → `.ts`)
- [ ] Add shared types for API request/response shapes

### 1.2 API Error Handling

Standardize error handling across frontend and backend.

- [ ] Create consistent error response format: `{ error: string, code: string, details?: object }`
- [ ] Add global error boundary in React
- [ ] Add toast notifications for API errors (replace console.error)
- [ ] Add request retry logic for transient failures

### 1.3 Testing Improvements

Current tests exist but coverage is unclear.

- [ ] Add test coverage reporting (`jest --coverage`)
- [ ] Add integration tests for critical user flows (signup → create period → add students → generate chart)
- [ ] Add E2E tests with Playwright for key workflows
- [ ] Set up CI pipeline (GitHub Actions) to run tests on PR

### 1.4 Database Improvements

- [ ] Add database indexes for frequently queried columns (`user_username`, `period_id`)
- [ ] Add cascading deletes (deleting a period should delete its students)
- [ ] Add `created_at` and `updated_at` timestamps to all tables

---

## Phase 2: User Experience

Make the app faster and more intuitive for teachers.

### 2.1 Responsive Design / Mobile Support

Teachers often use tablets in classrooms.

- [ ] Audit all pages for mobile breakpoints
- [ ] Make classroom grid touch-friendly (larger tap targets)
- [ ] Add mobile navigation (hamburger menu)
- [ ] Test on iPad and common tablet sizes

### 2.2 Onboarding Flow

New users currently land on a blank dashboard.

- [ ] Add welcome modal for first-time users explaining the workflow
- [ ] Add empty state illustrations with CTAs ("Add your first period")
- [ ] Add progress indicator showing setup completion (periods → students → classroom → chart)

### 2.3 Form UX Improvements

- [ ] Add inline validation with helpful error messages
- [ ] Add autosave for classroom layout (debounced)
- [ ] Add keyboard shortcuts (Enter to submit, Escape to cancel)
- [ ] Add loading states and optimistic UI updates
- [ ] Preserve form state on navigation (warn before leaving unsaved changes)

### 2.4 Classroom Designer Improvements

The current 12x12 grid is functional but basic.

- [ ] Add undo/redo for layout changes
- [ ] Add preset layouts (rows, groups, U-shape, pods)
- [ ] Add drag-and-drop to move desks
- [ ] Add zoom controls for large layouts
- [ ] Show desk count and capacity warnings

### 2.5 Seating Chart Improvements

- [ ] Add drag-and-drop to manually swap students after generation
- [ ] Add print-optimized CSS (hide buttons, maximize chart)
- [ ] Add multiple export formats (PDF, PNG, CSV)
- [ ] Show student accommodations as visual indicators (icons/colors)

---

## Phase 3: New Features

Capabilities teachers have asked for or would expect.

### 3.1 Multiple Classrooms

Currently each user has one classroom. Teachers often teach in different rooms.

- [ ] Update schema: classrooms have `name` field, remove unique constraint on `user_username`
- [ ] Add classroom list view with create/edit/delete
- [ ] Link seating charts to specific classroom
- [ ] Add classroom selector when generating charts

### 3.2 Student Separation/Pairing Rules

Teachers need to keep certain students apart or together.

- [ ] Add `student_constraints` table: `student_id_1`, `student_id_2`, `constraint_type` (separate/pair)
- [ ] Add UI to define "keep apart" and "seat together" pairs
- [ ] Update seating algorithm to respect constraints
- [ ] Show constraint violations as warnings

### 3.3 Seating Chart History

Teachers want to compare charts and restore previous arrangements.

- [ ] Add `seating_charts` table to persist generated charts (already exists but underutilized)
- [ ] Add chart list view with timestamps and preview
- [ ] Add "restore" and "duplicate" actions
- [ ] Add naming/labeling for charts ("Week 1", "After winter break")

### 3.4 Bulk Student Management

- [ ] Improve CSV import with column mapping UI
- [ ] Add CSV export for student rosters
- [ ] Add bulk edit (select multiple → change accommodation flags)
- [ ] Add bulk delete with confirmation

### 3.5 Advanced Seating Algorithms

- [ ] Add "balanced groups" mode (mix high/low performers in table groups)
- [ ] Add "vision priority" (students with vision needs near board)
- [ ] Add "behavior separation" (auto-separate flagged students)
- [ ] Add weighting/priority system for multiple constraints

### 3.6 Collaboration Features (Stretch)

- [ ] Add read-only share links for seating charts
- [ ] Add co-teacher access (multiple users per classroom)
- [ ] Add comments/notes on individual seats

---

## Phase 4: Portfolio Polish

Make the app impressive for demos and job applications.

### 4.1 Landing Page

Current home page is minimal.

- [ ] Add hero section with screenshot/animation of the app
- [ ] Add feature highlights with icons
- [ ] Add "How it works" section (3-step visual)
- [ ] Add testimonials section (can be placeholder)
- [ ] Add footer with links

### 4.2 Demo Mode

Let visitors try the app without signing up.

- [ ] Add "Try Demo" button that creates temporary session
- [ ] Pre-populate demo account with sample data (periods, students, classroom)
- [ ] Add banner indicating demo mode
- [ ] Auto-expire demo sessions after 24 hours

### 4.3 Visual Design Upgrade

- [ ] Define consistent color palette and spacing scale
- [ ] Add subtle animations (page transitions, button feedback)
- [ ] Improve typography hierarchy
- [ ] Add dark mode toggle
- [ ] Add app logo/branding

### 4.4 Performance & Polish

- [ ] Add loading skeletons instead of spinners
- [ ] Implement code splitting (lazy load routes)
- [ ] Add PWA support (installable, offline indicator)
- [ ] Optimize bundle size (analyze and remove unused deps)
- [ ] Add Lighthouse CI to maintain performance scores

### 4.5 Documentation & README

- [ ] Add screenshots/GIFs to README
- [ ] Add architecture diagram
- [ ] Add API documentation (OpenAPI/Swagger)
- [ ] Add contributing guide
- [ ] Add license file

---

## Implementation Order

Recommended sequence to maximize value while building incrementally:

| Priority | Items | Rationale |
|----------|-------|-----------|
| **1. Quick wins** | 2.2 Onboarding, 2.3 Form UX, 4.1 Landing page | Immediate visual impact, low effort |
| **2. Foundation** | 1.2 Error handling, 1.4 Database improvements | Prevents bugs in new features |
| **3. Core features** | 3.1 Multiple classrooms, 3.2 Separation rules | Most requested teacher needs |
| **4. TypeScript** | 1.1 TypeScript migration | Do before adding more code |
| **5. Polish** | 2.4 Classroom designer, 2.5 Seating chart UX | Refinement of existing features |
| **6. Portfolio** | 4.2 Demo mode, 4.3 Visual design | Makes demos impressive |
| **7. Advanced** | 3.5 Advanced algorithms, 3.6 Collaboration | Differentiators |
| **8. Testing** | 1.3 Testing improvements, E2E | Ensures stability |

---

## Technical Notes

### Database Schema Additions

```sql
-- Student constraints for separation/pairing
CREATE TABLE student_constraints (
  constraint_id SERIAL PRIMARY KEY,
  student_id_1 INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  student_id_2 INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  constraint_type VARCHAR(10) CHECK (constraint_type IN ('separate', 'pair')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add timestamps to existing tables
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
-- (repeat for periods, students, classrooms, seating_charts)

-- Add name to classrooms for multiple classroom support
ALTER TABLE classrooms ADD COLUMN name VARCHAR(100) DEFAULT 'My Classroom';
ALTER TABLE classrooms DROP CONSTRAINT classrooms_user_username_key; -- if exists
```

### Key Dependencies to Add

```json
{
  "frontend": {
    "@tanstack/react-query": "data fetching and caching",
    "framer-motion": "animations (already installed)",
    "react-beautiful-dnd": "drag and drop",
    "zustand": "lightweight state management (optional)"
  },
  "backend": {
    "swagger-jsdoc": "API documentation",
    "swagger-ui-express": "API docs UI"
  },
  "dev": {
    "typescript": "type safety",
    "@playwright/test": "E2E testing",
    "husky": "git hooks for linting"
  }
}
```

---

## Success Metrics

- **UX**: Time to generate first seating chart < 5 minutes for new user
- **Features**: Support 90% of common teacher seating scenarios
- **Technical**: 80%+ test coverage, 0 TypeScript errors, Lighthouse score > 90
- **Portfolio**: Demo mode completion rate, GitHub stars, recruiter feedback
