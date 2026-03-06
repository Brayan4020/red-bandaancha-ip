# Configuraciones de Switches Huawei — Red Banda Ancha

## Índice
1. [Introducción](#introducción)
2. [Sede 1: Teusaquillo (CloudEngine 6800)](#sede-1-teusaquillo)
3. [Sede 2: Campus U Compensar (CloudEngine 6800)](#sede-2-campus-u-compensar)
4. [Sede 3: AV68 (CloudEngine 5800)](#sede-3-av68)
5. [Configuración de OSPF](#configuración-de-ospf)
6. [Configuración de QoS](#configuración-de-qos)
7. [Configuración de Redundancia](#configuración-de-redundancia)
8. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## Introducción

Este documento proporciona configuraciones completas para switches Huawei en la red de banda ancha de Bogotá. Se utilizan modelos CloudEngine 6800 (Sede 1 y 2) y CloudEngine 5800 (Sede 3) con soporte para VLAN, OSPF, QoS y redundancia.

**Especificaciones de Red:**
- Red Base: `172.16.0.0/16` (RFC 1918 - Clase B Privada)
- Tecnología: VLSM (Variable Length Subnet Mask)
- Servicios: Datos (VLAN 10), Voz (VLAN 20), CCTV (VLAN 30), Servidores (VLAN 40), Gestión (VLAN 99)
- Enrutamiento: OSPF (Open Shortest Path First)
- Redundancia: Topología de malla parcial con enlaces primarios y respaldo

---

## Sede 1: Teusaquillo

### Información General
- **Ubicación:** Teusaquillo, Bogotá
- **Modelo:** Huawei CloudEngine 6800
- **Hosts Requeridos:** 1.600
- **Red:** `172.16.0.0/21` (Máscara: `255.255.248.0`)
- **Gateway:** `172.16.0.1`
- **Puertos:** 48 puertos Gigabit Ethernet + 4 puertos SFP+ 10G

### Configuración Básica

```
# ============================================================================
# CONFIGURACIÓN BÁSICA - SEDE 1 TEUSAQUILLO
# Huawei CloudEngine 6800
# ============================================================================

system-view

# Nombre del dispositivo
sysName SW-SEDE1-TEUS

# Descripción
description "Switch L3 Sede 1 - Teusaquillo"

# Contraseña de administrador (encriptada)
super password level 15 cipher $c$3$XXXXXXXXXXXXXXXXXXXXXX

# Habilitar SSH
snetconf server enable
ssh server enable
ssh server port 22

# NTP para sincronización de tiempo
ntp-service enable
ntp-service unicast-server 200.3.97.17 source LoopBack0

# SNMP para monitoreo
snmp-agent community read public
snmp-agent community write private
snmp-agent sys-info contact "NOC Banda Ancha"
snmp-agent sys-info location "Teusaquillo, Bogotá"

# Logging
info-center enable
info-center loghost 172.16.0.50 facility local7
info-center loghost 172.16.0.51 facility local7

# Guardar configuración
save
```

### Configuración de Interfaces

```
# ============================================================================
# INTERFACES DE ACCESO - SEDE 1
# ============================================================================

system-view

# Interfaz de gestión (VLAN 99)
interface Vlanif99
 description "VLAN Gestion - Sede 1"
 ip address 172.16.7.1 255.255.248.0
 no shutdown

# Interfaz de datos (VLAN 10)
interface Vlanif10
 description "VLAN Datos - Sede 1"
 ip address 172.16.0.1 255.255.248.0
 no shutdown

# Interfaz de voz (VLAN 20)
interface Vlanif20
 description "VLAN Voz - Sede 1"
 ip address 172.16.1.1 255.255.248.0
 no shutdown

# Interfaz de CCTV (VLAN 30)
interface Vlanif30
 description "VLAN CCTV - Sede 1"
 ip address 172.16.2.1 255.255.248.0
 no shutdown

# Interfaz de servidores (VLAN 40)
interface Vlanif40
 description "VLAN Servidores - Sede 1"
 ip address 172.16.3.1 255.255.248.0
 no shutdown

# LoopBack para OSPF
interface LoopBack0
 description "LoopBack - Router ID"
 ip address 172.16.0.254 255.255.255.255
 no shutdown

# Puertos de acceso para datos (GigabitEthernet 1/0/1 a 1/0/20)
interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20
 description "Access - Datos"
 port link-type access
 port default vlan 10
 stp edged-port enable
 no shutdown

# Puertos de acceso para voz (GigabitEthernet 1/0/21 a 1/0/30)
interface GigabitEthernet1/0/21 to GigabitEthernet1/0/30
 description "Access - Voz"
 port link-type access
 port default vlan 20
 stp edged-port enable
 no shutdown

# Puertos de acceso para CCTV (GigabitEthernet 1/0/31 a 1/0/40)
interface GigabitEthernet1/0/31 to GigabitEthernet1/0/40
 description "Access - CCTV"
 port link-type access
 port default vlan 30
 stp edged-port enable
 no shutdown

# Puertos de acceso para servidores (GigabitEthernet 1/0/41 a 1/0/48)
interface GigabitEthernet1/0/41 to GigabitEthernet1/0/48
 description "Access - Servidores"
 port link-type access
 port default vlan 40
 stp edged-port enable
 no shutdown

# Puertos troncales para WAN (SFP+ 10G)
interface Eth-Trunk1
 description "Trunk - Sede 1 a Sede 2"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

interface Eth-Trunk2
 description "Trunk - Sede 1 a Sede 3 (Respaldo)"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

# Miembros del Eth-Trunk1
interface XGigabitEthernet1/0/1
 description "Miembro Trunk 1 - Primario"
 eth-trunk 1
 no shutdown

interface XGigabitEthernet1/0/2
 description "Miembro Trunk 1 - Secundario"
 eth-trunk 1
 no shutdown

# Miembros del Eth-Trunk2
interface XGigabitEthernet1/0/3
 description "Miembro Trunk 2 - Respaldo"
 eth-trunk 2
 no shutdown

save
```

### Configuración de VLANs

```
# ============================================================================
# CONFIGURACIÓN DE VLANs - SEDE 1
# ============================================================================

system-view

# Crear VLANs
vlan batch 10 20 30 40 99

# VLAN 10 - Datos
vlan 10
 name VLAN-DATOS-SEDE1
 description "Datos - Estaciones de trabajo"

# VLAN 20 - Voz
vlan 20
 name VLAN-VOZ-SEDE1
 description "Voz IP - Telefonos"

# VLAN 30 - CCTV
vlan 30
 name VLAN-CCTV-SEDE1
 description "CCTV - Camaras de seguridad"

# VLAN 40 - Servidores
vlan 40
 name VLAN-SERVIDORES-SEDE1
 description "Servidores - Virtualizacion"

# VLAN 99 - Gestión
vlan 99
 name VLAN-GESTION-SEDE1
 description "Gestion - Administracion"

save
```

### Configuración de DHCP

```
# ============================================================================
# CONFIGURACIÓN DE DHCP - SEDE 1
# ============================================================================

system-view

# Pool DHCP para Datos (VLAN 10)
dhcp enable
ip pool DATOS-SEDE1
 gateway-list 172.16.0.1
 network 172.16.0.0 mask 255.255.248.0
 excluded-ip-address 172.16.0.1 172.16.0.100
 lease day 7

# Pool DHCP para Voz (VLAN 20)
ip pool VOZ-SEDE1
 gateway-list 172.16.1.1
 network 172.16.1.0 mask 255.255.248.0
 excluded-ip-address 172.16.1.1 172.16.1.50
 lease day 30

# Pool DHCP para CCTV (VLAN 30)
ip pool CCTV-SEDE1
 gateway-list 172.16.2.1
 network 172.16.2.0 mask 255.255.248.0
 excluded-ip-address 172.16.2.1 172.16.2.50
 lease day 30

# Asociar pools a interfaces VLAN
interface Vlanif10
 dhcp select global

interface Vlanif20
 dhcp select global

interface Vlanif30
 dhcp select global

save
```

---

## Sede 2: Campus U Compensar

### Información General
- **Ubicación:** Campus U Compensar, Bogotá
- **Modelo:** Huawei CloudEngine 6800
- **Hosts Requeridos:** 600
- **Red:** `172.16.8.0/22` (Máscara: `255.255.252.0`)
- **Gateway:** `172.16.8.1`
- **Puertos:** 48 puertos Gigabit Ethernet + 4 puertos SFP+ 10G

### Configuración Básica

```
# ============================================================================
# CONFIGURACIÓN BÁSICA - SEDE 2 CAMPUS U
# Huawei CloudEngine 6800
# ============================================================================

system-view

sysName SW-SEDE2-CAMPUS
description "Switch L3 Sede 2 - Campus U Compensar"
super password level 15 cipher $c$3$XXXXXXXXXXXXXXXXXXXXXX

snetconf server enable
ssh server enable
ssh server port 22

ntp-service enable
ntp-service unicast-server 200.3.97.17 source LoopBack0

snmp-agent community read public
snmp-agent community write private
snmp-agent sys-info contact "NOC Banda Ancha"
snmp-agent sys-info location "Campus U Compensar, Bogotá"

info-center enable
info-center loghost 172.16.8.50 facility local7
info-center loghost 172.16.8.51 facility local7

save
```

### Configuración de Interfaces

```
# ============================================================================
# INTERFACES DE ACCESO - SEDE 2
# ============================================================================

system-view

# Interfaz de gestión (VLAN 99)
interface Vlanif99
 description "VLAN Gestion - Sede 2"
 ip address 172.16.11.1 255.255.252.0
 no shutdown

# Interfaz de datos (VLAN 10)
interface Vlanif10
 description "VLAN Datos - Sede 2"
 ip address 172.16.8.1 255.255.252.0
 no shutdown

# Interfaz de voz (VLAN 20)
interface Vlanif20
 description "VLAN Voz - Sede 2"
 ip address 172.16.9.1 255.255.252.0
 no shutdown

# Interfaz de CCTV (VLAN 30)
interface Vlanif30
 description "VLAN CCTV - Sede 2"
 ip address 172.16.10.1 255.255.252.0
 no shutdown

# Interfaz de servidores (VLAN 40)
interface Vlanif40
 description "VLAN Servidores - Sede 2"
 ip address 172.16.11.1 255.255.252.0
 no shutdown

# LoopBack para OSPF
interface LoopBack0
 description "LoopBack - Router ID"
 ip address 172.16.8.254 255.255.255.255
 no shutdown

# Puertos de acceso
interface GigabitEthernet1/0/1 to GigabitEthernet1/0/15
 description "Access - Datos"
 port link-type access
 port default vlan 10
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/16 to GigabitEthernet1/0/25
 description "Access - Voz"
 port link-type access
 port default vlan 20
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/26 to GigabitEthernet1/0/35
 description "Access - CCTV"
 port link-type access
 port default vlan 30
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/36 to GigabitEthernet1/0/48
 description "Access - Servidores"
 port link-type access
 port default vlan 40
 stp edged-port enable
 no shutdown

# Puertos troncales para WAN
interface Eth-Trunk1
 description "Trunk - Sede 2 a Sede 1"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

interface Eth-Trunk2
 description "Trunk - Sede 2 a Sede 3"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

# Miembros del Eth-Trunk1
interface XGigabitEthernet1/0/1
 description "Miembro Trunk 1 - Primario"
 eth-trunk 1
 no shutdown

interface XGigabitEthernet1/0/2
 description "Miembro Trunk 1 - Secundario"
 eth-trunk 1
 no shutdown

# Miembros del Eth-Trunk2
interface XGigabitEthernet1/0/3
 description "Miembro Trunk 2 - Primario"
 eth-trunk 2
 no shutdown

interface XGigabitEthernet1/0/4
 description "Miembro Trunk 2 - Secundario"
 eth-trunk 2
 no shutdown

save
```

### Configuración de VLANs

```
# ============================================================================
# CONFIGURACIÓN DE VLANs - SEDE 2
# ============================================================================

system-view

vlan batch 10 20 30 40 99

vlan 10
 name VLAN-DATOS-SEDE2
 description "Datos - Estaciones de trabajo"

vlan 20
 name VLAN-VOZ-SEDE2
 description "Voz IP - Telefonos"

vlan 30
 name VLAN-CCTV-SEDE2
 description "CCTV - Camaras de seguridad"

vlan 40
 name VLAN-SERVIDORES-SEDE2
 description "Servidores - Virtualizacion"

vlan 99
 name VLAN-GESTION-SEDE2
 description "Gestion - Administracion"

save
```

---

## Sede 3: AV68

### Información General
- **Ubicación:** AV68, Bogotá
- **Modelo:** Huawei CloudEngine 5800
- **Hosts Requeridos:** 400
- **Red:** `172.16.12.0/23` (Máscara: `255.255.254.0`)
- **Gateway:** `172.16.12.1`
- **Puertos:** 24 puertos Gigabit Ethernet + 2 puertos SFP+ 10G

### Configuración Básica

```
# ============================================================================
# CONFIGURACIÓN BÁSICA - SEDE 3 AV68
# Huawei CloudEngine 5800
# ============================================================================

system-view

sysName SW-SEDE3-AV68
description "Switch L3 Sede 3 - AV68"
super password level 15 cipher $c$3$XXXXXXXXXXXXXXXXXXXXXX

snetconf server enable
ssh server enable
ssh server port 22

ntp-service enable
ntp-service unicast-server 200.3.97.17 source LoopBack0

snmp-agent community read public
snmp-agent community write private
snmp-agent sys-info contact "NOC Banda Ancha"
snmp-agent sys-info location "AV68, Bogotá"

info-center enable
info-center loghost 172.16.12.50 facility local7

save
```

### Configuración de Interfaces

```
# ============================================================================
# INTERFACES DE ACCESO - SEDE 3
# ============================================================================

system-view

interface Vlanif99
 description "VLAN Gestion - Sede 3"
 ip address 172.16.13.1 255.255.254.0
 no shutdown

interface Vlanif10
 description "VLAN Datos - Sede 3"
 ip address 172.16.12.1 255.255.254.0
 no shutdown

interface Vlanif20
 description "VLAN Voz - Sede 3"
 ip address 172.16.12.65 255.255.254.0
 no shutdown

interface Vlanif30
 description "VLAN CCTV - Sede 3"
 ip address 172.16.12.129 255.255.254.0
 no shutdown

interface Vlanif40
 description "VLAN Servidores - Sede 3"
 ip address 172.16.12.193 255.255.254.0
 no shutdown

interface LoopBack0
 description "LoopBack - Router ID"
 ip address 172.16.12.254 255.255.255.255
 no shutdown

interface GigabitEthernet1/0/1 to GigabitEthernet1/0/8
 description "Access - Datos"
 port link-type access
 port default vlan 10
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/9 to GigabitEthernet1/0/14
 description "Access - Voz"
 port link-type access
 port default vlan 20
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/15 to GigabitEthernet1/0/20
 description "Access - CCTV"
 port link-type access
 port default vlan 30
 stp edged-port enable
 no shutdown

interface GigabitEthernet1/0/21 to GigabitEthernet1/0/24
 description "Access - Servidores"
 port link-type access
 port default vlan 40
 stp edged-port enable
 no shutdown

interface Eth-Trunk1
 description "Trunk - Sede 3 a Sede 2"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

interface Eth-Trunk2
 description "Trunk - Sede 3 a Sede 1 (Respaldo)"
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 no shutdown

interface XGigabitEthernet1/0/1
 description "Miembro Trunk 1"
 eth-trunk 1
 no shutdown

interface XGigabitEthernet1/0/2
 description "Miembro Trunk 2"
 eth-trunk 2
 no shutdown

save
```

---

## Configuración de OSPF

### OSPF en Sede 1

```
# ============================================================================
# OSPF - SEDE 1 TEUSAQUILLO
# ============================================================================

system-view

# Habilitar OSPF
ospf 1 router-id 172.16.0.254

# Área 0 (Backbone)
area 0.0.0.0

# Redes locales
network 172.16.0.0 0.0.7.255 area 0.0.0.0
network 172.16.1.0 0.0.0.255 area 0.0.0.0
network 172.16.2.0 0.0.0.255 area 0.0.0.0
network 172.16.3.0 0.0.0.255 area 0.0.0.0
network 172.16.7.0 0.0.0.255 area 0.0.0.0

# Redes WAN
network 10.0.1.0 0.0.0.3 area 0.0.0.0
network 10.0.2.0 0.0.0.3 area 0.0.0.0

# Configuración global OSPF
ospf 1
 bfd all-interfaces enable
 auto-cost reference-bandwidth 100000
 default-route-advertise always

# Habilitar BFD en interfaces críticas
interface Eth-Trunk1
 ospf bfd enable

interface Eth-Trunk2
 ospf bfd enable

save
```

### OSPF en Sede 2

```
# ============================================================================
# OSPF - SEDE 2 CAMPUS U
# ============================================================================

system-view

ospf 1 router-id 172.16.8.254

area 0.0.0.0

network 172.16.8.0 0.0.3.255 area 0.0.0.0
network 172.16.9.0 0.0.0.255 area 0.0.0.0
network 172.16.10.0 0.0.0.255 area 0.0.0.0
network 172.16.11.0 0.0.0.255 area 0.0.0.0

network 10.0.1.0 0.0.0.3 area 0.0.0.0
network 10.0.3.0 0.0.0.3 area 0.0.0.0

ospf 1
 bfd all-interfaces enable
 auto-cost reference-bandwidth 100000
 default-route-advertise always

interface Eth-Trunk1
 ospf bfd enable

interface Eth-Trunk2
 ospf bfd enable

save
```

### OSPF en Sede 3

```
# ============================================================================
# OSPF - SEDE 3 AV68
# ============================================================================

system-view

ospf 1 router-id 172.16.12.254

area 0.0.0.0

network 172.16.12.0 0.0.1.255 area 0.0.0.0
network 172.16.13.0 0.0.0.255 area 0.0.0.0

network 10.0.3.0 0.0.0.3 area 0.0.0.0
network 10.0.2.0 0.0.0.3 area 0.0.0.0

ospf 1
 bfd all-interfaces enable
 auto-cost reference-bandwidth 100000

interface Eth-Trunk1
 ospf bfd enable

interface Eth-Trunk2
 ospf bfd enable

save
```

---

## Configuración de QoS

### QoS en Sede 1

```
# ============================================================================
# QoS - SEDE 1
# Priorización de Voz y CCTV
# ============================================================================

system-view

# Crear clase de tráfico para Voz (VLAN 20)
traffic classifier VOICE
 if-match vlan-id 20

traffic classifier VIDEO
 if-match vlan-id 30

traffic classifier DATA
 if-match vlan-id 10

# Crear políticas de tráfico
traffic behavior VOICE-POLICY
 remark dscp ef
 car committed-information-rate 300000 committed-burst-size 37500

traffic behavior VIDEO-POLICY
 remark dscp af41
 car committed-information-rate 200000 committed-burst-size 25000

traffic behavior DATA-POLICY
 remark dscp be
 car committed-information-rate 500000 committed-burst-size 62500

# Crear política QoS
qos policy QOS-POLICY
 classifier VOICE behavior VOICE-POLICY priority 7
 classifier VIDEO behavior VIDEO-POLICY priority 5
 classifier DATA behavior DATA-POLICY priority 3

# Aplicar política a interfaces de entrada
interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20
 qos apply policy QOS-POLICY inbound

interface GigabitEthernet1/0/21 to GigabitEthernet1/0/30
 qos apply policy QOS-POLICY inbound

interface GigabitEthernet1/0/31 to GigabitEthernet1/0/40
 qos apply policy QOS-POLICY inbound

# Aplicar política a interfaces troncales
interface Eth-Trunk1
 qos apply policy QOS-POLICY outbound

interface Eth-Trunk2
 qos apply policy QOS-POLICY outbound

save
```

---

## Configuración de Redundancia

### Spanning Tree Protocol (RSTP)

```
# ============================================================================
# RSTP - REDUNDANCIA
# ============================================================================

system-view

# Habilitar RSTP
stp enable
stp mode rstp

# Configurar prioridad de puente (Sede 1 como primaria)
stp priority 8192

# Configurar BPDU Guard en puertos de acceso
interface GigabitEthernet1/0/1 to GigabitEthernet1/0/48
 stp bpdu-guard enable
 stp edged-port enable

# Configurar puertos troncales como puertos rápidos
interface Eth-Trunk1
 stp pathcost method long
 stp pathcost 100

interface Eth-Trunk2
 stp pathcost method long
 stp pathcost 200

save
```

---

## Monitoreo y Mantenimiento

### Comandos de Verificación

```
# Verificar estado de OSPF
display ospf peer
display ospf interface
display ospf routing-table

# Verificar VLANs
display vlan all
display vlan summary

# Verificar interfaces
display interface brief
display interface Eth-Trunk1
display interface Eth-Trunk2

# Verificar QoS
display qos policy
display traffic classifier
display traffic behavior

# Verificar RSTP
display stp brief
display stp interface

# Verificar DHCP
display dhcp server pool
display dhcp server statistics

# Verificar conectividad
ping 172.16.8.1
ping 172.16.12.1
tracert 172.16.8.1
```

### Mantenimiento Preventivo

```
# Backup de configuración
save

# Verificar logs
display logfile

# Limpiar estadísticas
reset counters interface all

# Verificar salud del sistema
display system-information
display cpu-usage
display memory-usage
```

### Alertas Críticas (SNMP Traps)

```
system-view

# Configurar traps para eventos críticos
snmp-agent trap enable
snmp-agent trap all

# Eventos específicos
info-center source ospf channel 4 log level warning
info-center source stp channel 4 log level warning
info-center source vlan channel 4 log level warning

save
```

---

## Notas Importantes

1. **Seguridad:** Cambiar todas las contraseñas por defecto y usar contraseñas fuertes (mínimo 12 caracteres).

2. **Backups:** Realizar backups semanales de las configuraciones en servidor centralizado.

3. **Monitoreo:** Implementar monitoreo SNMP con herramientas como Zabbix o Nagios.

4. **Actualizaciones:** Mantener firmware actualizado. Verificar compatibilidad antes de actualizar.

5. **Documentación:** Mantener registro de cambios y justificación de modificaciones.

6. **Redundancia:** Validar failover de OSPF y RSTP regularmente (simulando fallos).

7. **QoS:** Ajustar valores de CIR/CBS según utilización real de la red.

---

## Soporte y Contacto

- **Fabricante:** Huawei Technologies
- **Documentación:** https://www.huawei.com/en/support
- **Centro de Soporte:** +57 1 XXXXXXX
- **Email Técnico:** soporte@huawei.com.co

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha
