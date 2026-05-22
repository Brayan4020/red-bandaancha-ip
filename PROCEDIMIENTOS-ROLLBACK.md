# Procedimientos de Rollback y Recuperación - Red Banda Ancha

---

## 1. ROLLBACK RÁPIDO (5-10 minutos)

### Escenario: Error Menor en Configuración

**Síntomas:**
- Interfaz DOWN
- VLAN no accesible
- DHCP no distribuyendo direcciones
- Comando sintácticamente incorrecto

### Procedimiento CISCO

```bash
# Paso 1: Acceder al dispositivo
ssh admin@172.16.0.1
enable
configure terminal

# Paso 2: Identificar el problema
show running-config | include [comando problemático]

# Paso 3: Revertir el comando
no [comando original]

# Ejemplo: Si se configuró mal una interfaz
no interface GigabitEthernet0/0/1
interface GigabitEthernet0/0/1
 ip address 172.16.0.1 255.255.248.0
 no shutdown

# Paso 4: Verificar
show ip interface brief
show running-config interface GigabitEthernet0/0/1

# Paso 5: Guardar
write memory
```

### Procedimiento HUAWEI

```bash
# Paso 1: Acceder al dispositivo
ssh admin@172.16.0.1
system-view

# Paso 2: Identificar el problema
display current-configuration | include [comando]

# Paso 3: Revertir el comando
undo [comando original]

# Ejemplo: Si se configuró mal una interfaz
undo interface GigabitEthernet0/0/1
interface GigabitEthernet0/0/1
 ip address 172.16.0.1 255.255.252.0

# Paso 4: Verificar
display interface brief
display current-configuration interface GigabitEthernet0/0/1

# Paso 5: Guardar
save
quit
```

### Procedimiento FORTINET

```bash
# Paso 1: Acceder al dispositivo
ssh admin@172.16.0.1

# Paso 2: Acceder a configuración
config system interface
edit port1

# Paso 3: Revertir cambios
delete [parámetro]

# Ejemplo: Revertir dirección IP
delete ip
set ip 172.16.0.1 255.255.248.0

# Paso 4: Guardar
end

# Paso 5: Verificar
get system interface
```

---

## 2. ROLLBACK PARCIAL (15-30 minutos)

### Escenario: Error en Sección de Configuración

**Síntomas:**
- Enrutamiento OSPF no funciona
- QoS no aplicado correctamente
- DHCP con problemas
- VLANs no accesibles

### Procedimiento: Restaurar desde Startup-Config

```bash
# CISCO
ssh admin@172.16.0.1
enable
configure terminal

# Eliminar la sección problemática
no router ospf 1

# Reconfigurar desde cero
router ospf 1
 network 172.16.0.0 0.0.7.255 area 0
 neighbor 172.16.8.1
 neighbor 172.16.12.1

# Verificar
show ip ospf neighbor
show ip route ospf

# Guardar
write memory
```

### Procedimiento: Restaurar Sección de Archivo

```bash
# En servidor Linux/Windows con acceso SSH

# Paso 1: Obtener backup anterior
ls -la /backup/sede1-*.cfg

# Paso 2: Extraer sección específica
grep -A 20 "router ospf" /backup/sede1-20260520.cfg

# Paso 3: Aplicar manualmente o vía script
sshpass -p "password" ssh admin@172.16.0.1 << EOF
configure terminal
[pegar comandos de backup]
write memory
EOF
```

---

## 3. ROLLBACK COMPLETO (30-60 minutos)

### Escenario: Falla Crítica o Configuración Completamente Incorrecta

**Síntomas:**
- Dispositivo no responde
- Todas las interfaces DOWN
- No hay conectividad
- Configuración completamente corrupta

### Procedimiento: Restaurar desde Backup

#### Opción A: Vía TFTP (Recomendado)

```bash
# Paso 1: Preparar servidor TFTP en Linux
sudo apt-get install tftpd-hpa
sudo systemctl start tftpd-hpa
sudo cp /backup/sede1-running.cfg /var/lib/tftpboot/

# Paso 2: Conectar vía consola al dispositivo
# (Si SSH no funciona)

# Paso 3: Acceder a modo privilegiado
enable

# Paso 4: Restaurar configuración (CISCO)
copy tftp: running-config
Address or name of remote host []: 192.168.1.100
Source filename []: sede1-running.cfg
Destination filename [running-config]? [Enter]

# Paso 5: Guardar
write memory

# Paso 6: Reiniciar
reload
```

