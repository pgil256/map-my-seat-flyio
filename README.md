# Map My Seat

A classroom seating chart builder for teachers. Design your room layout, import a gradebook CSV, and generate optimized seating assignments in seconds.

**[Live demo →](https://map-my-seat.vercel.app)**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white)

## Features

- **Visual layout editor** — click-to-place desks (single or paired), drag-and-drop furniture (bookshelves, rugs, whiteboards, doors), and resize the grid up to 12×12.
- **CSV import** — drop in a gradebook CSV to import students with automatic performance-level detection from scores.
- **Smart seating strategies** — random, alphabetical, mixed (pair high with low performers), or grouped by performance level.
- **Seat locking & swapping** — lock individual seats, then reshuffle the rest. Enter swap mode to exchange two students.
- **Print-ready output** — one-click print with legend and roster.
- **Undo / redo** — full history for layout changes (Ctrl+Z / Ctrl+Y).
- **Layout import/export** — save and share classroom layouts as JSON.
- **Persistent state** — layout and roster are saved to localStorage automatically.
- **Demo mode** — loaded classroom with 24 students to explore every feature.

## Tech stack

| Layer       | Tech                                                    |
|-------------|---------------------------------------------------------|
| Frontend    | React 19, TypeScript 5.9                                |
| Build tool  | Vite 5                                                  |
| Styling     | Tailwind CSS v4                                         |
| Testing     | Vitest, React Testing Library, jsdom                    |
| Hosting     | Vercel                                                  |

## Getting started

The app lives in [`seating-chart/`](./seating-chart).

```bash
cd seating-chart
npm install
npm run dev        # start the dev server
npm test           # run the Vitest suite
npm run build      # production build
```

## Project structure

```
seating-chart/
├── src/
│   ├── App.tsx                  # welcome screen, stepper, top-level state
│   ├── components/
│   │   ├── ClassroomEditor.tsx  # visual grid editor
│   │   ├── GradebookManager.tsx # roster + CSV import
│   │   ├── SeatingChart.tsx     # chart generation, swap, print
│   │   └── ErrorBoundary.tsx
│   ├── utils/
│   │   ├── seatingAlgorithm.ts  # strategies + CSV parser
│   │   └── helpers.ts
│   └── types.ts
├── public/
├── index.html
└── vite.config.ts
```

## License

MIT
