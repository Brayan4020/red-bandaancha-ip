/**
 * Configuration Exporter
 * Exports commands in various formats with site-specific templates
 */

import { ConfigurationOutput } from "./config-generator";

export interface ExportOptions {
  format: "txt" | "md" | "json" | "csv";
  includeComments: boolean;
  includeSectionHeaders: boolean;
}

export interface ExportResult {
  filename: string;
  content: string;
  mimeType: string;
  size: number;
}

/**
 * Generate filename based on vendor, site, and device type
 */
function generateFilename(config: ConfigurationOutput, format: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const vendor = config.vendor.toLowerCase().replace(/\s+/g, "-");
  const site = config.site.toUpperCase();
  const deviceType = config.deviceType.toLowerCase();
  return `${vendor}-${site}-${deviceType}-${timestamp}.${format}`;
}

/**
 * Export to plain text format
 */
export function exportToText(config: ConfigurationOutput, options: ExportOptions): ExportResult {
  const lines: string[] = [];

  // Header
  if (options.includeSectionHeaders) {
    lines.push("=" + "=".repeat(78));
    lines.push(`CONFIGURACIÓN ${config.vendor.toUpperCase()}`);
    lines.push(`Sitio: ${config.site.toUpperCase()}`);
    lines.push(`Dispositivo: ${config.deviceType.toUpperCase()}`);
    lines.push(`Fecha: ${new Date().toLocaleString("es-CO")}`);
    lines.push("=" + "=".repeat(78));
    lines.push("");
  }

  // Add sections
  config.sections.forEach((section) => {
    if (options.includeSectionHeaders) {
      lines.push("");
      lines.push("─".repeat(80));
      lines.push(`${section.name}`);
      lines.push("─".repeat(80));
      if (options.includeComments) {
        lines.push(`# ${section.description}`);
      }
      lines.push("");
    }

    section.commands.forEach((cmd) => {
      lines.push(cmd);
    });
  });

  // Footer
  if (options.includeSectionHeaders) {
    lines.push("");
    lines.push("=" + "=".repeat(78));
    lines.push(`Total de comandos: ${config.commands.length}`);
    lines.push("=" + "=".repeat(78));
  }

  const content = lines.join("\n");
  return {
    filename: generateFilename(config, "txt"),
    content,
    mimeType: "text/plain",
    size: content.length,
  };
}

/**
 * Export to Markdown format
 */
export function exportToMarkdown(config: ConfigurationOutput, options: ExportOptions): ExportResult {
  const lines: string[] = [];

  // Header
  lines.push(`# Configuración ${config.vendor}`);
  lines.push("");
  lines.push("| Propiedad | Valor |");
  lines.push("|-----------|-------|");
  lines.push(`| Sitio | ${config.site.toUpperCase()} |`);
  lines.push(`| Dispositivo | ${config.deviceType.toUpperCase()} |`);
  lines.push(`| Total Comandos | ${config.commands.length} |`);
  lines.push(`| Fecha | ${new Date().toLocaleString("es-CO")} |`);
  lines.push("");

  // Table of contents
  lines.push("## Tabla de Contenidos");
  lines.push("");
  config.sections.forEach((section, idx) => {
    const anchor = section.name.toLowerCase().replace(/\s+/g, "-");
    lines.push(`${idx + 1}. [${section.name}](#${anchor})`);
  });
  lines.push("");

  // Add sections
  config.sections.forEach((section) => {
    const anchor = section.name.toLowerCase().replace(/\s+/g, "-");
    lines.push(`## ${section.name}`);
    lines.push("");
    if (options.includeComments) {
      lines.push(`**Descripción:** ${section.description}`);
      lines.push("");
    }
    lines.push("```");
    section.commands.forEach((cmd) => {
      lines.push(cmd);
    });
    lines.push("```");
    lines.push("");
  });

  // Footer
  lines.push("---");
  lines.push("");
  lines.push("## Instrucciones de Aplicación");
  lines.push("");
  lines.push("1. Conectarse al dispositivo por SSH o consola");
  lines.push("2. Ingresar al modo de configuración");
  lines.push("3. Copiar y pegar cada sección de comandos");
  lines.push("4. Guardar la configuración");
  lines.push("");
  lines.push(`*Generado: ${new Date().toLocaleString("es-CO")}*`);

  const content = lines.join("\n");
  return {
    filename: generateFilename(config, "md"),
    content,
    mimeType: "text/markdown",
    size: content.length,
  };
}

/**
 * Export to JSON format
 */
export function exportToJson(config: ConfigurationOutput, options: ExportOptions): ExportResult {
  const jsonData = {
    vendor: config.vendor,
    site: config.site,
    deviceType: config.deviceType,
    timestamp: new Date().toISOString(),
    totalCommands: config.commands.length,
    sections: config.sections.map((section) => ({
      name: section.name,
      description: section.description,
      commandCount: section.commands.length,
      commands: section.commands,
    })),
  };

  const content = JSON.stringify(jsonData, null, 2);
  return {
    filename: generateFilename(config, "json"),
    content,
    mimeType: "application/json",
    size: content.length,
  };
}

