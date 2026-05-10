// Auth screens: Splash → Login → Onboarding
const { C, font, gcard } = window;

// ── Icons ──────────────────────────────────────────────────────
function IconMail() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
      <rect x="1" y="1" width="16" height="12" rx="2" stroke={C.muted} strokeWidth="1.4"/>
      <path d="M1 4l8 5 8-5" stroke={C.muted} strokeWidth="1.4"/>
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
      <rect x="2" y="8" width="12" height="9" rx="2" stroke={C.muted} strokeWidth="1.4"/>
      <path d="M5 8V6a3 3 0 016 0v2" stroke={C.muted} strokeWidth="1.4"/>
      <circle cx="8" cy="13" r="1.5" fill={C.muted}/>
    </svg>
  );
}

// ── Logo mark ──────────────────────────────────────────────────
function ElitraxLogo({ size = 100 }) {
  const r1 = size * 0.44, r2 = size * 0.33, cx = size / 2, cy = size / 2;
  const circ1 = 2 * Math.PI * r1;
  const circ2 = 2 * Math.PI * r2;
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* outer faint ring */}
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(70,199,240,0.12)" strokeWidth="1"/>
        {/* animated arc */}
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke={C.cian} strokeWidth="1.8"
          strokeDasharray={`${circ1 * 0.70} ${circ1 * 0.30}`}
          strokeLinecap="round" transform={`rotate(-90 ${cx} ${cy})`}/>
        {/* inner glow fill */}
        <circle cx={cx} cy={cy} r={r2} fill="rgba(70,199,240,0.07)"/>
        {/* inner ring */}
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(70,199,240,0.20)" strokeWidth="1"/>
        {/* naranja accent dot */}
        <circle cx={cx + r1 * 0.7} cy={cy - r1 * 0.7} r="4" fill={C.naranja}/>
      </svg>
      {/* E lettermark */}
      <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width={size * 0.32} height={size * 0.32} viewBox="0 0 32 32" fill="none">
          <rect x="4" y="5"  width="22" height="3" rx="1.5" fill={C.cian}/>
          <rect x="4" y="14" width="16" height="3" rx="1.5" fill={C.cian}/>
          <rect x="4" y="23" width="22" height="3" rx="1.5" fill={C.cian}/>
          <rect x="24" y="5" width="3"  height="21" rx="1.5" fill={C.naranja} opacity="0.7"/>
        </svg>
      </div>
    </div>
  );
}