#### Opción B: Vía SCP

```bash
# Paso 1: Copiar archivo al dispositivo
scp /backup/sede1-running.cfg admin@172.16.0.1:/tmp/

# Paso 2: Conectar y restaurar (CISCO)
ssh admin@172.16.0.1
enable
configure terminal

# Paso 3: Cargar configuración
copy /tmp/sede1-running.cfg running-config

# Paso 4: Guardar
write memory
```

#### Opción C: Restaurar Startup-Config

```bash
# CISCO - Si startup-config tiene backup válido
ssh admin@172.16.0.1
enable

# Ver startup-config
show startup-config

# Si es válido, recargar
reload

# Responder "yes" cuando se pregunte
Proceed with reload? [confirm] yes

# El dispositivo se reiniciará con startup-config
```

### Procedimiento: Restaurar HUAWEI

```bash
# Paso 1: Preparar backup
scp /backup/sede2-huawei.cfg admin@172.16.8.1:/tmp/

# Paso 2: Restaurar
ssh admin@172.16.8.1
system-view

# Paso 3: Cargar configuración
load /tmp/sede2-huawei.cfg

# Paso 4: Guardar
save

# Paso 5: Reiniciar si es necesario
reboot
```

### Procedimiento: Restaurar FORTINET

```bash
# Paso 1: Preparar backup
scp /backup/sede3-fortinet.cfg admin@172.16.12.1:/tmp/

# Paso 2: Restaurar
ssh admin@172.16.12.1

# Paso 3: Cargar configuración
execute restore config tftp sede3-fortinet.cfg 192.168.1.100

# Paso 4: Reiniciar
execute reboot
```

---

## 4. RECUPERACIÓN DE DESASTRES (1-2 horas)

### Escenario: Dispositivo Completamente Inoperativo

**Síntomas:**
- No hay respuesta SSH
- No hay respuesta ICMP (ping)
- LED de dispositivo apagado o rojo
- Dispositivo bloqueado

### Procedimiento: Acceso por Consola

```bash
# Paso 1: Conectar cable serial/consola
# Usar: PuTTY, minicom, o terminal nativa
# Velocidad: 9600 bps, 8 bits, sin paridad

# Paso 2: Encender dispositivo
# Observar mensajes de boot

# Paso 3: Interrumpir boot (presionar Ctrl+C)
# Esto lleva al bootloader/ROMMON

# CISCO - ROMMON prompt
rommon 1 >

# Paso 4: Configurar IP temporal
confreg 0x2102
set IP_ADDRESS 192.168.1.1
set IP_SUBNET_MASK 255.255.255.0
set DEFAULT_GATEWAY 192.168.1.254

# Paso 5: Iniciar dispositivo
boot

# Paso 6: Una vez en modo operativo
enable
configure terminal
```

### Procedimiento: Restaurar Imagen del Sistema

```bash
# Si la imagen está corrupta

# CISCO - Desde ROMMON
rommon 1 > IP_ADDRESS=192.168.1.1
rommon 2 > IP_SUBNET_MASK=255.255.255.0
rommon 3 > DEFAULT_GATEWAY=192.168.1.254
rommon 4 > TFTP_SERVER=192.168.1.100
rommon 5 > TFTP_FILE=c2900-universalk9-mz.155-3.M.bin
rommon 6 > tftpdnld

# Esperar a que se descargue la imagen
# Luego reiniciar
rommon 7 > reset
```

### Procedimiento: Reset de Contraseña

```bash
# Si se olvida la contraseña enable

# CISCO - Desde ROMMON
rommon 1 > confreg 0x2142
# Esto hace boot sin leer startup-config

# Una vez en modo operativo
enable
# No pide contraseña

# Copiar startup-config a running-config
copy startup-config running-config

# Cambiar contraseña
configure terminal
enable password [nueva_contraseña]
enable secret [nueva_contraseña_encriptada]
exit

# Restaurar configuración normal
configure terminal
config-register 0x2102
exit

# Guardar
write memory
reload
```

