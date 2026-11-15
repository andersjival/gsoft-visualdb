import React from "react";
import { Database, Terminal, LogOut, Bot, HardDrive, ExternalLink } from "lucide-react";
import { D1Database } from "../types";

interface NavbarProps {
  selectedDb: D1Database | null;
  onOpenSql: () => void;
  onSelectMainDb: () => void;
  onSelectAiDb: () => void;
  onLogout: () => void;
  userName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDb,
  onOpenSql,
  onSelectMainDb,
  onSelectAiDb,
  onLogout,
  userName
}) => {
  const isMainActive = selectedDb?.name === "byfiocr-db";
  const isAiActive = selectedDb?.name === "byfio-agent-db" || (selectedDb?.name.includes("agent") ?? false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">GeoSoft</span>
              <span className="text-[11px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 px-1.5 py-0.5 rounded font-semibold">
                VisualDB
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Cuenta: <span className="text-slate-300 font-mono">Anders Jival</span>
            </p>
          </div>
        </div>

        {/* Center: The Two Primary Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botón 1: Visualizar la base de datos */}
          <button
            onClick={onSelectMainDb}
            title="Visualizar la base de datos principal de byfiocr"
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm border ${
              isMainActive
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500 ring-1 ring-emerald-500/50"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-emerald-300"
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isMainActive ? "text-emerald-400" : "text-slate-400"}`} />
            <span>Visualizar la base de datos</span>
          </button>

          {/* Botón 2: Visualizar la base de datos de IA */}
          <button
            onClick={onSelectAiDb}
            title="Visualizar la base de datos del agente de IA conectado a la API oficial"
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition shadow-sm border ${
              isAiActive
                ? "bg-purple-600/25 text-purple-200 border-purple-500 ring-1 ring-purple-500/50 shadow-purple-900/30"
                : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700 hover:text-purple-300"
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${isAiActive ? "text-purple-400 animate-pulse" : "text-slate-400"}`} />
            <span>Visualizar la base de datos de IA</span>
          </button>
        </div>

        {/* Right: SQL Console & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://byfiocr.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir web en vivo byfiocr.pages.dev"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/60 transition"
          >
            <span>byfiocr.pages.dev</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">SQL</span>
          </button>

          <button
            onClick={onLogout}
            title={`Cerrar sesión (${userName || "Admin"})`}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
