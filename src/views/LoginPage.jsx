import { useState } from 'react'
import { T, glass } from '../tokens'
import Logo from '../components/Logo'
import { useUser } from '../context/UserContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const { login } = useUser()
  const toast     = useToast()
  const [email,   setEmail]   = useState('')
  const [pass,    setPass]    = useState('')
  const [loading, setLoading] = useState(false)
  const [err,     setErr]     = useState('')

  const validate = () => {
    if (!email.trim())        return 'Ingresá tu correo'
    if (!email.includes('@')) return 'Correo inválido'
    if (!pass)                return 'Ingresá tu contraseña'
    if (pass.length < 8)      return 'Mínimo 8 caracteres'
    return null
  }

  const go = async () => {
    const v = validate()
    if (v) { setErr(v); return }
    setErr('')
    setLoading(true)
    try {
      await login(email.trim(), pass)
      toast.success('Inicio de sesión exitoso. Bienvenido.')
    } catch (e) {
      const status = e?.status
      if (status === 401 || status === 400) {
        setErr('Credenciales incorrectas.')
      } else if (status === 429) {
        setErr('Demasiados intentos. Esperá un momento.')
      } else {
        setErr('No se pudo conectar con el servidor.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = e => { if (e.key === 'Enter') go() }

  return (
    <div style={{ width:'100vw', height:'100vh', display:'flex', overflow:'hidden', background:T.bg }}>

      {/* ── Left branding panel ── */}
      <div style={{
        flex:'0 0 44%', position:'relative', overflow:'hidden',
        background: 'linear-gradient(160deg,#0D1E38 0%,#060E1A 60%,#0A1628 100%)',
        display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'48px 52px',
      }}>
        <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.06 }} viewBox="0 0 440 900" preserveAspectRatio="xMidYMid slice">
          {Array.from({length:12}).map((_,i) => <line key={'h'+i} x1="0" y1={i*80} x2="440" y2={i*80} stroke={T.cian} strokeWidth=".5"/>)}
          {Array.from({length:7}).map((_,i)  => <line key={'v'+i} x1={i*80} y1="0" x2={i*80} y2="900" stroke={T.cian} strokeWidth=".5"/>)}
        </svg>
        <div style={{ position:'absolute', top:'35%', left:'30%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle,rgba(243,108,58,.14) 0%,transparent 70%)', transform:'translate(-50%,-50%)', pointerEvents:'none' }} />

        <Logo size="lg" />

        <div style={{ animation:'fadeUp .6s ease both' }}>
          <div style={{ fontFamily:T.exo, fontWeight:800, fontSize:42, color:T.white, lineHeight:1.1, marginBottom:16 }}>
            La data de tu equipo,<br/>
            <span style={{ color:T.cian }}>en tiempo real.</span>
          </div>
          <div style={{ fontFamily:T.dm, fontSize:15, color:T.muted, lineHeight:1.7, maxWidth:320 }}>
            GPS + IMU + IA conversacional para directores técnicos, preparadores físicos, analistas y scouts.
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:32 }}>
            {[
              { icon:'📡', text:'Métricas GPS e IMU en tiempo real'           },
              { icon:'🤖', text:'IA que interpreta el rendimiento del equipo'  },
              { icon:'🔭', text:'Perfiles públicos para captación de talentos' },
            ].map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:T.cianDim, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {f.icon}
                </div>
                <span style={{ fontFamily:T.dm, fontSize:13, color:T.muted }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontFamily:T.dm, fontSize:11, color:T.faint }}>
          © 2026 Elitrax · Córdoba, Argentina · <span style={{ color:T.cian }}>www.elitrax.com</span>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(180deg,${T.bg} 0%,${T.bg1} 100%)`, padding:40 }}>
        <div style={{ width:'100%', maxWidth:420, animation:'fadeUp .5s .1s ease both', opacity:0 }}>
          <div style={{ marginBottom:28 }}>
            <div style={{ fontFamily:T.exo, fontWeight:700, fontSize:28, color:T.white, marginBottom:6 }}>Bienvenido</div>
            <div style={{ fontFamily:T.dm, fontSize:14, color:T.muted }}>Ingresá con tu cuenta institucional Elitrax PRO+</div>
          </div>

          {/* Email */}
          <div style={{ marginBottom:14 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.8, marginBottom:8 }}>CORREO INSTITUCIONAL</div>
            <div style={{ ...glass(10), padding:'13px 16px', display:'flex', alignItems:'center', gap:10, border:`1px solid ${err && !email.trim() ? T.red : T.border}` }}>
              <svg width="16" height="13" viewBox="0 0 16 13" fill="none">
                <rect x="1" y="1" width="14" height="11" rx="2" stroke={T.muted} strokeWidth="1.3"/>
                <path d="M1 4l7 4.5L15 4" stroke={T.muted} strokeWidth="1.3"/>
              </svg>
              <input
                value={email}
                onInput={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="correo@club.com"
                style={{ background:'none', border:'none', outline:'none', flex:1, fontFamily:T.dm, fontSize:14, color:T.white }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom:8 }}>
            <div style={{ fontFamily:T.dm, fontSize:11, color:T.muted, letterSpacing:.8, marginBottom:8 }}>CONTRASEÑA</div>
            <div style={{ ...glass(10), padding:'13px 16px', display:'flex', alignItems:'center', gap:10, border:`1px solid ${err && !pass ? T.red : T.border}` }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                <rect x="1" y="7" width="12" height="8" rx="2" stroke={T.muted} strokeWidth="1.3"/>
                <path d="M4 7V5a3 3 0 016 0v2" stroke={T.muted} strokeWidth="1.3"/>
                <circle cx="7" cy="11.5" r="1.5" fill={T.muted}/>
              </svg>
              <input
                value={pass}
                onInput={e => setPass(e.target.value)}
                onKeyDown={handleKeyDown}
                type="password"
                placeholder="Contraseña"
                style={{ background:'none', border:'none', outline:'none', flex:1, fontFamily:T.dm, fontSize:14, color:T.white }}
              />
            </div>
          </div>

          {err && <div style={{ fontFamily:T.dm, fontSize:12, color:T.red, marginBottom:8 }}>{err}</div>}

          <div style={{ textAlign:'right', marginBottom:24 }}>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.naranja, cursor:'pointer' }}>¿Olvidaste tu contraseña?</span>
          </div>

          <button
            onClick={go}
            disabled={loading}
            style={{
              width:'100%', height:48,
              background: loading ? T.naranjaDim : `linear-gradient(135deg,${T.naranja} 0%,#C94E1E 100%)`,
              border: loading ? `1px solid ${T.naranja}` : 'none',
              borderRadius:12, fontFamily:T.exo, fontWeight:700, fontSize:15,
              letterSpacing:1.5, color: loading ? T.naranja : T.white,
              boxShadow: loading ? 'none' : '0 6px 20px rgba(243,108,58,.35)',
              transition:'all .25s',
            }}
          >
            {loading ? 'INGRESANDO...' : 'INGRESAR'}
          </button>

          <div style={{ textAlign:'center', marginTop:20 }}>
            <span style={{ fontFamily:T.dm, fontSize:12, color:T.faint }}>¿No tenés cuenta? </span>
            <a href="https://www.elitrax.com" target="_blank" rel="noopener noreferrer"
               style={{ fontFamily:T.dm, fontSize:12, color:T.naranja, textDecoration:'none', fontWeight:500 }}>
              Solicitá acceso →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
