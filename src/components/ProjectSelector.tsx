import React from "react";
import { Database, RefreshCw, HardDrive, CheckCircle2, Globe } from "lucide-react";
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
    <div className="bg-slate-900 border-b border-slate-800 p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Bases de Datos D1 en Cloudflare
              <span className="text-xs font-normal text-slate-400">({databases.length} disponibles)</span>
            </h2>
            <p className="text-xs text-slate-400">
              Selecciona el proyecto que deseas explorar y modificar en tiempo real
            </p>
          </div>
        </div>

        {/* Right: DB Selector chips & Refresh */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {databases.map((db) => {
            const isSelected = selectedDb?.uuid === db.uuid;
            const isByfio = db.name === "byfiocr-db";

            return (
              <button
                key={db.uuid}
                onClick={() => onSelect(db)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap border ${
                  isSelected
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-300 shadow-sm"
                    : "bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600 hover:text-white"
                }`}
              >
                {isSelected ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                ) : (
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{db.name}</span>
                {isByfio && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                    byfiocr
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onRefresh}
            disabled={loading}
            title="Recargar bases de datos"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
