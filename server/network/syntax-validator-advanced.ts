/**
 * Advanced Syntax Validator
 * Real-time validation with detailed error reporting and suggestions
 */

export interface ValidationError {
  line: number;
  column: number;
  severity: "error" | "warning" | "info";
  message: string;
  suggestion: string;
  command: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    score: number; // 0-100
  };
}

// Cisco IOS Validation Rules
const ciscoRules = {
  keywords: [
    "enable",
    "configure",
    "terminal",
    "interface",
    "ip",
    "address",
    "no",
    "shutdown",
    "exit",
    "end",
    "router",
    "ospf",
    "network",
    "area",
    "access-list",
    "permit",
    "deny",
    "vlan",
    "switchport",
    "mode",
    "trunk",
    "allowed",
    "vlan",
  ],
  patterns: {
    ipAddress: /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/,
    interfaceName: /^interface\s+(Ethernet|FastEthernet|GigabitEthernet|Vlan)\d+(?:\/\d+)?/i,
    ipConfig: /^ip\s+address\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i,
    routerOSPF: /^router\s+ospf\s+\d+/i,
    accessList: /^access-list\s+\d+\s+(permit|deny)/i,
  },
};

// Huawei VRP Validation Rules
const huaweiRules = {
  keywords: [
    "system-view",
    "interface",
    "ip",
    "address",
    "quit",
    "undo",
    "info-center",
    "ospf",
    "area",
    "network",
    "vlan",
    "port",
    "link-type",
    "access",
    "trunk",
    "pvid",
  ],
  patterns: {
    ipAddress: /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/,
    interfaceName: /^interface\s+(Ethernet|GigabitEthernet|Vlan)\d+(?:\/\d+)?/i,
    ipConfig: /^ip\s+address\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i,
    systemView: /^system-view/i,
  },
};

// Fortinet FortiGate Validation Rules
const fortinetRules = {
  keywords: [
    "config",
    "system",
    "global",
    "interface",
    "set",
    "ip",
    "netmask",
    "edit",
    "next",
    "end",
    "firewall",
    "policy",
    "action",
    "srcintf",
    "dstintf",
    "srcaddr",
    "dstaddr",
  ],
  patterns: {
    ipAddress: /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/,
    configBlock: /^config\s+\w+/i,
    setCommand: /^set\s+\w+\s+/i,
    editBlock: /^edit\s+\w+/i,
  },
};

function validateIPAddress(ip: string): boolean {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function validateSubnetMask(mask: string): boolean {
  if (!validateIPAddress(mask)) return false;
  // Check if it's a valid subnet mask (contiguous 1s followed by 0s)
  const parts = mask.split(".").map((p) => parseInt(p, 10));
  const binary = parts.map((p) => p.toString(2).padStart(8, "0")).join("");
  const lastOne = binary.lastIndexOf("1");
  const firstZero = binary.indexOf("0");
  // Valid if all 1s (no 0s) or 1s are before 0s
  return firstZero === -1 || (lastOne !== -1 && lastOne < firstZero);
}

export function validateCiscoCommand(
  command: string,
  lineNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = command.trim();

  if (!trimmed) return errors;

  // Check for IP address validation
  const ipMatch = trimmed.match(ciscoRules.patterns.ipConfig);
  if (ipMatch) {
    const ip = `${ipMatch[1]}.${ipMatch[2]}.${ipMatch[3]}.${ipMatch[4]}`;
    const mask = `${ipMatch[5]}.${ipMatch[6]}.${ipMatch[7]}.${ipMatch[8]}`;

    if (!validateIPAddress(ip)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(ip),
        severity: "error",
        message: `Invalid IP address: ${ip}`,
        suggestion: "Use valid IP address (0-255 for each octet)",
        command: trimmed,
      });
    }

    if (!validateSubnetMask(mask)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(mask),
        severity: "error",
        message: `Invalid subnet mask: ${mask}`,
        suggestion: "Use valid subnet mask (e.g., 255.255.255.0)",
        command: trimmed,
      });
    }
  }

  // Check for incomplete commands
  if (trimmed.endsWith("ip address")) {
    errors.push({
      line: lineNumber,
      column: trimmed.length,
      severity: "error",
      message: "Incomplete command: missing IP address and mask",
      suggestion: "Add IP address and subnet mask (e.g., 192.168.1.1 255.255.255.0)",
      command: trimmed,
    });
  }

  // Check for interface configuration
  if (trimmed.startsWith("interface")) {
    if (!trimmed.match(ciscoRules.patterns.interfaceName)) {
      errors.push({
        line: lineNumber,
        column: 10,
        severity: "warning",
        message: "Unknown interface type",
        suggestion: "Use valid interface (e.g., Ethernet0, GigabitEthernet0/0/1)",
        command: trimmed,
      });
    }
  }

  // Check for missing exit/end
  if (trimmed.startsWith("interface") || trimmed.startsWith("router")) {
    // This is a context-changing command, should be followed by exit/end
  }

  return errors;
}

