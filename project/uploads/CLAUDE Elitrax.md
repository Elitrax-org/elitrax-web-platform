# ELITRAX — Proyecto de Wearable de Rendimiento Deportivo

## Contexto del proyecto

Elitrax es un sistema modular de tracking deportivo para deportistas amateurs,
semiprofesionales y profesionales de deportes de equipo e individuales.
Basado en Córdoba, Argentina. Fundador: Sebastián.

## Producto

### Módulos de hardware

**ELITRAX Motion** (módulo actual):

- Dispositivo compacto con **GPS de alta precisión** + **sensores IMU** integrados
- Resistente al agua, batería para una sesión completa
- Se coloca en pierna, muñeca, brazo, palo de hockey o espalda según el deporte
- GPS activo en canchas abiertas (outdoor); IMU activo en cualquier condición (indoor y outdoor)
- Se conecta automáticamente a la app al iniciar sesión
- **No mide frecuencia cardíaca** — todas las métricas provienen exclusivamente del GPS y el IMU

**ELITRAX Core** (próxima etapa — probable):
- Dispositivo con soporte en el cuerpo (chaleco o banda)
- Captura métricas cardíacas (frecuencia cardíaca)

### Soporte / portador
- Chaleco, media o sujeción ergonómica según el deporte
- Mantiene el sensor en posición óptima sin interferir con el movimiento

### Software
- **App móvil** — para el deportista individual (planes BASIC, PRO, PRO+)
- **Plataforma web** — para el cuerpo técnico (plan PRO+)
- **IA conversacional** — agente de análisis integrado en la app (planes PRO y PRO+)

## Métricas que captura ELITRAX

### GPS — Posición y desplazamiento
| Métrica | Descripción |
|---|---|
| Distancia total | Kilómetros recorridos en la sesión |
| Velocidad máxima | Pico de velocidad alcanzado |
| Velocidad promedio | Media de velocidad durante la sesión |
| Mapa de calor | Zonas de la cancha donde el jugador estuvo más tiempo |
| Zona dominante | Sector de cancha con mayor presencia (ej: mediocampo izq.) |
| Recorrido en tiempo real | Trazado GPS en vivo durante la sesión |

### IMU — Movimiento e intensidad
| Métrica | Descripción |
|---|---|
| Sprints | Cantidad de ráfagas de alta velocidad |
| Aceleraciones | Cambios bruscos de velocidad |
| Saltos | Detección y conteo de saltos |
| Impactos | Cantidad e intensidad de impactos recibidos |
| Explosividad | Índice combinado de intensidad de movimiento |

## Deportes soportados

| Deporte | Superficie | GPS activo | IMU activo |
|---|---|---|---|
| Fútbol 11 | Outdoor | ✓ | ✓ |
| Rugby | Outdoor | ✓ | ✓ |
| Hockey | Outdoor | ✓ | ✓ |
| Futsal | Indoor | ✗ | ✓ |
| Básquet | Indoor | ✗ | ✓ |
| Más deportes indoor y outdoor (expansión progresiva)

## IA conversacional — ELITRAX IA

Disponible en planes PRO y PRO+:
- Analiza datos de GPS e IMU de cada sesión
- Detecta patrones de rendimiento en el tiempo
- Compara sesiones entre sí
- Genera recomendaciones concretas y personalizadas
- Interfaz conversacional: el deportista hace preguntas ("¿En qué mejoré este mes?", "¿Cuál fue mi mejor partido?")
- No es un dashboard estático — es un entrenador que interpreta los datos

## Planes comerciales

### Modelo de negocio
Compra del dispositivo (hardware) + suscripción mensual al plan elegido.
Sin contratos ni permanencia. Cada dispositivo soporta hasta 3 usuarios.

### BASIC
- Métricas de GPS (distancia, velocidad, mapa de calor, zona dominante)
- Métricas de IMU (sprints, aceleraciones, saltos, impactos)
- App móvil con historial de sesiones

### PRO
- Todo lo incluido en BASIC
- Análisis de datos con IA
- Agente conversacional con recomendaciones personalizadas

