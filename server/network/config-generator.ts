/**
 * Configuration Generator
 * Generates complete configuration commands for network devices
 * Supports: Huawei VRP, Cisco IOS, Fortinet FortiGate
 */

export interface ConfigGeneratorInput {
  siteId: "sede1" | "sede2" | "sede3";
  vendor: "huawei" | "cisco" | "fortinet";
  deviceType: "switch" | "router" | "firewall";
  ipBase?: string; // Base network for dynamic IP planning (e.g., "192.168.1.0/24")
  ipLoopback?: string; // Loopback IP for router (e.g., "10.0.0.1")
}

export interface ConfigurationOutput {
  vendor: string;
  deviceType: string;
  site: string;
  commands: string[];
  sections: ConfigSection[];
  timestamp: number;
}

export interface ConfigSection {
  name: string;
  description: string;
  commands: string[];
}

// VLSM Configuration Data
const VLSM_CONFIG = {
  sede1: {
    name: "Teusaquillo",
    network: "172.16.0.0/21",
    mask: "255.255.248.0",
    gateway: "172.16.0.1",
    hosts: 1600,
    vlans: {
      datos: { id: 10, subnet: "172.16.0.0/24" },
      voz: { id: 20, subnet: "172.16.1.0/24" },
      cctv: { id: 30, subnet: "172.16.2.0/24" },
      servidores: { id: 40, subnet: "172.16.3.0/24" },
      gestion: { id: 99, subnet: "172.16.4.0/24" },
    },
  },
  sede2: {
    name: "Campus U Compensar",
    network: "172.16.8.0/22",
    mask: "255.255.252.0",
    gateway: "172.16.8.1",
    hosts: 600,
    vlans: {
      datos: { id: 10, subnet: "172.16.8.0/25" },
      voz: { id: 20, subnet: "172.16.8.128/25" },
      cctv: { id: 30, subnet: "172.16.9.0/25" },
      servidores: { id: 40, subnet: "172.16.9.128/25" },
      gestion: { id: 99, subnet: "172.16.10.0/25" },
    },
  },
  sede3: {
    name: "AV68",
    network: "172.16.12.0/23",
    mask: "255.255.254.0",
    gateway: "172.16.12.1",
    hosts: 400,
    vlans: {
      datos: { id: 10, subnet: "172.16.12.0/26" },
      voz: { id: 20, subnet: "172.16.12.64/26" },
      cctv: { id: 30, subnet: "172.16.12.128/26" },
      servidores: { id: 40, subnet: "172.16.12.192/26" },
      gestion: { id: 99, subnet: "172.16.13.0/26" },
    },
  },
};

/**
 * Calculate dynamic IP planning based on base network
 * Extracts three octets and creates VLAN IPs
 */
function calcularIPPlanning(ipBase: string) {
  if (!ipBase) return null;
  
  const partes = ipBase.split('/')[0].split('.');
  const tresOctetos = `${partes[0]}.${partes[1]}.${partes[2]}`;
  
  return {
    vlan10: { nombre: "VLAN_DATOS", id: "10", ip: `${tresOctetos}.1`, mascara: "255.255.255.0" },
    vlan20: { nombre: "VLAN_VOZ", id: "20", ip: `${tresOctetos}.2`, mascara: "255.255.255.0" },
    vlan30: { nombre: "VLAN_MGMT", id: "30", ip: `${tresOctetos}.254`, mascara: "255.255.255.0" },
  };
}

/**
 * Generate Huawei VRP Configuration
 */
