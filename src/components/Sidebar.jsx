import { T, glass, NAV, GROUPS } from '../data'
import Logo from './Logo'
import Badge from './Badge'

export default function Sidebar({ active, onChange, role, onSignOut }) {
  return (
    <div style={{
      width: 220, height: '100vh', flexShrink: 0,
      background: `linear-gradient(180deg,${T.bg2} 0%,${T.bg1} 100%)`,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column', padding: '0 0 20px',
    }}>
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${T.border}` }}>
        <Logo />
      </div>

      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, margin: '0 0 8px' }}>
        <div style={{ ...glass(10), padding: '10px 12px' }}>
          <div style={{ fontFamily:T.dm, fontWeight:600, fontSize:12, color:T.white, lineHeight:1.3 }}>
            Club Atlético Belgrano — Sub 20
          </div>
          <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:3 }}>
            Fútbol 11 · Temporada 2026
          </div>
          <div style={{ marginTop:6 }}>
            <Badge
              label={
                role==='dt'    ? 'Director Técnico'    :
                role==='pf'    ? 'Preparador Físico'   :
                role==='scout' ? 'Scout' : 'Analista'
              }
              color={T.cian}
            />
          </div>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'0 10px' }}>
        {GROUPS.map(g => {
          const items = NAV.filter(n => n.group === g.id)
          if (!items.length) return null
          return (
            <div key={g.id} style={{ marginBottom:6 }}>
              <div style={{ fontFamily:T.dm, fontSize:9, color:T.faint, letterSpacing:1.2, padding:'10px 10px 4px' }}>
                {g.label}
              </div>
              {items.map(item => {
                const sel  = active === item.id
                const live = item.group === 'live'
                return (
                  <button
                    key={item.id}
                    onClick={() => onChange(item.id)}
                    style={{
                      width: '100%', display:'flex', alignItems:'center', gap:10,
                      padding: '9px 12px', borderRadius:10, border:'none',
                      background: sel ? (live ? T.naranjaDim : T.cianDim) : 'transparent',
                      cursor:'pointer', textAlign:'left', marginBottom:2, transition:'background .15s',
                    }}
                  >
                    <span style={{ fontSize:15, opacity: sel ? 1 : .6, width:18, textAlign:'center' }}>{item.icon}</span>
                    <span style={{ fontFamily:T.dm, fontSize:13, fontWeight: sel ? 600 : 400, color: sel ? (live ? T.naranja : T.cian) : T.muted }}>
                      {item.label}
                    </span>
                    {live && !sel && (
                      <div style={{ marginLeft:'auto' }}>
                        <div style={{ width:6, height:6, borderRadius:'50%', background:T.naranja, boxShadow:`0 0 5px ${T.naranja}`, animation:'pulse 1.8s ease infinite' }} />
                      </div>
                    )}
                    {sel && (
                      <div style={{ marginLeft:'auto', width:3, height:16, borderRadius:2, background: live ? T.naranja : T.cian }} />
                    )}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      <div style={{ padding:'10px 16px 0', borderTop:`1px solid ${T.border}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0' }}>
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background: `linear-gradient(135deg,${T.cian} 0%,#1A8AB5 100%)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, flexShrink:0,
          }}>
            RM
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:T.dm, fontSize:12, fontWeight:600, color:T.white, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
              Prof. R. Méndez
            </div>
            <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>PRO+</div>
          </div>
          <button onClick={onSignOut} style={{ background:'none', border:'none', padding:4, display:'flex', alignItems:'center', opacity:.5 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 8H2M6 5l-3 3 3 3" stroke={T.white} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 3h5a1 1 0 011 1v8a1 1 0 01-1 1H8" stroke={T.white} strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
