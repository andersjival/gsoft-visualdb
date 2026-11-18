import React from "react";
import { Database, Terminal, LogOut, Bot, HardDrive, ExternalLink, Cloud, Zap, Layers } from "lucide-react";
import { D1Database, AccountKey } from "../types";

interface NavbarProps {
  selectedDb: D1Database | null;
  account: AccountKey;
  onSwitchAccount: (acc: AccountKey) => void;
  onOpenSql: () => void;
  onSelectMainDb: () => void;
  onSelectAiDb: () => void;
  onOpenNeuronsHistory?: () => void;
  activeTab?: "database" | "r2" | "kv";
  onSelectR2?: () => void;
  onSelectKv?: () => void;
  onLogout: () => void;
  userName: string | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedDb,
  account,
  onSwitchAccount,
  onOpenSql,
  onSelectMainDb,
  onSelectAiDb,
  onOpenNeuronsHistory,
  activeTab = "database",
  onSelectR2,
  onSelectKv,
  onLogout,
  userName
}) => {
  const isMainActive = activeTab === "database" && (selectedDb?.name === "byfiocr-v2-db" || selectedDb?.name === "byfiocr-db");
  const isAiActive = activeTab === "database" && (selectedDb?.name === "byfio-agent-db" || (selectedDb?.name.includes("agent") ?? false));
  const isR2Active = activeTab === "r2";
  const isKvActive = activeTab === "kv";

  return (
    <header className="sticky top-0 z-30 bg-[#171717] border-b border-[#262626]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Account Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#222222] border border-[#2e2e2e] flex items-center justify-center text-neutral-300">
            <HardDrive className="w-4 h-4 text-[#3ecf8e]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm tracking-tight">GeoSoft</span>
              <span className="text-[11px] font-mono bg-[#222222] text-neutral-300 border border-[#2e2e2e] px-1.5 py-0.5 rounded font-medium">
                VisualDB
              </span>
            </div>
            {/* Selector de Cuenta Cloudflare */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] text-neutral-400">Cuenta:</span>
              <select
                value={account}
                onChange={(e) => onSwitchAccount(e.target.value as AccountKey)}
                title="Cambiar cuenta de Cloudflare (Anders Jival / George Anders)"
                className="text-[11px] font-mono bg-[#202020] hover:bg-[#282828] text-[#3ecf8e] border border-[#2e2e2e] hover:border-[#3ecf8e]/50 rounded-lg px-1.5 py-0.5 outline-none cursor-pointer transition font-medium"
              >
                <option value="anders" className="bg-[#1c1c1c] text-white">Anders Jival</option>
                <option value="george" className="bg-[#1c1c1c] text-white">georgeandersmail@gmail.com</option>
              </select>
            </div>
          </div>
        </div>

        {/* Center: The Two Primary Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onSelectMainDb}
            title="Visualizar la base de datos principal de byfiocr"
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition border ${
              isMainActive
                ? "bg-[#3ecf8e]/15 text-[#3ecf8e] border-[#3ecf8e]/60 ring-1 ring-[#3ecf8e]/30 shadow-sm"
                : "bg-[#202020] hover:bg-[#262626] text-neutral-300 border-[#2e2e2e] hover:text-white"
            }`}
          >
            <Database className={`w-3.5 h-3.5 ${isMainActive ? "text-[#3ecf8e]" : "text-neutral-400"}`} />
            <span>Visualizar la base de datos</span>
          </button>

          <button
            onClick={onSelectAiDb}
            title="Visualizar la base de datos del agente de IA"
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition border ${
              isAiActive
                ? "bg-purple-900/20 text-purple-300 border-purple-500/60 ring-1 ring-purple-500/30 shadow-sm"
                : "bg-[#202020] hover:bg-[#262626] text-neutral-300 border-[#2e2e2e] hover:text-purple-300"
            }`}
          >
            <Bot className={`w-3.5 h-3.5 ${isAiActive ? "text-purple-400 animate-pulse" : "text-neutral-400"}`} />
            <span>Visualizar la base de datos de IA</span>
          </button>

          {onOpenNeuronsHistory && (
            <button
              onClick={onOpenNeuronsHistory}
              title="Historial de neuronas gastadas y cálculo de costos en tiempo real"
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition border bg-amber-950/25 hover:bg-amber-950/45 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Neuronas & Costos</span>
            </button>
          )}

          {onSelectR2 && (
            <button
              onClick={onSelectR2}
              title="Visualizar almacenamiento de archivos Cloudflare R2 (Fotos DTF y capacidad)"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition border ${
                isR2Active
                  ? "bg-indigo-950/40 text-indigo-200 border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-sm"
                  : "bg-[#202020] hover:bg-[#262626] text-neutral-300 border-[#2e2e2e] hover:text-indigo-300"
              }`}
            >
              <Cloud className={`w-3.5 h-3.5 ${isR2Active ? "text-indigo-400" : "text-neutral-400"}`} />
              <span>Almacenamiento R2</span>
            </button>
          )}

          {onSelectKv && (
            <button
              onClick={onSelectKv}
              title="Visualizar namespaces y claves de Cloudflare Workers KV"
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-semibold transition border ${
                isKvActive
                  ? "bg-amber-950/40 text-amber-200 border-amber-500/60 ring-1 ring-amber-500/30 shadow-sm"
                  : "bg-[#202020] hover:bg-[#262626] text-neutral-300 border-[#2e2e2e] hover:text-amber-300"
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${isKvActive ? "text-amber-400" : "text-neutral-400"}`} />
              <span>Almacenamiento KV</span>
            </button>
          )}
        </div>

        {/* Right: Actions & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://byfiocr.pages.dev"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir web en vivo byfiocr.pages.dev"
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-[#202020] hover:bg-[#262626] border border-[#2e2e2e] transition"
          >
            <span>byfiocr.pages.dev</span>
            <ExternalLink className="w-3 h-3 text-neutral-500" />
          </a>

          <button
            onClick={onOpenSql}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#202020] hover:bg-[#262626] text-neutral-300 hover:text-white border border-[#2e2e2e] transition"
          >
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="hidden md:inline">SQL</span>
          </button>

          <button
            onClick={onLogout}
            title={`Cerrar sesión (${userName || "Admin"})`}
            className="p-2 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