### PRO+
- Todo lo incluido en PRO
- Acceso a la **plataforma web**
- Dashboard grupal para el cuerpo técnico
- Gestión de jugadores y métricas del equipo

## Diferenciador competitivo

Único tracker al alcance del amateur que combina GPS + IMU + IA conversacional
para deportes de equipo. También ofrece soporte personalizado presencial en Córdoba
(y próximamente toda Argentina y LATAM) y puede incorporar funcionalidades o
modificar las existentes a pedido de instituciones, equipos o clubes.

## Competencia

| Producto | Precio aprox. | Segmento |
|---|---|---|
| Catapult | ~USD 800 | Profesional / elite |
| STATSports | ~USD 250 | Semiprofesional |
| Elitrax | Accesible LATAM | Prosumer / amateur |

## Mercado objetivo

- **País inicial:** Argentina (Córdoba como ciudad de lanzamiento)
- 550.000+ deportistas federados de equipo en Argentina
- 40.000+ deportistas activos en Córdoba
- Solo en Córdoba: 333 clubes de fútbol / 111 de básquet / 40 de rugby / cientos de hockey

**Usuario primario (BASIC / PRO):**
Deportista amateur de 18–50 años que juega en ligas o clubes locales
(amateur, semiprofesional o profesional).

**Usuario secundario (PRO+):**
Director técnico, preparador físico o analista de equipo amateur.

## Marca

- Nombre: Elitrax (elite + tracking)
- Tagline: "CONOCÉ TU RENDIMIENTO REAL"
- Colores: Azul Medianoche #0A1628, Cian Eléctrico #46C7F0, Naranja Energía #F36C3A
- Tipografías: Exo 2 (títulos), DM Sans (cuerpo), JetBrains Mono (datos/código)
- Estilo visual: dark-first, tecnológico, limpio, deportivo premium

## Go-to-Market

- Fase 1: Córdoba (seed, validación)
- Fase 2: Argentina nacional
- Fase 3: Expansión LATAM
- Canales: e-commerce directo, MercadoLibre, retailers deportivos, academias, B2B

## Plataforma web — PRO+

Herramienta para el cuerpo técnico (DT, preparador físico, analista).

### Usuarios
- **Director Técnico:** estado físico general del equipo, detección de sobreexigencia, comparación de rendimientos
- **Preparador Físico / Analista:** carga de trabajo, evolución por jugador, planificación semanal

### Funcionalidades

**Dashboard grupal:**
- Vista general del equipo con métricas agregadas por sesión
- Indicadores colectivos (distancia promedio, sprints promedio, etc.)
- Mapa de calor colectivo
- Comparación entre sesiones (esta semana vs. semana anterior)

**Perfil individual por jugador:**
- Historial de sesiones
- Evolución de métricas en el tiempo (gráficos de tendencia)
- Comparación con el promedio del equipo
- Mapa de calor individual

**Gestión del equipo:**
- Alta/baja de jugadores
- Asignación de dispositivos ELITRAX a jugadores
- Categorías y posiciones en cancha
- Grupos o subgrupos (titulares, suplentes, categorías)

**Análisis de sesión:**
- Vista detallada de un partido o entrenamiento específico
- Métricas individuales de todos los jugadores
- Ranking interno por métrica (quién corrió más, quién tuvo más sprints, etc.)
- Alertas de sobreexigencia o bajo rendimiento

**Reportes (futuro):**
- PDF exportable por jugador o por sesión
- Reporte semanal/mensual automático

## Stack técnico actual

| Capa | Tecnología |
|---|---|
| Backend | PHP 8.4 FPM + Slim 4 |
| Base de datos | MySQL (PDO, sin ORM) |
| Validación | Respect/Validation |
| CORS | Configurado para `https://elitrax.com` |
| Repositorio | `Elitrax-org/elitrax-landing` en GitHub |

## Idioma de trabajo

Todo el contenido y las comunicaciones deben ser en español rioplatense
(voseo argentino). El contenido técnico y de código puede ser en inglés.

## Reglas para agentes

1. Siempre respetar la identidad visual de marca.
2. Todo contenido público debe alinearse con el tagline y posicionamiento.
3. Las recomendaciones de negocio deben considerar el contexto argentino
   (inflación, tipo de cambio, logística local, comportamiento del consumidor).
