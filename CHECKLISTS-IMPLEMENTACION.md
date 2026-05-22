# Checklists de Implementación - Red Banda Ancha

---

## CHECKLIST GENERAL PRE-IMPLEMENTACIÓN

**Fecha:** _______________  
**Responsable:** _______________  
**Dispositivo:** _______________  
**Fabricante:** _______________

### Preparación

- [ ] Backup de configuración actual realizado
- [ ] Backup guardado en servidor seguro
- [ ] Acceso SSH verificado y funcionando
- [ ] Credenciales de administrador confirmadas
- [ ] Consola física disponible (en caso de emergencia)
- [ ] Ventana de mantenimiento confirmada con usuarios
- [ ] Equipo de soporte disponible
- [ ] Procedimiento de rollback probado
- [ ] Documentación actualizada
- [ ] Herramientas de validación disponibles

### Verificación de Conectividad

- [ ] Ping a dispositivo exitoso
- [ ] SSH accesible
- [ ] Puertos de red conectados
- [ ] Interfaces activas
- [ ] Acceso a internet disponible

### Documentación

- [ ] Topología de red documentada
- [ ] Direccionamiento VLSM confirmado
- [ ] Nombres de dispositivos definidos
- [ ] Contactos de soporte disponibles
- [ ] Procedimiento de escalación definido

---

## CHECKLIST SEDE 1 - TEUSAQUILLO (CISCO)

**Fecha Inicio:** _______________  
**Fecha Fin:** _______________  
**Técnico:** _______________

### Fase 1: Preparación (30 min)

- [ ] Backup de running-config realizado
- [ ] Backup de startup-config realizado
- [ ] Archivo de backup guardado localmente
- [ ] Conectividad con Sede 2 verificada
- [ ] Conectividad con Sede 3 verificada
- [ ] Documentación de estado actual completada

**Tiempo Real:** _____ min  
**Notas:** _________________________________________________

### Fase 2: Configuración Inicial (45 min)

- [ ] Hostname configurado: SEDE1-ROUTER
- [ ] VLANs creadas (10, 20, 30, 40, 99)
- [ ] VLAN 10 (Datos) configurada
- [ ] VLAN 20 (Voz) configurada
- [ ] VLAN 30 (CCTV) configurada
- [ ] VLAN 40 (Servidores) configurada
- [ ] VLAN 99 (Gestión) configurada
- [ ] Interfaz GigabitEthernet0/0/1 configurada (172.16.0.1)
- [ ] Interfaz Vlan10 configurada (172.16.1.1)
- [ ] Interfaz Vlan20 configurada (172.16.2.1)
- [ ] Interfaz Vlan30 configurada (172.16.3.1)
- [ ] Interfaz Vlan40 configurada (172.16.4.1)
- [ ] Interfaz Vlan99 configurada (172.16.5.1)

**Tiempo Real:** _____ min  
**Notas:** _________________________________________________

### Fase 3: Enrutamiento OSPF (30 min)

- [ ] OSPF 1 habilitado
- [ ] Área 0 configurada
- [ ] Red 172.16.0.0/21 agregada a OSPF
- [ ] Red 172.16.8.0/22 agregada a OSPF
- [ ] Red 172.16.12.0/23 agregada a OSPF
- [ ] Vecino 172.16.8.1 agregado
- [ ] Vecino 172.16.12.1 agregado
- [ ] Adyacencia OSPF con Sede 2 verificada
- [ ] Adyacencia OSPF con Sede 3 verificada

**Tiempo Real:** _____ min  
**Notas:** _________________________________________________

### Fase 4: Servicios (30 min)

- [ ] DHCP pool VLAN10 creado (172.16.1.0/24)
- [ ] Gateway DHCP configurado (172.16.1.1)
- [ ] DNS DHCP configurado (8.8.8.8, 8.8.4.4)
- [ ] Lease DHCP configurado (7 días)
- [ ] DHCP pool VLAN20 creado
- [ ] DHCP pool VLAN30 creado
- [ ] Clase de mapeo VOICE creada
- [ ] Política QoS PRIORITY creada
- [ ] QoS aplicado a GigabitEthernet0/0/1
- [ ] QoS aplicado a GigabitEthernet0/0/2

**Tiempo Real:** _____ min  
**Notas:** _________________________________________________

