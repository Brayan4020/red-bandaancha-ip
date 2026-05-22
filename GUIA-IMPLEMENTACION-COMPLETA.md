# Guía de Implementación Completa - Red Banda Ancha

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Objetivo:** Implementar configuraciones de red para 3 sedes con 3 fabricantes diferentes

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Arquitectura General](#arquitectura-general)
3. [Implementación por Sede](#implementación-por-sede)
4. [Implementación por Fabricante](#implementación-por-fabricante)
5. [Validación y Verificación](#validación-y-verificación)
6. [Rollback y Recuperación](#rollback-y-recuperación)
7. [Monitoreo Post-Implementación](#monitoreo-post-implementación)

---

## Requisitos Previos

### Hardware Requerido

```
Sede 1 (Teusaquillo):
├─ Router Core (Cisco/Huawei/Fortinet)
├─ 2-3 Switches L3
├─ Firewall perimetral
└─ Servidor DHCP

Sede 2 (Campus U Compensar):
├─ Router de acceso
├─ 1-2 Switches L3
└─ Firewall local

Sede 3 (AV68):
├─ Router de acceso
├─ 1 Switch L3
└─ Firewall local
```

### Software y Herramientas

- **SSH Client:** PuTTY, OpenSSH, o terminal nativa
- **Backup:** WinSCP, FileZilla para copiar configuraciones
- **Validación:** Ping, Traceroute, Netstat
- **Monitoreo:** Zabbix, Nagios, o SNMP tools
- **Documentación:** Notepad++, VS Code

### Acceso Requerido

```
Credenciales necesarias:
├─ Usuario administrador en cada dispositivo
├─ Contraseña enable/privilegio
├─ Acceso SSH habilitado (puerto 22)
└─ Permisos de lectura/escritura en configuración
```

---

## Arquitectura General

### Topología de Red

```
                    ┌─────────────────────┐
                    │   INTERNET / ISP    │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐        ┌─────▼─────┐
              │  Sede 1    │        │  Sede 2   │
              │Teusaquillo │◄─────►│  Campus U │
              └─────┬─────┘  100Mb  └─────┬─────┘
                    │                     │
                    │ 50Mb (Respaldo)     │
                    │                     │
              ┌─────▼─────────────────────▼─────┐
              │         Sede 3 (AV68)           │
              └─────────────────────────────────┘
```

### Esquema de Direccionamiento VLSM

```
Red Base: 172.16.0.0/16

Sede 1: 172.16.0.0/21 (2,046 hosts)
├─ VLAN 10 (Datos):      172.16.1.0/24
├─ VLAN 20 (Voz):        172.16.2.0/24
├─ VLAN 30 (CCTV):       172.16.3.0/24
├─ VLAN 40 (Servidores): 172.16.4.0/24
└─ VLAN 99 (Gestión):    172.16.5.0/24

Sede 2: 172.16.8.0/22 (1,022 hosts)
├─ VLAN 10 (Datos):      172.16.9.0/24
├─ VLAN 20 (Voz):        172.16.10.0/24
└─ VLAN 30 (CCTV):       172.16.11.0/24

Sede 3: 172.16.12.0/23 (510 hosts)
├─ VLAN 10 (Datos):      172.16.12.0/25
└─ VLAN 20 (Voz):        172.16.12.128/25
```

---

## Implementación por Sede

### SEDE 1 - Teusaquillo

**Características:**
- 1,600 hosts requeridos
- Red: 172.16.0.0/21
- Rol: Centro principal (Hub)
- Conecta con: Sede 2 (primario) y Sede 3 (respaldo)

#### Pasos de Implementación

**Fase 1: Preparación (30 minutos)**

```bash
1. Realizar backup de configuración actual
   - Conectar vía SSH al dispositivo
   - Ejecutar: show running-config (Cisco)
   - Guardar en archivo local
   
2. Verificar conectividad básica
   - ping 8.8.8.8
   - ping a Sede 2 (172.16.8.1)
   - ping a Sede 3 (172.16.12.1)
   
3. Documentar estado actual
   - Interfaces activas
   - Rutas existentes
   - Configuración de VLAN
```

**Fase 2: Configuración Inicial (45 minutos)**

```bash
1. Configurar nombre del dispositivo
   hostname SEDE1-ROUTER
   
2. Crear VLANs
   vlan 10,20,30,40,99
   
3. Configurar interfaces físicas
   interface GigabitEthernet0/0/1
   ip address 172.16.0.1 255.255.248.0
   description Link-to-SEDE2
   no shutdown
   
4. Configurar interfaces virtuales (SVI)
   interface Vlan10
   ip address 172.16.1.1 255.255.255.0
   description VLAN-Datos
```

**Fase 3: Enrutamiento (30 minutos)**

```bash
1. Habilitar OSPF
   router ospf 1
   network 172.16.0.0 0.0.7.255 area 0
   
2. Configurar vecinos OSPF
   neighbor 172.16.8.1
   neighbor 172.16.12.1
   
3. Verificar adyacencias
   show ip ospf neighbor
```

**Fase 4: Servicios (30 minutos)**

```bash
1. Configurar DHCP
   ip dhcp pool VLAN10
   network 172.16.1.0 255.255.255.0
   default-router 172.16.1.1
   dns-server 8.8.8.8
   
2. Configurar QoS
   class-map match-any VOICE
   match dscp ef
   policy-map PRIORITY
   class VOICE priority 100
   
3. Aplicar políticas
   interface GigabitEthernet0/0/1
   service-policy output PRIORITY
```

**Fase 5: Verificación (20 minutos)**

```bash
1. Verificar configuración
   show running-config
   show ip interface brief
   show ip route
   show vlan
   
2. Pruebas de conectividad
   ping 172.16.8.1 (Sede 2)
   ping 172.16.12.1 (Sede 3)
   traceroute 172.16.8.1
   
3. Verificar OSPF
   show ip ospf neighbor
   show ip ospf database
```

**Tiempo Total Sede 1:** ~2.5 horas

---

### SEDE 2 - Campus U Compensar

**Características:**
- 600 hosts requeridos
- Red: 172.16.8.0/22
- Rol: Centro secundario
- Conecta con: Sede 1 (primario) y Sede 3

#### Pasos de Implementación

**Fase 1-5:** Seguir mismo patrón que Sede 1 pero con:

```bash
# Configuración específica de Sede 2
hostname SEDE2-ROUTER
ip address 172.16.8.1 255.255.252.0

# VLANs reducidas
vlan 10,20,30

# Pool DHCP
ip dhcp pool VLAN10
network 172.16.9.0 255.255.255.0
```

**Tiempo Total Sede 2:** ~2 horas

---

### SEDE 3 - AV68

**Características:**
- 400 hosts requeridos
- Red: 172.16.12.0/23
- Rol: Centro terciario
- Conecta con: Sede 2 (primario) y Sede 1 (respaldo)

#### Pasos de Implementación

**Fase 1-5:** Seguir mismo patrón pero con:

```bash
# Configuración específica de Sede 3
hostname SEDE3-ROUTER
ip address 172.16.12.1 255.255.254.0

# VLANs mínimas
vlan 10,20

# Pool DHCP
ip dhcp pool VLAN10
network 172.16.12.0 255.255.255.128
```

**Tiempo Total Sede 3:** ~1.5 horas

---

## Implementación por Fabricante

### CISCO IOS

#### Acceso Inicial

```bash
# Conectar vía SSH
ssh -l admin 172.16.0.1

# Ingresar modo privilegiado
enable
Password: ****

# Acceder a configuración
configure terminal
```

#### Comandos Clave

```bash
# Ver configuración
show running-config
show startup-config

# Guardar configuración
copy running-config startup-config
write memory

# Revertir cambios
configure terminal
no [comando anterior]
exit
```

#### Validación Cisco

```bash
# Interfaces
show ip interface brief
show interface status

# Enrutamiento
show ip route
show ip ospf neighbor
show ip ospf database

# VLAN
show vlan
show vlan id 10

# DHCP
show ip dhcp binding
show ip dhcp pool

# QoS
show policy-map
show queue
```

---

### HUAWEI VRP

#### Acceso Inicial

```bash
# Conectar vía SSH
ssh -l admin 172.16.0.1

# Ingresar vista del sistema
system-view

# Desactivar info-center (logs)
undo info-center enable
```

#### Comandos Clave

```bash
# Ver configuración
display current-configuration
display saved-configuration

# Guardar configuración
save

# Revertir cambios
system-view
undo [comando anterior]
quit
```

#### Validación Huawei

```bash
# Interfaces
display interface brief
display interface GigabitEthernet0/0/1

# Enrutamiento
display ip routing-table
display ospf peer

# VLAN
display vlan
display vlan id 10

# DHCP
display dhcp server statistics
display ip pool

# Verificar estado
display system-view
```

---

### FORTINET FORTIGATE

#### Acceso Inicial

```bash
# Conectar vía SSH
ssh admin@172.16.0.1

# Ingresar contraseña
Password: ****

# Ya estás en modo configuración
config system global
```

#### Comandos Clave

```bash
# Ver configuración
show [objeto]
show system status
show system interface

# Guardar configuración
execute cfg save

# Revertir cambios
config [objeto]
delete [parámetro]
end
```

#### Validación Fortinet

```bash
# Estado general
get system status
get system interface

# Interfaces
show system interface
diagnose netlink interface list

# Enrutamiento
get router info routing-table all
diagnose ip route list

# Firewall
diagnose firewall policy list
show firewall policy

# Verificar conectividad
execute ping 172.16.8.1
execute traceroute 172.16.12.1
```

---

## Validación y Verificación

### Checklist Pre-Implementación

```
□ Backup de configuración actual realizado
□ Acceso SSH verificado en todos los dispositivos
□ Contraseñas de administrador confirmadas
□ Ventana de mantenimiento programada
□ Equipo de rollback disponible
□ Comunicación a usuarios informada
□ Documentación actualizada
□ Procedimiento de rollback probado
```

### Checklist Post-Implementación

```
□ Todas las interfaces están UP
□ Enrutamiento OSPF establecido (vecinos visibles)
□ VLANs creadas y asignadas correctamente
□ DHCP distribuyendo direcciones
□ QoS aplicado en enlaces WAN
□ Conectividad entre sedes verificada
□ Configuración guardada permanentemente
□ Backup de nueva configuración realizado
```

### Pruebas de Validación

**Prueba 1: Conectividad Básica**

```bash
# Desde Sede 1
ping 172.16.8.1 (Sede 2)
ping 172.16.12.1 (Sede 3)

# Desde Sede 2
ping 172.16.0.1 (Sede 1)
ping 172.16.12.1 (Sede 3)

# Desde Sede 3
ping 172.16.0.1 (Sede 1)
ping 172.16.8.1 (Sede 2)
```

**Prueba 2: Enrutamiento OSPF**

```bash
# Verificar vecinos
show ip ospf neighbor

# Verificar rutas aprendidas
show ip route ospf

# Verificar base de datos OSPF
show ip ospf database
```

**Prueba 3: Servicios DHCP**

```bash
# Solicitar dirección DHCP desde cliente
ipconfig /release
ipconfig /renew

# Verificar asignación
show ip dhcp binding

# Verificar pool
show ip dhcp pool
```

**Prueba 4: QoS**

```bash
# Generar tráfico de voz (simulado)
# Verificar priorización
show policy-map interface

# Verificar estadísticas de cola
show queue interface GigabitEthernet0/0/1
```

---

## Rollback y Recuperación

### Procedimiento de Rollback Rápido

**Si algo falla durante la implementación:**

```bash
# Opción 1: Revertir configuración guardada
configure terminal
no [comando problemático]
exit

# Opción 2: Restaurar desde startup-config
reload
# Responder "yes" cuando se pregunte

# Opción 3: Restaurar desde backup manual
# (Requiere acceso a servidor TFTP)
copy tftp: running-config
Address or name of remote host []: 192.168.1.100
Source filename []: backup-sede1.cfg
```

### Recuperación de Desastres

**Si el dispositivo no responde:**

```bash
1. Conectar consola física (cable serial)
2. Acceder a BIOS/bootloader
3. Interrumpir boot (Ctrl+C)
4. Restaurar imagen del sistema
5. Restaurar configuración desde backup
6. Reiniciar dispositivo
```

### Backup Automático

```bash
# Script para backup diario (Linux)
#!/bin/bash
DATE=$(date +%Y%m%d)
sshpass -p "password" scp admin@172.16.0.1:/config/running-config \
  /backup/sede1-$DATE.cfg

# Ejecutar con cron
0 2 * * * /scripts/backup.sh
```

---

## Monitoreo Post-Implementación

### Métricas Clave a Monitorear

```
1. Disponibilidad de Interfaces
   - Objetivo: 99.9% uptime
   - Alertar si: Interface DOWN por >5 min

2. Utilización de Ancho de Banda
   - Objetivo: <70% utilización
   - Alertar si: >80% utilización

3. Latencia OSPF
   - Objetivo: <10ms
   - Alertar si: >50ms

4. Pérdida de Paquetes
   - Objetivo: 0%
   - Alertar si: >0.1%

5. Disponibilidad DHCP
   - Objetivo: 100%
   - Alertar si: Pool agotado
```

### Herramientas de Monitoreo Recomendadas

```
Zabbix:
├─ Monitoreo SNMP
├─ Alertas automáticas
└─ Gráficos históricos

Nagios:
├─ Chequeos de servicios
├─ Notificaciones
└─ Reportes

Grafana:
├─ Visualización de datos
├─ Dashboards personalizados
└─ Correlación de eventos
```

### Comandos de Monitoreo

**Cisco:**
```bash
show interfaces | include (errors|drops)
show ip ospf neighbor detail
show ip route summary
```

**Huawei:**
```bash
display interface brief | include (UP|DOWN)
display ospf peer verbose
display ip routing-table statistics
```

**Fortinet:**
```bash
get system performance
diagnose firewall policy list
diagnose traffic list
```

---

## Cronograma de Implementación

```
Semana 1:
├─ Lunes: Preparación y backups
├─ Martes: Implementación Sede 1
├─ Miércoles: Validación Sede 1
└─ Jueves: Implementación Sede 2

Semana 2:
├─ Lunes: Validación Sede 2
├─ Martes: Implementación Sede 3
├─ Miércoles: Validación Sede 3
└─ Jueves-Viernes: Monitoreo y ajustes

Total: 2 semanas
Tiempo de implementación: ~10 horas
Tiempo de validación: ~5 horas
```

---

## Contactos de Soporte

```
Cisco TAC: 1-800-553-6387
Huawei Support: support.huawei.com
Fortinet Support: support.fortinet.com

Contacto Interno:
├─ Network Admin: [correo]
├─ Security Team: [correo]
└─ Operations: [correo]
```

---

## Notas Importantes

⚠️ **CRÍTICO:** Realizar backup antes de cualquier cambio
⚠️ **CRÍTICO:** Tener procedimiento de rollback disponible
⚠️ **IMPORTANTE:** Comunicar cambios a usuarios con anticipación
⚠️ **IMPORTANTE:** Realizar cambios en ventana de mantenimiento
✅ **RECOMENDADO:** Documentar todos los cambios realizados
✅ **RECOMENDADO:** Realizar pruebas en ambiente de laboratorio primero

---

**Documento preparado por:** Red Banda Ancha  
**Versión:** 1.0  
**Última actualización:** Mayo 2026