---

## 5. PROCEDIMIENTO DE ESCALACIÓN

### Nivel 1: Técnico de Campo (0-15 minutos)

```
1. Intentar rollback rápido
2. Verificar conectividad básica
3. Revisar logs del dispositivo
4. Si no se resuelve → Escalar a Nivel 2
```

### Nivel 2: Ingeniero de Red (15-60 minutos)

```
1. Acceder remotamente vía SSH/VPN
2. Revisar configuración completa
3. Ejecutar rollback parcial
4. Restaurar desde backup si es necesario
5. Si no se resuelve → Escalar a Nivel 3
```

### Nivel 3: Especialista de Fabricante (1-4 horas)

```
1. Contactar TAC del fabricante
2. Acceso remoto con especialista
3. Diagnosticar problema profundo
4. Posible restauración de imagen del sistema
5. Reconfiguración desde cero si es necesario
```

### Contactos de Escalación

```
Cisco TAC: 1-800-553-6387
Huawei Support: support.huawei.com
Fortinet Support: support.fortinet.com

Contacto Interno:
Network Admin: [correo]
Security Team: [correo]
Operations Manager: [teléfono]
```

---

## 6. MATRIZ DE DECISIÓN DE ROLLBACK

| Problema | Severidad | Tiempo | Acción Recomendada |
|----------|-----------|--------|-------------------|
| Comando incorrecto | Baja | 5 min | Rollback rápido (no comando) |
| Interfaz DOWN | Media | 10 min | Reconfigurar interfaz |
| OSPF no funciona | Media | 20 min | Rollback parcial OSPF |
| Todas interfaces DOWN | Alta | 30 min | Restaurar desde backup |
| Dispositivo no responde | Crítica | 60 min | Acceso consola + restaurar imagen |
| Configuración corrupta | Crítica | 120 min | Restaurar desde backup completo |

---

## 7. CHECKLIST DE ROLLBACK

### Antes de Ejecutar Rollback

- [ ] Documentar problema exacto
- [ ] Tomar screenshot del error
- [ ] Guardar logs del dispositivo
- [ ] Notificar a usuarios
- [ ] Tener backup disponible
- [ ] Verificar acceso a servidor TFTP
- [ ] Tener procedimiento de rollback a mano
- [ ] Equipo de soporte disponible

### Durante Rollback

- [ ] Ejecutar comandos lentamente
- [ ] Verificar cada paso
- [ ] No cerrar sesión SSH
- [ ] Documentar cambios realizados
- [ ] Tomar notas de errores

### Después de Rollback

- [ ] Verificar conectividad
- [ ] Verificar servicios funcionan
- [ ] Notificar a usuarios
- [ ] Documentar causa raíz
- [ ] Crear ticket de mejora
- [ ] Realizar backup de configuración final

---

## 8. PREVENCIÓN DE PROBLEMAS

### Mejores Prácticas

```
1. Siempre hacer backup antes de cambios
2. Realizar cambios en ventana de mantenimiento
3. Probar cambios en laboratorio primero
4. Documentar todos los cambios
5. Mantener procedimientos actualizados
6. Entrenar al equipo regularmente
7. Realizar auditorías de configuración
8. Implementar cambios gradualmente
```

### Automatización de Backups

```bash
# Script para backup automático diario
#!/bin/bash
DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup"

# Cisco
sshpass -p "password" scp admin@172.16.0.1:/config/running-config \
  $BACKUP_DIR/sede1-cisco-$DATE.cfg

# Huawei
sshpass -p "password" scp admin@172.16.8.1:/config/running-config \
  $BACKUP_DIR/sede2-huawei-$DATE.cfg

# Fortinet
sshpass -p "password" scp admin@172.16.12.1:/config/running-config \
  $BACKUP_DIR/sede3-fortinet-$DATE.cfg

# Limpiar backups antiguos (>30 días)
find $BACKUP_DIR -mtime +30 -delete
```

---

**Documento preparado por:** Red Banda Ancha  
**Versión:** 1.0  
**Última actualización:** Mayo 2026  
**Próxima revisión:** Agosto 2026
