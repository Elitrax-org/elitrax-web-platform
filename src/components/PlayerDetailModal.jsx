import { T, glass } from '../tokens'
import { PLAYERS, initials } from '../data'
import Badge from './Badge'

export default function PlayerDetailModal({ player, onClose }) {
  const avgKm  = (PLAYERS.reduce((s, p) => s + p.km,  0) / PLAYERS.length).toFixed(1)
  const avgSpr = Math.round(PLAYERS.reduce((s, p) => s + p.sprints, 0) / PLAYERS.length)
  const avgVel = (PLAYERS.reduce((s, p) => s + p.vel, 0) / PLAYERS.length).toFixed(1)

  const ec = player.estado === 'ok' ? T.green : player.estado === 'alerta' ? T.naranja : T.red
  const el = player.estado === 'ok' ? 'OK'    : player.estado === 'alerta' ? 'Alerta'  : 'Lesión'

  const metrics = [
    { key:'km',      label:'Distancia',      val:player.km,  avg:parseFloat(avgKm), unit:'km',    c:T.cian    },
    { key:'sprints', label:'Sprints',         val:player.sprints, avg:avgSpr,          unit:'/ses',  c:T.cian    },
    { key:'vel',     label:'Velocidad máx.',  val:player.vel, avg:parseFloat(avgVel), unit:'km/h',  c:T.naranja },
    { key:'carga',   label:'Carga física',    val:player.carga, avg:null,              unit:'%',     c: player.carga>=90 ? T.red : player.carga>=75 ? T.naranja : T.cian },
  ]

  return (
    <div
      onClick={onClose}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.75)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:24, backdropFilter:'blur(6px)' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ ...glass(20), width:'100%', maxWidth:640, maxHeight:'88vh', overflowY:'auto', border:`1px solid ${T.borderHi}`, animation:'fadeUp .25s ease both' }}
      >
        {/* Header */}
        <div style={{ padding:'24px 28px', borderBottom:`1px solid ${T.border}`, display:'flex', gap:16, alignItems:'flex-start' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', flexShrink:0, overflow:'hidden', background: player.photo ? 'none' : `linear-gradient(135deg,${T.cian}55 0%,${T.bg3} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:800, fontSize:18, color:T.cian, border: player.photo ? 'none' : undefined }}>
            {player.photo ? <img src={player.photo} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : initials(player.name)}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:20, color:T.white }}>{player.name}</div>
              <Badge label={el} color={ec} />
            </div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:4 }}>
              {player.pos} · #{player.num}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:T.muted, fontSize:22, lineHeight:1, padding:'2px 6px', flexShrink:0 }}>×</button>
        </div>

        {/* Metrics */}
        <div style={{ padding:'24px 28px', display:'flex', flexDirection:'column', gap:20 }}>
          <div>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.8, marginBottom:12 }}>MÉTRICAS DE RENDIMIENTO</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10 }}>
              {metrics.map(m => (
                <div key={m.key} style={{ background:'rgba(255,255,255,.04)', borderRadius:12, padding:'14px 16px', border:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:T.dm, fontSize:10, color:T.faint, marginBottom:6 }}>{m.label}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                    <span style={{ fontFamily:T.mono, fontSize:22, fontWeight:700, color:m.c, lineHeight:1 }}>{m.val}</span>
                    <span style={{ fontFamily:T.dm, fontSize:11, color:T.faint }}>{m.unit}</span>
                  </div>
                  {m.avg != null && (
                    <div style={{ marginTop:8 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                        <span style={{ fontFamily:T.dm, fontSize:9, color:T.muted }}>Promedio equipo</span>
                        <span style={{ fontFamily:T.mono, fontSize:10, color:T.muted }}>{m.avg}{m.unit === 'km/h' ? '' : ''}</span>
                      </div>
                      <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${Math.min((m.val / (m.avg || 1)) * 100, 100)}%`, background:m.c, borderRadius:2 }} />
                      </div>
                      {m.key === 'carga' && (
                        <div style={{ marginTop:3, fontFamily:T.dm, fontSize:9, color: m.val >= 90 ? T.red : m.val >= 75 ? T.naranja : T.muted }}>
                          {m.val >= 90 ? 'Alerta de sobrecarga' : m.val >= 75 ? 'Carga elevada' : 'Carga normal'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Estado físico */}
          <div style={{ ...glass(12), padding:'16px 18px', border:`1px solid ${ec}33`, background: player.estado === 'ok' ? 'rgba(74,222,128,.04)' : 'rgba(255,91,91,.06)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:20 }}>{player.estado === 'ok' ? '✅' : '⚠️'}</div>
              <div>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color: ec }}>
                  {player.estado === 'ok' ? 'Disponible' : player.estado === 'alerta' ? 'Sobrecarga detectada' : 'Lesión reportada'}
                </div>
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>
                  {player.estado === 'ok'
                    ? 'El jugador está en condiciones óptimas para la próxima sesión.'
                    : player.estado === 'alerta'
                      ? 'Se recomienda reducir carga de trabajo en los próximos días.'
                      : 'Requiere evaluación del cuerpo médico antes de volver a la actividad.'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
