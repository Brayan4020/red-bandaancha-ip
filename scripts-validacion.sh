#!/bin/bash

# Script de Validación de Configuraciones de Red
# Soporta: Cisco IOS, Huawei VRP, Fortinet FortiGate
# Uso: ./scripts-validacion.sh <fabricante> <ip> <usuario> <contraseña>

set -e

FABRICANTE=$1
IP=$2
USUARIO=$3
CONTRASEÑA=$4
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="validacion_${FABRICANTE}_${IP}_${TIMESTAMP}.log"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}✓ $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}✗ $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}⚠ $1${NC}" | tee -a "$LOG_FILE"
}

# Validar parámetros
if [ $# -ne 4 ]; then
    echo "Uso: $0 <cisco|huawei|fortinet> <ip> <usuario> <contraseña>"
    echo "Ejemplo: $0 cisco 172.16.0.1 admin password123"
    exit 1
fi

log "=========================================="
log "Iniciando validación de $FABRICANTE"
log "Dispositivo: $IP"
log "Usuario: $USUARIO"
log "=========================================="

# Función para validar conectividad
validar_conectividad() {
    log "Validando conectividad con $IP..."
    if ping -c 1 -W 2 "$IP" &> /dev/null; then
        success "Conectividad OK"
        return 0
    else
        error "No hay conectividad con $IP"
        return 1
    fi
}

# Función para conectar vía SSH y ejecutar comando
ejecutar_ssh() {
    local comando=$1
    sshpass -p "$CONTRASEÑA" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 \
        "$USUARIO@$IP" "$comando" 2>/dev/null
}

# Validación CISCO
validar_cisco() {
    log "Ejecutando validación CISCO IOS..."
    
    # Verificar conectividad
    validar_conectividad || return 1
    
    # Verificar interfaces
    log "Verificando interfaces..."
    INTERFACES=$(ejecutar_ssh "show ip interface brief" | grep -c "up")
    if [ "$INTERFACES" -gt 0 ]; then
        success "Interfaces activas: $INTERFACES"
    else
        error "No hay interfaces activas"
        return 1
    fi
    
    # Verificar OSPF
    log "Verificando OSPF..."
    OSPF_NEIGHBORS=$(ejecutar_ssh "show ip ospf neighbor" | grep -c "FULL" || true)
    if [ "$OSPF_NEIGHBORS" -gt 0 ]; then
        success "Vecinos OSPF: $OSPF_NEIGHBORS"
    else
        warning "No hay vecinos OSPF establecidos"
    fi
    
    # Verificar VLANs
    log "Verificando VLANs..."
    VLANS=$(ejecutar_ssh "show vlan brief" | grep -c "active" || true)
    success "VLANs activas: $VLANS"
    
    # Verificar DHCP
    log "Verificando DHCP..."
    DHCP_BINDINGS=$(ejecutar_ssh "show ip dhcp binding" | grep -c "172.16" || true)
    if [ "$DHCP_BINDINGS" -gt 0 ]; then
        success "Bindings DHCP: $DHCP_BINDINGS"
    else
        warning "No hay bindings DHCP activos"
    fi
    
    # Verificar rutas
    log "Verificando tabla de rutas..."
    RUTAS=$(ejecutar_ssh "show ip route" | grep -c "172.16" || true)
    success "Rutas a 172.16.0.0/16: $RUTAS"
    
    # Verificar QoS
    log "Verificando QoS..."
    QOS=$(ejecutar_ssh "show policy-map" | grep -c "class" || true)
    if [ "$QOS" -gt 0 ]; then
        success "Políticas QoS configuradas: $QOS"
    else
        warning "No hay políticas QoS configuradas"
    fi
    
    success "Validación CISCO completada"
}

# Validación HUAWEI
validar_huawei() {
    log "Ejecutando validación HUAWEI VRP..."
    
    # Verificar conectividad
    validar_conectividad || return 1
    
    # Verificar interfaces
    log "Verificando interfaces..."
    INTERFACES=$(ejecutar_ssh "display interface brief" | grep -c "up" || true)
    if [ "$INTERFACES" -gt 0 ]; then
        success "Interfaces activas: $INTERFACES"
    else
        error "No hay interfaces activas"
        return 1
    fi
    
    # Verificar OSPF
    log "Verificando OSPF..."
    OSPF_NEIGHBORS=$(ejecutar_ssh "display ospf peer" | grep -c "Full" || true)
    if [ "$OSPF_NEIGHBORS" -gt 0 ]; then
        success "Vecinos OSPF: $OSPF_NEIGHBORS"
    else
        warning "No hay vecinos OSPF establecidos"
    fi
    
    # Verificar VLANs
    log "Verificando VLANs..."
    VLANS=$(ejecutar_ssh "display vlan" | grep -c "active" || true)
    success "VLANs activas: $VLANS"
    
    # Verificar DHCP
    log "Verificando DHCP..."
    DHCP_POOLS=$(ejecutar_ssh "display ip pool" | grep -c "172.16" || true)
    if [ "$DHCP_POOLS" -gt 0 ]; then
        success "Pools DHCP: $DHCP_POOLS"
    else
        warning "No hay pools DHCP configurados"
    fi
    
    # Verificar rutas
    log "Verificando tabla de rutas..."
    RUTAS=$(ejecutar_ssh "display ip routing-table" | grep -c "172.16" || true)
    success "Rutas a 172.16.0.0/16: $RUTAS"
    
    success "Validación HUAWEI completada"
}

# Validación FORTINET
validar_fortinet() {
    log "Ejecutando validación FORTINET FORTIGATE..."
    
    # Verificar conectividad
    validar_conectividad || return 1
    
    # Verificar interfaces
    log "Verificando interfaces..."
    INTERFACES=$(ejecutar_ssh "get system interface" | grep -c "up" || true)
    if [ "$INTERFACES" -gt 0 ]; then
        success "Interfaces activas: $INTERFACES"
    else
        error "No hay interfaces activas"
        return 1
    fi
    
    # Verificar rutas
    log "Verificando rutas..."
    RUTAS=$(ejecutar_ssh "get router info routing-table all" | grep -c "172.16" || true)
    success "Rutas a 172.16.0.0/16: $RUTAS"
    
    # Verificar políticas de firewall
    log "Verificando políticas de firewall..."
    POLICIES=$(ejecutar_ssh "show firewall policy" | grep -c "accept" || true)
    success "Políticas activas: $POLICIES"
    
    # Verificar DHCP
    log "Verificando DHCP..."
    DHCP=$(ejecutar_ssh "show system dhcp server" | grep -c "172.16" || true)
    if [ "$DHCP" -gt 0 ]; then
        success "Servidores DHCP: $DHCP"
    else
        warning "No hay servidores DHCP configurados"
    fi
    
    success "Validación FORTINET completada"
}

# Función principal
main() {
    case "$FABRICANTE" in
        cisco)
            validar_cisco
            ;;
        huawei)
            validar_huawei
            ;;
        fortinet)
            validar_fortinet
            ;;
        *)
            error "Fabricante no soportado: $FABRICANTE"
            echo "Fabricantes soportados: cisco, huawei, fortinet"
            exit 1
            ;;
    esac
    
    log "=========================================="
    log "Validación completada"
    log "Log guardado en: $LOG_FILE"
    log "=========================================="
}

# Ejecutar
main

exit 0
