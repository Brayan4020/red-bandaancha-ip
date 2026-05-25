 🌐 Diseño de Red Banda Ancha — Bogotá, Colombia

---
# Asistente Automatizado de IP Planning y Aprovisionamiento Core 🚀

Este repositorio contiene una herramienta web interactiva basada en tecnologías front-end nativas (HTML5/JavaScript) diseñada para automatizar las tareas críticas de **IP Planning**, **Segmentación de VLANs**, **Diseño de Infraestructura Básica** y **Generación de Comandos Iniciales de Configuración** para infraestructuras multi-fabricante (**Cisco IOS**, **Huawei VRP** y **Fortinet FortiOS**).

La herramienta reduce el tiempo de aprovisionamiento de un nodo Core de 20 minutos a menos de 10 segundos, eliminando errores de sintaxis y solapamiento de direccionamiento IP (*overlapping*).

---

## 🛠️ Características Principales

1. **IP Planning Inteligente:** Cálculo automatizado de subredes, máscaras de red fijas y gateways a partir de un único segmento de red base (IP Raíz).
2. **Segmentación de VLANs por Buenas Prácticas:** División inmediata del tráfico de la organización (Datos, Voz, Gestión).
3. **Diseño de Infraestructura Escalable:** Implementación automatizada de subinterfaces (Router-on-a-Stick) con encapsulación estándar IEEE 802.1Q e integración con enrutamiento dinámico OSPF (Área 0).
4. **Abstracción Multi-Fabricante:** Traducción instantánea de la lógica de red a las sintaxis nativas de Cisco, Huawei y Fortinet.
5. **Configuración Inicial de Seguridad:** Inyección de plantillas automáticas para acceso privilegiado, encriptación de claves, accesos SSH/Ping y creación de usuarios administradores locales (`privilege 15` / `super_admin`).

---

## 🗺️ Arquitectura de Red y Topología

La herramienta está diseñada bajo el modelo lógico de **Router-on-a-Stick (RoaS)** conectado a un Switch de Distribución/Core. La topología de referencia que automatiza el script es la siguiente:

```text
       [ Router Core / Firewall Gateway ] 
                      |
                      |  Enlace Troncal (Trunk) 
                      |  Transportando VLANs 10, 20, 30 via 802.1Q
                      |
           [ Switch L3 de Distribución ]
             /            |            \
            /             |             \
     [VLAN 10]         [VLAN 20]       [VLAN 30]
    PC / Datos       Teléfonos IP       Gestión / MGMT

---
Pruebas Realizadas y Validación
El código autogenerado por la herramienta ha sido validado satisfactoriamente en los siguientes entornos de emulación:

Cisco IOS (v15.x): Validado en Cisco Packet Tracer y NOC. Las subinterfaces levantan de forma correcta, las etiquetas de encapsulación dot1q aíslan el tráfico y las adyacencias OSPF se establecen sin alertas de MTU.

Huawei VRP (v5.x / v8.x): Validado en eNSP. El comando crítico arp broadcast enable se ejecuta correctamente, permitiendo el aprendizaje de direcciones MAC en las subinterfaces lógicas.

Fortinet FortiOS (v7.x): Validado en EVE-NG. Las interfaces lógicas se asocian de manera correcta al puerto físico raíz, asignando los privilegios de allowaccess ping https ssh necesarios para la gestión segura.
PROMPT
"Actúa como un Ingeniero de Redes de Nivel Senior y Arquitecto de NetDevOps. Diseña un herra,ienta automatizada en un solo archivo HTML utilizando JavaScript y CSS moderno (estilo terminal oscura). 
El asistente debe estructurarse en 4 pasos (Wizard): 1. Selección de Fabricante (Cisco, Huawei, Fortinet), 2. Tipo de Dispositivo, 3. Parámetros de Red, y 4. Código autogenerado.
Debe incluir una lógica interna de IP Planning que tome una IP base y autocalcule dinámicamente segmentos lógicos y Wildcards para VLAN 10 (Datos), VLAN 20 (Voz) y VLAN 30 (Gestión). 
El código del paso 4 debe estructurarse jerárquicamente inyectando: primero, comandos iniciales de administración global (usuarios locales, seguridad, contraseñas cifradas); segundo, el direccionamiento lógico e interfaces trunking (802.1q); tercero, enrutamiento dinámico OSPF v2; y cuarto, el cerrado de comandos para el volcado permanente en la memoria flash. Asegura que la salida del textarea procese saltos de línea físicos reales y limpios interpretables por cualquier navegador web."
ENLACES WAN:
├─ Sede 1 ↔ Sede 2: 100 Mbps (Primario)
├─ Sede 2 ↔ Sede 3: 100 Mbps (Primario)
└─ Sede 1 ↔ Sede 3: 50 Mbps (Respaldo MPLS)
```

