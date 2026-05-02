# 🟩 Streak Keeper

A full-stack GitHub streak automation app — multi-user, with GitHub OAuth, Supabase persistence, and a rich React dashboard deployed on Netlify.

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, React Router 6, Recharts        |
| Backend  | Node.js, Express 4 (Serverless Functions) |
| Database | Supabase (PostgreSQL)                     |
| Auth     | Passport.js + GitHub OAuth 2              |
| Deployment| Netlify (Static + Functions)              |
| Sessions | express-session                           |

## Project Structure

```
streak-keeper/
├── server/
│   ├── index.js                # Express entry point
│   ├── config/
│   │   └── supabase.js         # Supabase client configuration
│   ├── models/
│   │   ├── User.js             # User model (Supabase)
│   │   ├── Commit.js           # Commit model (Supabase)
│   │   └── CronLog.js          # Activity logs (Supabase)
│   ├── routes/
│   │   ├── auth.js             # GitHub OAuth routes
│   │   └── user.js             # User API routes
│   ├── middleware/
│   │   ├── passport.js         # GitHub OAuth strategy
│   │   └── auth.js             # Authentication middleware
│   └── services/
│       ├── github.js           # GitHub API integration
│       └── scheduler.js        # Streak scheduling
├── netlify/
│   └── functions/
│       └── api.js              # Serverless function handler
├── client/
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js / index.css
│       ├── context/AuthContext.js
│       ├── utils/api.js
│       ├── components/
│       │   ├── UI.js           # Reusable UI components
│       │   ├── Navbar.js
│       │   └── HeatMap.js      # GitHub-style contribution graph
│       └── pages/
│           ├── Landing.js      # Login page
│           ├── Dashboard.js    # Stats + heatmap + push button
│           ├── Settings.js     # Repo + scheduler config
│           ├── History.js      # Paginated commit history
│           └── Logs.js         # Live cron log stream
├── .env.example
├── package.json
└── README.md
```

## Quick Start

### 1. Clone & install

```bash
git clone https://github.com/shauryarajput930/streak-keeper.git
cd streak-keeper
npm run install:all
```

### 2. Create Supabase Project

1. Go to: https://supabase.com
2. Create new project
3. Run the SQL from `supabase-schema.sql` in Supabase SQL Editor

### 3. Create GitHub OAuth App

Go to: https://github.com/settings/applications/new

| Field            | Value                                    |
|------------------|------------------------------------------|
| Homepage URL     | http://localhost:3000                    |
| Callback URL     | http://localhost:5000/auth/github/callback |

Copy the **Client ID** and **Client Secret**.

### 4. Configure environment

```bash
cp .env.example .env
# Edit .env with your values:
```

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SESSION_SECRET=your_long_random_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
CLIENT_URL=http://localhost:3000
```

### 5. Run in development

```bash
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:3000
```

## 🚀 Deployment

### Netlify (Recommended)

The app is configured for Netlify deployment with serverless functions:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify.com](https://netlify.com)
   - "New site from Git" → Connect GitHub
   - Select your repository
   - Build settings auto-detected from `netlify.toml`

3. **Set Environment Variables**
   In Netlify dashboard → Site settings → Environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SESSION_SECRET=your_strong_session_secret
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_CALLBACK_URL=https://yoursite.netlify.app/.netlify/functions/api/auth/github/callback
   CLIENT_URL=https://yoursite.netlify.app
   ```

4. **Update GitHub OAuth**
   Change callback URL in GitHub OAuth app to your Netlify URL.

## Features

- ✅ **GitHub OAuth Authentication** - Secure login with GitHub
- ✅ **Automatic Streak Commits** - Daily commits to maintain contribution streak
- ✅ **Rich Dashboard** - Stats, heatmap, and commit history
- ✅ **Scheduler** - Configurable daily commit timing
- ✅ **Multi-user Support** - Each user has isolated data
- ✅ **Real-time Updates** - Live commit status and logs
- ✅ **Responsive Design** - Works on desktop and mobile

## Database Schema

The app uses Supabase (PostgreSQL) with the following tables:
- `users` - User profiles, configurations, and statistics
- `commits` - Individual commit records with status tracking
- `cron_logs` - Activity logs with automatic cleanup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own GitHub streak automation needs!

## API Reference

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | /auth/github          | Start GitHub OAuth            |
| GET    | /auth/me              | Get session user              |
| POST   | /auth/logout          | Logout                        |
| PUT    | /api/user/config      | Save repo + scheduler config  |
| POST   | /api/user/push        | Manual push to GitHub         |
| GET    | /api/user/stats       | Stats + heatmap data          |
| GET    | /api/user/commits     | Paginated commit history      |
| GET    | /api/user/logs        | Activity logs (filterable)    |
| GET    | /api/user/repos       | List user's GitHub repos      |
| DELETE | /api/user/account     | Delete account + all data     |

## MongoDB Collections

- **users** — profile, repoConfig, schedulerConfig, stats
- **commits** — one doc per push (status, sha, date, triggeredBy)
- **cronlogs** — timestamped activity log, TTL index = 30 days

## Production Deployment

```bash
# Build React
npm run build

# Set NODE_ENV=production in .env
# Set CLIENT_URL to your domain
# Update GITHUB_CALLBACK_URL to your domain

# Run
npm start
```

The Express server serves the React build automatically in production.
