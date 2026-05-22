/**
 * Configuration Generator & Auditor Component
 * Generates, validates, audits and exports network device configurations
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Loader2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { Streamdown } from "streamdown";

type Site = "sede1" | "sede2" | "sede3";
type Vendor = "huawei" | "cisco" | "fortinet";
type DeviceType = "switch" | "router" | "firewall";
type ExportFormat = "txt" | "md" | "json" | "csv";

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

interface ValidationError {
  line: number;
  command: string;
  severity: "critical" | "warning" | "info";
  issue: string;
  suggestion: string;
}

export function ConfigGenerator() {
  const [config, setConfig] = useState<ConfigState>({
    siteId: "sede1",
    vendor: "huawei",
    deviceType: "switch",
  });

  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");
  const [showValidation, setShowValidation] = useState(false);

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

  const validateQuery = trpc.network.validateSyntax.useQuery(
    {
      vendor: config.vendor,
      commands: generateQuery.data?.config?.commands || [],
    },
    {
      enabled: !!generateQuery.data?.config && showValidation,
    }
  );

  const exportQuery = trpc.network.exportConfig.useQuery(
    {
      config: generateQuery.data?.config || {
        vendor: "",
        deviceType: "",
        site: "",
        commands: [],
        sections: [],
        timestamp: 0,
      },
      format: exportFormat,
      includeComments: true,
      includeSectionHeaders: true,
    },
    {
      enabled: !!generateQuery.data?.config,
    }
  );

  const siteTemplateQuery = trpc.network.getSiteTemplate.useQuery(
    {
      vendor: config.vendor,
      site: config.siteId,
    },
    {
      enabled: true,
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

  const handleDownload = () => {
    if (exportQuery.data?.export) {
      const element = document.createElement("a");
      const file = new Blob([exportQuery.data.export.content], {
        type: exportQuery.data.export.mimeType,
      });
      element.href = URL.createObjectURL(file);
      element.download = exportQuery.data.export.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const getSeverityColor = (severity: "critical" | "high" | "medium" | "low" | "info" | "warning") => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "warning":
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
      case "warning":
      case "medium":
      case "low":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Generador de Configuraciones</h1>
        <p className="text-gray-600">
          Genera y audita configuraciones de red para Huawei, Cisco y Fortinet
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <span className="text-sm font-bold">⚙️</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Generación</h3>
              <p className="text-xs text-gray-600">Comandos completos y auditados para 3 fabricantes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <span className="text-sm font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Validación</h3>
              <p className="text-xs text-gray-600">Validación VLSM y mejores prácticas</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
              <span className="text-sm font-bold">{siteTemplateQuery.data?.template?.vlsmInfo?.hosts}</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Plantillas por Sede</h3>
              <p className="text-xs text-gray-600">Configuraciones específicas VLSM</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Configuration Form */}
      <Card className="p-6 bg-black text-white">
        <h2 className="text-lg font-semibold mb-4">Generar Configuración</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">Sede</label>
            <select
              value={config.siteId}
              onChange={(e) => setConfig({ ...config, siteId: e.target.value as Site })}
              className="w-full px-3 py-2 bg-gray-800 border border-red-500 rounded text-white text-sm"
            >
              <option value="sede1">Sede 1 - Teusaquillo</option>
              <option value="sede2">Sede 2 - Campus U</option>
              <option value="sede3">Sede 3 - AV68</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fabricante</label>
            <select
              value={config.vendor}
              onChange={(e) => setConfig({ ...config, vendor: e.target.value as Vendor })}
              className="w-full px-3 py-2 bg-gray-800 border border-red-500 rounded text-white text-sm"
            >
              <option value="huawei">Huawei VRP</option>
              <option value="cisco">Cisco IOS</option>
              <option value="fortinet">Fortinet FortiGate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Dispositivo</label>
            <select
              value={config.deviceType}
              onChange={(e) => setConfig({ ...config, deviceType: e.target.value as DeviceType })}
              className="w-full px-3 py-2 bg-gray-800 border border-red-500 rounded text-white text-sm"
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
          className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-semibold"
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

      {/* Site Template Info */}
      {siteTemplateQuery.data?.template && (
        <Card className="p-4 bg-purple-50 border-purple-200">
          <h3 className="font-semibold mb-2">Información de Plantilla</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Red</p>
              <p className="font-mono font-semibold">{siteTemplateQuery.data.template.vlsmInfo.network}</p>
            </div>
            <div>
              <p className="text-gray-600">Máscara</p>
              <p className="font-mono font-semibold">{siteTemplateQuery.data.template.vlsmInfo.mask}</p>
            </div>
            <div>
              <p className="text-gray-600">Gateway</p>
              <p className="font-mono font-semibold">{siteTemplateQuery.data.template.vlsmInfo.gateway}</p>
            </div>
            <div>
              <p className="text-gray-600">Hosts</p>
              <p className="font-semibold">{siteTemplateQuery.data.template.vlsmInfo.hosts}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Configuration */}
      {generateQuery.data?.config && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Configuración Generada</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleCopyCommands}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copiado" : "Copiar"}
              </Button>

              <Button
                onClick={() => setShowValidation(!showValidation)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                {showValidation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showValidation ? "Ocultar" : "Validar"}
              </Button>

              <div className="flex gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="px-2 py-1 text-sm border rounded"
                >
                  <option value="txt">TXT</option>
                  <option value="md">Markdown</option>
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </Button>
              </div>
            </div>
          </div>

          {/* Validation Results */}
          {showValidation && validateQuery.data?.validation && (
            <div className="mb-4 space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm font-semibold text-blue-900">
                  {validateQuery.data.validation.isValid ? "✓ Validación exitosa" : "✗ Errores encontrados"}
                </p>
                <p className="text-xs text-blue-700">{validateQuery.data.validation.summary}</p>
              </div>

              {validateQuery.data.validation.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-900">Errores Críticos:</h4>
                  {validateQuery.data.validation.errors.map((error: ValidationError, idx: number) => (
                    <div key={idx} className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                      <p className="font-semibold text-red-900">Línea {error.line}: {error.issue}</p>
                      <p className="text-red-700">Sugerencia: {error.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {validateQuery.data.validation.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-900">Advertencias:</h4>
                  {validateQuery.data.validation.warnings.map((warning: ValidationError, idx: number) => (
                    <div key={idx} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p className="font-semibold text-yellow-900">Línea {warning.line}: {warning.issue}</p>
                      <p className="text-yellow-700">Sugerencia: {warning.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-2">
            {generateQuery.data.config.sections?.map((section, idx) => (
              <div key={idx} className="border rounded-lg">
                <button
                  onClick={() =>
                    setExpandedSection(expandedSection === section.name ? null : section.name)
                  }
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="text-left">
                    <h3 className="font-semibold">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                  <span className="text-sm text-gray-500">{section.commands.length} comandos</span>
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
                <p className="text-sm text-gray-700">{auditQuery.data.audit.vlsmCompliance.details}</p>
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