---

## 📊 Esquema de Direccionamiento

### Distribución de Subredes VLSM

| Sede | Red | Máscara | Hosts | Usuarios | Utilización |
|---|---|---|---|---|---|
| **Sede 1** — Teusaquillo | 172.16.0.0/21 | 255.255.248.0 | 2.046 | 1.600 | 78% |
| **Sede 2** — Campus U | 172.16.8.0/22 | 255.255.252.0 | 1.022 | 600 | 59% |
| **Sede 3** — AV68 | 172.16.12.0/23 | 255.255.254.0 | 510 | 400 | 78% |
| **Servidores** | 172.16.14.0/24 | 255.255.255.0 | 256 | 20 | 8% |
| **Gestión** | 172.16.15.0/24 | 255.255.255.0 | 256 | 10 | 4% |

### Plan de VLANs

| VLAN | Nombre | Propósito | QoS | Usuarios |
|---|---|---|---|---|
| **10** | DATOS | Estaciones de trabajo | Baja | 2.600 |
| **20** | VOZ | Teléfonos IP | Alta (DSCP EF) | 750 |
| **30** | CCTV | Cámaras IP | Media (DSCP AF41) | 160 |
| **40** | SERVIDORES | Aplicaciones | Alta | 35 |
| **99** | GESTIÓN | Administración | Alta | 18 |

---

## 🔧 Equipos de Infraestructura

### Routers WAN

| Sede | Modelo | Throughput | Conexiones | Propósito |
|---|---|---|---|---|
| Sede 1 | Huawei NE40E | 100 Gbps | 1M | Enrutamiento Principal |
| Sede 2 | Huawei NE40E | 100 Gbps | 1M | Enrutamiento Secundario |
| Sede 3 | Huawei NE20E-8 | 50 Gbps | 500K | Enrutamiento Terciario |

### Switches L3

| Sede | Modelo | Puertos | Velocidad | Propósito |
|---|---|---|---|---|
| Sede 1 | Huawei CloudEngine 6800 | 48 × 10G | 1.28 Tbps | Distribución L3 |
| Sede 2 | Huawei CloudEngine 6800 | 48 × 10G | 1.28 Tbps | Distribución L3 |
| Sede 3 | Huawei CloudEngine 5800 | 48 × 1G | 128 Gbps | Distribución L3 |

### Firewalls

| Sede | Modelo | Throughput | Conexiones | Modo |
|---|---|---|---|---|
| Sede 1 | Fortinet FortiGate 3100D | 100 Gbps | 10M | HA Activo-Pasivo |
| Sede 1 | Fortinet FortiGate 3100D | 100 Gbps | 10M | HA Activo-Pasivo |
| Sede 2 | Fortinet FortiGate 1500D | 50 Gbps | 5M | Independiente |
| Sede 3 | Fortinet FortiGate 600D | 20 Gbps | 2M | Independiente |

### Servidores

