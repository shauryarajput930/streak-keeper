export default function Landing() {
  return (
    <div style={{ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div style={{ animation: 'fadeUp .5s ease both' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, background: 'var(--green)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#000">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
        </div>

        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16, maxWidth: 600 }}>
          Keep your GitHub<br />
          <span style={{ color: 'var(--green)' }}>streak alive</span> — forever.
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text2)', maxWidth: 480, lineHeight: 1.7, marginBottom: 36 }}>
          Streak Keeper auto-pushes a daily commit to your repo so your contribution graph stays green, every single day.
        </p>

        <a href="/auth/github" style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          padding: '14px 28px', background: 'var(--green)', color: '#000',
          borderRadius: 'var(--radius-lg)', fontSize: 15, fontWeight: 700,
          textDecoration: 'none', transition: 'all .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--green2)'}
        onMouseLeave={e => e.currentTarget.style.background = 'var(--green)'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign in with GitHub — it's free
        </a>

        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 56 }}>
          {[
            { icon: '🟩', title: 'Auto Commits', desc: 'Daily commits via GitHub API — no local git needed' },
            { icon: '📅', title: 'Smart Scheduler', desc: 'Set your time + jitter for natural-looking pushes' },
            { icon: '📊', title: 'Full Dashboard', desc: 'Heatmap, streak stats, history and cron logs' },
          ].map(({ icon, title, desc }) => (
            <div key={title} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: '20px 24px', maxWidth: 200, textAlign: 'left',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
