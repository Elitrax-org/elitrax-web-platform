// elitrax-optimizacion.jsx — OptimizacionView
// OPTIMIZACIÓN IA
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const TACTICAS = [
  { id:'4-4-2',   label:'4-4-2 Clásico'    },
  { id:'4-3-3',   label:'4-3-3 Ofensivo'   },
  { id:'5-3-2',   label:'5-3-2 Defensivo'  },
  { id:'4-2-3-1', label:'4-2-3-1 Control'  },
  { id:'3-5-2',   label:'3-5-2 Mixto'      },
];

const ESTILOS = [
  { id:'ofensivo',  label:'Ofensivo',  color:'#F36C3A' },
  { id:'equilibrado', label:'Equilibrado', color:'#46C7F0' },
  { id:'defensivo', label:'Defensivo', color:'#4ADE80' },
];

const VAR_DEFAULTS = [
  { id:1, nombre:'Definición',          peso:8 },
  { id:2, nombre:'Duelos individuales', peso:7 },
  { id:3, nombre:'Precisión de pase',   peso:6 },
  { id:4, nombre:'Cabezazo',            peso:5 },
  { id:5, nombre:'Regates',             peso:7 },
];

// Valoraciones iniciales por jugador (1-10 por variable)
const genValoraciones = () => {
  const v = {};
  PLAYERS.forEach(p => {
    v[p.id] = {};
    VAR_DEFAULTS.forEach(va => { v[p.id][va.id] = Math.floor(Math.random()*4)+6; });
  });
  return v;
};

// Puntuación IA compuesta (variables técnicas 60% + métricas GPS 40%)
function calcScore(player, vars, valoraciones, pesoTactica) {
  if (!valoraciones[player.id]) return 0;
  const techScore = vars.reduce((sum, v) => {
    const val = valoraciones[player.id][v.id] || 5;
    return sum + (val / 10) * v.peso;
  }, 0) / Math.max(vars.reduce((s,v)=>s+v.peso,0),1);

  const gpsScore = Math.min(
    (player.km / 12) * 0.35 +
    (player.sprints / 40) * 0.35 +
    (player.vel / 34) * 0.30,
    1
  );
  const cargaPenalty = player.estado === 'lesion' ? 0.4 : player.carga >= 90 ? 0.85 : 1;
  return ((techScore * 0.6 + gpsScore * 0.4) * cargaPenalty * 100).toFixed(1);
}

