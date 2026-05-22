import { describe, it, expect } from "vitest";
import { validateCiscoCommands, validateHuaweiCommands, validateFortinetCommands } from "./syntax-validator";
import { exportToText, exportToMarkdown, exportToJson, exportToCsv, generateSiteTemplate } from "./config-exporter";

describe("Syntax Validator", () => {
  describe("Cisco IOS Validation", () => {
    it("should validate correct Cisco commands", () => {
      const commands = [
        "hostname SW-SEDE1",
        "interface Vlan10",
        "ip address 172.16.0.1 255.255.255.0",
        "no shutdown",
      ];

      const result = validateCiscoCommands(commands);
      expect(result.vendor).toBe("Cisco IOS");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should detect invalid IP addresses", () => {
      const commands = ["ip address 256.16.0.1 255.255.255.0"];

      const result = validateCiscoCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].severity).toBe("critical");
      expect(result.errors[0].issue).toContain("inválida");
    });

    it("should detect invalid VLAN IDs", () => {
      const commands = ["vlan 5000"];

      const result = validateCiscoCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].severity).toBe("critical");
    });

    it("should warn about missing shutdown", () => {
      const commands = ["interface Vlan10", "ip address 172.16.0.1 255.255.255.0"];

      const result = validateCiscoCommands(commands);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should detect invalid ACL syntax", () => {
      const commands = ["access-list 100 ip 172.16.0.0 0.0.15.255"];

      const result = validateCiscoCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect invalid OSPF ID", () => {
      const commands = ["router ospf 70000"];

      const result = validateCiscoCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Huawei VRP Validation", () => {
    it("should validate correct Huawei commands", () => {
      const commands = [
        "system-view",
        "sysName SW-SEDE1",
        "interface Vlan-interface 10",
        "ip address 172.16.0.1 255.255.255.0",
        "quit",
      ];

      const result = validateHuaweiCommands(commands);
      expect(result.vendor).toBe("Huawei VRP");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it("should detect invalid IP addresses", () => {
      const commands = ["ip address 172.16.0.999 255.255.255.0"];

      const result = validateHuaweiCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should warn about missing quit", () => {
      const commands = ["interface Vlan-interface 10", "ip address 172.16.0.1 255.255.255.0"];

      const result = validateHuaweiCommands(commands);
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it("should detect invalid VLAN IDs", () => {
      const commands = ["vlan 4095"];

      const result = validateHuaweiCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Fortinet FortiGate Validation", () => {
    it("should validate correct Fortinet commands", () => {
      const commands = [
        "config system global",
        "set hostname FW-SEDE1",
        "end",
        "config system interface",
        "edit port1",
        "set ip 172.16.0.1 255.255.255.0",
        "next",
        "end",
      ];

      const result = validateFortinetCommands(commands);
      expect(result.vendor).toBe("Fortinet FortiGate");
      expect(result.isValid).toBe(true);
    });

    it("should detect unmatched end commands", () => {
      const commands = ["end", "end"];

      const result = validateFortinetCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect unclosed config blocks", () => {
      const commands = ["config system global", "set hostname FW-SEDE1"];

      const result = validateFortinetCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should detect invalid IP addresses", () => {
      const commands = ["set ip 172.16.0.256 255.255.255.0"];

      const result = validateFortinetCommands(commands);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});

describe("Configuration Exporter", () => {
  const mockConfig = {
    vendor: "Cisco IOS",
    deviceType: "switch",
    site: "sede1",
    commands: [
      "enable",
      "configure terminal",
      "hostname SW-SEDE1",
      "exit",
      "write memory",
    ],
    sections: [
      {
        name: "System Configuration",
        description: "Basic system settings",
        commands: ["hostname SW-SEDE1", "enable password 7 [encrypted]"],
      },
      {
        name: "Interface Configuration",
        description: "Configure interfaces",
        commands: ["interface Vlan10", "ip address 172.16.0.1 255.255.255.0"],
      },
    ],
    timestamp: Date.now(),
  };

  describe("Text Export", () => {
    it("should export to text format", () => {
      const result = exportToText(mockConfig, {
        format: "txt",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.filename).toContain("cisco");
      expect(result.filename).toContain("SEDE1");
      expect(result.filename).toMatch(/\.txt$/);
      expect(result.mimeType).toBe("text/plain");
      expect(result.content).toContain("System Configuration");
      expect(result.content).toContain("hostname SW-SEDE1");
    });

    it("should generate correct filename", () => {
      const result = exportToText(mockConfig, {
        format: "txt",
        includeComments: false,
        includeSectionHeaders: false,
      });

      expect(result.filename).toMatch(/cisco.*SEDE1.*switch.*\.txt$/);
    });
  });

  describe("Markdown Export", () => {
    it("should export to markdown format", () => {
      const result = exportToMarkdown(mockConfig, {
        format: "md",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.filename).toMatch(/\.md$/);
      expect(result.mimeType).toBe("text/markdown");
      expect(result.content).toContain("# Configuración Cisco IOS");
      expect(result.content).toContain("## Tabla de Contenidos");
      expect(result.content).toContain("```");
    });

    it("should include table of contents", () => {
      const result = exportToMarkdown(mockConfig, {
        format: "md",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.content).toContain("System Configuration");
      expect(result.content).toContain("Interface Configuration");
    });
  });

  describe("JSON Export", () => {
    it("should export to JSON format", () => {
      const result = exportToJson(mockConfig, {
        format: "json",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.filename).toMatch(/\.json$/);
      expect(result.mimeType).toBe("application/json");

      const parsed = JSON.parse(result.content);
      expect(parsed.vendor).toBe("Cisco IOS");
      expect(parsed.site).toBe("sede1");
      expect(parsed.totalCommands).toBe(5);
      expect(parsed.sections.length).toBe(2);
    });

    it("should preserve command structure", () => {
      const result = exportToJson(mockConfig, {
        format: "json",
        includeComments: true,
        includeSectionHeaders: true,
      });

      const parsed = JSON.parse(result.content);
      expect(parsed.sections[0].name).toBe("System Configuration");
      expect(parsed.sections[0].commands.length).toBe(2);
    });
  });

  describe("CSV Export", () => {
    it("should export to CSV format", () => {
      const result = exportToCsv(mockConfig, {
        format: "csv",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.filename).toMatch(/\.csv$/);
      expect(result.mimeType).toBe("text/csv");
      expect(result.content).toContain("Sección,Descripción,Comando,Número");
    });

    it("should properly escape CSV values", () => {
      const result = exportToCsv(mockConfig, {
        format: "csv",
        includeComments: true,
        includeSectionHeaders: true,
      });

      expect(result.content).toContain('"System Configuration"');
      expect(result.content).toContain('"Basic system settings"');
    });
  });
});

describe("Site Templates", () => {
  it("should generate Cisco template for Sede 1", () => {
    const template = generateSiteTemplate("cisco", "sede1");

    expect(template.description).toContain("Cisco IOS");
    expect(template.description).toContain("Sede 1");
    expect(template.vlsmInfo.network).toBe("172.16.0.0/21");
    expect(template.vlsmInfo.mask).toBe("255.255.248.0");
    expect(template.vlsmInfo.hosts).toBe(1600);
  });

  it("should generate Huawei template for Sede 2", () => {
    const template = generateSiteTemplate("huawei", "sede2");

    expect(template.description).toContain("Huawei VRP");
    expect(template.description).toContain("Sede 2");
    expect(template.vlsmInfo.network).toBe("172.16.8.0/22");
    expect(template.vlsmInfo.mask).toBe("255.255.252.0");
    expect(template.vlsmInfo.hosts).toBe(600);
  });

  it("should generate Fortinet template for Sede 3", () => {
    const template = generateSiteTemplate("fortinet", "sede3");

    expect(template.description).toContain("Fortinet FortiGate");
    expect(template.description).toContain("Sede 3");
    expect(template.vlsmInfo.network).toBe("172.16.12.0/23");
    expect(template.vlsmInfo.mask).toBe("255.255.254.0");
    expect(template.vlsmInfo.hosts).toBe(400);
  });

  it("should have correct VLSM information for all sites", () => {
    const sites: Array<"sede1" | "sede2" | "sede3"> = ["sede1", "sede2", "sede3"];
    const vendors: Array<"cisco" | "huawei" | "fortinet"> = ["cisco", "huawei", "fortinet"];

    sites.forEach((site) => {
      vendors.forEach((vendor) => {
        const template = generateSiteTemplate(vendor, site);
        expect(template.vlsmInfo.network).toBeDefined();
        expect(template.vlsmInfo.mask).toBeDefined();
        expect(template.vlsmInfo.gateway).toBeDefined();
        expect(template.vlsmInfo.hosts).toBeGreaterThan(0);
      });
    });
  });

  it("should handle invalid vendor gracefully", () => {
    const template = generateSiteTemplate("invalid", "sede1");

    expect(template.description).toBe("Plantilla no encontrada");
    expect(template.vlsmInfo.network).toBe("0.0.0.0/0");
  });
});
