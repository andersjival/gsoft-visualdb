import React from "react";
import { Database, RefreshCw, HardDrive, CheckCircle2, Bot } from "lucide-react";
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
    <div className="bg-[#141414] border-b border-[#262626] p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Info */}
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#202020] border border-[#2e2e2e] text-neutral-400">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-neutral-200 flex items-center gap-2">
              Proyectos Cloudflare D1 ({databases.length})
            </h2>
            <p className="text-[11px] text-neutral-500">
              Bases de datos disponibles en la cuenta
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
                {isMain && (
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 px-1.5 py-0.2 rounded font-mono">
                    Principal
                  </span>
                )}
                {isAi && (
                  <span className="text-[10px] bg-purple-950/60 text-purple-300 border border-purple-800/40 px-1.5 py-0.2 rounded font-mono">
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
            className="p-1.5 rounded-xl bg-[#1c1c1c] hover:bg-[#242424] text-neutral-400 hover:text-neutral-200 border border-[#292929] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
