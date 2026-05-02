const router = require('express').Router();
const passport = require('../middleware/passport');

// Start GitHub OAuth flow
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'repo'] }));

// GitHub OAuth callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: `${process.env.CLIENT_URL}?error=auth_failed` }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

// Get current session user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  const { id, username, displayName, avatarUrl, email, profile_url, repo_config, scheduler_config, stats, created_at } = req.user;
  res.json({ 
    user: { 
      _id: id, 
      username, 
      displayName, 
      avatarUrl, 
      email, 
      profileUrl: profile_url, 
      repoConfig: repo_config, 
      schedulerConfig: scheduler_config, 
      stats, 
      createdAt: created_at 
    } 
  });
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => res.json({ success: true }));
  });
});

module.exports = router;
