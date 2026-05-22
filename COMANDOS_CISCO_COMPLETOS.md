# Comandos Completos Cisco IOS - Sede 1 Teusaquillo

## Instrucciones de Aplicación

1. Conectarse al switch por SSH o consola
2. Ingresar el modo privilegiado con `enable`
3. Ingresar al modo de configuración con `configure terminal`
4. Copiar y pegar cada sección de comandos
5. Al finalizar, ejecutar `write memory` o `copy running-config startup-config`

---

## 1. ACCESO INICIAL

```
enable
configure terminal
```

---

## 2. CONFIGURACIÓN DEL SISTEMA

```
hostname SW-SEDE1-TEUSAQUILLO
enable password 7 [encrypted]
service password-encryption
no ip domain-lookup
clock timezone UTC 0
ntp server 172.16.0.254 prefer
```

**Descripción:** Establece el nombre del dispositivo, contraseña de acceso privilegiado, encriptación de contraseñas, y sincronización de hora.

---

## 3. CONFIGURACIÓN DE VLANs

```
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
```

**Descripción:** Crea 5 VLANs para segmentar el tráfico por servicio.

---

## 4. CONFIGURACIÓN DE INTERFACES DE VLAN

```
interface Vlan10
 description VLAN-DATOS-SEDE1
 ip address 172.16.0.1 255.255.255.0
 no shutdown
interface Vlan20
 description VLAN-VOZ-SEDE1
 ip address 172.16.1.1 255.255.255.0
 no shutdown
interface Vlan30
 description VLAN-CCTV-SEDE1
 ip address 172.16.2.1 255.255.255.0
 no shutdown
interface Vlan40
 description VLAN-SERVIDORES-SEDE1
 ip address 172.16.3.1 255.255.255.0
 no shutdown
interface Vlan99
 description VLAN-GESTION-SEDE1
 ip address 172.16.0.1 255.255.255.0
 no shutdown
```

**Descripción:** Asigna direcciones IP a cada VLAN según el plan VLSM.

---

## 5. CONFIGURACIÓN DE PUERTOS DE ACCESO

```
interface range GigabitEthernet1/0/1-24
 description ACCESS-DATOS
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown
```

**Descripción:** Configura los puertos 1-24 como acceso a la VLAN de datos con Spanning Tree PortFast habilitado.

---

## 6. CONFIGURACIÓN DE PUERTOS TRONCALES (TRUNK)

```
interface GigabitEthernet1/0/25
 description TRUNK-SEDE1-SEDE2
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,99
 no shutdown
interface GigabitEthernet1/0/26
 description TRUNK-SEDE1-SEDE3
 switchport mode trunk
 switchport trunk allowed vlan 10,20,30,40,99
 no shutdown
```

**Descripción:** Configura los puertos de enlace entre sedes como troncales para transportar múltiples VLANs.

---

## 7. CONFIGURACIÓN DE ENRUTAMIENTO OSPF

```
router ospf 1
 router-id 172.16.0.254
 network 172.16.0.0 0.0.15.255 area 0
 default-information originate always
 auto-cost reference-bandwidth 100000
```

**Descripción:** Habilita OSPF como protocolo de enrutamiento dinámico con ID de router único.

---

## 8. CONFIGURACIÓN DE CALIDAD DE SERVICIO (QoS)

```
class-map match-any VOZ
 match vlan 20
class-map match-any CCTV
 match vlan 30
policy-map POLITICA-QOS
 class VOZ
  set dscp ef
  priority 100
 class CCTV
  set dscp af31
  bandwidth 50
 class class-default
  fair-queue
interface Vlan10
 service-policy input POLITICA-QOS
interface Vlan20
 service-policy input POLITICA-QOS
```

**Descripción:** Implementa QoS para priorizar tráfico de voz (DSCP EF) y video (DSCP AF31).

---

## 9. CONFIGURACIÓN DE DHCP

```
ip dhcp pool DATOS-POOL
 network 172.16.0.0 255.255.255.0
 default-router 172.16.0.1
 dns-server 8.8.8.8 8.8.4.4
 lease 1 0 0
ip dhcp pool VOZ-POOL
 network 172.16.1.0 255.255.255.0
 default-router 172.16.1.1
 lease 1 0 0
```

**Descripción:** Configura pools DHCP para asignación automática de direcciones IP en datos y voz.

---

## 10. CONFIGURACIÓN DE SEGURIDAD

```
access-list 2000 permit ip 172.16.0.0 0.0.15.255 172.16.0.0 0.0.15.255
access-list 2000 permit ip 172.16.0.0 0.0.15.255 any
access-list 2000 deny ip any 172.16.0.0 0.0.15.255
interface Vlan99
 ip access-group 2000 in
spanning-tree mode rapid-pvst
spanning-tree vlan 10,20,30,40,99 priority 4096
```

**Descripción:** Implementa ACLs para control de acceso y Spanning Tree RAPID-PVST para redundancia.

---

## 11. CONFIGURACIÓN DE MONITOREO

```
snmp-server community public RO
snmp-server community private RW
snmp-server trap-source Vlan99
snmp-server enable traps all
logging host 172.16.0.254
logging trap informational
logging buffered 4096
```

**Descripción:** Habilita SNMP para monitoreo remoto y syslog para registro de eventos.

---

## 12. GUARDAR CONFIGURACIÓN

```
exit
write memory
```

O alternativamente:

```
copy running-config startup-config
```

**Descripción:** Guarda la configuración en memoria no volátil para persistencia tras reinicio.

---

## VERIFICACIÓN DE CONFIGURACIÓN

Después de aplicar los comandos, verificar con:

```
show vlan brief
show interfaces status
show ip ospf neighbor
show ip dhcp pool
show access-lists
show spanning-tree summary
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

1. **Seguridad:** Cambiar las contraseñas por defecto antes de producción
2. **SNMP:** Actualizar direcciones de servidor SNMP y syslog según tu infraestructura
3. **NTP:** Verificar que el servidor NTP 172.16.0.254 esté disponible
4. **Redundancia:** Configurar HSRP o VRRP en los gateways de VLAN si se requiere alta disponibilidad
5. **Monitoreo:** Implementar Netflow para análisis de tráfico
6. **Backup:** Guardar la configuración en un servidor de configuración centralizado

---

## COMANDOS DE TROUBLESHOOTING

```
# Ver estado de interfaces
show interfaces

# Ver tabla de enrutamiento
show ip route

# Ver vecinos OSPF
show ip ospf neighbor

# Ver estadísticas de VLAN
show vlan id 10

# Ver configuración en ejecución
show running-config

# Ver logs del sistema
show logging
```
