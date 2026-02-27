# Ideas de Diseño - Red Banda Ancha IP

## Contexto
Página web técnica para presentar el esquema de direccionamiento IP VLSM de una red de banda ancha con tres sedes en Bogotá, Colombia. Audiencia: ingenieros de redes y técnicos de TI.

---

<response>
<idea>
**Design Movement:** Data Engineering Dashboard — estilo "Blueprint Técnico"

**Core Principles:**
1. Claridad técnica: la información densa se presenta de forma estructurada y escaneable.
2. Jerarquía visual fuerte: los datos más importantes (rangos IP, subredes) dominan visualmente.
3. Contraste alto: fondo oscuro tipo "sala de control" con acentos en cian/verde neón.
4. Densidad informativa sin caos: tablas, badges y código monoespaciado conviven armoniosamente.

**Color Philosophy:**
- Fondo: azul marino muy oscuro (#0a0f1e) evoca pantallas de control de red.
- Acento primario: cian eléctrico (#00d4ff) para IPs, rangos y elementos interactivos.
- Acento secundario: verde lima (#7fff00) para estados activos y broadcast.
- Texto: blanco puro y gris claro para jerarquía.

**Layout Paradigm:**
- Sidebar izquierdo fijo con navegación por sedes.
- Panel principal con cards de subredes en layout asimétrico (2/3 + 1/3).
- Barra de resumen en la parte superior con métricas clave.

**Signature Elements:**
1. Código monoespaciado con resaltado de sintaxis para direcciones IP.
2. Barras de progreso animadas que muestran el uso de hosts por subred.
3. Líneas de conexión SVG animadas entre sedes en el diagrama de topología.

**Interaction Philosophy:**
- Hover en filas de tabla resalta la subred completa.
- Click en una sede filtra y enfoca esa subred en todos los componentes.
- Tooltips técnicos al pasar sobre cada campo IP.

**Animation:**
- Entrada de cards con fade-in escalonado (stagger 100ms).
- Barras de uso de hosts se animan al cargar (fill animation 1s ease-out).
- Diagrama de red con líneas que se "dibujan" al hacer scroll.

**Typography System:**
- Títulos: Space Grotesk Bold — moderno, técnico, sin serif.
- Cuerpo: Inter Regular — legible y neutral.
- Código/IPs: JetBrains Mono — monoespaciado profesional para datos técnicos.
</idea>
<probability>0.08</probability>
</response>

<response>
<idea>
**Design Movement:** Technical Documentation Modernizada — estilo "Notion meets Cisco"

**Core Principles:**
1. Legibilidad máxima: diseño limpio con mucho espacio en blanco.
2. Estructura documental: secciones claramente delimitadas como un manual técnico premium.
3. Acentos de color sutiles: solo para destacar datos críticos.
4. Responsive y accesible: funciona igual en móvil que en desktop.

**Color Philosophy:**
- Fondo: blanco puro con secciones en gris muy claro (#f8f9fa).
- Acento: azul cobalto (#2563eb) para encabezados y elementos interactivos.
- Texto: gris carbón (#1e293b) para máxima legibilidad.
- Badges: colores semánticos (verde para hosts disponibles, rojo para broadcast).

**Layout Paradigm:**
- Layout de una columna centrada con max-width 900px.
- Secciones separadas por divisores sutiles.
- Sticky header con tabla de contenidos.

**Signature Elements:**
1. Cards de subred con borde izquierdo de color por sede.
2. Badges de estado para cada parámetro de red.
3. Tabla comparativa interactiva con ordenamiento.

**Interaction Philosophy:**
- Filtrado en tiempo real por sede o rango IP.
- Copiar al portapapeles con un click en cualquier dirección IP.
- Modo impresión optimizado.

**Animation:**
- Transiciones suaves al filtrar/ordenar tablas.
- Fade-in al hacer scroll en secciones.

**Typography System:**
- Títulos: Sora SemiBold — moderno pero serio.
- Cuerpo: Source Sans 3 — diseñado para documentación técnica.
- Código: Fira Code — monoespaciado con ligaduras.
</idea>
<probability>0.07</probability>
</response>

<response>
<idea>
**Design Movement:** Network Operations Center (NOC) — estilo "Glassmorphism Técnico"

**Core Principles:**
1. Profundidad visual: capas de transparencia crean sensación de profundidad.
2. Información en tiempo real: la UI simula un panel de monitoreo activo.
3. Gradientes sutiles: transiciones de color que guían la atención.
4. Iconografía de red: iconos técnicos específicos de networking.

**Color Philosophy:**
- Fondo: gradiente de azul profundo a índigo oscuro.
- Cards: fondo semitransparente con blur (glassmorphism).
- Acento: naranja ámbar (#f59e0b) para alertas y datos críticos.
- Texto: blanco con opacidades variables para jerarquía.

**Layout Paradigm:**
- Grid de 3 columnas para las sedes, con una card por sede.
- Panel de resumen en la parte superior tipo "status bar".
- Diagrama de topología interactivo en la sección central.

**Signature Elements:**
1. Cards con efecto glass (backdrop-blur + border semitransparente).
2. Indicadores de estado pulsantes (pulse animation) para cada sede.
3. Gráfico de barras interactivo mostrando distribución de hosts.

**Interaction Philosophy:**
- Cards expandibles al hacer click para ver detalles completos.
- Gráfico interactivo con tooltips detallados.
- Animaciones de "ping" en el diagrama de red.

**Animation:**
- Pulse suave en indicadores de estado activo.
- Cards con hover lift effect (translateY -4px + shadow increase).
- Contador animado para el número de hosts al cargar.

**Typography System:**
- Títulos: Rajdhani Bold — futurista pero legible, perfecto para NOC.
- Cuerpo: Nunito Sans — amigable y técnico a la vez.
- Datos: IBM Plex Mono — monoespaciado corporativo.
</idea>
<probability>0.09</probability>
</response>

---

## Decisión Final

Se elige el **Enfoque 1: Data Engineering Dashboard — Blueprint Técnico**.

Razones:
- El fondo oscuro con acentos cian es el estándar de facto en herramientas de networking profesionales (Cisco, Wireshark, etc.).
- La tipografía monoespaciada para IPs refuerza la credibilidad técnica.
- El sidebar con navegación por sedes permite escalar fácilmente si se agregan más sedes.
- Las animaciones de barras de uso comunican información de capacidad de forma intuitiva.
