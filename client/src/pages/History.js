import { useState, useEffect } from 'react';
import { Card, Badge, SectionTitle, Button, Spinner } from '../components/UI';
import api from '../utils/api';

const statusBadge = (s) => {
  if (s === 'success') return <Badge color="green">success</Badge>;
  if (s === 'skipped') return <Badge color="blue">skipped</Badge>;
  return <Badge color="red">failed</Badge>;
};

export default function History() {
  const [data, setData] = useState({ commits: [], total: 0, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getCommits(page)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 28px 60px' }}>
      <div className="fade-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.5px' }}>Commit History</h1>
        <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{data.total} total</span>
      </div>

      <Card className="fade-up fade-up-1">
        <SectionTitle>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text2)" strokeWidth="2"><circle cx="12" cy="12" r="4"/><line x1="1.05" y1="12" x2="7" y2="12"/><line x1="17.01" y1="12" x2="22.96" y2="12"/></svg>
          All Pushes
        </SectionTitle>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={28} /></div>
        ) : data.commits.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 14 }}>No commits yet. Hit "Push Now" on the dashboard!</div>
        ) : (
          <div>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 100px 100px 90px', gap: 12, padding: '8px 12px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>
              {['Date', 'Message', 'Repo', 'Trigger', 'Status'].map(h => (
                <div key={h} style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', letterSpacing: '.5px' }}>{h}</div>
              ))}
            </div>

            {data.commits.map((c, i) => (
              <div key={c._id} style={{
                display: 'grid', gridTemplateColumns: '110px 1fr 100px 100px 90px', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius)',
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,.02)',
                alignItems: 'center',
                animation: `fadeUp .3s ease ${i * 0.03}s both`,
              }}>
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{c.date}</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {c.message}
                  {c.errorMsg && <div style={{ fontSize: 10, color: 'var(--danger)', marginTop: 2 }}>{c.errorMsg}</div>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.repo}</div>
                <Badge color={c.triggeredBy === 'scheduler' ? 'blue' : 'gray'}>{c.triggeredBy}</Badge>
                {statusBadge(c.status)}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data.pages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
            <Button variant="ghost" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Button>
            <span style={{ fontSize: 13, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{page} / {data.pages}</span>
            <Button variant="ghost" style={{ width: 'auto', padding: '6px 14px' }} onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}>Next →</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