// ── Splash Screen ──────────────────────────────────────────────
function SplashScreen({ onLogin, onRegister }) {
  return (
    <div style={{
      height:'100%',
      background:`linear-gradient(160deg, ${C.bg2} 0%, ${C.bg} 55%, #0D1E3C 100%)`,
      display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'space-between',
      padding:'80px 28px 56px',
    }}>
      {/* Logo + Brand */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, flex:1, justifyContent:'center' }}>
        <ElitraxLogo size={120} />
        <div style={{ textAlign:'center' }}>
          <div style={{ fontFamily:font.exo, fontWeight:800, fontSize:38, color:C.white, letterSpacing:7, lineHeight:1 }}>
            ELITRAX
          </div>
          <div style={{ fontFamily:font.dm, fontSize:11, color:C.cian, letterSpacing:3.5, marginTop:10, opacity:0.85 }}>
            CONOCÉ TU RENDIMIENTO REAL
          </div>
        </div>

      </div>
      {/* CTAs */}
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        <button onClick={onLogin} style={{
          background:`linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`,
          color:C.bg, border:'none', borderRadius:14,
          height:52, fontFamily:font.exo, fontWeight:700, fontSize:15,
          letterSpacing:1.5, cursor:'pointer', width:'100%',
          boxShadow:`0 8px 24px rgba(70,199,240,0.30)`,
        }}>INGRESAR</button>
        <button onClick={onRegister} style={{
          ...gcard(14), background:'rgba(255,255,255,0.06)',
          color:C.white, border:`1px solid ${C.border}`,
          height:52, fontFamily:font.dm, fontSize:15,
          cursor:'pointer', width:'100%',
        }}>Crear cuenta gratuita</button>
        {/* Web link */}
        <div style={{ textAlign:'center', paddingTop:4 }}>
          <span style={{ fontFamily:font.dm, fontSize:12, color:C.faint }}>¿No tenés el dispositivo? </span>
          <a href="https://www.elitrax.com" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily:font.dm, fontSize:12, color:C.cian, textDecoration:'none', fontWeight:600 }}>
            Compralo en elitrax.com →
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Login Screen ───────────────────────────────────────────────
function LoginScreen({ onBack, onSuccess }) {
  const [email, setEmail] = React.useState('martin.g@email.com');
  const [pass,  setPass]  = React.useState('••••••••');
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState('');

  const handleLogin = () => {
    if (!email) { setErr('Ingresá tu correo electrónico'); return; }
    setErr(''); setLoading(true);
    setTimeout(() => { setLoading(false); onSuccess(); }, 1400);
  };

  return (
    <div style={{
      height:'100%',
      background:`linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`,
      display:'flex', flexDirection:'column',
      padding:'20px 24px 48px', overflowY:'auto',
    }}>
      {/* Back button */}
      <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer',
        display:'flex', alignItems:'center', gap:8, padding:'4px 0', marginBottom:32 }}>
        <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
          <path d="M9 1L1 8.5L9 16" stroke={C.cian} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontFamily:font.dm, fontSize:14, color:C.cian }}>Volver</span>
      </button>

      {/* Header */}
      <div style={{ marginBottom:36 }}>
        <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:30, color:C.white, lineHeight:1.1 }}>
          Bienvenido
        </div>
        <div style={{ fontFamily:font.dm, fontSize:14, color:C.muted, marginTop:6 }}>
          Ingresá con tu cuenta Elitrax
        </div>
      </div>

      {/* Fields */}
      <div style={{ display:'flex', flexDirection:'column', gap:16, marginBottom:8 }}>
        <div>
          <div style={{ fontFamily:font.dm, fontSize:11, color:C.muted, letterSpacing:0.8, marginBottom:8 }}>
            CORREO ELECTRÓNICO
          </div>
          <div style={{ ...gcard(13), padding:'14px 16px', display:'flex', alignItems:'center', gap:12,
            border: `1px solid ${C.border}` }}>
            <IconMail />
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vos@ejemplo.com"
              style={{ background:'none', border:'none', outline:'none', flex:1,
                fontFamily:font.dm, fontSize:15, color:C.white }} />
          </div>
        </div>
        <div>
          <div style={{ fontFamily:font.dm, fontSize:11, color:C.muted, letterSpacing:0.8, marginBottom:8 }}>
            CONTRASEÑA
          </div>
          <div style={{ ...gcard(13), padding:'14px 16px', display:'flex', alignItems:'center', gap:12 }}>
            <IconLock />
            <input value={pass} onChange={e => setPass(e.target.value)}
              type="password" placeholder="••••••••"
              style={{ background:'none', border:'none', outline:'none', flex:1,
                fontFamily:font.dm, fontSize:15, color:C.white }} />
          </div>
        </div>
      </div>

      {err && <div style={{ fontFamily:font.dm, fontSize:13, color:'#FF6B6B', marginBottom:8 }}>{err}</div>}

      <div style={{ textAlign:'right', marginBottom:28 }}>
        <span style={{ fontFamily:font.dm, fontSize:13, color:C.cian, cursor:'pointer' }}>
          ¿Olvidaste tu contraseña?
        </span>
      </div>

      {/* Fingerprint biometric */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginBottom:18 }}>
        <button onClick={handleLogin} style={{
          background:'none', border:'none', cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:8,
        }}>
          <div style={{ width:56, height:56, borderRadius:16,
            background:'rgba(70,199,240,0.08)', border:`1px solid rgba(70,199,240,0.22)`,
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 18px rgba(70,199,240,0.12)' }}>
            <svg width="30" height="34" viewBox="0 0 30 34" fill="none">
              <path d="M15 2C9.477 2 5 6.477 5 12v1" stroke={C.cian} strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M25 12v1c0 5.523-4.477 10-10 10" stroke={C.cian} strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M15 8c-2.209 0-4 1.791-4 4v2c0 2.209 1.791 4 4 4s4-1.791 4-4v-2c0-2.209-1.791-4-4-4z" stroke={C.cian} strokeWidth="1.6"/>
              <path d="M8 16c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke={C.cian} strokeWidth="1.6" strokeLinecap="round" opacity="0.5"/>
              <path d="M10 22c0 2.761 2.239 5 5 5s5-2.239 5-5" stroke={C.cian} strokeWidth="1.6" strokeLinecap="round" opacity="0.3"/>
              <path d="M12 27.5c0 1.657 1.343 3 3 3s3-1.343 3-3" stroke={C.cian} strokeWidth="1.6" strokeLinecap="round" opacity="0.15"/>
            </svg>
          </div>
          <span style={{ fontFamily:font.dm, fontSize:11, color:C.muted }}>Ingresar con huella</span>
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:10, width:'100%' }}>
          <div style={{ flex:1, height:1, background:C.border }} />
          <span style={{ fontFamily:font.dm, fontSize:11, color:C.faint }}>o con contraseña</span>
          <div style={{ flex:1, height:1, background:C.border }} />
        </div>
      </div>

      <button onClick={handleLogin} disabled={loading} style={{
        background: loading ? C.cianDim : `linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`,
        color: loading ? C.cian : C.bg,
        border: loading ? `1px solid ${C.cian}` : 'none',
        borderRadius:14, height:52,
        fontFamily:font.exo, fontWeight:700, fontSize:15,
        letterSpacing:1.5, cursor:'pointer', width:'100%',
        boxShadow: loading ? 'none' : `0 8px 24px rgba(70,199,240,0.28)`,
        transition:'all 0.25s',
      }}>
        {loading ? 'INGRESANDO...' : 'INGRESAR'}
      </button>

      {/* Divider */}
      <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
        <div style={{ flex:1, height:1, background:C.border }} />
        <span style={{ fontFamily:font.dm, fontSize:12, color:C.faint }}>o continuá con</span>
        <div style={{ flex:1, height:1, background:C.border }} />
      </div>

      {/* Social */}
      <div style={{ display:'flex', gap:12 }}>
        {/* Google */}
        <button style={{ flex:1, ...gcard(12), padding:'12px 0', border:`1px solid ${C.border}`,
          color:C.white, fontFamily:font.dm, fontSize:14, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Google
        </button>
        {/* Apple */}
        <button style={{ flex:1, ...gcard(12), padding:'12px 0', border:`1px solid ${C.border}`,
          color:C.white, fontFamily:font.dm, fontSize:14, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="16" height="19" viewBox="0 0 16 19" fill="none">
            <path d="M13.173 10.018c-.02-2.137 1.745-3.173 1.824-3.222-1-1.457-2.547-1.656-3.092-1.673-1.316-.134-2.573.777-3.239.777-.667 0-1.693-.758-2.785-.737-1.43.021-2.754.833-3.488 2.112-1.492 2.583-.383 6.415 1.073 8.515.714 1.03 1.563 2.185 2.676 2.144 1.077-.043 1.482-.692 2.784-.692 1.302 0 1.667.692 2.806.67 1.156-.021 1.886-1.053 2.594-2.086.82-1.191 1.155-2.35 1.173-2.408-.026-.01-2.24-.862-2.326-3.4z" fill="white"/>
            <path d="M11.07 3.28C11.65 2.574 12.04 1.6 11.93.61c-.843.036-1.87.562-2.474 1.268-.54.625-.997 1.627-.871 2.582.938.073 1.9-.477 2.485-1.18z" fill="white"/>
          </svg>
          Apple
        </button>
      </div>
    </div>
  );
}

// ── Onboarding / Device connection ────────────────────────────
function OnboardingScreen({ onDone }) {
  const [step, setStep] = React.useState(0);
  // 0 = scanning, 1 = found, 2 = connected

  React.useEffect(() => {
    const t = setTimeout(() => step === 0 && setStep(1), 2200);
    return () => clearTimeout(t);
  }, [step]);

  const ringStyle = (r, opacity, dashRatio = 0) => {
    const circ = 2 * Math.PI * r;
    return { cx:110, cy:110, r, fill:'none',
      stroke:`rgba(70,199,240,${opacity})`, strokeWidth:1,
      ...(dashRatio > 0 ? { strokeDasharray:`${circ * dashRatio} ${circ * (1 - dashRatio)}`, strokeLinecap:'round' } : {}) };
  };

  return (
    <div style={{
      height:'100%',
      background:`linear-gradient(180deg, ${C.bg2} 0%, ${C.bg} 100%)`,
      display:'flex', flexDirection:'column',
      alignItems:'center', padding:'28px 24px 60px', overflowY:'auto',
    }}>
      <div style={{ width:'100%', marginBottom:8 }}>
        <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:26, color:C.white }}>
          Conectá tu dispositivo
        </div>
        <div style={{ fontFamily:font.dm, fontSize:14, color:C.muted, marginTop:4 }}>
          {step === 0 ? 'Buscando dispositivos ELITRAX cercanos...' :
           step === 1 ? '¡Dispositivo encontrado!' : '¡Conexión exitosa!'}
        </div>
      </div>

      {/* Radar animation */}
      <div style={{ position:'relative', width:220, height:220, margin:'20px 0' }}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          <circle {...ringStyle(100, 0.06)} />
          <circle {...ringStyle(80,  0.09)} />
          <circle {...ringStyle(60,  0.14)} />
          <circle {...ringStyle(40,  0.20)} />
          {/* spinning sweep */}
          <circle cx="110" cy="110" r="100" fill="none" stroke={C.cian} strokeWidth="1.5"
            strokeDasharray={`${2*Math.PI*100*0.25} ${2*Math.PI*100*0.75}`}
            strokeLinecap="round" transform="rotate(-90 110 110)"
            style={{ animationDuration:'2s', animationTimingFunction:'linear', animationIterationCount:'infinite',
              animationName: step === 0 ? 'spin' : 'none' }}/>
          {/* center */}
          <circle cx="110" cy="110" r="24" fill="rgba(70,199,240,0.10)"/>
          <circle cx="110" cy="110" r="16" fill="rgba(70,199,240,0.18)"/>
        </svg>
        {/* Center label */}
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontFamily:font.exo, fontWeight:700, fontSize:10, color:C.cian, letterSpacing:2, textAlign:'center' }}>
            {step === 0 ? 'SCAN' : step === 1 ? 'LISTO' : '✓'}
          </div>
        </div>
        {/* Device pill */}
        {step >= 1 && (
          <div style={{ position:'absolute', top:24, right:0, ...gcard(12),
            padding:'8px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%',
              background: step === 2 ? C.green : C.cian,
              boxShadow: `0 0 6px ${step === 2 ? C.green : C.cian}` }} />
            <span style={{ fontFamily:font.dm, fontSize:12, color:C.white, whiteSpace:'nowrap' }}>
              ELITRAX Motion
            </span>
          </div>
        )}
      </div>

      {/* Device card */}
      {step >= 1 && (
        <div style={{ width:'100%', ...gcard(18), padding:18, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom: step < 2 ? 16 : 0 }}>
            {/* Device icon */}
            <div style={{ width:48, height:48, borderRadius:14, background:C.cianDim,
              display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                <rect x="8" y="2" width="10" height="18" rx="2.5" stroke={C.cian} strokeWidth="1.4"/>
                <path d="M13 20v4M10 24h6" stroke={C.cian} strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="13" cy="10" r="2.5" fill={C.cian} opacity="0.6"/>
              </svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:font.exo, fontWeight:600, fontSize:16, color:C.white }}>ELITRAX Motion</div>
              <div style={{ fontFamily:font.dm, fontSize:12, color:C.muted, marginTop:2 }}>ID: ELX-2409-A3F</div>
            </div>
            <div style={{ ...gcard(20), padding:'4px 10px' }}>
              <span style={{ fontFamily:font.dm, fontSize:11, color:C.green }}>92% 🔋</span>
            </div>
          </div>
          {step === 1 && (
            <button onClick={() => setStep(2)} style={{
              background:`linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`,
              color:C.bg, border:'none', borderRadius:12,
              height:44, fontFamily:font.exo, fontWeight:700, fontSize:14,
              letterSpacing:1, cursor:'pointer', width:'100%',
              boxShadow:`0 6px 18px rgba(70,199,240,0.25)`,
            }}>CONECTAR DISPOSITIVO</button>
          )}
          {step === 2 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'center', paddingTop:12 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:C.green, boxShadow:`0 0 8px ${C.green}` }} />
              <span style={{ fontFamily:font.dm, fontWeight:600, fontSize:14, color:C.green }}>
                Conectado exitosamente
              </span>
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <button onClick={onDone} style={{
          background:`linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`,
          color:C.bg, border:'none', borderRadius:14,
          height:52, fontFamily:font.exo, fontWeight:700, fontSize:15,
          letterSpacing:1.5, cursor:'pointer', width:'100%',
          boxShadow:`0 8px 24px rgba(70,199,240,0.28)`,
        }}>COMENZAR →</button>
      )}

      <button onClick={onDone} style={{
        background:'none', border:'none', color:C.muted,
        fontFamily:font.dm, fontSize:14, cursor:'pointer', marginTop:16, padding:8,
      }}>Saltar por ahora</button>
    </div>
  );
}

Object.assign(window, { SplashScreen, LoginScreen, OnboardingScreen, ElitraxLogo });
