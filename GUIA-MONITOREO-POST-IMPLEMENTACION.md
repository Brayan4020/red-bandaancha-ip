# Guía de Monitoreo Post-Implementación - Red Banda Ancha

---

## 1. MÉTRICAS CLAVE A MONITOREAR

### Disponibilidad de Interfaces

**Métrica:** Uptime de interfaces (%)  
**Objetivo:** 99.9% (máximo 43 minutos downtime/mes)  
**Alerta:** Si interface DOWN > 5 minutos

```bash
# CISCO
show interface status
show interface | include (up|down)

# HUAWEI
display interface brief
display interface status

# FORTINET
get system interface
diagnose netlink interface list
```

### Utilización de Ancho de Banda

**Métrica:** Porcentaje de utilización (%)  
**Objetivo:** <70% en horario pico  
**Alerta:** Si >80% utilización sostenida

```bash
# CISCO
show interface GigabitEthernet0/0/1 | include (input rate|output rate)

# HUAWEI
display interface GigabitEthernet0/0/1 | include (Input|Output)

# FORTINET
diagnose traffic list
get system performance
```

### Latencia OSPF

**Métrica:** Tiempo de convergencia (ms)  
**Objetivo:** <10ms entre sedes  
**Alerta:** Si >50ms

```bash
# CISCO
ping 172.16.8.1
ping 172.16.12.1
show ip ospf neighbor detail

# HUAWEI
ping 172.16.8.1
ping 172.16.12.1
display ospf peer verbose

# FORTINET
execute ping 172.16.8.1
execute ping 172.16.12.1
```

### Pérdida de Paquetes

**Métrica:** Porcentaje de pérdida (%)  
**Objetivo:** 0%  
**Alerta:** Si >0.1%

```bash
# Ejecutar ping extendido
ping 172.16.8.1 repeat 100
ping 172.16.12.1 repeat 100

# Analizar resultados
# Ejemplo: "100 packets transmitted, 100 received, 0% packet loss"
```

### Disponibilidad DHCP

**Métrica:** Porcentaje de pools disponibles (%)  
**Objetivo:** 100%  
**Alerta:** Si pool <10% disponible

```bash
# CISCO
show ip dhcp pool
show ip dhcp binding

# HUAWEI
display ip pool
display dhcp server statistics

# FORTINET
show system dhcp server
diagnose dhcp server stat
```

### Disponibilidad de Enrutamiento

**Métrica:** Rutas aprendidas dinámicamente (%)  
**Objetivo:** 100% de rutas disponibles  
**Alerta:** Si falta alguna ruta

```bash
# CISCO
show ip route ospf
show ip route summary

# HUAWEI
display ip routing-table ospf
display ip routing-table statistics

# FORTINET
get router info routing-table all
diagnose ip route list
```

---

## 2. HERRAMIENTAS DE MONITOREO RECOMENDADAS

### Zabbix (Recomendado)

**Instalación:**

```bash
# En servidor Linux
sudo apt-get update
sudo apt-get install zabbix-server-mysql zabbix-frontend-php

# Configurar base de datos
mysql -u root -p
CREATE DATABASE zabbix CHARACTER SET utf8 COLLATE utf8_bin;
GRANT ALL PRIVILEGES ON zabbix.* TO 'zabbix'@'localhost' IDENTIFIED BY 'password';
FLUSH PRIVILEGES;

# Importar esquema
cd /usr/share/doc/zabbix-server-mysql
gunzip create.sql.gz
mysql -u zabbix -p zabbix < create.sql

# Iniciar servicio
sudo systemctl start zabbix-server-mysql
sudo systemctl start zabbix-frontend-php
```

**Configuración de Agentes:**

```bash
# En cada dispositivo de red (si soporta SNMP)
# Habilitar SNMP en Cisco
snmp-server community public RO
snmp-server community private RW
snmp-server host 192.168.1.100 public

# En Zabbix - Agregar dispositivo
Configuration → Hosts → Create Host
├─ Host name: SEDE1-ROUTER
├─ Visible name: Sede 1 - Router
├─ Groups: Network
├─ Interfaces: SNMP, 172.16.0.1, port 161
└─ Templates: Template SNMP Device
```

**Métricas a Monitorear en Zabbix:**

```
├─ Disponibilidad de interfaces (SNMP)
├─ Utilización de CPU (SNMP)
├─ Utilización de memoria (SNMP)
├─ Tráfico de interfaces (SNMP)
├─ Errores de interfaz (SNMP)
├─ Vecinos OSPF (SSH + script)
└─ Conectividad (ICMP ping)
```

### Nagios

**Instalación:**

```bash
# En servidor Linux
sudo apt-get install nagios3 nagios-plugins

# Iniciar servicio
sudo systemctl start nagios3

# Acceder a web: http://localhost/nagios3
# Usuario: nagiosadmin
# Contraseña: [configurar durante instalación]
```

**Configuración de Hosts:**

