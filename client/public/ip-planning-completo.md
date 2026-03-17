# IP Planning Completo — Red Banda Ancha Bogotá

## Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estrategia de Direccionamiento](#estrategia-de-direccionamiento)
3. [Espacio de Direcciones](#espacio-de-direcciones)
4. [Subredes VLSM Detalladas](#subredes-vlsm-detalladas)
5. [Plan de VLANs](#plan-de-vlans)
6. [Asignación de IPs por Dispositivo](#asignación-de-ips-por-dispositivo)
7. [Reservas y Espacios Disponibles](#reservas-y-espacios-disponibles)
8. [Enrutamiento Estático](#enrutamiento-estático)
9. [DHCP Pools](#dhcp-pools)
10. [Documentación de Cambios](#documentación-de-cambios)

---

## Resumen Ejecutivo

### Información General

| Parámetro | Valor |
|---|---|
| **Red Principal** | 172.16.0.0/16 |
| **Clase** | Privada (RFC 1918) |
| **Total de Direcciones** | 65.536 |
| **Sedes** | 3 (Teusaquillo, Campus U, AV68) |
| **Usuarios Finales** | 2.600 |
| **Dispositivos de Red** | 500+ |
| **Metodología** | VLSM (Variable Length Subnet Mask) |
| **Protocolo de Enrutamiento** | OSPF + BGP |

### Distribución de Espacio

```
172.16.0.0/16 (65.536 direcciones)
│
├─ 172.16.0.0/21 (2.048 dir) ─ Sede 1 - Teusaquillo
├─ 172.16.8.0/22 (1.024 dir) ─ Sede 2 - Campus U
├─ 172.16.12.0/23 (512 dir) ─ Sede 3 - AV68
├─ 172.16.14.0/24 (256 dir) ─ Servidores Centrales
├─ 172.16.15.0/24 (256 dir) ─ Gestión y Administración
└─ 172.16.16.0/12 (49.152 dir) ─ DISPONIBLE PARA EXPANSIÓN
```

---

## Estrategia de Direccionamiento

### Principios de Diseño

1. **Escalabilidad:** Espacio suficiente para crecer 10x sin rediseño
2. **Jerarquía:** Cada sede tiene su propio bloque contiguo
3. **Segmentación:** VLANs separadas por tipo de servicio
4. **Eficiencia:** VLSM minimiza desperdicio de direcciones
5. **Documentación:** Cada dirección tiene propósito definido

### Criterios de Asignación

- **Subredes grandes primero:** Sede 1 (1.600 usuarios) → /21
- **Subredes medianas:** Sede 2 (600 usuarios) → /22
- **Subredes pequeñas:** Sede 3 (400 usuarios) → /23
- **Reserva de espacio:** 49.152 direcciones para futuro crecimiento

---

## Espacio de Direcciones

### Mapa General de Bloques

```
172.16.0.0 ─────────────────────────────────────────────────── 172.16.255.255
│                                                               │
├─ 172.16.0.0 ─ 172.16.15.255 (4.096 dir) ─ Sedes + Gestión
│  ├─ 172.16.0.0 ─ 172.16.7.255 (2.048) ─ Sede 1
│  ├─ 172.16.8.0 ─ 172.16.11.255 (1.024) ─ Sede 2
│  ├─ 172.16.12.0 ─ 172.16.13.255 (512) ─ Sede 3
│  ├─ 172.16.14.0 ─ 172.16.14.255 (256) ─ Servidores
│  └─ 172.16.15.0 ─ 172.16.15.255 (256) ─ Gestión
│
└─ 172.16.16.0 ─ 172.16.255.255 (49.152 dir) ─ EXPANSIÓN FUTURA
   ├─ 172.16.16.0/20 (4.096) ─ Futuro Bloque 1
   ├─ 172.16.32.0/20 (4.096) ─ Futuro Bloque 2
   ├─ 172.16.48.0/20 (4.096) ─ Futuro Bloque 3
   └─ ... (más bloques disponibles)
```

### Utilización de Espacio

| Bloque | Red | Máscara | Direcciones | Utilización | % Usado |
|---|---|---|---|---|---|
| **Sede 1** | 172.16.0.0/21 | 255.255.248.0 | 2.048 | 1.600 | 78% |
| **Sede 2** | 172.16.8.0/22 | 255.255.252.0 | 1.024 | 600 | 59% |
| **Sede 3** | 172.16.12.0/23 | 255.255.254.0 | 512 | 400 | 78% |
| **Servidores** | 172.16.14.0/24 | 255.255.255.0 | 256 | 20 | 8% |
| **Gestión** | 172.16.15.0/24 | 255.255.255.0 | 256 | 10 | 4% |
| **TOTAL USADO** | — | — | **4.096** | **2.630** | **64%** |
| **DISPONIBLE** | 172.16.16.0/12 | — | **49.152** | — | **36%** |

---

## Subredes VLSM Detalladas

### Sede 1 — Teusaquillo (172.16.0.0/21)

**Información General:**
- Red: 172.16.0.0/21
- Máscara: 255.255.248.0
- Primer Host: 172.16.0.1
- Último Host: 172.16.7.254
- Broadcast: 172.16.7.255
- Hosts Disponibles: 2.046
- Usuarios Esperados: 1.600

**Desglose por VLAN:**

| VLAN | Nombre | Red | Máscara | Gateway | Rango | Broadcast | Hosts |
|---|---|---|---|---|---|---|---|
| **10** | Datos | 172.16.0.0/23 | 255.255.254.0 | 172.16.0.1 | 172.16.0.2 – 172.16.1.254 | 172.16.1.255 | 510 |
| **20** | Voz | 172.16.2.0/24 | 255.255.255.0 | 172.16.2.1 | 172.16.2.2 – 172.16.2.254 | 172.16.2.255 | 254 |
| **30** | CCTV | 172.16.3.0/24 | 255.255.255.0 | 172.16.3.1 | 172.16.3.2 – 172.16.3.254 | 172.16.3.255 | 254 |
| **40** | Servidores | 172.16.4.0/24 | 255.255.255.0 | 172.16.4.1 | 172.16.4.2 – 172.16.4.254 | 172.16.4.255 | 254 |
| **99** | Gestión | 172.16.5.0/24 | 255.255.255.0 | 172.16.5.1 | 172.16.5.2 – 172.16.5.254 | 172.16.5.255 | 254 |
| — | **Reserva** | 172.16.6.0/23 | 255.255.254.0 | — | — | — | 510 |

**Asignación de Equipos Sede 1:**

| Dispositivo | VLAN | IP | Máscara | Propósito |
|---|---|---|---|---|
| Router NE40E | 10,20,30,40,99 | 172.16.0.254 | /21 | Enrutamiento Principal |
| Switch CE 6800 | 10,20,30,40,99 | 172.16.0.253 | /21 | Distribución L3 |
| Firewall FG 3100D (Primario) | 10,20,30,40 | 172.16.0.252 | /21 | Seguridad Perimetral |
| Firewall FG 3100D (Secundario) | 10,20,30,40 | 172.16.0.251 | /21 | Redundancia HA |
| Servidor Web | 40 | 172.16.4.10 | /24 | Aplicaciones |
| Servidor BD | 40 | 172.16.4.11 | /24 | Base de Datos |
| Servidor Backup | 40 | 172.16.4.12 | /24 | Respaldo |
| Estación Admin | 99 | 172.16.5.10 | /24 | Administración |
| Printer | 10 | 172.16.0.100 | /23 | Impresora Corporativa |

---

### Sede 2 — Campus U Compensar (172.16.8.0/22)

**Información General:**
- Red: 172.16.8.0/22
- Máscara: 255.255.252.0
- Primer Host: 172.16.8.1
- Último Host: 172.16.11.254
- Broadcast: 172.16.11.255
- Hosts Disponibles: 1.022
- Usuarios Esperados: 600

**Desglose por VLAN:**

| VLAN | Nombre | Red | Máscara | Gateway | Rango | Broadcast | Hosts |
|---|---|---|---|---|---|---|---|
| **10** | Datos | 172.16.8.0/24 | 255.255.255.0 | 172.16.8.1 | 172.16.8.2 – 172.16.8.254 | 172.16.8.255 | 254 |
| **20** | Voz | 172.16.9.0/25 | 255.255.255.128 | 172.16.9.1 | 172.16.9.2 – 172.16.9.126 | 172.16.9.127 | 126 |
| **30** | CCTV | 172.16.9.128/25 | 255.255.255.128 | 172.16.9.129 | 172.16.9.130 – 172.16.9.254 | 172.16.9.255 | 126 |
| **40** | Servidores | 172.16.10.0/24 | 255.255.255.0 | 172.16.10.1 | 172.16.10.2 – 172.16.10.254 | 172.16.10.255 | 254 |
| **99** | Gestión | 172.16.11.0/25 | 255.255.255.128 | 172.16.11.1 | 172.16.11.2 – 172.16.11.126 | 172.16.11.127 | 126 |
| — | **Reserva** | 172.16.11.128/25 | 255.255.255.128 | — | — | — | 126 |

**Asignación de Equipos Sede 2:**

| Dispositivo | VLAN | IP | Máscara | Propósito |
|---|---|---|---|---|
| Router NE40E | 10,20,30,40,99 | 172.16.8.254 | /22 | Enrutamiento |
| Switch CE 6800 | 10,20,30,40,99 | 172.16.8.253 | /22 | Distribución L3 |
| Firewall FG 1500D | 10,20,30,40 | 172.16.8.252 | /22 | Seguridad |
| Servidor App | 40 | 172.16.10.10 | /24 | Aplicaciones |
| Estación Admin | 99 | 172.16.11.10 | /25 | Administración |

---

### Sede 3 — AV68 (172.16.12.0/23)

**Información General:**
- Red: 172.16.12.0/23
- Máscara: 255.255.254.0
- Primer Host: 172.16.12.1
- Último Host: 172.16.13.254
- Broadcast: 172.16.13.255
- Hosts Disponibles: 510
- Usuarios Esperados: 400

**Desglose por VLAN:**

| VLAN | Nombre | Red | Máscara | Gateway | Rango | Broadcast | Hosts |
|---|---|---|---|---|---|---|---|
| **10** | Datos | 172.16.12.0/24 | 255.255.255.0 | 172.16.12.1 | 172.16.12.2 – 172.16.12.254 | 172.16.12.255 | 254 |
| **20** | Voz | 172.16.13.0/26 | 255.255.255.192 | 172.16.13.1 | 172.16.13.2 – 172.16.13.62 | 172.16.13.63 | 62 |
| **30** | CCTV | 172.16.13.64/26 | 255.255.255.192 | 172.16.13.65 | 172.16.13.66 – 172.16.13.126 | 172.16.13.127 | 62 |
| **40** | Servidores | 172.16.13.128/26 | 255.255.255.192 | 172.16.13.129 | 172.16.13.130 – 172.16.13.190 | 172.16.13.191 | 62 |
| **99** | Gestión | 172.16.13.192/26 | 255.255.255.192 | 172.16.13.193 | 172.16.13.194 – 172.16.13.254 | 172.16.13.255 | 62 |

**Asignación de Equipos Sede 3:**

| Dispositivo | VLAN | IP | Máscara | Propósito |
|---|---|---|---|---|
| Router NE20E-8 | 10,20,30,40,99 | 172.16.12.254 | /23 | Enrutamiento |
| Switch CE 5800 | 10,20,30,40,99 | 172.16.12.253 | /23 | Distribución L3 |
| Firewall FG 600D | 10,20,30,40 | 172.16.12.252 | /23 | Seguridad |
| Estación Admin | 99 | 172.16.13.194 | /26 | Administración |

---

## Plan de VLANs

### Configuración de VLANs Globales

| VLAN | Nombre | Propósito | Rango de IPs | Máscara | Gateway | Usuarios | QoS |
|---|---|---|---|---|---|---|---|
| **10** | DATOS | Estaciones de trabajo | 172.16.0.0/23 (Sede1) | /23 | 172.16.0.1 | 1.600 | Baja |
| | | | 172.16.8.0/24 (Sede2) | /24 | 172.16.8.1 | 600 | |
| | | | 172.16.12.0/24 (Sede3) | /24 | 172.16.12.1 | 400 | |
| **20** | VOZ | Teléfonos IP | 172.16.2.0/24 (Sede1) | /24 | 172.16.2.1 | 500 | Alta |
| | | | 172.16.9.0/25 (Sede2) | /25 | 172.16.9.1 | 150 | |
| | | | 172.16.13.0/26 (Sede3) | /26 | 172.16.13.1 | 100 | |
| **30** | CCTV | Cámaras IP | 172.16.3.0/24 (Sede1) | /24 | 172.16.3.1 | 100 | Media |
| | | | 172.16.9.128/25 (Sede2) | /25 | 172.16.9.129 | 40 | |
| | | | 172.16.13.64/26 (Sede3) | /26 | 172.16.13.65 | 20 | |
| **40** | SERVIDORES | Aplicaciones | 172.16.4.0/24 (Sede1) | /24 | 172.16.4.1 | 20 | Alta |
| | | | 172.16.10.0/24 (Sede2) | /24 | 172.16.10.1 | 10 | |
| | | | 172.16.13.128/26 (Sede3) | /26 | 172.16.13.129 | 5 | |
| **99** | GESTIÓN | Admin de red | 172.16.5.0/24 (Sede1) | /24 | 172.16.5.1 | 10 | Alta |
| | | | 172.16.11.0/25 (Sede2) | /25 | 172.16.11.1 | 5 | |
| | | | 172.16.13.192/26 (Sede3) | /26 | 172.16.13.193 | 3 | |

### Características de VLANs

**VLAN 10 (DATOS):**
- Usuarios finales, PCs, laptops
- DHCP: Automático
- Acceso: Restringido a servidores de aplicaciones
- Seguridad: Firewall L3

**VLAN 20 (VOZ):**
- Teléfonos IP (500 dispositivos)
- DHCP: Automático con opción 150 (PBX)
- QoS: Máxima prioridad (DSCP EF)
- Latencia: < 150ms
- Ancho de banda: 300 Kbps por teléfono

**VLAN 30 (CCTV):**
- Cámaras IP (160 dispositivos)
- DHCP: Automático
- QoS: Alta prioridad (DSCP AF41)
- Ancho de banda: 2-4 Mbps por cámara
- Latencia: < 500ms

**VLAN 40 (SERVIDORES):**
- Servidores de aplicaciones
- Almacenamiento SAN
- Bases de datos
- IPs estáticas
- QoS: Media-alta prioridad

**VLAN 99 (GESTIÓN):**
- Acceso administrativo
- SNMP, Syslog
- Acceso restringido por ACL
- IPs estáticas

---

## Asignación de IPs por Dispositivo

### Dispositivos de Infraestructura

| Dispositivo | Sede | VLAN | IP | Máscara | Descripción |
|---|---|---|---|---|---|
| **Routers WAN** | | | | | |
| NE40E | Sede 1 | 10,20,30,40,99 | 172.16.0.254 | /21 | Router Principal |
| NE40E | Sede 2 | 10,20,30,40,99 | 172.16.8.254 | /22 | Router Secundario |
| NE20E-8 | Sede 3 | 10,20,30,40,99 | 172.16.12.254 | /23 | Router Terciario |
| **Switches L3** | | | | | |
| CE 6800 | Sede 1 | 10,20,30,40,99 | 172.16.0.253 | /21 | Switch Distribución |
| CE 6800 | Sede 2 | 10,20,30,40,99 | 172.16.8.253 | /22 | Switch Distribución |
| CE 5800 | Sede 3 | 10,20,30,40,99 | 172.16.12.253 | /23 | Switch Distribución |
| **Firewalls** | | | | | |
| FG 3100D (Primario) | Sede 1 | 10,20,30,40 | 172.16.0.252 | /21 | Firewall Principal |
| FG 3100D (Secundario) | Sede 1 | 10,20,30,40 | 172.16.0.251 | /21 | Firewall HA |
| FG 1500D | Sede 2 | 10,20,30,40 | 172.16.8.252 | /22 | Firewall Secundario |
| FG 600D | Sede 3 | 10,20,30,40 | 172.16.12.252 | /23 | Firewall Terciario |
| **Servidores** | | | | | |
| Servidor Web | Sede 1 | 40 | 172.16.4.10 | /24 | Aplicaciones Web |
| Servidor BD | Sede 1 | 40 | 172.16.4.11 | /24 | Base de Datos |
| Servidor Backup | Sede 1 | 40 | 172.16.4.12 | /24 | Respaldo |
| Servidor App | Sede 2 | 40 | 172.16.10.10 | /24 | Aplicaciones |
| **Estaciones Admin** | | | | | |
| Admin PC Sede 1 | Sede 1 | 99 | 172.16.5.10 | /24 | Administración |
| Admin PC Sede 2 | Sede 2 | 99 | 172.16.11.10 | /25 | Administración |
| Admin PC Sede 3 | Sede 3 | 99 | 172.16.13.194 | /26 | Administración |

### Dispositivos de Usuario Final

**VLAN 10 (DATOS):**
- PCs: 172.16.0.2 – 172.16.1.254 (Sede 1)
- Laptops: 172.16.8.2 – 172.16.8.254 (Sede 2)
- Tablets: 172.16.12.2 – 172.16.12.254 (Sede 3)
- Asignación: DHCP automático

**VLAN 20 (VOZ):**
- Teléfonos IP: 172.16.2.2 – 172.16.2.254 (Sede 1)
- Teléfonos IP: 172.16.9.2 – 172.16.9.126 (Sede 2)
- Teléfonos IP: 172.16.13.2 – 172.16.13.62 (Sede 3)
- Asignación: DHCP automático

**VLAN 30 (CCTV):**
- Cámaras: 172.16.3.2 – 172.16.3.254 (Sede 1)
- Cámaras: 172.16.9.130 – 172.16.9.254 (Sede 2)
- Cámaras: 172.16.13.66 – 172.16.13.126 (Sede 3)
- Asignación: DHCP automático

---

## Reservas y Espacios Disponibles

### Espacio Reservado en Cada Sede

| Sede | Bloque Reserva | Máscara | Direcciones | Propósito |
|---|---|---|---|---|
| **Sede 1** | 172.16.6.0/23 | 255.255.254.0 | 510 | Expansión futura |
| **Sede 2** | 172.16.11.128/25 | 255.255.255.128 | 126 | Expansión futura |
| **Sede 3** | (Ninguno) | — | — | Subred completa |

### Espacio Global Disponible

| Bloque | Red | Máscara | Direcciones | Propósito |
|---|---|---|---|---|
| **Bloque 1** | 172.16.16.0/20 | 255.255.240.0 | 4.096 | Futuro Bloque 1 |
| **Bloque 2** | 172.16.32.0/20 | 255.255.240.0 | 4.096 | Futuro Bloque 2 |
| **Bloque 3** | 172.16.48.0/20 | 255.255.240.0 | 4.096 | Futuro Bloque 3 |
| **Bloque 4** | 172.16.64.0/18 | 255.255.192.0 | 16.384 | Futuro Bloque 4 |
| **Bloque 5** | 172.16.128.0/17 | 255.255.128.0 | 32.768 | Futuro Bloque 5 |

### Capacidad de Expansión

**Escenarios de Crecimiento:**

1. **Agregar 4ª Sede (500 usuarios):**
   - Red: 172.16.16.0/22 (1.024 direcciones)
   - Espacio disponible: Sí
   - Tiempo de implementación: 2 semanas

2. **Duplicar usuarios en Sede 1 (3.200 usuarios):**
   - Red actual: 172.16.0.0/21 (2.048 dir) → Insuficiente
   - Solución: Cambiar a 172.16.0.0/20 (4.096 dir)
   - Impacto: Cambio de máscara, actualizar rutas
   - Tiempo: 4 semanas

3. **Agregar 5 sedes nuevas:**
   - Espacio requerido: 5 × /22 = 20.480 direcciones
   - Espacio disponible: 49.152 direcciones
   - Viabilidad: Sí, con espacio de sobra

---

## Enrutamiento Estático

### Rutas Estáticas Principales

| Destino | Máscara | Gateway | Métrica | Interfaz | Descripción |
|---|---|---|---|---|---|
| 172.16.0.0 | 255.255.248.0 | 172.16.0.254 | 10 | port2 | Sede 1 Local |
| 172.16.8.0 | 255.255.252.0 | 172.16.0.254 | 20 | port5 | Sede 2 vía OSPF |
| 172.16.12.0 | 255.255.254.0 | 172.16.0.254 | 30 | port5 | Sede 3 vía OSPF |
| 172.16.14.0 | 255.255.255.0 | 172.16.0.254 | 10 | port2 | Servidores Centrales |
| 172.16.15.0 | 255.255.255.0 | 172.16.0.254 | 10 | port2 | Gestión |
| 0.0.0.0 | 0.0.0.0 | 200.1.1.1 | 100 | port1 | Ruta por defecto ISP |

### Configuración OSPF

**Instancia OSPF:**
- AS: 65001
- Área: 0.0.0.0 (Backbone)
- Router IDs:
  - Sede 1: 172.16.0.254
  - Sede 2: 172.16.8.254
  - Sede 3: 172.16.12.254

**Redes Anunciadas:**
- 172.16.0.0/21 (Sede 1)
- 172.16.8.0/22 (Sede 2)
- 172.16.12.0/23 (Sede 3)
- 172.16.14.0/24 (Servidores)
- 172.16.15.0/24 (Gestión)

---

## DHCP Pools

### Pool DHCP Sede 1

**VLAN 10 (DATOS):**
```
Pool: DHCP-DATOS-SEDE1
Rango: 172.16.0.10 – 172.16.1.240
Máscara: 255.255.254.0
Gateway: 172.16.0.1
DNS: 8.8.8.8, 8.8.4.4
Lease: 24 horas
Reservas: 172.16.0.2 – 172.16.0.9 (Dispositivos críticos)
```

**VLAN 20 (VOZ):**
```
Pool: DHCP-VOZ-SEDE1
Rango: 172.16.2.10 – 172.16.2.240
Máscara: 255.255.255.0
Gateway: 172.16.2.1
DHCP Option 150: 172.16.4.10 (PBX)
Lease: 8 horas
```

**VLAN 30 (CCTV):**
```
Pool: DHCP-CCTV-SEDE1
Rango: 172.16.3.10 – 172.16.3.240
Máscara: 255.255.255.0
Gateway: 172.16.3.1
DNS: 172.16.4.10 (NVR)
Lease: 7 días
```

### Pool DHCP Sede 2

**VLAN 10 (DATOS):**
```
Pool: DHCP-DATOS-SEDE2
Rango: 172.16.8.10 – 172.16.8.240
Máscara: 255.255.255.0
Gateway: 172.16.8.1
DNS: 8.8.8.8, 8.8.4.4
Lease: 24 horas
```

**VLAN 20 (VOZ):**
```
Pool: DHCP-VOZ-SEDE2
Rango: 172.16.9.10 – 172.16.9.120
Máscara: 255.255.255.128
Gateway: 172.16.9.1
DHCP Option 150: 172.16.4.10 (PBX Sede 1)
Lease: 8 horas
```

### Pool DHCP Sede 3

**VLAN 10 (DATOS):**
```
Pool: DHCP-DATOS-SEDE3
Rango: 172.16.12.10 – 172.16.12.240
Máscara: 255.255.255.0
Gateway: 172.16.12.1
DNS: 8.8.8.8, 8.8.4.4
Lease: 24 horas
```

---

## Documentación de Cambios

### Registro de Cambios

| Fecha | Cambio | Responsable | Estado |
|---|---|---|---|
| 2026-03-16 | Creación del IP Planning | Equipo Infraestructura | Activo |
| — | Implementación Sede 1 | — | Pendiente |
| — | Implementación Sede 2 | — | Pendiente |
| — | Implementación Sede 3 | — | Pendiente |

### Procedimiento de Cambios

1. **Solicitud de Cambio:**
   - Documentar necesidad
   - Justificar cambio
   - Obtener aprobación

2. **Planificación:**
   - Identificar impacto
   - Crear plan de implementación
   - Comunicar a usuarios

3. **Implementación:**
   - Ejecutar cambio
   - Verificar conectividad
   - Documentar resultado

4. **Validación:**
   - Pruebas de conectividad
   - Verificación de QoS
   - Auditoría de seguridad

5. **Cierre:**
   - Actualizar documentación
   - Comunicar conclusión
   - Archivar registro

---

## Checklist de Implementación

- [ ] Validar disponibilidad de direcciones IP
- [ ] Configurar routers con rutas estáticas
- [ ] Configurar switches con VLANs
- [ ] Configurar DHCP pools
- [ ] Configurar firewalls con políticas
- [ ] Pruebas de conectividad entre sedes
- [ ] Pruebas de DHCP
- [ ] Pruebas de QoS
- [ ] Documentar configuraciones
- [ ] Capacitar al equipo de operaciones
- [ ] Realizar respaldo de configuraciones

---

## Mejores Prácticas

1. **Documentación:**
   - Mantener actualizado el IP Planning
   - Documentar cada cambio
   - Crear diagramas de red

2. **Seguridad:**
   - Usar IPs estáticas para dispositivos críticos
   - Implementar ACLs por VLAN
   - Monitorear uso de direcciones

3. **Mantenimiento:**
   - Revisar utilización mensualmente
   - Auditar asignaciones trimestralmente
   - Actualizar documentación anualmente

4. **Escalabilidad:**
   - Mantener espacio de reserva
   - Planificar crecimiento a 5 años
   - Revisar capacidad regularmente

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha  
**Próxima Revisión:** Septiembre 2026
