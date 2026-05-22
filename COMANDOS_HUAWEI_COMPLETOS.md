# Comandos Completos Huawei VRP - Sede 1 Teusaquillo

## Instrucciones de Aplicación

1. Conectarse al switch por SSH o consola
2. Ingresar el modo de sistema con `system-view`
3. Copiar y pegar cada sección de comandos
4. Al finalizar, ejecutar `save` para guardar la configuración

---

## 1. ACCESO INICIAL

```
system-view
```

---

## 2. CONFIGURACIÓN DEL SISTEMA

```
sysName SW-SEDE1-TEUSAQUILLO
snmp-agent sys-info version all
snmp-agent community read public
snmp-agent community write private
clock timezone UTC add 00:00:00
ntp-service unicast-server 172.16.0.254 preference
save
```

**Descripción:** Establece el nombre del dispositivo, SNMP, zona horaria y sincronización NTP.

---

## 3. CONFIGURACIÓN DE VLANs

```
vlan batch 10 20 30 40 99
interface Vlan-interface 10
 description VLAN-DATOS-SEDE1
 ip address 172.16.0.1 255.255.255.0
 quit
interface Vlan-interface 20
 description VLAN-VOZ-SEDE1
 ip address 172.16.1.1 255.255.255.0
 quit
interface Vlan-interface 30
 description VLAN-CCTV-SEDE1
 ip address 172.16.2.1 255.255.255.0
 quit
interface Vlan-interface 40
 description VLAN-SERVIDORES-SEDE1
 ip address 172.16.3.1 255.255.255.0
 quit
interface Vlan-interface 99
 description VLAN-GESTION-SEDE1
 ip address 172.16.0.1 255.255.255.0
 quit
```

**Descripción:** Crea 5 VLANs con sus interfaces virtuales y direcciones IP según VLSM.

---

## 4. CONFIGURACIÓN DE PUERTOS DE ACCESO

```
interface GigabitEthernet 1/0/1
 description ACCESS-DATOS-01
 port link-type access
 port default vlan 10
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/2
 description ACCESS-DATOS-02
 port link-type access
 port default vlan 10
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/3
 description ACCESS-DATOS-03
 port link-type access
 port default vlan 10
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/4
 description ACCESS-DATOS-04
 port link-type access
 port default vlan 10
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/5
 description ACCESS-DATOS-05
 port link-type access
 port default vlan 10
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/6
 description ACCESS-VOZ-01
 port link-type access
 port default vlan 20
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/7
 description ACCESS-CCTV-01
 port link-type access
 port default vlan 30
 stp edged-port enable
 quit
interface GigabitEthernet 1/0/8
 description ACCESS-SERVIDORES-01
 port link-type access
 port default vlan 40
 stp edged-port enable
 quit
```

**Descripción:** Configura puertos de acceso para cada VLAN con STP edged-port habilitado.

---

## 5. CONFIGURACIÓN DE PUERTOS TRONCALES (TRUNK)

```
interface GigabitEthernet 1/0/25
 description TRUNK-SEDE1-SEDE2
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 quit
interface GigabitEthernet 1/0/26
 description TRUNK-SEDE1-SEDE3
 port link-type trunk
 port trunk allow-pass vlan 10 20 30 40 99
 quit
```

**Descripción:** Configura puertos troncales para enlace entre sedes.

---

## 6. CONFIGURACIÓN DE ENRUTAMIENTO OSPF

```
ospf 1
 area 0.0.0.0
  network 172.16.0.0 0.0.15.255
 quit
 default-route-advertise always
 quit
```

**Descripción:** Habilita OSPF como protocolo de enrutamiento dinámico.

---

## 7. CONFIGURACIÓN DE CALIDAD DE SERVICIO (QoS)

```
traffic classifier VOZ operator or
 if-match vlan 20
traffic classifier CCTV operator or
 if-match vlan 30
traffic behavior VOZ-BEHAVIOR
 remark dscp ef
 traffic-policy outbound priority 5
traffic behavior CCTV-BEHAVIOR
 remark dscp af31
 traffic-policy outbound priority 3
traffic policy POLITICA-QOS
 classifier VOZ behavior VOZ-BEHAVIOR
 classifier CCTV behavior CCTV-BEHAVIOR
interface Vlan-interface 10
 traffic-policy POLITICA-QOS inbound
 quit
interface Vlan-interface 20
 traffic-policy POLITICA-QOS inbound
 quit
```

