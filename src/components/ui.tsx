import React from 'react'

const BADGE_STYLES = {
  active:    { bg: 'var(--green-bg)',  color: 'var(--green)',  dot: 'var(--green)' },
  confirmed: { bg: 'var(--green-bg)',  color: 'var(--green)',  dot: 'var(--green)' },
  completed: { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-2)', dot: 'var(--text-3)' },
  pending:   { bg: 'var(--amber-bg)',  color: 'var(--amber)',  dot: 'var(--amber)' },
  in_pool:   { bg: 'var(--blue-bg)',   color: 'var(--blue)',   dot: 'var(--blue)' },
  assigned:  { bg: 'var(--blue-bg)',   color: 'var(--blue)',   dot: 'var(--blue)' },
  cancelled: { bg: 'var(--red-bg)',    color: 'var(--red)',    dot: 'var(--red)' },
  panic:     { bg: 'var(--red-bg)',    color: 'var(--red)',    dot: 'var(--red)' },
  trial:     { bg: 'var(--purple-bg)', color: 'var(--purple)', dot: 'var(--purple)' },
  inactive:  { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-3)', dot: 'var(--text-3)' },
  suspended: { bg: 'var(--red-bg)',    color: 'var(--red)',    dot: 'var(--red)' },
  expired:   { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-3)', dot: 'var(--text-3)' },
  replied:   { bg: 'var(--blue-bg)',   color: 'var(--blue)',   dot: 'var(--blue)' },
  open:      { bg: 'var(--amber-bg)',  color: 'var(--amber)',  dot: 'var(--amber)' },
  closed:    { bg: 'rgba(255,255,255,0.04)', color: 'var(--text-3)', dot: 'var(--text-3)' },
}

export function StatCard({ label, value, sub, trend, color = 'var(--teal)', icon }) {
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '20px 24px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, ' + color + '40, transparent)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase' }}>{label}</span>
        {icon && <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>}
      </div>
      <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend && <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: trend.dir === 'up' ? 'var(--green)' : trend.dir === 'down' ? 'var(--red)' : 'var(--text-3)', padding: '2px 6px', borderRadius: 4 }}>{trend.dir === 'up' ? '↑' : trend.dir === 'down' ? '↓' : '–'} {trend.pct}</span>}
        {sub && <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
    </div>
  )
}

export function Badge({ status, label }) {
  const s = BADGE_STYLES[status?.toLowerCase()] || BADGE_STYLES.inactive
  const text = label || status?.replace(/_/g, ' ')
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, fontSize: 11, fontWeight: 500, background: s.bg, color: s.color, letterSpacing: 0.3, whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {text}
    </span>
  )
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, style: extStyle, icon }) {
  const V = { primary: { bg: 'var(--text-1)', color: '#000', border: 'transparent', hbg: '#ddd' }, teal: { bg: 'var(--teal)', color: '#fff', border: 'transparent', hbg: '#17a06a' }, secondary: { bg: 'var(--bg-elevated)', color: 'var(--text-1)', border: 'var(--border-strong)', hbg: 'var(--bg-hover)' }, ghost: { bg: 'transparent', color: 'var(--text-2)', border: 'transparent', hbg: 'var(--bg-hover)' }, danger: { bg: 'var(--red-bg)', color: 'var(--red)', border: 'rgba(239,68,68,0.25)', hbg: 'rgba(239,68,68,0.2)' } }
  const S = { sm: { padding: '5px 12px', fontSize: 12 }, md: { padding: '8px 16px', fontSize: 13 }, lg: { padding: '11px 22px', fontSize: 14 } }
  const v = V[variant]; const s = S[size]
  return (
    <button onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: s.padding, fontSize: s.fontSize, fontWeight: 500, background: v.bg, color: v.color, border: '1px solid ' + v.border, borderRadius: 'var(--r)', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all 0.12s ease', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', letterSpacing: 0.2, ...extStyle }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hbg }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = v.bg }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  )
}

export function Panel({ children, style }) {
  return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', ...style }}>{children}</div>
}

export function PanelHeader({ title, sub, actions }) {
  return (
    <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: -0.3, color: 'var(--text-1)' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  )
}

export function Table({ columns, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{columns.map(col => <th key={col} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: 1, textTransform: 'uppercase', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', fontWeight: 500 }}>{col}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

export function TR({ children, onClick }) {
  return <tr onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default', transition: 'background 0.1s' }} onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>{children}</tr>
}

export function TD({ children, mono, muted, style }) {
  return <td style={{ padding: '13px 16px', fontSize: 13, color: muted ? 'var(--text-3)' : 'var(--text-1)', fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', borderBottom: '1px solid var(--border)', verticalAlign: 'middle', ...style }}>{children}</td>
}

export function PageHeader({ title, sub, actions }) {
  return (
    <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, color: 'var(--text-1)', lineHeight: 1.1 }}>{title}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>{sub}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>{actions}</div>}
    </div>
  )
}

export function Empty({ icon, message }) {
  return <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-3)' }}>{icon && <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>{icon}</div>}<div style={{ fontSize: 13 }}>{message}</div></div>
}

export function Input({ value, onChange, placeholder, type = 'text', style }) {
  return <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '8px 12px', fontSize: 13, color: 'var(--text-1)', outline: 'none', fontFamily: 'var(--font-body)', transition: 'border-color 0.15s', width: '100%', ...style }} onFocus={e => (e.target.style.borderColor = 'var(--teal)')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
}

export function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60 }}>
      <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--teal)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  )
}