export function generateHuaweiConfig(
  input: ConfigGeneratorInput
): ConfigurationOutput {
  const site = VLSM_CONFIG[input.siteId];
  const sections: ConfigSection[] = [];
  const allCommands: string[] = [];
  
  // Calculate dynamic IP planning if provided
  const ipPlanning = input.ipBase ? calcularIPPlanning(input.ipBase) : null;

  // Initial Access Commands
  const initialCommands = [
    `system-view`,
    `undo info-center enable`,
  ];
  sections.push({
    name: "Initial Access",
    description: "Enter system view mode and disable info-center",
    commands: initialCommands,
  });
  allCommands.push(...initialCommands);

  // System Configuration
  const systemCommands: string[] = [
    `sysName SW-${input.siteId.toUpperCase()}-${site.name.split(" ")[0]}`,
    `snmp-agent sys-info version all`,
    `snmp-agent community read public`,
    `snmp-agent community write private`,
    `clock timezone UTC add 00:00:00`,
    `ntp-service unicast-server 172.16.0.254 preference`,
    
  ];
  
  // Add Loopback interface if ipLoopback is provided
  if (input.ipLoopback) {
    systemCommands.push(`interface LoopBack0`);
    systemCommands.push(` ip address ${input.ipLoopback} 255.255.255.255`);
  }
  
  systemCommands.push(`save`);
  sections.push({
    name: "System Configuration",
    description: "Basic system settings, hostname, SNMP, NTP",
    commands: systemCommands,
  });
  allCommands.push(...systemCommands);

  // VLAN Configuration - Use dynamic IPs if available
  const vlanCommands = [
    `vlan batch 10 20 30 40 99`,
    `interface Vlanif10`,
    ` description VLAN-DATOS-${input.siteId.toUpperCase()}`,
    ` ip address ${ipPlanning?.vlan10.ip || site.vlans.datos.subnet.split("/")[0]} 255.255.255.0`,
    ` no shutdown`,
    `interface Vlanif20`,
    ` description VLAN-VOZ-${input.siteId.toUpperCase()}`,
    ` ip address ${ipPlanning?.vlan20.ip || site.vlans.voz.subnet.split("/")[0]} 255.255.255.0`,
    ` no shutdown`,
    `interface Vlanif30`,
    ` description VLAN-CCTV-${input.siteId.toUpperCase()}`,
    ` ip address ${ipPlanning?.vlan30.ip || site.vlans.cctv.subnet.split("/")[0]} 255.255.255.0`,
    ` no shutdown`,
    `interface Vlanif40`,
    ` description VLAN-SERVIDORES-${input.siteId.toUpperCase()}`,
    ` ip address ${site.vlans.servidores.subnet.split("/")[0]} 255.255.255.0`,
    ` no shutdown`,
    `interface Vlanif99`,
    ` description VLAN-GESTION-${input.siteId.toUpperCase()}`,
    ` ip address ${site.gateway} 255.255.255.0`,
    ` no shutdown`,
  ];
  sections.push({
    name: "VLAN Configuration",
    description: "Create and configure VLANs 10, 20, 30, 40, 99 with IP addresses",
    commands: vlanCommands,
  });
  allCommands.push(...vlanCommands);

  // Interface Configuration (Access Ports)
  const interfaceCommands = [
    `interface GigabitEthernet0/0/1`,
    ` description ACCESS-DATOS-PUERTO1`,
    ` port link-type access`,
    ` port default vlan 10`,
    ` no shutdown`,
    `interface range GigabitEthernet0/0/2 to GigabitEthernet0/0/24`,
    ` description ACCESS-DATOS-PUERTOS2-24`,
    ` port link-type access`,
    ` port default vlan 10`,
    ` no shutdown`,
    `interface GigabitEthernet0/0/25`,
    ` description TRUNK-SEDE1-SEDE2`,
    ` port link-type trunk`,
    ` port trunk allow-pass vlan 10 20 30 40 99`,
    ` no shutdown`,
    `interface GigabitEthernet0/0/26`,
    ` description TRUNK-SEDE1-SEDE3`,
    ` port link-type trunk`,
    ` port trunk allow-pass vlan 10 20 30 40 99`,
    ` no shutdown`,
  ];
  sections.push({
    name: "Interface Configuration",
    description: "Configure access and trunk ports",
    commands: interfaceCommands,
  });
  allCommands.push(...interfaceCommands);

  // OSPF Configuration
  const ospfCommands = [
    `ospf 1 router-id 172.16.0.254`,
    ` area 0.0.0.0`,
    ` network ${site.network.split("/")[0]} 0.0.7.255 area 0.0.0.0`,
    ` network 172.16.0.0 0.0.15.255 area 0.0.0.0`,
    ` default-route-advertise always`,
    ` bfd all-interfaces enable`,
  ];
  sections.push({
    name: "OSPF Configuration",
    description: "Enable OSPF routing with BFD for fast convergence",
    commands: ospfCommands,
  });
  allCommands.push(...ospfCommands);

  // QoS Configuration
  const qosCommands = [
    `traffic classifier VOZ operator or`,
    ` if-match vlan 20`,
    `traffic classifier CCTV operator or`,
    ` if-match vlan 30`,
    `traffic behavior VOZ`,
    ` remark 46`,
    ` queue af3`,
    `traffic behavior CCTV`,
    ` remark 34`,
    ` queue af2`,
    `traffic policy POLITICA-QOS match-order auto`,
    ` classifier VOZ behavior VOZ`,
    ` classifier CCTV behavior CCTV`,
    `interface Vlanif10`,
    ` traffic-policy POLITICA-QOS inbound`,
    `interface Vlanif20`,
    ` traffic-policy POLITICA-QOS inbound`,
    `interface Vlanif30`,
    ` traffic-policy POLITICA-QOS inbound`,
  ];
  sections.push({
    name: "QoS Configuration",
    description: "Configure QoS policies for voice and video traffic",
    commands: qosCommands,
  });
  allCommands.push(...qosCommands);

  // DHCP Configuration
  const dhcpCommands = [
    `dhcp enable`,
    `ip pool DATOS-POOL`,
    ` network 172.16.0.0 mask 255.255.255.0`,
    ` gateway-list 172.16.0.1`,
    ` dns-list 8.8.8.8 8.8.4.4`,
    ` lease day 1 hour 0 minute 0`,
    `ip pool VOZ-POOL`,
    ` network 172.16.1.0 mask 255.255.255.0`,
    ` gateway-list 172.16.1.1`,
    ` lease day 1 hour 0 minute 0`,
    `interface Vlanif10`,
    ` dhcp select global`,
    `interface Vlanif20`,
    ` dhcp select global`,
  ];
  sections.push({
    name: "DHCP Configuration",
    description: "Configure DHCP pools for data and voice VLANs",
    commands: dhcpCommands,
  });
  allCommands.push(...dhcpCommands);

  // Security Configuration
  const securityCommands = [
    `acl number 2000`,
    ` rule 5 permit ip source 172.16.0.0 0.0.15.255 destination 172.16.0.0 0.0.15.255`,
    ` rule 10 permit ip source 172.16.0.0 0.0.15.255 destination any`,
    ` rule 15 deny ip source any destination 172.16.0.0 0.0.15.255`,
    `interface Vlanif99`,
    ` traffic-filter inbound acl 2000`,
    `stp enable`,
    `stp mode rstp`,
    `stp priority 4096`,
  ];
  sections.push({
    name: "Security Configuration",
    description: "Configure ACLs, spanning tree, and port security",
    commands: securityCommands,
  });
  allCommands.push(...securityCommands);

  // Monitoring Configuration
  const monitoringCommands = [
    `snmp-agent trap enable`,
    `snmp-agent trap all enable`,
    `netconf ssh server enable`,
    `netconf ssh server port 830`,
    `logging buffered 4096`,
    `logging host 172.16.0.254 facility local7 severity informational`,
    `save`,
  ];
  sections.push({
    name: "Monitoring Configuration",
    description: "Enable SNMP traps, syslog, and NETCONF for monitoring",
    commands: monitoringCommands,
  });
  allCommands.push(...monitoringCommands);

  return {
    vendor: "Huawei VRP",
    deviceType: input.deviceType,
    site: input.siteId,
    commands: allCommands,
    sections,
    timestamp: Date.now(),
  };
}

