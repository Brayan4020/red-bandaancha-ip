/**
 * Configuration Auditor
 * Audits network configurations against best practices and VLSM plan
 */

import { invokeLLM } from "../_core/llm";

export interface AuditRequest {
  vendor: string;
  commands: string[];
  sections: Array<{
    name: string;
    description: string;
    commands: string[];
  }>;
  site: string;
}

export interface AuditIssue {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  issue: string;
  recommendation: string;
  affectedCommands: string[];
}

export interface AuditResult {
  vendor: string;
  site: string;
  timestamp: number;
  overallScore: number; // 0-100
  issues: AuditIssue[];
  summary: string;
  bestPracticesApplied: string[];
  vlsmCompliance: {
    compliant: boolean;
    details: string;
  };
}

// VLSM Reference Data
const VLSM_REFERENCE = {
  sede1: {
    network: "172.16.0.0/21",
    mask: "255.255.248.0",
    gateway: "172.16.0.1",
    maxHosts: 2046,
    requiredHosts: 1600,
  },
  sede2: {
    network: "172.16.8.0/22",
    mask: "255.255.252.0",
    gateway: "172.16.8.1",
    maxHosts: 1022,
    requiredHosts: 600,
  },
  sede3: {
    network: "172.16.12.0/23",
    mask: "255.255.254.0",
    gateway: "172.16.12.1",
    maxHosts: 510,
    requiredHosts: 400,
  },
};

/**
 * Audit configuration using LLM
 */
