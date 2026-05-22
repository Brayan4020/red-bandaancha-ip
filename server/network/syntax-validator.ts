/**
 * Syntax Validator for Network Commands
 * Validates commands for Cisco IOS, Huawei VRP, and Fortinet FortiGate
 */

export interface ValidationError {
  line: number;
  command: string;
  severity: "critical" | "warning" | "info";
  issue: string;
  suggestion: string;
}

export interface ValidationResult {
  vendor: string;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  summary: string;
}

/**
 * Validate Cisco IOS commands
 */
export function validateCiscoCommands(commands: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  commands.forEach((cmd, idx) => {
    const line = idx + 1;
    const trimmed = cmd.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("!")) return;

    // Check for common Cisco syntax errors
    if (trimmed.startsWith("configure terminal") && idx > 0) {
      errors.push({
        line,
        command: trimmed,
        severity: "critical",
        issue: "configure terminal debe ser el primer comando",
        suggestion: "Mueve 'configure terminal' al inicio de la configuración",
      });
    }

    // Check for missing 'no shutdown' on interfaces
    if (trimmed.startsWith("interface ") && !commands.slice(idx, idx + 5).some((c) => c.trim() === "no shutdown")) {
      warnings.push({
        line,
        command: trimmed,
        severity: "warning",
        issue: "Interface sin 'no shutdown' puede no estar activa",
        suggestion: "Agrega 'no shutdown' después de configurar la interfaz",
      });
    }

    // Check for invalid IP addresses
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const ips = trimmed.match(ipRegex) || [];
    ips.forEach((ip) => {
      const parts = ip.split(".").map(Number);
      if (parts.some((p) => p > 255)) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `Dirección IP inválida: ${ip}`,
          suggestion: "Verifica que cada octeto sea menor a 256",
        });
      }
    });

    // Check for invalid VLAN IDs
    if (trimmed.startsWith("vlan ")) {
      const vlanId = parseInt(trimmed.split(" ")[1]);
      if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `VLAN ID inválido: ${vlanId}`,
          suggestion: "Los VLAN IDs deben estar entre 1 y 4094",
        });
      }
    }

    // Check for ACL syntax
    if (trimmed.startsWith("access-list ")) {
      if (!trimmed.includes("permit") && !trimmed.includes("deny")) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: "ACL sin 'permit' o 'deny'",
          suggestion: "Especifica 'permit' o 'deny' en la ACL",
        });
      }
    }

    // Check for router configuration
    if (trimmed.startsWith("router ospf ")) {
      const ospfId = parseInt(trimmed.split(" ")[2]);
      if (isNaN(ospfId) || ospfId < 1 || ospfId > 65535) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `OSPF ID inválido: ${ospfId}`,
          suggestion: "El OSPF ID debe estar entre 1 y 65535",
        });
      }
    }

    // Check for incomplete commands
    if (trimmed.endsWith("(") || trimmed.endsWith("{")) {
      warnings.push({
        line,
        command: trimmed,
        severity: "warning",
        issue: "Comando parece incompleto",
        suggestion: "Verifica que el comando esté completo",
      });
    }
  });

  return {
    vendor: "Cisco IOS",
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: `${errors.length} errores críticos, ${warnings.length} advertencias`,
  };
}

/**
 * Validate Huawei VRP commands
 */