/**
 * Generate Cisco IOS Configuration
 */
export function generateCiscoConfig(
  input: ConfigGeneratorInput
): ConfigurationOutput {
  const site = VLSM_CONFIG[input.siteId];
  const sections: ConfigSection[] = [];
  const allCommands: string[] = [];

  // Initial Access Commands
  const initialCommands = [
    `enable`,
    `configure terminal`,
  ];
  sections.push({
    name: "Initial Access",
    description: "Enter privileged mode and configuration mode",
    commands: initialCommands,
  });
  allCommands.push(...initialCommands);

  // System Configuration
  const systemCommands = [
    `hostname SW-${input.siteId.toUpperCase()}-${site.name.split(" ")[0]}`,
    `enable password 7 [encrypted]`,
    `service password-encryption`,
    `no ip domain-lookup`,
    `clock timezone UTC 0`,
    `ntp server 172.16.0.254 prefer`,
  ];
  sections.push({
    name: "System Configuration",
    description: "Basic system settings, hostname, NTP",
    commands: systemCommands,
  });
  allCommands.push(...systemCommands);

  // VLAN Configuration
  const vlanCommands = [
    `vlan 10`,
    ` name VLAN-DATOS`,
    `vlan 20`,
    ` name VLAN-VOZ`,
    `vlan 30`,
    ` name VLAN-CCTV`,
    `vlan 40`,
    ` name VLAN-SERVIDORES`,
    `vlan 99`,
    ` name VLAN-GESTION`,
    `interface Vlan10`,
    ` description VLAN-DATOS-${input.siteId.toUpperCase()}`,
    ` ip address 172.16.0.1 255.255.255.0`,
    ` no shutdown`,
    `interface Vlan20`,
    ` description VLAN-VOZ-${input.siteId.toUpperCase()}`,
    ` ip address 172.16.1.1 255.255.255.0`,
    ` no shutdown`,
    `interface Vlan30`,
    ` description VLAN-CCTV-${input.siteId.toUpperCase()}`,
    ` ip address 172.16.2.1 255.255.255.0`,
    ` no shutdown`,
    `interface Vlan40`,
    ` description VLAN-SERVIDORES-${input.siteId.toUpperCase()}`,
    ` ip address 172.16.3.1 255.255.255.0`,
    ` no shutdown`,
    `interface Vlan99`,
    ` description VLAN-GESTION-${input.siteId.toUpperCase()}`,
    ` ip address ${site.gateway} 255.255.255.0`,
    ` no shutdown`,
  ];
  sections.push({
    name: "VLAN Configuration",
    description: "Create and configure VLANs with IP addresses",
    commands: vlanCommands,
  });
  allCommands.push(...vlanCommands);

  // Interface Configuration
  const interfaceCommands = [
    `interface range GigabitEthernet1/0/1-24`,
    ` description ACCESS-DATOS`,
    ` switchport mode access`,
    ` switchport access vlan 10`,
    ` spanning-tree portfast`,
    ` no shutdown`,
    `interface GigabitEthernet1/0/25`,
    ` description TRUNK-SEDE1-SEDE2`,
    ` switchport mode trunk`,
    ` switchport trunk allowed vlan 10,20,30,40,99`,
    ` no shutdown`,
    `interface GigabitEthernet1/0/26`,
    ` description TRUNK-SEDE1-SEDE3`,
    ` switchport mode trunk`,
    ` switchport trunk allowed vlan 10,20,30,40,99`,
    ` no shutdown`,
  ];
  sections.push({
    name: "Interface Configuration",
    description: "Configure access and trunk ports",
    commands: interfaceCommands,
  });
  allCommands.push(...interfaceCommands);

  // OSPF Configuration
  const ospfCommands = [
    `router ospf 1`,
    ` router-id 172.16.0.254`,
    ` network 172.16.0.0 0.0.15.255 area 0`,
    ` default-information originate always`,
    ` auto-cost reference-bandwidth 100000`,
  ];
  sections.push({
    name: "OSPF Configuration",
    description: "Enable OSPF routing protocol",
    commands: ospfCommands,
  });
  allCommands.push(...ospfCommands);

  // QoS Configuration
  const qosCommands = [
    `class-map match-any VOZ`,
    ` match vlan 20`,
    `class-map match-any CCTV`,
    ` match vlan 30`,
    `policy-map POLITICA-QOS`,
    ` class VOZ`,
    `  set dscp ef`,
    `  priority 100`,
    ` class CCTV`,
    `  set dscp af31`,
    `  bandwidth 50`,
    ` class class-default`,
    `  fair-queue`,
    `interface Vlan10`,
    ` service-policy input POLITICA-QOS`,
    `interface Vlan20`,
    ` service-policy input POLITICA-QOS`,
  ];
  sections.push({
    name: "QoS Configuration",
    description: "Configure QoS policies for voice and video",
    commands: qosCommands,
  });
  allCommands.push(...qosCommands);

  // DHCP Configuration
  const dhcpCommands = [
    `ip dhcp pool DATOS-POOL`,
    ` network 172.16.0.0 255.255.255.0`,
    ` default-router 172.16.0.1`,
    ` dns-server 8.8.8.8 8.8.4.4`,
    ` lease 1 0 0`,
    `ip dhcp pool VOZ-POOL`,
    ` network 172.16.1.0 255.255.255.0`,
    ` default-router 172.16.1.1`,
    ` lease 1 0 0`,
  ];
  sections.push({
    name: "DHCP Configuration",
    description: "Configure DHCP pools",
    commands: dhcpCommands,
  });
  allCommands.push(...dhcpCommands);

  // Security Configuration
  const securityCommands = [
    `access-list 2000 permit ip 172.16.0.0 0.0.15.255 172.16.0.0 0.0.15.255`,
    `access-list 2000 permit ip 172.16.0.0 0.0.15.255 any`,
    `access-list 2000 deny ip any 172.16.0.0 0.0.15.255`,
    `interface Vlan99`,
    ` ip access-group 2000 in`,
    `spanning-tree mode rapid-pvst`,
    `spanning-tree vlan 10,20,30,40,99 priority 4096`,
  ];
  sections.push({
    name: "Security Configuration",
    description: "Configure ACLs and spanning tree",
    commands: securityCommands,
  });
  allCommands.push(...securityCommands);

  // Monitoring Configuration
  const monitoringCommands = [
    `snmp-server community public RO`,
    `snmp-server community private RW`,
    `snmp-server trap-source Vlan99`,
    `snmp-server enable traps all`,
    `logging host 172.16.0.254`,
    `logging trap informational`,
    `logging buffered 4096`,
  ];
  sections.push({
    name: "Monitoring Configuration",
    description: "Enable SNMP and syslog",
    commands: monitoringCommands,
  });
  allCommands.push(...monitoringCommands);

  // Save Configuration
  const saveCommands = [
    `end`,
    `write memory`,
  ];
  sections.push({
    name: "Save Configuration",
    description: "Exit configuration mode and save running config to startup config",
    commands: saveCommands,
  });
  allCommands.push(...saveCommands);

  return {
    vendor: "Cisco IOS",
    deviceType: input.deviceType,
    site: input.siteId,
    commands: allCommands,
    sections,
    timestamp: Date.now(),
  };
}

