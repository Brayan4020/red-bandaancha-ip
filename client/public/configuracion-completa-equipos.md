# Configuración Completa de Equipos — Red Banda Ancha Bogotá

**Documento de Referencia Técnica**  
Versión: 1.0 | Fecha: Mayo 2026 | Estado: Producción

---

## 📋 Tabla de Contenidos

1. [Routers WAN](#routers-wan)
2. [Switches L3](#switches-l3)
3. [Firewalls](#firewalls)
4. [Servidores](#servidores)
5. [Puntos de Acceso WiFi](#puntos-de-acceso-wifi)
6. [Cámaras CCTV](#cámaras-cctv)
7. [Teléfonos IP](#teléfonos-ip)
8. [UPS y Generadores](#ups-y-generadores)
9. [Cableado Estructurado](#cableado-estructurado)

---

## 🌐 Routers WAN

### Sede 1 (Teusaquillo) — Huawei NE40E

**Especificaciones Técnicas:**
- **Modelo**: Huawei NetEngine 40E
- **Throughput**: 100 Gbps
- **Puertos**: 48 × 10GE + 4 × 100GE
- **Memoria**: 128 GB RAM
- **Almacenamiento**: 1 TB SSD
- **Consumo**: 3.5 kW
- **Redundancia**: Dual PSU, Dual Fan

**Configuración Inicial:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI NE40E — SEDE 1 (TEUSAQUILLO)
# ════════════════════════════════════════════════════════════════

# 1. ACCESO INICIAL
system-view
sysName Sede1-Router-NE40E
snmp-agent sys-info version v3
clock timezone GMT -5

# 2. INTERFACES WAN
interface GigabitEthernet 0/0/0
  ip address 200.1.1.1 255.255.255.252
  description "ISP Primario - 100 Mbps"
  mtu 1500
  no shutdown
  
interface GigabitEthernet 0/0/1
  ip address 200.1.1.5 255.255.255.252
  description "ISP Secundario - 50 Mbps"
  mtu 1500
  no shutdown

# 3. INTERFACES LAN
interface GigabitEthernet 0/0/2
  ip address 172.16.0.1 255.255.248.0
  description "Red Interna Sede 1"
  no shutdown

# 4. OSPF (Open Shortest Path First)
ospf 1 router-id 172.16.0.1
  area 0
    network 172.16.0.0 0.0.7.255
    network 200.1.1.0 0.0.0.3
    network 200.1.1.4 0.0.0.3
    bfd all-interfaces

# 5. BGP (Border Gateway Protocol)
bgp 65001
  router-id 172.16.0.1
  peer 200.1.1.2 as-number 65000
  peer 200.1.1.6 as-number 65000
  ipv4-family unicast
    network 172.16.0.0 mask 255.255.248.0
    neighbor 200.1.1.2 route-policy EXPORT export
    neighbor 200.1.1.2 route-policy IMPORT import
    neighbor 200.1.1.6 route-policy EXPORT export
    neighbor 200.1.1.6 route-policy IMPORT import

# 6. QoS (Quality of Service)
traffic-policy QoS-Sede1 match-order auto
  classifier VOIP match-type priority
    if-match dscp ef
  classifier VIDEO match-type priority
    if-match dscp af41
  classifier DATA match-type priority
    if-match dscp default
  behavior VOIP-BEHAVIOR
    queue 1
    priority high
    car cir 300 pir 300
  behavior VIDEO-BEHAVIOR
    queue 2
    priority medium
    car cir 4000 pir 4000
  behavior DATA-BEHAVIOR
    queue 3
    priority low
    car cir 95700 pir 95700
  policy QoS-Sede1
    classifier VOIP behavior VOIP-BEHAVIOR
    classifier VIDEO behavior VIDEO-BEHAVIOR
    classifier DATA behavior DATA-BEHAVIOR

# 7. DHCP Relay
dhcp enable
interface GigabitEthernet 0/0/2
  dhcp select relay
  dhcp relay server-ip 172.16.14.10

# 8. Seguridad
acl number 3000
  rule 5 permit ip source 172.16.0.0 0.0.7.255
  rule 10 permit ip source 172.16.8.0 0.0.3.255
  rule 15 permit ip source 172.16.12.0 0.0.1.255
  rule 20 deny ip

interface GigabitEthernet 0/0/0
  traffic-filter inbound acl 3000

# 9. SNMP Monitoreo
snmp-agent community read public
snmp-agent community write private
snmp-agent trap enable

# 10. NTP (Network Time Protocol)
ntp-service enable
ntp-service unicast-server 172.16.14.20 prefer
ntp-service source GigabitEthernet 0/0/2

# 11. Syslog
info-center source SYSLOG channel 4 log level informational
info-center loghost 172.16.14.30

# 12. Respaldo de Configuración
scp server enable
sftp server enable

save
```

**Validación de Configuración:**

```bash
# Verificar interfaces
display interface GigabitEthernet 0/0/0
display interface GigabitEthernet 0/0/2

# Verificar OSPF
display ospf peer
display ospf route

# Verificar BGP
display bgp peer
display bgp routing-table

# Verificar QoS
display traffic-policy interface GigabitEthernet 0/0/0

# Verificar conectividad
ping 172.16.8.1
ping 172.16.12.1
tracert 8.8.8.8
```

---

### Sede 2 (Campus U Compensar) — Huawei NE40E

**Especificaciones Técnicas:**
- **Modelo**: Huawei NetEngine 40E
- **Throughput**: 100 Gbps
- **Puertos**: 48 × 10GE + 4 × 100GE
- **Memoria**: 128 GB RAM
- **Almacenamiento**: 1 TB SSD
- **Consumo**: 3.5 kW

**Configuración Inicial:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI NE40E — SEDE 2 (CAMPUS U COMPENSAR)
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede2-Router-NE40E
clock timezone GMT -5

# Interfaces WAN
interface GigabitEthernet 0/0/0
  ip address 200.2.2.1 255.255.255.252
  description "ISP Primario - 100 Mbps"
  no shutdown

interface GigabitEthernet 0/0/1
  ip address 200.2.2.5 255.255.255.252
  description "ISP Secundario - 50 Mbps"
  no shutdown

# Interfaces LAN
interface GigabitEthernet 0/0/2
  ip address 172.16.8.1 255.255.252.0
  description "Red Interna Sede 2"
  no shutdown

# OSPF
ospf 1 router-id 172.16.8.1
  area 0
    network 172.16.8.0 0.0.3.255
    network 200.2.2.0 0.0.0.3
    bfd all-interfaces

# BGP
bgp 65002
  router-id 172.16.8.1
  peer 200.2.2.2 as-number 65000
  ipv4-family unicast
    network 172.16.8.0 mask 255.255.252.0
    neighbor 200.2.2.2 route-policy EXPORT export
    neighbor 200.2.2.2 route-policy IMPORT import

# QoS
traffic-policy QoS-Sede2 match-order auto
  classifier VOIP match-type priority
    if-match dscp ef
  behavior VOIP-BEHAVIOR
    queue 1
    priority high
    car cir 300 pir 300
  policy QoS-Sede2
    classifier VOIP behavior VOIP-BEHAVIOR

# DHCP Relay
interface GigabitEthernet 0/0/2
  dhcp select relay
  dhcp relay server-ip 172.16.14.10

# Monitoreo
snmp-agent community read public
ntp-service unicast-server 172.16.14.20 prefer
info-center loghost 172.16.14.30

save
```

---

### Sede 3 (AV68) — Huawei NE20E

**Especificaciones Técnicas:**
- **Modelo**: Huawei NetEngine 20E
- **Throughput**: 50 Gbps
- **Puertos**: 24 × 10GE + 2 × 100GE
- **Memoria**: 64 GB RAM
- **Almacenamiento**: 512 GB SSD
- **Consumo**: 2.0 kW

**Configuración Inicial:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI NE20E — SEDE 3 (AV68)
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede3-Router-NE20E
clock timezone GMT -5

# Interfaces WAN
interface GigabitEthernet 0/0/0
  ip address 200.3.3.1 255.255.255.252
  description "ISP Primario - 100 Mbps"
  no shutdown

interface GigabitEthernet 0/0/1
  ip address 200.3.3.5 255.255.255.252
  description "ISP Secundario - 50 Mbps"
  no shutdown

# Interfaces LAN
interface GigabitEthernet 0/0/2
  ip address 172.16.12.1 255.255.254.0
  description "Red Interna Sede 3"
  no shutdown

# OSPF
ospf 1 router-id 172.16.12.1
  area 0
    network 172.16.12.0 0.0.1.255
    network 200.3.3.0 0.0.0.3
    bfd all-interfaces

# BGP
bgp 65003
  router-id 172.16.12.1
  peer 200.3.3.2 as-number 65000
  ipv4-family unicast
    network 172.16.12.0 mask 255.255.254.0
    neighbor 200.3.3.2 route-policy EXPORT export

save
```

---

## 🔀 Switches L3

### Sede 1 — Huawei CloudEngine 6800 (2 unidades)

**Especificaciones Técnicas:**
- **Modelo**: Huawei CloudEngine 6800
- **Puertos**: 48 × 10GE + 6 × 100GE
- **Throughput**: 25.6 Tbps
- **Memoria**: 32 GB
- **Consumo**: 2.5 kW por unidad
- **Redundancia**: Dual PSU, Dual Fan

**Configuración Switch 1 (Core):**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI CLOUDENGINE 6800 — SEDE 1 (CORE)
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede1-Switch-Core-CE6800
snmp-agent sys-info version v3

# VLANs
vlan batch 10 20 30 40 99

# VLAN 10 (DATOS)
vlan 10
  name VLAN-DATOS
  description "Estaciones de trabajo y PCs"

# VLAN 20 (VOZ)
vlan 20
  name VLAN-VOZ
  description "Telefonos IP y SIP"

# VLAN 30 (CCTV)
vlan 30
  name VLAN-CCTV
  description "Camaras de seguridad"

# VLAN 40 (SERVIDORES)
vlan 40
  name VLAN-SERVIDORES
  description "Virtualizacion e infraestructura"

# VLAN 99 (GESTION)
vlan 99
  name VLAN-GESTION
  description "Administracion de switches"

# Interfaces de Acceso (Downlink)
interface Ethernet 0/0/1 to 0/0/24
  port link-type access
  port default vlan 10
  speed 10000
  duplex full
  no shutdown

interface Ethernet 0/0/25 to 0/0/32
  port link-type access
  port default vlan 20
  speed 10000
  duplex full
  no shutdown

interface Ethernet 0/0/33 to 0/0/40
  port link-type access
  port default vlan 30
  speed 10000
  duplex full
  no shutdown

interface Ethernet 0/0/41 to 0/0/48
  port link-type access
  port default vlan 40
  speed 10000
  duplex full
  no shutdown

# Interfaces Trunk (Uplink)
interface Ethernet 0/0/49 to 0/0/50
  port link-type trunk
  port trunk allow-pass vlan 10 20 30 40 99
  speed 100000
  duplex full
  no shutdown

# Interfaces de Gestion
interface Vlanif 99
  ip address 172.16.15.1 255.255.255.0
  description "Interfaz de Gestion"

# RSTP (Rapid Spanning Tree Protocol)
stp mode rstp
stp priority 0
stp bpdu-protection
stp root-protection

interface Ethernet 0/0/49
  stp cost 1000
  stp port priority 128

# DHCP Snooping
dhcp snooping enable
dhcp snooping vlan 10 20 30 40
interface Ethernet 0/0/1 to 0/0/48
  dhcp snooping trusted

# IGMP Snooping (para video)
igmp snooping enable
igmp snooping vlan 30

# QoS
traffic-policy QoS-CE6800 match-order auto
  classifier VOIP match-type priority
    if-match dscp ef
  classifier VIDEO match-type priority
    if-match dscp af41
  behavior VOIP-BEHAVIOR
    queue 1
    priority high
    car cir 300 pir 300
  behavior VIDEO-BEHAVIOR
    queue 2
    priority medium
    car cir 4000 pir 4000
  policy QoS-CE6800
    classifier VOIP behavior VOIP-BEHAVIOR
    classifier VIDEO behavior VIDEO-BEHAVIOR

interface Ethernet 0/0/1 to 0/0/48
  traffic-policy QoS-CE6800 outbound

# SNMP
snmp-agent community read public
snmp-agent community write private
snmp-agent trap enable

# NTP
ntp-service enable
ntp-service unicast-server 172.16.14.20 prefer

# Syslog
info-center loghost 172.16.14.30

save
```

---

### Sede 1 — Huawei CloudEngine 6800 (Switch 2 - Distribution)

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI CLOUDENGINE 6800 — SEDE 1 (DISTRIBUTION)
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede1-Switch-Dist-CE6800

# VLANs
vlan batch 10 20 30 40 99

# Interfaces de Acceso
interface Ethernet 0/0/1 to 0/0/24
  port link-type access
  port default vlan 10

interface Ethernet 0/0/25 to 0/0/32
  port link-type access
  port default vlan 20

interface Ethernet 0/0/33 to 0/0/40
  port link-type access
  port default vlan 30

interface Ethernet 0/0/41 to 0/0/48
  port link-type access
  port default vlan 40

# Trunk al Core
interface Ethernet 0/0/49 to 0/0/50
  port link-type trunk
  port trunk allow-pass vlan 10 20 30 40 99

# RSTP
stp mode rstp
stp priority 4096

# DHCP Snooping
dhcp snooping enable
dhcp snooping vlan 10 20 30 40

# Gestion
interface Vlanif 99
  ip address 172.16.15.2 255.255.255.0

# Monitoreo
snmp-agent community read public
ntp-service unicast-server 172.16.14.20 prefer

save
```

---

### Sede 2 — Huawei CloudEngine 6800

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI CLOUDENGINE 6800 — SEDE 2
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede2-Switch-CE6800

# VLANs
vlan batch 10 20 30 40 99

# Interfaces
interface Ethernet 0/0/1 to 0/0/24
  port link-type access
  port default vlan 10

interface Ethernet 0/0/25 to 0/0/32
  port link-type access
  port default vlan 20

interface Ethernet 0/0/33 to 0/0/40
  port link-type access
  port default vlan 30

interface Ethernet 0/0/41 to 0/0/48
  port link-type access
  port default vlan 40

# Trunk
interface Ethernet 0/0/49 to 0/0/50
  port link-type trunk
  port trunk allow-pass vlan 10 20 30 40 99

# RSTP
stp mode rstp
stp priority 0

# Gestion
interface Vlanif 99
  ip address 172.16.15.3 255.255.255.0

# Monitoreo
snmp-agent community read public
ntp-service unicast-server 172.16.14.20 prefer

save
```

---

### Sede 3 — Huawei CloudEngine 5800

**Especificaciones Técnicas:**
- **Modelo**: Huawei CloudEngine 5800
- **Puertos**: 48 × 10GE + 4 × 100GE
- **Throughput**: 12.8 Tbps
- **Memoria**: 16 GB
- **Consumo**: 1.5 kW

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI CLOUDENGINE 5800 — SEDE 3
# ════════════════════════════════════════════════════════════════

system-view
sysName Sede3-Switch-CE5800

# VLANs
vlan batch 10 20 30 40 99

# Interfaces
interface Ethernet 0/0/1 to 0/0/24
  port link-type access
  port default vlan 10

interface Ethernet 0/0/25 to 0/0/32
  port link-type access
  port default vlan 20

interface Ethernet 0/0/33 to 0/0/40
  port link-type access
  port default vlan 30

interface Ethernet 0/0/41 to 0/0/48
  port link-type access
  port default vlan 40

# Trunk
interface Ethernet 0/0/49 to 0/0/50
  port link-type trunk
  port trunk allow-pass vlan 10 20 30 40 99

# RSTP
stp mode rstp
stp priority 0

# Gestion
interface Vlanif 99
  ip address 172.16.15.4 255.255.255.0

# Monitoreo
snmp-agent community read public
ntp-service unicast-server 172.16.14.20 prefer

save
```

---

## 🔒 Firewalls

### Sede 1 — Fortinet FortiGate 3100D (HA Activo-Pasivo)

**Especificaciones Técnicas:**
- **Modelo**: Fortinet FortiGate 3100D
- **Throughput**: 100 Gbps
- **Conexiones Concurrentes**: 10M
- **Memoria**: 32 GB
- **Almacenamiento**: 1 TB SSD
- **Consumo**: 3.0 kW

**Configuración Primario:**

```bash
# ════════════════════════════════════════════════════════════════
# FORTINET FORTIGATE 3100D — SEDE 1 (PRIMARIO)
# ════════════════════════════════════════════════════════════════

config system global
  set hostname FG3100D-Sede1-Primary
  set timezone GMT-5
  set admintimeout 60
  set language spanish
end

# HA (High Availability)
config system ha
  set mode a-p
  set group-name HA-Sede1
  set priority 200
  set hbdev port1 100
  set session-pickup enable
  set session-pickup-connectionless enable
  set failover-hold-time 0
end

# Interfaces
config system interface
  edit port1
    set vdom root
    set type physical
    set ip 200.1.1.1 255.255.255.252
    set description ISP-Primario
    set role wan
    set allowaccess ping https ssh snmp
  next
  edit port2
    set vdom root
    set type physical
    set ip 200.1.1.5 255.255.255.252
    set description ISP-Secundario
    set role wan
    set allowaccess ping https ssh snmp
  next
  edit port3
    set vdom root
    set type physical
    set ip 172.16.0.254 255.255.248.0
    set description LAN-Interna
    set role lan
    set allowaccess ping https ssh snmp
  next
  edit port4
    set vdom root
    set type physical
    set ip 172.16.14.1 255.255.255.0
    set description DMZ-Servidores
    set role dmz
    set allowaccess ping https ssh snmp
  next
end

# Rutas Estáticas
config router static
  edit 1
    set gateway 200.1.1.2
    set device port1
    set distance 10
  next
  edit 2
    set gateway 200.1.1.6
    set device port2
    set distance 20
  next
end

# Políticas de Firewall - Entrada
config firewall policy
  edit 1
    set name Allow-LAN-to-Internet
    set srcintf port3
    set dstintf port1
    set srcaddr all
    set dstaddr all
    set action accept
    set schedule always
    set service HTTP HTTPS DNS
    set nat enable
    set logtraffic all
  next
  edit 2
    set name Allow-VOIP
    set srcintf port3
    set dstintf port1
    set srcaddr all
    set dstaddr all
    set action accept
    set schedule always
    set service SIP RTP
    set qos-policy QoS-VOIP
    set logtraffic all
  next
  edit 3
    set name Allow-VIDEO
    set srcintf port3
    set dstintf port1
    set srcaddr all
    set dstaddr all
    set action accept
    set schedule always
    set service RTMP RTSP
    set qos-policy QoS-VIDEO
    set logtraffic all
  next
  edit 4
    set name Allow-DMZ-to-LAN
    set srcintf port4
    set dstintf port3
    set srcaddr all
    set dstaddr all
    set action accept
    set schedule always
    set service HTTP HTTPS SSH
    set logtraffic all
  next
  edit 5
    set name Deny-All
    set srcintf any
    set dstintf any
    set action deny
    set logtraffic all
  next
end

# Políticas de Firewall - Salida
config firewall policy
  edit 100
    set name Allow-Internet-to-LAN
    set srcintf port1
    set dstintf port3
    set srcaddr all
    set dstaddr all
    set action accept
    set schedule always
    set service HTTP HTTPS DNS
    set logtraffic all
  next
end

# VPN IPSec
config vpn ipsec phase1-interface
  edit Sede2-Tunnel
    set interface port1
    set ike-version 2
    set peertype any
    set peer 200.2.2.1
    set net-device disable
    set proposal aes256-sha256
    set comments Tunnel-to-Sede2
  next
end

config vpn ipsec phase2-interface
  edit Sede2-Tunnel-Phase2
    set phase1name Sede2-Tunnel
    set proposal aes256-sha256
    set pfs enable
    set replay disable
    set auto-negotiate enable
  next
end

# QoS
config firewall shaper
  edit QoS-VOIP
    set guaranteed-bandwidth 300
    set maximum-bandwidth 300
    set priority high
  next
  edit QoS-VIDEO
    set guaranteed-bandwidth 4000
    set maximum-bandwidth 4000
    set priority medium
  next
  edit QoS-DATA
    set guaranteed-bandwidth 95700
    set maximum-bandwidth 95700
    set priority low
  next
end

# IPS (Intrusion Prevention System)
config ips global
  set status enable
  set fail-open disable
end

# Antivirus
config antivirus settings
  set status enable
  set mobile-malware-db enable
end

# Web Filter
config webfilter profile
  edit default
    set options activexfilter cookiefilter javafilter
    set log-all-url enable
  next
end

# SNMP
config system snmp community
  edit 1
    set name public
    set status enable
    set hosts 172.16.14.30
  next
end

# Syslog
config log syslogd setting
  set status enable
  set server 172.16.14.30
  set port 514
end

# NTP
config system ntp
  set status enable
  set type fortisiem
  set server 172.16.14.20
  set ntpsync enable
end

# Respaldo
config system backup all-settings
  set status enable
  set backup-password backup123
end
```

**Configuración Secundario (Pasivo):**

```bash
# ════════════════════════════════════════════════════════════════
# FORTINET FORTIGATE 3100D — SEDE 1 (SECUNDARIO)
# ════════════════════════════════════════════════════════════════

config system global
  set hostname FG3100D-Sede1-Secondary
end

config system ha
  set mode a-p
  set group-name HA-Sede1
  set priority 100
  set hbdev port1 100
  set session-pickup enable
end

# Resto de configuración idéntica al primario
# Las interfaces y políticas se sincronizan automáticamente
```

---

### Sede 2 — Fortinet FortiGate 1500D

**Especificaciones Técnicas:**
- **Modelo**: Fortinet FortiGate 1500D
- **Throughput**: 50 Gbps
- **Conexiones Concurrentes**: 5M
- **Memoria**: 16 GB
- **Consumo**: 1.5 kW

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# FORTINET FORTIGATE 1500D — SEDE 2
# ════════════════════════════════════════════════════════════════

config system global
  set hostname FG1500D-Sede2
  set timezone GMT-5
end

config system interface
  edit port1
    set ip 200.2.2.1 255.255.255.252
    set description ISP-Primario
    set role wan
  next
  edit port3
    set ip 172.16.8.254 255.255.252.0
    set description LAN-Interna
    set role lan
  next
end

config router static
  edit 1
    set gateway 200.2.2.2
    set device port1
  next
end

config firewall policy
  edit 1
    set name Allow-LAN-to-Internet
    set srcintf port3
    set dstintf port1
    set srcaddr all
    set dstaddr all
    set action accept
    set nat enable
    set logtraffic all
  next
end

config system snmp community
  edit 1
    set name public
    set status enable
    set hosts 172.16.14.30
  next
end

config log syslogd setting
  set status enable
  set server 172.16.14.30
end
```

---

### Sede 3 — Fortinet FortiGate 600D

**Especificaciones Técnicas:**
- **Modelo**: Fortinet FortiGate 600D
- **Throughput**: 20 Gbps
- **Conexiones Concurrentes**: 2M
- **Memoria**: 8 GB
- **Consumo**: 0.8 kW

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# FORTINET FORTIGATE 600D — SEDE 3
# ════════════════════════════════════════════════════════════════

config system global
  set hostname FG600D-Sede3
  set timezone GMT-5
end

config system interface
  edit port1
    set ip 200.3.3.1 255.255.255.252
    set description ISP-Primario
    set role wan
  next
  edit port3
    set ip 172.16.12.254 255.255.254.0
    set description LAN-Interna
    set role lan
  next
end

config router static
  edit 1
    set gateway 200.3.3.2
    set device port1
  next
end

config firewall policy
  edit 1
    set name Allow-LAN-to-Internet
    set srcintf port3
    set dstintf port1
    set srcaddr all
    set dstaddr all
    set action accept
    set nat enable
  next
end

config system snmp community
  edit 1
    set name public
    set status enable
    set hosts 172.16.14.30
  next
end
```

---

## 💾 Servidores

### Servidor Web (Sede 1)

**Especificaciones:**
- **CPU**: Intel Xeon E5-2680 v4 (14 cores, 28 threads)
- **RAM**: 64 GB DDR4
- **Almacenamiento**: 2 × 1 TB SSD RAID 1
- **Red**: 2 × 10GbE
- **SO**: Ubuntu Server 22.04 LTS
- **Consumo**: 0.5 kW

**Configuración de Red:**

```bash
# ════════════════════════════════════════════════════════════════
# SERVIDOR WEB — SEDE 1
# ════════════════════════════════════════════════════════════════

# /etc/netplan/01-netcfg.yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    eth0:
      dhcp4: false
      addresses:
        - 172.16.14.10/24
      gateway4: 172.16.14.1
      nameservers:
        addresses: [172.16.14.20, 8.8.8.8]
      routes:
        - to: 172.16.0.0/21
          via: 172.16.14.1
        - to: 172.16.8.0/22
          via: 172.16.14.1
        - to: 172.16.12.0/23
          via: 172.16.14.1
    eth1:
      dhcp4: false
      addresses:
        - 172.16.14.11/24

# Aplicar configuración
sudo netplan apply

# Verificar
ip addr show
ip route show

# Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable

# Servicios
sudo systemctl enable nginx
sudo systemctl start nginx

# Monitoreo
sudo apt-get install -y prometheus-node-exporter
sudo systemctl enable prometheus-node-exporter
sudo systemctl start prometheus-node-exporter
```

---

### Servidor de Base de Datos (Sede 1)

**Especificaciones:**
- **CPU**: Intel Xeon E5-2680 v4 (14 cores)
- **RAM**: 128 GB DDR4
- **Almacenamiento**: 4 × 2 TB SSD RAID 10
- **Red**: 2 × 10GbE
- **SO**: Ubuntu Server 22.04 LTS
- **Consumo**: 0.8 kW

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# SERVIDOR BD — SEDE 1
# ════════════════════════════════════════════════════════════════

# Configuración de Red (similar al servidor web)
# IP: 172.16.14.12/24

# PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Configuración de Replicación
sudo -u postgres psql
CREATE ROLE replication WITH REPLICATION LOGIN PASSWORD 'repl_password';

# /etc/postgresql/14/main/postgresql.conf
listen_addresses = '172.16.14.12'
max_connections = 500
shared_buffers = 32GB
effective_cache_size = 96GB
work_mem = 65536kB
maintenance_work_mem = 8GB
wal_level = replica
max_wal_senders = 3
wal_keep_size = 1GB

# Monitoreo
sudo apt-get install -y pg-stat-kcache
```

---

### Servidor de Respaldo (Sede 1)

**Especificaciones:**
- **CPU**: Intel Xeon E5-2620 v4 (8 cores)
- **RAM**: 32 GB DDR4
- **Almacenamiento**: 8 × 4 TB HDD RAID 6
- **Red**: 1 × 1GbE
- **SO**: Ubuntu Server 22.04 LTS
- **Consumo**: 0.3 kW

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# SERVIDOR RESPALDO — SEDE 1
# ════════════════════════════════════════════════════════════════

# IP: 172.16.14.13/24

# Bacula (Backup)
sudo apt-get install -y bacula-director bacula-storage bacula-client
sudo systemctl enable bacula-director
sudo systemctl enable bacula-sd
sudo systemctl start bacula-director
sudo systemctl start bacula-sd

# Configuración de Respaldo Automático
# /etc/bacula/bacula-dir.conf
Storage {
  Name = File
  Address = 172.16.14.13
  SDPort = 9103
  Password = "backup_password"
  Device = FileStorage
  Media Type = File
}

Schedule {
  Name = "Daily"
  Run = Full 1st sun at 23:00
  Run = Differential 2nd-5th sun at 23:00
  Run = Incremental mon-sat at 23:00
}
```

---

## 📡 Puntos de Acceso WiFi

### Modelo: Huawei AP6010SN-GN

**Especificaciones Técnicas:**
- **Estándar**: WiFi 6 (802.11ax)
- **Velocidad**: 3.0 Gbps
- **Cobertura**: 200 m²
- **Antenas**: 4 × 4 MIMO
- **Potencia**: 30 dBm
- **Consumo**: 30W

**Configuración Estándar:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI AP6010SN-GN — CONFIGURACIÓN ESTÁNDAR
# ════════════════════════════════════════════════════════════════

# Acceso Web
https://192.168.0.1
Usuario: admin
Contraseña: admin@123

# Red
IP: 172.16.X.Y/24 (DHCP desde servidor)
Gateway: 172.16.X.1
DNS: 172.16.14.20

# WiFi 2.4 GHz
SSID: RedBandaAncha-2.4G
Seguridad: WPA2-PSK
Contraseña: WPA2_Secure_Pass_2024
Canal: Auto (1, 6, 11)
Ancho de Banda: 20 MHz
Potencia TX: 30 dBm

# WiFi 5 GHz
SSID: RedBandaAncha-5G
Seguridad: WPA3
Contraseña: WPA3_Secure_Pass_2024
Canal: Auto (36-48, 52-144, 149-165)
Ancho de Banda: 80 MHz
Potencia TX: 30 dBm

# WiFi 6 GHz (si disponible)
SSID: RedBandaAncha-6G
Seguridad: WPA3
Contraseña: WPA3_Secure_Pass_2024
Ancho de Banda: 160 MHz

# VLAN
VLAN Nativa: 10 (DATOS)
VLAN Voz: 20
VLAN Video: 30

# QoS
Prioridad VOIP: Alta
Prioridad Video: Media
Prioridad Datos: Baja

# Monitoreo
SNMP Enabled: Si
SNMP Community: public
Syslog Server: 172.16.14.30
NTP Server: 172.16.14.20

# Seguridad
Firewall: Habilitado
Filtro MAC: Deshabilitado
Aislamiento de Cliente: Deshabilitado
```

**Distribución por Sede:**

| Sede | Cantidad | Ubicación | Modelo |
|---|---|---|---|
| Sede 1 | 60 | Oficinas, Pasillos, Cafetería | AP6010SN-GN |
| Sede 2 | 35 | Aulas, Laboratorios, Biblioteca | AP6010SN-GN |
| Sede 3 | 15 | Oficinas, Recepción | AP6010SN-GN |
| **Total** | **110** | — | — |

---

## 📹 Cámaras CCTV

### Modelo: Hikvision DS-2CD2143G2-I

**Especificaciones Técnicas:**
- **Resolución**: 4MP (2688 × 1520)
- **Sensor**: 1/3" CMOS
- **Lente**: 2.8mm, 4mm, 6mm
- **Rango IR**: 30 metros
- **Compresión**: H.265+
- **Consumo**: 5W

**Configuración Estándar:**

```bash
# ════════════════════════════════════════════════════════════════
# HIKVISION DS-2CD2143G2-I — CONFIGURACIÓN
# ════════════════════════════════════════════════════════════════

# Acceso Web
http://192.168.1.64
Usuario: admin
Contraseña: 12345

# Red
IP: 172.16.13.X/24 (DHCP desde servidor VLAN 30)
Gateway: 172.16.12.1
DNS: 172.16.14.20

# Video
Resolución: 2688 × 1520 @ 25fps
Compresión: H.265+
Bitrate: 2 Mbps
Perfil: Balanceado

# Almacenamiento
NVR: 172.16.14.40
Puerto: 8000
Usuario: admin
Contraseña: NVR_Pass_2024

# Monitoreo
SNMP: Habilitado
Syslog: 172.16.14.30

# Seguridad
Firewall: Habilitado
Contraseña Fuerte: Si
HTTPS: Habilitado
```

**Distribución por Sede:**

| Sede | Cantidad | Ubicación |
|---|---|---|
| Sede 1 | 80 | Entradas, Pasillos, Servidores, Cafetería |
| Sede 2 | 50 | Entradas, Aulas, Laboratorios |
| Sede 3 | 30 | Entradas, Oficinas |
| **Total** | **160** | — |

---

## ☎️ Teléfonos IP

### Modelo: Huawei eSpace 7920

**Especificaciones Técnicas:**
- **Pantalla**: 7" color TFT
- **Líneas**: 6 líneas SIP
- **Códecs**: G.711, G.729, G.722
- **PoE**: 15W
- **Consumo**: 12W

**Configuración Estándar:**

```bash
# ════════════════════════════════════════════════════════════════
# HUAWEI ESPACE 7920 — CONFIGURACIÓN
# ════════════════════════════════════════════════════════════════

# Red
IP: DHCP (VLAN 20 - VOZ)
Gateway: 172.16.X.1
DNS: 172.16.14.20

# SIP
Servidor SIP: 172.16.14.50
Puerto SIP: 5060
Usuario: extension_001
Contraseña: SIP_Pass_2024
Dominio: redbancha.local

# Codecs
Prioridad 1: G.722 (16 kHz)
Prioridad 2: G.711 (8 kHz)
Prioridad 3: G.729 (8 kHz)

# QoS
DSCP: EF (Expedited Forwarding)
Prioridad 802.1p: 5

# Seguridad
HTTPS: Habilitado
Contraseña Admin: Tel_Admin_2024
Bloqueo de Llamadas: Habilitado

# Monitoreo
SNMP: Habilitado
Syslog: 172.16.14.30
```

**Distribución por Sede:**

| Sede | Cantidad | Departamento |
|---|---|---|
| Sede 1 | 250 | Gerencia, Ventas, Soporte, Administrativo |
| Sede 2 | 200 | Académico, Administrativo |
| Sede 3 | 50 | Gerencia Regional |
| **Total** | **500** | — |

---

## 🔋 UPS y Generadores

### UPS — APC Smart-UPS SRT 10000XLi

**Especificaciones Técnicas:**
- **Capacidad**: 10 kVA / 9 kW
- **Autonomía**: 15 minutos (carga completa)
- **Batería**: 480V DC
- **Entrada**: 208V / 220V / 240V
- **Salida**: 208V / 220V / 240V
- **Eficiencia**: 96%

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# APC SMART-UPS SRT 10000XLI
# ════════════════════════════════════════════════════════════════

# Acceso Web
https://172.16.14.100
Usuario: apc
Contraseña: apc123

# Configuración
Voltaje Entrada: 220V
Voltaje Salida: 220V
Frecuencia: 60 Hz
Autonomía Objetivo: 15 minutos

# Cargas Conectadas
- Router Huawei NE40E: 3.5 kW
- Switch CloudEngine 6800 (2x): 5.0 kW
- Firewall FortiGate 3100D (2x): 6.0 kW
- Servidores (6x): 3.0 kW
- Equipos Menores: 1.5 kW
Total: 19 kW (requiere 2 UPS)

# Notificaciones
Email Alertas: admin@redbancha.local
SNMP Traps: 172.16.14.30
Syslog: 172.16.14.30

# Mantenimiento
Prueba Automática: Mensual
Cambio de Batería: Cada 5 años
Próxima Revisión: 2027-05
```

---

### Generador — Caterpillar C15 (350 kVA)

**Especificaciones Técnicas:**
- **Potencia**: 350 kVA / 280 kW
- **Combustible**: Diésel
- **Tanque**: 1.200 litros
- **Autonomía**: 48 horas (carga 50%)
- **Voltaje**: 220V / 380V
- **Frecuencia**: 60 Hz

**Configuración:**

```bash
# ════════════════════════════════════════════════════════════════
# CATERPILLAR C15 — GENERADOR
# ════════════════════════════════════════════════════════════════

# Panel de Control
Voltaje Nominal: 220V / 380V
Frecuencia: 60 Hz
RPM: 1.800
Modo Operación: Automático

# Combustible
Tipo: Diésel 2D
Consumo: 70 litros/hora (carga 100%)
Tanque: 1.200 litros
Autonomía: 48 horas @ 50% carga

# Mantenimiento
Cambio Aceite: Cada 500 horas
Filtro Aire: Cada 1.000 horas
Inspección: Trimestral
Prueba Carga: Mensual

# Seguridad
Protección Sobrecarga: Si
Protección Baja Voltaje: Si
Protección Baja Presión Aceite: Si
Protección Temperatura: Si

# Transferencia Automática
Tiempo Detección Fallo: 2 segundos
Tiempo Arranque: 5 segundos
Tiempo Transferencia: 3 segundos
Tiempo Retorno: 5 minutos (sin carga)
```

---

## 🔌 Cableado Estructurado

### Especificaciones de Cableado

**Cable UTP Cat6A:**
- **Estándar**: ISO/IEC 11801:2002
- **Impedancia**: 100 Ω
- **Atenuación**: < 2.0 dB/100m @ 500 MHz
- **Velocidad Transmisión**: 10 Gbps @ 100 metros
- **Cantidad**: 5.000 metros por sede

**Conectores RJ45 Cat6A:**
- **Tipo**: Shielded (STP)
- **Contactos**: Oro 50 micrones
- **Cantidad**: 2.000 unidades por sede

**Patch Panels Cat6A:**
- **Puertos**: 48 puertos por panel
- **Cantidad**: 10 paneles por sede
- **Ubicación**: Cuarto de Telecomunicaciones

**Canaletas y Bandejas:**
- **Material**: Acero galvanizado
- **Ancho**: 300 mm
- **Longitud Total**: 500 metros por sede

**Identificación:**
- **Etiquetado**: Cada puerto identificado
- **Código Color**: TIA/EIA 568B
- **Documentación**: Plano de cableado digital

---

## 📊 Resumen de Configuración

| Componente | Sede 1 | Sede 2 | Sede 3 | Total |
|---|---|---|---|---|
| **Routers** | 1 NE40E | 1 NE40E | 1 NE20E | 3 |
| **Switches** | 2 CE6800 | 1 CE6800 | 1 CE5800 | 5 |
| **Firewalls** | 2 FG3100D (HA) | 1 FG1500D | 1 FG600D | 4 |
| **Servidores** | 6 | 2 | 1 | 9 |
| **APs WiFi** | 60 | 35 | 15 | 110 |
| **Cámaras** | 80 | 50 | 30 | 160 |
| **Teléfonos IP** | 250 | 200 | 50 | 500 |
| **UPS** | 2 × 10kVA | 1 × 10kVA | 1 × 5kVA | 4 |
| **Generador** | 1 × 350kVA | — | — | 1 |

---

## 🔐 Credenciales de Acceso (Almacenar en Gestor de Contraseñas)

| Dispositivo | Usuario | Contraseña | IP/Hostname |
|---|---|---|---|
| Router Sede 1 | admin | router_pass_2024 | 172.16.0.1 |
| Router Sede 2 | admin | router_pass_2024 | 172.16.8.1 |
| Router Sede 3 | admin | router_pass_2024 | 172.16.12.1 |
| Switch Core | admin | switch_pass_2024 | 172.16.15.1 |
| Firewall Sede 1 | admin | firewall_pass_2024 | 172.16.0.254 |
| Servidor Web | ubuntu | server_pass_2024 | 172.16.14.10 |
| Servidor BD | postgres | db_pass_2024 | 172.16.14.12 |
| NVR CCTV | admin | nvr_pass_2024 | 172.16.14.40 |
| PBX Voz | admin | pbx_pass_2024 | 172.16.14.50 |

---

## 📞 Contactos de Soporte

| Fabricante | Teléfono | Email | Portal |
|---|---|---|---|
| Huawei | +57 1 XXX-XXXX | support@huawei.com.co | huawei.com |
| Fortinet | +57 1 XXX-XXXX | support@fortinet.com | fortinet.com |
| Hikvision | +57 1 XXX-XXXX | support@hikvision.com | hikvision.com |
| APC | +57 1 XXX-XXXX | support@apc.com | apc.com |

---

**Documento Preparado Por**: Equipo de Infraestructura  
**Fecha de Creación**: Mayo 2026  
**Próxima Revisión**: Noviembre 2026  
**Versión**: 1.0
