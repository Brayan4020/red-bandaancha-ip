/**
 * Real-time Syntax Validator Component
 * Displays validation errors and warnings with suggestions
 */

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    score: number;
  };
}

interface SyntaxValidatorProps {
  validation: ValidationResult | null;
  isValidating: boolean;
}

export function SyntaxValidator({ validation, isValidating }: SyntaxValidatorProps) {
  if (!validation) return null;

  const { errors, warnings, summary } = validation;
  const scoreColor =
    summary.score >= 80
      ? "text-green-400"
      : summary.score >= 60
        ? "text-yellow-400"
        : "text-red-400";

  return (
    <div className="space-y-4">
      {/* Score Card */}
      <Card className="p-4 bg-slate-800 border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">Puntuación de Sintaxis</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{summary.score}/100</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-red-400">
              {summary.totalErrors} {summary.totalErrors === 1 ? "error" : "errores"}
            </p>
            <p className="text-sm text-yellow-400">
              {summary.totalWarnings} {summary.totalWarnings === 1 ? "advertencia" : "advertencias"}
            </p>
          </div>
        </div>
      </Card>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Errores ({errors.length})
          </h3>
          <div className="space-y-2">
            {errors.map((error, idx) => (
              <Card
                key={idx}
                className="p-3 bg-red-900/20 border-red-700/50 hover:border-red-600 transition-colors"
              >
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-400">
                      Línea {error.line}, Columna {error.column}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{error.message}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                      {error.command}
                    </p>
                    <p className="text-xs text-green-400 mt-2">💡 {error.suggestion}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Advertencias ({warnings.length})
          </h3>
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <Card
                key={idx}
                className="p-3 bg-yellow-900/20 border-yellow-700/50 hover:border-yellow-600 transition-colors"
              >
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-yellow-400">
                      Línea {warning.line}, Columna {warning.column}
                    </p>
                    <p className="text-sm text-gray-300 mt-1">{warning.message}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1 truncate">
                      {warning.command}
                    </p>
                    <p className="text-xs text-green-400 mt-2">💡 {warning.suggestion}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Success */}
      {validation.isValid && errors.length === 0 && warnings.length === 0 && (
        <Card className="p-4 bg-green-900/20 border-green-700/50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-semibold text-green-400">✓ Sintaxis válida</p>
              <p className="text-xs text-gray-400">Todos los comandos están correctos</p>
            </div>
          </div>
        </Card>
      )}

      {/* Validating */}
      {isValidating && (
        <Card className="p-4 bg-blue-900/20 border-blue-700/50">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-400 animate-spin" />
            <p className="text-sm text-blue-400">Validando...</p>
          </div>
        </Card>
      )}
    </div>
  );
}
