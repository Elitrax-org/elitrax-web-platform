export const PLAYERS = [
  { id:1,  name:'Lucas Fernández',   pos:'Delantero',     num:9,  km:10.8, sprints:34, vel:31.2, carga:92, estado:'ok',     birthDate:'2004-05-12', altura:178, peso:74, email:'lucas.fernandez@email.com', phone:'+54 351 123-4567', stats:{ partidosJugados:15, minutosJugados:1280, goles:8, asistencias:3, amarillas:2, rojas:0 }, injuries:[{ id:1, date:'2025-08-15', type:'Distensión muscular', severity:'moderado', zone:'Isquiotibiales izq.', recoveryDays:21, note:'Lesión durante entrenamiento.', closedAt:'2025-09-05' }], anthropometrics:[{ date:'2026-01-10', altura:178, peso:74, grasa:9.2, masaMuscular:42.1 }], clubHistory:[{ club:'Club Atlético Belgrano (Div. Inferiores)', from:'2018', to:'2024', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2024', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:2,  name:'Mateo González',    pos:'Mediocampista', num:8,  km:9.4,  sprints:28, vel:29.1, carga:78, estado:'ok',     birthDate:'2003-11-08', altura:182, peso:78, email:'mateo.gonzalez@email.com', phone:'+54 351 234-5678', stats:{ partidosJugados:14, minutosJugados:1180, goles:3, asistencias:5, amarillas:4, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:182, peso:78, grasa:8.8, masaMuscular:44.3 }], clubHistory:[{ club:'Club Atlético Belgrano — Sub 20', from:'2023', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:3,  name:'Tomás Herrera',     pos:'Defensor',      num:4,  km:8.1,  sprints:18, vel:26.4, carga:65, estado:'ok',     birthDate:'2002-03-22', altura:185, peso:82, email:'tomas.herrera@email.com', phone:'+54 351 345-6789', stats:{ partidosJugados:13, minutosJugados:1170, goles:1, asistencias:1, amarillas:3, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:185, peso:82, grasa:10.1, masaMuscular:46.8 }], clubHistory:[{ club:'Instituto (Div. Inferiores)', from:'2016', to:'2023', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2023', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:4,  name:'Nicolás Romero',    pos:'Arquero',       num:1,  km:4.2,  sprints:8,  vel:22.1, carga:41, estado:'ok',     birthDate:'2003-07-15', altura:188, peso:85, email:'nicolas.romero@email.com', phone:'+54 351 456-7890', stats:{ partidosJugados:13, minutosJugados:1170, goles:0, asistencias:0, amarillas:1, rojas:0 }, injuries:[{ id:2, date:'2025-06-10', type:'Esguince de muñeca', severity:'leve', zone:'Muñeca derecha', recoveryDays:10, note:'Caída durante entrenamiento.', closedAt:'2025-06-20' }], anthropometrics:[{ date:'2026-01-10', altura:188, peso:85, grasa:11.5, masaMuscular:44.0 }], clubHistory:[{ club:'Talleres (Div. Inferiores)', from:'2015', to:'2022', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2022', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:5,  name:'Santiago López',    pos:'Delantero',     num:11, km:11.2, sprints:38, vel:32.6, carga:98, estado:'alerta', birthDate:'2005-01-30', altura:174, peso:70, email:'santiago.lopez@email.com', phone:'+54 351 567-8901', stats:{ partidosJugados:14, minutosJugados:1050, goles:9, asistencias:4, amarillas:1, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:174, peso:70, grasa:7.5, masaMuscular:40.2 }], clubHistory:[{ club:'Club Atlético Belgrano (Div. Inferiores)', from:'2017', to:'2024', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2024', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:6,  name:'Agustín Martínez',  pos:'Mediocampista', num:6,  km:9.8,  sprints:31, vel:28.9, carga:83, estado:'ok',     birthDate:'2002-09-18', altura:180, peso:76, email:'agustin.martinez@email.com', phone:'+54 351 678-9012', stats:{ partidosJugados:15, minutosJugados:1320, goles:2, asistencias:6, amarillas:3, rojas:1 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:180, peso:76, grasa:9.0, masaMuscular:43.5 }], clubHistory:[{ club:'Racing de Cba (Div. Inferiores)', from:'2014', to:'2021', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2021', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:7,  name:'Rodrigo Vargas',    pos:'Defensor',      num:5,  km:7.9,  sprints:16, vel:25.8, carga:62, estado:'ok',     birthDate:'2004-04-05', altura:177, peso:73, email:'rodrigo.vargas@email.com', phone:'+54 351 789-0123', stats:{ partidosJugados:10, minutosJugados:800, goles:0, asistencias:2, amarillas:2, rojas:0 }, injuries:[{ id:3, date:'2026-02-20', type:'Sobrecarga muscular', severity:'leve', zone:'Gemelo derecho', recoveryDays:7, note:'Sobrecarga post-partido.', closedAt:'2026-02-27' }], anthropometrics:[{ date:'2026-01-10', altura:177, peso:73, grasa:8.5, masaMuscular:41.8 }], clubHistory:[{ club:'Club Atlético Belgrano — Sub 20', from:'2023', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:8,  name:'Facundo Torres',    pos:'Mediocampista', num:10, km:8.6,  sprints:25, vel:27.3, carga:71, estado:'ok',     birthDate:'2003-12-01', altura:176, peso:72, email:'facundo.torres@email.com', phone:'+54 351 890-1234', stats:{ partidosJugados:14, minutosJugados:1100, goles:5, asistencias:8, amarillas:0, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:176, peso:72, grasa:8.2, masaMuscular:41.0 }], clubHistory:[{ club:'Instituto (Div. Inferiores)', from:'2015', to:'2022', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2022', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:9,  name:'Emiliano Díaz',     pos:'Defensor',      num:3,  km:8.3,  sprints:20, vel:26.1, carga:68, estado:'lesion', birthDate:'2002-06-14', altura:183, peso:80, email:'emiliano.diaz@email.com', phone:'+54 351 901-2345', stats:{ partidosJugados:11, minutosJugados:990, goles:0, asistencias:1, amarillas:4, rojas:1 }, injuries:[{ id:4, date:'2026-04-28', type:'Desgarro fibrilar', severity:'grave', zone:'Recto femoral der.', recoveryDays:30, note:'Durante partido vs Talleres. Sale lesionado al minuto 15.', closedAt:'' }], anthropometrics:[{ date:'2026-01-10', altura:183, peso:80, grasa:10.8, masaMuscular:45.2 }], clubHistory:[{ club:'Belgrano (Div. Inferiores)', from:'2016', to:'2024', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2024', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:10, name:'Martín Acosta',     pos:'Defensor',      num:2,  km:8.7,  sprints:19, vel:25.5, carga:70, estado:'ok',     birthDate:'2001-08-25', altura:179, peso:75, email:'martin.acosta@email.com', phone:'+54 351 012-3456', stats:{ partidosJugados:12, minutosJugados:1080, goles:1, asistencias:1, amarillas:2, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:179, peso:75, grasa:9.5, masaMuscular:43.0 }], clubHistory:[{ club:'Talleres (Div. Inferiores)', from:'2013', to:'2020', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2020', to:'Actualidad', category:'Reserva' }], files:[] },
  { id:11, name:'Bruno Castillo',    pos:'Mediocampista', num:7,  km:9.1,  sprints:26, vel:28.4, carga:75, estado:'ok',     birthDate:'2004-10-20', altura:175, peso:71, email:'bruno.castillo@email.com', phone:'+54 351 111-2222', stats:{ partidosJugados:13, minutosJugados:1040, goles:4, asistencias:3, amarillas:2, rojas:0 }, injuries:[], anthropometrics:[{ date:'2026-01-10', altura:175, peso:71, grasa:8.0, masaMuscular:40.5 }], clubHistory:[{ club:'Belgrano (Div. Inferiores)', from:'2017', to:'2023', category:'Juveniles' },{ club:'Club Atlético Belgrano — Sub 20', from:'2023', to:'Actualidad', category:'Reserva' }], files:[] },
];

export const SESSIONS = [
  { id:1, date:'30 Abr', duration:'90 min', type:'Partido', rival:'Talleres',
    distance:9.8, maxSpeed:32.1, avgSpeed:13.2, sprints:27,
    acels:42, jumps:8, impacts:156, heatZone:'Mediocampo izq.', explosivity:78 },
  { id:2, date:'28 Abr', duration:'75 min', type:'Entrenamiento', rival:'',
    distance:7.2, maxSpeed:28.4, avgSpeed:10.8, sprints:18,
    acels:31, jumps:5, impacts:98, heatZone:'Centro', explosivity:64 },
  { id:3, date:'26 Abr', duration:'90 min', type:'Partido', rival:'Racing Cba',
    distance:10.1, maxSpeed:33.8, avgSpeed:14.1, sprints:29,
    acels:47, jumps:9, impacts:172, heatZone:'Banda izquierda', explosivity:85 },
  { id:4, date:'24 Abr', duration:'80 min', type:'Entrenamiento', rival:'',
    distance:8.6, maxSpeed:29.2, avgSpeed:11.6, sprints:22,
    acels:38, jumps:7, impacts:121, heatZone:'Mediocampo', explosivity:71 },
];

export const WEEKLY = [
  { day:'L', km:0   }, { day:'M', km:9.8  }, { day:'M', km:0 },
  { day:'J', km:7.2 }, { day:'V', km:0    }, { day:'S', km:10.1 }, { day:'D', km:0 },
];

export const TEAM_EVENT_TYPES = [
  { id:'gol',        label:'Gol',           icon:'🟢', color:'#4ADE80' },
  { id:'asistencia', label:'Asistencia',    icon:'👟', color:'#46C7F0' },
  { id:'amarilla',   label:'Amarilla',       icon:'🟨', color:'#FFD700' },
  { id:'roja',       label:'Roja',          icon:'🟥', color:'#FF5B5B' },
  { id:'cambio',     label:'Cambio',        icon:'🔄', color:'#F36C3A' },
  { id:'lesion',     label:'Lesión',        icon:'🩹', color:'#FF5B5B' },
  { id:'penal',      label:'Penal',         icon:'⚪', color:'#FFFFFF' },
  { id:'otros',      label:'Otro',          icon:'📌', color:'#FFFFFF' },
]

export const TEAM_HISTORY = [
  { id:1, name:'vs Talleres — Fecha 12', type:'partido', date:'2026-04-30', rival:'Talleres', venue:'Predio Elitrax', formation:'4-3-3', score:{home:2,away:1}, notes:'Victoria importante de local.', players:[
    { playerId:4, role:'titular', position:'Arquero',       minutesPlayed:90 },
    { playerId:3, role:'titular', position:'Defensor',      minutesPlayed:90 },
    { playerId:9, role:'titular', position:'Defensor',      minutesPlayed:90 },
    { playerId:10,role:'titular', position:'Defensor',      minutesPlayed:90 },
    { playerId:7, role:'titular', position:'Defensor',      minutesPlayed:90 },
    { playerId:2, role:'titular', position:'Mediocampista', minutesPlayed:90 },
    { playerId:6, role:'titular', position:'Mediocampista', minutesPlayed:90 },
    { playerId:8, role:'titular', position:'Mediocampista', minutesPlayed:75 },
    { playerId:1, role:'titular', position:'Delantero',     minutesPlayed:90 },
    { playerId:5, role:'titular', position:'Delantero',     minutesPlayed:68 },
    { playerId:11,role:'titular', position:'Delantero',     minutesPlayed:90 },
    { playerId:9, role:'suplente', position:'Defensor',     minutesPlayed:0 },
  ], events:[
    { id:1, type:'gol', playerId:1, minute:23, note:'Gol de cabeza tras córner' },
    { id:2, type:'amarilla', playerId:6, minute:45, note:'Falta táctica' },
    { id:3, type:'cambio', playerId:5, minute:68, relatedPlayerId:9, note:'Sale López, entra Díaz' },
    { id:4, type:'gol', playerId:11, minute:81, note:'Jugada individual por derecha' },
  ], createdAt:'2026-04-30T22:00:00.000Z'},
]

export const TACTICAS = [
  { id:'4-4-2',   label:'4-4-2 Clásico'   },
  { id:'4-3-3',   label:'4-3-3 Ofensivo'  },
  { id:'5-3-2',   label:'5-3-2 Defensivo' },
  { id:'4-2-3-1', label:'4-2-3-1 Control' },
  { id:'3-5-2',   label:'3-5-2 Mixto'     },
];

export const ESTILOS = [
  { id:'ofensivo',    label:'Ofensivo',    color:'#F36C3A' },
  { id:'equilibrado', label:'Equilibrado', color:'#46C7F0' },
  { id:'defensivo',   label:'Defensivo',   color:'#4ADE80' },
];

export const VAR_DEF = [
  { id:1, nombre:'Definición',        peso:8 },
  { id:2, nombre:'Duelos individuales',peso:7 },
  { id:3, nombre:'Precisión de pase', peso:6 },
  { id:4, nombre:'Cabezazo',          peso:5 },
  { id:5, nombre:'Regates',           peso:7 },
];

export const VP = [
  { id:1,  name:'Lucas Fernández',  pos:'Delantero',     age:19, num:9,  km:10.8, sprints:34, vel:31.2, carga:82, saltos:48, distSprint:24.2, desc:'Delantero dinámico con gran velocidad y capacidad de definición. Referente ofensivo del equipo.', tags:['Velocidad','Definición','Líder'], videos:2 },
  { id:2,  name:'Mateo González',   pos:'Mediocampista', age:20, num:8,  km:9.4,  sprints:28, vel:29.1, carga:78, saltos:41, distSprint:21.8, desc:'Box-to-box con excelente lectura del juego. Buenas estadísticas de pases y recuperaciones.',         tags:['Pase','Recuperación'],          videos:1 },
  { id:3,  name:'Tomás Herrera',    pos:'Defensor',      age:21, num:4,  km:8.1,  sprints:18, vel:26.4, carga:65, saltos:52, distSprint:18.4, desc:'Defensor central con gran salto y poderío aéreo. Fuerte en duelos y anticipación.',                  tags:['Aéreo','Duelos'],               videos:1 },
  { id:4,  name:'Nicolás Romero',   pos:'Arquero',       age:20, num:1,  km:4.2,  sprints:8,  vel:22.1, carga:41, saltos:68, distSprint:9.1,  desc:'Arquero con excelente manejo del área. Muy seguro en salidas y juego aéreo.',                        tags:['Reflejos','Aéreo'],             videos:3 },
  { id:5,  name:'Santiago López',   pos:'Delantero',     age:18, num:11, km:11.2, sprints:38, vel:32.6, carga:98, saltos:44, distSprint:26.8, desc:'Extremo rapidísimo, el más veloz del plantel. Desequilibrante en uno contra uno.',                   tags:['Velocidad','Regate','Explosivo'],videos:2 },
  { id:6,  name:'Agustín Martínez', pos:'Mediocampista', age:21, num:6,  km:9.8,  sprints:31, vel:28.9, carga:83, saltos:39, distSprint:22.1, desc:'Volante con gran motor. Cubre mucho terreno y buen pie para la salida.',                             tags:['Motor','Pase'],                 videos:0 },
  { id:7,  name:'Rodrigo Vargas',   pos:'Defensor',      age:19, num:5,  km:7.9,  sprints:16, vel:25.8, carga:62, saltos:45, distSprint:17.2, desc:'Lateral derecho ofensivo con buen juego asociado y llegada al fondo.',                               tags:['Lateral','Ofensivo'],           videos:1 },
  { id:8,  name:'Facundo Torres',   pos:'Mediocampista', age:20, num:10, km:8.6,  sprints:25, vel:27.3, carga:71, saltos:37, distSprint:19.5, desc:'Enganche creativo, N°10 del equipo. Gran visión de juego y golpe de efecto.',                         tags:['Creatividad','Gol','Visión'],   videos:2 },
  { id:9,  name:'Martín Acosta',    pos:'Defensor',      age:22, num:2,  km:8.7,  sprints:19, vel:25.5, carga:70, saltos:43, distSprint:18.8, desc:'Defensor versátil, puede jugar de lateral o central. Buena salida.',                                 tags:['Versátil','Salida'],            videos:0 },
  { id:10, name:'Bruno Castillo',   pos:'Mediocampista', age:19, num:7,  km:9.1,  sprints:26, vel:28.4, carga:75, saltos:40, distSprint:20.3, desc:'Mediapunta con llegada al gol. Buen cierre y recuperación defensiva.',                                tags:['Gol','Llegada'],               videos:1 },
];

export const NAV = [
  { id:'dashboard',   label:'Dashboard',       icon:'▦',  group:'main'     },
  { id:'equipo',      label:'Mi Equipo',        icon:'👥', group:'main'     },
  { id:'sesiones',    label:'Sesiones',         icon:'📋', group:'main'     },
  { id:'jugadores',   label:'Jugadores',        icon:'👤', group:'main'     },
  { id:'telemetria',  label:'Telemetría',       icon:'📡', group:'live'     },
  { id:'partido',     label:'Modo Partido',     icon:'🏟', group:'live'     },
  { id:'heatmaps',    label:'Mapas de calor',   icon:'🗺', group:'analisis' },
  { id:'carga',       label:'Carga de trabajo', icon:'⚡', group:'analisis' },
  { id:'reportes',    label:'Reportes',         icon:'📊', group:'analisis' },
  { id:'optimizacion',label:'Optimización IA',  icon:'🤖', group:'analisis' },
  { id:'vitrina',     label:'Vitrina / Scouts', icon:'🔭', group:'captacion'},
  { id:'config',      label:'Configuración',    icon:'⚙',  group:'sistema'  },
];

export const GROUPS = [
  { id:'main',      label:'PRINCIPAL' },
  { id:'live',      label:'EN VIVO'   },
  { id:'analisis',  label:'ANÁLISIS'  },
  { id:'captacion', label:'CAPTACIÓN' },
  { id:'sistema',   label:'SISTEMA'   },
];

export const SPORTS = [
  { id:'football',   label:'Fútbol',    color:'#46C7F0', positions:['Arquero','Defensor','Mediocampista','Delantero'] },
  { id:'hockey',     label:'Hockey',    color:'#4ADE80', positions:['Arquero','Defensor','Mediocampista','Delantero'] },
  { id:'rugby',      label:'Rugby',     color:'#FF5B5B', positions:['Pilar','Hooker','Segunda Línea','Ala','Nº 8','Medio Scrum','Apertura','Centro','Wing','Fullback'] },
  { id:'basketball', label:'Básquet',   color:'#F36C3A', positions:['Base','Escolta','Alero','Ala-Pívot','Pívot'] },
]

export const POSICIONES_POR_DEPORTE = Object.fromEntries(SPORTS.map(s => [s.id, s.positions]))

export function calcScore(player, vars, vals) {
  if (!vals[player.id]) return 0;
  const tw   = vars.reduce((s, v) => s + v.peso, 0) || 1;
  const tech = vars.reduce((s, v) => s + (((vals[player.id][v.id] || 5) / 10) * v.peso), 0) / tw;
  const gps  = Math.min((player.km / 12) * 0.35 + (player.sprints / 40) * 0.35 + (player.vel / 34) * 0.30, 1);
  const pen  = player.estado === 'lesion' ? 0.4 : player.carga >= 90 ? 0.85 : 1;
  return ((tech * 0.6 + gps * 0.4) * pen * 100).toFixed(1);
}

export function genVals() {
  const v = {};
  PLAYERS.forEach(p => {
    v[p.id] = {};
    VAR_DEF.forEach(va => { v[p.id][va.id] = Math.floor(Math.random() * 4) + 6; });
  });
  return v;
}

export function initials(name) {
  return name.split(' ').map(n => n[0]).join('');
}
