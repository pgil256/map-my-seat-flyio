# PROJECT_DOCS.md

This file provides development guidelines and documentation for this repository.

**COMMIT POLICY**: All code should follow standard best practices and documentation guidelines.

## Commands

### Monorepo Commands (from root)
```bash
# Install all dependencies
npm run install:all

# Development (starts both frontend and backend)
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Database migrations
npm run migrate           # Run latest migrations
npm run migrate:rollback  # Rollback migrations
npm run seed              # Seed database
```

### Backend (Node.js/Express)

```bash
# Development
cd backend
npm install
npm run dev     # Start with nodemon (port 3001)
npm start       # Start production server
npm test        # Run Jest tests

# Database setup (PostgreSQL required)
sudo service postgresql start  # Linux
createdb map_my_seat
npx knex migrate:latest
```

### Frontend (React/Vite)

```bash
# Development
cd frontend
npm install
npm run dev     # Start Vite dev server (port 5173)
npm run build   # Build for production
npm run lint    # ESLint with max warnings 0
npm run preview # Preview production build
```

### Deployment
```bash
# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

## Architecture

### Full-Stack Application

- **Frontend**: React 18.2.0 with Vite, Chakra UI components
- **Backend**: Node.js/Express API with JWT authentication (Vercel Serverless Functions)
- **Database**: PostgreSQL with Knex.js migrations and query builder
- **Deployment**: Optimized for Vercel with serverless functions and edge runtime

### Key Architectural Patterns

#### Authentication Flow

- JWT-based authentication stored in localStorage
- Token passed via Authorization header
- Middleware authenticates all API routes: `backend/middleware/auth.js`
- User context provided app-wide via React Context: `frontend/src/auth/UserContext.jsx`

#### Database Layer

- Knex.js for database abstraction and migrations
- Models in `backend/models/` handle business logic and database operations
- Each model corresponds to a database table with CRUD operations
- Schema validation using JSON Schema files in `backend/schemas/`

#### API Structure

- RESTful routes organized by resource (users, periods, students, classrooms, seating_charts)
- Routes validate input against JSON schemas before processing
- Error handling with custom error classes extending ExpressError

#### Frontend State Management

- UserContext for authentication state
- Local component state for forms and UI
- Custom useLocalStorage hook for persistent data
- API service layer (`frontend/src/api.js`) centralizes backend communication

### Core Domain Model

- **Users**: Teachers who create and manage seating charts
- **Periods**: Class periods/courses taught by a user
- **Students**: Students enrolled in periods
- **Classrooms**: Physical classroom layouts with desk configurations
- **Seating Charts**: Generated arrangements linking students to desks based on preferences

### Testing Strategy

- Jest for both frontend and backend tests
- Test files colocated with source files (\*.test.js/jsx)
- Common test utilities in `_testCommon.js` files
- Backend: Focus on model logic and route authorization
- Frontend: Component rendering and user interaction tests