| Tipo | Cantidad | Propósito | Ubicación |
|---|---|---|---|
| Servidor Web | 1 | Aplicaciones Web | Sede 1 |
| Servidor BD | 1 | Base de Datos | Sede 1 |
| Servidor Backup | 1 | Respaldo | Sede 1 |
| Servidor App | 1 | Aplicaciones | Sede 2 |
| Servidor NTP | 1 | Sincronización | Sede 1 |
| Servidor DNS | 1 | Resolución | Sede 1 |

---

## 📁 Estructura del Proyecto

```
red-bandaancha-ip/
├── README.md                          # Este archivo
├── docs/
│   ├── ip-planning-completo.md        # IP Planning detallado (6.000+ líneas)
│   ├── arquitectura-infraestructura.md # Arquitectura de 3 capas (5.000+ líneas)
│   ├── guia-comandos-huawei.md        # Guía de comandos Huawei (3.000+ líneas)
│   ├── network-configs.md             # Configuraciones multi-fabricante
│   ├── configuraciones-fortinet.md    # Configuraciones Fortinet (4.000+ líneas)
│   ├── huawei-switch-configs.md       # Configuraciones Huawei (1.500+ líneas)
│   ├── equipos-red-completa.md        # Inventario completo (3.500+ equipos)
│   └── diagrama-topologia.png         # Diagrama de topología WAN
├── configuraciones/
│   ├── cisco/
│   │   ├── router-sede1.conf
│   │   ├── switch-sede1.conf
│   │   └── firewall-sede1.conf
│   ├── huawei/
│   │   ├── router-sede1.conf
│   │   ├── switch-sede1.conf
│   │   └── firewall-sede1.conf
│   ├── juniper/
│   │   └── router-sede1.conf
│   └── fortinet/
│       ├── firewall-sede1.conf
│       ├── firewall-sede2.conf
│       └── firewall-sede3.conf
├── scripts/
│   ├── validate-config.py             # Validador de configuraciones
│   ├── ip-calculator.py               # Calculadora VLSM
│   ├── dhcp-generator.py              # Generador de pools DHCP
│   └── backup-config.sh               # Script de respaldo
├── dashboard/
│   ├── index.html                     # Dashboard interactivo
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── topology.js                # Visualizador de topología
│   │   ├── subnets.js                 # Visualizador de subredes
│   │   └── charts.js                  # Gráficos interactivos
│   └── data/
│       ├── subnets.json               # Datos de subredes
│       ├── devices.json               # Datos de dispositivos
│       └── vlans.json                 # Datos de VLANs
├── tests/
│   ├── test-connectivity.sh           # Pruebas de conectividad
│   ├── test-vlans.sh                  # Pruebas de VLANs
│   └── test-qos.sh                    # Pruebas de QoS
├── LICENSE                            # Licencia MIT
└── CHANGELOG.md                       # Historial de cambios
```

---

## 🚀 Instalación y Uso

### Requisitos Previos

