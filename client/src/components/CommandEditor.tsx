import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy, Check, AlertCircle } from "lucide-react";

export interface CommandEditorProps {
  commands?: string[];
  sections?: Array<{
    name: string;
    description: string;
    commands: string[];
  }>;
  vendor: "cisco" | "huawei" | "fortinet";
  onCommandsChange: (commands: string[]) => void;
  readOnly?: boolean;
}

export function CommandEditor({
  commands = [],
  sections = [],
  vendor,
  onCommandsChange,
  readOnly = false,
}: CommandEditorProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedCommands, setEditedCommands] = useState((commands || []).join("\n"));
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ line: number; message: string }[]>([]);

  const handleSaveChanges = useCallback(() => {
    const newCommands = editedCommands
      .split("\n")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    onCommandsChange(newCommands);
    setEditMode(false);
    validateCommands(newCommands);
  }, [editedCommands, onCommandsChange]);

  const handleAddCommand = useCallback(() => {
    const newCommands = [...commands, ""];
    onCommandsChange(newCommands);
    setEditedCommands(newCommands.join("\n"));
  }, [commands, onCommandsChange]);

  const handleRemoveCommand = useCallback(
    (index: number) => {
      const newCommands = commands.filter((_, i) => i !== index);
      onCommandsChange(newCommands);
      setEditedCommands(newCommands.join("\n"));
    },
    [commands, onCommandsChange]
  );

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText(commands.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [commands]);

  const validateCommands = (cmds: string[]) => {
    const newErrors: { line: number; message: string }[] = [];

    cmds.forEach((cmd, index) => {
      if (vendor === "cisco") {
        // Cisco validation
        if (cmd.includes("ip address") && cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/)) {
          const match = cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const parts = match[0].split(".").map(Number);
            if (parts.some((p) => p > 255)) {
              newErrors.push({
                line: index + 1,
                message: "Invalid IP address octet (must be 0-255)",
              });
            }
          }
        }
        if (cmd.includes("vlan") && cmd.match(/vlan\s+(\d+)/)) {
          const match = cmd.match(/vlan\s+(\d+)/);
          if (match) {
            const vlanId = parseInt(match[1]);
            if (vlanId < 1 || vlanId > 4094) {
              newErrors.push({
                line: index + 1,
                message: "Invalid VLAN ID (must be 1-4094)",
              });
            }
          }
        }
      } else if (vendor === "huawei") {
        // Huawei validation
        if (cmd.includes("ip address") && cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/)) {
          const match = cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const parts = match[0].split(".").map(Number);
            if (parts.some((p) => p > 255)) {
              newErrors.push({
                line: index + 1,
                message: "Invalid IP address octet (must be 0-255)",
              });
            }
          }
        }
        if (cmd.includes("vlan") && cmd.match(/vlan\s+(\d+)/)) {
          const match = cmd.match(/vlan\s+(\d+)/);
          if (match) {
            const vlanId = parseInt(match[1]);
            if (vlanId < 1 || vlanId > 4094) {
              newErrors.push({
                line: index + 1,
                message: "Invalid VLAN ID (must be 1-4094)",
              });
            }
          }
        }
      } else if (vendor === "fortinet") {
        // Fortinet validation
        if (cmd.includes("set ip") && cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/)) {
          const match = cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const parts = match[0].split(".").map(Number);
            if (parts.some((p) => p > 255)) {
              newErrors.push({
                line: index + 1,
                message: "Invalid IP address octet (must be 0-255)",
              });
            }
          }
        }
      }
    });

    setErrors(newErrors);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Editar Comandos</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            disabled={commands.length === 0}
          >
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
          {!readOnly && (
            <>
              {editMode ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditMode(false)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleSaveChanges}>
                    Guardar Cambios
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                  Editar
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
          {errors.map((error, idx) => (
            <div key={idx} className="flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Línea {error.line}:</strong> {error.message}
              </div>
            </div>
          ))}
        </div>
      )}

      {editMode ? (
        <Card className="p-4">
          <Textarea
            value={editedCommands}
            onChange={(e) => setEditedCommands(e.target.value)}
            className="font-mono text-sm min-h-96"
            placeholder="Ingresa los comandos, uno por línea..."
          />
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">Todos ({commands.length})</TabsTrigger>
            {sections.map((section, idx) => (
              <TabsTrigger key={idx} value={`section-${idx}`}>
                {section.name} ({section.commands.length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="space-y-2">
            <Card className="p-4">
              <div className="space-y-2">
                {commands.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay comandos</p>
                ) : (
                  commands.map((cmd, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                    >
                      <code className="text-xs font-mono flex-1 break-all text-green-400">{cmd}</code>
                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCommand(idx)}
                          className="ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          {sections.map((section, sectionIdx) => (
            <TabsContent key={sectionIdx} value={`section-${sectionIdx}`} className="space-y-2">
              <div className="space-y-2">
                <div>
                  <h4 className="font-semibold text-sm">{section.name}</h4>
                  <p className="text-xs text-gray-600">{section.description}</p>
                </div>
                <Card className="p-4">
                  <div className="space-y-2">
                    {section.commands.map((cmd, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-700 hover:bg-gray-800 transition-colors"
                      >
                        <code className="text-xs font-mono flex-1 break-all text-green-400">{cmd}</code>
                        {!readOnly && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const globalIdx = commands.indexOf(cmd);
                              if (globalIdx !== -1) {
                                handleRemoveCommand(globalIdx);
                              }
                            }}
                            className="ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {!readOnly && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleAddCommand}
          disabled={editMode}
        >
          <Plus className="w-4 h-4 mr-2" />
          Agregar Comando
        </Button>
      )}

      <div className="text-xs text-gray-600 space-y-1">
        <p>
          <strong>Total de comandos:</strong> {commands.length}
        </p>
        <p>
          <strong>Secciones:</strong> {sections.length}
        </p>
        {errors.length > 0 && (
          <p className="text-red-600">
            <strong>Errores encontrados:</strong> {errors.length}
          </p>
        )}
      </div>
    </div>
  );
}
