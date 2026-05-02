# 🟩 Streak Keeper

A full-stack GitHub streak automation app — multi-user, with GitHub OAuth, MongoDB persistence, a daily cron scheduler, and a rich React dashboard.

## Tech Stack

| Layer    | Tech                                      |
|----------|-------------------------------------------|
| Frontend | React 18, React Router 6, Recharts        |
| Backend  | Node.js, Express 4                        |
| Database | MongoDB + Mongoose                        |
| Auth     | Passport.js + GitHub OAuth 2              |
| Scheduler| node-cron (per-user, restored on restart) |
| Sessions | express-session + connect-mongo           |

## Project Structure

```
streak-keeper/
├── server/
│   ├── index.js                # Express entry point
│   ├── models/
│   │   ├── User.js             # User schema (config + stats)
│   │   ├── Commit.js           # Per-push commit record
│   │   └── CronLog.js          # Activity logs (auto-expire 30d)
│   ├── routes/
│   │   ├── auth.js             # /auth/github, /auth/me, /auth/logout
│   │   └── user.js             # /api/user/* (push, config, stats, logs)
│   ├── middleware/
│   │   ├── passport.js         # GitHub OAuth strategy
│   │   └── auth.js             # requireAuth middleware
│   └── services/
│       ├── github.js           # GitHub Contents API push logic
│       └── scheduler.js        # node-cron per-user job manager
├── client/
│   ├── public/index.html
│   └── src/
│       ├── App.js
│       ├── index.js / index.css
│       ├── context/AuthContext.js
│       ├── utils/api.js
│       ├── components/
│       │   ├── UI.js           # Card, Button, Input, Badge, Toast, etc.
│       │   ├── Navbar.js
│       │   └── HeatMap.js      # GitHub-style contribution graph
│       └── pages/
│           ├── Landing.js      # Login / hero page
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
git clone <your-repo-url>
cd streak-keeper
npm run install:all
```

### 2. Create GitHub OAuth App

Go to: https://github.com/settings/applications/new

| Field            | Value                                    |
|------------------|------------------------------------------|
| Homepage URL     | http://localhost:3000                    |
| Callback URL     | http://localhost:5000/auth/github/callback |

Copy the **Client ID** and **Client Secret**.

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your values:
```

```env
MONGODB_URI=mongodb://localhost:27017/streak-keeper
SESSION_SECRET=your_long_random_secret
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 --name mongo mongo:7
```

### 5. Run in development

```bash
npm run dev
# Server: http://localhost:5000
# Client: http://localhost:3000
```

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