**Descripción:** Implementa QoS para priorizar tráfico de voz y video.

---

## 8. CONFIGURACIÓN DE DHCP

```
dhcp enable
ip pool DATOS-POOL
 network 172.16.0.0 mask 255.255.255.0
 gateway-list 172.16.0.1
 dns-list 8.8.8.8 8.8.4.4
 lease day 1 hour 0 minute 0
 quit
ip pool VOZ-POOL
 network 172.16.1.0 mask 255.255.255.0
 gateway-list 172.16.1.1
 lease day 1 hour 0 minute 0
 quit
interface Vlan-interface 10
 dhcp select global
 quit
interface Vlan-interface 20
 dhcp select global
 quit
```

**Descripción:** Configura DHCP para asignación automática de direcciones IP.

---

## 9. CONFIGURACIÓN DE SEGURIDAD

```
acl number 2000
 rule 5 permit ip source 172.16.0.0 0.0.15.255 destination 172.16.0.0 0.0.15.255
 rule 10 permit ip source 172.16.0.0 0.0.15.255
 rule 15 deny ip destination 172.16.0.0 0.0.15.255
interface Vlan-interface 99
 traffic-filter inbound acl 2000
 quit
stp enable
stp mode rstp
stp vlan 10 priority 4096
stp vlan 20 priority 4096
stp vlan 30 priority 4096
stp vlan 40 priority 4096
stp vlan 99 priority 4096
```

**Descripción:** Implementa ACLs y RSTP para seguridad y redundancia.

---

## 10. CONFIGURACIÓN DE MONITOREO

```
snmp-agent sys-info version all
snmp-agent community read public
snmp-agent community write private
snmp-agent trap enable
snmp-agent trap source Vlan-interface 99
syslog 1.2.3.4
syslog level informational
```

**Descripción:** Habilita SNMP y syslog para monitoreo remoto.

---

## 11. GUARDAR CONFIGURACIÓN

```
save
```

**Descripción:** Guarda la configuración en memoria no volátil.

---

## VERIFICACIÓN DE CONFIGURACIÓN

Después de aplicar los comandos, verificar con:

```
display vlan all
display interface brief
display ospf routing
display ip pool
display acl all
display stp brief
```

---

## TABLA DE DIRECCIONAMIENTO VLSM - SEDE 1

| VLAN | Nombre | Subred | Máscara | Gateway | Hosts | Uso |
|------|--------|--------|---------|---------|-------|-----|
| 10 | DATOS | 172.16.0.0/24 | 255.255.255.0 | 172.16.0.1 | 254 | PCs y estaciones |
| 20 | VOZ | 172.16.1.0/24 | 255.255.255.0 | 172.16.1.1 | 254 | Teléfonos IP |
| 30 | CCTV | 172.16.2.0/24 | 255.255.255.0 | 172.16.2.1 | 254 | Cámaras de seguridad |
| 40 | SERVIDORES | 172.16.3.0/24 | 255.255.255.0 | 172.16.3.1 | 254 | Servidores |
| 99 | GESTIÓN | 172.16.4.0/24 | 255.255.255.0 | 172.16.0.1 | 254 | Administración |

---

## NOTAS IMPORTANTES

1. **Sintaxis Huawei:** Usar `quit` para salir de cada contexto de configuración
2. **Seguridad:** Cambiar comunidades SNMP por defecto
3. **NTP:** Verificar disponibilidad del servidor 172.16.0.254
4. **RSTP:** Huawei usa RSTP en lugar de RAPID-PVST
5. **Redundancia:** Considerar VRRP para gateway redundante
6. **Backup:** Guardar configuración en servidor centralizado

---

## COMANDOS DE TROUBLESHOOTING

```
# Ver estado de interfaces
display interface brief

# Ver tabla de enrutamiento
display ip routing-table

# Ver vecinos OSPF
display ospf peer

# Ver estadísticas de VLAN
display vlan 10

# Ver configuración en ejecución
display current-configuration

# Ver logs del sistema
display logbuffer
```
