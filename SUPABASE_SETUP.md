# Supabase Database Setup for Map-my-seat

## Step 1: Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign in with GitHub (recommended) or email
4. Click "New project"
5. Fill in:
   - **Project name**: `map-my-seat`
   - **Database Password**: Generate a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier works fine
6. Click "Create new project" (takes ~2 minutes)

## Step 2: Get Database Connection String

1. In Supabase Dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the password you created in Step 1

## Step 3: Configure Connection for Vercel

For production use, modify the connection string:
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
```

Note the changes:
- Port changed from `5432` to `6543` (for connection pooling)
- Added `?pgbouncer=true&connection_limit=1` (required for serverless)

## Step 4: Run Database Migrations

### Option A: Using Supabase SQL Editor (Easiest)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste each migration file content in order:

**Migration 1: Create Users Table**
```sql
-- From backend/migrations/20230831185000_users.js
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**Migration 2: Create Periods Table**
```sql
-- From backend/migrations/20230831185128_periods.js
CREATE TABLE periods (
    id SERIAL PRIMARY KEY,
    period_name VARCHAR(255) NOT NULL,
    period_number INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_periods_user_id ON periods(user_id);
```

**Migration 3: Create Students Table**
```sql
-- From backend/migrations/20230831185147_students.js
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_initial VARCHAR(1),
    grade_level INTEGER,
    period_id INTEGER REFERENCES periods(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    iep BOOLEAN DEFAULT FALSE,
    english_learner BOOLEAN DEFAULT FALSE,
    sep BOOLEAN DEFAULT FALSE,
    behavior_notes TEXT,
    academic_notes TEXT,
    other_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_period_id ON students(period_id);
CREATE INDEX idx_students_user_id ON students(user_id);
```

**Migration 4: Create Classrooms Table**
```sql
-- From backend/migrations/20230831185209_classrooms.js
CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    classroom_name VARCHAR(255),
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rows INTEGER NOT NULL,
    columns INTEGER NOT NULL,
    desk_layout JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classrooms_user_id ON classrooms(user_id);
```

**Migration 5: Create Seating Charts Table**
```sql
-- From backend/migrations/20230831185235_seating_charts.js
CREATE TABLE seating_charts (
    id SERIAL PRIMARY KEY,
    chart_name VARCHAR(255),
    period_id INTEGER REFERENCES periods(id) ON DELETE CASCADE,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    seating_arrangement JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seating_charts_period_id ON seating_charts(period_id);
CREATE INDEX idx_seating_charts_classroom_id ON seating_charts(classroom_id);
CREATE INDEX idx_seating_charts_user_id ON seating_charts(user_id);
```

4. Run each query by clicking "Run" or pressing `Cmd/Ctrl + Enter`

### Option B: Using Local Knex Migrations

1. Clone your project locally
2. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Create `.env` file in backend directory:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
4. Run migrations:
   ```bash
   npx knex migrate:latest
   ```

## Step 5: Set Up Row Level Security (Optional but Recommended)

In Supabase SQL Editor, run:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_charts ENABLE ROW LEVEL SECURITY;

-- Create policies (example for users table)
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid()::text = id::text);
```

## Step 6: Configure Vercel Environment Variables

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true&connection_limit=1
JWT_SECRET=your-secure-random-string-here
NODE_ENV=production
```

## Step 7: Test Database Connection

Create a test file `test-db.js`:
```javascript
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function testConnection() {
  try {
    const result = await db.raw('SELECT NOW()');
    console.log('Database connected:', result.rows[0]);
    await db.destroy();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
```

Run with:
```bash
DATABASE_URL="your-connection-string" node test-db.js
```

## Troubleshooting

### Connection Timeout
- Ensure you're using port `6543` for serverless (not `5432`)
- Add `?pgbouncer=true&connection_limit=1` to connection string

### SSL Certificate Error
- Add `?sslmode=require` to connection string
- For local development, use `?sslmode=disable`

### Permission Denied
- Check if RLS is enabled without proper policies
- Temporarily disable RLS for testing:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```

### Migration Fails
- Ensure tables don't already exist
- Check foreign key constraints order
- Run migrations one at a time in order

## Database Management Tips

1. **Backup**: Supabase automatically backs up your database daily
2. **Monitoring**: Use Supabase Dashboard → Database → Query Performance
3. **Connection Pooling**: Always use PgBouncer (port 6543) for serverless
4. **Rate Limiting**: Free tier has 500 concurrent connections limit

## Next Steps

1. Test your connection with the test script above
2. Deploy to Vercel with the connection string
3. Monitor database performance in Supabase Dashboard
4. Consider upgrading to Pro plan for production use ($25/month)

## Useful Supabase Features

- **SQL Editor**: Write and save queries
- **Table Editor**: Visual interface for data management
- **Database Functions**: Create stored procedures
- **Realtime**: Subscribe to database changes (optional feature)
- **Storage**: File storage for profile pictures, etc.