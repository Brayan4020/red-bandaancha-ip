# Guía Completa de Comandos Huawei VRP — Red Banda Ancha

## Tabla de Contenidos
1. [Introducción](#introducción)
2. [Comandos Básicos del Sistema](#comandos-básicos-del-sistema)
3. [Configuración de Interfaces](#configuración-de-interfaces)
4. [Configuración de VLANs](#configuración-de-vlans)
5. [Configuración de OSPF](#configuración-de-ospf)
6. [Configuración de QoS](#configuración-de-qos)
7. [Configuración de DHCP](#configuración-de-dhcp)
8. [Configuración de Seguridad](#configuración-de-seguridad)
9. [Comandos de Verificación](#comandos-de-verificación)
10. [Troubleshooting](#troubleshooting)

---

## Introducción

Los comandos Huawei VRP (Versatile Routing Platform) se dividen en dos modos principales:

- **Modo Usuario:** Acceso limitado, solo lectura (prompt: `>`)
- **Modo Sistema:** Acceso total, configuración completa (prompt: `#`)

Para entrar en modo sistema desde modo usuario:
```
enable
```

Para entrar en modo de configuración global:
```
system-view
```

---

## Comandos Básicos del Sistema

### 1. `system-view`
**Propósito:** Entrar en el modo de vista del sistema (configuración global)

```
[SW-SEDE1-TEUS] system-view
Enter system view, return to user view with Ctrl+Z.
[SW-SEDE1-TEUS]
```

**Explicación:** Este comando es el primero que debes ejecutar para comenzar a configurar el dispositivo. Todos los comandos de configuración deben ejecutarse dentro de este modo.

---

### 2. `sysName <nombre>`
**Propósito:** Asignar un nombre al dispositivo (hostname)

```
[SW-SEDE1-TEUS] sysName SW-SEDE1-TEUS
```

**Explicación:** Define el nombre del switch para identificarlo en la red. Este nombre aparecerá en el prompt y en las herramientas de monitoreo. Usar nombres descriptivos facilita la administración.

**Ejemplo práctico:**
- `sysName SW-SEDE1-TEUS` → Switch Sede 1 en Teusaquillo
- `sysName SW-SEDE2-CAMPUS` → Switch Sede 2 en Campus U

---

### 3. `description <texto>`
**Propósito:** Agregar una descripción del dispositivo

```
[SW-SEDE1-TEUS] description "Switch L3 Sede 1 - Teusaquillo"
```

**Explicación:** Proporciona información adicional sobre el dispositivo. Útil para documentación y búsqueda rápida en inventarios.

---

### 4. `super password level 15 cipher <contraseña>`
**Propósito:** Establecer la contraseña de administrador con encriptación

```
[SW-SEDE1-TEUS] super password level 15 cipher $c$3$XXXXXXXXXXXXXXXXXXXXXX
```

**Explicación:** 
- `level 15` = Nivel máximo de acceso (administrador)
- `cipher` = La contraseña se encripta automáticamente
- El sistema genera una contraseña encriptada que no se puede leer en texto plano

**Niveles de acceso disponibles:**
- Level 0 = Acceso muy limitado
- Level 3 = Acceso moderado
- Level 15 = Acceso total (administrador)

---

### 5. `ssh server enable`
**Propósito:** Habilitar acceso SSH (Secure Shell) al dispositivo

```
[SW-SEDE1-TEUS] ssh server enable
```

**Explicación:** Permite conexiones remotas seguras al switch. SSH es más seguro que Telnet porque encripta la comunicación.

**Ventajas:**
- Encriptación de datos
- Autenticación de usuario
- Protección contra ataques man-in-the-middle

---

### 6. `ssh server port 22`
**Propósito:** Configurar el puerto SSH (por defecto es 22)

```
[SW-SEDE1-TEUS] ssh server port 22
```

**Explicación:** Define en qué puerto escucha el servidor SSH. El puerto 22 es el estándar, pero puede cambiarse por seguridad.

---

### 7. `ntp-service enable`
**Propósito:** Habilitar el servicio NTP (Network Time Protocol)

```
[SW-SEDE1-TEUS] ntp-service enable
```

**Explicación:** Permite que el switch sincronice su reloj con servidores NTP externos. Esto es crítico para:
- Logs con timestamps precisos
- Sincronización entre dispositivos
- Auditoría de seguridad

---

### 8. `ntp-service unicast-server 200.3.97.17 source LoopBack0`
**Propósito:** Configurar un servidor NTP específico

```
[SW-SEDE1-TEUS] ntp-service unicast-server 200.3.97.17 source LoopBack0
```

**Explicación:**
- `200.3.97.17` = Dirección IP del servidor NTP (servidor público de Colombia)
- `source LoopBack0` = Usar la interfaz LoopBack0 como origen de la solicitud NTP
- El switch sincronizará su hora con este servidor cada cierto tiempo

**Servidores NTP públicos recomendados:**
- `200.3.97.17` (Colombia)
- `pool.ntp.org` (Internacional)
- `time.nist.gov` (USA)

---

### 9. `snmp-agent community read public`
**Propósito:** Configurar acceso SNMP de solo lectura

```
[SW-SEDE1-TEUS] snmp-agent community read public
```

**Explicación:**
- `read` = Permiso de solo lectura (no se pueden cambiar configuraciones)
- `public` = Nombre de la comunidad SNMP (contraseña)
- Permite que herramientas de monitoreo (Zabbix, Nagios) lean información del switch

**Seguridad:** No usar "public" en producción; cambiar por una cadena compleja.

---

### 10. `snmp-agent community write private`
**Propósito:** Configurar acceso SNMP de lectura y escritura

```
[SW-SEDE1-TEUS] snmp-agent community write private
```

**Explicación:**
- `write` = Permiso de lectura Y escritura
- `private` = Nombre de la comunidad SNMP
- Permite que herramientas de gestión cambien configuraciones remotamente

**Advertencia:** Usar solo para administradores de confianza.

---

### 11. `snmp-agent sys-info contact "NOC Banda Ancha"`
**Propósito:** Configurar información de contacto SNMP

```
[SW-SEDE1-TEUS] snmp-agent sys-info contact "NOC Banda Ancha"
```

**Explicación:** Define el contacto responsable del dispositivo. Esta información se envía en respuestas SNMP.

---

### 12. `snmp-agent sys-info location "Teusaquillo, Bogotá"`
**Propósito:** Configurar la ubicación física del dispositivo

```
[SW-SEDE1-TEUS] snmp-agent sys-info location "Teusaquillo, Bogotá"
```

**Explicación:** Especifica dónde está ubicado físicamente el switch. Útil para gestión de activos e identificación rápida.

---

### 13. `info-center enable`
**Propósito:** Habilitar el sistema de logging centralizado

```
[SW-SEDE1-TEUS] info-center enable
```

**Explicación:** Activa la capacidad de enviar logs a servidores remotos. Sin esto, los siguientes comandos de loghost no funcionarán.

---

### 14. `info-center loghost 172.16.0.50 facility local7`
**Propósito:** Enviar logs a un servidor syslog remoto

```
[SW-SEDE1-TEUS] info-center loghost 172.16.0.50 facility local7
```

**Explicación:**
- `172.16.0.50` = IP del servidor syslog
- `facility local7` = Clasificación de logs (local7 es para dispositivos locales)
- El switch enviará todos sus logs a este servidor para análisis centralizado

**Facilidades disponibles:**
- `local0` a `local7` = Para dispositivos locales
- `user` = Mensajes de usuario
- `daemon` = Mensajes del sistema

---

### 15. `save`
**Propósito:** Guardar la configuración en memoria no volátil

```
[SW-SEDE1-TEUS] save
The current configuration will be saved to the device.
Are you sure? [Y/N]: y
```

**Explicación:** Guarda todos los cambios realizados. Sin este comando, la configuración se perderá si el dispositivo se reinicia.

**Importante:** Ejecutar `save` después de cada cambio importante.

---

## Configuración de Interfaces

### 1. `interface Vlanif10`
**Propósito:** Entrar en el modo de configuración de interfaz VLAN

```
[SW-SEDE1-TEUS] interface Vlanif10
[SW-SEDE1-TEUS-Vlanif10]
```

**Explicación:**
- `Vlanif` = VLAN Interface (interfaz virtual de VLAN)
- `10` = Número de VLAN
- Dentro de este modo, se configura la dirección IP y otras propiedades de la VLAN

---

### 2. `description "VLAN-DATOS-SEDE1"`
**Propósito:** Describir la interfaz VLAN

```
[SW-SEDE1-TEUS-Vlanif10] description "VLAN-DATOS-SEDE1"
```

**Explicación:** Proporciona un nombre descriptivo para identificar rápidamente qué es esta VLAN.

---

### 3. `ip address 172.16.0.1 255.255.248.0`
**Propósito:** Asignar una dirección IP a la interfaz VLAN

```
[SW-SEDE1-TEUS-Vlanif10] ip address 172.16.0.1 255.255.248.0
```

**Explicación:**
- `172.16.0.1` = Dirección IP del gateway
- `255.255.248.0` = Máscara de subred (/21 en CIDR)
- Esta es la dirección que los dispositivos usarán como gateway

**Cálculo de máscara:**
- `/21` = 2048 direcciones totales
- 255.255.248.0 en binario = 11111111.11111111.11111000.00000000

---

### 4. `no shutdown`
**Propósito:** Habilitar la interfaz (activarla)

```
[SW-SEDE1-TEUS-Vlanif10] no shutdown
```

**Explicación:**
- `no shutdown` = Activar la interfaz
- `shutdown` = Desactivar la interfaz
- Por defecto, las interfaces están desactivadas. Este comando las enciende.

---

### 5. `interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20`
**Propósito:** Entrar en modo de configuración de múltiples puertos físicos

```
[SW-SEDE1-TEUS] interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20]
```

**Explicación:**
- `GigabitEthernet` = Tipo de puerto (1 Gbps)
- `1/0/1` = Ranura 1, módulo 0, puerto 1
- `to` = Rango de puertos (del 1 al 20)
- Permite configurar múltiples puertos simultáneamente

---

### 6. `port link-type access`
**Propósito:** Configurar el puerto como tipo "access"

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20] port link-type access
```

**Explicación:**
- **Access:** Puerto conectado a dispositivos finales (PCs, teléfonos, cámaras)
- **Trunk:** Puerto conectado a otros switches (transporta múltiples VLANs)

**Diferencias:**
| Tipo | Uso | VLANs |
|---|---|---|
| Access | Dispositivos finales | 1 VLAN |
| Trunk | Interconexión switches | Múltiples VLANs |

---

### 7. `port default vlan 10`
**Propósito:** Asignar una VLAN por defecto al puerto

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20] port default vlan 10
```

**Explicación:**
- Los dispositivos conectados a estos puertos pertenecerán a VLAN 10
- El tráfico sin etiqueta VLAN se asignará a esta VLAN

**Ejemplo:**
- Puerto 1-20: VLAN 10 (Datos)
- Puerto 21-30: VLAN 20 (Voz)
- Puerto 31-40: VLAN 30 (CCTV)

---

### 8. `stp edged-port enable`
**Propósito:** Habilitar Spanning Tree Protocol (STP) en modo edge

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20] stp edged-port enable
```

**Explicación:**
- **STP:** Protocolo que evita bucles en la red
- **Edge Port:** Puerto conectado a dispositivos finales (no a otros switches)
- Los edge ports pueden pasar a estado forwarding más rápido
- Evita esperas innecesarias cuando se conecta un dispositivo

**Ventaja:** Reduce el tiempo de convergencia de STP de 30 segundos a casi 0.

---

### 9. `eth-trunk 1`
**Propósito:** Agregar puertos a un grupo de agregación de enlaces (LAG)

```
[SW-SEDE1-TEUS-XGigabitEthernet1/0/1] eth-trunk 1
```

**Explicación:**
- **Eth-Trunk:** Agrupa múltiples puertos en uno lógico
- Aumenta el ancho de banda (2 puertos 10G = 20G)
- Proporciona redundancia automática

**Ejemplo:**
- XGigabitEthernet1/0/1 + XGigabitEthernet1/0/2 → Eth-Trunk1 (20G)
- Si falla un puerto, el otro sigue funcionando

---

## Configuración de VLANs

### 1. `vlan batch 10 20 30 40 99`
**Propósito:** Crear múltiples VLANs de una sola vez

```
[SW-SEDE1-TEUS] vlan batch 10 20 30 40 99
```

**Explicación:**
- Crea las VLANs 10, 20, 30, 40 y 99 simultáneamente
- Más rápido que crear cada VLAN individualmente
- Las VLANs se crean pero aún no tienen configuración

---

### 2. `vlan 10`
**Propósito:** Entrar en modo de configuración de una VLAN específica

```
[SW-SEDE1-TEUS] vlan 10
[SW-SEDE1-TEUS-vlan10]
```

**Explicación:** Permite configurar propiedades específicas de la VLAN 10.

---

### 3. `name VLAN-DATOS-SEDE1`
**Propósito:** Asignar un nombre descriptivo a la VLAN

```
[SW-SEDE1-TEUS-vlan10] name VLAN-DATOS-SEDE1
```

**Explicación:** Define un nombre legible para la VLAN. Aparece en comandos de verificación.

---

### 4. `description "Datos - Estaciones de trabajo"`
**Propósito:** Agregar una descripción detallada de la VLAN

```
[SW-SEDE1-TEUS-vlan10] description "Datos - Estaciones de trabajo"
```

**Explicación:** Proporciona contexto sobre el propósito de la VLAN.

---

## Configuración de OSPF

### 1. `ospf 1 router-id 172.16.0.254`
**Propósito:** Iniciar OSPF y asignar un router ID

```
[SW-SEDE1-TEUS] ospf 1 router-id 172.16.0.254
[SW-SEDE1-TEUS-ospf-1]
```

**Explicación:**
- `ospf 1` = Instancia OSPF número 1 (puede haber múltiples instancias)
- `router-id 172.16.0.254` = Identificador único del router
- El router ID debe ser único en toda la red OSPF
- Típicamente se usa la IP de LoopBack0

**¿Por qué usar LoopBack0 como router ID?**
- Nunca se cae (no está vinculada a un puerto físico)
- Siempre está disponible si el router está encendido
- Facilita la identificación del router

---

### 2. `area 0.0.0.0`
**Propósito:** Definir el área OSPF (Backbone)

```
[SW-SEDE1-TEUS-ospf-1] area 0.0.0.0
```

**Explicación:**
- `area 0.0.0.0` = Área 0 (Backbone o área troncal)
- Todas las áreas OSPF deben estar conectadas al área 0
- En redes pequeñas, se usa solo el área 0

**Áreas OSPF:**
- **Área 0:** Backbone (obligatoria)
- **Área 1, 2, 3...:** Áreas normales

---

### 3. `network 172.16.0.0 0.0.7.255 area 0.0.0.0`
**Propósito:** Anunciar redes en OSPF

```
[SW-SEDE1-TEUS-ospf-1] network 172.16.0.0 0.0.7.255 area 0.0.0.0
```

**Explicación:**
- `172.16.0.0` = Red a anunciar
- `0.0.7.255` = Máscara wildcard (inversa de la máscara de subred)
- `area 0.0.0.0` = Área donde se anuncia la red

**Máscara Wildcard:**
- Máscara normal: 255.255.248.0
- Máscara wildcard: 0.0.7.255 (255 - 248 = 7)
- Indica qué bits pueden variar

**Ejemplo:**
- Red: 172.16.0.0/21
- Máscara normal: 255.255.248.0
- Máscara wildcard: 0.0.7.255

---

### 4. `bfd all-interfaces enable`
**Propósito:** Habilitar BFD (Bidirectional Forwarding Detection) en todas las interfaces

```
[SW-SEDE1-TEUS-ospf-1] bfd all-interfaces enable
```

**Explicación:**
- **BFD:** Detecta fallas de enlace muy rápidamente (milisegundos)
- Sin BFD, OSPF tarda 30-40 segundos en detectar una falla
- Con BFD, detecta fallas en 300ms
- Crítico para redes con redundancia

**Ventaja:** Failover automático y rápido en caso de falla de enlace.

---

### 5. `auto-cost reference-bandwidth 100000`
**Propósito:** Configurar el ancho de banda de referencia para el cálculo de costo OSPF

```
[SW-SEDE1-TEUS-ospf-1] auto-cost reference-bandwidth 100000
```

**Explicación:**
- **Costo OSPF:** Se calcula como 100000 / ancho de banda
- `100000` = 100 Gbps (referencia)
- Ejemplo:
  - Enlace 1 Gbps: costo = 100000 / 1000 = 100
  - Enlace 10 Gbps: costo = 100000 / 10000 = 10
  - Enlace 100 Gbps: costo = 100000 / 100000 = 1

**Propósito:** OSPF prefiere enlaces más rápidos automáticamente.

---

### 6. `default-route-advertise always`
**Propósito:** Anunciar una ruta por defecto a través de OSPF

```
[SW-SEDE1-TEUS-ospf-1] default-route-advertise always
```

**Explicación:**
- Si el router tiene una ruta por defecto, la anuncia a todos los vecinos OSPF
- Útil para que todos los routers sepan cómo alcanzar redes externas
- `always` = Anunciar incluso si no hay ruta por defecto

---

### 7. `interface Eth-Trunk1` (dentro de OSPF)
**Propósito:** Configurar OSPF en una interfaz específica

```
[SW-SEDE1-TEUS-ospf-1] interface Eth-Trunk1
[SW-SEDE1-TEUS-ospf-1-if-Eth-Trunk1]
```

**Explicación:** Permite configurar parámetros OSPF específicos en esta interfaz.

---

### 8. `ospf bfd enable`
**Propósito:** Habilitar BFD específicamente en esta interfaz

```
[SW-SEDE1-TEUS-ospf-1-if-Eth-Trunk1] ospf bfd enable
```

**Explicación:** Activa BFD solo en este enlace para detección rápida de fallas.

---

## Configuración de QoS

### 1. `traffic classifier VOICE`
**Propósito:** Crear un clasificador de tráfico para voz

```
[SW-SEDE1-TEUS] traffic classifier VOICE
[SW-SEDE1-TEUS-traffic-classifier-VOICE]
```

**Explicación:**
- Define reglas para identificar tráfico de voz
- Los clasificadores se usan para aplicar políticas de QoS

---

### 2. `if-match vlan-id 20`
**Propósito:** Clasificar tráfico que pertenece a VLAN 20

```
[SW-SEDE1-TEUS-traffic-classifier-VOICE] if-match vlan-id 20
```

**Explicación:**
- Todo tráfico en VLAN 20 (voz) será clasificado como VOICE
- Se pueden usar múltiples condiciones (VLAN, puerto, protocolo, etc.)

---

### 3. `traffic behavior VOICE-POLICY`
**Propósito:** Crear una política de comportamiento para tráfico de voz

```
[SW-SEDE1-TEUS] traffic behavior VOICE-POLICY
[SW-SEDE1-TEUS-traffic-behavior-VOICE-POLICY]
```

**Explicación:**
- Define qué hacer con el tráfico clasificado como VOICE
- Puede incluir priorización, limitación de ancho de banda, etc.

---

### 4. `remark dscp ef`
**Propósito:** Marcar el tráfico con DSCP EF (Expedited Forwarding)

```
[SW-SEDE1-TEUS-traffic-behavior-VOICE-POLICY] remark dscp ef
```

**Explicación:**
- **DSCP:** Diferentiated Services Code Point (6 bits)
- **EF:** Expedited Forwarding (valor 46)
- Marca el tráfico como prioritario en toda la red
- Los routers ven esta marca y priorizan el tráfico

**Valores DSCP comunes:**
- `ef` = Expedited Forwarding (Voz) - Valor 46
- `af41` = Assured Forwarding (Video) - Valor 34
- `be` = Best Effort (Datos normales) - Valor 0

---

### 5. `car committed-information-rate 300000 committed-burst-size 37500`
**Propósito:** Limitar el ancho de banda de voz

```
[SW-SEDE1-TEUS-traffic-behavior-VOICE-POLICY] car committed-information-rate 300000 committed-burst-size 37500
```

**Explicación:**
- **CAR:** Committed Access Rate (limitador de ancho de banda)
- `300000` = 300 Kbps (ancho de banda máximo)
- `37500` = 37.5 KB (ráfaga máxima permitida)
- Si el tráfico excede estos límites, se descarta

**Cálculo:**
- 300 Kbps = 300,000 bits/segundo
- 37,500 bytes = 300,000 bits (1 segundo de tráfico)

---

### 6. `qos policy QOS-POLICY`
**Propósito:** Crear una política QoS que agrupa clasificadores y comportamientos

```
[SW-SEDE1-TEUS] qos policy QOS-POLICY
[SW-SEDE1-TEUS-qos-policy-QOS-POLICY]
```

**Explicación:**
- Agrupa múltiples clasificadores y comportamientos
- Se aplica a interfaces para ejecutar las políticas

---

### 7. `classifier VOICE behavior VOICE-POLICY priority 7`
**Propósito:** Aplicar la política de voz con prioridad 7

```
[SW-SEDE1-TEUS-qos-policy-QOS-POLICY] classifier VOICE behavior VOICE-POLICY priority 7
```

**Explicación:**
- `priority 7` = Prioridad máxima (rango 0-7)
- El tráfico de voz se procesa antes que otros
- Garantiza baja latencia para llamadas

**Prioridades:**
- 7 = Máxima (Voz)
- 5 = Alta (Video)
- 3 = Normal (Datos)
- 0 = Mínima (Best Effort)

---

### 8. `interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20` (para QoS)
**Propósito:** Aplicar QoS a interfaces específicas

```
[SW-SEDE1-TEUS] interface GigabitEthernet1/0/1 to GigabitEthernet1/0/20
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20]
```

---

### 9. `qos apply policy QOS-POLICY inbound`
**Propósito:** Aplicar la política QoS al tráfico entrante

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1-20] qos apply policy QOS-POLICY inbound
```

**Explicación:**
- `inbound` = Tráfico que entra por este puerto
- `outbound` = Tráfico que sale por este puerto
- La política se ejecuta en el momento especificado

---

## Configuración de DHCP

### 1. `dhcp enable`
**Propósito:** Habilitar el servicio DHCP en el switch

```
[SW-SEDE1-TEUS] dhcp enable
```

**Explicación:** Activa la capacidad del switch de actuar como servidor DHCP.

---

### 2. `ip pool DATOS-SEDE1`
**Propósito:** Crear un pool de direcciones DHCP

```
[SW-SEDE1-TEUS] ip pool DATOS-SEDE1
[SW-SEDE1-TEUS-ip-pool-DATOS-SEDE1]
```

**Explicación:**
- Define un conjunto de direcciones IP disponibles para asignar
- Cada pool corresponde a una VLAN

---

### 3. `gateway-list 172.16.0.1`
**Propósito:** Especificar el gateway que DHCP asignará a los clientes

```
[SW-SEDE1-TEUS-ip-pool-DATOS-SEDE1] gateway-list 172.16.0.1
```

**Explicación:**
- Los clientes DHCP recibirán 172.16.0.1 como gateway por defecto
- Puede haber múltiples gateways (redundancia)

---

### 4. `network 172.16.0.0 mask 255.255.248.0`
**Propósito:** Definir la red de la cual se asignarán direcciones

```
[SW-SEDE1-TEUS-ip-pool-DATOS-SEDE1] network 172.16.0.0 mask 255.255.248.0
```

**Explicación:**
- `172.16.0.0/21` = Rango de direcciones disponibles
- DHCP asignará direcciones dentro de este rango

---

### 5. `excluded-ip-address 172.16.0.1 172.16.0.100`
**Propósito:** Excluir direcciones del pool DHCP

```
[SW-SEDE1-TEUS-ip-pool-DATOS-SEDE1] excluded-ip-address 172.16.0.1 172.16.0.100
```

**Explicación:**
- Direcciones 172.16.0.1 a 172.16.0.100 NO se asignarán por DHCP
- Se reservan para dispositivos con IP estática (servidores, impresoras, etc.)

**Rango de exclusión:**
- 172.16.0.1 = Gateway
- 172.16.0.2 a 172.16.0.100 = Dispositivos estáticos
- 172.16.0.101 en adelante = Asignación DHCP

---

### 6. `lease day 7`
**Propósito:** Configurar el tiempo de arrendamiento DHCP

```
[SW-SEDE1-TEUS-ip-pool-DATOS-SEDE1] lease day 7
```

**Explicación:**
- `day 7` = 7 días (604,800 segundos)
- Después de 7 días, el cliente debe renovar su dirección IP
- Valores comunes:
  - `day 1` = 24 horas (dispositivos móviles)
  - `day 7` = 1 semana (dispositivos fijos)
  - `day 30` = 1 mes (servidores)

---

### 7. `interface Vlanif10` (para DHCP)
**Propósito:** Aplicar DHCP a una interfaz VLAN

```
[SW-SEDE1-TEUS] interface Vlanif10
[SW-SEDE1-TEUS-Vlanif10]
```

---

### 8. `dhcp select global`
**Propósito:** Usar el pool DHCP global para esta VLAN

```
[SW-SEDE1-TEUS-Vlanif10] dhcp select global
```

**Explicación:**
- Asocia esta VLAN con el pool DHCP global
- Los clientes en VLAN 10 recibirán direcciones del pool DATOS-SEDE1

---

## Configuración de Seguridad

### 1. `stp enable`
**Propósito:** Habilitar Spanning Tree Protocol

```
[SW-SEDE1-TEUS] stp enable
```

**Explicación:**
- Previene bucles en la topología de red
- Detecta y bloquea puertos redundantes
- Crítico en redes con múltiples switches

---

### 2. `stp mode rstp`
**Propósito:** Usar RSTP (Rapid Spanning Tree Protocol)

```
[SW-SEDE1-TEUS] stp mode rstp
```

**Explicación:**
- **RSTP:** Versión mejorada de STP
- Converge más rápido (segundos en lugar de minutos)
- Recomendado para redes modernas

**Comparación:**
| Protocolo | Convergencia | Velocidad |
|---|---|---|
| STP | 30-50 seg | Lenta |
| RSTP | 1-3 seg | Rápida |
| MSTP | Variable | Muy rápida |

---

### 3. `stp priority 8192`
**Propósito:** Configurar la prioridad del switch en STP

```
[SW-SEDE1-TEUS] stp priority 8192
```

**Explicación:**
- Valores: 0, 4096, 8192, 12288, etc. (múltiplos de 4096)
- Menor valor = Mayor prioridad
- El switch con menor prioridad se convierte en root bridge
- `8192` = Prioridad normal
- `0` = Máxima prioridad (fuerza a ser root bridge)

---

### 4. `stp bpdu-guard enable`
**Propósito:** Habilitar BPDU Guard en puertos edge

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1] stp bpdu-guard enable
```

**Explicación:**
- Si un puerto edge recibe un BPDU (Bridge Protocol Data Unit), lo deshabilita
- Protege contra ataques donde alguien conecta un switch malicioso
- Previene cambios accidentales en la topología

---

### 5. `stp edged-port enable`
**Propósito:** Marcar un puerto como edge port

```
[SW-SEDE1-TEUS-GigabitEthernet1/0/1] stp edged-port enable
```

**Explicación:**
- Los edge ports pueden pasar a forwarding inmediatamente
- No necesitan esperar a que STP converja
- Reduce el tiempo de conexión de dispositivos finales

---

## Comandos de Verificación

### 1. `display ospf peer`
**Propósito:** Ver los vecinos OSPF conectados

```
[SW-SEDE1-TEUS] display ospf peer
```

**Salida esperada:**
```
Peer ID         Pri   State            IfName      IfIp            Cost
172.16.8.254    1     Full/DR          Eth-Trunk1  10.0.1.2        100
172.16.12.254   1     Full/BDR         Eth-Trunk2  10.0.2.2        200
```

**Explicación:**
- `Peer ID` = Router ID del vecino
- `State` = Full = Vecino completamente adyacente
- `Cost` = Costo del enlace (menor = mejor)

---

### 2. `display ospf interface`
**Propósito:** Ver información de interfaces OSPF

```
[SW-SEDE1-TEUS] display ospf interface
```

---

### 3. `display vlan all`
**Propósito:** Ver todas las VLANs configuradas

```
[SW-SEDE1-TEUS] display vlan all
```

**Salida:**
```
VLAN ID: 10
VLAN Name: VLAN-DATOS-SEDE1
Status: active
Ports: GigabitEthernet1/0/1-20
```

---

### 4. `display interface brief`
**Propósito:** Ver estado resumido de todas las interfaces

```
[SW-SEDE1-TEUS] display interface brief
```

---

### 5. `display dhcp server pool`
**Propósito:** Ver información de pools DHCP

```
[SW-SEDE1-TEUS] display dhcp server pool
```

---

### 6. `ping 172.16.8.1`
**Propósito:** Probar conectividad a otra sede

```
[SW-SEDE1-TEUS] ping 172.16.8.1
```

---

### 7. `tracert 172.16.8.1`
**Propósito:** Ver la ruta que toma un paquete

```
[SW-SEDE1-TEUS] tracert 172.16.8.1
```

---

## Troubleshooting

### Problema: No hay conectividad entre sedes

**Pasos de verificación:**

1. **Verificar interfaces físicas:**
```
display interface Eth-Trunk1
```
- Buscar estado "UP"

2. **Verificar OSPF:**
```
display ospf peer
```
- Debe haber vecinos en estado "Full"

3. **Verificar rutas:**
```
display ip routing-table
```
- Debe haber rutas a las otras sedes

4. **Hacer ping:**
```
ping 172.16.8.1
ping 172.16.12.1
```

---

### Problema: Dispositivos no obtienen IP por DHCP

**Pasos de verificación:**

1. **Verificar DHCP habilitado:**
```
display dhcp server pool
```

2. **Verificar interfaz VLAN:**
```
display interface Vlanif10
```
- Debe estar en estado "UP"

3. **Verificar configuración DHCP:**
```
display dhcp server statistics
```

---

### Problema: Tráfico de voz con latencia alta

**Pasos de verificación:**

1. **Verificar QoS:**
```
display qos policy
```

2. **Verificar DSCP:**
```
display traffic classifier
```

3. **Verificar prioridades:**
```
display priority-queue
```

---

**Versión:** 1.0  
**Fecha:** Marzo 2026  
**Autor:** Equipo de Infraestructura Red Banda Ancha
