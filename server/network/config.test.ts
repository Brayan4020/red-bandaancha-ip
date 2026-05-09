/**
 * Configuration Generator & Auditor Tests
 */

import { describe, it, expect } from "vitest";
import {
  generateConfiguration,
  generateHuaweiConfig,
  generateCiscoConfig,
  generateFortinetConfig,
} from "./config-generator";
import { quickAudit } from "./config-auditor";

describe("Configuration Generator", () => {
  describe("Huawei Configuration", () => {
    it("should generate complete Huawei configuration for Sede 1", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      expect(config.vendor).toBe("Huawei VRP");
      expect(config.site).toBe("sede1");
      expect(config.deviceType).toBe("switch");
      expect(config.commands.length).toBeGreaterThan(0);
      expect(config.sections.length).toBeGreaterThan(0);
    });

    it("should include VLSM network in Huawei commands", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("172.16.0.0");
      expect(commandsText).toContain("0.0.7.255");
    });

    it("should include VLANs in Huawei configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("vlan batch");
      expect(commandsText).toContain("Vlanif10");
      expect(commandsText).toContain("Vlanif20");
    });

    it("should include OSPF configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("ospf");
    });

    it("should include QoS configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("traffic classifier");
    });

    it("should include DHCP configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("dhcp enable");
      expect(commandsText).toContain("ip pool");
    });

    it("should include security configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("acl");
      expect(commandsText).toContain("stp");
    });
  });

  describe("Cisco Configuration", () => {
    it("should generate complete Cisco configuration", () => {
      const config = generateCiscoConfig({
        siteId: "sede2",
        vendor: "cisco",
        deviceType: "router",
      });

      expect(config.vendor).toBe("Cisco IOS");
      expect(config.site).toBe("sede2");
      expect(config.commands.length).toBeGreaterThan(0);
    });

    it("should include VLAN configuration in Cisco", () => {
      const config = generateCiscoConfig({
        siteId: "sede2",
        vendor: "cisco",
        deviceType: "router",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("vlan");
      expect(commandsText).toContain("interface Vlan");
    });

    it("should include OSPF in Cisco configuration", () => {
      const config = generateCiscoConfig({
        siteId: "sede2",
        vendor: "cisco",
        deviceType: "router",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("router ospf");
    });
  });

  describe("Fortinet Configuration", () => {
    it("should generate complete Fortinet configuration", () => {
      const config = generateFortinetConfig({
        siteId: "sede3",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      expect(config.vendor).toBe("Fortinet FortiGate");
      expect(config.site).toBe("sede3");
      expect(config.commands.length).toBeGreaterThan(0);
    });

    it("should include interface configuration in Fortinet", () => {
      const config = generateFortinetConfig({
        siteId: "sede3",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("config system interface");
    });

    it("should include firewall policies in Fortinet", () => {
      const config = generateFortinetConfig({
        siteId: "sede3",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("firewall policy");
    });

    it("should include VPN configuration in Fortinet", () => {
      const config = generateFortinetConfig({
        siteId: "sede3",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      const commandsText = config.commands.join("\n");
      expect(commandsText).toContain("vpn ipsec");
    });
  });

  describe("Generic Generator", () => {
    it("should generate config for any supported vendor", () => {
      const huaweiConfig = generateConfiguration({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const ciscoConfig = generateConfiguration({
        siteId: "sede1",
        vendor: "cisco",
        deviceType: "switch",
      });

      const fortinetConfig = generateConfiguration({
        siteId: "sede1",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      expect(huaweiConfig.vendor).toBe("Huawei VRP");
      expect(ciscoConfig.vendor).toBe("Cisco IOS");
      expect(fortinetConfig.vendor).toBe("Fortinet FortiGate");
    });

    it("should throw error for unsupported vendor", () => {
      expect(() => {
        generateConfiguration({
          siteId: "sede1",
          vendor: "unsupported" as any,
          deviceType: "switch",
        });
      }).toThrow();
    });
  });
});

describe("Configuration Auditor", () => {
  describe("Quick Audit", () => {
    it("should audit Huawei configuration", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const audit = quickAudit({
        vendor: config.vendor,
        commands: config.commands,
        sections: config.sections,
        site: "sede1",
      });

      expect(audit.vendor).toBe("Huawei VRP");
      expect(audit.site).toBe("sede1");
      expect(audit.overallScore).toBeGreaterThanOrEqual(0);
      expect(audit.overallScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(audit.issues)).toBe(true);
      expect(Array.isArray(audit.bestPracticesApplied)).toBe(true);
    });

    it("should verify VLSM compliance", () => {
      const config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const audit = quickAudit({
        vendor: config.vendor,
        commands: config.commands,
        sections: config.sections,
        site: "sede1",
      });

      expect(audit.vlsmCompliance.compliant).toBe(true);
    });

    it("should detect missing OSPF", () => {
      const audit = quickAudit({
        vendor: "Huawei VRP",
        commands: ["interface Vlanif10", "ip address 172.16.0.1 255.255.255.0"],
        sections: [],
        site: "sede1",
      });

      const ospfIssue = audit.issues.find(
        (i) => i.issue.toLowerCase().includes("ospf")
      );
      expect(ospfIssue).toBeDefined();
      expect(ospfIssue?.severity).toBe("high");
    });

    it("should detect missing QoS", () => {
      const audit = quickAudit({
        vendor: "Cisco IOS",
        commands: ["interface Vlan10", "ip address 172.16.0.1 255.255.255.0"],
        sections: [],
        site: "sede1",
      });

      const qosIssue = audit.issues.find(
        (i) => i.issue.toLowerCase().includes("qos")
      );
      expect(qosIssue).toBeDefined();
      expect(qosIssue?.severity).toBe("medium");
    });

    it("should detect missing security (ACLs)", () => {
      const audit = quickAudit({
        vendor: "Cisco IOS",
        commands: ["interface Vlan10", "ip address 172.16.0.1 255.255.255.0"],
        sections: [],
        site: "sede1",
      });

      const securityIssue = audit.issues.find(
        (i) => i.category === "security"
      );
      expect(securityIssue).toBeDefined();
    });

    it("should recognize good configurations", () => {
      const config = generateCiscoConfig({
        siteId: "sede1",
        vendor: "cisco",
        deviceType: "switch",
      });

      const audit = quickAudit({
        vendor: config.vendor,
        commands: config.commands,
        sections: config.sections,
        site: "sede1",
      });

      expect(audit.bestPracticesApplied.length).toBeGreaterThan(0);
      expect(audit.overallScore).toBeGreaterThan(50);
    });

    it("should calculate score correctly", () => {
      const config = generateFortinetConfig({
        siteId: "sede1",
        vendor: "fortinet",
        deviceType: "firewall",
      });

      const audit = quickAudit({
        vendor: config.vendor,
        commands: config.commands,
        sections: config.sections,
        site: "sede1",
      });

      // Score should be between 0 and 100
      expect(audit.overallScore).toBeGreaterThanOrEqual(0);
      expect(audit.overallScore).toBeLessThanOrEqual(100);

      // More issues should result in lower score
      const criticalCount = audit.issues.filter(
        (i) => i.severity === "critical"
      ).length;
      const highCount = audit.issues.filter(
        (i) => i.severity === "high"
      ).length;

      const expectedScore = Math.max(
        0,
        100 - criticalCount * 15 - highCount * 8
      );
      expect(audit.overallScore).toBeLessThanOrEqual(expectedScore + 1); // +1 for rounding
    });

    it("should handle different sites correctly", () => {
      const sede1Config = generateHuaweiConfig({
        siteId: "sede1",
        vendor: "huawei",
        deviceType: "switch",
      });

      const sede2Config = generateHuaweiConfig({
        siteId: "sede2",
        vendor: "huawei",
        deviceType: "switch",
      });

      const audit1 = quickAudit({
        vendor: sede1Config.vendor,
        commands: sede1Config.commands,
        sections: sede1Config.sections,
        site: "sede1",
      });

      const audit2 = quickAudit({
        vendor: sede2Config.vendor,
        commands: sede2Config.commands,
        sections: sede2Config.sections,
        site: "sede2",
      });

      expect(audit1.site).toBe("sede1");
      expect(audit2.site).toBe("sede2");
      expect(audit1.vlsmCompliance.compliant).toBe(true);
      expect(audit2.vlsmCompliance.compliant).toBe(true);
    });
  });
});