### Fase 5: Verificación (20 min)

- [ ] show running-config ejecutado sin errores
- [ ] show ip interface brief muestra todas las interfaces UP
- [ ] show vlan muestra 5 VLANs activas
- [ ] show ip ospf neighbor muestra 2 vecinos FULL
- [ ] show ip route muestra rutas a todas las sedes
- [ ] show ip dhcp binding muestra al menos 1 cliente
- [ ] show policy-map muestra política PRIORITY
- [ ] Ping a 172.16.8.1 exitoso
- [ ] Ping a 172.16.12.1 exitoso
- [ ] Traceroute a 172.16.8.1 correcto
- [ ] Traceroute a 172.16.12.1 correcto
- [ ] Configuración guardada (write memory)

**Tiempo Real:** _____ min  
**Notas:** _________________________________________________

### Resumen Sede 1

- **Tiempo Total:** _____ horas
- **Estado:** [ ] Completado [ ] Parcial [ ] Fallido
- **Problemas Encontrados:** _________________________________
- **Soluciones Aplicadas:** _________________________________
- **Firma Técnico:** _________________ **Fecha:** _____________

---

## CHECKLIST SEDE 2 - CAMPUS U COMPENSAR (HUAWEI)

**Fecha Inicio:** _______________  
**Fecha Fin:** _______________  
**Técnico:** _______________

### Fase 1: Preparación (30 min)

- [ ] Backup de current-configuration realizado
- [ ] Backup guardado en servidor seguro
- [ ] Conectividad con Sede 1 verificada
- [ ] Conectividad con Sede 3 verificada
- [ ] Documentación de estado actual completada

**Tiempo Real:** _____ min

### Fase 2: Configuración Inicial (45 min)

- [ ] system-view accedido
- [ ] Hostname configurado: SEDE2-ROUTER
- [ ] info-center deshabilitado
- [ ] VLANs creadas (10, 20, 30)
- [ ] Interfaz GigabitEthernet0/0/1 configurada (172.16.8.1)
- [ ] Interfaz Vlanif10 configurada (172.16.9.1)
- [ ] Interfaz Vlanif20 configurada (172.16.10.1)
- [ ] Interfaz Vlanif30 configurada (172.16.11.1)

**Tiempo Real:** _____ min

### Fase 3: Enrutamiento OSPF (30 min)

- [ ] OSPF 1 habilitado
- [ ] Área 0.0.0.0 configurada
- [ ] Red 172.16.0.0/21 agregada
- [ ] Red 172.16.8.0/22 agregada
- [ ] Red 172.16.12.0/23 agregada
- [ ] Adyacencia OSPF con Sede 1 verificada
- [ ] Adyacencia OSPF con Sede 3 verificada

**Tiempo Real:** _____ min

### Fase 4: Servicios (30 min)

- [ ] DHCP habilitado
- [ ] Pool VLAN10 creado (172.16.9.0/24)
- [ ] Pool VLAN20 creado
- [ ] Pool VLAN30 creado
- [ ] Gateway DHCP configurado
- [ ] DNS DHCP configurado

**Tiempo Real:** _____ min

### Fase 5: Verificación (20 min)

- [ ] display current-configuration ejecutado
- [ ] display interface brief muestra interfaces UP
- [ ] display vlan muestra 3 VLANs activas
- [ ] display ospf peer muestra 2 vecinos Full
- [ ] display ip routing-table muestra rutas correctas
- [ ] Ping a 172.16.0.1 exitoso
- [ ] Ping a 172.16.12.1 exitoso
- [ ] Configuración guardada (save)

**Tiempo Real:** _____ min

### Resumen Sede 2

- **Tiempo Total:** _____ horas
- **Estado:** [ ] Completado [ ] Parcial [ ] Fallido
- **Firma Técnico:** _________________ **Fecha:** _____________

---

## CHECKLIST SEDE 3 - AV68 (FORTINET)

**Fecha Inicio:** _______________  
**Fecha Fin:** _______________  
**Técnico:** _______________

### Fase 1: Preparación (30 min)

- [ ] Backup de configuración realizado
- [ ] Backup guardado en servidor seguro
- [ ] Conectividad con Sede 1 verificada
- [ ] Conectividad con Sede 2 verificada
- [ ] Documentación de estado actual completada