function ScoreBar({ val, max=100 }) {
  const n = parseFloat(val);
  const color = n >= 80 ? T.cian : n >= 65 ? T.naranja : T.muted;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <div style={{ flex:1, height:5, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${(n/max)*100}%`, background:color, borderRadius:3, transition:'width 0.4s' }}/>
      </div>
      <span style={{ fontFamily:T.mono, fontSize:12, fontWeight:700, color, width:38, textAlign:'right' }}>{val}</span>
    </div>
  );
}

function OptimizacionView() {
  const [tab, setTab] = React.useState('variables');
  const [vars, setVars] = React.useState(VAR_DEFAULTS);
  const [valoraciones, setValoraciones] = React.useState(genValoraciones);
  const [newVarName, setNewVarName] = React.useState('');
  const [newVarPeso, setNewVarPeso] = React.useState(5);
  const [tacticaPropia, setTacticaPropia] = React.useState('4-3-3');
  const [estiloPropio, setEstiloPropio] = React.useState('ofensivo');
  const [tacticaRival, setTacticaRival] = React.useState('4-4-2');
  const [estiloRival, setEstiloRival] = React.useState('defensivo');
  const [rivalName, setRivalName] = React.useState('Talleres');
  const [analyzing, setAnalyzing] = React.useState(false);
  const [analyzed, setAnalyzed] = React.useState(false);

  const scores = PLAYERS.map(p => ({
    ...p,
    score: calcScore(p, vars, valoraciones, tacticaPropia),
  })).sort((a,b) => parseFloat(b.score)-parseFloat(a.score));

  const disponibles = scores.filter(p => p.estado !== 'lesion');
  const titulares = disponibles.slice(0,11);
  const suplentes = disponibles.slice(11);

  const addVar = () => {
    if (!newVarName.trim()) return;
    const nv = { id: Date.now(), nombre: newVarName.trim(), peso: newVarPeso };
    setVars(v => [...v, nv]);
    setValoraciones(prev => {
      const next = {...prev};
      PLAYERS.forEach(p => { next[p.id] = {...(next[p.id]||{}), [nv.id]: 6}; });
      return next;
    });
    setNewVarName(''); setNewVarPeso(5);
  };

  const removeVar = (id) => setVars(v => v.filter(x=>x.id!==id));

  const setVal = (playerId, varId, val) => {
    setValoraciones(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], [varId]: val }
    }));
  };

  const runAnalysis = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 2200);
  };

  const TABS = [
    { id:'variables', label:'Variables técnicas' },
    { id:'valoracion', label:'Valoración plantel' },
    { id:'equipo',    label:'Equipo óptimo' },
    { id:'rival',     label:'Análisis rival' },
  ];

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

      {/* Header */}
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
          <button onClick={runAnalysis} disabled={analyzing} style={{
            height:40, padding:'0 22px',
            background: analyzing ? T.naranjaDim : `linear-gradient(135deg, ${T.naranja} 0%, #C94E1E 100%)`,
            border: analyzing ? `1px solid ${T.naranja}` : 'none',
            borderRadius:10, fontFamily:T.exo, fontWeight:700, fontSize:13, letterSpacing:1,
            color: analyzing ? T.naranja : T.white,
            boxShadow: analyzing ? 'none' : '0 4px 16px rgba(243,108,58,0.35)',
            display:'flex', alignItems:'center', gap:8, transition:'all 0.25s',
          }}>
            <span style={{ fontSize:16 }}>{analyzing ? '⏳' : '🤖'}</span>
            {analyzing ? 'CALCULANDO...' : 'GENERAR ANÁLISIS'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, borderBottom:`1px solid ${T.border}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 18px', border:'none', borderRadius:'8px 8px 0 0',
              background: tab===t.id ? T.bg2 : 'transparent',
              fontFamily:T.dm, fontSize:13, fontWeight: tab===t.id ? 600 : 400,
              color: tab===t.id ? T.white : T.muted,
              borderBottom: tab===t.id ? `2px solid ${T.cian}` : '2px solid transparent',
              transition:'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>

        {/* ── TAB: VARIABLES ── */}
        {tab === 'variables' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, alignItems:'start' }}>

            {/* Variables existentes */}
            <div style={{ ...glass(14), overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}`,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>
                  Variables activas
                </div>
                <Badge label={`${vars.length} variables`} color={T.cian}/>
              </div>
              <div style={{ padding:'8px 0' }}>
                {vars.map((v,i) => (
                  <div key={v.id} style={{
                    padding:'12px 20px', display:'flex', alignItems:'center', gap:12,
                    borderBottom: i<vars.length-1 ? `1px solid ${T.border}` : 'none',
                  }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:T.cianDim,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:T.mono, fontSize:11, color:T.cian, fontWeight:700 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{v.nombre}</div>
                      <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>
                        Peso: <span style={{ color:T.cian }}>{v.peso}</span>
                      </div>
                    </div>
                    {/* Peso slider */}
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <input type="range" min="1" max="10" value={v.peso}
                        onChange={e => setVars(prev => prev.map(x => x.id===v.id ? {...x, peso:+e.target.value} : x))}
                        style={{ width:80, accentColor:T.cian }}/>
                      <span style={{ fontFamily:T.mono, fontSize:12, color:T.cian, width:16 }}>{v.peso}</span>
                    </div>
                    <button onClick={() => removeVar(v.id)} style={{
                      background:'none', border:'none', color:T.red, fontSize:16, opacity:0.6,
                      padding:'2px 6px', lineHeight:1,
                    }}>×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Agregar nueva variable */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ ...glass(14), padding:'20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:16 }}>
                  Agregar variable
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.6, marginBottom:6 }}>
                    NOMBRE
                  </div>
                  <input value={newVarName} onChange={e => setNewVarName(e.target.value)}
                    placeholder="Ej: Fuerza de disparo, Salto..."
                    style={{ width:'100%', ...glass(8), border:`1px solid ${T.border}`,
                      padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white,
                      outline:'none', display:'block' }}/>
                </div>
                <div style={{ marginBottom:16 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.6, marginBottom:6 }}>
                    PESO (1–10) — <span style={{ color:T.cian }}>{newVarPeso}</span>
                  </div>
                  <input type="range" min="1" max="10" value={newVarPeso}
                    onChange={e => setNewVarPeso(+e.target.value)}
                    style={{ width:'100%', accentColor:T.naranja }}/>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:4 }}>
                    <span style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>Baja importancia</span>
                    <span style={{ fontFamily:T.dm, fontSize:10, color:T.faint }}>Alta importancia</span>
                  </div>
                </div>
                <button onClick={addVar} style={{
                  width:'100%', height:40,
                  background:`linear-gradient(135deg, ${T.cian} 0%, #2EB5E0 100%)`,
                  border:'none', borderRadius:8,
                  fontFamily:T.exo, fontWeight:700, fontSize:13, color:T.bg, letterSpacing:0.8,
                }}>
                  + AGREGAR VARIABLE
                </button>
              </div>

              {/* Ponderación info */}
              <div style={{ ...glass(14), padding:'16px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>
                  Ponderación del score IA
                </div>
                {[
                  { label:'Variables técnicas (tu criterio)', pct:60, color:T.naranja },
                  { label:'Métricas GPS / IMU (dispositivo)', pct:40, color:T.cian },
                ].map((p,i) => (
                  <div key={i} style={{ marginBottom: i===0 ? 10 : 0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontFamily:T.dm, fontSize:12, color:T.muted }}>{p.label}</span>
                      <span style={{ fontFamily:T.mono, fontSize:12, color:p.color, fontWeight:700 }}>{p.pct}%</span>
                    </div>
                    <div style={{ height:5, background:'rgba(255,255,255,0.06)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${p.pct}%`, background:p.color, borderRadius:3 }}/>
                    </div>
                  </div>
                ))}
                <div style={{ fontFamily:T.dm, fontSize:11, color:T.faint, marginTop:12, lineHeight:1.6 }}>
                  Las cargas físicas y lesiones aplican penalizaciones automáticas al score final de cada jugador.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB: VALORACIÓN PLANTEL ── */}
        {tab === 'valoracion' && (
          <div style={{ ...glass(14), overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>
                Valoración técnica por jugador
              </div>
              <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:3 }}>
                Puntuá cada variable del 1 al 10 para cada jugador
              </div>
            </div>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead>
                  <tr style={{ background:'rgba(255,255,255,0.03)' }}>
                    <th style={{ padding:'10px 16px', fontFamily:T.dm, fontSize:10, color:T.faint,
                      textAlign:'left', borderBottom:`1px solid ${T.border}`, whiteSpace:'nowrap' }}>JUGADOR</th>
                    {vars.map(v => (
                      <th key={v.id} style={{ padding:'10px 12px', fontFamily:T.dm, fontSize:10, color:T.faint,
                        textAlign:'center', borderBottom:`1px solid ${T.border}`, whiteSpace:'nowrap' }}>
                        {v.nombre}
                      </th>
                    ))}
                    <th style={{ padding:'10px 12px', fontFamily:T.dm, fontSize:10, color:T.cian,
                      textAlign:'center', borderBottom:`1px solid ${T.border}` }}>SCORE IA</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((p,i) => (
                    <tr key={p.id} style={{
                      borderBottom:`1px solid ${T.border}`,
                      background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                      opacity: p.estado==='lesion' ? 0.45 : 1,
                    }}>
                      <td style={{ padding:'10px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:28, height:28, borderRadius:'50%',
                            background:`linear-gradient(135deg, ${T.cian}44 0%, ${T.bg3} 100%)`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontFamily:T.exo, fontWeight:700, fontSize:9, color:T.cian, flexShrink:0 }}>
                            {p.name.split(' ').map(n=>n[0]).join('')}
                          </div>
                          <div>
                            <div style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{p.name}</div>
                            <div style={{ fontFamily:T.dm, fontSize:10, color:T.muted }}>{p.pos}</div>
                          </div>
                          {p.estado !== 'ok' && (
                            <Badge label={p.estado==='lesion' ? 'Lesión' : 'Alerta'} color={p.estado==='lesion' ? T.red : T.naranja}/>
                          )}
                        </div>
                      </td>
                      {vars.map(v => (
                        <td key={v.id} style={{ padding:'8px 12px', textAlign:'center' }}>
                          <select
                            value={(valoraciones[p.id]||{})[v.id] || 5}
                            onChange={e => setVal(p.id, v.id, +e.target.value)}
                            disabled={p.estado==='lesion'}
                            style={{ background:T.bg2, border:`1px solid ${T.border}`, borderRadius:6,
                              fontFamily:T.mono, fontSize:12, color:T.cian, padding:'3px 6px',
                              width:52, textAlign:'center', cursor:'pointer' }}>
                            {[1,2,3,4,5,6,7,8,9,10].map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        </td>
                      ))}
                      <td style={{ padding:'8px 16px', minWidth:140 }}>
                        <ScoreBar val={p.score}/>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: EQUIPO ÓPTIMO ── */}
        {tab === 'equipo' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Táctica y estilo */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>
                  Formación táctica
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                  {TACTICAS.map(t => (
                    <button key={t.id} onClick={() => setTacticaPropia(t.id)} style={{
                      padding:'8px 14px', borderRadius:8,
                      border:`1.5px solid ${tacticaPropia===t.id ? T.cian : T.border}`,
                      background: tacticaPropia===t.id ? T.cianDim : 'transparent',
                      fontFamily:T.dm, fontSize:12,
                      color: tacticaPropia===t.id ? T.cian : T.muted,
                      fontWeight: tacticaPropia===t.id ? 600 : 400, transition:'all 0.15s',
                    }}>{t.label}</button>
                  ))}
                </div>
              </div>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:12 }}>
                  Estilo de juego
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  {ESTILOS.map(e => (
                    <button key={e.id} onClick={() => setEstiloPropio(e.id)} style={{
                      flex:1, padding:'10px 8px', borderRadius:8,
                      border:`1.5px solid ${estiloPropio===e.id ? e.color : T.border}`,
                      background: estiloPropio===e.id ? `${e.color}18` : 'transparent',
                      fontFamily:T.dm, fontSize:12,
                      color: estiloPropio===e.id ? e.color : T.muted,
                      fontWeight: estiloPropio===e.id ? 600 : 400, transition:'all 0.15s',
                    }}>{e.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Titulares recomendados */}
            <div style={{ ...glass(14), overflow:'hidden' }}>
              <div style={{ padding:'14px 20px', borderBottom:`1px solid ${T.border}`,
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white }}>
                    XI Titular recomendado
                  </div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginTop:2 }}>
                    Ordenado por score IA · {tacticaPropia} · {ESTILOS.find(e=>e.id===estiloPropio)?.label}
                  </div>
                </div>
                <Badge label="Optimizado por IA" color={T.cian}/>
              </div>
              <div style={{ padding:'8px 0' }}>
                {titulares.map((p,i) => (
                  <div key={p.id} style={{
                    padding:'11px 20px', display:'flex', alignItems:'center', gap:14,
                    borderBottom: i<titulares.length-1 ? `1px solid ${T.border}` : 'none',
                    background: i===0 ? 'rgba(70,199,240,0.04)' : 'transparent',
                  }}>
                    <div style={{ width:26, height:26, borderRadius:7,
                      background: i<3 ? `linear-gradient(135deg, ${T.cian}55, ${T.bg3})` : T.bg3,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:T.mono, fontSize:11, fontWeight:700,
                      color: i<3 ? T.cian : T.faint, flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0,
                      background:`linear-gradient(135deg, ${T.cian}44 0%, ${T.bg3} 100%)`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:T.exo, fontWeight:700, fontSize:10, color:T.cian }}>
                      {p.name.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:T.dm, fontSize:13, color:T.white, fontWeight:500 }}>{p.name}</div>
                      <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted }}>{p.pos} · #{p.num}</div>
                    </div>
                    <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                      <Badge label={`${p.km} km`} color={T.cian}/>
                      {p.carga >= 85 && <Badge label={`Carga ${p.carga}%`} color={T.naranja}/>}
                    </div>
                    <div style={{ width:160, flexShrink:0 }}>
                      <ScoreBar val={p.score}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suplentes */}
            {suplentes.length > 0 && (
              <div style={{ ...glass(14), overflow:'hidden' }}>
                <div style={{ padding:'12px 20px', borderBottom:`1px solid ${T.border}` }}>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white }}>
                    Banco de suplentes
                  </div>
                </div>
                <div style={{ padding:'4px 0' }}>
                  {suplentes.map((p,i) => (
                    <div key={p.id} style={{
                      padding:'9px 20px', display:'flex', alignItems:'center', gap:14,
                      borderBottom: i<suplentes.length-1 ? `1px solid ${T.border}` : 'none', opacity:0.7,
                    }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:T.bg3,
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:T.mono, fontSize:11, color:T.faint }}>{11+i+1}</div>
                      <div style={{ flex:1 }}>
                        <span style={{ fontFamily:T.dm, fontSize:12, color:T.white }}>{p.name}</span>
                        <span style={{ fontFamily:T.dm, fontSize:11, color:T.muted, marginLeft:8 }}>{p.pos}</span>
                      </div>
                      <div style={{ width:140 }}><ScoreBar val={p.score}/></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ANÁLISIS RIVAL ── */}
        {tab === 'rival' && (
          <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

            {/* Rival config */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>
                  Rival del fin de semana
                </div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.6, marginBottom:6 }}>NOMBRE DEL EQUIPO</div>
                  <input value={rivalName} onChange={e => setRivalName(e.target.value)}
                    style={{ width:'100%', ...glass(8), border:`1px solid ${T.border}`,
                      padding:'10px 14px', fontFamily:T.dm, fontSize:13, color:T.white, outline:'none' }}/>
                </div>
                <div>
                  <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:0.6, marginBottom:8 }}>
                    TÁCTICA PROBABLE
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                    {TACTICAS.map(t => (
                      <button key={t.id} onClick={() => setTacticaRival(t.id)} style={{
                        padding:'6px 12px', borderRadius:7,
                        border:`1.5px solid ${tacticaRival===t.id ? T.naranja : T.border}`,
                        background: tacticaRival===t.id ? T.naranjaDim : 'transparent',
                        fontFamily:T.dm, fontSize:11,
                        color: tacticaRival===t.id ? T.naranja : T.muted,
                        fontWeight: tacticaRival===t.id ? 600 : 400, transition:'all 0.15s',
                      }}>{t.label}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ ...glass(14), padding:'18px 20px' }}>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:13, color:T.white, marginBottom:14 }}>
                  Estilo de juego rival
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ESTILOS.map(e => (
                    <button key={e.id} onClick={() => setEstiloRival(e.id)} style={{
                      padding:'10px 14px', borderRadius:8, textAlign:'left',
                      border:`1.5px solid ${estiloRival===e.id ? e.color : T.border}`,
                      background: estiloRival===e.id ? `${e.color}18` : 'transparent',
                      fontFamily:T.dm, fontSize:12,
                      color: estiloRival===e.id ? e.color : T.muted,
                      fontWeight: estiloRival===e.id ? 600 : 400, transition:'all 0.15s',
                    }}>{e.label}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Predicción de resultados */}
            {!analyzed && !analyzing && (
              <div style={{ ...glass(14), padding:'36px', textAlign:'center' }}>
                <div style={{ fontSize:40, marginBottom:12, opacity:0.5 }}>🤖</div>
                <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:18, color:T.white, marginBottom:8 }}>
                  Configurá el rival y ejecutá el análisis
                </div>
                <div style={{ fontFamily:T.dm, fontSize:13, color:T.muted, maxWidth:440, margin:'0 auto 20px' }}>
                  La IA cruzará las métricas reales de tu plantel con la táctica y estilo del rival para calcular probabilidades de resultado.
                </div>
                <button onClick={runAnalysis} style={{
                  padding:'11px 28px',
                  background:`linear-gradient(135deg, ${T.naranja} 0%, #C94E1E 100%)`,
                  border:'none', borderRadius:10,
                  fontFamily:T.exo, fontWeight:700, fontSize:13, letterSpacing:1, color:T.white,
                  boxShadow:'0 4px 16px rgba(243,108,58,0.35)',
                }}>GENERAR ANÁLISIS</button>
              </div>
            )}

            {analyzing && (
              <div style={{ ...glass(14), padding:'40px', textAlign:'center' }}>
                <div style={{ fontSize:36, marginBottom:12, animation:'pulse 1s ease infinite' }}>⚙️</div>
                <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:16, color:T.cian }}>
                  Procesando datos con IA...
                </div>
                <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginTop:8 }}>
                  Cruzando variables técnicas · métricas GPS · táctica {tacticaRival} rival
                </div>
              </div>
            )}

            {analyzed && !analyzing && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

                {/* Resultado encabezado */}
                <div style={{ ...glass(14), padding:'20px 24px',
                  border:`1px solid rgba(70,199,240,0.20)`,
                  background:'rgba(70,199,240,0.04)' }}>
                  <div style={{ fontFamily:T.dm, fontSize:12, color:T.muted, marginBottom:4 }}>
                    Análisis vs <span style={{ color:T.white, fontWeight:600 }}>{rivalName}</span> · {TACTICAS.find(t=>t.id===tacticaRival)?.label}
                  </div>
                  <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:18, color:T.white }}>
                    Probabilidades de resultado — Formación {tacticaPropia}
                  </div>
                </div>

                {/* Barras de probabilidad */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
                  {[
                    { label:'Victoria', pct: estiloPropio==='ofensivo' ? 54 : estiloPropio==='equilibrado' ? 42 : 30, color:T.green, icon:'🏆' },
                    { label:'Empate',   pct: 24, color:T.cian,   icon:'🤝' },
                    { label:'Derrota',  pct: estiloPropio==='ofensivo' ? 22 : estiloPropio==='equilibrado' ? 34 : 46, color:T.red,   icon:'📉' },
                  ].map((r,i) => (
                    <div key={i} style={{ ...glass(14), padding:'20px', textAlign:'center',
                      border:`1px solid ${r.color}22` }}>
                      <div style={{ fontSize:28, marginBottom:8 }}>{r.icon}</div>
                      <div style={{ fontFamily:T.mono, fontSize:36, fontWeight:700, color:r.color, lineHeight:1 }}>
                        {r.pct}%
                      </div>
                      <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, margin:'8px 0 10px' }}>
                        {r.label}
                      </div>
                      <div style={{ height:6, background:'rgba(255,255,255,0.06)', borderRadius:4, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:4 }}/>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recomendaciones tácticas */}
                <div style={{ ...glass(14), padding:'20px 24px' }}>
                  <div style={{ fontFamily:T.exo, fontWeight:600, fontSize:14, color:T.white, marginBottom:14 }}>
                    Recomendaciones tácticas de la IA
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {[
                      { tipo:'Fortaleza', texto:`Tu línea de mediocampo supera en promedio GPS a ${rivalName}. Aprovechar transiciones rápidas.`, color:T.green },
                      { tipo:'Atención', texto:`Santiago López tiene carga alta (98%). Considerar rotación o uso parcial del partido.`, color:T.naranja },
                      { tipo:'Táctica', texto:`Contra formación ${tacticaRival}, se recomienda presión alta con mediocampistas de alto sprint.`, color:T.cian },
                      { tipo:'Físico', texto:`Emiliano Díaz (lesión) fuera de la convocatoria. Línea defensiva ajustada automáticamente.`, color:T.red },
                    ].map((rec,i) => (
                      <div key={i} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                        <div style={{ ...glass(8), padding:'3px 10px', flexShrink:0,
                          border:`1px solid ${rec.color}33`, background:`${rec.color}11` }}>
                          <span style={{ fontFamily:T.dm, fontSize:10, fontWeight:600, color:rec.color, letterSpacing:0.5 }}>
                            {rec.tipo}
                          </span>
                        </div>
                        <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted, lineHeight:1.6 }}>{rec.texto}</span>
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
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object.assign(window, { OptimizacionView });
