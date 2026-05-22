import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Copy, Check, AlertCircle } from "lucide-react";
import { SyntaxValidator, ValidationResult } from "./SyntaxValidator";

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
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Real-time validation effect
  useEffect(() => {
    const validateInRealTime = async () => {
      setIsValidating(true);
      try {
        const cmds = editedCommands
          .split("\n")
          .map((cmd) => cmd.trim())
          .filter((cmd) => cmd.length > 0);

        const validationResult = performValidation(vendor, cmds);
        setValidation(validationResult);
      } finally {
        setIsValidating(false);
      }
    };

    // Debounce validation to avoid too many updates
    const timer = setTimeout(validateInRealTime, 500);
    return () => clearTimeout(timer);
  }, [editedCommands, vendor]);

  const performValidation = (vendor: string, cmds: string[]): ValidationResult => {
    const errors: any[] = [];
    const warnings: any[] = [];

    cmds.forEach((cmd, index) => {
      if (vendor === "cisco") {
        // Cisco validation
        if (cmd.includes("ip address") && cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/)) {
          const match = cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const parts = match[0].split(".").map(Number);
            if (parts.some((p) => p > 255)) {
              errors.push({
                line: index + 1,
                column: cmd.indexOf(match[0]),
                severity: "error",
                message: "Invalid IP address octet (must be 0-255)",
                suggestion: "Use valid IP octets (0-255)",
                command: cmd,
              });
            }
          }
        }

        // Check for incomplete commands
        if (cmd.endsWith("ip address")) {
          errors.push({
            line: index + 1,
            column: cmd.length,
            severity: "error",
            message: "Incomplete command: missing IP address and mask",
            suggestion: "Add IP address and subnet mask (e.g., 192.168.1.1 255.255.255.0)",
            command: cmd,
          });
        }

        // Check for interface configuration
        if (cmd.startsWith("interface")) {
          if (!cmd.match(/^interface\s+(Ethernet|FastEthernet|GigabitEthernet|Vlan)\d+/i)) {
            warnings.push({
              line: index + 1,
              column: 10,
              severity: "warning",
              message: "Unknown interface type",
              suggestion: "Use valid interface (e.g., Ethernet0, GigabitEthernet0/0/1)",
              command: cmd,
            });
          }
        }
      } else if (vendor === "huawei") {
        // Huawei validation
        if (cmd.includes("ip address") && cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/)) {
          const match = cmd.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
          if (match) {
            const parts = match[0].split(".").map(Number);
            if (parts.some((p) => p > 255)) {
              errors.push({
                line: index + 1,
                column: cmd.indexOf(match[0]),
                severity: "error",
                message: "Invalid IP address octet (must be 0-255)",
                suggestion: "Use valid IP octets (0-255)",
                command: cmd,
              });
            }
          }
        }

        // Check for system-view requirement
        if (
          (cmd.startsWith("interface") ||
            cmd.startsWith("router") ||
            cmd.startsWith("vlan")) &&
          !cmd.includes("system-view")
        ) {
          warnings.push({
            line: index + 1,
            column: 0,
            severity: "warning",
            message: "Command should be executed in system-view context",
            suggestion: "Ensure 'system-view' is called before this command",
            command: cmd,
          });
        }
      } else if (vendor === "fortinet") {
        // Fortinet validation
        if (cmd.startsWith("config")) {
          if (!cmd.match(/^config\s+\w+/i)) {
            errors.push({
              line: index + 1,
              column: 0,
              severity: "error",
              message: "Invalid config block syntax",
              suggestion: "Use format: config <section> (e.g., config system global)",
              command: cmd,
            });
          }
        }

        if (cmd.startsWith("set")) {
          if (!cmd.match(/^set\s+\w+\s+/i)) {
            errors.push({
              line: index + 1,
              column: 0,
              severity: "error",
              message: "Invalid set command syntax",
              suggestion: "Use format: set <parameter> <value>",
              command: cmd,
            });
          }
        }

        // Check for IP address validation
        const ipMatch = cmd.match(/set\s+ip\s+(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i);
        if (ipMatch) {
          const parts = [ipMatch[1], ipMatch[2], ipMatch[3], ipMatch[4]].map(Number);
          if (parts.some((p) => p > 255)) {
            errors.push({
              line: index + 1,
              column: cmd.indexOf(ipMatch[0]),
              severity: "error",
              message: "Invalid IP address",
              suggestion: "Use valid IP address (0-255 for each octet)",
              command: cmd,
            });
          }
        }
      }
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
  };

  const handleSaveChanges = useCallback(() => {
    const newCommands = editedCommands
      .split("\n")
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0);

    onCommandsChange(newCommands);
    setEditMode(false);
  }, [editedCommands, onCommandsChange]);

  const handleAddCommand = useCallback(() => {
    const newCommands = [...(commands || []), ""];
    onCommandsChange(newCommands);
    setEditedCommands(newCommands.join("\n"));
  }, [commands, onCommandsChange]);

  const handleRemoveCommand = useCallback(
    (index: number) => {
      const newCommands = (commands || []).filter((_, i) => i !== index);
      onCommandsChange(newCommands);
      setEditedCommands(newCommands.join("\n"));
    },
    [commands, onCommandsChange]
  );

  const handleCopyAll = useCallback(() => {
    navigator.clipboard.writeText((commands || []).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [commands]);

  const displayCommands = editMode ? editedCommands.split("\n") : (commands || []);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="validation">Validación</TabsTrigger>
          <TabsTrigger value="sections">Secciones</TabsTrigger>
        </TabsList>

        {/* Editor Tab */}
        <TabsContent value="editor" className="space-y-4">
          {editMode ? (
            <div className="space-y-2">
              <Textarea
                value={editedCommands}
                onChange={(e) => setEditedCommands(e.target.value)}
                placeholder="Ingresa los comandos aquí..."
                className="font-mono text-sm h-96 bg-gray-900 border-slate-600 text-green-400"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveChanges}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button
                  onClick={() => {
                    setEditMode(false);
                    setEditedCommands((commands || []).join("\n"));
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Card className="p-4 bg-gray-900 border-slate-700 max-h-96 overflow-y-auto">
                {displayCommands.length > 0 ? (
                  <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap break-words">
                    {displayCommands.join("\n")}
                  </pre>
                ) : (
                  <p className="text-gray-500 text-sm">No hay comandos</p>
                )}
              </Card>
              <div className="flex gap-2">
                <Button
                  onClick={() => setEditMode(true)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Editar Comandos
                </Button>
                <Button
                  onClick={handleCopyAll}
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
                      Copiar Todo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <SyntaxValidator validation={validation} isValidating={isValidating} />
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections" className="space-y-4">
          {(sections || []).length > 0 ? (
            <div className="space-y-2">
              {sections.map((section, idx) => (
                <Card key={idx} className="p-4 bg-slate-800 border-slate-700">
                  <h4 className="font-semibold text-sm mb-2">{section.name}</h4>
                  <p className="text-xs text-gray-400 mb-3">{section.description}</p>
                  <div className="space-y-1">
                    {section.commands.map((cmd, cmdIdx) => (
                      <div key={cmdIdx} className="text-xs font-mono text-green-400 bg-gray-900 p-2 rounded">
                        {cmd}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay secciones disponibles</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
