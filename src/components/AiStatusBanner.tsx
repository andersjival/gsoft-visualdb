import React from "react";
import { Bot, Activity, Zap, RefreshCw, MessageSquare, CheckCircle2 } from "lucide-react";
import { AiApiMetrics } from "../types";

interface AiStatusBannerProps {
  online: boolean;
  metrics: Partial<AiApiMetrics> | null;
  onRefresh: () => void;
}

export const AiStatusBanner: React.FC<AiStatusBannerProps> = ({
  online,
  metrics,
  onRefresh
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border-b border-purple-900/40 p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: AI API Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                API Oficial de IA
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-purple-900/40 border border-purple-700/50 text-purple-300">
                <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                {online ? "En Vivo (ai.byfiocr.com)" : "Verificando..."}
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Conectado al motor Cloudflare Workers AI & base de datos del Agente
            </p>
          </div>
        </div>

        {/* Right: Quick Live Metrics from API */}
        <div className="flex items-center gap-3 text-xs">
          {metrics && (
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Neuronas Hoy:</span>
                <span className="font-mono font-bold text-purple-200">
                  {metrics.totalNeuronsToday ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">Mensajes IA:</span>
                <span className="font-mono font-bold text-cyan-200">
                  {metrics.totalMessagesAnswered ?? 0}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Total Mes:</span>
                <span className="font-mono font-bold text-emerald-200">
                  {metrics.totalNeuronsMonth ?? 0}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={onRefresh}
            title="Sincronizar métricas desde la API de IA"
            className="p-1.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-800/40 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
