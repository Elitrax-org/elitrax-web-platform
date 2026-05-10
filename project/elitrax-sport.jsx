// Sport Selection Screen — after onboarding, before dashboard
const { C, font, gcard } = window;

const DEPORTES = [
  {
    id: 'futbol',
    label: 'Fútbol 11',
    sub: 'GPS + IMU · Outdoor',
    gps: true,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke={color} strokeWidth="1.6"/>
        <path d="M18 8l3 4-5 1.5-5-1.5 3-4z" fill={color} opacity="0.7"/>
        <path d="M18 28l3-4-5-1.5-5 1.5 3 4z" fill={color} opacity="0.7"/>
        <path d="M8 18l4-3 1.5 5-1.5 5-4-3z" fill={color} opacity="0.5"/>
        <path d="M28 18l-4-3-1.5 5 1.5 5 4-3z" fill={color} opacity="0.5"/>
        <circle cx="18" cy="18" r="3.5" fill={color}/>
      </svg>
    ),
  },
  {
    id: 'rugby',
    label: 'Rugby',
    sub: 'GPS + IMU · Outdoor',
    gps: true,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="18" rx="10" ry="14" stroke={color} strokeWidth="1.6" transform="rotate(30 18 18)"/>
        <line x1="10" y1="10" x2="26" y2="26" stroke={color} strokeWidth="1.2" opacity="0.5"/>
        <line x1="12" y1="14" x2="22" y2="24" stroke={color} strokeWidth="1" opacity="0.35"/>
        <line x1="14" y1="10" x2="26" y2="22" stroke={color} strokeWidth="1" opacity="0.35"/>
      </svg>
    ),
  },
  {
    id: 'hockey',
    label: 'Hockey césped',
    sub: 'GPS + IMU · Outdoor',
    gps: true,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M10 10 Q14 10 16 16 L24 28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 16 Q20 22 24 28 Q26 30 28 28 Q30 26 28 24 L20 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="26" r="3" stroke={color} strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    id: 'futsal',
    label: 'Futsal',
    sub: 'Solo IMU · Indoor',
    gps: false,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke={color} strokeWidth="1.6"/>
        <path d="M18 8l3 4-5 1.5-5-1.5 3-4z" fill={color} opacity="0.7"/>
        <path d="M18 28l3-4-5-1.5-5 1.5 3 4z" fill={color} opacity="0.7"/>
        <circle cx="18" cy="18" r="3.5" fill={color}/>
        {/* Indoor indicator */}
        <path d="M26 10 L30 10 L30 14" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'basquet',
    label: 'Básquet',
    sub: 'Solo IMU · Indoor',
    gps: false,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="14" stroke={color} strokeWidth="1.6"/>
        <path d="M18 4 Q26 11 26 18 Q26 25 18 32" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <path d="M18 4 Q10 11 10 18 Q10 25 18 32" stroke={color} strokeWidth="1.2" fill="none" opacity="0.6"/>
        <line x1="4" y1="18" x2="32" y2="18" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: 'running',
    label: 'Running',
    sub: 'GPS + IMU · Outdoor',
    gps: true,
    icon: (color) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="22" cy="8" r="3" stroke={color} strokeWidth="1.5"/>
        <path d="M20 12 L16 20 L10 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 20 L18 28" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M20 12 L26 16 L28 22" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 22 L10 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <path d="M18 28 L16 32" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    ),
  },
];

Object.assign(window, { DEPORTES });

