# Configuraciones de Switches y Routers — Red Banda Ancha

## Tabla de Contenidos
1. [Cisco IOS](#cisco-ios)
2. [Huawei VRP](#huawei-vrp)
3. [Juniper Junos](#juniper-junos)
4. [Arista EOS](#arista-eos)

---

## CISCO IOS

### Configuración de Switch L3 (Sede 1 — Teusaquillo)

```cisco
! Configuración de Switch Cisco Catalyst 3650 / 9300
! Sede 1: Teusaquillo (172.16.0.0/21)

! ═══════════════════════════════════════════════════════════════
! 1. CONFIGURACIÓN BÁSICA
! ═══════════════════════════════════════════════════════════════

hostname SW-SEDE1-TEUS
enable password 7 [encrypted_password]
service password-encryption
no ip domain-lookup

! ═══════════════════════════════════════════════════════════════
! 2. INTERFACES DE VLAN
! ═══════════════════════════════════════════════════════════════

! VLAN 10 - Datos
interface Vlan10
 description VLAN-DATOS-SEDE1
 ip address 172.16.0.1 255.255.248.0
 ip helper-address 172.16.0.50
 no shutdown

! VLAN 20 - Voz IP
interface Vlan20
 description VLAN-VOZ-SEDE1
 ip address 172.16.1.1 255.255.255.0
 ip helper-address 172.16.1.50
 no shutdown

! VLAN 30 - CCTV
interface Vlan30
 description VLAN-CCTV-SEDE1
 ip address 172.16.2.1 255.255.255.0
 no shutdown

! VLAN 40 - Servidores
interface Vlan40
 description VLAN-SERVIDORES-SEDE1
 ip address 172.16.3.1 255.255.255.0
 no shutdown

! VLAN 99 - Gestión
interface Vlan99
 description VLAN-GESTION-SEDE1
 ip address 172.16.7.1 255.255.255.0
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 3. DEFINICIÓN DE VLANS
! ═══════════════════════════════════════════════════════════════

vlan 10
 name VLAN-DATOS
vlan 20
 name VLAN-VOZ
vlan 30
 name VLAN-CCTV
vlan 40
 name VLAN-SERVIDORES
vlan 99
 name VLAN-GESTION

! ═══════════════════════════════════════════════════════════════
! 4. CONFIGURACIÓN DE PUERTOS DE ACCESO (DATOS)
! ═══════════════════════════════════════════════════════════════

interface range GigabitEthernet1/0/1-24
 description ACCESS-DATOS
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 5. CONFIGURACIÓN DE PUERTOS DE VOZ
! ═══════════════════════════════════════════════════════════════

interface range GigabitEthernet2/0/1-8
 description ACCESS-VOZ
 switchport mode access
 switchport access vlan 20
 switchport voice vlan 20
 mls qos trust cos
 spanning-tree portfast
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 6. CONFIGURACIÓN DE PUERTOS CCTV
! ═══════════════════════════════════════════════════════════════

interface range GigabitEthernet2/0/9-12
 description ACCESS-CCTV
 switchport mode access
 switchport access vlan 30
 mls qos trust dscp
 spanning-tree portfast
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 7. PUERTOS TRONCALES (UPLINK A ROUTER)
! ═══════════════════════════════════════════════════════════════

interface GigabitEthernet2/0/47
 description UPLINK-TO-ROUTER-SEDE1
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,99
 switchport trunk native vlan 99
 no shutdown

interface GigabitEthernet2/0/48
 description UPLINK-TO-ROUTER-SEDE1-REDUNDANTE
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,99
 switchport trunk native vlan 99
 channel-group 1 mode active
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 8. ENRUTAMIENTO OSPF
! ═══════════════════════════════════════════════════════════════

router ospf 1
 router-id 172.16.0.1
 network 172.16.0.0 0.0.7.255 area 0
 network 172.16.1.0 0.0.0.255 area 0
 network 172.16.2.0 0.0.0.255 area 0
 network 172.16.3.0 0.0.0.255 area 0
 network 172.16.7.0 0.0.0.255 area 0
 passive-interface default
 no passive-interface Vlan99

! ═══════════════════════════════════════════════════════════════
! 9. CONFIGURACIÓN DE QoS
! ═══════════════════════════════════════════════════════════════

! Política QoS para Voz (VLAN 20)
class-map match-any VOICE-CLASS
 match dscp ef
 match cos 5

! Política QoS para CCTV (VLAN 30)
class-map match-any VIDEO-CLASS
 match dscp af41
 match cos 4

! Política QoS para Datos (VLAN 10)
class-map match-any DATA-CLASS
 match dscp af21
 match cos 2

! Policy Map
policy-map QOS-POLICY
 class VOICE-CLASS
  priority percent 30
 class VIDEO-CLASS
  bandwidth percent 20
 class DATA-CLASS
  bandwidth percent 40
 class class-default
  bandwidth percent 10

! Aplicar política a interfaces
interface Vlan10
 service-policy output QOS-POLICY

interface Vlan20
 service-policy output QOS-POLICY

interface Vlan30
 service-policy output QOS-POLICY

! ═══════════════════════════════════════════════════════════════
! 10. SEGURIDAD - ACLs
! ═══════════════════════════════════════════════════════════════

! ACL para permitir tráfico entre VLANs
ip access-list extended ALLOW-INTER-VLAN
 permit ip 172.16.0.0 0.0.7.255 172.16.0.0 0.0.7.255
 permit icmp 172.16.0.0 0.0.7.255 172.16.0.0 0.0.7.255
 deny ip any any

! ACL para bloquear CCTV hacia Datos
ip access-list extended RESTRICT-CCTV
 deny ip 172.16.2.0 0.0.0.255 172.16.0.0 0.0.0.255
 permit ip any any

! ═══════════════════════════════════════════════════════════════
! 11. SPANNING TREE
! ═══════════════════════════════════════════════════════════════

spanning-tree mode rapid
spanning-tree vlan 10,20,30,40,99 priority 8192

! ═══════════════════════════════════════════════════════════════
! 12. SNMP Y MONITOREO
! ═══════════════════════════════════════════════════════════════

snmp-server community public RO
snmp-server community private RW
snmp-server location "Sede 1 - Teusaquillo"
snmp-server contact "NetOps Team"

! ═══════════════════════════════════════════════════════════════
! 13. GUARDAR CONFIGURACIÓN
! ═══════════════════════════════════════════════════════════════

end
write memory
```

---

### Configuración de Router Cisco (Sede 1 — WAN)

```cisco
! Configuración de Router Cisco ISR 4331 / ASR 900
! Sede 1: Conexión WAN a Sede 2 y Sede 3

hostname R-SEDE1-WAN
enable password 7 [encrypted_password]
service password-encryption

! ═══════════════════════════════════════════════════════════════
! 1. INTERFACES LAN (Hacia Switch)
! ═══════════════════════════════════════════════════════════════

interface GigabitEthernet0/0/0
 description LAN-TO-SWITCH-SEDE1
 ip address 172.16.7.254 255.255.248.0
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 2. INTERFACES WAN
! ═══════════════════════════════════════════════════════════════

! Enlace Primario a Sede 2 (Fibra Óptica)
interface GigabitEthernet0/0/1
 description WAN-PRIMARY-TO-SEDE2
 ip address 10.0.1.1 255.255.255.252
 bandwidth 100000
 no shutdown

! Enlace Respaldo a Sede 3 (MPLS VPN)
interface GigabitEthernet0/0/2
 description WAN-BACKUP-TO-SEDE3
 ip address 10.0.2.1 255.255.255.252
 bandwidth 50000
 no shutdown

! ═══════════════════════════════════════════════════════════════
! 3. ENRUTAMIENTO OSPF
! ═══════════════════════════════════════════════════════════════

router ospf 1
 router-id 172.16.7.254
 
 ! Red Local (Sede 1)
 network 172.16.0.0 0.0.7.255 area 0
 
 ! Redes WAN
 network 10.0.1.0 0.0.0.3 area 0
 network 10.0.2.0 0.0.0.3 area 0
 
 ! Configurar métricas de costo
 auto-cost reference-bandwidth 100000
 
 ! Habilitar BFD para detección rápida de fallas
 bfd all-interfaces

! ═══════════════════════════════════════════════════════════════
! 4. ENRUTAMIENTO BGP (Opcional - para redundancia multi-ISP)
! ═══════════════════════════════════════════════════════════════

router bgp 65001
 bgp router-id 172.16.7.254
 bgp log-neighbor-changes
 
 neighbor 10.0.1.2 remote-as 65002
 neighbor 10.0.2.2 remote-as 65003
 
 address-family ipv4
  network 172.16.0.0 mask 255.255.248.0
  neighbor 10.0.1.2 activate
  neighbor 10.0.2.2 activate
  neighbor 10.0.1.2 soft-reconfiguration inbound
  neighbor 10.0.2.2 soft-reconfiguration inbound
 exit-address-family

! ═══════════════════════════════════════════════════════════════
! 5. CONFIGURACIÓN DE QoS EN WAN
! ═══════════════════════════════════════════════════════════════

! Clase para Voz
class-map match-any VOICE
 match dscp ef
 match ip dscp 46

! Clase para Video/CCTV
class-map match-any VIDEO
 match dscp af41
 match ip dscp 34

! Clase para Datos
class-map match-any DATA
 match dscp af21
 match ip dscp 18

! Policy Map para WAN
policy-map QOS-WAN-OUT
 class VOICE
  priority percent 30
 class VIDEO
  bandwidth percent 25
 class DATA
  bandwidth percent 35
 class class-default
  bandwidth percent 10

! Aplicar a interfaces WAN
interface GigabitEthernet0/0/1
 service-policy output QOS-WAN-OUT

interface GigabitEthernet0/0/2
 service-policy output QOS-WAN-OUT

! ═══════════════════════════════════════════════════════════════
! 6. CONFIGURACIÓN DE NAT (si es necesario)
! ═══════════════════════════════════════════════════════════════

! Definir interfaces
interface GigabitEthernet0/0/0
 ip nat inside

interface GigabitEthernet0/0/1
 ip nat outside

interface GigabitEthernet0/0/2
 ip nat outside

! ACL para NAT
ip access-list extended NAT-INSIDE
 permit ip 172.16.0.0 0.0.7.255 any

! Configurar NAT (si es necesario)
! ip nat inside source list NAT-INSIDE interface GigabitEthernet0/0/1 overload

! ═══════════════════════════════════════════════════════════════
! 7. MONITOREO Y LOGGING
! ═══════════════════════════════════════════════════════════════

logging host 172.16.7.50
logging trap informational
snmp-server community public RO
snmp-server location "Sede 1 - Router WAN"

! ═══════════════════════════════════════════════════════════════
! 8. GUARDAR CONFIGURACIÓN
! ═══════════════════════════════════════════════════════════════

end
write memory
```

---

## HUAWEI VRP

### Configuración de Switch Huawei (Sede 2 — Campus U)

```huawei
# Configuración de Switch Huawei CloudEngine 6800
# Sede 2: Campus U Compensar (172.16.8.0/22)

sysName SW-SEDE2-CAMPUS
sysDescr Huawei CloudEngine 6800 - Sede 2

# ═══════════════════════════════════════════════════════════════
# 1. CONFIGURACIÓN BÁSICA
# ═══════════════════════════════════════════════════════════════

system-view
sysName SW-SEDE2-CAMPUS
snmp-agent sys-info contact "NetOps Team"
snmp-agent sys-info location "Sede 2 - Campus U Compensar"

# ═══════════════════════════════════════════════════════════════
# 2. CREACIÓN DE VLANS
# ═══════════════════════════════════════════════════════════════

vlan batch 10 20 30 40 99

vlan 10
 name VLAN-DATOS
vlan 20
 name VLAN-VOZ
vlan 30
 name VLAN-CCTV
vlan 40
 name VLAN-SERVIDORES
vlan 99
 name VLAN-GESTION

# ═══════════════════════════════════════════════════════════════
# 3. INTERFACES VIRTUALES (SVI)
# ═══════════════════════════════════════════════════════════════

interface Vlanif10
 description VLAN-DATOS-SEDE2
 ip address 172.16.8.1 255.255.252.0
 dhcp select relay
 dhcp relay server-ip 172.16.8.50

interface Vlanif20
 description VLAN-VOZ-SEDE2
 ip address 172.16.9.1 255.255.255.0
 dhcp select relay
 dhcp relay server-ip 172.16.9.50

interface Vlanif30
 description VLAN-CCTV-SEDE2
 ip address 172.16.10.1 255.255.255.0

interface Vlanif40
 description VLAN-SERVIDORES-SEDE2
 ip address 172.16.11.1 255.255.255.0

interface Vlanif99
 description VLAN-GESTION-SEDE2
 ip address 172.16.11.254 255.255.255.0

# ═══════════════════════════════════════════════════════════════
# 4. CONFIGURACIÓN DE PUERTOS DE ACCESO
# ═══════════════════════════════════════════════════════════════

# Puertos de Datos (VLAN 10)
interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20
 port link-type access
 port default vlan 10
 stp edged-port enable

# Puertos de Voz (VLAN 20)
interface GigabitEthernet1/0/21 to GigabitEthernet1/0/24
 port link-type access
 port default vlan 20
 qos trust cos
 stp edged-port enable

# Puertos de CCTV (VLAN 30)
interface GigabitEthernet1/0/25 to GigabitEthernet1/0/28
 port link-type access
 port default vlan 30
 qos trust dscp
 stp edged-port enable

# ═══════════════════════════════════════════════════════════════
# 5. PUERTOS TRONCALES (UPLINK)
# ═══════════════════════════════════════════════════════════════

interface GigabitEthernet2/0/1
 description UPLINK-TO-ROUTER-SEDE2
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 port trunk pvid vlan 99

interface GigabitEthernet2/0/2
 description UPLINK-TO-ROUTER-SEDE2-REDUNDANTE
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 port trunk pvid vlan 99
 eth-trunk 1

# ═══════════════════════════════════════════════════════════════
# 6. AGREGACIÓN DE ENLACES (LAG)
# ═══════════════════════════════════════════════════════════════

interface Eth-Trunk1
 description LAG-TO-ROUTER
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 mode active

# ═══════════════════════════════════════════════════════════════
# 7. ENRUTAMIENTO OSPF
# ═══════════════════════════════════════════════════════════════

ospf 1
 router-id 172.16.8.1
 area 0.0.0.0
  network 172.16.8.0 0.0.3.255
  network 172.16.9.0 0.0.0.255
  network 172.16.10.0 0.0.0.255
  network 172.16.11.0 0.0.0.255
  network 172.16.11.0 0.0.0.255

# ═══════════════════════════════════════════════════════════════
# 8. CONFIGURACIÓN DE QoS
# ═══════════════════════════════════════════════════════════════

# Crear clase de tráfico para Voz
traffic classifier VOICE-TRAFFIC operator or
 rule 5 match-dscp ef
 rule 10 match-cos 5

# Crear clase de tráfico para Video
traffic classifier VIDEO-TRAFFIC operator or
 rule 5 match-dscp af41
 rule 10 match-cos 4

# Crear política de tráfico
traffic behavior VOICE-BEHAVIOR
 remark dscp ef
 car cir 30000 cbs 3000

traffic behavior VIDEO-BEHAVIOR
 remark dscp af41
 car cir 20000 cbs 2000

# Crear política QoS
qos policy POLICY-SEDE2
 classifier VOICE-TRAFFIC behavior VOICE-BEHAVIOR
 classifier VIDEO-TRAFFIC behavior VIDEO-BEHAVIOR

# Aplicar política a interfaces
interface Vlanif10
 qos apply policy POLICY-SEDE2 inbound

interface Vlanif20
 qos apply policy POLICY-SEDE2 inbound

# ═══════════════════════════════════════════════════════════════
# 9. LISTAS DE CONTROL DE ACCESO (ACL)
# ═══════════════════════════════════════════════════════════════

acl name ALLOW-INTER-VLAN type ip
 rule 5 permit ip source 172.16.8.0 0.0.3.255 destination 172.16.8.0 0.0.3.255
 rule 10 permit icmp source 172.16.8.0 0.0.3.255 destination 172.16.8.0 0.0.3.255
 rule 20 deny ip source any destination any

# ═══════════════════════════════════════════════════════════════
# 10. SPANNING TREE
# ═══════════════════════════════════════════════════════════════

stp enable
stp mode rstp
stp priority 8192

# ═══════════════════════════════════════════════════════════════
# 11. SNMP Y MONITOREO
# ═══════════════════════════════════════════════════════════════

snmp-agent community read public
snmp-agent community write private
snmp-agent sys-info contact "NetOps Team"
snmp-agent sys-info location "Sede 2 - Campus U"

# ═══════════════════════════════════════════════════════════════
# 12. GUARDAR CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════

save
```

### Configuración de Router Huawei (Sede 2 — WAN)

```huawei
# Configuración de Router Huawei NE40E
# Sede 2: Conexión WAN

sysName R-SEDE2-WAN

# ═══════════════════════════════════════════════════════════════
# 1. INTERFACES
# ═══════════════════════════════════════════════════════════════

interface GigabitEthernet1/0/0
 description LAN-TO-SWITCH-SEDE2
 ip address 172.16.11.254 255.255.252.0
 no shutdown

# Enlace WAN a Sede 1
interface GigabitEthernet1/0/1
 description WAN-TO-SEDE1
 ip address 10.0.1.2 255.255.255.252
 bandwidth 100000
 no shutdown

# Enlace WAN a Sede 3
interface GigabitEthernet1/0/2
 description WAN-TO-SEDE3
 ip address 10.0.3.1 255.255.255.252
 bandwidth 100000
 no shutdown

# ═══════════════════════════════════════════════════════════════
# 2. ENRUTAMIENTO OSPF
# ═══════════════════════════════════════════════════════════════

ospf 1
 router-id 172.16.11.254
 area 0.0.0.0
  network 172.16.8.0 0.0.3.255
  network 10.0.1.0 0.0.0.3
  network 10.0.3.0 0.0.0.3
  bfd all-interfaces enable

# ═══════════════════════════════════════════════════════════════
# 3. CONFIGURACIÓN DE QoS
# ═══════════════════════════════════════════════════════════════

traffic classifier VOICE operator or
 rule 5 match-dscp ef

traffic behavior VOICE-PRIORITY
 remark dscp ef
 car cir 30000 cbs 3000

qos policy QOS-WAN
 classifier VOICE behavior VOICE-PRIORITY

interface GigabitEthernet1/0/1
 qos apply policy QOS-WAN outbound

interface GigabitEthernet1/0/2
 qos apply policy QOS-WAN outbound

# ═══════════════════════════════════════════════════════════════
# 4. GUARDAR CONFIGURACIÓN
# ═══════════════════════════════════════════════════════════════

save
```

---

## JUNIPER JUNOS

### Configuración de Switch Juniper (Sede 3 — AV68)

```juniper
# Configuración de Switch Juniper EX4300
# Sede 3: AV68 (172.16.12.0/23)

system {
    host-name SW-SEDE3-AV68;
    domain-name red-bandaancha.local;
    time-zone America/Bogota;
    root-authentication {
        encrypted-password "[encrypted_password]";
    }
    syslog {
        host 172.16.13.50 {
            any notice;
        }
        file messages {
            any notice;
        }
    }
    snmp {
        community public {
            authorization read-only;
        }
        community private {
            authorization read-write;
        }
        location "Sede 3 - AV68";
        contact "NetOps Team";
    }
}

# ═══════════════════════════════════════════════════════════════
# VLANS
# ═══════════════════════════════════════════════════════════════

vlans {
    VLAN-DATOS {
        vlan-id 10;
        l3-interface vlan.10;
    }
    VLAN-VOZ {
        vlan-id 20;
        l3-interface vlan.20;
    }
    VLAN-CCTV {
        vlan-id 30;
        l3-interface vlan.30;
    }
    VLAN-SERVIDORES {
        vlan-id 40;
        l3-interface vlan.40;
    }
    VLAN-GESTION {
        vlan-id 99;
        l3-interface vlan.99;
    }
}

# ═══════════════════════════════════════════════════════════════
# INTERFACES VIRTUALES (SVI)
# ═══════════════════════════════════════════════════════════════

interfaces {
    vlan {
        unit 10 {
            description "VLAN-DATOS-SEDE3";
            family inet {
                address 172.16.12.1/23;
            }
            family inet6 {
                address fe80::1/64;
            }
        }
        unit 20 {
            description "VLAN-VOZ-SEDE3";
            family inet {
                address 172.16.12.1/24;
            }
        }
        unit 30 {
            description "VLAN-CCTV-SEDE3";
            family inet {
                address 172.16.13.1/24;
            }
        }
        unit 40 {
            description "VLAN-SERVIDORES-SEDE3";
            family inet {
                address 172.16.13.50/24;
            }
        }
        unit 99 {
            description "VLAN-GESTION-SEDE3";
            family inet {
                address 172.16.13.254/24;
            }
        }
    }
    
    # Puertos de acceso
    ge-0/0/0 {
        description "ACCESS-DATOS-1";
        unit 0 {
            family ethernet-switching {
                interface-mode access;
                vlan {
                    members VLAN-DATOS;
                }
            }
        }
    }
    
    ge-0/0/1 {
        description "ACCESS-VOZ-1";
        unit 0 {
            family ethernet-switching {
                interface-mode access;
                vlan {
                    members VLAN-VOZ;
                }
                native-vlan-id 20;
            }
        }
    }
    
    ge-0/0/2 {
        description "ACCESS-CCTV-1";
        unit 0 {
            family ethernet-switching {
                interface-mode access;
                vlan {
                    members VLAN-CCTV;
                }
            }
        }
    }
    
    # Puertos troncales (uplink)
    ge-0/0/46 {
        description "UPLINK-TO-ROUTER-SEDE3";
        unit 0 {
            family ethernet-switching {
                interface-mode trunk;
                vlan {
                    members [VLAN-DATOS VLAN-VOZ VLAN-CCTV VLAN-SERVIDORES VLAN-GESTION];
                }
                native-vlan-id 99;
            }
        }
    }
    
    ge-0/0/47 {
        description "UPLINK-TO-ROUTER-SEDE3-REDUNDANTE";
        unit 0 {
            family ethernet-switching {
                interface-mode trunk;
                vlan {
                    members [VLAN-DATOS VLAN-VOZ VLAN-CCTV VLAN-SERVIDORES VLAN-GESTION];
                }
                native-vlan-id 99;
            }
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# ENRUTAMIENTO OSPF
# ═══════════════════════════════════════════════════════════════

routing-options {
    router-id 172.16.12.1;
    autonomous-system 65003;
}

protocols {
    ospf {
        area 0.0.0.0 {
            interface vlan.10 {
                interface-type broadcast;
            }
            interface vlan.20 {
                interface-type broadcast;
            }
            interface vlan.30 {
                interface-type broadcast;
            }
            interface vlan.40 {
                interface-type broadcast;
            }
            interface vlan.99 {
                interface-type broadcast;
            }
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE QoS
# ═══════════════════════════════════════════════════════════════

class-of-service {
    traffic-control-profiles {
        VOICE-PROFILE {
            scheduler-map VOICE-SCHEDULER;
        }
        VIDEO-PROFILE {
            scheduler-map VIDEO-SCHEDULER;
        }
    }
    schedulers {
        VOICE-SCHEDULER {
            transmit-rate {
                percent 30;
            }
            buffer-size {
                percent 30;
            }
            priority high;
        }
        VIDEO-SCHEDULER {
            transmit-rate {
                percent 25;
            }
            buffer-size {
                percent 25;
            }
            priority medium;
        }
    }
}

# ═══════════════════════════════════════════════════════════════
# SPANNING TREE
# ═══════════════════════════════════════════════════════════════

protocols {
    rstp {
        interface all {
            edge;
        }
        bridge-priority 8k;
    }
}
```

---

## ARISTA EOS

### Configuración de Switch Arista (Alternativa moderna)

```arista
! Configuración de Switch Arista DCS-7050SX3
! Sede 1: Alternativa moderna a Cisco

hostname SW-SEDE1-ARISTA
ip domain-name red-bandaancha.local

! ═══════════════════════════════════════════════════════════════
! VLANS
! ═══════════════════════════════════════════════════════════════

vlan 10
   name VLAN-DATOS
vlan 20
   name VLAN-VOZ
vlan 30
   name VLAN-CCTV
vlan 40
   name VLAN-SERVIDORES
vlan 99
   name VLAN-GESTION

! ═══════════════════════════════════════════════════════════════
! INTERFACES VIRTUALES
! ═══════════════════════════════════════════════════════════════

interface Vlan10
   description VLAN-DATOS-SEDE1
   ip address 172.16.0.1/21
   ip helper-address 172.16.0.50

interface Vlan20
   description VLAN-VOZ-SEDE1
   ip address 172.16.1.1/24
   ip helper-address 172.16.1.50

interface Vlan30
   description VLAN-CCTV-SEDE1
   ip address 172.16.2.1/24

interface Vlan40
   description VLAN-SERVIDORES-SEDE1
   ip address 172.16.3.1/24

interface Vlan99
   description VLAN-GESTION-SEDE1
   ip address 172.16.7.1/24

! ═══════════════════════════════════════════════════════════════
! PUERTOS DE ACCESO
! ═══════════════════════════════════════════════════════════════

interface Ethernet1-24
   description ACCESS-DATOS
   switchport access vlan 10
   switchport mode access
   spanning-tree portfast

interface Ethernet25-32
   description ACCESS-VOZ
   switchport access vlan 20
   switchport mode access
   spanning-tree portfast

interface Ethernet33-40
   description ACCESS-CCTV
   switchport access vlan 30
   switchport mode access
   spanning-tree portfast

! ═══════════════════════════════════════════════════════════════
! PUERTOS TRONCALES
! ═══════════════════════════════════════════════════════════════

interface Ethernet47-48
   description UPLINK-TO-ROUTER
   switchport trunk allowed vlan 10,20,30,40,99
   switchport mode trunk
   channel-group 1 mode active

! ═══════════════════════════════════════════════════════════════
! ENRUTAMIENTO OSPF
! ═══════════════════════════════════════════════════════════════

router ospf 1
   router-id 172.16.0.1
   network 172.16.0.0/21 area 0
   network 172.16.1.0/24 area 0
   network 172.16.2.0/24 area 0
   network 172.16.3.0/24 area 0
   network 172.16.7.0/24 area 0

! ═══════════════════════════════════════════════════════════════
! QoS
! ═══════════════════════════════════════════════════════════════

queue-monitor length
queue-monitor length default 5

class-map match-any VOICE
   match dscp ef

class-map match-any VIDEO
   match dscp af41

policy-map QOS-POLICY
   class VOICE
      priority 30
   class VIDEO
      bandwidth 20
   class class-default
      bandwidth 40

interface Vlan10
   service-policy output QOS-POLICY

interface Vlan20
   service-policy output QOS-POLICY

interface Vlan30
   service-policy output QOS-POLICY

! ═══════════════════════════════════════════════════════════════
! MONITOREO
! ═══════════════════════════════════════════════════════════════

snmp-server community public ro
snmp-server community private rw
snmp-server location "Sede 1 - Teusaquillo"
snmp-server contact "NetOps Team"

! ═══════════════════════════════════════════════════════════════
! GUARDAR CONFIGURACIÓN
! ═══════════════════════════════════════════════════════════════

end
write memory
```

---

## Resumen de Configuraciones

| Fabricante | Modelo | Sede | Tipo | Características |
|---|---|---|---|---|
| **Cisco** | Catalyst 3650/9300 | 1 | Switch L3 | IOS, OSPF, QoS avanzado |
| **Cisco** | ISR 4331 / ASR 900 | 1 | Router WAN | BGP, MPLS, NAT |
| **Huawei** | CloudEngine 6800 | 2 | Switch L3 | VRP, OSPF, LAG |
| **Huawei** | NE40E | 2 | Router WAN | BGP, MPLS VPN |
| **Juniper** | EX4300 | 3 | Switch L3 | Junos, OSPF, CoS |
| **Arista** | DCS-7050SX3 | 1 | Switch L3 | EOS, OSPF, QoS |

---

## Notas Importantes

1. **Reemplazar contraseñas**: Todas las contraseñas mostradas son placeholders. Usar contraseñas fuertes en producción.
2. **Direcciones IP**: Adaptar las direcciones IP según el esquema VLSM propuesto.
3. **Protocolos de enrutamiento**: OSPF es el protocolo recomendado para redes internas. BGP se usa para multi-ISP.
4. **QoS**: Las políticas de QoS deben ajustarse según el ancho de banda real de los enlaces.
5. **Seguridad**: Implementar ACLs, SSH, SNMP v3 en producción.
6. **Monitoreo**: Usar herramientas como Nagios, Zabbix o Prometheus para monitoreo continuo.