/**
 * Generate Fortinet FortiGate Configuration
 */
export function generateFortinetConfig(
  input: ConfigGeneratorInput
): ConfigurationOutput {
  const site = VLSM_CONFIG[input.siteId];
  const sections: ConfigSection[] = [];
  const allCommands: string[] = [];

  // Initial Access Commands
  const initialCommands = [
    `config system global`,
  ];
  sections.push({
    name: "Initial Access",
    description: "Enter global configuration mode",
    commands: initialCommands,
  });
  allCommands.push(...initialCommands);

  // System Configuration
  const systemCommands = [
    ` set hostname FW-${input.siteId.toUpperCase()}-${site.name.split(" ")[0]}`,
    ` set timezone UTC`,
    ` set ntp-server 172.16.0.254`,
    `end`,
  ];
  sections.push({
    name: "System Configuration",
    description: "Basic firewall settings, hostname, NTP",
    commands: systemCommands,
  });
  allCommands.push(...systemCommands);

  // Interface Configuration
  const interfaceCommands = [
    `config system interface`,
    ` edit port1`,
    `  set vdom root`,
    `  set ip 172.16.0.254 255.255.248.0`,
    `  set description LAN-DATOS`,
    `  set type physical`,
    ` next`,
    ` edit port2`,
    `  set vdom root`,
    `  set ip 172.16.8.254 255.255.252.0`,
    `  set description WAN-SEDE2`,
    `  set type physical`,
    ` next`,
    ` edit port3`,
    `  set vdom root`,
    `  set ip 172.16.12.254 255.255.254.0`,
    `  set description WAN-SEDE3`,
    `  set type physical`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "Interface Configuration",
    description: "Configure LAN and WAN interfaces",
    commands: interfaceCommands,
  });
  allCommands.push(...interfaceCommands);

  // VLAN Configuration
  const vlanCommands = [
    `config system interface`,
    ` edit vlan10`,
    `  set vdom root`,
    `  set ip 172.16.0.1 255.255.255.0`,
    `  set description VLAN-DATOS`,
    `  set vlanid 10`,
    `  set interface port1`,
    ` next`,
    ` edit vlan20`,
    `  set vdom root`,
    `  set ip 172.16.1.1 255.255.255.0`,
    `  set description VLAN-VOZ`,
    `  set vlanid 20`,
    `  set interface port1`,
    ` next`,
    ` edit vlan30`,
    `  set vdom root`,
    `  set ip 172.16.2.1 255.255.255.0`,
    `  set description VLAN-CCTV`,
    `  set vlanid 30`,
    `  set interface port1`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "VLAN Configuration",
    description: "Configure VLANs on firewall",
    commands: vlanCommands,
  });
  allCommands.push(...vlanCommands);

  // Firewall Policy Configuration
  const policyCommands = [
    `config firewall policy`,
    ` edit 1`,
    `  set name DATOS-INTRA`,
    `  set srcintf vlan10`,
    `  set dstintf vlan10`,
    `  set srcaddr all`,
    `  set dstaddr all`,
    `  set action accept`,
    `  set schedule always`,
    `  set service ALL`,
    ` next`,
    ` edit 2`,
    `  set name VOZ-INTRA`,
    `  set srcintf vlan20`,
    `  set dstintf vlan20`,
    `  set srcaddr all`,
    `  set dstaddr all`,
    `  set action accept`,
    `  set schedule always`,
    `  set service ALL`,
    ` next`,
    ` edit 3`,
    `  set name DATOS-WAN`,
    `  set srcintf vlan10`,
    `  set dstintf port2`,
    `  set srcaddr all`,
    `  set dstaddr all`,
    `  set action accept`,
    `  set schedule always`,
    `  set service ALL`,
    `  set logtraffic all`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "Firewall Policy Configuration",
    description: "Configure firewall policies for inter-VLAN and WAN traffic",
    commands: policyCommands,
  });
  allCommands.push(...policyCommands);

  // QoS Configuration
  const qosCommands = [
    `config firewall traffic-shaper`,
    ` edit VOZ-SHAPER`,
    `  set guaranteed-bandwidth 20000`,
    `  set maximum-bandwidth 50000`,
    ` next`,
    ` edit CCTV-SHAPER`,
    `  set guaranteed-bandwidth 15000`,
    `  set maximum-bandwidth 30000`,
    ` next`,
    `end`,
    `config firewall traffic-class`,
    ` edit VOZ-CLASS`,
    `  set classid 1`,
    ` next`,
    ` edit CCTV-CLASS`,
    `  set classid 2`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "QoS Configuration",
    description: "Configure traffic shaping for voice and video",
    commands: qosCommands,
  });
  allCommands.push(...qosCommands);

  // VPN Configuration (IPSec)
  const vpnCommands = [
    `config vpn ipsec phase1-interface`,
    ` edit SEDE1-SEDE2`,
    `  set interface port2`,
    `  set peertype any`,
    `  set peer 172.16.8.254`,
    `  set psksecret [secret]`,
    `  set proposal aes128-sha256`,
    `  set dhgrp 14`,
    ` next`,
    ` edit SEDE1-SEDE3`,
    `  set interface port3`,
    `  set peertype any`,
    `  set peer 172.16.12.254`,
    `  set psksecret [secret]`,
    `  set proposal aes128-sha256`,
    `  set dhgrp 14`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "VPN Configuration",
    description: "Configure IPSec VPN tunnels between sites",
    commands: vpnCommands,
  });
  allCommands.push(...vpnCommands);

  // Security Configuration
  const securityCommands = [
    `config firewall address`,
    ` edit REDE-INTERNA`,
    `  set subnet 172.16.0.0 255.255.0.0`,
    ` next`,
    `end`,
    `config firewall addrgrp`,
    ` edit REDES-INTERNAS`,
    `  set member REDE-INTERNA`,
    ` next`,
    `end`,
    `config firewall service custom`,
    ` edit DADOS-SERVICE`,
    `  set tcp-portrange 1:65535`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "Security Configuration",
    description: "Configure firewall objects and address groups",
    commands: securityCommands,
  });
  allCommands.push(...securityCommands);

  // Monitoring Configuration
  const monitoringCommands = [
    `config log syslogd setting`,
    ` set status enable`,
    ` set server 172.16.0.254`,
    ` set port 514`,
    `end`,
    `config log memory setting`,
    ` set status enable`,
    ` set diskquota 100`,
    `end`,
    `config system snmp community`,
    ` edit 1`,
    `  set name public`,
    `  set status enable`,
    ` next`,
    `end`,
  ];
  sections.push({
    name: "Monitoring Configuration",
    description: "Enable syslog and SNMP monitoring",
    commands: monitoringCommands,
  });
  allCommands.push(...monitoringCommands);

  return {
    vendor: "Fortinet FortiGate",
    deviceType: input.deviceType,
    site: input.siteId,
    commands: allCommands,
    sections,
    timestamp: Date.now(),
  };
}

/**
 * Main generator function
 */
export function generateConfiguration(
  input: ConfigGeneratorInput
): ConfigurationOutput {
  switch (input.vendor) {
    case "huawei":
      return generateHuaweiConfig(input);
    case "cisco":
      return generateCiscoConfig(input);
    case "fortinet":
      return generateFortinetConfig(input);
    default:
      throw new Error(`Unsupported vendor: ${input.vendor}`);
  }
}
