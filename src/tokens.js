export const T = {
  bg:        '#060E1A',
  bg1:       '#0A1628',
  bg2:       '#0D1E38',
  bg3:       '#112244',
  cian:      '#46C7F0',
  naranja:   '#F36C3A',
  green:     '#4ADE80',
  red:       '#FF5B5B',
  white:     '#FFFFFF',
  muted:     'rgba(255,255,255,0.55)',
  faint:     'rgba(255,255,255,0.22)',
  border:    'rgba(255,255,255,0.08)',
  borderHi:  'rgba(255,255,255,0.16)',
  card:      'rgba(255,255,255,0.04)',
  cianDim:   'rgba(70,199,240,0.10)',
  naranjaDim:'rgba(243,108,58,0.10)',
  greenDim:  'rgba(74,222,128,0.10)',
  exo:  "'Exo 2',sans-serif",
  dm:   "'DM Sans',sans-serif",
  mono: "'JetBrains Mono',monospace",
};

export const glass = (r = 12) => ({
  background:              T.card,
  backdropFilter:          'blur(20px)',
  WebkitBackdropFilter:    'blur(20px)',
  border:                  `1px solid ${T.border}`,
  borderRadius:            r,
});

export const gcard = glass;
