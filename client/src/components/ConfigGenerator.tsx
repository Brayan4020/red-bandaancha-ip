/**
 * Configuration Generator & Auditor Component
 * Generates and audits network device configurations
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Copy, Check, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { Streamdown } from "streamdown";

type Site = "sede1" | "sede2" | "sede3";
type Vendor = "huawei" | "cisco" | "fortinet";
type DeviceType = "switch" | "router" | "firewall";

interface ConfigState {
  siteId: Site;
  vendor: Vendor;
  deviceType: DeviceType;
}

interface AuditIssue {
  severity: "critical" | "high" | "medium" | "low" | "info";
  category: string;
  issue: string;
  recommendation: string;
  affectedCommands: string[];
}

export function ConfigGenerator() {
  const [config, setConfig] = useState<ConfigState>({
    siteId: "sede1",
    vendor: "huawei",
    deviceType: "switch",
  });

  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Queries
  const generateQuery = trpc.network.generateConfig.useQuery(config, {
    enabled: false,
  });

  const auditQuery = trpc.network.auditConfig.useQuery(
    {
      vendor: generateQuery.data?.config?.vendor || "",
      commands: generateQuery.data?.config?.commands || [],
      sections: generateQuery.data?.config?.sections || [],
      site: config.siteId,
    },
    {
      enabled: !!generateQuery.data?.config,
    }
  );

  const handleGenerate = async () => {
    await generateQuery.refetch();
  };

  const handleCopyCommands = () => {
    if (generateQuery.data?.config?.commands) {
      const text = generateQuery.data.config.commands.join("\n");
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getSeverityColor = (
    severity: "critical" | "high" | "medium" | "low" | "info"
  ) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "info":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "medium":
      case "low":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Generar Configuración</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Site Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Sede</label>
            <select
              value={config.siteId}
              onChange={(e) =>
                setConfig({ ...config, siteId: e.target.value as Site })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="sede1">Sede 1 - Teusaquillo</option>
              <option value="sede2">Sede 2 - Campus U</option>
              <option value="sede3">Sede 3 - AV68</option>
            </select>
          </div>

          {/* Vendor Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Fabricante</label>
            <select
              value={config.vendor}
              onChange={(e) =>
                setConfig({ ...config, vendor: e.target.value as Vendor })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="huawei">Huawei VRP</option>
              <option value="cisco">Cisco IOS</option>
              <option value="fortinet">Fortinet FortiGate</option>
            </select>
          </div>

          {/* Device Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Dispositivo</label>
            <select
              value={config.deviceType}
              onChange={(e) =>
                setConfig({ ...config, deviceType: e.target.value as DeviceType })
              }
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="switch">Switch</option>
              <option value="router">Router</option>
              <option value="firewall">Firewall</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateQuery.isLoading}
          className="w-full"
        >
          {generateQuery.isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            "Generar Configuración"
          )}
        </Button>
      </Card>

      {/* Generated Configuration */}
      {generateQuery.data?.config && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Configuración Generada</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyCommands}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Comandos
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {generateQuery.data.config.sections?.map((section, idx) => (
              <div key={idx} className="border rounded-lg">
                <button
                  onClick={() =>
                    setExpandedSection(
                      expandedSection === section.name ? null : section.name
                    )
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="text-left">
                    <h3 className="font-semibold">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {section.commands.length} comandos
                  </span>
                </button>

                {expandedSection === section.name && (
                  <div className="px-4 py-3 bg-gray-50 border-t">
                    <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto font-mono">
                      {section.commands.join("\n")}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Audit Results */}
      {auditQuery.data?.audit && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">Resultados de Auditoría</h2>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Puntuación General</span>
                  <span className="text-2xl font-bold">
                    {auditQuery.data.audit.overallScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      auditQuery.data.audit.overallScore >= 80
                        ? "bg-green-500"
                        : auditQuery.data.audit.overallScore >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${auditQuery.data.audit.overallScore}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* VLSM Compliance */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start gap-2">
              {auditQuery.data.audit.vlsmCompliance.compliant ? (
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className="font-semibold">Cumplimiento VLSM</h3>
                <p className="text-sm text-gray-700">
                  {auditQuery.data.audit.vlsmCompliance.details}
                </p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 border rounded">
            <h3 className="font-semibold mb-2">Resumen</h3>
            <Streamdown>{auditQuery.data.audit.summary}</Streamdown>
          </div>

          {/* Best Practices Applied */}
          {auditQuery.data.audit.bestPracticesApplied.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Mejores Prácticas Aplicadas
              </h3>
              <ul className="space-y-1">
                {auditQuery.data.audit.bestPracticesApplied.map((practice, idx) => (
                  <li key={idx} className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Issues Found */}
          {auditQuery.data.audit.issues.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Problemas Encontrados ({auditQuery.data.audit.issues.length})
              </h3>
              <div className="space-y-2">
                {auditQuery.data.audit.issues.map((issue: AuditIssue, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 border rounded ${getSeverityColor(issue.severity)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSeverityIcon(issue.severity)}
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          [{issue.severity.toUpperCase()}] {issue.issue}
                        </div>
                        <div className="text-xs mt-1">
                          <strong>Categoría:</strong> {issue.category}
                        </div>
                        <div className="text-xs mt-1">
                          <strong>Recomendación:</strong> {issue.recommendation}
                        </div>
                        {issue.affectedCommands.length > 0 && (
                          <div className="text-xs mt-1">
                            <strong>Comandos Afectados:</strong>
                            <div className="mt-1 font-mono text-xs bg-black bg-opacity-10 p-1 rounded">
                              {issue.affectedCommands.slice(0, 2).join(", ")}
                              {issue.affectedCommands.length > 2 &&
                                ` +${issue.affectedCommands.length - 2} más`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Loading State */}
      {(generateQuery.isLoading || auditQuery.isLoading) && (
        <Card className="p-6 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Procesando...</span>
        </Card>
      )}

      {/* Error State */}
      {(generateQuery.error || auditQuery.error) && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">
                {generateQuery.error?.message || auditQuery.error?.message}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
