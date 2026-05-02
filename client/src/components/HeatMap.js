export default function HeatMap({ heatmap = {} }) {
  const weeks = 12;
  const days = 7;
  const cells = [];

  for (let w = 0; w < weeks; w++) {
    const col = [];
    for (let d = 0; d < days; d++) {
      const daysAgo = (weeks - 1 - w) * 7 + (days - 1 - d);
      const date = new Date(Date.now() - daysAgo * 86400000);
      const key = date.toISOString().slice(0, 10);
      const count = heatmap[key] || 0;
      const isToday = key === new Date().toISOString().slice(0, 10);
      col.push({ key, count, isToday });
    }
    cells.push(col);
  }

  const getColor = (count) => {
    if (count === 0) return 'var(--surface3)';
    if (count === 1) return '#0e4429';
    if (count === 2) return '#006d32';
    if (count === 3) return '#26a641';
    return '#22c55e';
  };

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div>
      <div style={{ display: 'flex', gap: 3 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginRight: 4 }}>
          {dayLabels.map((l, i) => (
            <div key={i} style={{ width: 24, height: 12, fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)', lineHeight: '12px' }}>{l}</div>
          ))}
        </div>
        {cells.map((col, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {col.map(({ key, count, isToday }) => (
              <div
                key={key}
                title={`${key}: ${count} commit${count !== 1 ? 's' : ''}`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: getColor(count),
                  outline: isToday ? '1px solid var(--green)' : 'none',
                  outlineOffset: 1, cursor: 'default', transition: 'transform .1s',
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.4)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>Less</span>
        {['var(--surface3)', '#0e4429', '#006d32', '#26a641', '#22c55e'].map((c, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>More</span>
      </div>
    </div>
  );
}
