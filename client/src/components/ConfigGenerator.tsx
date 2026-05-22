/**
 * Configuration Generator & Auditor Component
 * Generates, validates, audits and exports network device configurations
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Download,
  Play,
  Zap,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { CommandEditor } from "./CommandEditor";

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
  const [exportFormat, setExportFormat] = useState<ExportFormat>("txt");
  const [showValidation, setShowValidation] = useState(false);
  const [editedCommands, setEditedCommands] = useState<string[]>([]);
  const [configName, setConfigName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [applyStatus, setApplyStatus] = useState<"idle" | "connecting" | "applying" | "success" | "error">("idle");
  const [deviceIp, setDeviceIp] = useState("");
  const [deviceUsername, setDeviceUsername] = useState("");
  const [devicePassword, setDevicePassword] = useState("");

  // Queries
  const generateQuery = trpc.network.generateConfig.useQuery(config, {
    enabled: false,
  });

  const auditQuery = trpc.network.auditConfig.useQuery(
    {
      vendor: generateQuery.data?.config?.vendor || "",
      commands: editedCommands.length > 0 ? editedCommands : (generateQuery.data?.config?.commands || []),
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
      commands: editedCommands.length > 0 ? editedCommands : (generateQuery.data?.config?.commands || []),
    },
    {
      enabled: !!generateQuery.data?.config && showValidation,
    }
  );

  const exportQuery = trpc.network.exportConfig.useQuery(
    {
      config: {
        ...generateQuery.data?.config,
        commands: editedCommands.length > 0 ? editedCommands : (generateQuery.data?.config?.commands || []),
      } || {
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

  const saveHistoryMutation = trpc.network.saveConfigToHistory.useMutation();
  const applyConfigMutation = trpc.network.applyConfiguration.useMutation();

  const handleGenerate = async () => {
    await generateQuery.refetch();
    setEditedCommands([]);
  };

  const handleCopyCommands = () => {
    const commands = editedCommands.length > 0 ? editedCommands : (generateQuery.data?.config?.commands || []);
    if (commands.length > 0) {
      const text = commands.join("\n");
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

  const handleSaveToHistory = async () => {
    if (!generateQuery.data?.config) return;

    setIsSaving(true);
    try {
      await saveHistoryMutation.mutateAsync({
        vendor: config.vendor as any,
        deviceType: config.deviceType as any,
        siteId: config.siteId as any,
        configName: configName || `${config.vendor}-${config.siteId}-${new Date().toLocaleDateString()}`,
        configContent: JSON.stringify({
          ...generateQuery.data.config,
          commands: editedCommands.length > 0 ? editedCommands : generateQuery.data.config.commands,
        }),
        commandCount: editedCommands.length > 0 ? editedCommands.length : generateQuery.data.config.commands.length,
        auditScore: auditQuery.data?.audit?.score || 0,
        auditNotes: auditQuery.data?.audit?.summary || "",
        tags: [config.vendor, config.siteId, config.deviceType],
      });
      setConfigName("");
    } catch (error) {
      console.error("Error saving configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyConfiguration = async () => {
    if (!generateQuery.data?.config || !deviceIp || !deviceUsername || !devicePassword) {
      alert("Por favor completa todos los campos");
      return;
    }

    setIsApplying(true);
    setApplyStatus("connecting");

    try {
      await applyConfigMutation.mutateAsync({
        vendor: config.vendor as any,
        commands: editedCommands.length > 0 ? editedCommands : generateQuery.data.config.commands,
        deviceIp,
        deviceUsername,
        devicePassword,
        devicePort: 22,
      });
      setApplyStatus("success");
      setTimeout(() => setApplyStatus("idle"), 3000);
    } catch (error) {
      console.error("Error applying configuration:", error);
      setApplyStatus("error");
      setTimeout(() => setApplyStatus("idle"), 3000);
    } finally {
      setIsApplying(false);
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

  const currentCommands = editedCommands.length > 0 ? editedCommands : (generateQuery.data?.config?.commands || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Generador de Configuraciones</h1>
        <p className="text-gray-600">
          Genera, edita, audita y aplica configuraciones de red para Huawei, Cisco y Fortinet
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
              <p className="text-xs text-gray-600">Comandos completos para 3 fabricantes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <span className="text-sm font-bold">✓</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Edición Visual</h3>
              <p className="text-xs text-gray-600">Edita y valida comandos antes de aplicar</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
              <span className="text-sm font-bold">🚀</span>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Aplicación SSH</h3>
              <p className="text-xs text-gray-600">Aplica directamente en dispositivos</p>
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

        <Button onClick={handleGenerate} disabled={generateQuery.isLoading} className="w-full">
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

      {/* Results Tabs */}
      {generateQuery.data?.config && (
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">Editor Visual</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
            <TabsTrigger value="export">Exportar</TabsTrigger>
            <TabsTrigger value="apply">Aplicar SSH</TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-4">
            <Card className="p-6">
              <CommandEditor
                commands={currentCommands}
                sections={generateQuery.data.config.sections}
                vendor={config.vendor}
                onCommandsChange={setEditedCommands}
              />
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleCopyCommands} variant="outline" className="flex-1">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar Todo
                  </>
                )}
              </Button>
              <Button onClick={handleSaveToHistory} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar en Historial"
                )}
              </Button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre de la Configuración</label>
              <Input
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Ej: Config-Sede1-2026-05-22"
              />
            </div>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-4">
            {auditQuery.isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : auditQuery.data?.audit ? (
              <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Resultados de Auditoría</h3>
                  <div className="text-3xl font-bold text-blue-600">{auditQuery.data.audit.score}/100</div>
                </div>

                <p className="text-gray-600">{auditQuery.data.audit.summary}</p>

                {auditQuery.data.audit.issues && auditQuery.data.audit.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Problemas Encontrados:</h4>
                    {auditQuery.data.audit.issues.map((issue: AuditIssue, idx: number) => (
                      <div key={idx} className={`p-3 rounded border ${getSeverityColor(issue.severity)}`}>
                        <div className="flex items-start gap-2">
                          {getSeverityIcon(issue.severity)}
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{issue.category}: {issue.issue}</p>
                            <p className="text-xs mt-1">{issue.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ) : null}
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Formato de Exportación</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="txt">Texto Plano (.txt)</option>
                  <option value="md">Markdown (.md)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>

              {exportQuery.data?.export && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Archivo:</strong> {exportQuery.data.export.filename}
                  </p>
                  <Button onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Configuración
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Apply SSH Tab */}
          <TabsContent value="apply" className="space-y-4">
            <Card className="p-6 space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ <strong>Advertencia:</strong> Esta función aplicará los comandos directamente en el dispositivo. Asegúrate de tener acceso SSH habilitado.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">IP del Dispositivo</label>
                  <Input
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    placeholder="Ej: 192.168.1.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Usuario SSH</label>
                  <Input
                    value={deviceUsername}
                    onChange={(e) => setDeviceUsername(e.target.value)}
                    placeholder="Ej: admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña SSH</label>
                  <Input
                    type="password"
                    value={devicePassword}
                    onChange={(e) => setDevicePassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {applyStatus === "success" && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <p className="text-sm text-green-800">✓ Configuración aplicada exitosamente</p>
                </div>
              )}

              {applyStatus === "error" && (
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-sm text-red-800">✗ Error al aplicar la configuración</p>
                </div>
              )}

              <Button
                onClick={handleApplyConfiguration}
                disabled={isApplying || !deviceIp || !deviceUsername || !devicePassword}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Aplicar Configuración
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>Total de comandos:</strong> {currentCommands.length}</p>
                <p><strong>Dispositivo:</strong> {config.vendor.toUpperCase()} {config.deviceType}</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
