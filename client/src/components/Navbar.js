import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLink = (to, label) => (
    <Link to={to} style={{
      fontSize: 13, fontWeight: 500, padding: '6px 12px', borderRadius: 6,
      color: pathname === to ? 'var(--text)' : 'var(--text2)',
      background: pathname === to ? 'var(--surface2)' : 'transparent',
      border: pathname === to ? '1px solid var(--border)' : '1px solid transparent',
      transition: 'all .15s', textDecoration: 'none',
    }}>{label}</Link>
  );

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(13,17,23,.92)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)', padding: '0 28px', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{ width: 30, height: 30, background: 'var(--green)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#000">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', letterSpacing: '-.2px' }}>Streak Keeper</span>
      </Link>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/settings', 'Settings')}
          {navLink('/history', 'History')}
          {navLink('/logs', 'Logs')}
        </div>
      )}

      {user ? (
        <div style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 20, padding: '4px 12px 4px 4px', cursor: 'pointer', color: 'var(--text)',
          }}>
            <img src={user.avatarUrl} alt={user.username} style={{ width: 26, height: 26, borderRadius: '50%' }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>@{user.username}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {menuOpen && (
            <div onMouseLeave={() => setMenuOpen(false)} style={{
              position: 'absolute', top: '110%', right: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)', padding: 8, minWidth: 180,
              boxShadow: '0 8px 32px rgba(0,0,0,.4)', animation: 'fadeUp .2s ease',
            }}>
              <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{user.displayName || user.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{user.email || `@${user.username}`}</div>
              </div>
              {[{to:'/dashboard',label:'Dashboard'},{to:'/settings',label:'Settings'}].map(({to,label}) => (
                <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{
                  display: 'block', padding: '7px 12px', fontSize: 13,
                  color: 'var(--text2)', borderRadius: 6, textDecoration: 'none',
                }}
                onMouseEnter={e=>{e.target.style.background='var(--surface2)';e.target.style.color='var(--text)'}}
                onMouseLeave={e=>{e.target.style.background='';e.target.style.color='var(--text2)'}}
                >{label}</Link>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6 }}>
                <button onClick={() => { setMenuOpen(false); logout(); }} style={{
                  width: '100%', textAlign: 'left', padding: '7px 12px', fontSize: 13,
                  color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 6,
                }}>Sign out</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <a href="/auth/github" style={{
          display: 'flex', alignItems: 'center', gap: 7, padding: '7px 16px',
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: 13, fontWeight: 600, textDecoration: 'none',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
          Sign in with GitHub
        </a>
      )}
    </nav>
  );
}
