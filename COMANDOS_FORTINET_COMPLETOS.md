# Comandos Completos Fortinet FortiGate - Sede 1 Teusaquillo

## Instrucciones de Aplicación

1. Conectarse al firewall por SSH o consola
2. Ingresar el modo de configuración
3. Copiar y pegar cada sección de comandos
4. Al finalizar, ejecutar `end` y `config system global` para guardar

---

## 1. ACCESO INICIAL

```
config system global
```

---

## 2. CONFIGURACIÓN DEL SISTEMA

```
config system global
 set hostname FW-SEDE1-TEUSAQUILLO
 set timezone UTC
 set ntp-server 172.16.0.254
 set ntp-status enable
 set admintimeout 60
 set language english
end
```

**Descripción:** Establece nombre del firewall, zona horaria, NTP y configuración general.

---

## 3. CONFIGURACIÓN DE INTERFACES

```
config system interface
 edit "port1"
  set vdom "root"
  set ip 172.16.0.1 255.255.255.0
  set description "LAN-DATOS"
  set type physical
  set status up
 next
 edit "port2"
  set vdom "root"
  set ip 172.16.1.1 255.255.255.0
  set description "LAN-VOZ"
  set type physical
  set status up
 next
 edit "port3"
  set vdom "root"
  set ip 172.16.2.1 255.255.255.0
  set description "LAN-CCTV"
  set type physical
  set status up
 next
 edit "port4"
  set vdom "root"
  set ip 172.16.3.1 255.255.255.0
  set description "LAN-SERVIDORES"
  set type physical
  set status up
 next
 edit "port5"
  set vdom "root"
  set ip 172.16.0.1 255.255.255.0
  set description "MGMT-GESTION"
  set type physical
  set status up
 next
end
```

**Descripción:** Configura 5 interfaces físicas para cada VLAN.

---

## 4. CONFIGURACIÓN DE ZONAS DE SEGURIDAD

```
config system zone
 edit "LAN-DATOS"
  set interface "port1"
 next
 edit "LAN-VOZ"
  set interface "port2"
 next
 edit "LAN-CCTV"
  set interface "port3"
 next
 edit "LAN-SERVIDORES"
  set interface "port4"
 next
 edit "MGMT-GESTION"
  set interface "port5"
 next
end
```

**Descripción:** Agrupa interfaces en zonas de seguridad.

---

## 5. CONFIGURACIÓN DE DIRECCIONAMIENTO ESTÁTICO

```
config router static
 edit 1
  set destination 172.16.0.0 255.255.248.0
  set gateway 172.16.0.254
  set device "port1"
 next
 edit 2
  set destination 172.16.8.0 255.255.252.0
  set gateway 172.16.0.254
  set device "port1"
 next
 edit 3
  set destination 172.16.12.0 255.255.254.0
  set gateway 172.16.0.254
  set device "port1"
 next
end
```

**Descripción:** Configura rutas estáticas hacia las otras sedes.

---

## 6. CONFIGURACIÓN DE POLÍTICAS DE FIREWALL

```
config firewall policy
 edit 1
  set name "LAN-DATOS-TO-SERVIDORES"
  set srcintf "port1"
  set dstintf "port4"
  set srcaddr "all"
  set dstaddr "all"
  set action accept
  set schedule "always"
  set service "ALL"
  set logtraffic enable
 next
 edit 2
  set name "LAN-VOZ-TO-SERVIDORES"
  set srcintf "port2"
  set dstintf "port4"
  set srcaddr "all"
  set dstaddr "all"
  set action accept
  set schedule "always"
  set service "ALL"
  set logtraffic enable
 next
 edit 3
  set name "LAN-CCTV-TO-SERVIDORES"
  set srcintf "port3"
  set dstintf "port4"
  set srcaddr "all"
  set dstaddr "all"
  set action accept
  set schedule "always"
  set service "ALL"
  set logtraffic enable
 next
 edit 4
  set name "DENY-INTER-VLAN-DATOS-VOZ"
  set srcintf "port1"
  set dstintf "port2"
  set srcaddr "all"
  set dstaddr "all"
  set action deny
  set schedule "always"
  set logtraffic enable
 next
end
```

**Descripción:** Define políticas de firewall entre VLANs.

---

## 7. CONFIGURACIÓN DE OBJETOS DE DIRECCIÓN

```
config firewall address
 edit "SUBNET-DATOS"
  set subnet 172.16.0.0 255.255.255.0
  set comment "VLAN DATOS"
 next
 edit "SUBNET-VOZ"
  set subnet 172.16.1.0 255.255.255.0
  set comment "VLAN VOZ"
 next
 edit "SUBNET-CCTV"
  set subnet 172.16.2.0 255.255.255.0
  set comment "VLAN CCTV"
 next
 edit "SUBNET-SERVIDORES"
  set subnet 172.16.3.0 255.255.255.0
  set comment "VLAN SERVIDORES"
 next
 edit "RED-TOTAL"
  set subnet 172.16.0.0 255.255.248.0
  set comment "Red Total Sede 1"
 next
end
```

**Descripción:** Define objetos de dirección para las subredes.

---

## 8. CONFIGURACIÓN DE SERVICIOS PERSONALIZADOS

```
config firewall service custom
 edit "SIP"
  set tcp-portrange 5060
  set udp-portrange 5060
 next
 edit "RTP"
  set udp-portrange 16384:32767
 next
 edit "RTSP"
  set tcp-portrange 554
 next
end
```

**Descripción:** Define servicios personalizados para voz y video.

---

