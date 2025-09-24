# Deployment Guide for Map-my-seat on Vercel

## Prerequisites

1. Vercel account (free tier works)
2. PostgreSQL database (Neon, Supabase, or similar)
3. Node.js 18+ installed locally

## Database Setup

### Option 1: Neon (Recommended)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Run migrations:
   ```bash
   cd backend
   DATABASE_URL="your-neon-connection-string" npx knex migrate:latest
   ```

### Option 2: Supabase
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Run migrations as above

## Deployment Steps

### 1. Fork/Clone Repository
```bash
git clone <your-repo-url>
cd map-my-seat
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Environment Variables

Create `.env` file in root:
```env
DATABASE_URL=your-database-connection-string
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

### 4. Deploy to Vercel

#### Via CLI:
```bash
npm i -g vercel
vercel
```

#### Via GitHub:
1. Push code to GitHub
2. Import project in Vercel Dashboard
3. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV` = production

### 5. Configure Environment Variables in Vercel

In Vercel Dashboard > Settings > Environment Variables, add:

- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `NODE_ENV`: production
- `VITE_API_BASE_URL`: /api (for production)

## Local Development

### 1. Setup Database
```bash
# Start PostgreSQL
sudo service postgresql start

# Create database
createdb map_my_seat

# Run migrations
cd backend
npx knex migrate:latest
```

### 2. Start Development Servers
```bash
# From root directory
npm run dev
```

This starts:
- Backend on http://localhost:3001
- Frontend on http://localhost:5173

## API Endpoints

All API endpoints are available at `/api/*`:
- `/api/auth/*` - Authentication
- `/api/users/*` - User management
- `/api/periods/*` - Period management
- `/api/classrooms/*` - Classroom management

## Troubleshooting

### Database Connection Issues
- Ensure DATABASE_URL includes `?sslmode=require` for production
- Check firewall/IP allowlist settings in your database provider

### Build Failures
- Verify Node.js version is 18+
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm run install:all`

### CORS Issues
- Update `CORS_ORIGINS` environment variable
- Ensure frontend uses correct API URL

## Performance Optimization

1. Enable Vercel Edge Functions for faster responses
2. Use database connection pooling
3. Implement caching for frequently accessed data
4. Enable Vercel Analytics for monitoring