# Configuraciones Fortinet FortiGate — Red Banda Ancha Bogotá

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Modelos Recomendados](#modelos-recomendados)
3. [Configuración Básica](#configuración-básica)
4. [Configuración de Interfaces](#configuración-de-interfaces)
5. [Políticas de Firewall](#políticas-de-firewall)
6. [VPN Sitio a Sitio](#vpn-sitio-a-sitio)
7. [Redundancia HA](#redundancia-ha)
8. [QoS y Ancho de Banda](#qos-y-ancho-de-banda)
9. [Seguridad Avanzada](#seguridad-avanzada)
10. [Monitoreo y Logs](#monitoreo-y-logs)

---

## Introducción

Fortinet FortiGate es una solución de firewall empresarial que proporciona:

- **Inspección profunda de paquetes (DPI)**
- **Prevención de intrusiones (IPS)**
- **Antivirus integrado**
- **Control de aplicaciones**
- **VPN de alto rendimiento**
- **Redundancia HA (High Availability)**

Para la red banda ancha de Bogotá, se recomienda:
- **Sede 1:** FortiGate 3100D (Modelo de alto rendimiento)
- **Sede 2:** FortiGate 1500D (Modelo de rendimiento medio)
- **Sede 3:** FortiGate 600D (Modelo de entrada)

---

## Modelos Recomendados

### FortiGate 3100D (Sede 1 - Teusaquillo)

| Especificación | Valor |
|---|---|
| **Throughput** | 100 Gbps |
| **Conexiones Concurrentes** | 10 millones |
| **Puertos** | 8 x 10GE + 16 x 1GE |
| **Memoria RAM** | 32 GB |
| **Almacenamiento** | 1 TB SSD |
| **Redundancia** | Dual PSU, Dual Fan |
| **Funciones** | IPS, AV, DLP, VPN, SSL Inspection |
| **Precio** | $35,000 USD |

### FortiGate 1500D (Sede 2 - Campus U)

| Especificación | Valor |
|---|---|
| **Throughput** | 50 Gbps |
| **Conexiones Concurrentes** | 5 millones |
| **Puertos** | 4 x 10GE + 8 x 1GE |
| **Memoria RAM** | 16 GB |
| **Almacenamiento** | 512 GB SSD |
| **Redundancia** | Dual PSU |
| **Precio** | $18,000 USD |

### FortiGate 600D (Sede 3 - AV68)

| Especificación | Valor |
|---|---|
| **Throughput** | 20 Gbps |
| **Conexiones Concurrentes** | 2 millones |
| **Puertos** | 2 x 10GE + 4 x 1GE |
| **Memoria RAM** | 8 GB |
| **Almacenamiento** | 256 GB SSD |
| **Precio** | $8,000 USD |

---

## Configuración Básica

### 1. Acceso Inicial

**Conexión por consola:**
```
Dirección IP por defecto: 192.168.1.99
Usuario: admin
Contraseña: (vacío, presionar Enter)
Puerto: MGMT (Management)
```

**Cambiar contraseña de administrador:**
```
config system admin
    edit admin
        set password <nueva_contraseña>
    next
end
```

### 2. Configuración Inicial del Sistema

```
config system global
    set hostname FG-SEDE1-TEUS
    set timezone America/Bogota
    set admintimeout 60
    set language spanish
end

config system ntp
    set ntpsync enable
    set type fortiguard
    set ntpserver 200.3.97.17
end

config system syslog
    set status enable
    set facility local7
    set server 172.16.15.50
    set port 514
end

config system snmp community
    edit 1
        set name public
        set status enable
        set hosts 172.16.15.50
    next
end
```

**Explicación:**
- `hostname`: Nombre del firewall para identificación
- `timezone`: Zona horaria local (Bogotá es UTC-5)
- `admintimeout`: Tiempo de sesión de administrador (60 minutos)
- `language`: Idioma de la interfaz
- `ntpsync`: Sincronización de hora con servidor NTP
- `syslog`: Envío de logs a servidor centralizado
- `snmp community`: Acceso SNMP para monitoreo

### 3. Licencias y Actualizaciones

```
execute update-now
execute update check
execute update-check
```

**Verificar licencias:**
```
show system license
diagnose license list
```

---

## Configuración de Interfaces

### 1. Interfaz WAN (Internet)

```
config system interface
    edit port1
        set vdom root
        set type physical
        set alias WAN-ISP1
        set description "Enlace Internet ISP Primario"
        set ip 200.1.1.2 255.255.255.0
        set allowaccess ping https ssh
        set mtu 1500
        set speed auto
        set duplex auto
    next
end
```

**Explicación:**
- `port1`: Primera interfaz física
- `alias`: Nombre descriptivo
- `ip`: Dirección IP pública del ISP
- `allowaccess`: Protocolos permitidos para administración
- `mtu`: Tamaño máximo de paquete

### 2. Interfaz LAN (Red Interna)

```
config system interface
    edit port2
        set vdom root
        set type physical
        set alias LAN-INTERNO
        set description "Enlace a Switch L3 Sede 1"
        set ip 172.16.0.2 255.255.248.0
        set allowaccess ping https ssh
        set mtu 1500
    next
end
```

### 3. Interfaz DMZ (Zona Desmilitarizada)

```
config system interface
    edit port3
        set vdom root
        set type physical
        set alias DMZ
        set description "Zona Desmilitarizada"
        set ip 192.168.100.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

### 4. Interfaz de Respaldo WAN

```
config system interface
    edit port4
        set vdom root
        set type physical
        set alias WAN-ISP2
        set description "Enlace Internet ISP Respaldo"
        set ip 200.2.2.2 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

### 5. Interfaz para Enlace WAN (Hacia otras sedes)

```
config system interface
    edit port5
        set vdom root
        set type physical
        set alias WAN-SITIO-A-SITIO
        set description "Enlace Fibra hacia Sede 2"
        set ip 10.0.1.1 255.255.255.0
        set allowaccess ping https ssh
    next
end
```

---

## Políticas de Firewall

### 1. Política de Salida Permitida (LAN → Internet)

```
config firewall policy
    edit 1
        set name "LAN-to-Internet"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set schedule always
        set service HTTP HTTPS DNS
        set logtraffic all
        set nat enable
    next
end
```

**Explicación:**
- `srcintf`: Interfaz origen (LAN interna)
- `dstintf`: Interfaz destino (WAN/Internet)
- `action accept`: Permitir tráfico
- `nat enable`: Traducción de direcciones (NAT)
- `logtraffic all`: Registrar todo el tráfico

### 2. Política de Entrada Bloqueada (Internet → LAN)

```
config firewall policy
    edit 2
        set name "Internet-to-LAN-DENY"
        set srcintf port1
        set dstintf port2
        set srcaddr all
        set dstaddr all
        set action deny
        set schedule always
        set logtraffic all
    next
end
```

**Explicación:**
- Bloquea por defecto todo tráfico desde Internet hacia LAN
- Solo se permiten conexiones iniciadas desde LAN

### 3. Política DMZ (Internet → DMZ)

```
config firewall policy
    edit 3
        set name "Internet-to-DMZ"
        set srcintf port1
        set dstintf port3
        set srcaddr all
        set dstaddr "DMZ-Servers"
        set action accept
        set schedule always
        set service HTTP HTTPS
        set logtraffic all
    next
end
```

### 4. Política LAN → DMZ (Acceso a Servidores)

```
config firewall policy
    edit 4
        set name "LAN-to-DMZ"
        set srcintf port2
        set dstintf port3
        set srcaddr all
        set dstaddr "DMZ-Servers"
        set action accept
        set schedule always
        set service HTTP HTTPS SSH
        set logtraffic all
    next
end
```

### 5. Política DMZ → LAN (Bloqueada)

```
config firewall policy
    edit 5
        set name "DMZ-to-LAN-DENY"
        set srcintf port3
        set dstintf port2
        set srcaddr all
        set dstaddr all
        set action deny
        set schedule always
        set logtraffic all
    next
end
```

**Explicación:**
- Protege la LAN contra compromisos en la DMZ
- Aislamiento de seguridad

### 6. Política de Tráfico entre Sedes (VPN)

```
config firewall policy
    edit 6
        set name "Sede1-to-Sede2-VPN"
        set srcintf port2
        set dstintf "VPN-SEDE2"
        set srcaddr "VLAN-DATOS-SEDE1"
        set dstaddr "VLAN-DATOS-SEDE2"
        set action accept
        set schedule always
        set service ALL
        set logtraffic all
    next
end
```

---

## VPN Sitio a Sitio

### 1. Configuración de VPN IPSec (Sede 1 → Sede 2)

```
config vpn ipsec phase1-interface
    edit "VPN-SEDE2"
        set interface port5
        set ike-version 2
        set peertype any
        set peer 200.2.2.2
        set net-device disable
        set proposal aes128-sha256 aes256-sha384
        set comments "VPN IPSec Sede 1 a Sede 2"
        set wizard-type custom
        set psksecret <contraseña_preshared_key>
        set dpd on-demand
    next
end

config vpn ipsec phase2-interface
    edit "VPN-SEDE2-P2"
        set phase1name "VPN-SEDE2"
        set proposal aes128-sha256 aes256-sha384
        set pfs enable
        set replay enable
        set keepalive enable
        set comments "Phase 2 VPN Sede 2"
    next
end
```

**Explicación:**
- `phase1-interface`: Negociación de clave IKE
- `phase2-interface`: Encriptación de datos
- `ike-version 2`: Versión IKE más segura
- `proposal`: Algoritmos de encriptación
- `pfs enable`: Perfect Forward Secrecy (seguridad adicional)
- `dpd on-demand`: Detección de pares muertos

### 2. Configuración de VPN SSL (Acceso Remoto)

```
config vpn ssl settings
    set port 443
    set tunnel-ip-pools "SSL-VPN-POOL"
    set tunnel-ipv6-pools "SSL-VPN-POOL-IPV6"
    set dns-server1 8.8.8.8
    set dns-server2 8.8.4.4
    set default-portal full-access
end

config vpn ssl web portal
    edit "full-access"
        set tunnel-mode enable
        set web-mode enable
        set homepage "https://172.16.0.1"
    next
end
```

---

## Redundancia HA

### 1. Configuración HA Activo-Pasivo (Sede 1)

**FortiGate 3100D Primario:**
```
config system ha
    set mode a-p
    set group-name "HA-SEDE1"
    set priority 100
    set hbdev "port6" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set ha-mgmt-status enable
    set ha-mgmt-interfaces
        edit 1
            set interface port7
            set gateway 192.168.200.1
        next
    end
    set override enable
    set cpu-threshold 80
    set memory-threshold 80
end
```

**FortiGate 3100D Secundario:**
```
config system ha
    set mode a-p
    set group-name "HA-SEDE1"
    set priority 50
    set hbdev "port6" 50
    set session-pickup enable
    set session-pickup-connectionless enable
    set ha-mgmt-status enable
    set ha-mgmt-interfaces
        edit 1
            set interface port7
            set gateway 192.168.200.1
        next
    end
    set override disable
end
```

**Explicación:**
- `mode a-p`: Activo-Pasivo (uno activo, uno en espera)
- `priority`: Prioridad (100 = primario, 50 = secundario)
- `hbdev`: Puerto de heartbeat (latido)
- `session-pickup`: Sincronización de sesiones
- `override enable`: Permite que el primario tome control

### 2. Sincronización de Configuración HA

```
config system ha
    set sync-config enable
    set sync-packet-balance enable
end
```

---

## QoS y Ancho de Banda

### 1. Definición de Clases de Tráfico

```
config firewall service custom
    edit "VOIP"
        set category "VoIP"
        set protocol TCP/UDP/SCTP
        set tcp-portrange 5060 5061
        set udp-portrange 5004 5005
    next
    edit "VIDEO"
        set category "Multimedia"
        set protocol TCP/UDP
        set tcp-portrange 1935
        set udp-portrange 1935
    next
end
```

### 2. Configuración de QoS

```
config firewall shaper traffic-shaper
    edit "VOIP-SHAPER"
        set guaranteed-bandwidth 300
        set maximum-bandwidth 500
        set priority high
        set per-policy disable
    next
    edit "VIDEO-SHAPER"
        set guaranteed-bandwidth 4000
        set maximum-bandwidth 6000
        set priority medium
    next
    edit "DATA-SHAPER"
        set guaranteed-bandwidth 0
        set maximum-bandwidth 0
        set priority low
    next
end
```

### 3. Aplicar QoS a Políticas

```
config firewall policy
    edit 10
        set name "VOIP-QoS"
        set srcintf port2
        set dstintf port1
        set srcaddr "VLAN-VOZ"
        set dstaddr all
        set action accept
        set schedule always
        set service VOIP
        set traffic-shaper "VOIP-SHAPER"
        set traffic-shaper-reverse "VOIP-SHAPER"
        set logtraffic all
    next
end
```

**Explicación:**
- `guaranteed-bandwidth`: Ancho de banda mínimo garantizado (Kbps)
- `maximum-bandwidth`: Ancho de banda máximo permitido
- `priority`: Prioridad de la clase (high/medium/low)

---

## Seguridad Avanzada

### 1. Inspección Profunda de Paquetes (DPI)

```
config firewall policy
    edit 11
        set name "LAN-Internet-DPI"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set schedule always
        set service all
        set inspection-mode deep
        set av-profile "default"
        set ips-sensor "default"
        set ssl-ssh-profile "certificate-inspection"
        set logtraffic all
    next
end
```

### 2. Prevención de Intrusiones (IPS)

```
config ips sensor
    edit "CUSTOM-IPS"
        set comment "Sensor IPS personalizado"
        set override-signature-severity enable
        set override-anomaly-severity enable
    next
end

config firewall policy
    edit 12
        set name "IPS-Protection"
        set srcintf port1
        set dstintf port2
        set srcaddr all
        set dstaddr all
        set action accept
        set schedule always
        set ips-sensor "CUSTOM-IPS"
        set logtraffic all
    next
end
```

### 3. Antivirus

```
config antivirus profile
    edit "CUSTOM-AV"
        set comment "Perfil antivirus personalizado"
        set http
            set options scan
        end
        set ftp
            set options scan
        end
        set smtp
            set options scan
        end
    next
end

config firewall policy
    edit 13
        set name "Antivirus-Protection"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set av-profile "CUSTOM-AV"
        set logtraffic all
    next
end
```

### 4. Control de Aplicaciones

```
config application list
    edit "CUSTOM-APP-CONTROL"
        set comment "Control de aplicaciones personalizado"
        set app-replacemsg enable
        set other-application-action block
        set unknown-application-action block
    next
end

config firewall policy
    edit 14
        set name "App-Control"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set application-list "CUSTOM-APP-CONTROL"
        set logtraffic all
    next
end
```

### 5. Prevención de Pérdida de Datos (DLP)

```
config dlp sensor
    edit "CUSTOM-DLP"
        set comment "Sensor DLP personalizado"
        set feature-set proxy
        set dlp-log enable
    next
end

config firewall policy
    edit 15
        set name "DLP-Protection"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set dlp-sensor "CUSTOM-DLP"
        set logtraffic all
    next
end
```

### 6. Filtrado de Contenido Web

```
config webfilter profile
    edit "CUSTOM-WEBFILTER"
        set comment "Perfil de filtrado web personalizado"
        set web-content-log enable
        set ftgd-wf
            set options error-allow
            set category 1 2 3 4 5
        end
    next
end

config firewall policy
    edit 16
        set name "Web-Filter"
        set srcintf port2
        set dstintf port1
        set srcaddr all
        set dstaddr all
        set action accept
        set webfilter-profile "CUSTOM-WEBFILTER"
        set logtraffic all
    next
end
```

---

## Monitoreo y Logs

### 1. Configuración de Logging

```
config log syslogd setting
    set status enable
    set server 172.16.15.50
    set port 514
    set facility local7
    set source-ip 172.16.0.2
end

config log syslogd filter
    edit 1
        set forward-traffic enable
        set local-traffic enable
        set sniffer-traffic enable
        set anomaly enable
        set netscan-detection enable
        set severity information
    next
end
```

### 2. Almacenamiento Local de Logs

```
config log disk setting
    set status enable
    set diskquota 1024
    set report-quota 100
    set maximum-log-age 7
end
```

### 3. Alertas por Email

```
config alertemail setting
    set smtp-server 172.16.14.10
    set from-address "firewall@red-banda-ancha.com"
    set to-address "noc@red-banda-ancha.com"
end

config alertemail recipient
    edit 1
        set type admin
        set address "admin@red-banda-ancha.com"
    next
    edit 2
        set type custom
        set address "noc@red-banda-ancha.com"
    next
end
```

### 4. Monitoreo de Rendimiento

```
config system performance
    set cpu-use-threshold 80
    set memory-use-threshold 85
    set disk-use-threshold 90
end

config system performance-tuning
    set cpu-use-threshold 80
    set memory-use-threshold 85
end
```

### 5. Verificación de Logs

```
# Ver logs en tiempo real
diagnose debug flow trace start 100

# Ver estadísticas de firewall
get system performance status

# Ver conexiones activas
diagnose sys top

# Ver políticas activas
show firewall policy

# Ver interfaces
show system interface
```

---

## Comandos Útiles de Troubleshooting

### 1. Verificar Estado del Firewall

```
# Estado general
get system status

# Información de licencia
show system license

# Estadísticas de interfaces
diagnose hardware sysinfo all

# Uso de CPU y memoria
get system performance status
```

### 2. Verificar Conectividad

```
# Ping a un host
execute ping 8.8.8.8

# Traceroute
execute traceroute 8.8.8.8

# Ver tabla de ruteo
get router info routing-table all

# Ver vecinos OSPF (si está configurado)
get router ospf neighbor
```

### 3. Verificar VPN

```
# Estado de VPN IPSec
show vpn ipsec phase1-interface

# Estadísticas de VPN
diagnose vpn ipsec status

# Ver sesiones VPN SSL
show vpn ssl web session
```

### 4. Verificar Políticas de Firewall

```
# Listar todas las políticas
show firewall policy

# Ver política específica
show firewall policy 1

# Ver estadísticas de política
diagnose firewall iprope list

# Ver conexiones activas
diagnose sys top
```

### 5. Verificar HA

```
# Estado de HA
get system ha status

# Información de sincronización
diagnose sys ha status

# Ver heartbeat
diagnose sys ha heartbeat
```

---

## Configuración de Respaldo y Restauración

### 1. Crear Respaldo de Configuración

```
# Vía CLI
execute backup full-config tftp 172.16.15.50 backup-sede1.conf

# Vía WebUI
System > Configuration > Backup
```

### 2. Restaurar Configuración

```
# Vía CLI
execute restore full-config tftp 172.16.15.50 backup-sede1.conf

# Vía WebUI
System > Configuration > Restore
```

---

## Matriz de Puertos Recomendada

| Puerto | Función | Configuración |
|---|---|---|
| **port1** | WAN ISP Primario | 200.1.1.2/24 |
| **port2** | LAN Interna | 172.16.0.2/21 |
| **port3** | DMZ | 192.168.100.1/24 |
| **port4** | WAN ISP Respaldo | 200.2.2.2/24 |
| **port5** | Enlace WAN Sitio-a-Sitio | 10.0.1.1/24 |
| **port6** | HA Heartbeat | Sin IP |
| **port7** | Gestión HA | 192.168.200.2/24 |
| **port8** | Disponible | — |

---

## Checklist de Implementación

- [ ] Acceso inicial y cambio de contraseña
- [ ] Configuración de zona horaria y NTP
- [ ] Configuración de interfaces (WAN, LAN, DMZ)
- [ ] Configuración de políticas de firewall
- [ ] Configuración de VPN IPSec
- [ ] Configuración de HA (si aplica)
- [ ] Configuración de QoS
- [ ] Habilitación de IPS/AV/DLP
- [ ] Configuración de logging
- [ ] Pruebas de conectividad
- [ ] Respaldo de configuración
- [ ] Documentación de cambios

---

## Mejores Prácticas

1. **Seguridad:**
   - Cambiar contraseña de admin regularmente
   - Usar HTTPS para administración
   - Limitar acceso administrativo por IP
   - Habilitar MFA (Multi-Factor Authentication)

2. **Rendimiento:**
   - Monitorear CPU y memoria
   - Ajustar tamaño de caché
   - Optimizar políticas de firewall
   - Usar hardware aceleración

3. **Disponibilidad:**
   - Implementar HA en sedes críticas
   - Realizar respaldos regulares
   - Probar restauración periódicamente
   - Mantener redundancia de ISP

4. **Mantenimiento:**
   - Actualizar firmware regularmente
   - Revisar logs semanalmente
   - Realizar auditorías de seguridad
   - Documentar cambios

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha
