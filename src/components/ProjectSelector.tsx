import React from "react";
import { Database, RefreshCw, HardDrive, CheckCircle2, Bot, Zap, BarChart3 } from "lucide-react";
import { D1Database, DbPlanMetrics } from "../types";

interface ProjectSelectorProps {
  databases: D1Database[];
  selectedDb: D1Database | null;
  metrics: DbPlanMetrics | null;
  loadingMetrics: boolean;
  onSelect: (db: D1Database) => void;
  onRefresh: () => void;
  onOpenMetrics: () => void;
  loading: boolean;
}

function formatShortSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  databases,
  selectedDb,
  metrics,
  loadingMetrics,
  onSelect,
  onRefresh,
  onOpenMetrics,
  loading
}) => {
  return (
    <div className="bg-[#141414] border-b border-[#262626] p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info & Live Metrics Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#202020] border border-[#2e2e2e] text-neutral-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-neutral-200">
                Proyectos D1 ({databases.length})
              </h2>
              <p className="text-[11px] text-neutral-500 font-mono">
                {selectedDb?.name || "Sin selección"}
              </p>
            </div>
          </div>

          {/* Botón de Métricas del Plan y Tamaño en Vivo */}
          {selectedDb && (
            <button
              onClick={onOpenMetrics}
              title="Abrir panel detallado de solicitudes, uso del plan y tamaño en tiempo real"
              className="flex items-center gap-2 px-2.5 py-1 rounded-xl text-xs font-mono bg-[#1c1c1c] hover:bg-[#252525] border border-[#2e2e2e] hover:border-[#3ecf8e]/50 text-neutral-300 hover:text-white transition shadow-sm"
            >
              <HardDrive className="w-3.5 h-3.5 text-[#3ecf8e]" />
              <span className="font-semibold text-white">
                {metrics?.fileSizeFormatted || formatShortSize(selectedDb.file_size) || "..."}
              </span>
              <span className="text-neutral-600">|</span>
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300">
                {loadingMetrics ? "..." : metrics ? `${metrics.todayQueries > 999 ? `${(metrics.todayQueries / 1000).toFixed(1)}k` : metrics.todayQueries} reqs` : "Métricas"}
              </span>
              <BarChart3 className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </button>
          )}
        </div>

        {/* Right: DB Selector chips & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {databases.map((db) => {
            const isSelected = selectedDb?.uuid === db.uuid;
            const isMain = db.name === "byfiocr-v2-db" || db.name === "byfiocr-db";
            const isAi = db.name === "byfio-agent-db" || db.name.includes("agent");
            const shortSize = formatShortSize(db.file_size);

            return (
              <button
                key={db.uuid}
                onClick={() => onSelect(db)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? isAi
                      ? "bg-purple-950/40 border-purple-500/60 text-purple-200 shadow-sm"
                      : "bg-[#282828] border-[#3ecf8e]/60 text-white shadow-sm"
                    : "bg-[#1c1c1c] border-[#292929] text-neutral-400 hover:border-[#383838] hover:text-neutral-200"
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isAi ? "text-purple-400" : "text-[#3ecf8e]"}`} />
                ) : isAi ? (
                  <Bot className="w-3.5 h-3.5 text-neutral-500" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-neutral-500" />
                )}
                <span>{db.name}</span>
                {shortSize && (
                  <span className="text-[10px] text-neutral-400 font-mono">
                    ({shortSize})
                  </span>
                )}
                {isMain && (
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1 py-0.2 rounded font-mono">
                    Principal
                  </span>
                )}
                {isAi && (
                  <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/40 px-1 py-0.2 rounded font-mono">
                    IA
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Recargar bases de datos y métricas"
            className="p-1.5 rounded-xl bg-[#1c1c1c] hover:bg-[#242424] text-neutral-400 hover:text-neutral-200 border border-[#292929] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