function SportSelectionScreen({ onSelect }) {
  const [selected, setSelected] = React.useState(null);
  const [confirming, setConfirming] = React.useState(false);

  const handleConfirm = () => {
    if (!selected) return;
    setConfirming(true);
    setTimeout(() => onSelect(selected), 900);
  };

  const deporte = DEPORTES.find(d => d.id === selected);

  return (
    <div style={{
      height: '100%',
      background: `linear-gradient(180deg, ${C.bg} 0%, #060E1A 100%)`,
      display: 'flex', flexDirection: 'column',
      padding: '20px 20px 0', overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: font.exo, fontWeight: 800, fontSize: 26, color: C.white, lineHeight: 1.15 }}>
          ¿Qué deporte practicás?
        </div>
        <div style={{ fontFamily: font.dm, fontSize: 14, color: C.muted, marginTop: 6 }}>
          Elegí tu deporte principal para personalizar la app
        </div>
      </div>

      {/* Grid de deportes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {DEPORTES.map(d => {
          const sel = selected === d.id;
          const accentColor = d.gps ? C.cian : C.naranja;
          return (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              style={{
                ...gcard(18),
                padding: '18px 14px',
                border: `1.5px solid ${sel ? accentColor : C.border}`,
                background: sel
                  ? (d.gps ? C.cianDim : C.naranjaDim)
                  : C.card,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all 0.2s',
                boxShadow: sel ? `0 0 20px ${d.gps ? 'rgba(70,199,240,0.15)' : 'rgba(243,108,58,0.15)'}` : 'none',
                position: 'relative',
              }}
            >
              {/* Check mark */}
              {sel && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 20, height: 20, borderRadius: '50%',
                  background: accentColor,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 3.5l2.5 2.5 6-5.5" stroke={C.bg} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div style={{
                width: 60, height: 60, borderRadius: 18,
                background: sel ? (d.gps ? 'rgba(70,199,240,0.20)' : 'rgba(243,108,58,0.20)') : 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
              }}>
                {d.icon(sel ? accentColor : C.muted)}
              </div>

              {/* Label */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: font.exo, fontWeight: 700, fontSize: 14,
                  color: sel ? accentColor : C.white, lineHeight: 1.2,
                }}>
                  {d.label}
                </div>
                {/* GPS/IMU badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  marginTop: 5,
                  ...gcard(20),
                  padding: '2px 8px',
                  background: d.gps ? 'rgba(70,199,240,0.08)' : 'rgba(243,108,58,0.08)',
                }}>
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: d.gps ? C.cian : C.naranja, opacity: 0.8,
                  }}/>
                  <span style={{
                    fontFamily: font.dm, fontSize: 9,
                    color: d.gps ? C.cian : C.naranja, opacity: 0.8,
                  }}>
                    {d.sub}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Info sobre GPS/IMU */}
      <div style={{ ...gcard(14), padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 12 }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
          <circle cx="9" cy="9" r="7.5" stroke={C.cian} strokeWidth="1.3"/>
          <path d="M9 8v5" stroke={C.cian} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="9" cy="5.5" r="1" fill={C.cian}/>
        </svg>
        <div style={{ fontFamily: font.dm, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>
          Los deportes <span style={{ color: C.cian }}>outdoor</span> usan GPS + IMU. Los <span style={{ color: C.naranja }}>indoor</span> solo IMU (acelerómetro y giroscopio), ya que el GPS no está disponible bajo techo.
        </div>
      </div>

      {/* CTA */}
      <div style={{ paddingBottom: 32 }}>
        <button
          onClick={handleConfirm}
          disabled={!selected || confirming}
          style={{
            width: '100%',
            background: !selected || confirming
              ? 'rgba(255,255,255,0.06)'
              : deporte?.gps
                ? `linear-gradient(135deg, ${C.cian} 0%, #2EB5E0 100%)`
                : `linear-gradient(135deg, ${C.naranja} 0%, #D4502A 100%)`,
            border: !selected ? `1px solid ${C.border}` : 'none',
            borderRadius: 14, height: 52,
            fontFamily: font.exo, fontWeight: 700, fontSize: 15, letterSpacing: 1.5,
            color: !selected || confirming ? C.faint : (deporte?.gps ? C.bg : C.white),
            cursor: !selected ? 'default' : 'pointer',
            boxShadow: selected && !confirming
              ? deporte?.gps
                ? '0 8px 24px rgba(70,199,240,0.28)'
                : '0 8px 24px rgba(243,108,58,0.30)'
              : 'none',
            transition: 'all 0.25s',
          }}
        >
          {confirming
            ? 'CONFIGURANDO...'
            : selected
              ? `ELEGIR ${deporte?.label?.toUpperCase()}`
              : 'ELEGÍ UN DEPORTE'}
        </button>

        {/* Skip */}
        <button
          onClick={() => onSelect(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'block', width: '100%', marginTop: 14, padding: 8,
            fontFamily: font.dm, fontSize: 13, color: C.faint, textAlign: 'center',
          }}
        >
          Elegir después
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { SportSelectionScreen, DEPORTES });