4. Priorizar acciones ejecutables sobre análisis teórico.
5. Cuando se trabaje en código, seguir buenas prácticas y comentar en español.

## Formato de solicitud inter-divisional

```
[SOLICITUD INTER-DIVISIONAL]
  De: PM / CEO
  Para: CEO / PM
  Asunto: [descripción breve]
  Impacto técnico: [si aplica]
  Impacto de negocio: [si aplica]
  Urgencia: Alta / Media / Baja
  Decisión necesaria antes de: [fecha]
```

## Estructura de agentes

Este proyecto tiene dos divisiones de agentes especializados:

### División Técnica (líder: Guillermo — PM)
Agentes: Javier (Arquitecto), Esteban (Fullstack), Giuliana (UX/UI),
Pablo (Analista Funcional), Federico (QA), Chicho (Ciberseguridad).
Definiciones en: `.claude/agents/technical/`

### División Admin/Gestión (líder: Dario — CEO)
Agentes: Andrés (Abogado), David (Contador), Carl (Economista),
Marcos (Marketing y Ventas), Pedro (Logística), Lucas (Diseñador Gráfico),
Ramiro (Despachante de Aduanas), Delfina (Investigadora de Mercado).
Definiciones en: `.claude/agents/admin/`

### Conectores disponibles para todos los agentes
- Web Search (investigación)
- Google Drive (documentos compartidos)
- Google Calendar (fechas y deadlines)
- Gmail (comunicaciones)
- Figma MCP (diseño bidireccional)
- Sistema de archivos local (`~/Proyectos/elitrax/`)

## Estructura de carpetas

### Estrategia y dirección
- `/strategy/` — Planes estratégicos, OKRs, decisiones ejecutivas ← **Dario (CEO)**

### Código fuente
- `/src/` — Código fuente del sistema
  - `/src/api/` — Backend / API REST
  - `/src/web/` — Frontend web
  - `/src/mobile/` — App mobile (Flutter)
  - `/src/firmware/` — Firmware del wearable

### Diseño
- `/design/` — Todos los assets visuales
  - `/design/brand/` — Identidad visual, logos, paleta, tipografías ← **Lucas (Diseñador Gráfico)**
  - `/design/ux-ui/` — Wireframes, prototipos, flujos de usuario ← **Giuliana (UX/UI)**
  - `/design/marketing/` — Assets para campañas y redes sociales ← **Lucas + Marcos**

### Campañas y marketing
- `/campaigns/` — Campañas de marketing (contenido, calendarios, copies, Instagram) ← **Marcos (Marketing y Ventas)**

### Documentación
- `/docs/` — Documentos por área
  - `/docs/economics/` — Modelos financieros, proyecciones, unit economics ← **Carl (Economista)**
  - `/docs/finance/` — Contabilidad, impuestos, estados financieros ← **David (Contador)**
  - `/docs/legal/` — Contratos, regulaciones, propiedad intelectual ← **Andrés (Abogado)**
  - `/docs/logistics/` — Cadena de suministro, proveedores, distribución ← **Pedro (Logística)**
  - `/docs/logistics/customs/` — Operatoria aduanera, aranceles, SIRA/SEDI ← **Ramiro (Despachante)**
  - `/docs/market-research/` — Investigación de mercado, benchmarks, usuarios ← **Delfina (Investigadora)**
  - `/docs/specs/` — Especificaciones funcionales, requerimientos ← **Pablo (Analista Funcional)**
  - `/docs/architecture/` — Diagramas de arquitectura, ADRs, API contracts ← **Javier (Arquitecto)**

### Gestión de proyecto
- `/project-management/` — Gestión del proyecto ← **Guillermo (PM)**
  - `/project-management/solicitudes/` — Solicitudes inter-divisionales
  - `/project-management/templates/` — Plantillas de documentos

### Calidad y seguridad
- `/tests/` — Tests automatizados y reportes de QA ← **Federico (QA)**
- `/security/` — Auditorías, análisis de vulnerabilidades, políticas ← **Chicho (Ciberseguridad)**
