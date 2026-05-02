import { useState } from 'react';

const s = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    color: 'var(--text2)',
    fontFamily: 'var(--mono)',
    letterSpacing: '.5px',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: 'var(--text)',
    fontSize: '13px',
    fontFamily: 'var(--mono)',
    outline: 'none',
    transition: 'border-color .2s',
  },
};

export function Card({ children, style, className }) {
  return <div style={{ ...s.card, ...style }} className={className}>{children}</div>;
}

export function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={s.label}>{label}</label>}
      {children}
      {hint && <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

export function Input({ style, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      style={{ ...s.input, borderColor: focused ? 'var(--accent2)' : 'var(--border)', ...style }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      {...props}
    />
  );
}

export function Select({ children, style, ...props }) {
  return (
    <select style={{ ...s.input, cursor: 'pointer', ...style }} {...props}>
      {children}
    </select>
  );
}

export function Button({ children, variant = 'ghost', style, loading, ...props }) {
  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
    padding: '9px 18px', borderRadius: 'var(--radius)', border: 'none',
    cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 600,
    fontFamily: 'var(--display)', transition: 'all .15s', width: '100%',
    opacity: loading ? .6 : 1,
  };
  const variants = {
    green:  { background: 'var(--green)', color: '#000' },
    ghost:  { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border2)' },
    danger: { background: '#3d1a1a', color: 'var(--danger)', border: '1px solid #5a2020' },
    accent: { background: 'var(--accent2)', color: '#fff' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} disabled={loading} {...props}>
      {loading ? <Spinner size={14} /> : children}
    </button>
  );
}

export function Spinner({ size = 18 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border2)`,
      borderTopColor: 'var(--green)',
      animation: 'spin .7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

export function Badge({ children, color = 'green' }) {
  const colors = {
    green:  { bg: 'rgba(34,197,94,.12)',  text: '#4ade80' },
    red:    { bg: 'rgba(248,81,73,.12)',  text: 'var(--danger)' },
    yellow: { bg: 'rgba(210,153,34,.12)', text: 'var(--warn)' },
    blue:   { bg: 'rgba(88,166,255,.12)', text: 'var(--accent)' },
    gray:   { bg: 'var(--surface3)',       text: 'var(--text2)' },
  };
  const c = colors[color] || colors.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)',
      background: c.bg, color: c.text,
    }}>{children}</span>
  );
}

export function SectionTitle({ children, style }) {
  return (
    <div style={{
      fontSize: 13, fontWeight: 600, color: 'var(--text)',
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 16, ...style,
    }}>{children}</div>
  );
}

export function Divider() {
  return <div style={{ height: 1, background: 'var(--border)', margin: '20px 0' }} />;
}

export function StatCard({ label, value, color = 'var(--text)' }) {
  return (
    <div style={{
      background: 'var(--surface2)', borderRadius: 'var(--radius)',
      padding: '14px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export function Toast({ message, type, visible }) {
  if (!visible) return null;
  const colors = { ok: '#14532d', err: '#450a0a', warn: '#451a03' };
  const textColors = { ok: '#4ade80', err: '#fca5a5', warn: '#fcd34d' };
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 999,
      padding: '12px 18px', borderRadius: 'var(--radius)',
      background: colors[type] || colors.ok,
      color: textColors[type] || textColors.ok,
      fontSize: 13, fontWeight: 600,
      animation: 'fadeUp .3s ease',
      maxWidth: 320,
    }}>{message}</div>
  );
}
