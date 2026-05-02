import { useState, useEffect, useRef } from 'react';
import { Card, Badge, SectionTitle, Spinner } from '../components/UI';
import api from '../utils/api';

const levelBadge = (l) => {
  if (l === 'success') return <Badge color="green">success</Badge>;
  if (l === 'error')   return <Badge color="red">error</Badge>;
  if (l === 'warn')    return <Badge color="yellow">warn</Badge>;
  return <Badge color="gray">info</Badge>;
};

const levelColor = { success: 'var(--green)', error: 'var(--danger)', warn: 'var(--warn)', info: 'var(--text2)' };

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef(null);

  const fetchLogs = async (level = filter) => {
    try {
      const r = await api.getLogs(level);
      setLogs(r.data.logs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLogs(filter);
    const interval = setInterval(() => fetchLogs(filter), 8000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const levels = ['all', 'info', 'success', 'warn', 'error'];

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 28px 60px' }}>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>Activity Logs</h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>Live view — refreshes every 8s. Logs expire after 30 days.</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {levels.map(l => (
            <button key={l} onClick={() => setFilter(l)} style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              fontFamily: 'var(--mono)', cursor: 'pointer', border: 'none',
              background: filter === l ? 'var(--green)' : 'var(--surface2)',
              color: filter === l ? '#000' : 'var(--text2)',
              transition: 'all .15s',
            }}>{l}</button>
          ))}
        </div>
      </div>

      <Card className="fade-up fade-up-1">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionTitle style={{ marginBottom: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Log Stream
          </SectionTitle>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoScroll} onChange={e => setAutoScroll(e.target.checked)} />
            Auto-scroll
          </label>
        </div>

        <div style={{
          background: '#0a0e13', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          height: 520, overflowY: 'auto', padding: '12px 0',
          fontFamily: 'var(--mono)', fontSize: 12,
        }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spinner /></div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text3)', padding: 40 }}>No logs yet.</div>
          ) : (
            [...logs].reverse().map((log, i) => (
              <div key={log._id} style={{
                display: 'flex', gap: 12, padding: '5px 16px',
                alignItems: 'flex-start',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.015)',
                borderLeft: `2px solid ${levelColor[log.level] || 'transparent'}`,
                marginLeft: 8,
                animation: `fadeUp .2s ease ${i * 0.01}s both`,
              }}>
                <span style={{ color: 'var(--text3)', flexShrink: 0, paddingTop: 1, fontSize: 10 }}>
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
                <span style={{ flexShrink: 0 }}>{levelBadge(log.level)}</span>
                <span style={{ color: levelColor[log.level] || 'var(--text2)', lineHeight: 1.6, wordBreak: 'break-all' }}>
                  {log.message}
                </span>
                {log.source && (
                  <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0, paddingTop: 2 }}>[{log.source}]</span>
                )}
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[
            { label: 'total', val: logs.length, color: 'var(--text2)' },
            { label: 'errors', val: logs.filter(l => l.level === 'error').length, color: 'var(--danger)' },
            { label: 'warnings', val: logs.filter(l => l.level === 'warn').length, color: 'var(--warn)' },
            { label: 'success', val: logs.filter(l => l.level === 'success').length, color: 'var(--green)' },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color }}>{val}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>{label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
