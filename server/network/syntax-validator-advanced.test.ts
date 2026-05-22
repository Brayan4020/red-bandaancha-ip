import { describe, it, expect } from "vitest";
import {
  validateCiscoCommand,
  validateHuaweiCommand,
  validateFortinetCommand,
  validateCommands,
} from "./syntax-validator-advanced";

describe("Cisco Syntax Validator", () => {
  it("should validate correct IP address configuration", () => {
    const errors = validateCiscoCommand("ip address 192.168.1.1 255.255.255.0", 1);
    expect(errors).toHaveLength(0);
  });

  it("should detect invalid IP address octet", () => {
    const errors = validateCiscoCommand("ip address 256.168.1.1 255.255.255.0", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
    expect(errors[0].message).toContain("Invalid IP address");
  });

  it("should detect invalid subnet mask", () => {
    const errors = validateCiscoCommand("ip address 192.168.1.1 255.255.255.256", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });

  it("should detect incomplete IP configuration", () => {
    const errors = validateCiscoCommand("ip address", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("Incomplete command");
  });

  it("should warn about unknown interface type", () => {
    const errors = validateCiscoCommand("interface Unknown0", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("warning");
  });

  it("should accept valid interface names", () => {
    const errors = validateCiscoCommand("interface GigabitEthernet0/0/1", 1);
    expect(errors).toHaveLength(0);
  });
});

describe("Huawei Syntax Validator", () => {
  it("should validate correct IP address configuration", () => {
    const errors = validateHuaweiCommand("ip address 192.168.1.1 255.255.255.0", 1);
    expect(errors).toHaveLength(0);
  });

  it("should detect invalid IP address octet", () => {
    const errors = validateHuaweiCommand("ip address 192.168.1.256 255.255.255.0", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });

  it("should detect incomplete IP configuration", () => {
    const errors = validateHuaweiCommand("ip address", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain("Incomplete command");
  });
});

describe("Fortinet Syntax Validator", () => {
  it("should validate correct config block", () => {
    const errors = validateFortinetCommand("config system global", 1);
    expect(errors).toHaveLength(0);
  });

  it("should detect invalid config block syntax", () => {
    const errors = validateFortinetCommand("config", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });

  it("should validate set command format", () => {
    const errors = validateFortinetCommand("set hostname firewall1", 1);
    expect(errors).toHaveLength(0);
  });

  it("should detect invalid set command", () => {
    const errors = validateFortinetCommand("set", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });

  it("should detect invalid IP in set command", () => {
    const errors = validateFortinetCommand("set ip 256.168.1.1", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });

  it("should detect invalid netmask", () => {
    const errors = validateFortinetCommand("set netmask 255.255.255.256", 1);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].severity).toBe("error");
  });
});

describe("Command Batch Validation", () => {
  it("should validate multiple Cisco commands", () => {
    const commands = [
      "enable",
      "configure terminal",
      "interface GigabitEthernet0/0/1",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
    ];

    const result = validateCommands("cisco", commands);
    expect(result.isValid).toBe(true);
    expect(result.summary.totalErrors).toBe(0);
  });

  it("should detect errors in batch validation", () => {
    const commands = [
      "interface GigabitEthernet0/0/1",
      "ip address 256.168.1.1 255.255.255.0",
      "no shutdown",
    ];

    const result = validateCommands("cisco", commands);
    expect(result.isValid).toBe(false);
    expect(result.summary.totalErrors).toBeGreaterThan(0);
  });

  it("should calculate validation score", () => {
    const commands = ["enable", "configure terminal"];
    const result = validateCommands("cisco", commands);
    expect(result.summary.score).toBeGreaterThanOrEqual(0);
    expect(result.summary.score).toBeLessThanOrEqual(100);
  });

  it("should include warnings in validation", () => {
    const commands = [
      "interface Unknown0",
      "ip address 192.168.1.1 255.255.255.0",
    ];

    const result = validateCommands("cisco", commands);
    expect(result.summary.totalWarnings).toBeGreaterThan(0);
  });

  it("should validate Huawei commands", () => {
    const commands = [
      "system-view",
      "interface GigabitEthernet0/0/1",
      "ip address 192.168.1.1 255.255.255.0",
      "quit",
    ];

    const result = validateCommands("huawei", commands);
    // May have warnings about context, but should be valid
    expect(result.summary.totalErrors).toBe(0);
  });

  it("should validate Fortinet commands", () => {
    const commands = [
      "config system global",
      "set hostname firewall1",
      "set timezone 04",
      "end",
    ];

    const result = validateCommands("fortinet", commands);
    expect(result.summary.totalErrors).toBe(0);
  });

  it("should handle empty command list", () => {
    const result = validateCommands("cisco", []);
    expect(result.isValid).toBe(true);
    expect(result.summary.totalErrors).toBe(0);
  });

  it("should handle commands with only whitespace", () => {
    const commands = ["   ", "\t", ""];
    const result = validateCommands("cisco", commands);
    expect(result.isValid).toBe(true);
  });
});

describe("Validation Score Calculation", () => {
  it("should give 100 score for valid commands", () => {
    const commands = ["enable", "configure terminal"];
    const result = validateCommands("cisco", commands);
    expect(result.summary.score).toBe(100);
  });

  it("should reduce score for each error", () => {
    const commands = [
      "ip address 256.168.1.1 255.255.255.0",
      "ip address 192.168.1.256 255.255.255.0",
    ];
    const result = validateCommands("cisco", commands);
    expect(result.summary.score).toBeLessThan(100);
    expect(result.summary.score).toBeGreaterThanOrEqual(0);
  });

  it("should reduce score less for warnings", () => {
    const commands = [
      "interface Unknown0",
      "interface GigabitEthernet0/0/1",
    ];
    const result = validateCommands("cisco", commands);
    expect(result.summary.score).toBeGreaterThan(70);
  });
});
