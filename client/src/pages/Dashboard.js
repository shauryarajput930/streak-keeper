import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, StatCard, Button, Badge, SectionTitle, Toast } from '../components/UI';
import HeatMap from '../components/HeatMap';
import api from '../utils/api';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [pushing, setPushing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'ok' });

  const showToast = (message, type = 'ok') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const fetchStats = useCallback(async () => {
    try {
      const r = await api.getStats();
      setStats(r.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handlePush = async () => {
    setPushing(true);
    try {
      const r = await api.pushNow();
      if (r.data.status === 'skipped') {
        showToast('Already pushed today — streak is safe!', 'warn');
      } else {
        showToast(`Pushed! Streak: ${r.data.streak} days 🟩`, 'ok');
      }
      fetchStats();
      refreshUser();
    } catch (e) {
      showToast(e.response?.data?.error || 'Push failed', 'err');
    } finally {
      setPushing(false);
    }
  };

  const s = stats?.stats || user?.stats || {};
  const today = new Date().toISOString().slice(0, 10);
  const pushedToday = user?.stats?.lastPushedAt &&
    new Date(user.stats.lastPushedAt).toISOString().slice(0, 10) === today;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 28px 60px' }}>
      {/* Header */}
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>
            Hey, {user?.displayName?.split(' ')[0] || user?.username} 👋
          </h1>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>
            {pushedToday ? "✅ You've already pushed today — streak is safe!" : "⚡ No push yet today — don't break the streak!"}
          </p>
        </div>
        <Button
          variant="green"
          style={{ width: 'auto', padding: '10px 22px' }}
          loading={pushing}
          onClick={handlePush}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          Push Now
        </Button>
      </div>

      {/* Stat cards */}
      <div className="fade-up fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="current streak" value={`${s.currentStreak || 0}d`} color="var(--green)" />
        <StatCard label="longest streak" value={`${s.longestStreak || 0}d`} color="var(--accent)" />
        <StatCard label="total commits" value={s.totalCommits || 0} color="var(--text)" />
        <StatCard label="days active" value={s.totalDaysActive || 0} color="var(--warn)" />
      </div>

      {/* Heatmap */}
      <Card className="fade-up fade-up-2" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Contribution Graph
          </SectionTitle>
          <Badge color={stats?.schedulerRunning ? 'green' : 'gray'}>
            {stats?.schedulerRunning ? '● Scheduler on' : '○ Scheduler off'}
          </Badge>
        </div>
        <HeatMap heatmap={stats?.heatmap || {}} />
      </Card>

      {/* Status + Config summary */}
      <div className="fade-up fade-up-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <SectionTitle>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Last Push
          </SectionTitle>
          {s.lastPushedAt ? (
            <>
              <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
                {new Date(s.lastPushedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                {new Date(s.lastPushedAt).toLocaleTimeString()}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text3)', fontSize: 14 }}>No pushes yet — hit "Push Now" to start!</div>
          )}
        </Card>

        <Card>
          <SectionTitle>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Repo Config
          </SectionTitle>
          {user?.repoConfig?.repo ? (
            <>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 14, color: 'var(--green)', marginBottom: 4 }}>
                {user.repoConfig.owner}/{user.repoConfig.repo}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>
                branch: {user.repoConfig.branch || 'main'} &nbsp;·&nbsp; file: {user.repoConfig.logFile || 'streak-log.md'}
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text3)', fontSize: 14 }}>
              No repo configured —{' '}
              <a href="/settings" style={{ color: 'var(--accent)' }}>go to Settings</a>
            </div>
          )}
        </Card>
      </div>

      <Toast {...toast} />
    </div>
  );
}