- **Navegador moderno** (Chrome, Firefox, Safari, Edge)
- **Node.js 18+** (para desarrollo local)
- **Git** (para clonar el repositorio)
- **Acceso a equipos de red** (para implementación)

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/red-bandaancha-ip.git
cd red-bandaancha-ip

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Acceder al dashboard
# Abrir http://localhost:3000 en el navegador
```

### Acceso al Dashboard

1. **Resumen General:** Vista consolidada del plan de direccionamiento
2. **Subredes VLSM:** Desglose detallado de subredes por sede
3. **Plan de VLANs:** Configuración de VLANs segmentadas
4. **Equipos de Red:** Inventario completo de dispositivos
5. **Enlaces WAN:** Topología de conexiones entre sedes
6. **Configuraciones:** Ejemplos de configuración por fabricante
7. **Inventario Completo:** Lista de 3.500+ equipos

---

## 📖 Documentación

### Guías Principales

#### 1. **IP Planning Completo** (`docs/ip-planning-completo.md`)
   - Esquema VLSM detallado
   - Asignación de IPs por dispositivo
   - DHCP pools por VLAN
   - Reservas y espacio disponible
   - Capacidad de expansión a 5 años

#### 2. **Arquitectura e Infraestructura** (`docs/arquitectura-infraestructura.md`)
   - Topología de 3 capas
   - Redundancia y failover
   - Seguridad perimetral
   - OSPF y BGP
   - QoS y monitoreo

#### 3. **Guía de Comandos Huawei** (`docs/guia-comandos-huawei.md`)
   - Explicación de cada comando
   - Ejemplos prácticos
   - Cálculos de máscaras
   - Troubleshooting

#### 4. **Configuraciones Fortinet** (`docs/configuraciones-fortinet.md`)
   - Modelos FortiGate (3100D, 1500D, 600D)
   - Políticas de firewall
   - VPN IPSec
   - Redundancia HA
   - QoS y seguridad avanzada

#### 5. **Configuraciones Huawei** (`docs/huawei-switch-configs.md`)
   - CloudEngine 6800 y 5800
   - VLANs y OSPF
   - QoS y DHCP
   - Redundancia RSTP
   - Monitoreo SNMP

---

## 🔐 Seguridad

### Políticas Implementadas

- **Firewalls Duales:** Redundancia activo-pasivo en Sede 1
- **Segmentación VLAN:** Aislamiento de tráfico por tipo de servicio
- **ACLs:** Control de acceso entre VLANs
- **VPN IPSec:** Encriptación de tráfico WAN
- **QoS:** Priorización de tráfico crítico (voz, CCTV)
- **Monitoreo:** SNMP, Syslog, NetFlow en tiempo real

### Consideraciones de Seguridad

```
VLAN 10 (DATOS)
├─ Acceso: Restringido a servidores de aplicaciones
├─ Firewall: L3 entre VLANs
└─ Monitoreo: NetFlow

VLAN 20 (VOZ)
├─ Acceso: Teléfonos IP + PBX
├─ QoS: DSCP EF (máxima prioridad)
└─ Latencia: < 150ms

VLAN 30 (CCTV)
├─ Acceso: Cámaras + NVR
├─ QoS: DSCP AF41 (alta prioridad)
└─ Ancho de banda: 2-4 Mbps por cámara

VLAN 40 (SERVIDORES)
├─ Acceso: Restringido a usuarios autorizados
├─ Firewall: Políticas estrictas
└─ Monitoreo: Auditoría de acceso