/**
 * Export to CSV format
 */
export function exportToCsv(config: ConfigurationOutput, options: ExportOptions): ExportResult {
  const lines: string[] = [];

  // Header
  lines.push("Sección,Descripción,Comando,Número");

  // Add commands
  config.sections.forEach((section) => {
    section.commands.forEach((cmd, idx) => {
      const escapedCmd = `"${cmd.replace(/"/g, '""')}"`;
      const escapedDesc = `"${section.description.replace(/"/g, '""')}"`;
      lines.push(`"${section.name}",${escapedDesc},${escapedCmd},${idx + 1}`);
    });
  });

  const content = lines.join("\n");
  return {
    filename: generateFilename(config, "csv"),
    content,
    mimeType: "text/csv",
    size: content.length,
  };
}

/**
 * Export configuration in specified format
 */
export function exportConfiguration(config: ConfigurationOutput, options: ExportOptions): ExportResult {
  switch (options.format) {
    case "txt":
      return exportToText(config, options);
    case "md":
      return exportToMarkdown(config, options);
    case "json":
      return exportToJson(config, options);
    case "csv":
      return exportToCsv(config, options);
    default:
      return exportToText(config, options);
  }
}

/**
 * Generate site-specific template with VLSM adjustments
 */
export function generateSiteTemplate(
  vendor: string,
  site: "sede1" | "sede2" | "sede3"
): {
  description: string;
  vlsmInfo: {
    network: string;
    mask: string;
    gateway: string;
    hosts: number;
  };
} {
  const templates: Record<
    string,
    Record<
      string,
      {
        description: string;
        vlsmInfo: {
          network: string;
          mask: string;
          gateway: string;
          hosts: number;
        };
      }
    >
  > = {
    cisco: {
      sede1: {
        description: "Cisco IOS - Sede 1 Teusaquillo (1600 hosts)",
        vlsmInfo: {
          network: "172.16.0.0/21",
          mask: "255.255.248.0",
          gateway: "172.16.0.1",
          hosts: 1600,
        },
      },
      sede2: {
        description: "Cisco IOS - Sede 2 Campus U Compensar (600 hosts)",
        vlsmInfo: {
          network: "172.16.8.0/22",
          mask: "255.255.252.0",
          gateway: "172.16.8.1",
          hosts: 600,
        },
      },
      sede3: {
        description: "Cisco IOS - Sede 3 AV68 (400 hosts)",
        vlsmInfo: {
          network: "172.16.12.0/23",
          mask: "255.255.254.0",
          gateway: "172.16.12.1",
          hosts: 400,
        },
      },
    },
    huawei: {
      sede1: {
        description: "Huawei VRP - Sede 1 Teusaquillo (1600 hosts)",
        vlsmInfo: {
          network: "172.16.0.0/21",
          mask: "255.255.248.0",
          gateway: "172.16.0.1",
          hosts: 1600,
        },
      },
      sede2: {
        description: "Huawei VRP - Sede 2 Campus U Compensar (600 hosts)",
        vlsmInfo: {
          network: "172.16.8.0/22",
          mask: "255.255.252.0",
          gateway: "172.16.8.1",
          hosts: 600,
        },
      },
      sede3: {
        description: "Huawei VRP - Sede 3 AV68 (400 hosts)",
        vlsmInfo: {
          network: "172.16.12.0/23",
          mask: "255.255.254.0",
          gateway: "172.16.12.1",
          hosts: 400,
        },
      },
    },
    fortinet: {
      sede1: {
        description: "Fortinet FortiGate - Sede 1 Teusaquillo (1600 hosts)",
        vlsmInfo: {
          network: "172.16.0.0/21",
          mask: "255.255.248.0",
          gateway: "172.16.0.1",
          hosts: 1600,
        },
      },
      sede2: {
        description: "Fortinet FortiGate - Sede 2 Campus U Compensar (600 hosts)",
        vlsmInfo: {
          network: "172.16.8.0/22",
          mask: "255.255.252.0",
          gateway: "172.16.8.1",
          hosts: 600,
        },
      },
      sede3: {
        description: "Fortinet FortiGate - Sede 3 AV68 (400 hosts)",
        vlsmInfo: {
          network: "172.16.12.0/23",
          mask: "255.255.254.0",
          gateway: "172.16.12.1",
          hosts: 400,
        },
      },
    },
  };

  const vendorKey = vendor.toLowerCase().replace(/\s+/g, "");
  const template = templates[vendorKey]?.[site];

  if (!template) {
    return {
      description: "Plantilla no encontrada",
      vlsmInfo: {
        network: "0.0.0.0/0",
        mask: "0.0.0.0",
        gateway: "0.0.0.0",
        hosts: 0,
      },
    };
  }

  return template;
}
