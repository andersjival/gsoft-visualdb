import React from "react";
import { Database, RefreshCw, HardDrive, CheckCircle2, Bot, Sparkles } from "lucide-react";
import { D1Database } from "../types";

interface ProjectSelectorProps {
  databases: D1Database[];
  selectedDb: D1Database | null;
  onSelect: (db: D1Database) => void;
  onRefresh: () => void;
  loading: boolean;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  databases,
  selectedDb,
  onSelect,
  onRefresh,
  loading
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white flex items-center gap-2">
              Proyectos Cloudflare D1 ({databases.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Explora y modifica registros de cualquier base de datos de la cuenta
            </p>
          </div>
        </div>

        {/* Right: DB Selector chips & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {databases.map((db) => {
            const isSelected = selectedDb?.uuid === db.uuid;
            const isMain = db.name === "byfiocr-db";
            const isAi = db.name === "byfio-agent-db" || db.name.includes("agent");

            return (
              <button
                key={db.uuid}
                onClick={() => onSelect(db)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? isAi
                      ? "bg-purple-500/20 border-purple-500 text-purple-200 shadow-sm"
                      : "bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isAi ? "text-purple-400" : "text-cyan-400"}`} />
                ) : isAi ? (
                  <Bot className="w-3.5 h-3.5 text-purple-400" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{db.name}</span>
                {isMain && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    Principal
                  </span>
                )}
                {isAi && (
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">
                    IA
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Recargar bases de datos"
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