```bash
# Editar /etc/nagios3/objects/localhost_nagios2.cfg

define host {
    use                     linux-server
    host_name               SEDE1-ROUTER
    alias                   Sede 1 Router
    address                 172.16.0.1
}

define service {
    use                     local-service
    host_name               SEDE1-ROUTER
    service_description     Ping
    check_command           check_ping!100.0,20%!500.0,60%
}

define service {
    use                     local-service
    host_name               SEDE1-ROUTER
    service_description     SSH
    check_command           check_tcp!22
}
```

### Grafana

**Instalación:**

```bash
# En servidor Linux
sudo apt-get install grafana-server

# Iniciar servicio
sudo systemctl start grafana-server

# Acceder a web: http://localhost:3000
# Usuario: admin
# Contraseña: admin
```

**Crear Dashboard:**

```
1. Data Sources → Add data source
   ├─ Type: Prometheus (o Zabbix)
   ├─ URL: http://prometheus:9090
   └─ Save

2. Dashboards → Create dashboard
   ├─ Add panel
   ├─ Metrics: Select from data source
   ├─ Visualization: Graph, Gauge, etc.
   └─ Save
```

---

## 3. COMANDOS DE VALIDACIÓN DIARIA

### Checklist Diario (5 minutos)

```bash
#!/bin/bash
# Script de validación diaria

echo "=== VALIDACIÓN DIARIA RED BANDA ANCHA ==="
echo "Fecha: $(date)"
echo ""

# Sede 1
echo "--- SEDE 1 ---"
ping -c 1 172.16.0.1 && echo "✓ Sede 1 accesible" || echo "✗ Sede 1 NO accesible"

# Sede 2
echo "--- SEDE 2 ---"
ping -c 1 172.16.8.1 && echo "✓ Sede 2 accesible" || echo "✗ Sede 2 NO accesible"

# Sede 3
echo "--- SEDE 3 ---"
ping -c 1 172.16.12.1 && echo "✓ Sede 3 accesible" || echo "✗ Sede 3 NO accesible"

# Conectividad entre sedes
echo "--- CONECTIVIDAD ENTRE SEDES ---"
ping -c 1 172.16.8.1 &>/dev/null && echo "✓ S1 → S2" || echo "✗ S1 → S2"
ping -c 1 172.16.12.1 &>/dev/null && echo "✓ S1 → S3" || echo "✗ S1 → S3"

echo ""
echo "Validación completada: $(date)"
```

### Checklist Semanal (30 minutos)

```bash
# Ejecutar para cada dispositivo

# CISCO
ssh admin@172.16.0.1 << 'EOF'
enable
show ip interface brief
show ip ospf neighbor
show ip route ospf
show ip dhcp binding
show policy-map
EOF

# HUAWEI
ssh admin@172.16.8.1 << 'EOF'
system-view
display interface brief
display ospf peer
display ip routing-table ospf
display dhcp server statistics
EOF

# FORTINET
ssh admin@172.16.12.1 << 'EOF'
get system interface
get router info routing-table all
show system dhcp server
diagnose firewall policy list
EOF
```

### Checklist Mensual (2 horas)

```
1. Revisar logs de todos los dispositivos
2. Analizar tendencias de utilización
3. Revisar alertas generadas
4. Validar backups realizados
5. Actualizar documentación
6. Revisar cambios realizados
7. Planificar mejoras
8. Reunión de revisión con equipo
```

---

## 4. ALERTAS Y NOTIFICACIONES

### Configurar Alertas en Zabbix

```
Configuration → Triggers → Create Trigger

Trigger: Interface DOWN
├─ Name: Interface GigabitEthernet0/0/1 DOWN
├─ Expression: {SEDE1-ROUTER:ifOperStatus[GigabitEthernet0/0/1].last()} = 2
├─ Severity: High
└─ Enabled: Yes

Action: Send notification
├─ Conditions: Trigger severity >= High
├─ Operations: Send to users via Email
└─ Message: Interface DOWN en Sede 1
```

### Configurar Alertas en Nagios

```
define service {
    use                     local-service
    host_name               SEDE1-ROUTER
    service_description     Interface Utilization
    check_command           check_snmp_interface_util!80
    notification_interval   60
    contact_groups          network-admins
}
```

### Notificaciones por Email

```bash
# Configurar postfix para enviar emails
sudo apt-get install postfix
sudo systemctl start postfix

# Configurar en Zabbix
Administration → Users → [Usuario]
├─ Media: Email
├─ Send to: admin@empresa.com
└─ When active: 1-7, 00:00-24:00
```

### Notificaciones por SMS (Opcional)

```bash
# Usar servicio como Twilio
# Configurar webhook en Zabbix para enviar SMS en alertas críticas
```

---

## 5. REPORTES Y ANÁLISIS

### Reporte Diario Automático

