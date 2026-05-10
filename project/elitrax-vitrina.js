// ── VITRINA / SCOUTS ───────────────────────────────────────────
const POSF=['Todos','Arquero','Defensor','Mediocampista','Delantero'];

function PlayerModal({player,onClose,contactados,onContact}) {
  if(!player)return null;
  const isCont=contactados.includes(player.id);
  const [vp,setVp]=useState(null);
  return html`<div onClick=${onClose} style=${{position:'fixed',inset:0,background:'rgba(0,0,0,.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:24,backdropFilter:'blur(6px)'}}>
    <div onClick=${e=>e.stopPropagation()} style=${{...glass(20),width:'100%',maxWidth:820,maxHeight:'88vh',overflowY:'auto',border:`1px solid ${T.borderHi}`,animation:'fadeUp .25s ease both'}}>
      <div style=${{padding:'24px 28px',borderBottom:`1px solid ${T.border}`,display:'flex',gap:16,alignItems:'flex-start'}}>
        <div style=${{width:64,height:64,borderRadius:18,flexShrink:0,background:`linear-gradient(135deg,${T.cian}55 0%,${T.bg3} 100%)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:T.exo,fontWeight:800,fontSize:20,color:T.cian}}>${initials(player.name)}</div>
        <div style=${{flex:1}}>
          <div style=${{fontFamily:T.exo,fontWeight:700,fontSize:22,color:T.white}}>${player.name}</div>
          <div style=${{fontFamily:T.dm,fontSize:13,color:T.muted,marginTop:3}}>${player.pos} · ${player.age} años · #${player.num}</div>
          <div style=${{display:'flex',gap:5,flexWrap:'wrap',marginTop:8}}>${player.tags.map(t=>html`<span key=${t} style=${{fontFamily:T.dm,fontSize:10,fontWeight:600,color:T.cian,background:T.cianDim,border:`1px solid ${T.cian}22`,borderRadius:20,padding:'3px 9px'}}>${t}</span>`)}</div>
        </div>
        <button onClick=${onClose} style=${{background:'none',border:'none',color:T.muted,fontSize:22,lineHeight:1,padding:'2px 6px',flexShrink:0}}>×</button>
      </div>
      <div style=${{padding:'24px 28px',display:'flex',flexDirection:'column',gap:22}}>
        <div>
          <div style=${{fontFamily:T.dm,fontSize:11,color:T.muted,letterSpacing:.8,marginBottom:8}}>DESCRIPCIÓN</div>
          <div style=${{fontFamily:T.dm,fontSize:14,color:T.white,lineHeight:1.7,background:'rgba(255,255,255,.03)',borderRadius:10,padding:'14px 16px',border:`1px solid ${T.border}`}}>"${player.desc}"</div>
        </div>
        <div>
          <div style=${{fontFamily:T.dm,fontSize:11,color:T.muted,letterSpacing:.8,marginBottom:12}}>MÉTRICAS GPS / IMU</div>
          <div style=${{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:10}}>
            ${[{k:'km',l:'Dist.',u:'km',c:T.cian},{k:'vel',l:'Vel. máx.',u:'km/h',c:T.naranja},{k:'sprints',l:'Sprints',u:'/ses',c:T.cian},{k:'saltos',l:'Saltos',u:'/ses',c:T.green},{k:'distSprint',l:'Dist. sprint',u:'m',c:T.naranja}].map(m=>html`
              <div key=${m.k} style=${{background:'rgba(255,255,255,.04)',borderRadius:12,padding:'14px 12px',textAlign:'center',border:`1px solid ${T.border}`}}>
                <div style=${{fontFamily:T.mono,fontSize:22,fontWeight:700,color:m.c,lineHeight:1}}>${player[m.k]}</div>
                <div style=${{fontFamily:T.dm,fontSize:9,color:T.faint,marginTop:4}}>${m.u}</div>
                <div style=${{fontFamily:T.dm,fontSize:10,color:T.muted,marginTop:2}}>${m.l}</div>
              </div>`)}
          </div>
          <div style=${{marginTop:12,display:'flex',alignItems:'center',gap:12}}>
            <span style=${{fontFamily:T.dm,fontSize:11,color:T.muted,width:120,flexShrink:0}}>Carga física semana</span>
            <div style=${{flex:1,height:6,background:'rgba(255,255,255,.07)',borderRadius:3,overflow:'hidden'}}><div style=${{height:'100%',borderRadius:3,width:`${player.carga}%`,background:player.carga>=90?T.red:player.carga>=75?T.naranja:T.cian}}/></div>
            <span style=${{fontFamily:T.mono,fontSize:12,fontWeight:700,width:40,textAlign:'right',color:player.carga>=90?T.red:player.carga>=75?T.naranja:T.cian}}>${player.carga}%</span>
          </div>
        </div>
        <div>
          <div style=${{fontFamily:T.dm,fontSize:11,color:T.muted,letterSpacing:.8,marginBottom:12}}>VIDEOS (${player.videos})</div>
          ${player.videos===0
            ?html`<div style=${{background:'rgba(255,255,255,.03)',borderRadius:10,padding:'20px',textAlign:'center',border:`1px solid ${T.border}`}}><div style=${{fontFamily:T.dm,fontSize:13,color:T.faint}}>Sin videos cargados aún</div></div>`
            :html`<div style=${{display:'grid',gridTemplateColumns:`repeat(${Math.min(player.videos,3)},1fr)`,gap:10}}>
              ${Array.from({length:player.videos}).map((_,i)=>html`<div key=${i} onClick=${()=>setVp(vp===i?null:i)} style=${{borderRadius:12,overflow:'hidden',aspectRatio:'16/9',position:'relative',background:`linear-gradient(135deg,${T.bg3} 0%,#0A1628 100%)`,border:`1px solid ${T.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                ${vp===i
                  ?html`<div style=${{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}><div style=${{width:36,height:36,borderRadius:'50%',background:T.naranja,display:'flex',alignItems:'center',justifyContent:'center',animation:'pulse 1s ease infinite',fontSize:16}}>⏸</div><span style=${{fontFamily:T.dm,fontSize:10,color:T.muted}}>Reproduciendo...</span></div>`
                  :html`<div style=${{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}><div style=${{width:44,height:44,borderRadius:'50%',background:`linear-gradient(135deg,${T.naranja},#C94E1E)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>▶</div><span style=${{fontFamily:T.dm,fontSize:11,color:T.muted}}>${['Partido vs Talleres','Entrenamiento','Partido vs Instituto'][i]||'Sesión'}</span></div>`}
                <div style=${{position:'absolute',bottom:8,right:10,fontFamily:T.mono,fontSize:10,color:T.faint}}>${['1:24','0:58','2:07'][i]}</div>
              </div>`)}
            </div>`}
        </div>
        <div style=${{...glass(14),padding:'20px 22px',border:`1px solid ${isCont?T.green+'44':T.naranja+'33'}`,background:isCont?'rgba(74,222,128,.04)':'rgba(243,108,58,.04)',display:'flex',alignItems:'center',gap:16}}>
          <div style=${{flex:1}}>
            <div style=${{fontFamily:T.exo,fontWeight:600,fontSize:14,color:isCont?T.green:T.white,marginBottom:4}}>${isCont?'✓ Interés registrado por Elitrax':'Contactar al jugador vía Elitrax'}</div>
            <div style=${{fontFamily:T.dm,fontSize:12,color:T.muted,lineHeight:1.6}}>${isCont?`Elitrax notificó a ${player.name} que un scout mostró interés.`:`Al hacer clic, Elitrax notifica a ${player.name} que un scout está interesado.`}</div>
          </div>
          ${!isCont&&html`<button onClick=${()=>onContact(player.id)} style=${{padding:'12px 22px',borderRadius:10,flexShrink:0,background:`linear-gradient(135deg,${T.naranja},#C94E1E)`,border:'none',fontFamily:T.exo,fontWeight:700,fontSize:13,color:T.white,whiteSpace:'nowrap'}}>QUIERO CONTACTARLO</button>`}
        </div>
      </div>
    </div>
  </div>`;
}

function VitrinaView() {
  const [search,setSearch]=useState('');
  const [pos,setPos]=useState('Todos');
  const [velMin,setVelMin]=useState(0);
  const [kmMin,setKmMin]=useState(0);
  const [sprMin,setSprMin]=useState(0);
  const [soloV,setSoloV]=useState(false);
  const [sel,setSel]=useState(null);
  const [cont,setCont]=useState([]);
  const [showF,setShowF]=useState(false);
  const contact=id=>setCont(p=>p.includes(id)?p:[...p,id]);
  const filtered=VP.filter(p=>{
    if(pos!=='Todos'&&p.pos!==pos)return false;
    if(search&&!p.name.toLowerCase().includes(search.toLowerCase())&&!p.tags.some(t=>t.toLowerCase().includes(search.toLowerCase())))return false;
    if(p.vel<velMin||p.km<kmMin||p.sprints<sprMin)return false;
    if(soloV&&p.videos===0)return false;
    return true;
  });
  const af=(velMin>0?1:0)+(kmMin>0?1:0)+(sprMin>0?1:0)+(soloV?1:0);
  return html`<div style=${{height:'100%',display:'flex',flexDirection:'column',overflow:'hidden'}}>
    <div style=${{padding:'24px 32px 0',flexShrink:0}}>
      <div style=${{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:18}}>
        <div>
          <div style=${{fontFamily:T.exo,fontWeight:700,fontSize:24,color:T.white}}>Vitrina <span style=${{color:T.cian}}>/ Scouts</span></div>
          <div style=${{fontFamily:T.dm,fontSize:13,color:T.muted,marginTop:3}}>Perfiles públicos · métricas reales · videos</div>
        </div>
        <div style=${{display:'flex',gap:8}}>
          <${Badge} label=${filtered.length+' jugadores'} color=${T.cian}/>
          ${cont.length>0&&html`<${Badge} label=${cont.length+' contactado'+(cont.length>1?'s':'')} color=${T.green}/>`}
        </div>
      </div>
      <div style=${{display:'flex',gap:10,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
        <div style=${{...glass(10),padding:'9px 14px',display:'flex',alignItems:'center',gap:8,border:`1px solid ${T.border}`,flex:'0 0 240px'}}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke=${T.muted} stroke-width="1.2"/><path d="M9 9l3 3" stroke=${T.muted} stroke-width="1.3" stroke-linecap="round"/></svg>
          <input value=${search} onInput=${e=>setSearch(e.target.value)} placeholder="Buscar jugador..." style=${{background:'none',border:'none',outline:'none',fontFamily:T.dm,fontSize:12,color:T.white,flex:1}}/>
        </div>
        <div style=${{display:'flex',gap:6}}>
          ${POSF.map(p=>html`<button key=${p} onClick=${()=>setPos(p)} style=${{padding:'7px 14px',borderRadius:20,border:`1.5px solid ${pos===p?T.cian:T.border}`,background:pos===p?T.cianDim:'transparent',fontFamily:T.dm,fontSize:12,fontWeight:pos===p?600:400,color:pos===p?T.cian:T.muted}}>${p}</button>`)}
        </div>
        <button onClick=${()=>setShowF(f=>!f)} style=${{marginLeft:'auto',...glass(8),padding:'8px 14px',border:`1.5px solid ${showF||af>0?T.naranja:T.border}`,background:showF?T.naranjaDim:'transparent',fontFamily:T.dm,fontSize:12,color:showF||af>0?T.naranja:T.muted,display:'flex',alignItems:'center',gap:6}}>
          <span>⚙ Filtros</span>${af>0&&html`<span style=${{background:T.naranja,color:T.white,borderRadius:'50%',width:16,height:16,fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>${af}</span>`}
        </button>
      </div>
      ${showF&&html`<div style=${{...glass(12),padding:'16px 20px',marginBottom:16,border:`1px solid ${T.naranja}33`,animation:'fadeUp .2s ease both'}}>
        <div style=${{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:18,alignItems:'start'}}>
          ${[{l:'Vel. máx. mínima',v:velMin,set:setVelMin,max:34,u:'km/h'},{l:'Distancia mínima',v:kmMin,set:setKmMin,max:12,u:'km'},{l:'Sprints mínimos',v:sprMin,set:setSprMin,max:40,u:''}].map((f,i)=>html`<div key=${i}>
            <div style=${{fontFamily:T.dm,fontSize:11,color:T.muted,marginBottom:6}}>${f.l}: <span style=${{color:T.naranja,fontWeight:600}}>${f.v}${f.u?' '+f.u:''}</span></div>
            <input type="range" min="0" max=${f.max} value=${f.v} onInput=${e=>f.set(+e.target.value)} style=${{width:'100%',accentColor:T.naranja}}/>
          </div>`)}
          <div style=${{display:'flex',flexDirection:'column',justifyContent:'flex-end',height:'100%'}}>
            <label style=${{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked=${soloV} onChange=${e=>setSoloV(e.target.checked)} style=${{accentColor:T.naranja,width:14,height:14}}/>
              <span style=${{fontFamily:T.dm,fontSize:12,color:T.muted}}>Solo con videos</span>
            </label>
            <button onClick=${()=>{setVelMin(0);setKmMin(0);setSprMin(0);setSoloV(false);}} style=${{marginTop:10,background:'none',border:`1px solid ${T.border}`,borderRadius:7,padding:'5px 10px',fontFamily:T.dm,fontSize:11,color:T.faint}}>Limpiar</button>
          </div>
        </div>
      </div>`}
    </div>
    <div style=${{flex:1,overflowY:'auto',padding:'0 32px 28px'}}>
      ${filtered.length===0
        ?html`<div style=${{textAlign:'center',padding:'60px 0'}}><div style=${{fontSize:40,opacity:.3,marginBottom:12}}>🔭</div><div style=${{fontFamily:T.exo,fontWeight:600,fontSize:16,color:T.muted}}>Sin resultados</div></div>`
        :html`<div style=${{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
          ${filtered.map(p=>{
            const isCont=cont.includes(p.id);
            return html`<div key=${p.id} onClick=${()=>setSel(p)} style=${{...glass(16),padding:'20px',cursor:'pointer',border:`1px solid ${T.border}`,display:'flex',flexDirection:'column',gap:14}}
              onMouseEnter=${e=>{e.currentTarget.style.borderColor='rgba(70,199,240,.30)';e.currentTarget.style.transform='translateY(-2px)';}}
              onMouseLeave=${e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.transform='translateY(0)';}}>
              <div style=${{display:'flex',gap:12,alignItems:'flex-start'}}>
                <div style=${{width:48,height:48,borderRadius:14,flexShrink:0,background:`linear-gradient(135deg,${T.cian}55 0%,${T.bg3} 100%)`,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:T.exo,fontWeight:800,fontSize:15,color:T.cian}}>${initials(p.name)}</div>
                <div style=${{flex:1,minWidth:0}}>
                  <div style=${{fontFamily:T.dm,fontWeight:600,fontSize:14,color:T.white,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>${p.name}</div>
                  <div style=${{fontFamily:T.dm,fontSize:11,color:T.muted,marginTop:2}}>${p.pos} · ${p.age} años</div>
                  <div style=${{display:'flex',gap:4,flexWrap:'wrap',marginTop:6}}>${p.tags.map(t=>html`<span key=${t} style=${{fontFamily:T.dm,fontSize:9,fontWeight:600,color:T.cian,background:T.cianDim,border:`1px solid ${T.cian}22`,borderRadius:20,padding:'2px 7px'}}>${t}</span>`)}</div>
                </div>
              </div>
              <div style=${{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                ${[{l:'Vel. máx',v:p.vel,u:'km/h',c:T.naranja},{l:'Dist.',v:p.km,u:'km',c:T.cian},{l:'Sprints',v:p.sprints,u:'',c:T.cian}].map((m,i)=>html`<div key=${i} style=${{background:'rgba(255,255,255,.04)',borderRadius:8,padding:'8px 10px',textAlign:'center'}}>
                  <div style=${{fontFamily:T.mono,fontSize:14,fontWeight:700,color:m.c}}>${m.v}${m.u}</div>
                  <div style=${{fontFamily:T.dm,fontSize:9,color:T.faint,marginTop:2}}>${m.l}</div>
                </div>`)}
              </div>
              <div style=${{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style=${{fontFamily:T.dm,fontSize:11,color:T.muted}}>▶ ${p.videos>0?p.videos+' video'+(p.videos>1?'s':''):'Sin videos'}</span>
                <button onClick=${e=>{e.stopPropagation();contact(p.id);}} style=${{padding:'6px 14px',borderRadius:8,background:isCont?T.greenDim:`linear-gradient(135deg,${T.naranja},#C94E1E)`,border:isCont?`1px solid ${T.green}`:'none',fontFamily:T.dm,fontSize:11,fontWeight:600,color:isCont?T.green:T.white}}>
                  ${isCont?'✓ Interés enviado':'Contactar vía Elitrax'}
                </button>
              </div>
            </div>`;
          })}
        </div>`}
    </div>
    ${sel&&html`<${PlayerModal} player=${sel} onClose=${()=>setSel(null)} contactados=${cont} onContact=${id=>contact(id)}/>`}
  </div>`;
}