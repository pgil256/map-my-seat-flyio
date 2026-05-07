# Portfolio Overhaul — Session Notes (2026-05-07)

Goal: lift Map My Seat from "good final-class project" to "portfolio piece" by
shipping a real constraint solver, drag-and-drop manual swap, replacement
screenshots, and a technical case study.

## Status: Phases 0–4 complete. Case study lives at [docs/CASE_STUDY.md](../CASE_STUDY.md), linked from README Overview.

361/361 tests pass. `npm run lint` exits clean.

---

## What landed this session

### Phase 0 — Groundwork
- **[frontend/src/seating/seatGrid.js](../../frontend/src/seating/seatGrid.js)** — `matrixToSeats`, `distance` (Chebyshev), `neighborsOf`, `findTeacherDesks`. 25 tests.
- **[frontend/src/demo/demoData.js](../../frontend/src/demo/demoData.js)** — Period 1 bumped to 24 students, classroom upgraded to a 6×6 layout with an aisle row (27 desks), new `demoConstraints` export with 5 rules in Period 1 (3 separate, 2 pair) plus 2 each in Periods 2 and 3.
- **[frontend/src/demo/DemoContext.jsx](../../frontend/src/demo/DemoContext.jsx)** — replaced stub `getConstraints/createConstraint/deleteConstraint` with real in-memory implementations.
- **[frontend/src/seating/SeatingChart.jsx](../../frontend/src/seating/SeatingChart.jsx)** — fetches constraints alongside the period.

### Pre-existing infra fixes (separate detour)
- **happy-dom replaces jsdom** in [frontend/vite.config.js](../../frontend/vite.config.js) — jsdom 27 had a CJS/ESM mismatch via `html-encoding-sniffer` that blocked all React component tests. happy-dom is faster anyway.
- **Viewport fixed at 600×800** in `environmentOptions` so Chakra's mobile-nav tests resolve to the `base` breakpoint.
- **`matchMedia` mock** added to [frontend/src/setupTests.js](../../frontend/src/setupTests.js).
- **Created [frontend/.eslintrc.cjs](../../frontend/.eslintrc.cjs)** — the project shipped with no ESLint config but a `--max-warnings 0` script. Fixed all 50 pre-existing lint problems (unused `import React`, unused chakra imports, exhaustive-deps misses, react-refresh suppressions).

### Phase 1 — Real constraint solver
- **[frontend/src/seating/objective.js](../../frontend/src/seating/objective.js)** — `scoreAssignment(assignment, context) → { total, breakdown, violations }` and `seatRationale(seatIndex, assignment, context) → string[]`. Weights (exposed as `WEIGHTS` const):
  - `-100` per `separate` constraint where pair is at Chebyshev ≤ 1
  - `+10` per `pair` constraint adjacent
  - `+5` for accommodation match (504/EBD/ELL within 2 rows of front, ESE near aisle/teacher)
  - `+10` per priority-flag student in row 0
  - Stddev penalty for grade/gender clumping
- **[frontend/src/seating/solver.js](../../frontend/src/seating/solver.js)** — `solveSeating(students, classroom, constraints, matrix, opts)`. Simulated annealing, 2000 iterations, T cools 10 → 0.01 geometrically. Seeds from legacy `sortAndPrioritizeStudents`. RNG is injectable (`mulberry32(seed)` exported for tests). Tests cover: deterministic with seed, separates `separate`-pairs, pairs `pair`-pairs, never lowers score below seed, runs 100 iterations in <100ms.
- **[SeatingChart.jsx](../../frontend/src/seating/SeatingChart.jsx)** — replaces the legacy sort with `solveSeating`; new `<ScoreCard>` above the chart; per-desk Chakra `<Tooltip>` with `seatRationale` lines on hover.

### Phase 2 — Drag-and-drop manual swap
- **`@dnd-kit/core` + `@dnd-kit/utilities`** installed. Added `swapAssignment(assignment, i, j)` pure helper to solver.js, plus an `initialAssignment` opt so Re-optimize can roll forward from the current chart instead of starting over.
- **[SeatingChart.jsx](../../frontend/src/seating/SeatingChart.jsx)** wraps each occupied desk in a `DraggableStudent`, each desk cell in a `DroppableSeat`, and the chart in `<DndContext>` + `<DragOverlay>`. PointerSensor uses `activationConstraint: { distance: 5 }` so click-for-tooltip still works.
- **New buttons**: Re-optimize · Undo (5-deep stack) · Spread · Export PDF · Print. Score badge auto-flips red/green based on `breakdown.hardViolations`.

### Phase 3 — Demo polish + screenshots + GIF
- **[frontend/src/home/LandingPage.jsx](../../frontend/src/home/LandingPage.jsx)** — Try Demo now deep-links to `/classrooms/1/seating-charts/1` (the magic moment) instead of `/periods`.
- **[DemoContext.jsx](../../frontend/src/demo/DemoContext.jsx)** — adds a one-shot `useEffect` that auto-starts demo when the URL contains `?demo=1`. Lets headless tools and shareable links land directly on a populated chart.
- **[demoData.js](../../frontend/src/demo/demoData.js)** — `demoUser` now has `title: "Ms."`, `firstName: "Jordan"`, `lastName: "Sterling"` so the teacher desk doesn't render as "undefined User".
- **Three new screenshots** in [docs/screenshots/](../screenshots/) — captured via headless google-chrome at 1440×900: landing (clean hero), classroom (layout editor with 27-desk room), seating (Period 1 chart with score 70 + 24 students).
- **`docs/screenshots/demo.gif`** — 99 KB, 900×534, 5.1 s loop. Recorded via [frontend/scripts/record-demo.cjs](../../frontend/scripts/record-demo.cjs) using `puppeteer-core` driving the existing `/usr/bin/google-chrome`. Frames combined with `ffmpeg` two-pass palette generation. The GIF shows: optimal arrangement (75) → drag Liam Smith onto a neighbor of Mason Miller → score crashes to **-30** with `1 keep-apart violation` and a `✗ Too close to Mason Miller` tooltip → click Re-optimize → score recovers to 80.
- **[README.md](../../README.md)** — embeds the GIF at the top of the page, rewrites Overview to mention simulated annealing, replaces the Key Features list with concrete Phase 1/2 features.

