import { T, glass } from '../data'

export default function Topbar() {
  const d = new Date().toLocaleDateString('es-AR', { weekday:'long', day:'numeric', month:'long' })
  return (
    <div style={{
      height: 56, flexShrink: 0,
      borderBottom: `1px solid ${T.border}`,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: '0 28px',
      background: 'rgba(6,14,26,.8)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
    }}>
      <div style={{ fontFamily:T.dm, fontSize:12, color:T.faint, textTransform:'capitalize' }}>{d}</div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ ...glass(8), padding:'6px 14px', display:'flex', alignItems:'center', gap:8, border:`1px solid ${T.border}`, width:220 }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="5.5" cy="5.5" r="4.5" stroke={T.muted} strokeWidth="1.2"/>
            <path d="M9 9l3 3" stroke={T.muted} strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          <input
            placeholder="Buscar jugador, sesión..."
            style={{ background:'none', border:'none', outline:'none', fontFamily:T.dm, fontSize:12, color:T.white, flex:1 }}
          />
        </div>
        <div style={{ position:'relative', cursor:'pointer' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2a6 6 0 00-6 6v3l-2 3h16l-2-3V8a6 6 0 00-6-6z" stroke={T.muted} strokeWidth="1.3"/>
            <path d="M8 16a2 2 0 004 0" stroke={T.muted} strokeWidth="1.3"/>
          </svg>
          <div style={{ position:'absolute', top:-2, right:-2, width:8, height:8, borderRadius:'50%', background:T.red, border:`1.5px solid ${T.bg}` }} />
        </div>
      </div>
    </div>
  )
}
