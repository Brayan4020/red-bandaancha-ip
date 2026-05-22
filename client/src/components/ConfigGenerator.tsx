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
  const [generatedConfig, setGeneratedConfig] = useState<any>(null);

  // Mutations
  const generateMutation = trpc.network.generateConfig.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setGeneratedConfig(data.config);
        setEditedCommands([]);
      }
    },
  });

  const auditMutation = trpc.network.auditConfig.useMutation();
  const validateMutation = trpc.network.validateSyntax.useMutation();
  const exportMutation = trpc.network.exportConfig.useMutation();
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
    await generateMutation.mutateAsync(config);
  };

  const handleCopyCommands = () => {
    const commands = editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []);
    if (commands.length > 0) {
      const text = commands.join("\n");
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!generatedConfig) return;
    
    const result = await exportMutation.mutateAsync({
      config: {
        ...generatedConfig,
        commands: editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []),
      },
      format: exportFormat,
      includeComments: true,
      includeSectionHeaders: true,
    });

    if (result.success && result.export) {
      const element = document.createElement("a");
      const file = new Blob([result.export.content], {
        type: result.export.mimeType,
      });
      element.href = URL.createObjectURL(file);
      element.download = result.export.filename;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const handleValidate = async () => {
    if (!generatedConfig) return;
    
    const result = await validateMutation.mutateAsync({
      vendor: config.vendor,
      commands: editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []),
    });
    
    setShowValidation(!!result.success);
  };

  const handleAudit = async () => {
    if (!generatedConfig) return;
    
    await auditMutation.mutateAsync({
      vendor: generatedConfig.vendor,
      commands: editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []),
      sections: generatedConfig.sections || [],
      site: config.siteId,
    });
  };

  const handleSaveToHistory = async () => {
    if (!generatedConfig || !configName) return;
    
    setIsSaving(true);
    try {
      await saveHistoryMutation.mutateAsync({
        name: configName,
        vendor: generatedConfig.vendor,
        siteId: config.siteId,
        commands: editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []),
        sections: generatedConfig.sections || [],
        notes: "",
      });
      setConfigName("");
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplyConfiguration = async () => {
    if (!generatedConfig || !deviceIp) return;
    
    setIsApplying(true);
    setApplyStatus("connecting");
    try {
      const result = await applyConfigMutation.mutateAsync({
        deviceIp,
        username: deviceUsername,
        password: devicePassword,
        commands: editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || []),
        vendor: generatedConfig.vendor,
      });

      if (result.success) {
        setApplyStatus("success");
      } else {
        setApplyStatus("error");
      }
    } catch (error) {
      setApplyStatus("error");
    } finally {
      setIsApplying(false);
    }
  };

  const isGenerating = generateMutation.isPending;
  const isAuditing = auditMutation.isPending;
  const isValidating = validateMutation.isPending;
  const isExporting = exportMutation.isPending;

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Generador de Configuraciones</h1>
        <p className="text-gray-400">Genera, valida y audita configuraciones de red para Huawei, Cisco y Fortinet</p>
      </div>

      {/* Configuration Selection */}
      <Card className="p-6 bg-slate-900/50 border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Configuración</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Sede</label>
            <select
              value={config.siteId}
              onChange={(e) => setConfig({ ...config, siteId: e.target.value as Site })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="sede1">Sede 1 - Teusaquillo</option>
              <option value="sede2">Sede 2 - Campus U Compensar</option>
              <option value="sede3">Sede 3 - AV68</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fabricante</label>
            <select
              value={config.vendor}
              onChange={(e) => setConfig({ ...config, vendor: e.target.value as Vendor })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
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
              className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
            >
              <option value="switch">Switch</option>
              <option value="router">Router</option>
              <option value="firewall">Firewall</option>
            </select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generar Configuración
            </>
          )}
        </Button>
      </Card>

      {/* Generated Configuration */}
      {generatedConfig && (
        <Card className="p-6 bg-slate-900/50 border-slate-700">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-800">
              <TabsTrigger value="editor">Editor Visual</TabsTrigger>
              <TabsTrigger value="audit">Auditoría</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
              <TabsTrigger value="apply">Aplicar SSH</TabsTrigger>
            </TabsList>

            {/* Editor Tab */}
            <TabsContent value="editor" className="space-y-4">
              <CommandEditor
                commands={editedCommands.length > 0 ? editedCommands : (generatedConfig?.commands || [])}
                onCommandsChange={setEditedCommands}
                vendor={config.vendor}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleCopyCommands}
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Comandos
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleValidate}
                  disabled={isValidating}
                  variant="outline"
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Validar Sintaxis
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            {/* Audit Tab */}
            <TabsContent value="audit" className="space-y-4">
              <Button
                onClick={handleAudit}
                disabled={isAuditing}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {isAuditing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Auditando...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Ejecutar Auditoría
                  </>
                )}
              </Button>
              {auditMutation.data?.success && auditMutation.data?.audit && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Resultados de Auditoría</h3>
                  <Streamdown>{JSON.stringify(auditMutation.data.audit, null, 2)}</Streamdown>
                </div>
              )}
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Formato de Exportación</label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                >
                  <option value="txt">Texto (.txt)</option>
                  <option value="md">Markdown (.md)</option>
                  <option value="json">JSON (.json)</option>
                  <option value="csv">CSV (.csv)</option>
                </select>
              </div>
              <Button
                onClick={handleDownload}
                disabled={isExporting}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Configuración
                  </>
                )}
              </Button>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Guardar en Historial</label>
                <Input
                  placeholder="Nombre de la configuración"
                  value={configName}
                  onChange={(e) => setConfigName(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
                <Button
                  onClick={handleSaveToHistory}
                  disabled={isSaving || !configName}
                  variant="outline"
                  className="w-full"
                >
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
            </TabsContent>

            {/* Apply SSH Tab */}
            <TabsContent value="apply" className="space-y-4">
              <div className="space-y-3">
                <Input
                  placeholder="IP del Dispositivo"
                  value={deviceIp}
                  onChange={(e) => setDeviceIp(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  placeholder="Usuario"
                  value={deviceUsername}
                  onChange={(e) => setDeviceUsername(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={devicePassword}
                  onChange={(e) => setDevicePassword(e.target.value)}
                  className="bg-slate-800 border-slate-600"
                />
              </div>

              <Button
                onClick={handleApplyConfiguration}
                disabled={isApplying || !deviceIp}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Aplicando...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Aplicar Configuración via SSH
                  </>
                )}
              </Button>

              {applyStatus !== "idle" && (
                <div className={`p-4 rounded ${applyStatus === "success" ? "bg-green-900/20 border border-green-600" : "bg-red-900/20 border border-red-600"}`}>
                  <p className={applyStatus === "success" ? "text-green-400" : "text-red-400"}>
                    {applyStatus === "success" ? "✓ Configuración aplicada exitosamente" : "✗ Error al aplicar la configuración"}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}
