# Local Development Setup

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed locally OR Supabase account (for remote DB)
- Git

## Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd map-my-seat

# Install all dependencies (frontend + backend)
npm run install:all

# Or manually:
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Step 2: Database Setup

### Option A: Local PostgreSQL

1. **Start PostgreSQL**:
   ```bash
   # macOS
   brew services start postgresql

   # Linux
   sudo service postgresql start

   # Windows (if installed as service)
   # PostgreSQL should auto-start
   ```

2. **Create Database**:
   ```bash
   # Access PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE map_my_seat;
   CREATE DATABASE map_my_seat_test;  # Optional, for tests
   \q
   ```

3. **Run Migrations**:
   ```bash
   cd backend
   npx knex migrate:latest
   ```

### Option B: Use Supabase (Remote DB)

1. Follow [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to create project
2. Get connection string from Supabase Dashboard
3. Use in `.env` file (see Step 3)

## Step 3: Environment Variables

1. **Create `.env` file in root directory**:
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your settings**:

   For Local PostgreSQL:
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:password@localhost:5432/map_my_seat

   # Or use individual settings
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_NAME=map_my_seat

   # Authentication
   JWT_SECRET=any-random-string-for-local-dev
   SECRET_KEY=same-as-jwt-secret

   # Environment
   NODE_ENV=development
   PORT=3001

   # Frontend API URL
   VITE_API_BASE_URL=http://localhost:3001
   ```

   For Supabase:
   ```env
   # Use connection string from Supabase (use port 5432 for local dev)
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

   JWT_SECRET=any-random-string-for-local-dev
   NODE_ENV=development
   PORT=3001
   VITE_API_BASE_URL=http://localhost:3001
   ```

3. **Create `.env` in backend directory** (optional):
   ```bash
   cd backend
   cp ../.env .env  # Copy from root
   ```

## Step 4: Run Development Servers

### Option A: Run Both Together (Recommended)

From root directory:
```bash
npm run dev
```

This starts:
- Backend API on http://localhost:3001
- Frontend on http://localhost:5173

### Option B: Run Separately

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

## Step 5: Verify Everything Works

1. **Check Backend**:
   - Open http://localhost:3001/api/health
   - Should see: `{"status":"healthy","timestamp":"..."}`

2. **Check Frontend**:
   - Open http://localhost:5173
   - Should see the Map-my-seat homepage

3. **Test Registration**:
   - Click "Sign Up"
   - Create a test account
   - Should redirect to dashboard after successful registration

## Common Issues and Solutions

### Port Already in Use

If port 3001 or 5173 is already in use:

```bash
# Change backend port in .env
PORT=3002

# Change frontend port
cd frontend
npm run dev -- --port 5174
```

### Database Connection Failed

1. **Check PostgreSQL is running**:
   ```bash
   # macOS/Linux
   ps aux | grep postgres

   # Windows
   # Check Services app for PostgreSQL
   ```

2. **Verify credentials**:
   ```bash
   psql -U postgres -d map_my_seat
   ```

3. **Test connection**:
   ```bash
   cd backend
   node -e "require('./db').raw('SELECT NOW()').then(console.log).catch(console.error)"
   ```

### Frontend Can't Connect to Backend

1. **Check CORS settings** in `backend/config.js`:
   ```javascript
   CORS_ORIGINS: ['http://localhost:5173', 'http://localhost:3000']
   ```

2. **Verify API URL** in frontend:
   - Check `frontend/src/api.js`
   - Should use `http://localhost:3001` for local development

3. **Check backend is running**:
   ```bash
   curl http://localhost:3001/api/health
   ```

### Migration Errors

1. **Drop and recreate database**:
   ```bash
   psql -U postgres
   DROP DATABASE map_my_seat;
   CREATE DATABASE map_my_seat;
   \q

   cd backend
   npx knex migrate:latest
   ```

2. **Check migration status**:
   ```bash
   cd backend
   npx knex migrate:status
   ```

3. **Rollback if needed**:
   ```bash
   npx knex migrate:rollback
   ```

## Development Workflow

### Running Tests

```bash
# All tests
npm test

# Backend only
cd backend && npm test

# Frontend only
cd frontend && npm test

# Watch mode
cd backend && npm test -- --watch
```

### Database Commands

```bash
# Run migrations
cd backend
npx knex migrate:latest

# Create new migration
npx knex migrate:make migration_name

# Rollback
npx knex migrate:rollback

# Seed database (if seeds exist)
npx knex seed:run
```

### Debugging

1. **Backend Debugging**:
   - Logs appear in terminal running `npm run dev`
   - Add `console.log()` statements
   - Check `backend/expressError.js` for error handling

2. **Frontend Debugging**:
   - Open browser DevTools (F12)
   - Check Console for errors
   - Network tab to inspect API calls
   - React DevTools extension recommended

3. **Database Debugging**:
   ```bash
   # Connect to database
   psql -U postgres -d map_my_seat

   # List tables
   \dt

   # Describe table
   \d users

   # Query data
   SELECT * FROM users;
   ```

## VS Code Setup (Optional)

1. **Recommended Extensions**:
   - ESLint
   - Prettier
   - PostgreSQL
   - Thunder Client (API testing)

2. **Launch Configuration** (`.vscode/launch.json`):
   ```json
   {
     "version": "0.2.0",
     "configurations": [
       {
         "type": "node",
         "request": "launch",
         "name": "Debug Backend",
         "skipFiles": ["<node_internals>/**"],
         "program": "${workspaceFolder}/backend/server.js",
         "envFile": "${workspaceFolder}/.env"
       }
     ]
   }
   ```

## Next Steps

1. Create a test user account
2. Add some periods/classes
3. Add students
4. Create a classroom layout
5. Generate seating charts

## Useful Commands Reference

```bash
# Install everything
npm run install:all

# Start development
npm run dev

# Build for production
npm run build

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback

# Run tests
npm test

# Clean install (if issues)
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json
npm run install:all
```