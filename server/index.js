require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const supabase = require('./config/supabase');
const passport = require('./middleware/passport');
const { initAllJobs } = require('./services/scheduler');

const app = express();

// ── CORS ─────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── BODY PARSING ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SUPABASE CONNECTION TEST ───────────────────────
supabase.from('users').select('count').then(() => {
  console.log('[DB] Supabase connected successfully');
  initAllJobs(); // restore scheduled jobs after restart
}).catch(err => {
  console.error('[DB] Connection error:', err);
  process.exit(1);
});

// ── SESSION ──────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
}));

// ── PASSPORT ─────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── ROUTES ───────────────────────────────────────
app.use('/auth',     require('./routes/auth'));
app.use('/api/user', require('./routes/user'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── SERVE REACT BUILD IN PRODUCTION ──────────────
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

// ── ERROR HANDLER ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
