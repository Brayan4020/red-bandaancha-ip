/**
 * Configuraciones Generador Page
 * Generate and audit network device configurations
 */

import { ConfigGenerator } from "@/components/ConfigGenerator";
import { Code, Zap } from "lucide-react";

export default function ConfiguracionesGenerador() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Code className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              Generador de Configuraciones
            </h1>
          </div>
          <p className="text-slate-600 ml-11">
            Genera y audita configuraciones de red para Huawei, Cisco y Fortinet
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Generación</h3>
                <p className="text-sm text-slate-600">
                  Comandos completos y auditados para 3 fabricantes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Auditoría</h3>
                <p className="text-sm text-slate-600">
                  Validación VLSM y mejores prácticas
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded">
                <Code className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">3 Sedes</h3>
                <p className="text-sm text-slate-600">
                  Teusaquillo, Campus U, AV68
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generator Component */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          <ConfigGenerator />
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Cómo usar</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Selecciona la sede, fabricante y tipo de dispositivo</li>
            <li>Haz clic en "Generar Configuración" para crear los comandos</li>
            <li>Revisa los comandos organizados por secciones</li>
            <li>La auditoría se ejecuta automáticamente mostrando problemas y mejoras</li>
            <li>Copia los comandos directamente para aplicar en tus dispositivos</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