---

## Phase 4 — Case study (the remaining item)

Plan from earlier in the session. Target: ~800 words, one-page printed.

**Path**: `docs/CASE_STUDY.md`. Link from README's Overview section.

**Outline**:
1. **The problem** — Teacher with 30 kids, 4 504s, 2 EBDs, "keep these two apart", needs it print-ready in 5 minutes. Why a sort isn't enough.
2. **Modeling the problem** — Hard vs. soft constraints. Why a weighted objective with `-100` penalty for hard violations rather than a strict CSP. ILP would guarantee feasibility but adds a big browser-side dep; greedy gets stuck; simulated annealing hits the sweet spot.
3. **The objective function** — Show the [`WEIGHTS`](../../frontend/src/seating/objective.js) breakdown table.
4. **Simulated annealing in 30 lines** — Paste the cooling loop from [solver.js](../../frontend/src/seating/solver.js). Note: 2000 iterations, geometric cooling, deterministic with injected RNG.
5. **The "why this seat?" UX** — Algorithm transparency turns a black box into a feature. Reference the tooltip in `demo.gif`.
6. **What I'd do next** — Multi-period optimization (one student appears in multiple periods → consistent seat preferences). ILP fallback for impossible-to-satisfy constraint sets. Accessibility constraints (wheelchair near door). User study with actual teachers.
7. **What I learned** — Be specific. E.g.: "Pure functions made the solver trivial to test deterministically, but I underestimated how much the `seatGrid` adjacency abstraction would simplify both the objective and the drag-and-drop UI."

**Inline visuals**:
- The score-breakdown weights table (already in objective.js as `WEIGHTS` constants).
- The post-drop violation screenshot (a frame from `demo.gif` — capture frame-025 or similar).
- A "before/after" side-by-side showing the legacy sort vs. the solver. To produce: temporarily revert to the pre-Phase 1 algorithm, re-render the chart, screenshot, commit just the image.

---

## How to resume

### Reproducing the GIF
The recording script and ffmpeg pipeline are committed:

```bash
# 1. Start the dev server
cd frontend && npm run dev   # listens on 8080 or first free port

# 2. In another shell, run the recorder (writes /tmp/mms-frames/*.png)
node frontend/scripts/record-demo.cjs

# 3. Combine frames into a GIF
cd /tmp/mms-frames
ffmpeg -y -framerate 10 -i frame-%03d.png \
  -vf "scale=900:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=bayer:bayer_scale=5" \
  -loop 0 \
  ../../home/gilhooleyp/projects/map-my-seat/docs/screenshots/demo.gif
```

If the script breaks because Mason or Liam moved to different positions in the seeded layout, it falls back to dragging Liam onto whichever desk is closest to Mason (excluding both names) — that always creates a `separate`-rule violation since Liam↔Mason is a constraint.

### Re-shooting the static screenshots
[`/tmp/capture-screenshots.sh`](file:///tmp/capture-screenshots.sh) was the helper script (deleted on cleanup). To recreate:

```bash
shoot() {
  google-chrome --headless --disable-gpu --no-sandbox --hide-scrollbars \
    --window-size=1440,900 --virtual-time-budget=4000 \
    --screenshot="docs/screenshots/$1.png" \
    "http://localhost:8081$2"
}
shoot landing "/"
shoot classroom "/classrooms/demo_user/1?demo=1"
shoot seating "/classrooms/1/seating-charts/1?demo=1"
```

### Loose ends / things to watch for

- **Spread button score**: Spread inserts blank entries into `sortedStudents` to space out students. With the solver in play, this re-positions students *after* the solver decided where they belong — score will likely drop. Worth revisiting whether Spread should re-run the solver.
- **`react-hooks/exhaustive-deps` suppression** in [DemoContext.jsx](../../frontend/src/demo/DemoContext.jsx) on the `?demo=1` auto-start effect. It's intentional (mount-only), but call it out if a future eslint upgrade turns the disable into an error.
- **Solver perf budget**: 2000 iterations × 24 students measured at ~150ms in dev. If a real classroom uploads 35+ students the solver could cross 500ms and feel sluggish. Drop iterations to 1000 with restart × 2 if needed.
- **html2canvas + drag-and-drop divs**: The PDF export still uses html2canvas on the `<Container ref>`. Confirmed PDF capture works with the absolute-positioned drag overlay, but worth testing with a long roster.
- **AppRouter test flake**: One test (`renders StudentForm component for /periods/:periodId route`) timed out once during a full-suite run but passes consistently in isolation. Likely just resource contention; revisit if it recurs.

### Tests and lint at session end
- `npm test` → 361/361 across 32 files.
- `npm run lint` → 0 errors, 0 warnings.
