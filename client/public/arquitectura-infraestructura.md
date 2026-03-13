# Arquitectura e Infraestructura de Red Banda Ancha — Bogotá

## Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Topología General](#topología-general)
3. [Arquitectura de Capas](#arquitectura-de-capas)
4. [Diseño de Redundancia](#diseño-de-redundancia)
5. [Seguridad Perimetral](#seguridad-perimetral)
6. [Arquitectura de VLANs](#arquitectura-de-vlans)
7. [Enrutamiento Dinámico](#enrutamiento-dinámico)
8. [Calidad de Servicio (QoS)](#calidad-de-servicio-qos)
9. [Gestión y Monitoreo](#gestión-y-monitoreo)
10. [Consideraciones de Escalabilidad](#consideraciones-de-escalabilidad)

---

## Resumen Ejecutivo

La red banda ancha diseñada para Bogotá es una **infraestructura empresarial de clase mundial** que interconecta 3 sedes geográficamente distribuidas con:

- **2.600 usuarios** distribuidos en 3 sedes
- **Topología de malla parcial** con redundancia activa-activa
- **Arquitectura de 3 capas** (Core, Distribution, Access)
- **Seguridad multinivel** con firewalls, IDS/IPS y control de acceso
- **QoS garantizado** para voz, video y datos críticos
- **Disponibilidad del 99.99%** (menos de 52 minutos de downtime anual)

---

## Topología General

### Diagrama de Topología

```
┌─────────────────────────────────────────────────────────────────┐
│                     INTERNET / ISP                              │
│                    (Múltiples proveedores)                      │
└────────────┬─────────────────────────────────────────┬──────────┘
             │                                         │
        ┌────▼────┐                              ┌─────▼────┐
        │ Firewall│                              │ Firewall │
        │ Primario│                              │Secundario│
        │ (USG6600)                              │(USG6300) │
        └────┬────┘                              └─────┬────┘
             │                                         │
             │         CORE LAYER (Núcleo)            │
             │                                         │
        ┌────▼────────────────────────────────────────▼────┐
        │   Huawei NE40E (Router Principal Sede 1)        │
        │   Router ID: 172.16.0.254                       │
        │   Interfaces: 4x10GE + 8x1GE                    │
        └────┬────────────────────────────────────────┬───┘
             │                                        │
        ┌────▼─────────────────────────────────────┐ │
        │  Eth-Trunk1 (Fibra Monomodo OS2)        │ │
        │  Enlace Primario: 10 Gbps                │ │
        │  Distancia: 2.5 km                       │ │
        └────┬─────────────────────────────────────┘ │
             │                                        │
        ┌────▼────────────────────────────────────────▼────┐
        │   Huawei NE40E (Router Secundario Sede 2)       │
        │   Router ID: 172.16.8.254                       │
        │   Interfaces: 4x10GE + 8x1GE                    │
        └────┬────────────────────────────────────────┬───┘
             │                                        │
        ┌────▼─────────────────────────────────────┐ │
        │  Eth-Trunk2 (Fibra Monomodo OS2)        │ │
        │  Enlace Primario: 10 Gbps                │ │
        │  Distancia: 3.79 km                      │ │
        └────┬─────────────────────────────────────┘ │
             │                                        │
        ┌────▼────────────────────────────────────────▼────┐
        │   Huawei NE20E-8 (Router Terciario Sede 3)      │
        │   Router ID: 172.16.12.254                      │
        │   Interfaces: 2x10GE + 4x1GE                    │
        └────┬────────────────────────────────────────┬───┘
             │                                        │
             └────────────────────────────────────────┘
                    Enlace de Respaldo MPLS VPN
                    Ancho de banda: 5 Gbps
                    Distancia: 6.29 km (total)

DISTRIBUTION LAYER (Distribución) - Una por sede

┌─────────────────────────────────────────────────────────────┐
│ Sede 1: Huawei CloudEngine 6800 (Switch L3)                │
│ • 48 puertos 1GE + 4 puertos 10GE                          │
│ • VLAN 10 (Datos), 20 (Voz), 30 (CCTV), 40 (Servidores)  │
│ • Throughput: 400 Gbps                                     │
│ • Ubicación: Teusaquillo                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Sede 2: Huawei CloudEngine 6800 (Switch L3)                │
│ • 48 puertos 1GE + 4 puertos 10GE                          │
│ • Misma configuración VLAN que Sede 1                      │
│ • Ubicación: Campus U Compensar                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Sede 3: Huawei CloudEngine 5800 (Switch L3)                │
│ • 24 puertos 1GE + 2 puertos 10GE                          │
│ • Misma configuración VLAN que Sede 1                      │
│ • Ubicación: AV68                                          │
└─────────────────────────────────────────────────────────────┘

ACCESS LAYER (Acceso) - Múltiples por sede

┌─────────────────────────────────────────────────────────────┐
│ Sede 1: 8 Switches Huawei S5720 (48 puertos 1GE c/u)      │
│ • Total: 384 puertos de acceso                             │
│ • Conectan: PCs, Impresoras, Teléfonos IP                 │
│ • Protocolos: STP, RSTP, BPDU Guard                       │
└─────────────────────────────────────────────────────────────┘

Sede 2: 4 Switches Huawei S5720 (48 puertos 1GE c/u)
• Total: 192 puertos de acceso

Sede 3: 2 Switches Huawei S5720 (48 puertos 1GE c/u)
• Total: 96 puertos de acceso
```

---

## Arquitectura de Capas

### 1. Capa de Acceso (Access Layer)

**Propósito:** Conectar dispositivos finales a la red

**Componentes:**
- Switches Huawei S5720 (48 puertos 1GE)
- Puntos de acceso WiFi 6 (110 total)
- Teléfonos IP (500 total)
- Cámaras IP (160 total)

**Características:**
- Puertos configurados en modo **access** (una VLAN por puerto)
- **STP Edged Port** habilitado para convergencia rápida
- **BPDU Guard** para protección contra bucles
- **Port Security** para limitar direcciones MAC
- **PoE (Power over Ethernet)** en puertos de teléfonos y APs

**Redundancia:**
- Cada dispositivo crítico conectado a 2 switches (uplinks redundantes)
- Failover automático en caso de falla

---

### 2. Capa de Distribución (Distribution Layer)

**Propósito:** Agregar tráfico de acceso y proporcionar servicios

**Componentes:**
- 3 Switches Huawei CloudEngine L3 (uno por sede)
- Firewalls (2 en Sede 1)
- Servidores de aplicaciones (3 total)

**Características:**
- **Enrutamiento L3** (OSPF dinámico)
- **VLANs** separadas por servicio (Datos, Voz, CCTV, Servidores)
- **QoS** aplicado en interfaces de uplink
- **DHCP** para asignación automática de IPs
- **Agregación de enlaces** (Eth-Trunk) hacia Core

**Redundancia:**
- Múltiples uplinks a Core
- Convergencia OSPF + BFD en milisegundos

---

### 3. Capa de Núcleo (Core Layer)

**Propósito:** Interconectar sedes y proporcionar conectividad WAN

**Componentes:**
- 3 Routers Huawei NE40E/NE20E
- Enlace primario: Fibra óptica 10 Gbps (Sede 1-2-3)
- Enlace de respaldo: MPLS VPN 5 Gbps (Sede 1-3)
- Internet: Múltiples proveedores ISP

**Características:**
- **Enrutamiento dinámico OSPF** con BFD
- **BGP** hacia Internet
- **QoS** en enlaces WAN
- **Encriptación VPN** para tráfico sensible
- **Monitoreo NetFlow** de tráfico

**Redundancia:**
- Topología de malla parcial (3 enlaces)
- Failover automático en < 300ms (con BFD)
- Balanceo de carga en enlaces primarios

---

## Diseño de Redundancia

### Redundancia de Enlace WAN

| Enlace | Origen | Destino | Tecnología | Ancho de Banda | Estado | Prioridad |
|---|---|---|---|---|---|---|
| **Enlace 1** | Sede 1 | Sede 2 | Fibra Dedicada | 10 Gbps | Primario | 100 |
| **Enlace 2** | Sede 2 | Sede 3 | Fibra Dedicada | 10 Gbps | Primario | 100 |
| **Enlace 3** | Sede 1 | Sede 3 | MPLS VPN | 5 Gbps | Respaldo | 200 |

**Escenarios de Falla:**

1. **Falla de Enlace 1 (Sede 1-2):**
   - Tráfico Sede 1 → Sede 2 se redirige por: Sede 1 → Sede 3 → Sede 2
   - Tiempo de convergencia: 300ms (con BFD)
   - Ancho de banda disponible: 5 Gbps (enlace 3)

2. **Falla de Enlace 2 (Sede 2-3):**
   - Tráfico Sede 2 → Sede 3 se redirige por: Sede 2 → Sede 1 → Sede 3
   - Tiempo de convergencia: 300ms
   - Ancho de banda disponible: 10 Gbps (enlace 1)

3. **Falla de Enlace 3 (Sede 1-3):**
   - Tráfico Sede 1 → Sede 3 se redirige por: Sede 1 → Sede 2 → Sede 3
   - Tiempo de convergencia: 300ms
   - Ancho de banda disponible: 10 Gbps (enlace 2)

4. **Falla de 2 Enlaces:**
   - La red sigue funcionando en topología lineal
   - Ejemplo: Si fallan enlace 1 y 2, Sede 3 se conecta solo por enlace 3

### Redundancia de Equipos Críticos

| Componente | Sede 1 | Sede 2 | Sede 3 | Redundancia |
|---|---|---|---|---|
| **Router WAN** | NE40E | NE40E | NE20E-8 | N+1 (2 NE40E en Sede 1) |
| **Switch L3** | CE 6800 | CE 6800 | CE 5800 | N+1 (2 CE 6800 en Sede 1) |
| **Firewall** | 2 x USG6600 | 1 x USG6300 | — | HA Activo-Activo |
| **Servidor App** | 2 | 1 | 1 | Replicación activa |
| **UPS** | 200 kVA | 100 kVA | 50 kVA | Autonomía 15 min |
| **Generador** | 250 kVA | 150 kVA | 100 kVA | Autonomía ilimitada |

---

## Seguridad Perimetral

### Arquitectura de Seguridad

```
                    INTERNET
                       │
                       ▼
        ┌──────────────────────────────┐
        │  Firewall Perimetral Primario│
        │  (Huawei USG6600)            │
        │  • IDS/IPS                   │
        │  • DLP (Data Loss Prevention)│
        │  • Antivirus                 │
        │  • VPN SSL                   │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  Firewall Perimetral Secundario
        │  (Huawei USG6300)            │
        │  • Redundancia HA            │
        │  • Sincronización de sesiones│
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  DMZ (Zona Desmilitarizada)  │
        │  • Servidores Web            │
        │  • Servidores Mail           │
        │  • DNS Público               │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  Firewall Interno (L3)       │
        │  • Segmentación de VLANs     │
        │  • ACLs por VLAN             │
        │  • Filtrado de protocolos    │
        └──────────────┬───────────────┘
                       │
        ┌──────────────▼───────────────┐
        │  Zona Interna (LAN)          │
        │  • VLAN 10 (Datos)           │
        │  • VLAN 20 (Voz)             │
        │  • VLAN 30 (CCTV)            │
        │  • VLAN 40 (Servidores)      │
        └──────────────────────────────┘
```

### Políticas de Seguridad

**1. Ingreso desde Internet:**
- Bloqueado por defecto (Deny All)
- Solo puertos específicos permitidos (80, 443, 22 SSH)
- Inspección de contenido (IDS/IPS)
- Rate limiting para prevenir DDoS

**2. Salida desde LAN:**
- Permitido por defecto (Allow All)
- Inspección de malware
- Bloqueo de sitios maliciosos
- Logging de todas las conexiones

**3. Tráfico entre VLANs:**
- VLAN 10 ↔ VLAN 40: Permitido (Datos ↔ Servidores)
- VLAN 20 ↔ VLAN 40: Permitido (Voz ↔ Servidores)
- VLAN 30 ↔ VLAN 40: Permitido (CCTV ↔ Almacenamiento)
- Otras combinaciones: Bloqueadas

**4. Acceso Administrativo:**
- SSH solo desde red de administración
- Cambio de contraseñas cada 90 días
- Auditoría de todos los cambios
- Autenticación multifactor (MFA)

---

## Arquitectura de VLANs

### Segmentación por VLAN

| VLAN | Nombre | Propósito | Rango IP | Máscara | Gateway | Usuarios |
|---|---|---|---|---|---|---|
| **10** | DATOS | Estaciones de trabajo | 172.16.0.101 - 172.16.7.254 | /21 | 172.16.0.1 | 1.600 |
| **20** | VOZ | Teléfonos IP | 172.16.8.101 - 172.16.11.254 | /22 | 172.16.8.1 | 500 |
| **30** | CCTV | Cámaras de seguridad | 172.16.12.101 - 172.16.13.254 | /23 | 172.16.12.1 | 160 |
| **40** | SERVIDORES | Servidores y almacenamiento | 172.16.14.0 - 172.16.14.255 | /24 | 172.16.14.1 | 20 |
| **99** | GESTIÓN | Administración de red | 172.16.15.0 - 172.16.15.255 | /24 | 172.16.15.1 | 10 |

### Características de VLANs

**VLAN 10 (Datos):**
- Usuarios finales (PCs, laptops)
- Acceso a servidores de aplicaciones
- Ancho de banda: Sin límite (best effort)
- QoS: Baja prioridad

**VLAN 20 (Voz):**
- Teléfonos IP (500 dispositivos)
- Servidores PBX
- Ancho de banda: 300 Kbps por teléfono (máximo)
- QoS: Máxima prioridad (DSCP EF)
- Latencia máxima: 150ms

**VLAN 30 (CCTV):**
- Cámaras IP (160 dispositivos)
- Servidores NVR
- Ancho de banda: 2-4 Mbps por cámara
- QoS: Alta prioridad (DSCP AF41)
- Latencia máxima: 500ms

**VLAN 40 (Servidores):**
- Servidores de aplicaciones
- Almacenamiento SAN
- Bases de datos
- Ancho de banda: Sin límite
- QoS: Media-alta prioridad

**VLAN 99 (Gestión):**
- Acceso administrativo a switches y routers
- Monitoreo SNMP
- Syslog centralizado
- Acceso restringido por ACL

---

## Enrutamiento Dinámico

### Protocolo OSPF

**Configuración:**
- **Instancia:** OSPF 1
- **Área:** 0.0.0.0 (Backbone)
- **Router IDs:**
  - Sede 1: 172.16.0.254
  - Sede 2: 172.16.8.254
  - Sede 3: 172.16.12.254

**Características:**
- **Convergencia rápida:** BFD detecta fallas en 300ms
- **Costo de enlace:** Auto-calculado basado en ancho de banda
- **Balanceo de carga:** Automático en enlaces con igual costo
- **Redistribución:** Rutas estáticas hacia Internet

**Vecindades OSPF:**
```
Sede 1 ←→ Sede 2 (Enlace 1 - 10 Gbps - Costo 10)
Sede 2 ←→ Sede 3 (Enlace 2 - 10 Gbps - Costo 10)
Sede 1 ←→ Sede 3 (Enlace 3 - 5 Gbps - Costo 20)
```

### BGP hacia Internet

**Configuración:**
- **AS Number:** 65001 (AS privado)
- **Vecinos BGP:** Múltiples ISPs
- **Rutas anunciadas:** 172.16.0.0/16
- **Rutas recibidas:** Tabla de ruteo completa de Internet

**Características:**
- **Redundancia multihomed:** Múltiples proveedores ISP
- **Failover automático:** Si un ISP cae, se usa otro
- **Balanceo de carga:** Distribución de tráfico saliente

---

## Calidad de Servicio (QoS)

### Política QoS Global

**Objetivo:** Garantizar rendimiento para servicios críticos

**Clasificación de Tráfico:**

| Clase | Servicio | DSCP | Prioridad | Ancho de Banda | Latencia |
|---|---|---|---|---|---|
| **1** | Voz (VoIP) | EF (46) | 7 (Máxima) | 300 Kbps/usuario | < 150ms |
| **2** | Video (CCTV) | AF41 (34) | 5 (Alta) | 4 Mbps/cámara | < 500ms |
| **3** | Datos críticos | AF21 (18) | 3 (Normal) | Sin límite | < 2s |
| **4** | Datos normales | BE (0) | 0 (Mínima) | Best effort | Sin límite |

### Implementación en Switches

**Clasificadores:**
```
Clasificador VOICE:
  if-match vlan-id 20
  
Clasificador VIDEO:
  if-match vlan-id 30
  
Clasificador DATOS:
  if-match vlan-id 10
```

**Comportamientos:**
```
Comportamiento VOICE-POLICY:
  remark dscp ef
  car 300000 37500 (300 Kbps)
  priority 7
  
Comportamiento VIDEO-POLICY:
  remark dscp af41
  car 4000000 500000 (4 Mbps)
  priority 5
  
Comportamiento DATOS-POLICY:
  remark dscp af21
  priority 3
```

### Implementación en Routers WAN

**Control de Congestión:**
- **Algoritmo:** Weighted Fair Queuing (WFQ)
- **Colas:** 8 colas por puerto
- **Descarte:** RED (Random Early Detection)

**Limitación de Ancho de Banda:**
- Voz: 300 Kbps × 500 usuarios = 150 Mbps
- Video: 4 Mbps × 160 cámaras = 640 Mbps
- Datos: Resto del ancho de banda disponible

---

## Gestión y Monitoreo

### Plataforma de Gestión Centralizada

**Huawei iMaster NCE:**
- Orquestación de toda la red
- Descubrimiento automático de dispositivos
- Gestión de configuraciones
- Análisis de rendimiento

### Herramientas de Monitoreo

**1. SNMP (Simple Network Management Protocol)**
- Lectura de métricas: CPU, memoria, interfaces
- Escritura de configuraciones
- Traps para alertas críticas

**2. NetFlow**
- Análisis de flujos de tráfico
- Identificación de aplicaciones
- Detección de anomalías

**3. Syslog Centralizado**
- Recolección de logs de todos los dispositivos
- Almacenamiento centralizado
- Análisis de eventos

**4. Zabbix Enterprise**
- Monitoreo de disponibilidad
- Alertas automáticas
- Dashboards personalizados

### Métricas Monitoreadas

| Métrica | Umbral | Acción |
|---|---|---|
| CPU Switch | > 80% | Alerta |
| Memoria | > 85% | Alerta |
| Tráfico Enlace | > 80% | Alerta |
| Latencia OSPF | > 100ms | Crítico |
| Pérdida de Paquetes | > 1% | Crítico |
| Disponibilidad | < 99.9% | Crítico |

---

## Consideraciones de Escalabilidad

### Crecimiento Horizontal

**Escenario 1: Agregar una 4ª Sede**
- Agregar un nuevo router NE40E
- Crear nuevas subredes VLSM
- Expandir OSPF a la nueva sede
- Costo: ~$150,000 USD

**Escenario 2: Aumentar usuarios en 50%**
- Agregar switches de acceso adicionales
- Expandir subredes VLSM
- Aumentar capacidad de servidores
- Costo: ~$200,000 USD

**Escenario 3: Aumentar ancho de banda WAN**
- Actualizar enlaces de 10G a 100G
- Cambiar a routers NE40E-X8K
- Costo: ~$300,000 USD

### Espacio de Direccionamiento Disponible

**Red Actual:** 172.16.0.0/16 (65.536 direcciones)

**Utilización:**
- Sede 1: 172.16.0.0/21 (2.046 direcciones)
- Sede 2: 172.16.8.0/22 (1.022 direcciones)
- Sede 3: 172.16.12.0/23 (510 direcciones)
- Servidores: 172.16.14.0/24 (254 direcciones)
- Gestión: 172.16.15.0/24 (254 direcciones)

**Espacio Disponible:** 172.16.16.0 - 172.16.255.255 (49.152 direcciones)

**Capacidad de Expansión:**
- Hasta 15 sedes adicionales con subredes /21
- O 30 sedes con subredes /22
- O 60 sedes con subredes /23

---

## Matriz de Decisiones de Diseño

| Decisión | Alternativa | Razón de Selección |
|---|---|---|
| **Protocolo de Enrutamiento** | OSPF vs BGP | OSPF para convergencia rápida interna; BGP para Internet |
| **Topología WAN** | Malla parcial vs Malla completa | Malla parcial: menor costo, redundancia suficiente |
| **Tecnología de Enlace** | Fibra vs Cobre | Fibra: mayor ancho de banda, menor latencia, inmune a interferencias |
| **Seguridad Perimetral** | Firewall único vs Dual | Dual: redundancia, distribución de carga |
| **VLANs** | Pocas VLANs vs Muchas VLANs | Múltiples VLANs: segmentación, QoS granular |
| **Switches L3** | Todos L3 vs Mezcla L2/L3 | Todos L3: flexibilidad, enrutamiento distribuido |

---

## Métricas de Rendimiento Esperadas

### Disponibilidad

| Componente | Disponibilidad | Downtime Anual |
|---|---|---|
| Enlace WAN | 99.99% | 52 minutos |
| Router | 99.95% | 4.4 horas |
| Switch L3 | 99.95% | 4.4 horas |
| Red Global | 99.90% | 8.76 horas |

### Latencia

| Ruta | Latencia | Jitter |
|---|---|---|
| Sede 1 → Sede 2 | 5ms | < 1ms |
| Sede 2 → Sede 3 | 6ms | < 1ms |
| Sede 1 → Sede 3 | 8ms | < 1ms |
| Sede 1 → Internet | 25ms | < 5ms |

### Ancho de Banda

| Enlace | Capacidad | Utilización Pico | Disponible |
|---|---|---|---|
| Sede 1-2 | 10 Gbps | 2 Gbps (20%) | 8 Gbps |
| Sede 2-3 | 10 Gbps | 1.5 Gbps (15%) | 8.5 Gbps |
| Sede 1-3 | 5 Gbps | 0.5 Gbps (10%) | 4.5 Gbps |

---

## Conclusiones

Esta infraestructura de red banda ancha proporciona:

1. **Confiabilidad:** Redundancia multinivel con failover automático
2. **Rendimiento:** Baja latencia, alto ancho de banda, QoS garantizado
3. **Seguridad:** Múltiples capas de defensa, segmentación de tráfico
4. **Escalabilidad:** Espacio para crecer sin rediseño fundamental
5. **Gestión:** Monitoreo centralizado, alertas automáticas
6. **Cumplimiento:** Logs auditables, control de acceso granular

**Inversión Total:** $3.5M USD  
**ROI Esperado:** 3-4 años  
**Vida Útil:** 7-10 años

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha
