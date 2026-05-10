import { useState } from 'react'
import { T, glass, PLAYERS, TACTICAS, ESTILOS, VAR_DEF, calcScore, genVals, initials } from '../data'
import Badge from '../components/Badge'
import ScoreBar from '../components/ScoreBar'

export default function OptimizacionView() {
  const [tab,        setTab]        = useState('variables')
  const [vars,       setVars]       = useState(VAR_DEF)
  const [vals,       setVals]       = useState(genVals)
  const [newName,    setNewName]    = useState('')
  const [newPeso,    setNewPeso]    = useState(5)
  const [tacPropia,  setTacPropia]  = useState('4-3-3')
  const [estPropio,  setEstPropio]  = useState('ofensivo')
  const [tacRival,   setTacRival]   = useState('4-4-2')
  const [estRival,   setEstRival]   = useState('defensivo')
  const [rivalName,  setRivalName]  = useState('Talleres')
  const [analyzing,  setAnalyzing]  = useState(false)
  const [analyzed,   setAnalyzed]   = useState(false)

  const scores   = PLAYERS.map(p => ({ ...p, score: calcScore(p, vars, vals) })).sort((a, b) => parseFloat(b.score) - parseFloat(a.score))
  const disp     = scores.filter(p => p.estado !== 'lesion')
  const titulares = disp.slice(0, 11)
  const suplentes = disp.slice(11)

  const addVar = () => {
    if (!newName.trim()) return
    const nv = { id: Date.now(), nombre: newName.trim(), peso: newPeso }
    setVars(v => [...v, nv])
    setVals(prev => {
      const n = { ...prev }
      PLAYERS.forEach(p => { n[p.id] = { ...(n[p.id] || {}), [nv.id]: 6 } })
      return n
    })
    setNewName('')
    setNewPeso(5)
  }

  const setV = (pid, vid, v) => setVals(prev => ({ ...prev, [pid]: { ...prev[pid], [vid]: v } }))

  const runAnalysis = () => { setAnalyzing(true); setTimeout(() => { setAnalyzing(false); setAnalyzed(true) }, 2200) }

  const TABS = [
    { id:'variables',  label:'Variables técnicas' },
    { id:'valoracion', label:'Valoración plantel'  },
    { id:'equipo',     label:'Equipo óptimo'       },
    { id:'rival',      label:'Análisis rival'      },
  ]

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header + tabs */}
      <div style={{ padding:'24px 32px 0', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:24, color:T.white }}>
              Optimización <span style={{ color:T.cian }}>IA</span>
            </div>
            <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, marginTop:3 }}>
              Armado inteligente del equipo para la competencia del fin de semana
            </div>
          </div>
          <button
            onClick={runAnalysis}
            disabled={analyzing}
            style={{
              height:40, padding:'0 22px',
              background: analyzing ? T.naranjaDim : `linear-gradient(135deg,${T.naranja} 0%,#C94E1E 100%)`,
              border: analyzing ? `1px solid ${T.naranja}` : 'none',
              borderRadius:10, fontFamily:T.exo, fontWeight:700, fontSize:13,
              color: analyzing ? T.naranja : T.white,
              display:'flex', alignItems:'center', gap:8,
            }}
          >
            <span>{analyzing ? '⏳' : '🤖'}</span>
            {analyzing ? 'CALCULANDO...' : 'GENERAR ANÁLISIS'}
          </button>
        </div>
        <div style={{ display:'flex', gap:4, borderBottom:`1px solid ${T.border}` }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:'10px 18px', border:'none', borderRadius:'8px 8px 0 0',
                background: tab===t.id ? T.bg2 : 'transparent',
                fontFamily:T.dm, fontSize:13, fontWeight: tab===t.id ? 600 : 400,
                color: tab===t.id ? T.white : T.muted,
                borderBottom: tab===t.id ? `2px solid ${T.cian}` : '2px solid transparent',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>

        {/* ── Variables tab ── */}
        {tab === 'variables' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>
            <div style={{ ...glass(14), overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Variables activas</div>
                <Badge label={vars.length + ' variables'} color={T.cian} />
              </div>
              {vars.map((v, i) => (
                <div key={v.id} style={{ padding:'12px 20px', display:'flex', alignItems:'center', gap:12, borderBottom: i<vars.length-1 ? `1px solid ${T.border}` : 'none' }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:T.cianDim, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.mono, fontSize:11, color:T.cian, fontWeight:700 }}>{i+1}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{v.nombre}</div>
                    <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>Peso: <span style={{ color:T.cian }}>{v.peso}</span></div>
                  </div>
                  <input type="range" min="1" max="10" value={v.peso}
                    onInput={e => setVars(p => p.map(x => x.id===v.id ? {...x, peso:+e.target.value} : x))}
                    style={{ width:80, accentColor:T.cian }}
                  />
                  <span style={{ fontFamily:T.mono, fontSize:12, color:T.cian, width:16 }}>{v.peso}</span>
                  <button onClick={() => setVars(p => p.filter(x => x.id!==v.id))} style={{ background:'none', border:'none', color:T.red, fontSize:16, opacity:.6, padding:'2px 6px' }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ ...glass(14), padding:'20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:16 }}>Agregar variable</div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.6, marginBottom:6 }}>NOMBRE</div>
                  <input
                    value={newName}
                    onInput={e => setNewName(e.target.value)}
                    placeholder="Ej: Fuerza de disparo..."
                    style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }}
                  />
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.6, marginBottom:6 }}>
                    PESO (1–10) — <span style={{ color:T.cian }}>{newPeso}</span>
                  </div>
                  <input type="range" min="1" max="10" value={newPeso} onInput={e => setNewPeso(+e.target.value)} style={{ width:'100%', accentColor:T.naranja }} />
                </div>
                <button onClick={addVar} style={{ width:'100%', height:40, background:`linear-gradient(135deg,${T.cian} 0%,#2EB5E0 100%)`, border:'none', borderRadius:8, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg }}>
                  + AGREGAR VARIABLE
                </button>
              </div>

              <div style={{ ...glass(14), padding:'16px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Ponderación del score IA</div>
                {[
                  { l:'Variables técnicas (criterio propio)', p:60, c:T.naranja },
                  { l:'Métricas GPS / IMU (dispositivo)',     p:40, c:T.cian    },
                ].map((x, i) => (
                  <div key={i} style={{ marginBottom: i===0 ? 10 : 0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>{x.l}</span>
                      <span style={{ fontFamily:T.mono, fontSize:12, color:x.c, fontWeight:700 }}>{x.p}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${x.p}%`, background:x.c, borderRadius:3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Valoración tab ── */}
        {tab === 'valoracion' && (
          <div style={{ ...glass(14), overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>Valoración técnica por jugador</div>
              <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:3 }}>Puntuá cada variable del 1 al 10</div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,.03)' }}>
                    <th style={{ padding:'10px 16px', fontFamily:T.dm, fontSize:10, color:T.faint, textAlign:'left', borderBottom:`1px solid ${T.border}` }}>JUGADOR</th>
                    {vars.map(v => (
                      <th key={v.id} style={{ padding:'10px 12px', fontFamily:T.dm, fontSize:10, color:T.faint, textAlign:'center', borderBottom:`1px solid ${T.border}`, whiteSpace:'nowrap' }}>{v.nombre}</th>
                    ))}
                    <th style={{ padding:'10px 12px', fontFamily:T.dm, fontSize:10, color:T.cian, textAlign:'center', borderBottom:`1px solid ${T.border}` }}>SCORE</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom:`1px solid ${T.border}`, background: i%2===0 ? 'transparent' : 'rgba(255,255,255,.015)', opacity: p.estado==='lesion' ? .45 : 1 }}>
                      <td style={{ padding:'10px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${T.cian}44 0%,${T.bg3} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian, flexShrink:0 }}>
                            {initials(p.name)}
                          </div>
                          <div>
                            <div style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{p.name}</div>
                            <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>{p.pos}</div>
                          </div>
                          {p.estado !== 'ok' && <Badge label={p.estado==='lesion' ? 'Lesión' : 'Alerta'} color={p.estado==='lesion' ? T.red : T.naranja} />}
                        </div>
                      </td>
                      {vars.map(v => (
                        <td key={v.id} style={{ padding:'8px 12px', textAlign:'center' }}>
                          <select
                            value={(vals[p.id] || {})[v.id] || 5}
                            onChange={e => setV(p.id, v.id, +e.target.value)}
                            disabled={p.estado === 'lesion'}
                            style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:6, fontFamily:T.mono, fontSize:12, color:T.cian, padding:'3px 6px', width:52 }}
                          >
                            {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                          </select>
                        </td>
                      ))}
                      <td style={{ padding:'8px 16px', minWidth:140 }}><ScoreBar val={p.score} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Equipo tab ── */}
        {tab === 'equipo' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Formación táctica</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {TACTICAS.map(t => (
                    <button key={t.id} onClick={() => setTacPropia(t.id)} style={{ padding:'8px 14px', borderRadius:8, border:`1.5px solid ${tacPropia===t.id ? T.cian : T.border}`, background: tacPropia===t.id ? T.cianDim : 'transparent', fontFamily:T.dm, fontSize:12, color: tacPropia===t.id ? T.cian : T.muted, fontWeight: tacPropia===t.id ? 600 : 400 }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>Estilo de juego</div>
                <div style={{ display:'flex', gap:8 }}>
                  {ESTILOS.map(e => (
                    <button key={e.id} onClick={() => setEstPropio(e.id)} style={{ flex:1, padding:'10px 8px', borderRadius:8, border:`1.5px solid ${estPropio===e.id ? e.color : T.border}`, background: estPropio===e.id ? e.color+'18' : 'transparent', fontFamily:T.dm, fontSize:12, color: estPropio===e.id ? e.color : T.muted, fontWeight: estPropio===e.id ? 600 : 400 }}>{e.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ ...glass(14), overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>XI Titular recomendado</div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>{tacPropia} · {ESTILOS.find(e => e.id===estPropio)?.label}</div>
                </div>
                <Badge label="Optimizado por IA" color={T.cian} />
              </div>
              {titulares.map((p, i) => (
                <div key={p.id} style={{ padding:'11px 20px', display:'flex', alignItems:'center', gap:14, borderBottom: i<titulares.length-1 ? `1px solid ${T.border}` : 'none', background: i===0 ? 'rgba(70,199,240,.04)' : 'transparent' }}>
                  <div style={{ width:26, height:26, borderRadius:7, background: i<3 ? `linear-gradient(135deg,${T.cian}55,${T.bg3})` : T.bg3, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.mono, fontSize:11, fontWeight:700, color: i<3 ? T.cian : T.faint, flexShrink:0 }}>{i+1}</div>
                  <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:`linear-gradient(135deg,${T.cian}44 0%,${T.bg3} 100%)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.exo, fontWeight:700, fontSize:10, color:T.cian }}>{initials(p.name)}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{p.name}</div>
                    <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>{p.pos} · #{p.num}</div>
                  </div>
                  <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                    <Badge label={p.km + ' km'} color={T.cian} />
                    {p.carga >= 85 && <Badge label={'Carga ' + p.carga + '%'} color={T.naranja} />}
                  </div>
                  <div style={{ width:160, flexShrink:0 }}><ScoreBar val={p.score} /></div>
                </div>
              ))}
            </div>

            {suplentes.length > 0 && (
              <div style={{ ...glass(14), overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>Banco de suplentes</div>
                </div>
                {suplentes.map((p, i) => (
                  <div key={p.id} style={{ padding:'9px 20px', display:'flex', alignItems:'center', gap:14, borderBottom: i<suplentes.length-1 ? `1px solid ${T.border}` : 'none', opacity:.7 }}>
                    <div style={{ width:26, height:26, borderRadius:7, background:T.bg3, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:T.mono, fontSize:11, color:T.faint }}>{11+i+1}</div>
                    <div style={{ flex:1 }}>
                      <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{p.name}</span>
                      <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginLeft:8 }}>{p.pos}</span>
                    </div>
                    <div style={{ width:140 }}><ScoreBar val={p.score} /></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Rival tab ── */}
        {tab === 'rival' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>Rival del fin de semana</div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.6, marginBottom:6 }}>NOMBRE DEL EQUIPO</div>
                  <input value={rivalName} onInput={e => setRivalName(e.target.value)} style={{ width:'100%', background:T.bg2, border:`1px solid ${T.border}`, borderRadius:8, padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }} />
                </div>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.6, marginBottom:8 }}>TÁCTICA PROBABLE</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {TACTICAS.map(t => (
                      <button key={t.id} onClick={() => setTacRival(t.id)} style={{ padding:'6px 12px', borderRadius:7, border:`1.5px solid ${tacRival===t.id ? T.naranja : T.border}`, background: tacRival===t.id ? T.naranjaDim : 'transparent', fontFamily:T.dm, fontSize:11, color: tacRival===t.id ? T.naranja : T.muted, fontWeight: tacRival===t.id ? 600 : 400 }}>{t.label}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>Estilo rival</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ESTILOS.map(e => (
                    <button key={e.id} onClick={() => setEstRival(e.id)} style={{ padding:'10px 14px', borderRadius:8, textAlign:'left', border:`1.5px solid ${estRival===e.id ? e.color : T.border}`, background: estRival===e.id ? e.color+'18' : 'transparent', fontFamily:T.dm, fontSize:12, color: estRival===e.id ? e.color : T.muted, fontWeight: estRival===e.id ? 600 : 400 }}>{e.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {!analyzed && !analyzing && (
              <div style={{ ...glass(14), padding:'36px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12, opacity:.5 }}>🤖</div>
                <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:18, color:T.white, marginBottom:8 }}>Configurá el rival y ejecutá el análisis</div>
                <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, maxWidth:440, margin:'0 auto 20px' }}>La IA cruzará las métricas reales de tu plantel con la táctica y estilo del rival.</div>
                <button onClick={runAnalysis} style={{ padding:'11px 28px', background:`linear-gradient(135deg,${T.naranja} 0%,#C94E1E 100%)`, border:'none', borderRadius:10, fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.white }}>GENERAR ANÁLISIS</button>
              </div>
            )}

            {analyzing && (
              <div style={{ ...glass(14), padding:'40px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12, animation:'pulse 1s ease infinite' }}>⚙️</div>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:16, color:T.cian }}>Procesando datos con IA...</div>
              </div>
            )}

            {analyzed && !analyzing && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ ...glass(14), padding:'20px 24px', border:`1px solid rgba(70,199,240,.20)`, background:'rgba(70,199,240,.04)' }}>
                  <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:18, color:T.white }}>
                    Probabilidades vs {rivalName} — {tacPropia}
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                  {[
                    { l:'Victoria', p: estPropio==='ofensivo'?54:estPropio==='equilibrado'?42:30, c:T.green,  i:'🏆' },
                    { l:'Empate',   p:24, c:T.cian,  i:'🤝' },
                    { l:'Derrota',  p: estPropio==='ofensivo'?22:estPropio==='equilibrado'?34:46, c:T.red,    i:'📉' },
                  ].map((r, i) => (
                    <div key={i} style={{ ...glass(14), padding:'20px', textAlign:'center', border:`1px solid ${r.c}22` }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>{r.i}</div>
                      <div style={{ fontFamily:T.mono, fontSize:36, fontWeight:700, color:r.c, lineHeight:1 }}>{r.p}%</div>
                      <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, margin:'8px 0 10px' }}>{r.l}</div>
                      <div style={{ height:6, background:'rgba(255,255,255,.06)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${r.p}%`, background:r.c, borderRadius:4 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ ...glass(14), padding:'20px 24px' }}>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14 }}>Recomendaciones tácticas</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      { tipo:'Fortaleza', texto:`Mediocampo superior en GPS a ${rivalName}. Aprovechar transiciones.`,          c:T.green   },
                      { tipo:'Atención',  texto:'Santiago López con carga alta (98%). Considerar rotación.',                      c:T.naranja },
                      { tipo:'Táctica',   texto:`Contra ${tacRival}, presión alta con mediocampistas de sprint.`,                 c:T.cian    },
                      { tipo:'Físico',    texto:'Emiliano Díaz (lesión) fuera. Defensa ajustada automáticamente.',               c:T.red     },
                    ].map((r, i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <div style={{ ...glass(8), padding:'3px 10px', flexShrink:0, border:`1px solid ${r.c}33`, background:r.c+'11' }}>
                          <span style={{ fontFamily:T.dm, fontSize:10, fontWeight:600, color:r.c }}>{r.tipo}</span>
                        </div>
                        <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted, lineHeight:1.6 }}>{r.texto}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
