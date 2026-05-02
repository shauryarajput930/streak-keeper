const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

// Import your existing server routes and middleware
const passport = require('../server/middleware/passport');
const supabase = require('../server/config/supabase');
const { initAllJobs } = require('../server/services/scheduler');

const app = express();

// ── CORS ─────────────────────────────────────────
app.use(cors({
  origin: true,
  credentials: true,
}));

// ── BODY PARSING ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── SESSION ──────────────────────────────────────
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: false, // Netlify handles HTTPS
    httpOnly: true,
    sameSite: 'lax',
  },
}));

// ── PASSPORT ─────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ── ROUTES ───────────────────────────────────────
app.use('/.netlify/functions/api/auth', require('../server/routes/auth'));
app.use('/.netlify/functions/api/user', require('../server/routes/user'));

// ── HEALTH CHECK ─────────────────────────────────
app.get('/.netlify/functions/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports.handler = serverless(app);