export function validateHuaweiCommands(commands: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  commands.forEach((cmd, idx) => {
    const line = idx + 1;
    const trimmed = cmd.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) return;

    // Check for system-view
    if (trimmed === "system-view" && idx > 0) {
      errors.push({
        line,
        command: trimmed,
        severity: "critical",
        issue: "system-view debe ser el primer comando",
        suggestion: "Mueve 'system-view' al inicio de la configuración",
      });
    }

    // Check for missing 'quit'
    if ((trimmed.startsWith("interface ") || trimmed.startsWith("vlan ")) && !commands.slice(idx, idx + 10).some((c) => c.trim() === "quit")) {
      warnings.push({
        line,
        command: trimmed,
        severity: "warning",
        issue: "Contexto sin 'quit' para salir",
        suggestion: "Agrega 'quit' después de configurar el contexto",
      });
    }

    // Check for invalid IP addresses
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const ips = trimmed.match(ipRegex) || [];
    ips.forEach((ip) => {
      const parts = ip.split(".").map(Number);
      if (parts.some((p) => p > 255)) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `Dirección IP inválida: ${ip}`,
          suggestion: "Verifica que cada octeto sea menor a 256",
        });
      }
    });

    // Check for VLAN configuration
    if (trimmed.startsWith("vlan ")) {
      const vlanId = parseInt(trimmed.split(" ")[1]);
      if (isNaN(vlanId) || vlanId < 1 || vlanId > 4094) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `VLAN ID inválido: ${vlanId}`,
          suggestion: "Los VLAN IDs deben estar entre 1 y 4094",
        });
      }
    }

    // Check for ACL syntax
    if (trimmed.startsWith("acl ")) {
      if (!trimmed.includes("rule")) {
        warnings.push({
          line,
          command: trimmed,
          severity: "warning",
          issue: "ACL sin definición de reglas",
          suggestion: "Agrega reglas con 'rule' después de definir la ACL",
        });
      }
    }
  });

  return {
    vendor: "Huawei VRP",
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: `${errors.length} errores críticos, ${warnings.length} advertencias`,
  };
}

/**
 * Validate Fortinet FortiGate commands
 */
export function validateFortinetCommands(commands: string[]): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  let configDepth = 0;

  commands.forEach((cmd, idx) => {
    const line = idx + 1;
    const trimmed = cmd.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("#")) return;

    // Track config depth
    if (trimmed.startsWith("config ")) {
      configDepth++;
    }
    if (trimmed === "end") {
      configDepth--;
      if (configDepth < 0) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: "Comando 'end' sin contexto 'config' abierto",
          suggestion: "Verifica que cada 'end' corresponda a un 'config'",
        });
      }
    }

    // Check for invalid IP addresses
    const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g;
    const ips = trimmed.match(ipRegex) || [];
    ips.forEach((ip) => {
      const parts = ip.split(".").map(Number);
      if (parts.some((p) => p > 255)) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `Dirección IP inválida: ${ip}`,
          suggestion: "Verifica que cada octeto sea menor a 256",
        });
      }
    });

    // Check for interface configuration
    if (trimmed.startsWith("edit ") && trimmed.includes("port")) {
      const portNum = parseInt(trimmed.split("port")[1]);
      if (isNaN(portNum) || portNum < 1) {
        errors.push({
          line,
          command: trimmed,
          severity: "critical",
          issue: `Número de puerto inválido`,
          suggestion: "Verifica que el puerto sea válido (port1, port2, etc.)",
        });
      }
    }

    // Check for policy configuration
    if (trimmed.startsWith("edit ") && configDepth > 0) {
      if (!commands.slice(idx, idx + 10).some((c) => c.trim() === "next")) {
        warnings.push({
          line,
          command: trimmed,
          severity: "warning",
          issue: "Entrada sin 'next' para cerrar",
          suggestion: "Agrega 'next' después de configurar la entrada",
        });
      }
    }
  });

  if (configDepth !== 0) {
    errors.push({
      line: commands.length,
      command: "EOF",
      severity: "critical",
      issue: `Contextos 'config' sin cerrar: ${configDepth}`,
      suggestion: "Agrega 'end' para cerrar todos los contextos abiertos",
    });
  }

  return {
    vendor: "Fortinet FortiGate",
    isValid: errors.length === 0,
    errors,
    warnings,
    summary: `${errors.length} errores críticos, ${warnings.length} advertencias`,
  };
}

/**
 * Main validation function
 */
export function validateCommands(vendor: string, commands: string[]): ValidationResult {
  switch (vendor.toLowerCase()) {
    case "cisco":
    case "cisco ios":
      return validateCiscoCommands(commands);
    case "huawei":
    case "huawei vrp":
      return validateHuaweiCommands(commands);
    case "fortinet":
    case "fortinet fortigate":
      return validateFortinetCommands(commands);
    default:
      return {
        vendor,
        isValid: false,
        errors: [
          {
            line: 0,
            command: "",
            severity: "critical",
            issue: `Fabricante no soportado: ${vendor}`,
            suggestion: "Usa Cisco, Huawei o Fortinet",
          },
        ],
        warnings: [],
        summary: "Fabricante no soportado",
      };
  }
}
