
---

# Map-my-seat

🌐 Live Demo: [Map-my-seat on Vercel](https://map-my-seat.vercel.app/)

## B. PURPOSE

Map-my-seat aims to provide an innovative solution for K-12 teachers looking for an automated approach to creating seating charts. By inputting student details and classroom preferences, educators can efficiently devise their ideal seating arrangements.

## C. FEATURES

The app focuses heavily on form rendering, with a meticulous organization to ensure user-friendliness:
* **Periods & Students Routes**: Dedicated to CRUD operations, allowing seamless integration of information.
* **Classrooms & Seating Charts**: Featuring dynamic tables that synthesize data from the 'periods' and 'students' routes. These routes enable users to visualize and save seating charts based on classroom design and student seating preferences.
* **Data Management**: Users exclusively populate the app's data, apart from SQL incremental identification. While the design follows RESTful principles—with admin users accessing non-admin data—it's adaptable enough for local use, offering full feature access.

## D. TESTING

Tests are strategically located next to the respective files they evaluate. Ensure you have 'jest' installed. To initiate tests, navigate to the target directory and run:
```bash
npm test
```

## E. FLOW

User Journey:
1. Sign Up
2. Input current course details.
3. Register students for each course.
4. Define classroom layout.
5. Detail seating preferences.
6. Obtain a seating chart tailored for each class.

## F. API

The embedded API is a straightforward node.js application (accessible in the "backend" directory).

## G. TECHNOLOGY

Built on the robust framework of React 18.2.0 and Node 18+, this app is powered by Vite for lightning-fast development. With Chakra UI components managing the aesthetic appeal, the design is as intuitive as it's visually pleasing.

### Quick Start
```bash
# Install all dependencies
npm run install:all

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run development servers
npm run dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173

## H. DEPLOYMENT

This project is optimized for deployment on Vercel with serverless functions:

1. **Database**: Use a cloud PostgreSQL provider (Neon, Supabase, etc.)
2. **Deploy**: Connect your GitHub repo to Vercel
3. **Configure**: Add environment variables in Vercel dashboard
4. **Done**: Your app is live!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## I. VISION

The driving force behind Map-my-seat is the passion to enhance educators' productivity. Crafting a seating chart, often viewed as mundane, can drain valuable time. In an era steered by technology, a solution that streamlines this process was long overdue. And Map-my-seat hopes to fill that void.

## J. PROJECT STRUCTURE

```
map-my-seat/
├── api/               # Vercel serverless functions
├── backend/           # Express API & database models
├── frontend/          # React/Vite application
├── vercel.json        # Vercel deployment configuration
└── package.json       # Monorepo scripts
```
