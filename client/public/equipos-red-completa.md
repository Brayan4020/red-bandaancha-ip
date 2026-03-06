# Lista Completa de Equipos de Red — Red Banda Ancha Bogotá

## Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Equipos de Interconexión WAN](#equipos-de-interconexión-wan)
3. [Equipos de Seguridad](#equipos-de-seguridad)
4. [Servidores y Almacenamiento](#servidores-y-almacenamiento)
5. [Equipos de Acceso Inalámbrico](#equipos-de-acceso-inalámbrico)
6. [Telefonía IP](#telefonía-ip)
7. [Videovigilancia (CCTV)](#videovigilancia-cctv)
8. [Equipos de Gestión y Monitoreo](#equipos-de-gestión-y-monitoreo)
9. [Equipos de Energía y Refrigeración](#equipos-de-energía-y-refrigeración)
10. [Cableado y Conectividad](#cableado-y-conectividad)
11. [Presupuesto Estimado](#presupuesto-estimado)

---

## Resumen Ejecutivo

Esta infraestructura de red banda ancha para 3 sedes en Bogotá (2.600 usuarios) requiere una arquitectura multinivel que incluye:

- **3 Switches L3** (Huawei CloudEngine) — Núcleo de cada sede
- **3 Routers WAN** — Interconexión entre sedes
- **2 Firewalls** — Seguridad perimetral
- **3 Servidores** — Servicios críticos
- **150+ Puntos de Acceso Inalámbrico** — Cobertura WiFi 6
- **500+ Teléfonos IP** — Telefonía unificada
- **200+ Cámaras IP** — Videovigilancia
- **Equipos auxiliares** — UPS, generadores, patch panels, etc.

---

## Equipos de Interconexión WAN

### 1. Routers Huawei para WAN

#### Router Primario Sede 1 (Teusaquillo)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei NE40E |
| **Puertos** | 4 x 10GE (SFP+) + 8 x 1GE (RJ45) |
| **Throughput** | 400 Gbps |
| **Memoria** | 16 GB RAM |
| **Almacenamiento** | 256 GB SSD |
| **Funciones** | OSPF, BGP, QoS, VPN, MPLS |
| **Redundancia** | Dual PSU, Dual Fan |
| **Cantidad** | 1 |
| **Precio Unitario** | $45,000 USD |

#### Router Secundario Sede 2 (Campus U)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei NE40E |
| **Puertos** | 4 x 10GE (SFP+) + 8 x 1GE (RJ45) |
| **Throughput** | 400 Gbps |
| **Cantidad** | 1 |
| **Precio Unitario** | $45,000 USD |

#### Router Terciario Sede 3 (AV68)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei NE20E-8 |
| **Puertos** | 2 x 10GE (SFP+) + 4 x 1GE (RJ45) |
| **Throughput** | 200 Gbps |
| **Cantidad** | 1 |
| **Precio Unitario** | $25,000 USD |

### 2. Módulos de Interfaz WAN

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Transceptor SFP+ 10G** | Fibra monomodo LC | 12 | $800 |
| **Cable Fibra Óptica** | Monomodo OS2, 50 metros | 4 | $200 |
| **Adaptadores QSFP+** | Para módulos de expansión | 6 | $150 |

---

## Equipos de Seguridad

### 1. Firewalls Perimetrales

#### Firewall Principal (Sede 1)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei USG6600 |
| **Throughput** | 100 Gbps |
| **Conexiones Concurrentes** | 10 millones |
| **Puertos** | 8 x 10GE + 16 x 1GE |
| **Funciones** | IDS/IPS, DLP, Antivirus, VPN |
| **Redundancia** | HA activo-activo |
| **Cantidad** | 1 (par HA) |
| **Precio Unitario** | $35,000 USD |

#### Firewall Secundario (Sede 2)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei USG6300 |
| **Throughput** | 50 Gbps |
| **Puertos** | 4 x 10GE + 8 x 1GE |
| **Cantidad** | 1 |
| **Precio Unitario** | $18,000 USD |

### 2. Controladores de Acceso a Red (NAC)

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Controlador NAC** | Huawei iMaster NCE | 1 | $15,000 |
| **Licencia 3 años** | Por dispositivo | 2,600 | $50 |

### 3. Sistemas de Prevención de Intrusiones (IPS)

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Appliance IPS** | Huawei NIP6600 | 2 | $12,000 |
| **Suscripción Amenazas** | 3 años | 2 | $5,000 |

---

## Servidores y Almacenamiento

### 1. Servidores de Aplicaciones

#### Servidor Principal (Sede 1)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei FusionServer Pro 2488H V5 |
| **Procesador** | 2 x Intel Xeon Platinum 8280 (56 cores) |
| **Memoria RAM** | 512 GB DDR4 |
| **Almacenamiento** | 8 x 1.2TB SAS 10K RPM (RAID 6) |
| **Tarjetas de Red** | 4 x 10GE |
| **Fuentes de Poder** | Dual 2500W |
| **Cantidad** | 1 |
| **Precio Unitario** | $28,000 USD |

#### Servidor Secundario (Sede 2)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei FusionServer 2288H V5 |
| **Procesador** | 2 x Intel Xeon Silver 4214 (24 cores) |
| **Memoria RAM** | 256 GB DDR4 |
| **Almacenamiento** | 6 x 1.2TB SAS 10K RPM (RAID 6) |
| **Cantidad** | 1 |
| **Precio Unitario** | $18,000 USD |

#### Servidor de Respaldo (Sede 3)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei FusionServer 1288H V5 |
| **Procesador** | 1 x Intel Xeon Silver 4214 (12 cores) |
| **Memoria RAM** | 128 GB DDR4 |
| **Almacenamiento** | 4 x 1.2TB SAS 10K RPM (RAID 6) |
| **Cantidad** | 1 |
| **Precio Unitario** | $12,000 USD |

### 2. Almacenamiento SAN

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Storage SAN** | Huawei OceanStor 5300 | 1 | $45,000 |
| **Discos SSD 1.6TB** | Para almacenamiento rápido | 12 | $2,000 |
| **Discos HDD 4TB** | Para almacenamiento masivo | 24 | $800 |
| **Licencia Replicación** | 3 años | 1 | $8,000 |

### 3. Servidores Especializados

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Servidor DHCP/DNS** | Huawei FusionServer 1288H | 2 | $12,000 |
| **Servidor NTP** | Sincronización de tiempo | 1 | $3,000 |
| **Servidor Logs Centralizado** | Syslog/SIEM | 1 | $8,000 |

---

## Equipos de Acceso Inalámbrico

### 1. Puntos de Acceso WiFi 6 (802.11ax)

#### Modelo Principal
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei AP8050-GN |
| **Estándar** | WiFi 6 (802.11ax) |
| **Velocidad** | 4.8 Gbps (2x2 MIMO) |
| **Cobertura** | 200 m² (interior) |
| **Puertos** | 2 x 1GE PoE |
| **Alimentación** | PoE 802.3bt |
| **Cantidad Sede 1** | 60 unidades |
| **Cantidad Sede 2** | 30 unidades |
| **Cantidad Sede 3** | 20 unidades |
| **Total** | 110 unidades |
| **Precio Unitario** | $450 USD |

### 2. Controlador WiFi

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Controlador WiFi** | Huawei AC6605 | 2 | $8,000 |
| **Licencia APs** | Por punto de acceso (3 años) | 110 | $100 |

### 3. Inyectores PoE

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Inyector PoE 90W** | Para APs remotos | 30 | $200 |
| **Switch PoE Gestionado** | 48 puertos 1GE PoE | 4 | $3,000 |

---

## Telefonía IP

### 1. Centralita IP (PBX)

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **PBX IP Huawei** | CloudCom 2000 | 1 | $25,000 |
| **Licencias Usuarios** | 500 usuarios simultáneos | 1 | $15,000 |
| **Módulo SIP Troncal** | Para operador externo | 1 | $5,000 |

### 2. Teléfonos IP

| Modelo | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Teléfono Ejecutivo** | Huawei eSpace 7930 | 50 | $400 |
| **Teléfono Estándar** | Huawei eSpace 7910 | 300 | $200 |
| **Teléfono Básico** | Huawei eSpace 7900 | 150 | $120 |
| **Total Teléfonos** | — | 500 | — |

### 3. Accesorios de Telefonía

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Audífonos Inalámbricos** | Plantronics Voyager | 100 | $150 |
| **Bases de Carga** | Para audífonos | 20 | $80 |
| **Cables Ethernet Cat6A** | Por teléfono | 500 | $5 |

---

## Videovigilancia (CCTV)

### 1. Cámaras IP

#### Cámaras Domo Interior
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei IPC622-Z12 |
| **Resolución** | 2MP (1920x1080) |
| **Zoom** | 12x óptico |
| **Iluminación** | IR 30m |
| **Codec** | H.264/H.265 |
| **Cantidad** | 80 unidades |
| **Precio Unitario** | $800 USD |

#### Cámaras Bullet Exterior
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei IPC642-Z12 |
| **Resolución** | 4MP (2560x1440) |
| **Zoom** | 12x óptico |
| **Iluminación** | IR 50m |
| **Protección** | IP67, -30°C a +60°C |
| **Cantidad** | 60 unidades |
| **Precio Unitario** | $1,200 USD |

#### Cámaras Panorámicas
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei IPC622-Z30 |
| **Resolución** | 12MP (4000x3000) |
| **Cobertura** | 360° panorámica |
| **Cantidad** | 20 unidades |
| **Precio Unitario** | $2,500 USD |

### 2. NVR (Network Video Recorder)

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **NVR Principal** | Huawei NVR3000-16 (16 canales) | 3 | $8,000 |
| **NVR Respaldo** | Huawei NVR3000-8 (8 canales) | 2 | $5,000 |

### 3. Almacenamiento CCTV

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Discos Vigilancia 4TB** | Seagate SkyHawk | 24 | $600 |
| **Discos Vigilancia 8TB** | Seagate SkyHawk | 12 | $900 |

### 4. Accesorios CCTV

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Soportes de Pared** | Aluminio ajustable | 160 | $50 |
| **Cajas de Conexión** | Protección IP67 | 160 | $30 |
| **Cables Coaxial RG6** | 100 metros | 20 | $80 |
| **Conectores BNC** | Por conector | 500 | $2 |

---

## Equipos de Gestión y Monitoreo

### 1. Plataforma de Gestión Centralizada

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Huawei iMaster NCE** | Orquestación y gestión | 1 | $20,000 |
| **Servidor de Aplicación** | Para iMaster | 1 | $15,000 |
| **Base de Datos** | PostgreSQL Enterprise | 1 | $5,000 |

### 2. Herramientas de Monitoreo

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Zabbix Enterprise** | Monitoreo SNMP/NetFlow | 1 | $8,000 |
| **Licencia 3 años** | Soporte técnico | 1 | $5,000 |
| **Grafana Premium** | Visualización dashboards | 1 | $3,000 |

### 3. Analizadores de Red

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Analizador Portátil** | Fluke Networks OneTouch | 2 | $4,000 |
| **Certificador Fibra** | EXFO FOT-930 | 1 | $6,000 |
| **Probador Ethernet** | Fluke DSX-5000 | 1 | $5,000 |

---

## Equipos de Energía y Refrigeración

### 1. Sistemas de Energía Ininterrumpida (UPS)

#### UPS Sede 1 (Teusaquillo)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei UPS5000-A |
| **Potencia** | 200 kVA |
| **Autonomía** | 15 minutos (carga completa) |
| **Redundancia** | Dual módulos |
| **Baterías** | 40 x 12V 200Ah (VRLA) |
| **Cantidad** | 1 |
| **Precio Unitario** | $35,000 USD |

#### UPS Sede 2 (Campus U)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei UPS5000-A |
| **Potencia** | 100 kVA |
| **Cantidad** | 1 |
| **Precio Unitario** | $20,000 USD |

#### UPS Sede 3 (AV68)
| Parámetro | Especificación |
|---|---|
| **Modelo** | Huawei UPS5000-A |
| **Potencia** | 50 kVA |
| **Cantidad** | 1 |
| **Precio Unitario** | $12,000 USD |

### 2. Generadores Diésel

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Generador Sede 1** | 250 kVA diesel | 1 | $45,000 |
| **Generador Sede 2** | 150 kVA diesel | 1 | $28,000 |
| **Generador Sede 3** | 100 kVA diesel | 1 | $18,000 |
| **Tanque Combustible** | 5.000 litros por sede | 3 | $8,000 |

### 3. Sistemas de Refrigeración

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Aire Acondicionado Precision** | 30 kW Sede 1 | 2 | $12,000 |
| **Aire Acondicionado Precision** | 20 kW Sede 2 | 2 | $8,000 |
| **Aire Acondicionado Precision** | 10 kW Sede 3 | 1 | $5,000 |
| **Sistema de Monitoreo Temp** | Sensores IoT | 3 | $2,000 |

---

## Cableado y Conectividad

### 1. Cableado Estructurado

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Cable Cat6A UTP** | 305 metros por bobina | 40 | $150 |
| **Cable Fibra Monomodo OS2** | 50 metros por carrete | 20 | $200 |
| **Cable Fibra Multimodo OM4** | 50 metros por carrete | 10 | $120 |

### 2. Patch Panels y Conectores

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Patch Panel Cat6A 48 puertos** | Gestionado | 8 | $400 |
| **Patch Panel Fibra 24 puertos** | LC duplex | 4 | $600 |
| **Conectores RJ45 Cat6A** | Por conector | 5,000 | $0.50 |
| **Conectores LC Fibra** | Por conector | 500 | $5 |

### 3. Racks y Gabinetes

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Rack 42U** | Profundidad 800mm | 6 | $1,500 |
| **Gabinete de Pared 18U** | Para APs y switches | 4 | $800 |
| **Bandejas Ventiladas** | Para equipos | 12 | $200 |
| **Organizadores de Cables** | Vertical y horizontal | 20 | $50 |

### 4. Accesorios de Conectividad

| Componente | Especificación | Cantidad | Precio Unitario |
|---|---|---|---|
| **Cables Patch Ethernet** | Cat6A 3 metros | 500 | $8 |
| **Cables Patch Fibra** | LC-LC 2 metros | 100 | $20 |
| **Adaptadores Media Converter** | Fibra a Ethernet | 6 | $300 |
| **Splitters PoE** | Para dispositivos no PoE | 20 | $50 |

---

## Presupuesto Estimado

### Resumen por Categoría

| Categoría | Cantidad Equipos | Costo Estimado | % del Total |
|---|---|---|---|
| **Switches L3** | 3 | $180,000 | 5.2% |
| **Routers WAN** | 3 | $115,000 | 3.3% |
| **Firewalls** | 2 | $53,000 | 1.5% |
| **Servidores** | 6 | $81,000 | 2.3% |
| **Almacenamiento** | 1 SAN + discos | $95,000 | 2.7% |
| **WiFi 6** | 110 APs | $99,500 | 2.9% |
| **Telefonía IP** | 500 teléfonos | $155,000 | 4.5% |
| **CCTV** | 160 cámaras | $285,000 | 8.2% |
| **Gestión/Monitoreo** | Plataformas | $56,000 | 1.6% |
| **Energía** | UPS + Generadores | $161,000 | 4.6% |
| **Refrigeración** | Aire acondicionado | $39,000 | 1.1% |
| **Cableado** | Estructurado | $85,000 | 2.5% |
| **Instalación/Integración** | Servicios profesionales | $800,000 | 23% |
| **Licencias Software** | 3 años | $250,000 | 7.2% |
| **Capacitación** | Personal técnico | $100,000 | 2.9% |
| **Contingencia (10%)** | — | $345,000 | 10% |
| **TOTAL** | **~3,500 equipos** | **$3,500,000 USD** | **100%** |

### Desglose por Sede

| Sede | Inversión | % del Total |
|---|---|---|
| **Sede 1 (Teusaquillo)** | $1,500,000 | 42.9% |
| **Sede 2 (Campus U)** | $1,100,000 | 31.4% |
| **Sede 3 (AV68)** | $900,000 | 25.7% |

### Cronograma de Implementación

| Fase | Duración | Actividades |
|---|---|---|
| **Fase 1** | 4 semanas | Adquisición de equipos, instalación cableado |
| **Fase 2** | 6 semanas | Instalación switches, routers, firewalls |
| **Fase 3** | 4 semanas | Configuración OSPF, QoS, seguridad |
| **Fase 4** | 3 semanas | Implementación WiFi, telefonía, CCTV |
| **Fase 5** | 2 semanas | Pruebas, capacitación, go-live |
| **Total** | **19 semanas** | — |

---

## Notas Importantes

### Consideraciones de Compra

1. **Negociación de Volumen:** Con ~3.500 equipos, solicitar descuentos de volumen a Huawei (10-20% típico).

2. **Garantía Extendida:** Incluir garantía de 5 años y soporte técnico 24/7 para equipos críticos.

3. **Repuestos Críticos:** Mantener stock de repuestos para:
   - Fuentes de poder (PSU)
   - Ventiladores
   - Módulos de interfaz
   - Discos duros

4. **Licencias de Software:** Negociar licencias perpetuas con renovación anual de soporte.

### Recomendaciones de Implementación

1. **Redundancia:** Todos los equipos críticos deben tener respaldo (N+1).

2. **Capacidad Futura:** Diseñar con 40% de capacidad libre para crecimiento.

3. **Documentación:** Crear inventario detallado con números de serie y ubicación.

4. **Monitoreo:** Implementar monitoreo desde día 1 (SNMP, syslog, NetFlow).

5. **Seguridad:** Aplicar principio de "zero trust" en todas las conexiones.

---

## Contactos de Proveedores

### Distribuidor Principal Huawei
- **Empresa:** Huawei Colombia
- **Teléfono:** +57 1 XXXXXXX
- **Email:** ventas@huawei.com.co
- **Sitio Web:** https://www.huawei.com/co

### Integradores Certificados
- **Empresa A:** Especialista en infraestructura
- **Empresa B:** Especialista en seguridad
- **Empresa C:** Especialista en telefonía

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha  
**Clasificación:** Confidencial