**Tiempo Real:** _____ min

### Fase 2: Configuración Inicial (45 min)

- [ ] Hostname configurado: SEDE3-FIREWALL
- [ ] Interfaz port1 configurada (172.16.12.1)
- [ ] Interfaz port2 configurada (172.16.12.129)
- [ ] VLANs configuradas (10, 20)

**Tiempo Real:** _____ min

### Fase 3: Enrutamiento (30 min)

- [ ] Ruta estática a Sede 1 configurada
- [ ] Ruta estática a Sede 2 configurada
- [ ] Gateway por defecto configurado
- [ ] Rutas verificadas con diagnose

**Tiempo Real:** _____ min

### Fase 4: Firewall y Servicios (30 min)

- [ ] Política de firewall creada (permitir tráfico)
- [ ] DHCP server configurado
- [ ] Pool DHCP 172.16.12.0/25 creado
- [ ] Pool DHCP 172.16.12.128/25 creado

**Tiempo Real:** _____ min

### Fase 5: Verificación (20 min)

- [ ] get system status ejecutado
- [ ] get system interface muestra interfaces UP
- [ ] get router info routing-table muestra rutas
- [ ] show firewall policy muestra políticas
- [ ] Ping a 172.16.0.1 exitoso
- [ ] Ping a 172.16.8.1 exitoso
- [ ] Configuración guardada (execute cfg save)

**Tiempo Real:** _____ min

### Resumen Sede 3

- **Tiempo Total:** _____ horas
- **Estado:** [ ] Completado [ ] Parcial [ ] Fallido
- **Firma Técnico:** _________________ **Fecha:** _____________

---

## CHECKLIST POST-IMPLEMENTACIÓN GENERAL

**Fecha:** _______________  
**Responsable:** _______________

### Validación de Conectividad

- [ ] Sede 1 ↔ Sede 2 conectadas
- [ ] Sede 2 ↔ Sede 3 conectadas
- [ ] Sede 1 ↔ Sede 3 conectadas
- [ ] Latencia S1-S2 < 10ms
- [ ] Latencia S2-S3 < 10ms
- [ ] Latencia S1-S3 < 50ms
- [ ] Pérdida de paquetes = 0%

### Validación de Servicios

- [ ] DHCP distribuyendo direcciones en Sede 1
- [ ] DHCP distribuyendo direcciones en Sede 2
- [ ] DHCP distribuyendo direcciones en Sede 3
- [ ] Clientes pueden acceder a internet
- [ ] Clientes pueden comunicarse entre sedes
- [ ] Teléfonos VoIP registrados correctamente
- [ ] Cámaras CCTV conectadas

### Validación de Enrutamiento

- [ ] OSPF establecido en todas las sedes
- [ ] Todas las rutas aprendidas dinámicamente
- [ ] Failover a ruta de respaldo funciona
- [ ] No hay loops de enrutamiento

### Documentación

- [ ] Configuración final documentada
- [ ] Cambios registrados en ticket
- [ ] Backup final realizado
- [ ] Usuarios notificados de cambios
- [ ] Documentación técnica actualizada

### Monitoreo

- [ ] Alertas de monitoreo configuradas
- [ ] Dashboard de monitoreo funcionando
- [ ] Logs siendo recolectados
- [ ] Reportes de rendimiento disponibles

### Firma de Aprobación

- **Técnico Implementador:** _________________ **Fecha:** _______
- **Supervisor:** _________________ **Fecha:** _______
- **Responsable de Red:** _________________ **Fecha:** _______

---

## NOTAS Y OBSERVACIONES

```
Problemas Encontrados:
_________________________________________________________________
_________________________________________________________________

Soluciones Aplicadas:
_________________________________________________________________
_________________________________________________________________

Cambios Realizados vs Plan Original:
_________________________________________________________________
_________________________________________________________________

Recomendaciones para Futuro:
_________________________________________________________________
_________________________________________________________________

Tiempo Total de Implementación: _____ horas
Tiempo Total de Validación: _____ horas
Tiempo Total de Documentación: _____ horas

TIEMPO TOTAL: _____ horas
```

---

**Documento preparado por:** Red Banda Ancha  
**Versión:** 1.0  
**Última actualización:** Mayo 2026
