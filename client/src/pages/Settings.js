import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Field, Input, Select, Button, SectionTitle, Divider, Badge, Toast } from '../components/UI';
import api from '../utils/api';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [repos, setRepos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'ok' });

  const [repoConfig, setRepoConfig] = useState({
    owner: '', repo: '', branch: 'main', logFile: 'streak-log.md',
    commitMessage: 'chore: daily streak update {date}',
  });
  const [schedulerConfig, setSchedulerConfig] = useState({
    enabled: false, hour: 9, minute: 0, timezone: 'UTC', jitterMin: 15,
  });

  useEffect(() => {
    if (user) {
      setRepoConfig({ ...repoConfig, ...user.repoConfig });
      setSchedulerConfig({ ...schedulerConfig, ...user.schedulerConfig });
    }
    api.getRepos().then(r => setRepos(r.data.repos || [])).catch(() => {});
  }, [user]);

  const showToast = (message, type = 'ok') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.saveConfig({ repoConfig, schedulerConfig });
      await refreshUser();
      showToast('Settings saved!', 'ok');
    } catch (e) {
      showToast(e.response?.data?.error || 'Save failed', 'err');
    } finally {
      setSaving(false);
    }
  };

  const pushNow = async () => {
    setPushing(true);
    try {
      const r = await api.pushNow();
      showToast(r.data.status === 'skipped' ? 'Already pushed today!' : `Pushed! Streak: ${r.data.streak} days`, r.data.status === 'skipped' ? 'warn' : 'ok');
    } catch (e) {
      showToast(e.response?.data?.error || 'Push failed', 'err');
    } finally {
      setPushing(false);
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  const timezones = ['UTC', 'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'];

  const cronExpr = `${schedulerConfig.minute} ${schedulerConfig.hour} * * *`;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '28px 28px 60px' }}>
      <h1 className="fade-up" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 24 }}>Settings</h1>

      {/* Repo Config */}
      <Card className="fade-up fade-up-1" style={{ marginBottom: 16 }}>
        <SectionTitle>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Repository
        </SectionTitle>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="OWNER (GitHub username)">
            <Input value={repoConfig.owner} onChange={e => setRepoConfig(c => ({ ...c, owner: e.target.value }))} placeholder="octocat" />
          </Field>
          <Field label="REPOSITORY">
            <Select value={repoConfig.repo} onChange={e => setRepoConfig(c => ({ ...c, repo: e.target.value }))}>
              <option value="">— select or type —</option>
              {repos.map(r => <option key={r.name} value={r.name}>{r.name} {r.private ? '🔒' : ''}</option>)}
            </Select>
          </Field>
          <Field label="BRANCH">
            <Input value={repoConfig.branch} onChange={e => setRepoConfig(c => ({ ...c, branch: e.target.value }))} placeholder="main" />
          </Field>
          <Field label="LOG FILE">
            <Input value={repoConfig.logFile} onChange={e => setRepoConfig(c => ({ ...c, logFile: e.target.value }))} placeholder="streak-log.md" />
          </Field>
        </div>
        <Field label="COMMIT MESSAGE" hint="{date} is replaced with today's date (YYYY-MM-DD)">
          <Input value={repoConfig.commitMessage} onChange={e => setRepoConfig(c => ({ ...c, commitMessage: e.target.value }))} />
        </Field>

        <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
          <Button variant="ghost" onClick={pushNow} loading={pushing} style={{ flex: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
            Push Now
          </Button>
        </div>
      </Card>

      {/* Scheduler */}
      <Card className="fade-up fade-up-2" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Scheduler
          </SectionTitle>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{
              width: 40, height: 22, borderRadius: 11, position: 'relative',
              background: schedulerConfig.enabled ? 'var(--green)' : 'var(--surface3)',
              transition: 'background .2s', cursor: 'pointer',
            }} onClick={() => setSchedulerConfig(c => ({ ...c, enabled: !c.enabled }))}>
              <div style={{
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2, transition: 'left .2s',
                left: schedulerConfig.enabled ? 20 : 2,
              }} />
            </div>
            <span style={{ fontSize: 13, color: schedulerConfig.enabled ? 'var(--green)' : 'var(--text2)', fontWeight: 500 }}>
              {schedulerConfig.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Field label="HOUR">
            <Select value={schedulerConfig.hour} onChange={e => setSchedulerConfig(c => ({ ...c, hour: +e.target.value }))}>
              {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </Select>
          </Field>
          <Field label="MINUTE">
            <Select value={schedulerConfig.minute} onChange={e => setSchedulerConfig(c => ({ ...c, minute: +e.target.value }))}>
              {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </Select>
          </Field>
          <Field label="TIMEZONE">
            <Select value={schedulerConfig.timezone} onChange={e => setSchedulerConfig(c => ({ ...c, timezone: e.target.value }))}>
              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="JITTER (± minutes)" hint="Adds randomness to look natural. 0 = exact time.">
          <Input type="number" min={0} max={60} value={schedulerConfig.jitterMin}
            onChange={e => setSchedulerConfig(c => ({ ...c, jitterMin: +e.target.value }))} />
        </Field>

        <div style={{ background: 'var(--surface2)', borderRadius: 'var(--radius)', padding: '10px 14px', borderLeft: '2px solid var(--green)', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text2)' }}>
          Cron: <span style={{ color: 'var(--green)', fontWeight: 600 }}>{cronExpr}</span>
          &nbsp;·&nbsp; Runs daily at {String(schedulerConfig.hour).padStart(2,'0')}:{String(schedulerConfig.minute).padStart(2,'0')} {schedulerConfig.timezone}
        </div>
      </Card>

      {/* Save button */}
      <Button variant="green" onClick={save} loading={saving} className="fade-up fade-up-3">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Save Settings
      </Button>

      <Divider />

      {/* Danger zone */}
      <Card className="fade-up fade-up-4" style={{ border: '1px solid #5a2020' }}>
        <SectionTitle style={{ color: 'var(--danger)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Danger Zone
        </SectionTitle>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Deleting your account removes all your data from our database — commits, logs, and config. This cannot be undone.
        </p>
        <Button variant="danger" style={{ width: 'auto', padding: '8px 18px' }}
          onClick={() => { if (window.confirm('Delete your account and all data? This cannot be undone.')) api.deleteAccount().then(() => window.location.href = '/'); }}>
          Delete My Account
        </Button>
      </Card>

      <Toast {...toast} />
    </div>
  );
}
