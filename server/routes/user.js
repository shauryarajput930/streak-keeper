const router = require('express').Router();
const { requireAuth } = require('../middleware/auth');
const User = require('../models/User');
const Commit = require('../models/Commit');
const CronLog = require('../models/CronLog');
const { pushStreakCommit, getGitHubUserRepos } = require('../services/github');
const { startJobForUser, stopJobForUser, isJobRunning } = require('../services/scheduler');

// ── GET /api/user/repos — list user's GitHub repos
router.get('/repos', requireAuth, async (req, res) => {
  try {
    const repos = await getGitHubUserRepos(req.user.accessToken);
    res.json({ repos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/user/config — save repo + scheduler config
router.put('/config', requireAuth, async (req, res) => {
  try {
    const { repoConfig, schedulerConfig } = req.body;
    const update = {};
    if (repoConfig)     update.repoConfig = repoConfig;
    if (schedulerConfig) update.schedulerConfig = schedulerConfig;

    const user = await User.updateByGithubId(req.user.github_id, update);

    // Restart scheduler if needed
    if (schedulerConfig) {
      if (schedulerConfig.enabled) await startJobForUser(user.id);
      else stopJobForUser(user.id);
    }

    res.json({ user, schedulerRunning: isJobRunning(user.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/user/push — manual push
router.post('/push', requireAuth, async (req, res) => {
  try {
    const user = await User.findByGithubId(req.user.github_id);
    const result = await pushStreakCommit(user.id, 'manual');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/user/commits — paginated commit history
router.get('/commits', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;

    const user = await User.findByGithubId(req.user.github_id);
    const commits = await Commit.findByUserId(user.id, { limit });
    
    // For pagination, we'd need to implement count function
    const total = commits.length; // Simplified for now

    res.json({ commits, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/user/logs — paginated cron logs
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const level = req.query.level;

    const user = await User.findByGithubId(req.user.github_id);
    const logs = await CronLog.findByUserId(user.id, { limit, level });
    
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/user/stats — detailed stats + contribution heatmap
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = await User.findByGithubId(req.user.github_id);

    // Last 84 days heatmap
    const since = new Date(Date.now() - 84 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const commits = await Commit.findByUserIdAndDateRange(user.id, since, today);

    const heatmap = {};
    commits.forEach(c => { 
      if (c.status === 'success') {
        heatmap[c.date] = (heatmap[c.date] || 0) + 1; 
      }
    });

    res.json({ stats: user.stats, heatmap, schedulerRunning: isJobRunning(user.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/user/account — delete everything
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const user = await User.findByGithubId(req.user.github_id);
    stopJobForUser(user.id);
    
    await Promise.all([
      // Note: We'd need to implement bulk delete methods for Commit and CronLog
      // For now, this is a simplified version
      CronLog.deleteByUserId(user.id),
      User.deleteById(user.id),
    ]);
    
    req.logout(() => req.session.destroy(() => res.json({ success: true })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
