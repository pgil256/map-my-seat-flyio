# Map My Seat

A classroom seating chart builder for teachers. Design your room layout, import your student roster, and generate optimized seating assignments in seconds.

## Features

- **Visual Layout Editor** -- Click-to-place desks (single or paired), drag-and-drop furniture (bookshelves, rugs, whiteboards, doors), and resize the grid up to 12x12
- **CSV Import** -- Drag-and-drop your gradebook CSV to import students with automatic performance level detection based on scores
- **Smart Seating Strategies** -- Random, alphabetical, mixed (pair high with low performers), or grouped by performance level
- **Seat Locking & Swapping** -- Lock individual seats, then reshuffle the rest. Click two seats in swap mode to exchange students
- **Print-Ready Output** -- One-click print with a clean layout including legend and roster list
- **Undo/Redo** -- Full undo/redo history for layout changes (Ctrl+Z / Ctrl+Y)
- **Layout Import/Export** -- Save and share classroom layouts as JSON files
- **Persistent State** -- Your layout and roster are saved to localStorage automatically
- **Demo Mode** -- Try a fully loaded classroom with 24 students to explore all features

## Tech Stack

- **React 19** with TypeScript
- **Vite** for development and builds
- **Tailwind CSS v4** for styling
- **Vitest** + React Testing Library for tests

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
  App.tsx                    # Main app with welcome screen, stepper, and state management
  components/
    ClassroomEditor.tsx      # Visual grid editor for placing desks and furniture
    GradebookManager.tsx     # Student roster management with CSV import
    SeatingChart.tsx         # Chart generation, seat swapping, and print output
    ErrorBoundary.tsx        # Error boundary for graceful error handling
  utils/
    seatingAlgorithm.ts      # Seating assignment strategies and CSV parser
    helpers.ts               # Shared utilities (avatars, display names, furniture config)
  types.ts                   # TypeScript interfaces
```

## License

MIT