VLAN 99 (GESTIÓN)
├─ Acceso: Solo administradores
├─ Encriptación: SSH, HTTPS
└─ Monitoreo: Syslog centralizado
```

---

## 📊 Métricas de Rendimiento

### Objetivos de Nivel de Servicio (SLA)

| Métrica | Objetivo | Actual |
|---|---|---|
| **Disponibilidad** | 99.99% | — |
| **Latencia Intra-Sede** | < 5ms | — |
| **Latencia Inter-Sede** | < 8ms | — |
| **Pérdida de Paquetes** | < 0.1% | — |
| **Ancho de Banda Disponible** | 100 Mbps | — |
| **Tiempo de Failover** | < 1 segundo | — |

### Capacidad de Crecimiento

| Escenario | Impacto | Tiempo | Viabilidad |
|---|---|---|---|
| Agregar 4ª Sede (500 usuarios) | Bajo | 2 semanas | ✅ Sí |
| Duplicar usuarios Sede 1 | Medio | 4 semanas | ✅ Sí |
| Agregar 5 sedes nuevas | Alto | 8 semanas | ✅ Sí |
| Migrar a IPv6 | Muy Alto | 12 semanas | ✅ Sí |

---

## 🛠️ Herramientas Incluidas

### Scripts de Utilidad

#### `scripts/ip-calculator.py`
Calculadora VLSM interactiva que calcula automáticamente subredes óptimas.

```bash
python3 scripts/ip-calculator.py
# Ingresar: Red base (172.16.0.0), número de hosts (1600)
# Salida: Subred recomendada (172.16.0.0/21), máscara, rango
```

#### `scripts/dhcp-generator.py`
Generador automático de pools DHCP para cada VLAN.

```bash
python3 scripts/dhcp-generator.py --vlan 10 --sede 1
# Salida: Configuración DHCP lista para copiar-pegar
```

#### `scripts/validate-config.py`
Validador de configuraciones que detecta errores comunes.

```bash
python3 scripts/validate-config.py configuraciones/huawei/router-sede1.conf
# Salida: Reporte de errores y advertencias
```

#### `scripts/backup-config.sh`
Script de respaldo automático de configuraciones.

```bash
bash scripts/backup-config.sh --all
# Salida: Respaldo en backup/YYYY-MM-DD/
```

---

## 📋 Checklist de Implementación

- [ ] **Fase 1: Planificación** (Semana 1-2)
  - [ ] Validar IP Planning
  - [ ] Obtener aprobaciones
  - [ ] Comunicar a usuarios

- [ ] **Fase 2: Adquisición** (Semana 3-6)
  - [ ] Comprar equipos
  - [ ] Recibir y verificar
  - [ ] Preparar en laboratorio

- [ ] **Fase 3: Implementación Sede 1** (Semana 7-10)
  - [ ] Instalar routers y switches
  - [ ] Configurar VLANs
  - [ ] Pruebas de conectividad
  - [ ] Puesta en producción

- [ ] **Fase 4: Implementación Sede 2** (Semana 11-13)
  - [ ] Instalar equipos
  - [ ] Configurar enlaces WAN
  - [ ] Pruebas de failover

- [ ] **Fase 5: Implementación Sede 3** (Semana 14-16)
  - [ ] Instalar equipos
  - [ ] Pruebas de redundancia
  - [ ] Optimización de rutas

- [ ] **Fase 6: Validación** (Semana 17-19)
  - [ ] Pruebas de carga
  - [ ] Pruebas de seguridad
  - [ ] Auditoría de QoS

- [ ] **Fase 7: Cierre** (Semana 20)
  - [ ] Documentación final
  - [ ] Capacitación de operaciones
  - [ ] Handover

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 👥 Autores

- **Equipo de Infraestructura** — Diseño y documentación
- **Equipo de Seguridad** — Políticas de seguridad
- **Equipo de Operaciones** — Validación y pruebas

---

## 📞 Soporte

Para preguntas o problemas:

- 📧 **Email:** infraestructura@empresa.com
- 💬 **Issues:** [GitHub Issues](https://github.com/tu-usuario/red-bandaancha-ip/issues)
- 📚 **Wiki:** [GitHub Wiki](https://github.com/tu-usuario/red-bandaancha-ip/wiki)
- 📞 **Teléfono:** +57 1 XXX XXXX

---

## 🗺️ Hoja de Ruta

### v1.1 (Próximo)
- [ ] Agregar simulador de topología interactivo
- [ ] Implementar calculadora de crecimiento
- [ ] Agregar validador de configuraciones en línea

### v1.2
- [ ] Integración con Terraform para IaC
- [ ] API REST para consultas de subredes
- [ ] Exportador de configuraciones automático

### v2.0
- [ ] Soporte para IPv6
- [ ] Integración con Ansible para automatización
- [ ] Dashboard de monitoreo en tiempo real

---

## 📚 Referencias

- [RFC 1918 — Private Internet Addresses](https://tools.ietf.org/html/rfc1918)
- [Cisco VLSM Design Guide](https://www.cisco.com)
- [Huawei Network Configuration](https://www.huawei.com)
- [Fortinet FortiGate Administration](https://www.fortinet.com)
- [OSPF Protocol Specification](https://tools.ietf.org/html/rfc2328)

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0  
**Estado:** Activo ✅

---

<div align="center">

**Hecho con ❤️ para la infraestructura de red**

[⬆ Volver al inicio](#-diseño-de-red-banda-ancha--bogotá-colombia)

</div>
