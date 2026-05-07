# Deployment

## Local development

**Prerequisites:** Node.js 18+, PostgreSQL (local or hosted).

```bash
git clone <repo-url>
cd map-my-seat
npm run install:all
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/map_my_seat
SECRET_KEY=any-random-string
NODE_ENV=development
PORT=3001
VITE_API_BASE_URL=http://localhost:3001
```

Create the database and run migrations:

```bash
createdb map_my_seat
npm run migrate
```

Start both servers:

```bash
npm run dev
```

Frontend: http://localhost:5173 · Backend: http://localhost:3001

## Production (Vercel + Supabase/Neon)

### 1. Database

Sign up at [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech), create a project, and copy the connection string. For Vercel serverless, use the **pooled connection** (Supabase port `6543` with `?pgbouncer=true&connection_limit=1`, or Neon's pooled string).

Run migrations against the new database:

```bash
DATABASE_URL="<your-connection-string>" npm run migrate
```

### 2. Vercel

```bash
npm i -g vercel
vercel
```

Or import the repo through the Vercel dashboard.

Set environment variables in **Settings → Environment Variables**:

- `DATABASE_URL` — pooled connection string from above
- `SECRET_KEY` — secure random string for JWT signing
- `NODE_ENV` — `production`
- `VITE_API_BASE_URL` — `/api`

## Troubleshooting

- **DB connection fails on Vercel:** make sure you're using the pooled connection (port 6543 for Supabase) with `pgbouncer=true&connection_limit=1`. The default port 5432 will exhaust connections from serverless.
- **SSL error connecting to hosted DB:** append `?sslmode=require` to `DATABASE_URL`.
- **Port already in use locally:** set `PORT` in `.env` for backend; `npm run dev -- --port 5174` for frontend.
- **Migration errors:** `npx knex migrate:status` from `backend/` to inspect; `npx knex migrate:rollback` to undo the last batch.
