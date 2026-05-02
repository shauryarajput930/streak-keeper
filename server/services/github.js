const axios = require('axios');
const User = require('../models/User');
const Commit = require('../models/Commit');
const CronLog = require('../models/CronLog');

const GH_API = 'https://api.github.com';

function ghHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'streak-keeper/1.0',
  };
}

async function pushStreakCommit(userId, triggeredBy = 'manual') {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const { access_token, repo_config } = user;
  const { owner, repo, branch, logFile, commitMessage } = repo_config;

  if (!owner || !repo) throw new Error('Repo config incomplete — set owner and repo name in Settings');
  if (!access_token) throw new Error('No GitHub access token');

  const headers = ghHeaders(access_token);
  const today = new Date().toISOString().slice(0, 10);
  const msg = (commitMessage || 'chore: daily streak update {date}').replace('{date}', today);

  // Log start
  await CronLog.create({ userId, level: 'info', message: `Push started for @${user.username} → ${owner}/${repo}@${branch}`, source: triggeredBy === 'scheduler' ? 'scheduler' : 'manual' });

  try {
    // 1. Get current file
    let sha = null;
    let existingContent = '# Streak Log\n\nAuto-updated daily to maintain GitHub contribution streak.\n\n';

    try {
      const fileRes = await axios.get(`${GH_API}/repos/${owner}/${repo}/contents/${logFile}?ref=${branch}`, { headers });
      sha = fileRes.data.sha;
      existingContent = Buffer.from(fileRes.data.content.replace(/\n/g, ''), 'base64').toString('utf8');
    } catch (err) {
      if (err.response?.status !== 404) throw err;
      await CronLog.create({ userId, level: 'info', message: `${logFile} not found — will create it`, source: 'system' });
    }

    // 2. Duplicate check
    if (existingContent.includes(`- ${today}`)) {
      await CronLog.create({ userId, level: 'warn', message: `Already committed for ${today} — skipped`, source: triggeredBy === 'scheduler' ? 'scheduler' : 'manual' });

      const commit = await Commit.create({ userId, date: today, message: msg, repo: `${owner}/${repo}`, branch, triggeredBy, status: 'skipped' });
      return { status: 'skipped', date: today, commit };
    }

    // 3. Update content
    const newContent = existingContent + `- ${today} ✅\n`;
    const encoded = Buffer.from(newContent, 'utf8').toString('base64');
    const body = { message: msg, content: encoded, branch };
    if (sha) body.sha = sha;

    // 4. PUT to GitHub
    const putRes = await axios.put(`${GH_API}/repos/${owner}/${repo}/contents/${logFile}`, body, { headers });
    const githubSha = putRes.data.commit?.sha;

    // 5. Save commit to DB
    const commit = await Commit.create({
      userId, githubSha, date: today, message: msg,
      repo: `${owner}/${repo}`, branch, triggeredBy, status: 'success',
    });

    // 6. Update user stats
    const prevPush = user.stats.lastPushedAt;
    const prevDate = prevPush ? new Date(prevPush).toISOString().slice(0, 10) : null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    let newStreak = user.stats.currentStreak;
    if (prevDate === yesterday || prevDate === today) {
      newStreak = prevDate === today ? newStreak : newStreak + 1;
    } else {
      newStreak = 1;
    }

    await User.findByIdAndUpdate(userId, {
      'stats.currentStreak':   newStreak,
      'stats.longestStreak':   Math.max(user.stats.longestStreak, newStreak),
      'stats.totalCommits':    user.stats.totalCommits + 1,
      'stats.totalDaysActive': user.stats.totalDaysActive + 1,
      'stats.lastPushedAt':    new Date(),
    });

    await CronLog.create({ userId, level: 'success', message: `✓ Pushed! SHA: ${githubSha?.slice(0, 7)} — streak now ${newStreak} days`, source: triggeredBy === 'scheduler' ? 'scheduler' : 'manual', meta: { sha: githubSha, streak: newStreak } });

    return { status: 'success', date: today, sha: githubSha, streak: newStreak, commit };

  } catch (err) {
    const errMsg = err.response?.data?.message || err.message;
    await Commit.create({ userId, date: today, message: msg, repo: `${owner}/${repo}`, branch, triggeredBy, status: 'failed', errorMsg: errMsg });
    await CronLog.create({ userId, level: 'error', message: `Push failed: ${errMsg}`, source: triggeredBy === 'scheduler' ? 'scheduler' : 'manual', meta: { error: errMsg } });
    throw new Error(errMsg);
  }
}

async function getGitHubUserRepos(token) {
  const headers = ghHeaders(token);
  const res = await axios.get(`${GH_API}/user/repos?per_page=100&sort=updated`, { headers });
  return res.data.map(r => ({ name: r.name, full_name: r.full_name, private: r.private, default_branch: r.default_branch }));
}

module.exports = { pushStreakCommit, getGitHubUserRepos };
