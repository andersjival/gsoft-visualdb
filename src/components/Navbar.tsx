import React from "react";
import { Database, Terminal, ExternalLink, LogOut, Zap } from "lucide-react";
import { D1Database } from "../types";

interface NavbarProps {
  selectedDb: D1Database | null;
  onOpenSql: () => void;
  onSelectByfio: () => void;
  onLogout: () => void;
  userName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDb,
  onOpenSql,
  onSelectByfio,
  onLogout,
  userName
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Database className="w-5 h-5" />
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

        {/* Center / Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Quick Byfio button */}
          <button
            onClick={onSelectByfio}
            title="Visualizar base de datos de byfiocr (byfiocr.pages.dev)"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>byfiocr</span>
          </button>

          {/* External link to byfiocr.pages.dev */}
          <a
            href="https://byfiocr.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir web en vivo byfiocr.pages.dev"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <span>byfiocr.pages.dev</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* SQL Console Button */}
          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Consola</span> SQL
          </button>
        </div>

        {/* User & Logout */}
        <div className="flex items-center gap-3">
          {selectedDb && (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400">DB:</span>
              <span className="font-mono text-slate-200 font-medium">{selectedDb.name}</span>
            </div>
          )}

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
