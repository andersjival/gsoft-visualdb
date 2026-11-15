import React from "react";
import { X, RefreshCw, HardDrive, Zap, ShieldCheck } from "lucide-react";
import { DbPlanMetrics } from "../types";

interface DbMetricsModalProps {
  metrics: DbPlanMetrics | null;
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const DbMetricsModal: React.FC<DbMetricsModalProps> = ({ metrics, loading, onRefresh, onClose }) => {
  if (!metrics) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#171717] border border-[#2d2d2d] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-[#3ecf8e]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Métricas de Base de Datos</h3>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {metrics.planName}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">{metrics.databaseName} ({metrics.databaseId})</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Actualizar métricas en tiempo real"
              className="p-1.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#333] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#252525] transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Tarjeta 1: Tamaño en Tiempo Real */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#3ecf8e]" />
                Tamaño de la Base de Datos (Tiempo Real)
              </span>
              <span className="text-xs font-mono text-neutral-400">{metrics.storagePercentUsed}% del plan</span>
            </div>
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold font-mono text-white">{metrics.fileSizeFormatted}</span>
              <span className="text-xs text-neutral-400 font-mono">Límite: {metrics.maxSizeFormatted}</span>
            </div>
            <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden border border-[#2a2a2a]">
              <div className="bg-[#3ecf8e] h-2 rounded-full transition-all" style={{ width: `${Math.max(1, metrics.storagePercentUsed)}%` }} />
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-1.5 text-right">
              {metrics.fileSizeBytes.toLocaleString()} bytes de {metrics.maxSizeBytes.toLocaleString()} bytes
            </p>
          </div>

          {/* Tarjeta 2: Solicitudes y Operaciones según el Plan */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Solicitudes Hoy (Límites Diarios del Plan)
              </span>
              <span className="text-xs font-bold font-mono text-amber-300 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded">
                {metrics.todayQueries.toLocaleString()} solicitudes hoy
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Filas Leídas Hoy (Read Rows):</span>
                  <span className="font-mono text-neutral-200">{metrics.todayRowsRead.toLocaleString()} / {metrics.maxDailyRowsRead.toLocaleString()} ({metrics.readPercentUsed}%)</span>
                </div>
                <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden border border-[#2a2a2a]">
                  <div className="bg-[#3ecf8e] h-1.5 rounded-full" style={{ width: `${Math.max(0.5, metrics.readPercentUsed)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Filas Escritas Hoy (Write Rows):</span>
                  <span className="font-mono text-neutral-200">{metrics.todayRowsWritten.toLocaleString()} / {metrics.maxDailyRowsWritten.toLocaleString()} ({metrics.writePercentUsed}%)</span>
                </div>
                <div className="w-full bg-[#202020] rounded-full h-1.5 overflow-hidden border border-[#2a2a2a]">
                  <div className="bg-purple-400 h-1.5 rounded-full" style={{ width: `${Math.max(0.5, metrics.writePercentUsed)}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[#222]">
              <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block">Consultas Lectura</span>
                <span className="text-xs font-mono font-semibold text-neutral-300">{metrics.todayReadQueries.toLocaleString()}</span>
              </div>
              <div className="bg-[#1a1a1a] p-2 rounded-lg border border-[#262626]">
                <span className="text-[10px] text-neutral-500 block">Consultas Escritura</span>
                <span className="text-xs font-mono font-semibold text-neutral-300">{metrics.todayWriteQueries.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Acumulado 30 días */}
          <div className="bg-[#141414] border border-[#262626] rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-300 block">Solicitudes Últimos 30 Días</span>
              <span className="text-[11px] text-neutral-500">Filas leídas: {metrics.monthRowsRead.toLocaleString()} | escritas: {metrics.monthRowsWritten.toLocaleString()}</span>
            </div>
            <span className="text-lg font-bold font-mono text-[#3ecf8e] bg-[#3ecf8e]/10 border border-[#3ecf8e]/30 px-2.5 py-1 rounded-lg">
              {metrics.monthQueries.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#262626] bg-[#141414] flex items-center justify-between text-xs text-neutral-500">
          <span>Actualizado: {new Date(metrics.refreshedAt).toLocaleTimeString()}</span>
          <button onClick={onClose} className="px-3 py-1.5 bg-[#252525] hover:bg-[#303030] text-neutral-200 rounded-lg font-medium transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
