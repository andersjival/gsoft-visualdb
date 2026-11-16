import React from "react";
import { Bot, Activity, Zap, RefreshCw, MessageSquare } from "lucide-react";
import { AiApiMetrics } from "../types";

interface AiStatusBannerProps {
  online: boolean;
  metrics: Partial<AiApiMetrics> | null;
  onRefresh: () => void;
  onOpenNeuronsHistory?: () => void;
}

export const AiStatusBanner: React.FC<AiStatusBannerProps> = ({
  online,
  metrics,
  onRefresh,
  onOpenNeuronsHistory,
}) => {
  return (
    <div className="bg-[#151515] border-b border-[#262626] p-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: AI API Status */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#202020] border border-[#2e2e2e] flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
                API Oficial de IA
              </span>
              <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#202020] border border-[#2e2e2e] text-neutral-300">
                <span className={`w-1.5 h-1.5 rounded-full ${online ? "bg-[#3ecf8e] animate-pulse" : "bg-rose-400"}`} />
                {online ? "En Vivo (ai.byfiocr.com)" : "Verificando..."}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Conectado a Cloudflare Workers AI & base de datos del Agente
            </p>
          </div>
        </div>

        {/* Right: Metrics */}
        <div className="flex items-center gap-3 text-xs">
          {metrics && (
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#1c1c1c] border border-[#292929] px-2.5 py-1 rounded-lg">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-neutral-400">Neuronas Hoy:</span>
                <span className="font-mono font-bold text-neutral-200">
                  {metrics.totalNeuronsToday ?? 0}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#1c1c1c] border border-[#292929] px-2.5 py-1 rounded-lg">
                <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                <span className="text-neutral-400">Mensajes IA:</span>
                <span className="font-mono font-bold text-neutral-200">
                  {metrics.totalMessagesAnswered ?? 0}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-[#1c1c1c] border border-[#292929] px-2.5 py-1 rounded-lg">
                <Activity className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span className="text-neutral-400">Total Mes:</span>
                <span className="font-mono font-bold text-neutral-200">
                  {metrics.totalNeuronsMonth ?? 0}
                </span>
              </div>
            </div>
          )}

          {onOpenNeuronsHistory && (
            <button
              onClick={onOpenNeuronsHistory}
              title="Ver desglose detallado de neuronas y costos estimados"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Historial & Costos</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            title="Sincronizar métricas desde la API de IA"
            className="p-1.5 rounded-lg bg-[#1c1c1c] hover:bg-[#242424] text-neutral-400 hover:text-neutral-200 border border-[#292929] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
