// elitrax-tokens.js — Brand tokens, data, shared helpers
const T={bg:'#060E1A',bg1:'#0A1628',bg2:'#0D1E38',bg3:'#112244',cian:'#46C7F0',naranja:'#F36C3A',green:'#4ADE80',red:'#FF5B5B',white:'#FFFFFF',muted:'rgba(255,255,255,0.55)',faint:'rgba(255,255,255,0.22)',border:'rgba(255,255,255,0.08)',borderHi:'rgba(255,255,255,0.16)',card:'rgba(255,255,255,0.04)',cianDim:'rgba(70,199,240,0.10)',naranjaDim:'rgba(243,108,58,0.10)',greenDim:'rgba(74,222,128,0.10)',exo:"'Exo 2',sans-serif",dm:"'DM Sans',sans-serif",mono:"'JetBrains Mono',monospace"};
const glass=(r=12)=>({background:T.card,backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',border:`1px solid ${T.border}`,borderRadius:r});

const PLAYERS=[
  {id:1,name:'Lucas Fernández',pos:'Delantero',num:9,km:10.8,sprints:34,vel:31.2,carga:92,estado:'ok'},
  {id:2,name:'Mateo González',pos:'Mediocampista',num:8,km:9.4,sprints:28,vel:29.1,carga:78,estado:'ok'},
  {id:3,name:'Tomás Herrera',pos:'Defensor',num:4,km:8.1,sprints:18,vel:26.4,carga:65,estado:'ok'},
  {id:4,name:'Nicolás Romero',pos:'Arquero',num:1,km:4.2,sprints:8,vel:22.1,carga:41,estado:'ok'},
  {id:5,name:'Santiago López',pos:'Delantero',num:11,km:11.2,sprints:38,vel:32.6,carga:98,estado:'alerta'},
  {id:6,name:'Agustín Martínez',pos:'Mediocampista',num:6,km:9.8,sprints:31,vel:28.9,carga:83,estado:'ok'},
  {id:7,name:'Rodrigo Vargas',pos:'Defensor',num:5,km:7.9,sprints:16,vel:25.8,carga:62,estado:'ok'},
  {id:8,name:'Facundo Torres',pos:'Mediocampista',num:10,km:8.6,sprints:25,vel:27.3,carga:71,estado:'ok'},
  {id:9,name:'Emiliano Díaz',pos:'Defensor',num:3,km:8.3,sprints:20,vel:26.1,carga:68,estado:'lesion'},
  {id:10,name:'Martín Acosta',pos:'Defensor',num:2,km:8.7,sprints:19,vel:25.5,carga:70,estado:'ok'},
  {id:11,name:'Bruno Castillo',pos:'Mediocampista',num:7,km:9.1,sprints:26,vel:28.4,carga:75,estado:'ok'},
];
const SESSIONS=[
  {id:1,date:'30 Abr',type:'Partido',rival:'Talleres',km:9.8,sprints:27,duration:'90 min'},
  {id:2,date:'28 Abr',type:'Entrenamiento',rival:'',km:7.2,sprints:18,duration:'75 min'},
  {id:3,date:'26 Abr',type:'Partido',rival:'Racing Cba',km:10.1,sprints:29,duration:'90 min'},
  {id:4,date:'24 Abr',type:'Entrenamiento',rival:'',km:8.4,sprints:22,duration:'80 min'},
];
const WEEKLY=[{day:'L',km:0},{day:'M',km:9.8},{day:'M',km:0},{day:'J',km:7.2},{day:'V',km:0},{day:'S',km:10.1},{day:'D',km:0}];
const TACTICAS=[{id:'4-4-2',label:'4-4-2 Clásico'},{id:'4-3-3',label:'4-3-3 Ofensivo'},{id:'5-3-2',label:'5-3-2 Defensivo'},{id:'4-2-3-1',label:'4-2-3-1 Control'},{id:'3-5-2',label:'3-5-2 Mixto'}];
const ESTILOS=[{id:'ofensivo',label:'Ofensivo',color:'#F36C3A'},{id:'equilibrado',label:'Equilibrado',color:'#46C7F0'},{id:'defensivo',label:'Defensivo',color:'#4ADE80'}];
const VAR_DEF=[{id:1,nombre:'Definición',peso:8},{id:2,nombre:'Duelos individuales',peso:7},{id:3,nombre:'Precisión de pase',peso:6},{id:4,nombre:'Cabezazo',peso:5},{id:5,nombre:'Regates',peso:7}];
const VP=[
  {id:1,name:'Lucas Fernández',pos:'Delantero',age:19,num:9,km:10.8,sprints:34,vel:31.2,carga:82,saltos:48,distSprint:24.2,desc:'Delantero dinámico con gran velocidad y capacidad de definición. Referente ofensivo del equipo.',tags:['Velocidad','Definición','Líder'],videos:2},
  {id:2,name:'Mateo González',pos:'Mediocampista',age:20,num:8,km:9.4,sprints:28,vel:29.1,carga:78,saltos:41,distSprint:21.8,desc:'Box-to-box con excelente lectura del juego. Buenas estadísticas de pases y recuperaciones.',tags:['Pase','Recuperación'],videos:1},
  {id:3,name:'Tomás Herrera',pos:'Defensor',age:21,num:4,km:8.1,sprints:18,vel:26.4,carga:65,saltos:52,distSprint:18.4,desc:'Defensor central con gran salto y poderío aéreo. Fuerte en duelos y anticipación.',tags:['Aéreo','Duelos'],videos:1},
  {id:4,name:'Nicolás Romero',pos:'Arquero',age:20,num:1,km:4.2,sprints:8,vel:22.1,carga:41,saltos:68,distSprint:9.1,desc:'Arquero con excelente manejo del área. Muy seguro en salidas y juego aéreo.',tags:['Reflejos','Aéreo'],videos:3},
  {id:5,name:'Santiago López',pos:'Delantero',age:18,num:11,km:11.2,sprints:38,vel:32.6,carga:98,saltos:44,distSprint:26.8,desc:'Extremo rapidísimo, el más veloz del plantel. Desequilibrante en uno contra uno.',tags:['Velocidad','Regate','Explosivo'],videos:2},
  {id:6,name:'Agustín Martínez',pos:'Mediocampista',age:21,num:6,km:9.8,sprints:31,vel:28.9,carga:83,saltos:39,distSprint:22.1,desc:'Volante con gran motor. Cubre mucho terreno y buen pie para la salida.',tags:['Motor','Pase'],videos:0},
  {id:7,name:'Rodrigo Vargas',pos:'Defensor',age:19,num:5,km:7.9,sprints:16,vel:25.8,carga:62,saltos:45,distSprint:17.2,desc:'Lateral derecho ofensivo con buen juego asociado y llegada al fondo.',tags:['Lateral','Ofensivo'],videos:1},
  {id:8,name:'Facundo Torres',pos:'Mediocampista',age:20,num:10,km:8.6,sprints:25,vel:27.3,carga:71,saltos:37,distSprint:19.5,desc:'Enganche creativo, N°10 del equipo. Gran visión de juego y golpe de efecto.',tags:['Creatividad','Gol','Visión'],videos:2},
  {id:9,name:'Martín Acosta',pos:'Defensor',age:22,num:2,km:8.7,sprints:19,vel:25.5,carga:70,saltos:43,distSprint:18.8,desc:'Defensor versátil, puede jugar de lateral o central. Buena salida.',tags:['Versátil','Salida'],videos:0},
  {id:10,name:'Bruno Castillo',pos:'Mediocampista',age:19,num:7,km:9.1,sprints:26,vel:28.4,carga:75,saltos:40,distSprint:20.3,desc:'Mediapunta con llegada al gol. Buen cierre y recuperación defensiva.',tags:['Gol','Llegada'],videos:1},
];
const NAV=[
  {id:'dashboard',label:'Dashboard',icon:'▦',group:'main'},
  {id:'equipo',label:'Mi Equipo',icon:'👥',group:'main'},
  {id:'sesiones',label:'Sesiones',icon:'📋',group:'main'},
  {id:'jugadores',label:'Jugadores',icon:'👤',group:'main'},
  {id:'telemetria',label:'Telemetría',icon:'📡',group:'live'},
  {id:'partido',label:'Modo Partido',icon:'🏟',group:'live'},
  {id:'heatmaps',label:'Mapas de calor',icon:'🗺',group:'analisis'},
  {id:'carga',label:'Carga de trabajo',icon:'⚡',group:'analisis'},
  {id:'reportes',label:'Reportes',icon:'📊',group:'analisis'},
  {id:'optimizacion',label:'Optimización IA',icon:'🤖',group:'analisis'},
  {id:'vitrina',label:'Vitrina / Scouts',icon:'🔭',group:'captacion'},
  {id:'config',label:'Configuración',icon:'⚙',group:'sistema'},
];
const GROUPS=[{id:'main',label:'PRINCIPAL'},{id:'live',label:'EN VIVO'},{id:'analisis',label:'ANÁLISIS'},{id:'captacion',label:'CAPTACIÓN'},{id:'sistema',label:'SISTEMA'}];

function calcScore(player,vars,vals){
  if(!vals[player.id])return 0;
  const tw=vars.reduce((s,v)=>s+v.peso,0)||1;
  const tech=vars.reduce((s,v)=>s+(((vals[player.id][v.id]||5)/10)*v.peso),0)/tw;
  const gps=Math.min((player.km/12)*.35+(player.sprints/40)*.35+(player.vel/34)*.30,1);
  const pen=player.estado==='lesion'?.4:player.carga>=90?.85:1;
  return ((tech*.6+gps*.4)*pen*100).toFixed(1);
}
function genVals(){const v={};PLAYERS.forEach(p=>{v[p.id]={};VAR_DEF.forEach(va=>{v[p.id][va.id]=Math.floor(Math.random()*4)+6;});});return v;}
function initials(name){return name.split(' ').map(n=>n[0]).join('');}