```bash
#!/bin/bash
# Generar reporte diario

REPORT_FILE="/reports/reporte-$(date +%Y%m%d).txt"

{
    echo "=== REPORTE DIARIO RED BANDA ANCHA ==="
    echo "Fecha: $(date)"
    echo ""
    
    echo "--- DISPONIBILIDAD ---"
    echo "Sede 1: $(uptime_sede1)%"
    echo "Sede 2: $(uptime_sede2)%"
    echo "Sede 3: $(uptime_sede3)%"
    echo ""
    
    echo "--- UTILIZACIÓN ANCHO DE BANDA ---"
    echo "S1-S2: $(bw_utilization_s1s2)%"
    echo "S2-S3: $(bw_utilization_s2s3)%"
    echo "S1-S3: $(bw_utilization_s1s3)%"
    echo ""
    
    echo "--- ALERTAS GENERADAS ---"
    grep "ALERT" /var/log/network.log | tail -10
    
} > "$REPORT_FILE"

# Enviar por email
mail -s "Reporte Diario Red Banda Ancha" admin@empresa.com < "$REPORT_FILE"
```

### Reporte Mensual

```
Incluir:
├─ Disponibilidad general (%)
├─ Eventos críticos ocurridos
├─ Cambios realizados
├─ Tendencias de utilización
├─ Recomendaciones de mejora
├─ Análisis de rendimiento
└─ Plan de acción para próximo mes
```

---

## 6. ESCALAS DE TIEMPO DE RESPUESTA

| Severidad | Descripción | Tiempo Respuesta | Tiempo Resolución |
|-----------|-------------|------------------|-------------------|
| Crítica | Servicio completamente DOWN | 15 minutos | 1 hora |
| Alta | Servicio degradado >50% | 30 minutos | 4 horas |
| Media | Servicio degradado <50% | 2 horas | 8 horas |
| Baja | Advertencia sin impacto | 8 horas | 24 horas |

---

## 7. PROCEDIMIENTO DE ESCALACIÓN

### Nivel 1: Monitoreo Automático (0-5 min)

```
Sistema detecta problema
↓
Genera alerta
↓
Envía notificación a on-call engineer
```

### Nivel 2: Técnico de Turno (5-30 min)

```
Recibe alerta
↓
Valida problema
↓
Intenta solución rápida
↓
Si no se resuelve → Escalar
```

### Nivel 3: Ingeniero Senior (30-120 min)

```
Acceso remoto
↓
Diagnóstico profundo
↓
Implementar solución
↓
Documentar cambios
```

### Nivel 4: Fabricante (>2 horas)

```
Contactar TAC
↓
Proporcionar acceso remoto
↓
Diagnóstico especializado
↓
Implementar solución
```

---

## 8. MANTENIMIENTO PREVENTIVO

### Semanal

```
- Revisar logs de dispositivos
- Validar backups completados
- Verificar alertas falsas
- Revisar cambios realizados
```

### Mensual

```
- Revisar tendencias de utilización
- Actualizar documentación
- Realizar auditoría de seguridad
- Planificar mejoras
- Reunión de revisión
```

### Trimestral

```
- Revisar capacidad de red
- Planificar expansión si necesario
- Actualizar procedimientos
- Entrenar personal
- Auditoría de configuración
```

### Anual

```
- Revisión completa de infraestructura
- Evaluación de nuevas tecnologías
- Renovación de contratos de soporte
- Planificación de presupuesto
- Actualización de políticas
```

---

## 9. DOCUMENTACIÓN DE INCIDENTES

### Formato de Reporte de Incidente

```
REPORTE DE INCIDENTE
====================

ID Incidente: [AUTO-GENERADO]
Fecha/Hora: [TIMESTAMP]
Severidad: [ ] Crítica [ ] Alta [ ] Media [ ] Baja

Descripción del Problema:
[Descripción detallada]

Impacto:
- Usuarios afectados: [#]
- Servicios afectados: [lista]
- Duración: [tiempo]

Causa Raíz:
[Análisis de causa raíz]

Solución Implementada:
[Pasos tomados]

Tiempo de Resolución: [duración]

Acciones Preventivas:
[Acciones para evitar recurrencia]

Responsable: [nombre]
Fecha Cierre: [fecha]
```

---

## 10. CONTACTOS Y ESCALACIÓN

### Contactos Internos

```
Network Admin: [nombre] [teléfono] [email]
Senior Engineer: [nombre] [teléfono] [email]
Operations Manager: [nombre] [teléfono] [email]
Security Team: [email]
```

### Contactos Externos

```
Cisco TAC: 1-800-553-6387
Huawei Support: support.huawei.com
Fortinet Support: support.fortinet.com
ISP Support: [contacto]
```

### Horarios de Soporte

```
Nivel 1: 24/7
Nivel 2: 24/7
Nivel 3: Lunes-Viernes 8:00-18:00
Nivel 4: Según contrato con fabricante
```

---

**Documento preparado por:** Red Banda Ancha  
**Versión:** 1.0  
**Última actualización:** Mayo 2026  
**Próxima revisión:** Agosto 2026