## 9. CONFIGURACIÓN DE CALIDAD DE SERVICIO (QoS)

```
config firewall shaper
 edit "VOZ-SHAPER"
  set guaranteed-bandwidth 1000
  set maximum-bandwidth 2000
 next
 edit "CCTV-SHAPER"
  set guaranteed-bandwidth 500
  set maximum-bandwidth 1000
 next
end

config firewall traffic-shaper
 edit "VOZ-POLICY"
  set traffic-shaper "VOZ-SHAPER"
  set srcaddr "SUBNET-VOZ"
  set dstaddr "SUBNET-SERVIDORES"
 next
 edit "CCTV-POLICY"
  set traffic-shaper "CCTV-SHAPER"
  set srcaddr "SUBNET-CCTV"
  set dstaddr "SUBNET-SERVIDORES"
 next
end
```

**Descripción:** Implementa QoS para garantizar ancho de banda a voz y video.

---

## 10. CONFIGURACIÓN DE DHCP

```
config system dhcp server
 edit 1
  set interface "port1"
  set lease-time 86400
  set netmask 255.255.255.0
  set gateway 172.16.0.1
  set dns-server1 8.8.8.8
  set dns-server2 8.8.4.4
  config ip-range
   edit 1
    set start-ip 172.16.0.100
    set end-ip 172.16.0.200
   next
  end
 next
 edit 2
  set interface "port2"
  set lease-time 86400
  set netmask 255.255.255.0
  set gateway 172.16.1.1
  config ip-range
   edit 1
    set start-ip 172.16.1.100
    set end-ip 172.16.1.200
   next
  end
 next
end
```

**Descripción:** Configura servidores DHCP para asignación automática de IPs.

---

## 11. CONFIGURACIÓN DE LOGGING Y MONITOREO

```
config log syslogd setting
 set status enable
 set server 172.16.0.254
 set port 514
 set facility local7
end

config log setting
 set log-invalid-packet enable
 set log-policy-verdict enable
 set log-forward-traffic enable
end

config system syslog
 edit 1
  set status enable
  set server 172.16.0.254
  set port 514
  set facility local7
 next
end
```

**Descripción:** Configura syslog para enviar logs a servidor centralizado.

---

## 12. CONFIGURACIÓN DE SNMP

```
config system snmp community
 edit 1
  set name "public"
  set status enable
  set hosts 172.16.0.254
  set query-v1-status enable
  set query-v2c-status enable
 next
 edit 2
  set name "private"
  set status enable
  set hosts 172.16.0.254
  set query-v1-status enable
  set query-v2c-status enable
 next
end
```

**Descripción:** Habilita SNMP para monitoreo remoto.

---

## 13. CONFIGURACIÓN DE ENRUTAMIENTO DINÁMICO (OSPF)

```
config router ospf
 set router-id 172.16.0.254
 config area
  edit 0.0.0.0
  next
 end
 config ospf-interface
  edit "port1"
   set interface "port1"
   set area 0.0.0.0
  next
  edit "port2"
   set interface "port2"
   set area 0.0.0.0
  next
 end
end
```

**Descripción:** Configura OSPF para enrutamiento dinámico entre sedes.

---

## 14. CONFIGURACIÓN DE SEGURIDAD AVANZADA

```
config firewall DoS-policy
 edit 1
  set interface "port1"
  set srcaddr "all"
  set dstaddr "all"
  set service "ALL"
  set anomaly enable
 next
end

config firewall ssl-ssh-profile
 edit "certificate-inspection"
  set servers "enable"
  set allow-invalid-certificate enable
 next
end
```

**Descripción:** Implementa protección contra ataques DoS.

---

## 15. GUARDAR CONFIGURACIÓN

```
end
execute backup config
```

**Descripción:** Guarda la configuración en memoria.

---

## VERIFICACIÓN DE CONFIGURACIÓN

Después de aplicar los comandos, verificar con:

```
get system interface
get router info routing-table all
get firewall policy
get system dhcp server
diagnose sys logdisk usage
```

---

## TABLA DE DIRECCIONAMIENTO VLSM - SEDE 1

| Interfaz | Nombre | Dirección IP | Máscara | Descripción |
|----------|--------|--------------|---------|-------------|
| port1 | LAN-DATOS | 172.16.0.1 | 255.255.255.0 | Datos |
| port2 | LAN-VOZ | 172.16.1.1 | 255.255.255.0 | Voz |
| port3 | LAN-CCTV | 172.16.2.1 | 255.255.255.0 | CCTV |
| port4 | LAN-SERVIDORES | 172.16.3.1 | 255.255.255.0 | Servidores |
| port5 | MGMT-GESTION | 172.16.0.1 | 255.255.255.0 | Gestión |

---

## NOTAS IMPORTANTES

1. **Sintaxis FortiGate:** Usar `end` para salir de cada contexto
2. **Políticas:** Revisar y ajustar según requerimientos de seguridad
3. **Certificados:** Implementar SSL/TLS para inspección de tráfico cifrado
4. **Backup:** Realizar backups regularmente de la configuración
5. **Licencias:** Verificar licencias activas para funcionalidades avanzadas
6. **Redundancia:** Considerar implementar HA (High Availability)

---

## COMANDOS DE TROUBLESHOOTING

```
# Ver interfaces
get system interface

# Ver tabla de enrutamiento
get router info routing-table all

# Ver políticas de firewall
get firewall policy

# Ver estadísticas de DHCP
get system dhcp server

# Ver logs
execute log display

# Ver estado del sistema
get system status
```
