const cron = require('node-cron');
const User = require('../models/User');
const CronLog = require('../models/CronLog');
const { pushStreakCommit } = require('./github');

const activeJobs = new Map(); // userId -> cron.Task

async function startJobForUser(userId) {
  const user = await User.findById(userId);
  if (!user || !user.scheduler_config.enabled) return;

  stopJobForUser(userId); // clear any existing

  const { hour, minute } = user.scheduler_config;
  const expression = `${minute} ${hour} * * *`;

  if (!cron.validate(expression)) {
    await CronLog.create({ userId, level: 'error', message: `Invalid cron expression: ${expression}`, source: 'scheduler' });
    return;
  }

  const task = cron.schedule(expression, async () => {
    await CronLog.create({ userId, level: 'info', message: `Scheduled job triggered (${expression})`, source: 'scheduler' });
    try {
      const jitter = (user.scheduler_config.jitterMin || 0) * 60 * 1000 * Math.random();
      if (jitter > 0) await new Promise(r => setTimeout(r, jitter));
      await pushStreakCommit(userId, 'scheduler');
    } catch (err) {
      await CronLog.create({ userId, level: 'error', message: `Scheduled push error: ${err.message}`, source: 'scheduler' });
    }
  }, { timezone: 'UTC' });

  activeJobs.set(userId.toString(), task);
  await CronLog.create({ userId, level: 'info', message: `Scheduler started — cron: ${expression}`, source: 'scheduler' });
}

function stopJobForUser(userId) {
  const key = userId.toString();
  if (activeJobs.has(key)) {
    activeJobs.get(key).stop();
    activeJobs.delete(key);
  }
}

async function initAllJobs() {
  // For now, skip initAllJobs since we need to implement a way to find users with enabled scheduler
  // This would require a custom RPC or a more complex query in Supabase
  console.log('[Scheduler] Skipping job restoration - feature disabled for now');
}

function isJobRunning(userId) {
  return activeJobs.has(userId.toString());
}

module.exports = { startJobForUser, stopJobForUser, initAllJobs, isJobRunning };