export function validateHuaweiCommand(
  command: string,
  lineNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = command.trim();

  if (!trimmed) return errors;

  // Check for IP address validation
  const ipMatch = trimmed.match(huaweiRules.patterns.ipConfig);
  if (ipMatch) {
    const ip = `${ipMatch[1]}.${ipMatch[2]}.${ipMatch[3]}.${ipMatch[4]}`;
    const mask = `${ipMatch[5]}.${ipMatch[6]}.${ipMatch[7]}.${ipMatch[8]}`;

    if (!validateIPAddress(ip)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(ip),
        severity: "error",
        message: `Invalid IP address: ${ip}`,
        suggestion: "Use valid IP address (0-255 for each octet)",
        command: trimmed,
      });
    }

    if (!validateSubnetMask(mask)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(mask),
        severity: "error",
        message: `Invalid subnet mask: ${mask}`,
        suggestion: "Use valid subnet mask (e.g., 255.255.255.0)",
        command: trimmed,
      });
    }
  }

  // Check for incomplete commands
  if (trimmed.endsWith("ip address")) {
    errors.push({
      line: lineNumber,
      column: trimmed.length,
      severity: "error",
      message: "Incomplete command: missing IP address and mask",
      suggestion: "Add IP address and subnet mask (e.g., 192.168.1.1 255.255.255.0)",
      command: trimmed,
    });
  }

  // Check for system-view requirement
  if (
    (trimmed.startsWith("interface") ||
      trimmed.startsWith("router") ||
      trimmed.startsWith("vlan")) &&
    !trimmed.includes("system-view")
  ) {
    // Warning: should be in system-view context
  }

  return errors;
}

export function validateFortinetCommand(
  command: string,
  lineNumber: number
): ValidationError[] {
  const errors: ValidationError[] = [];
  const trimmed = command.trim();

  if (!trimmed) return errors;

  // Check for config block format
  if (trimmed.startsWith("config")) {
    if (!trimmed.match(fortinetRules.patterns.configBlock)) {
      errors.push({
        line: lineNumber,
        column: 0,
        severity: "error",
        message: "Invalid config block syntax",
        suggestion: "Use format: config <section> (e.g., config system global)",
        command: trimmed,
      });
    }
  }

  // Check for set command format
  if (trimmed.startsWith("set")) {
    if (!trimmed.match(fortinetRules.patterns.setCommand)) {
      errors.push({
        line: lineNumber,
        column: 0,
        severity: "error",
        message: "Invalid set command syntax",
        suggestion: "Use format: set <parameter> <value>",
        command: trimmed,
      });
    }
  }

  // Check for IP address validation
  const ipMatch = trimmed.match(/set\s+ip\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i);
  if (ipMatch) {
    const ip = `${ipMatch[1]}.${ipMatch[2]}.${ipMatch[3]}.${ipMatch[4]}`;
    if (!validateIPAddress(ip)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(ip),
        severity: "error",
        message: `Invalid IP address: ${ip}`,
        suggestion: "Use valid IP address (0-255 for each octet)",
        command: trimmed,
      });
    }
  }

  // Check for netmask validation
  const netmaskMatch = trimmed.match(
    /set\s+netmask\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i
  );
  if (netmaskMatch) {
    const mask = `${netmaskMatch[1]}.${netmaskMatch[2]}.${netmaskMatch[3]}.${netmaskMatch[4]}`;
    if (!validateSubnetMask(mask)) {
      errors.push({
        line: lineNumber,
        column: trimmed.indexOf(mask),
        severity: "error",
        message: `Invalid subnet mask: ${mask}`,
        suggestion: "Use valid subnet mask (e.g., 255.255.255.0)",
        command: trimmed,
      });
    }
  }

  return errors;
}

export function validateCommands(
  vendor: "cisco" | "huawei" | "fortinet",
  commands: string[]
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  commands.forEach((command, index) => {
    let commandErrors: ValidationError[] = [];

    switch (vendor) {
      case "cisco":
        commandErrors = validateCiscoCommand(command, index + 1);
        break;
      case "huawei":
        commandErrors = validateHuaweiCommand(command, index + 1);
        break;
      case "fortinet":
        commandErrors = validateFortinetCommand(command, index + 1);
        break;
    }

    commandErrors.forEach((error) => {
      if (error.severity === "error") {
        errors.push(error);
      } else {
        warnings.push(error);
      }
    });
  });

  const totalErrors = errors.length;
  const totalWarnings = warnings.length;
  const score = Math.max(0, 100 - totalErrors * 10 - totalWarnings * 2);

  return {
    isValid: totalErrors === 0,
    errors,
    warnings,
    summary: {
      totalErrors,
      totalWarnings,
      score,
    },
  };
}
