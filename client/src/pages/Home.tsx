/**
 * DESIGN PHILOSOPHY: Data Engineering Dashboard — Blueprint Técnico
 * Fondo oscuro (#0a0f1e), acentos cian (#00d4ff) y lima (#7fff00)
 * Tipografía: Space Grotesk (títulos), JetBrains Mono (IPs), Inter (cuerpo)
 * Layout: Sidebar izquierdo + panel principal con cards de subredes
 */

import { useState, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import { Network, Server, Wifi, Monitor, Copy, Check, ChevronRight, Activity, Database, Globe, Code, FileText, BookOpen, Settings } from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────

const NETWORK_DATA = {
  baseNetwork: "172.16.0.0/16",
  topology: "VLSM (Variable Length Subnet Mask)",
  services: ["Datos", "Voz", "CCTV"],
  sedes: [
    {
      id: 1,
      name: "Sede 1 — Teusaquillo",
      shortName: "Sede 1",
      location: "Teusaquillo, Bogotá",
      hosts: 1600,
      network: "172.16.0.0/21",
      mask: "255.255.248.0",
      prefix: "/21",
      gateway: "172.16.0.1",
      firstHost: "172.16.0.1",
      lastHost: "172.16.7.254",
      broadcast: "172.16.7.255",
      totalAddresses: 2048,
      usableHosts: 2046,
      color: "#00d4ff",
      borderClass: "sede-1-border",
      accentClass: "sede-1-accent",
      bgColor: "rgba(0, 212, 255, 0.08)",
      icon: "S1",
    },
    {
      id: 2,
      name: "Sede 2 — Campus U Compensar",
      shortName: "Sede 2",
      location: "Campus U Compensar, Bogotá",
      hosts: 600,
      network: "172.16.8.0/22",
      mask: "255.255.252.0",
      prefix: "/22",
      gateway: "172.16.8.1",
      firstHost: "172.16.8.1",
      lastHost: "172.16.11.254",
      broadcast: "172.16.11.255",
      totalAddresses: 1024,
      usableHosts: 1022,
      color: "#7fff00",
      borderClass: "sede-2-border",
      accentClass: "sede-2-accent",
      bgColor: "rgba(127, 255, 0, 0.08)",
      icon: "S2",
    },
    {
      id: 3,
      name: "Sede 3 — AV68",
      shortName: "Sede 3",
      location: "AV68, Bogotá",
      hosts: 400,
      network: "172.16.12.0/23",
      mask: "255.255.254.0",
      prefix: "/23",
      gateway: "172.16.12.1",
      firstHost: "172.16.12.1",
      lastHost: "172.16.13.254",
      broadcast: "172.16.13.255",
      totalAddresses: 512,
      usableHosts: 510,
      color: "#f59e0b",
      borderClass: "sede-3-border",
      accentClass: "sede-3-accent",
      bgColor: "rgba(245, 158, 11, 0.08)",
      icon: "S3",
    },
  ],
  vlans: [
    { id: 10, name: "VLAN Datos", service: "Datos", description: "PCs y estaciones de trabajo" },
    { id: 20, name: "VLAN Voz", service: "Voz", description: "Teléfonos IP y softphones" },
    { id: 30, name: "VLAN CCTV", service: "CCTV", description: "Cámaras de seguridad" },
    { id: 40, name: "VLAN Servidores", service: "Servidores", description: "Virtualización e infraestructura" },
    { id: 99, name: "VLAN Gestión", service: "Gestión", description: "Administración de equipos" },
  ],
  equipment: [
    { type: "Cámaras IP", icon: "📷", count: "Por sede", vlan: 30 },
    { type: "PCs / Estaciones", icon: "🖥️", count: "2600 total", vlan: 10 },
    { type: "Teléfonos IP", icon: "📞", count: "Por sede", vlan: 20 },
    { type: "Servidores", icon: "🗄️", count: "Centralizado", vlan: 40 },
    { type: "Switches L3", icon: "🔀", count: "Por sede", vlan: 99 },
    { type: "Routers", icon: "📡", count: "Enlace WAN", vlan: 99 },
  ],
  wanLinks: [
    {
      id: "s1-s2",
      name: "Enlace Sede 1 ↔ Sede 2",
      from: "Teusaquillo",
      to: "Campus U Compensar",
      distance: 3.2,
      technology: "Fibra Óptica Dedicada",
      bandwidth: "100 Mbps",
      bandwidthNum: 100,
      latency: "2-3 ms",
      redundancy: "Primario",
      status: "Activo",
      color: "#00d4ff",
      protocols: ["OSPF", "BGP"],
      description: "Enlace de fibra óptica con QoS garantizado para datos y voz.",
    },
    {
      id: "s2-s3",
      name: "Enlace Sede 2 ↔ Sede 3",
      from: "Campus U Compensar",
      to: "AV68",
      distance: 2.1,
      technology: "Fibra Óptica Dedicada",
      bandwidth: "100 Mbps",
      bandwidthNum: 100,
      latency: "2-3 ms",
      redundancy: "Primario",
      status: "Activo",
      color: "#7fff00",
      protocols: ["OSPF", "BGP"],
      description: "Enlace de fibra óptica con QoS garantizado para datos y voz.",
    },
    {
      id: "s1-s3",
      name: "Enlace Sede 1 ↔ Sede 3",
      from: "Teusaquillo",
      to: "AV68",
      distance: 4.8,
      technology: "Enlace MPLS VPN",
      bandwidth: "50 Mbps",
      bandwidthNum: 50,
      latency: "5-8 ms",
      redundancy: "Respaldo",
      status: "Activo",
      color: "#f59e0b",
      protocols: ["OSPF", "BGP"],
      description: "Enlace MPLS VPN como respaldo para garantizar redundancia.",
    },
  ],
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 opacity-40 hover:opacity-100 transition-opacity"
      title="Copiar al portapapeles"
    >
      {copied ? <Check size={12} color="#7fff00" /> : <Copy size={12} color="#00d4ff" />}
    </button>
  );
}

function IpBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center ip-badge">
      {value}
      <CopyButton text={value} />
    </span>
  );
}

function AnimatedCounter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

function UsageBar({ used, total, color }: { used: number; total: number; color: string }) {
  const pct = Math.round((used / total) * 100);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimated(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full">
      <div className="flex justify-between text-xs mb-1" style={{ fontFamily: "var(--font-mono)" }}>
        <span style={{ color: "rgba(255,255,255,0.5)" }}>Uso de hosts</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-2 rounded-full transition-all duration-1000 ease-out"
          style={{
            width: animated ? `${pct}%` : "0%",
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: `0 0 8px ${color}66`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono)" }}>
        <span>{used.toLocaleString()} requeridos</span>
        <span>{total.toLocaleString()} disponibles</span>
      </div>
    </div>
  );
}

function SedeCard({ sede, isActive, onClick }: { sede: typeof NETWORK_DATA.sedes[0]; isActive: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="card-blueprint rounded-lg p-5 cursor-pointer border-l-4 transition-all duration-300"
      style={{
        borderLeftColor: sede.color,
        background: isActive ? sede.bgColor : "rgba(13, 21, 38, 0.9)",
        boxShadow: isActive ? `0 0 25px ${sede.color}22` : "none",
        transform: isActive ? "translateX(4px)" : "none",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
            {sede.location}
          </div>
          <h3 className="font-semibold text-sm" style={{ fontFamily: "var(--font-display)", color: isActive ? sede.color : "white" }}>
            {sede.name}
          </h3>
        </div>
        <div
          className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
          style={{ background: `${sede.color}22`, color: sede.color, fontFamily: "var(--font-mono)" }}
        >
          {sede.icon}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Red:</span>
          <IpBadge value={sede.network} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>Hosts:</span>
          <span className="text-sm font-semibold" style={{ color: sede.color, fontFamily: "var(--font-mono)" }}>
            {sede.hosts.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-3">
        <UsageBar used={sede.hosts} total={sede.usableHosts} color={sede.color} />
      </div>
    </div>
  );
}

function DetailPanel({ sede }: { sede: typeof NETWORK_DATA.sedes[0] }) {
  const rows = [
    { label: "Dirección de Red", value: sede.network, isIp: true },
    { label: "Máscara de Subred", value: sede.mask, isIp: true },
    { label: "Prefijo CIDR", value: sede.prefix, isIp: false },
    { label: "Gateway / Primer Host", value: sede.gateway, isIp: true },
    { label: "Último Host Utilizable", value: sede.lastHost, isIp: true },
    { label: "Dirección de Broadcast", value: sede.broadcast, isIp: true },
    { label: "Total de Direcciones", value: sede.totalAddresses.toLocaleString(), isIp: false },
    { label: "Hosts Utilizables", value: sede.usableHosts.toLocaleString(), isIp: false },
    { label: "Hosts Requeridos", value: sede.hosts.toLocaleString(), isIp: false },
    { label: "Hosts Disponibles (libre)", value: (sede.usableHosts - sede.hosts).toLocaleString(), isIp: false },
  ];

  return (
    <div className="card-blueprint rounded-xl p-6 animate-fade-in-up" style={{ borderColor: `${sede.color}44` }}>
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm"
          style={{ background: `${sede.color}22`, color: sede.color, fontFamily: "var(--font-mono)" }}
        >
          {sede.icon}
        </div>
        <div>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-display)", color: sede.color }}>
            {sede.name}
          </h2>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{sede.location}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: sede.color }} />
          <span className="text-xs" style={{ color: sede.color, fontFamily: "var(--font-mono)" }}>ACTIVO</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <th className="text-left py-2 pr-4 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                Parámetro
              </th>
              <th className="text-left py-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                Valor
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="transition-colors duration-200"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = `${sede.color}08`)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td className="py-2.5 pr-4 text-xs" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-body)" }}>
                  {row.label}
                </td>
                <td className="py-2.5">
                  {row.isIp ? (
                    <IpBadge value={row.value} />
                  ) : (
                    <span className="font-semibold" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.85)" }}>
                      {row.value}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg p-3 text-xs" style={{ background: "#0d1526", border: "1px solid rgba(0,212,255,0.3)", fontFamily: "var(--font-mono)" }}>
        <p className="font-semibold mb-1" style={{ color: "white" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</p>
        ))}
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const [activeSede, setActiveSede] = useState(0);
  const [activeSection, setActiveSection] = useState<"overview" | "subnets" | "vlans" | "equipment" | "wan" | "configs" | "inventory">("overview");

  const selectedSede = NETWORK_DATA.sedes[activeSede];
  const totalHosts = NETWORK_DATA.sedes.reduce((s, x) => s + x.hosts, 0);

  const barData = NETWORK_DATA.sedes.map((s) => ({
    name: s.shortName,
    Requeridos: s.hosts,
    Disponibles: s.usableHosts - s.hosts,
    color: s.color,
  }));

  const pieData = NETWORK_DATA.sedes.map((s) => ({
    name: s.shortName,
    value: s.hosts,
    color: s.color,
  }));

  const navItems = [
    { id: "overview", label: "Resumen General", icon: <Activity size={16} /> },
    { id: "subnets", label: "Subredes VLSM", icon: <Network size={16} /> },
    { id: "vlans", label: "Plan de VLANs", icon: <Database size={16} /> },
    { id: "equipment", label: "Equipos de Red", icon: <Server size={16} /> },
    { id: "wan", label: "Enlaces WAN", icon: <Wifi size={16} /> },
    { id: "configs", label: "Configuraciones", icon: <Code size={16} /> },
    { id: "inventory", label: "Inventario Completo", icon: <Monitor size={16} /> },
  ] as const;

  return (
    <div className="min-h-screen flex" style={{ background: "#0a0f1e", fontFamily: "var(--font-body)" }}>

      {/* ── Sidebar ── */}
      <aside
        className="w-64 flex-shrink-0 flex flex-col"
        style={{ background: "#080d1a", borderRight: "1px solid rgba(0,212,255,0.1)", minHeight: "100vh" }}
      >
        {/* Logo / Header */}
        <div className="p-5 border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,212,255,0.15)" }}>
              <Globe size={16} color="#00d4ff" />
            </div>
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#00d4ff", fontFamily: "var(--font-display)" }}>
              Red Banda Ancha
            </span>
          </div>
          <p className="text-xs mt-2 pl-11" style={{ color: "rgba(255,255,255,0.3)" }}>
            IP Planning · VLSM · Bogotá
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-medium tracking-widest uppercase mb-3 px-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Secciones
          </p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 text-left"
              style={{
                background: activeSection === item.id ? "rgba(0,212,255,0.12)" : "transparent",
                color: activeSection === item.id ? "#00d4ff" : "rgba(255,255,255,0.55)",
                borderLeft: activeSection === item.id ? "2px solid #00d4ff" : "2px solid transparent",
              }}
            >
              {item.icon}
              <span style={{ fontFamily: "var(--font-body)" }}>{item.label}</span>
              {activeSection === item.id && <ChevronRight size={14} className="ml-auto" />}
            </button>
          ))}

          {/* Sedes quick-nav */}
          <div className="mt-6">
            <p className="text-xs font-medium tracking-widest uppercase mb-3 px-2" style={{ color: "rgba(255,255,255,0.25)" }}>
              Sedes
            </p>
            {NETWORK_DATA.sedes.map((sede, i) => (
              <button
                key={sede.id}
                onClick={() => { setActiveSede(i); setActiveSection("subnets"); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 text-left"
                style={{
                  background: activeSede === i && activeSection === "subnets" ? `${sede.color}15` : "transparent",
                  color: activeSede === i && activeSection === "subnets" ? sede.color : "rgba(255,255,255,0.45)",
                }}
              >
                <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: `${sede.color}22`, color: sede.color, fontFamily: "var(--font-mono)" }}>
                  {i + 1}
                </div>
                <span>{sede.shortName}</span>
                <span className="ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>{sede.prefix}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
          <div className="text-xs space-y-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>
            <div>Red base: 172.16.0.0/16</div>
            <div>Dist. entre sedes: 6.29 km</div>
            <div>Total hosts: {totalHosts.toLocaleString()}</div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-auto">

        {/* Hero Header */}
        <div
          className="relative px-8 py-10 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, rgba(10,15,30,0.95) 0%, rgba(13,21,38,0.9) 100%)`,
            borderBottom: "1px solid rgba(0,212,255,0.15)",
          }}
        >
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663389588894/kT8nTAQNBTwKQ8axzqUABK/network-hero-bg-d3LjKUbrJYxiw7nyHCw8Mf.webp)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#7fff00" }} />
              <span className="text-xs tracking-widest uppercase" style={{ color: "#7fff00", fontFamily: "var(--font-mono)" }}>
                Sistema Activo
              </span>
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-display)", color: "white" }}>
              Diseño de Red Banda Ancha
            </h1>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              Esquema de Direccionamiento IP con VLSM — Bogotá, Colombia
            </p>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Hosts", value: totalHosts, suffix: "", color: "#00d4ff", icon: <Monitor size={16} /> },
                { label: "Sedes", value: 3, suffix: "", color: "#7fff00", icon: <Wifi size={16} /> },
                { label: "Distancia", value: 6.29, suffix: " km", color: "#f59e0b", icon: <Globe size={16} /> },
                { label: "Servicios", value: 3, suffix: "", color: "#a78bfa", icon: <Server size={16} /> },
              ].map((kpi, i) => (
                <div key={i} className="card-blueprint rounded-lg p-4" style={{ borderColor: `${kpi.color}33` }}>
                  <div className="flex items-center gap-2 mb-1" style={{ color: kpi.color }}>
                    {kpi.icon}
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>{kpi.label}</span>
                  </div>
                  <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)", color: kpi.color }}>
                    {typeof kpi.value === "number" && kpi.value > 10 ? (
                      <AnimatedCounter target={kpi.value} />
                    ) : (
                      kpi.value
                    )}
                    {kpi.suffix}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8">

          {/* ── OVERVIEW ── */}
          {activeSection === "overview" && (
            <div className="space-y-8 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Resumen General
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Vista consolidada del plan de direccionamiento IP para las tres sedes.
                </p>
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart */}
                <div className="card-blueprint rounded-xl p-6">
                  <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                    Distribución de Hosts por Sede
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12, fontFamily: "var(--font-body)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                      <Bar dataKey="Requeridos" radius={[4, 4, 0, 0]}>
                        {barData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                        ))}
                      </Bar>
                      <Bar dataKey="Disponibles" radius={[4, 4, 0, 0]} fill="rgba(255,255,255,0.08)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="card-blueprint rounded-xl p-6">
                  <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                    Proporción de Hosts por Sede
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} fillOpacity={0.85} stroke={entry.color} strokeWidth={1} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Summary Table */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Tabla Resumen de Subredes VLSM
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
                        {["Sede", "Red / Prefijo", "Máscara", "Gateway", "Rango de Hosts", "Broadcast", "Hosts Req.", "Hosts Disp."].map((h) => (
                          <th key={h} className="text-left py-3 pr-4 font-medium" style={{ color: "#00d4ff", fontFamily: "var(--font-body)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {NETWORK_DATA.sedes.map((sede) => (
                        <tr
                          key={sede.id}
                          className="transition-colors duration-200"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", borderLeft: `3px solid ${sede.color}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = `${sede.color}08`)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="py-3 pr-4 font-semibold" style={{ color: sede.color, fontFamily: "var(--font-display)" }}>{sede.shortName}</td>
                          <td className="py-3 pr-4"><IpBadge value={sede.network} /></td>
                          <td className="py-3 pr-4"><IpBadge value={sede.mask} /></td>
                          <td className="py-3 pr-4"><IpBadge value={sede.gateway} /></td>
                          <td className="py-3 pr-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>
                            {sede.firstHost} — {sede.lastHost}
                          </td>
                          <td className="py-3 pr-4"><IpBadge value={sede.broadcast} /></td>
                          <td className="py-3 pr-4 font-semibold" style={{ fontFamily: "var(--font-mono)", color: sede.color }}>{sede.hosts.toLocaleString()}</td>
                          <td className="py-3 pr-4 font-semibold" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)" }}>{sede.usableHosts.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Red Base", value: NETWORK_DATA.baseNetwork, desc: "Clase B privada RFC 1918", color: "#00d4ff" },
                  { label: "Tecnología", value: NETWORK_DATA.topology, desc: "Optimización de espacio de direcciones", color: "#7fff00" },
                  { label: "Servicios", value: NETWORK_DATA.services.join(", "), desc: "Datos, Voz IP y Videovigilancia", color: "#f59e0b" },
                ].map((item, i) => (
                  <div key={i} className="card-blueprint rounded-lg p-4" style={{ borderColor: `${item.color}33` }}>
                    <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.4)" }}>{item.label}</div>
                    <div className="font-bold text-sm mb-1" style={{ fontFamily: "var(--font-mono)", color: item.color }}>{item.value}</div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              {/* Architecture Document */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(165,114,251,0.33)" }}>
                <div className="flex items-start gap-4">
                  <Globe size={24} color="#a572fb" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#a572fb" }}>
                      Arquitectura e Infraestructura
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Documento completo de la arquitectura de 3 capas: topología WAN, redundancia, seguridad perimetral, VLANs, OSPF, QoS, monitoreo y escalabilidad.
                    </p>
                    <a
                      href="/arquitectura-infraestructura.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(165,114,251,0.2)", color: "#a572fb" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(165,114,251,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(165,114,251,0.2)")}
                    >
                      Descargar Documento de Arquitectura
                    </a>
                  </div>
                </div>
              </div>

              {/* IP Planning Document */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(34,197,94,0.33)" }}>
                <div className="flex items-start gap-4">
                  <Database size={24} color="#22c55e" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#22c55e" }}>
                      IP Planning Completo
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Documento exhaustivo con esquema VLSM, asignacion de IPs por dispositivo, DHCP pools, subredes por VLAN, reservas de espacio y capacidad de expansion para 5 anos.
                    </p>
                    <a
                      href="/ip-planning-completo.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(34,197,94,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(34,197,94,0.2)")}
                    >
                      Descargar IP Planning
                    </a>
                  </div>
                </div>
              </div>

              {/* README Document */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(59,130,246,0.33)" }}>
                <div className="flex items-start gap-4">
                  <FileText size={24} color="#3b82f6" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#3b82f6" }}>
                      README del Proyecto
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Documentacion completa del proyecto: descripcion, arquitectura, instalacion, herramientas, checklist de implementacion y hoja de ruta.
                    </p>
                    <a
                      href="/README.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(59,130,246,0.2)", color: "#3b82f6" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.2)")}
                    >
                      Descargar README
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SUBNETS ── */}
          {activeSection === "subnets" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Subredes VLSM
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Selecciona una sede para ver el detalle completo de su subred.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {NETWORK_DATA.sedes.map((sede, i) => (
                  <SedeCard key={sede.id} sede={sede} isActive={activeSede === i} onClick={() => setActiveSede(i)} />
                ))}
              </div>

              <DetailPanel sede={selectedSede} />

              {/* VLSM Explanation */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  ¿Por qué VLSM?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {[
                    { title: "Eficiencia de Espacio", desc: "VLSM permite asignar subredes del tamaño exacto necesario, evitando el desperdicio de direcciones IP que ocurre con subnetting de longitud fija." },
                    { title: "Escalabilidad", desc: "El espacio de direcciones no utilizado (172.16.14.0 en adelante) queda disponible para futuras expansiones sin reorganizar el esquema existente." },
                    { title: "Jerarquía Clara", desc: "Cada sede tiene un bloque contiguo y bien definido, lo que facilita la configuración de ACLs, rutas estáticas y políticas de QoS por sede." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg p-4" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                      <div className="font-semibold mb-2" style={{ color: "#00d4ff", fontFamily: "var(--font-display)" }}>{item.title}</div>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── VLANs ── */}
          {activeSection === "vlans" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Plan de VLANs
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Segmentación lógica de la red por tipo de servicio para cada sede.
                </p>
              </div>

              <div className="card-blueprint rounded-xl p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
                        {["ID VLAN", "Nombre", "Servicio", "Descripción"].map((h) => (
                          <th key={h} className="text-left py-3 pr-6 font-medium" style={{ color: "#00d4ff", fontFamily: "var(--font-body)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {NETWORK_DATA.vlans.map((vlan) => {
                        const colors: Record<string, string> = {
                          Datos: "#00d4ff", Voz: "#7fff00", CCTV: "#f59e0b",
                          Servidores: "#a78bfa", Gestión: "#fb7185",
                        };
                        const c = colors[vlan.service] || "#00d4ff";
                        return (
                          <tr
                            key={vlan.id}
                            className="transition-colors duration-200"
                            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = `${c}08`)}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          >
                            <td className="py-3 pr-6">
                              <span className="font-bold" style={{ fontFamily: "var(--font-mono)", color: c }}>
                                VLAN {vlan.id}
                              </span>
                            </td>
                            <td className="py-3 pr-6 font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>{vlan.name}</td>
                            <td className="py-3 pr-6">
                              <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: `${c}22`, color: c, fontFamily: "var(--font-mono)" }}>
                                {vlan.service}
                              </span>
                            </td>
                            <td className="py-3 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{vlan.description}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* VLAN per sede */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NETWORK_DATA.sedes.map((sede) => (
                  <div key={sede.id} className="card-blueprint rounded-xl p-5" style={{ borderColor: `${sede.color}33` }}>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: `${sede.color}22`, color: sede.color, fontFamily: "var(--font-mono)" }}>
                        {sede.icon}
                      </div>
                      <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)", color: sede.color }}>{sede.shortName}</span>
                    </div>
                    <div className="space-y-2">
                      {NETWORK_DATA.vlans.map((vlan) => {
                        const colors: Record<string, string> = {
                          Datos: "#00d4ff", Voz: "#7fff00", CCTV: "#f59e0b",
                          Servidores: "#a78bfa", Gestión: "#fb7185",
                        };
                        const c = colors[vlan.service] || "#00d4ff";
                        return (
                          <div key={vlan.id} className="flex items-center gap-2 text-xs">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
                            <span style={{ fontFamily: "var(--font-mono)", color: c }}>VLAN {vlan.id}</span>
                            <span style={{ color: "rgba(255,255,255,0.4)" }}>— {vlan.service}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── EQUIPMENT ── */}
          {activeSection === "equipment" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Equipos de Red
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Inventario de dispositivos y su asignación de VLAN por tipo de servicio.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {NETWORK_DATA.equipment.map((eq, i) => {
                  const colors: Record<number, string> = { 10: "#00d4ff", 20: "#7fff00", 30: "#f59e0b", 40: "#a78bfa", 99: "#fb7185" };
                  const c = colors[eq.vlan] || "#00d4ff";
                  return (
                    <div
                      key={i}
                      className="card-blueprint rounded-xl p-5 transition-all duration-300 hover:-translate-y-1"
                      style={{ borderColor: `${c}33` }}
                    >
                      <div className="text-3xl mb-3">{eq.icon}</div>
                      <div className="font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>{eq.type}</div>
                      <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>{eq.count}</div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: `${c}22`, color: c, fontFamily: "var(--font-mono)" }}>
                          VLAN {eq.vlan}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Services */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Servicios de la Red
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: "Datos", icon: <Monitor size={24} />, color: "#00d4ff", desc: "Conectividad IP para PCs, laptops y estaciones de trabajo. Protocolo TCP/IP sobre Ethernet Gigabit." },
                    { name: "Voz IP", icon: <Wifi size={24} />, color: "#7fff00", desc: "Telefonía IP con QoS priorizado. Protocolo SIP/RTP sobre VLAN dedicada para garantizar latencia < 150ms." },
                    { name: "CCTV", icon: <Server size={24} />, color: "#f59e0b", desc: "Videovigilancia IP con cámaras en VLAN aislada. Tráfico de video H.264/H.265 hacia servidores NVR." },
                  ].map((svc, i) => (
                    <div key={i} className="rounded-lg p-4" style={{ background: `${svc.color}08`, border: `1px solid ${svc.color}22` }}>
                      <div className="flex items-center gap-3 mb-3" style={{ color: svc.color }}>
                        {svc.icon}
                        <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>{svc.name}</span>
                      </div>
                      <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{svc.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── WAN LINKS ── */}
          {activeSection === "wan" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Enlaces WAN
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Topología de interconexión entre sedes con detalles de ancho de banda, tecnología y redundancia.
                </p>
              </div>

              {/* WAN Topology Overview */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Diagrama de Topología WAN
                </h3>
                <div className="flex flex-col md:flex-row items-center justify-around gap-6 py-8">
                  {/* Sede 1 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl mb-2 animate-pulse-glow"
                      style={{ background: "rgba(0,212,255,0.2)", color: "#00d4ff", fontFamily: "var(--font-mono)" }}
                    >
                      S1
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "#00d4ff" }}>Teusaquillo</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>1.600 hosts</span>
                  </div>

                  {/* Connection 1-2 */}
                  <div className="flex flex-col items-center flex-1 md:flex-none">
                    <div className="text-xs font-bold mb-1" style={{ color: "#00d4ff" }}>100 Mbps</div>
                    <div className="w-24 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #00d4ff, #00d4ff)" }} />
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>3.2 km</div>
                  </div>

                  {/* Sede 2 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl mb-2 animate-pulse-glow"
                      style={{ background: "rgba(127,255,0,0.2)", color: "#7fff00", fontFamily: "var(--font-mono)" }}
                    >
                      S2
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "#7fff00" }}>Campus U</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>600 hosts</span>
                  </div>

                  {/* Connection 2-3 */}
                  <div className="flex flex-col items-center flex-1 md:flex-none">
                    <div className="text-xs font-bold mb-1" style={{ color: "#7fff00" }}>100 Mbps</div>
                    <div className="w-24 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #7fff00, #7fff00)" }} />
                    <div className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono)" }}>2.1 km</div>
                  </div>

                  {/* Sede 3 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center font-bold text-xl mb-2 animate-pulse-glow"
                      style={{ background: "rgba(245,158,11,0.2)", color: "#f59e0b", fontFamily: "var(--font-mono)" }}
                    >
                      S3
                    </div>
                    <span className="text-xs font-semibold" style={{ color: "#f59e0b" }}>AV68</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>400 hosts</span>
                  </div>
                </div>
                <div className="text-xs text-center mt-4" style={{ color: "rgba(255,255,255,0.35)" }}>
                  <span style={{ color: "#f59e0b" }}>Enlace de respaldo (Sede 1 ↔ Sede 3): 50 Mbps MPLS VPN — 4.8 km</span>
                </div>
              </div>

              {/* WAN Links Table */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Detalle de Enlaces
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
                        {["Enlace", "Distancia", "Tecnología", "Ancho de Banda", "Latencia", "Rol", "Protocolos"].map((h) => (
                          <th key={h} className="text-left py-3 pr-4 font-medium" style={{ color: "#00d4ff", fontFamily: "var(--font-body)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {NETWORK_DATA.wanLinks.map((link) => (
                        <tr
                          key={link.id}
                          className="transition-colors duration-200"
                          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", borderLeft: `3px solid ${link.color}` }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = `${link.color}08`)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td className="py-3 pr-4 font-semibold" style={{ color: link.color, fontFamily: "var(--font-display)" }}>{link.name}</td>
                          <td className="py-3 pr-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>{link.distance} km</td>
                          <td className="py-3 pr-4" style={{ color: "rgba(255,255,255,0.7)" }}>{link.technology}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: `${link.color}22`, color: link.color, fontFamily: "var(--font-mono)" }}>
                              {link.bandwidth}
                            </span>
                          </td>
                          <td className="py-3 pr-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.7)" }}>{link.latency}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-1 rounded text-xs font-medium" style={{ background: link.redundancy === "Primario" ? "rgba(127,255,0,0.2)" : "rgba(245,158,11,0.2)", color: link.redundancy === "Primario" ? "#7fff00" : "#f59e0b" }}>
                              {link.redundancy}
                            </span>
                          </td>
                          <td className="py-3 pr-4" style={{ fontFamily: "var(--font-mono)", color: "rgba(255,255,255,0.6)" }}>{link.protocols.join(", ")}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* WAN Link Details Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {NETWORK_DATA.wanLinks.map((link) => (
                  <div key={link.id} className="card-blueprint rounded-xl p-5" style={{ borderColor: `${link.color}33` }}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold mb-1" style={{ fontFamily: "var(--font-display)", color: link.color }}>
                          {link.name}
                        </h4>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{link.from} → {link.to}</p>
                      </div>
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                        style={{ background: `${link.color}22`, color: link.color }}
                      >
                        ↔
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Distancia</div>
                        <div className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: link.color }}>{link.distance} km</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Tecnología</div>
                        <div className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>{link.technology}</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Ancho de Banda</div>
                        <div className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: link.color }}>{link.bandwidth}</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Latencia</div>
                        <div className="text-sm font-bold" style={{ fontFamily: "var(--font-mono)", color: link.color }}>{link.latency}</div>
                      </div>
                      <div>
                        <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Rol</div>
                        <span className="inline-block px-2 py-1 rounded text-xs font-medium mt-1" style={{ background: link.redundancy === "Primario" ? "rgba(127,255,0,0.2)" : "rgba(245,158,11,0.2)", color: link.redundancy === "Primario" ? "#7fff00" : "#f59e0b" }}>
                          {link.redundancy}
                        </span>
                      </div>
                      <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                        <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{link.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* WAN Best Practices */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Consideraciones de Diseño WAN
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {[
                    { title: "Redundancia Activa-Activa", desc: "Los dos enlaces primarios (Sede 1-2 y Sede 2-3) funcionan en paralelo con OSPF/BGP para balanceo de carga automático y failover inmediato." },
                    { title: "Enlace de Respaldo", desc: "El enlace MPLS VPN (Sede 1-3) actúa como respaldo en caso de falla de los enlaces primarios, garantizando conectividad en topología de malla parcial." },
                    { title: "QoS Priorizado", desc: "Tráfico de voz (VLAN 20) y CCTV (VLAN 30) tienen prioridad sobre datos (VLAN 10) mediante políticas de QoS en cada router WAN." },
                    { title: "Monitoreo Continuo", desc: "SNMP y NetFlow en cada router WAN permiten monitorear ancho de banda utilizado, latencia y pérdida de paquetes en tiempo real." },
                  ].map((item, i) => (
                    <div key={i} className="rounded-lg p-4" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                      <div className="font-semibold mb-2" style={{ color: "#00d4ff", fontFamily: "var(--font-display)" }}>{item.title}</div>
                      <p>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── CONFIGURATIONS ── */}
          {activeSection === "configs" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Configuraciones de Switches y Routers
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Ejemplos de configuración para Cisco, Huawei, Juniper y Arista.
                </p>
              </div>

              {/* Vendor Selection */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: "Cisco IOS", color: "#00d4ff", desc: "Catalyst 3650 / ISR 4331" },
                  { name: "Huawei VRP", color: "#7fff00", desc: "CloudEngine / NE40E" },
                  { name: "Juniper Junos", color: "#f59e0b", desc: "EX4300" },
                  { name: "Arista EOS", color: "#a78bfa", desc: "DCS-7050SX3" },
                ].map((vendor, i) => (
                  <div key={i} className="card-blueprint rounded-lg p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1" style={{ borderColor: `${vendor.color}33` }}>
                    <div className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: vendor.color }}>{vendor.name}</div>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{vendor.desc}</p>
                  </div>
                ))}
              </div>

              {/* Configuration Sections */}
              <div className="card-blueprint rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Code size={20} color="#00d4ff" />
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "white" }}>Cisco IOS - Switch L3</h3>
                </div>
                <div className="bg-black rounded-lg p-4 font-mono text-xs overflow-x-auto" style={{ color: "#7fff00", lineHeight: "1.6" }}>
                  <pre>{`! Configuracion de Switch Cisco Catalyst 3650
! Sede 1: Teusaquillo (172.16.0.0/21)

hostname SW-SEDE1-TEUS
enable password 7 [encrypted_password]

vlan 10
 name VLAN-DATOS
vlan 20
 name VLAN-VOZ

interface Vlan10
 description VLAN-DATOS-SEDE1
 ip address 172.16.0.1 255.255.248.0
 no shutdown

interface range GigabitEthernet1/0/1-24
 description ACCESS-DATOS
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 no shutdown

router ospf 1
 router-id 172.16.0.1
 network 172.16.0.0 0.0.7.255 area 0

write memory`}</pre>
                </div>
              </div>

              {/* Huawei Configuration Section */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(127,255,0,0.33)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Code size={20} color="#7fff00" />
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "white" }}>Huawei VRP - Configuración Completa</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Configuración detallada para CloudEngine 6800 y 5800 con VLSM, VLANs, OSPF, QoS y redundancia.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { title: "Sede 1 (Teusaquillo)", hosts: "1.600", model: "CE 6800" },
                    { title: "Sede 2 (Campus U)", hosts: "600", model: "CE 6800" },
                    { title: "Sede 3 (AV68)", hosts: "400", model: "CE 5800" },
                  ].map((sede, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "rgba(127,255,0,0.08)", border: "1px solid rgba(127,255,0,0.2)" }}>
                      <div className="font-semibold text-xs mb-1" style={{ color: "#7fff00" }}>{sede.title}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{sede.hosts} hosts • {sede.model}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-black rounded-lg p-4 font-mono text-xs overflow-x-auto mb-4" style={{ color: "#7fff00", lineHeight: "1.6" }}>
                  <pre>{`# Configuracion rapida - Sede 1
system-view
sysName SW-SEDE1-TEUS
vlan batch 10 20 30 40 99
interface Vlanif10
 ip address 172.16.0.1 255.255.248.0
interface Vlanif20
 ip address 172.16.1.1 255.255.248.0
ospf 1 router-id 172.16.0.254
area 0.0.0.0
network 172.16.0.0 0.0.7.255 area 0.0.0.0
save`}</pre>
                </div>
                <a
                  href="/huawei-switch-configs.md"
                  className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{ background: "rgba(127,255,0,0.2)", color: "#7fff00" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.2)")}
                >
                  Descargar Configuracion Huawei Completa (Markdown)
                </a>
              </div>

              {/* Commands Guide */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(0,212,255,0.33)" }}>
                <div className="flex items-start gap-4">
                  <BookOpen size={24} color="#00d4ff" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#00d4ff" }}>
                      Guia Completa de Comandos Huawei
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Explicacion detallada de cada comando VRP: sistema, interfaces, VLANs, OSPF, QoS, DHCP, seguridad, verificacion y troubleshooting con ejemplos practicos.
                    </p>
                    <a
                      href="/guia-comandos-huawei.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(0,212,255,0.2)", color: "#00d4ff" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.2)")}
                    >
                      Descargar Guia de Comandos
                    </a>
                  </div>
                </div>
              </div>

              {/* Fortinet Configuration Section */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(236,72,153,0.33)" }}>
                <div className="flex items-center gap-3 mb-6">
                  <Code size={20} color="#ec4899" />
                  <h3 className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)", color: "white" }}>Fortinet FortiGate - Firewall Empresarial</h3>
                </div>
                <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Configuracion completa de firewalls FortiGate con politicas de seguridad, VPN IPSec, redundancia HA, QoS y deteccion de intrusiones.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  {[
                    { title: "Sede 1 (Teusaquillo)", model: "FG 3100D", throughput: "100 Gbps" },
                    { title: "Sede 2 (Campus U)", model: "FG 1500D", throughput: "50 Gbps" },
                    { title: "Sede 3 (AV68)", model: "FG 600D", throughput: "20 Gbps" },
                  ].map((sede, i) => (
                    <div key={i} className="rounded-lg p-3" style={{ background: "rgba(236,72,153,0.08)", border: "1px solid rgba(236,72,153,0.2)" }}>
                      <div className="font-semibold text-xs mb-1" style={{ color: "#ec4899" }}>{sede.title}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{sede.model} • {sede.throughput}</div>
                    </div>
                  ))}
                </div>
                <a
                  href="/configuraciones-fortinet.md"
                  className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{ background: "rgba(236,72,153,0.2)", color: "#ec4899" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.2)")}
                >
                  Descargar Configuraciones Fortinet
                </a>
              </div>

              {/* Documentation Link */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(127,255,0,0.33)" }}>
                <div className="flex items-start gap-4">
                  <FileText size={24} color="#7fff00" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#7fff00" }}>
                      Documentacion Completa
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Descarga la documentacion completa con configuraciones detalladas para todas las marcas (Cisco, Huawei, Juniper, Arista), incluyendo VLSM, VLANs, OSPF, BGP, QoS y ACLs.
                    </p>
                    <a
                      href="/network-configs.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(127,255,0,0.2)", color: "#7fff00" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.2)")}
                    >
                      Descargar Configuraciones Generales
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── INVENTORY ── */}
          {activeSection === "inventory" && (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "white" }}>
                  Inventario Completo de Equipos
                </h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                  Lista detallada de todos los equipos necesarios para la infraestructura de red banda ancha (3.500+ equipos, $3.5M USD).
                </p>
              </div>

              {/* Equipment Categories Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { category: "Switches L3", count: 3, color: "#00d4ff", icon: "🔀" },
                  { category: "Routers WAN", count: 3, color: "#7fff00", icon: "📡" },
                  { category: "Firewalls", count: 2, color: "#f59e0b", icon: "🛡️" },
                  { category: "Servidores", count: 6, color: "#a78bfa", icon: "🖥️" },
                  { category: "Puntos WiFi", count: 110, color: "#06b6d4", icon: "📶" },
                  { category: "Teléfonos IP", count: 500, color: "#ec4899", icon: "☎️" },
                  { category: "Cámaras CCTV", count: 160, color: "#f97316", icon: "📷" },
                  { category: "UPS/Generadores", count: 6, color: "#14b8a6", icon: "⚡" },
                  { category: "Cableado", count: "~5km", color: "#8b5cf6", icon: "🔌" },
                ].map((item, i) => (
                  <div key={i} className="card-blueprint rounded-lg p-4" style={{ borderColor: `${item.color}33` }}>
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-semibold text-sm mb-1" style={{ fontFamily: "var(--font-display)", color: item.color }}>
                      {item.category}
                    </div>
                    <div className="text-lg font-bold" style={{ color: "white" }}>{item.count}</div>
                  </div>
                ))}
              </div>

              {/* Budget Summary */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Presupuesto Estimado
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    {[
                      { label: "Equipos de Red", value: "$1.2M", pct: 34 },
                      { label: "Servidores/Storage", value: "$271K", pct: 8 },
                      { label: "Telefonía IP", value: "$155K", pct: 4 },
                      { label: "CCTV", value: "$285K", pct: 8 },
                      { label: "Energía", value: "$200K", pct: 6 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span style={{ color: "rgba(255,255,255,0.6)" }}>{item.label}</span>
                          <span style={{ color: "#00d4ff", fontFamily: "var(--font-mono)" }}>{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${item.pct}%`,
                              background: "linear-gradient(90deg, #00d4ff, #7fff00)",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg p-4" style={{ background: "rgba(127,255,0,0.08)", border: "1px solid rgba(127,255,0,0.2)" }}>
                    <div className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>INVERSIÓN TOTAL</div>
                    <div className="text-3xl font-bold mb-3" style={{ color: "#7fff00", fontFamily: "var(--font-display)" }}>$3.5M USD</div>
                    <div className="text-xs space-y-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <div>• 3.500+ equipos</div>
                      <div>• 19 semanas implementación</div>
                      <div>• Incluye licencias 3 años</div>
                      <div>• Contingencia 10%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Implementation Timeline */}
              <div className="card-blueprint rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: "var(--font-display)", color: "rgba(255,255,255,0.8)" }}>
                  Cronograma de Implementación
                </h3>
                <div className="space-y-3">
                  {[
                    { phase: "Fase 1", duration: "4 sem", task: "Adquisición e instalación cableado", color: "#00d4ff" },
                    { phase: "Fase 2", duration: "6 sem", task: "Switches, routers, firewalls", color: "#7fff00" },
                    { phase: "Fase 3", duration: "4 sem", task: "Configuración OSPF, QoS, seguridad", color: "#f59e0b" },
                    { phase: "Fase 4", duration: "3 sem", task: "WiFi, telefonía, CCTV", color: "#a78bfa" },
                    { phase: "Fase 5", duration: "2 sem", task: "Pruebas, capacitación, go-live", color: "#06b6d4" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-24" style={{ fontFamily: "var(--font-mono)", color: item.color, fontSize: "0.85rem" }}>
                        <div className="font-bold">{item.phase}</div>
                        <div style={{ color: "rgba(255,255,255,0.4)" }}>{item.duration}</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-8 rounded-lg flex items-center px-3" style={{ background: `${item.color}15`, border: `1px solid ${item.color}33` }}>
                          <span className="text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>{item.task}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Complete Inventory */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(127,255,0,0.33)" }}>
                <div className="flex items-start gap-4">
                  <FileText size={24} color="#7fff00" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#7fff00" }}>
                      Inventario Completo de Equipos
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Documento detallado con especificaciones tecnicas, precios unitarios, proveedores, cronograma y recomendaciones de implementacion para todos los 3.500+ equipos.
                    </p>
                    <a
                      href="/equipos-red-completa.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(127,255,0,0.2)", color: "#7fff00" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(127,255,0,0.2)")}
                    >
                      Descargar Inventario Completo (Markdown)
                    </a>
                  </div>
                </div>
              </div>

              {/* Configuracion Completa de Equipos */}
              <div className="card-blueprint rounded-xl p-6" style={{ borderColor: "rgba(236,72,153,0.33)" }}>
                <div className="flex items-start gap-4">
                  <Settings size={24} color="#ec4899" />
                  <div>
                    <h3 className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)", color: "#ec4899" }}>
                      Configuracion Completa de Equipos
                    </h3>
                    <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>
                      Documento exhaustivo (10.000+ lineas) con configuracion paso a paso de routers Huawei, switches L3, firewalls Fortinet, servidores, puntos WiFi, camaras CCTV, telefonos IP, UPS y generadores. Incluye credenciales, especificaciones tecnicas y procedimientos de mantenimiento.
                    </p>
                    <a
                      href="/configuracion-completa-equipos.md"
                      className="inline-block px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                      style={{ background: "rgba(236,72,153,0.2)", color: "#ec4899" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.3)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(236,72,153,0.2)")}
                    >
                      Descargar Configuracion Completa
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
