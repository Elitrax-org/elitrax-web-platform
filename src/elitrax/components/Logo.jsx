import { T } from '../tokens'

export default function Logo({ size = 'md' }) {
  const lg = size === 'lg'
  const ic = lg ? 48 : 36
  const fs = lg ? 26 : 16

  return (
    <div style={{ display:'flex', alignItems:'center', gap: lg ? 14 : 10 }}>
      <div style={{
        width: ic, height: ic, borderRadius: lg ? 14 : 10, flexShrink: 0,
        background: 'linear-gradient(145deg,#F36C3A 0%,#C94E1E 100%)',
        boxShadow: '0 4px 16px rgba(243,108,58,.40)',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <svg width={ic * 0.62} height={ic * 0.62} viewBox="0 0 24 24" fill="none">
          <polyline
            points="1,13 5,13 7,7 9,17 11,10 13,13 16,13"
            stroke="white" strokeWidth="1.8"
            strokeLinecap="round" strokeLinejoin="round" opacity=".9"
          />
          <path
            d="M17 4l-4 7h4l-4 9"
            stroke="white" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <div style={{ fontFamily:T.exo, fontWeight:800, fontSize:fs, color:T.white, letterSpacing:2, lineHeight:1 }}>
          ELI<span style={{ color:T.naranja }}>TRAX</span>
        </div>
        <div style={{ fontFamily:T.dm, fontSize: lg ? 11 : 9, color:T.cian, letterSpacing:2, opacity:.7, marginTop:2 }}>
          PLATAFORMA PRO+
        </div>
      </div>
    </div>
  )
}
