// ── Shared components ──────────────────────────────────────────
function Badge({label, color=T.cian}) {
  const bg = color===T.cian?T.cianDim:color===T.naranja?T.naranjaDim:color===T.green?T.greenDim:'rgba(255,255,255,0.07)';
  return html`<span style=${{fontFamily:T.dm,fontSize:10,fontWeight:600,color,background:bg,border:`1px solid ${color}22`,borderRadius:20,padding:'2px 8px',letterSpacing:.4,whiteSpace:'nowrap'}}>${label}</span>`;
}
function MiniBar({val,max=100,width=80}) {
  const c=val>=90?T.red:val>=75?T.naranja:T.cian;
  return html`<div style=${{width,height:4,background:'rgba(255,255,255,0.07)',borderRadius:2,overflow:'hidden'}}><div style=${{height:'100%',width:`${Math.min((val/max)*100,100)}%`,background:c,borderRadius:2}}/></div>`;
}
function ScoreBar({val}) {
  const n=parseFloat(val); const c=n>=80?T.cian:n>=65?T.naranja:T.muted;
  return html`<div style=${{display:'flex',alignItems:'center',gap:8}}>
    <div style=${{flex:1,height:5,background:'rgba(255,255,255,0.07)',borderRadius:3,overflow:'hidden'}}>
      <div style=${{height:'100%',width:`${n}%`,background:c,borderRadius:3}}/>
    </div>
    <span style=${{fontFamily:T.mono,fontSize:12,fontWeight:700,color:c,width:38,textAlign:'right'}}>${val}</span>
  </div>`;
}
function Logo({size='md'}) {
  const lg=size==='lg'; const ic=lg?48:36; const fs=lg?26:16;
  return html`<div style=${{display:'flex',alignItems:'center',gap:lg?14:10}}>
    <div style=${{width:ic,height:ic,borderRadius:lg?14:10,flexShrink:0,background:'linear-gradient(145deg,#F36C3A 0%,#C94E1E 100%)',boxShadow:'0 4px 16px rgba(243,108,58,.40)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <svg width=${ic*.62} height=${ic*.62} viewBox="0 0 24 24" fill="none">
        <polyline points="1,13 5,13 7,7 9,17 11,10 13,13 16,13" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
        <path d="M17 4l-4 7h4l-4 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <div>
      <div style=${{fontFamily:T.exo,fontWeight:800,fontSize:fs,color:T.white,letterSpacing:2,lineHeight:1}}>ELI<span style=${{color:T.naranja}}>TRAX</span></div>
      <div style=${{fontFamily:T.dm,fontSize:lg?11:9,color:T.cian,letterSpacing:2,opacity:.7,marginTop:2}}>PLATAFORMA PRO+</div>
    </div>
  </div>`;
}