export async function auditConfiguration(
  request: AuditRequest
): Promise<AuditResult> {
  const vlsmRef = VLSM_REFERENCE[request.site as keyof typeof VLSM_REFERENCE];

  // Build audit prompt
  const auditPrompt = `You are a senior network engineer auditing a ${request.vendor} network configuration.

VLSM Reference for ${request.site}:
- Network: ${vlsmRef.network}
- Subnet Mask: ${vlsmRef.mask}
- Gateway: ${vlsmRef.gateway}
- Max Hosts: ${vlsmRef.maxHosts}
- Required Hosts: ${vlsmRef.requiredHosts}

Configuration to audit:
${request.sections
  .map(
    (s) => `
## ${s.name}
${s.description}
Commands:
${s.commands.map((c) => `  ${c}`).join("\n")}
`
  )
  .join("\n")}

Please audit this configuration and provide:
1. VLSM compliance check (verify IP ranges match the plan)
2. Security issues (ACLs, authentication, encryption)
3. Redundancy and high availability concerns
4. QoS configuration validation
5. OSPF/routing protocol best practices
6. DHCP pool sizing and allocation
7. Monitoring and logging adequacy
8. Interface configuration best practices
9. VLAN segmentation appropriateness
10. Performance optimization opportunities

For each issue found, provide:
- Severity level (critical/high/medium/low/info)
- Category (security/performance/redundancy/compliance/best-practice)
- Specific issue description
- Recommended fix
- Affected commands

Also list all best practices that ARE correctly applied.

Format your response as JSON with this structure:
{
  "vlsmCompliant": boolean,
  "vlsmDetails": "explanation",
  "issues": [
    {
      "severity": "critical|high|medium|low|info",
      "category": "string",
      "issue": "string",
      "recommendation": "string",
      "affectedCommands": ["cmd1", "cmd2"]
    }
  ],
  "bestPracticesApplied": ["practice1", "practice2"],
  "summary": "overall assessment"
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a senior network engineer with expertise in Cisco IOS, Huawei VRP, and Fortinet FortiGate. Provide detailed technical audits of network configurations.",
        },
        {
          role: "user",
          content: auditPrompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "audit_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              vlsmCompliant: { type: "boolean" },
              vlsmDetails: { type: "string" },
              issues: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    severity: {
                      type: "string",
                      enum: ["critical", "high", "medium", "low", "info"],
                    },
                    category: { type: "string" },
                    issue: { type: "string" },
                    recommendation: { type: "string" },
                    affectedCommands: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: [
                    "severity",
                    "category",
                    "issue",
                    "recommendation",
                    "affectedCommands",
                  ],
                  additionalProperties: false,
                },
              },
              bestPracticesApplied: {
                type: "array",
                items: { type: "string" },
              },
              summary: { type: "string" },
            },
            required: [
              "vlsmCompliant",
              "vlsmDetails",
              "issues",
              "bestPracticesApplied",
              "summary",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse LLM response
    const content = response.choices[0].message.content;
    const auditData = JSON.parse(
      typeof content === "string" ? content : JSON.stringify(content)
    );

    // Calculate score
    const criticalCount = auditData.issues.filter(
      (i: AuditIssue) => i.severity === "critical"
    ).length;
    const highCount = auditData.issues.filter(
      (i: AuditIssue) => i.severity === "high"
    ).length;
    const mediumCount = auditData.issues.filter(
      (i: AuditIssue) => i.severity === "medium"
    ).length;

    const score = Math.max(
      0,
      100 - criticalCount * 15 - highCount * 8 - mediumCount * 3
    );

    return {
      vendor: request.vendor,
      site: request.site,
      timestamp: Date.now(),
      overallScore: score,
      issues: auditData.issues,
      summary: auditData.summary,
      bestPracticesApplied: auditData.bestPracticesApplied,
      vlsmCompliance: {
        compliant: auditData.vlsmCompliant,
        details: auditData.vlsmDetails,
      },
    };
  } catch (error) {
    console.error("Audit failed:", error);
    throw new Error(`Configuration audit failed: ${error}`);
  }
}

/**
 * Quick local audit (without LLM) for basic checks
 */
export function quickAudit(request: AuditRequest): AuditResult {
  const issues: AuditIssue[] = [];
  const bestPractices: string[] = [];
  const vlsmRef = VLSM_REFERENCE[request.site as keyof typeof VLSM_REFERENCE];

  const allCommandsText = request.commands.join("\n");

  // Check VLSM compliance
  let vlsmCompliant = true;
  let vlsmDetails = "VLSM configuration verified";

  if (!allCommandsText.includes(vlsmRef.network.split("/")[0])) {
    vlsmCompliant = false;
    vlsmDetails = `Missing VLSM network ${vlsmRef.network}`;
    issues.push({
      severity: "critical",
      category: "compliance",
      issue: `VLSM network ${vlsmRef.network} not found in configuration`,
      recommendation: `Add network configuration for ${vlsmRef.network}/${vlsmRef.mask}`,
      affectedCommands: [],
    });
  } else {
    bestPractices.push("VLSM network correctly configured");
  }

  // Check for OSPF
  if (
    allCommandsText.includes("ospf") ||
    allCommandsText.includes("router ospf")
  ) {
    bestPractices.push("OSPF routing protocol configured");
  } else {
    issues.push({
      severity: "high",
      category: "redundancy",
      issue: "OSPF routing protocol not configured",
      recommendation: "Enable OSPF for dynamic routing and automatic failover",
      affectedCommands: [],
    });
  }

  // Check for QoS
  if (
    allCommandsText.includes("qos") ||
    allCommandsText.includes("traffic-policy") ||
    allCommandsText.includes("policy-map")
  ) {
    bestPractices.push("QoS policies configured for traffic prioritization");
  } else {
    issues.push({
      severity: "medium",
      category: "performance",
      issue: "QoS policies not configured",
      recommendation:
        "Implement QoS to prioritize voice and video traffic over data",
      affectedCommands: [],
    });
  }

  // Check for DHCP
  if (
    allCommandsText.includes("dhcp") ||
    allCommandsText.includes("ip pool")
  ) {
    bestPractices.push("DHCP configured for automatic IP assignment");
  } else {
    issues.push({
      severity: "medium",
      category: "best-practice",
      issue: "DHCP not configured",
      recommendation: "Configure DHCP pools for each VLAN",
      affectedCommands: [],
    });
  }

  // Check for security (ACLs)
  if (
    allCommandsText.includes("acl") ||
    allCommandsText.includes("access-list") ||
    allCommandsText.includes("firewall policy")
  ) {
    bestPractices.push("Access control lists configured");
  } else {
    issues.push({
      severity: "high",
      category: "security",
      issue: "No access control lists found",
      recommendation:
        "Implement ACLs to restrict inter-VLAN traffic and protect management interfaces",
      affectedCommands: [],
    });
  }

  // Check for VLANs
  const vlanCount = (allCommandsText.match(/vlan\s+\d+/gi) || []).length;
  if (vlanCount >= 5) {
    bestPractices.push(
      `${vlanCount} VLANs configured for proper network segmentation`
    );
  } else {
    issues.push({
      severity: "high",
      category: "best-practice",
      issue: `Only ${vlanCount} VLANs found (expected at least 5)`,
      recommendation:
        "Configure VLANs for Datos, Voz, CCTV, Servidores, and Gestión",
      affectedCommands: [],
    });
  }

  // Check for monitoring
  if (
    allCommandsText.includes("snmp") ||
    allCommandsText.includes("logging") ||
    allCommandsText.includes("syslog")
  ) {
    bestPractices.push("SNMP and syslog monitoring configured");
  } else {
    issues.push({
      severity: "medium",
      category: "best-practice",
      issue: "SNMP and syslog not configured",
      recommendation: "Enable SNMP and syslog for centralized monitoring",
      affectedCommands: [],
    });
  }

  // Check for redundancy (spanning tree / RSTP)
  if (
    allCommandsText.includes("spanning-tree") ||
    allCommandsText.includes("stp")
  ) {
    bestPractices.push("Spanning Tree Protocol configured for loop prevention");
  } else {
    issues.push({
      severity: "high",
      category: "redundancy",
      issue: "Spanning Tree Protocol not configured",
      recommendation:
        "Enable RSTP for automatic loop detection and prevention",
      affectedCommands: [],
    });
  }

  // Check for encryption (VPN)
  if (allCommandsText.includes("ipsec") || allCommandsText.includes("vpn")) {
    bestPractices.push("VPN encryption configured for WAN links");
  } else {
    issues.push({
      severity: "high",
      category: "security",
      issue: "No VPN encryption configured for WAN links",
      recommendation:
        "Implement IPSec VPN tunnels for secure inter-site communication",
      affectedCommands: [],
    });
  }

  // Calculate score
  const criticalCount = issues.filter(
    (i) => i.severity === "critical"
  ).length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;

  const score = Math.max(
    0,
    100 - criticalCount * 15 - highCount * 8 - mediumCount * 3
  );

  return {
    vendor: request.vendor,
    site: request.site,
    timestamp: Date.now(),
    overallScore: score,
    issues,
    summary: `Configuration audit for ${request.vendor} at ${request.site}: ${issues.length} issues found. Score: ${score}/100`,
    bestPracticesApplied: bestPractices,
    vlsmCompliance: {
      compliant: vlsmCompliant,
      details: vlsmDetails,
    },
  };
}
