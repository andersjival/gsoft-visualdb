import React, { useState } from "react";
import { X, RefreshCw, Zap, DollarSign, Calendar, Bot, Volume2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { AiApiMetrics, DailyNeuronItem, NeuronLogItem } from "../types";

interface AiNeuronsModalProps {
  metrics: Partial<AiApiMetrics> | null;
  daily: DailyNeuronItem[];
  logs: NeuronLogItem[];
  loading: boolean;
  onRefresh: () => void;
  onClose: () => void;
}

export const AiNeuronsModal: React.FC<AiNeuronsModalProps> = ({
  metrics,
  daily,
  logs,
  loading,
  onRefresh,
  onClose,
}) => {
  const [filterAction, setFilterAction] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"logs" | "daily">("logs");

  const todayNeurons = metrics?.totalNeuronsToday ?? 0;
  const freeLimit = metrics?.freeTierDailyLimit ?? 10000;
  const remaining = Math.max(0, freeLimit - todayNeurons);
  const percentUsed = Math.min(100, Math.round((todayNeurons / freeLimit) * 100));
  const todayCost = metrics?.todayCostUsd ?? 0;
  const monthCost = metrics?.monthCostUsd ?? 0;

  const filteredLogs = logs.filter((log) => {
    if (filterAction === "all") return true;
    if (filterAction === "audio") return log.action === "audio";
    if (filterAction === "chat") return log.action === "chat";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#161616] border border-[#2b2b2b] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-neutral-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#262626] bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/40 border border-amber-600/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Historial de Neuronas & Costos IA</h3>
                <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-emerald-950/70 border border-emerald-800/40 text-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {metrics?.accountEmail || "soporte@byfiocr.com"}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                10,000 Neuronas diarias gratis · Excedente: $0.011 USD / 1,000 neuronas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onRefresh}
              disabled={loading}
              title="Actualizar datos en tiempo real"
              className="p-1.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#333] transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-[#252525] transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top KPI Cards */}
        <div className="p-5 border-b border-[#242424] bg-[#141414] grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Neuronas Hoy */}
          <div className="bg-[#1b1b1b] border border-[#292929] rounded-xl p-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> Neuronas Hoy</span>
              <span className="font-mono text-neutral-300">{percentUsed}%</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">{todayNeurons.toLocaleString()}</div>
            <div className="w-full bg-[#272727] rounded-full h-1.5 mt-2 overflow-hidden">
              <div className={`h-1.5 rounded-full ${percentUsed > 90 ? "bg-rose-500" : "bg-amber-400"}`} style={{ width: `${Math.max(2, percentUsed)}%` }} />
            </div>
            <p className="text-[10px] text-neutral-500 font-mono mt-1">{remaining.toLocaleString()} gratis restantes</p>
          </div>

          {/* Card 2: Costo Real Hoy */}
          <div className="bg-[#1b1b1b] border border-[#292929] rounded-xl p-3">
            <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-[#3ecf8e]" /> Costo Real Hoy
            </div>
            <div className="text-xl font-bold font-mono text-[#3ecf8e]">${todayCost.toFixed(2)} USD</div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Cubierto por Free Tier
            </div>
          </div>

          {/* Card 3: Neuronas Mes */}
          <div className="bg-[#1b1b1b] border border-[#292929] rounded-xl p-3">
            <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-purple-400" /> Neuronas Mes
            </div>
            <div className="text-xl font-bold font-mono text-white">{(metrics?.totalNeuronsMonth ?? 0).toLocaleString()}</div>
            <p className="text-[10px] text-neutral-500 font-mono mt-2">Acumulado mes en curso</p>
          </div>

          {/* Card 4: Costo Total Mes */}
          <div className="bg-[#1b1b1b] border border-[#292929] rounded-xl p-3">
            <div className="text-xs text-neutral-400 mb-1 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-400" /> Costo Facturado Mes
            </div>
            <div className="text-xl font-bold font-mono text-white">${monthCost.toFixed(2)} USD</div>
            <p className="text-[10px] text-neutral-500 font-mono mt-2">$0.011 / 1k excedentes</p>
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="px-5 py-2.5 bg-[#171717] border-b border-[#242424] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("logs")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === "logs" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-neutral-400 hover:text-white"
              }`}
            >
              Transacciones en Tiempo Real ({filteredLogs.length})
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                activeTab === "daily" ? "bg-amber-500/20 text-amber-300 border border-amber-500/40" : "text-neutral-400 hover:text-white"
              }`}
            >
              Consumo Diario ({daily.length} días)
            </button>
          </div>

          {activeTab === "logs" && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-neutral-400">Filtrar:</span>
              <button
                onClick={() => setFilterAction("all")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterAction === "all" ? "bg-[#333] text-white" : "text-neutral-400 hover:text-white"}`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterAction("chat")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterAction === "chat" ? "bg-[#333] text-white" : "text-neutral-400 hover:text-white"}`}
              >
                Chat LLM
              </button>
              <button
                onClick={() => setFilterAction("audio")}
                className={`px-2 py-0.5 rounded text-[11px] font-mono ${filterAction === "audio" ? "bg-[#333] text-white" : "text-neutral-400 hover:text-white"}`}
              >
                Voz / Audio
              </button>
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "logs" ? (
            <div className="overflow-x-auto border border-[#262626] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1b1b1b] text-neutral-400 border-b border-[#262626]">
                  <tr>
                    <th className="px-3 py-2.5">Fecha / Hora</th>
                    <th className="px-3 py-2.5">Acción</th>
                    <th className="px-3 py-2.5">Modelo</th>
                    <th className="px-3 py-2.5 text-right">Neuronas</th>
                    <th className="px-3 py-2.5 text-right">Costo Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] bg-[#141414]">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-neutral-500">
                        No hay registros de neuronas aún.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#1c1c1c] transition">
                        <td className="px-3 py-2 text-neutral-300">{log.createdAt || `${log.date} ${log.hour}:00`}</td>
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            log.action === "audio" ? "bg-purple-950/70 text-purple-300 border border-purple-800/40" : "bg-blue-950/70 text-blue-300 border border-blue-800/40"
                          }`}>
                            {log.action === "audio" ? <Volume2 className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                            {log.action}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-neutral-400 max-w-xs truncate" title={log.model}>{log.model}</td>
                        <td className="px-3 py-2 text-right font-bold text-amber-300">{log.neurons}</td>
                        <td className="px-3 py-2 text-right text-emerald-400 font-mono">
                          ${log.costUsd < 0.0001 ? "<$0.0001" : `$${log.costUsd.toFixed(4)}`}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#262626] rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#1b1b1b] text-neutral-400 border-b border-[#262626]">
                  <tr>
                    <th className="px-4 py-2.5">Fecha</th>
                    <th className="px-4 py-2.5 text-right">Neuronas</th>
                    <th className="px-4 py-2.5 text-right">Consultas</th>
                    <th className="px-4 py-2.5 text-right">Notas de Voz</th>
                    <th className="px-4 py-2.5 text-right">Costo Excedente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222] bg-[#141414]">
                  {daily.map((d) => (
                    <tr key={d.date} className="hover:bg-[#1c1c1c] transition">
                      <td className="px-4 py-2 text-neutral-200 font-bold">{d.date}</td>
                      <td className="px-4 py-2 text-right font-bold text-amber-300">{d.neurons.toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-neutral-300">{d.queries}</td>
                      <td className="px-4 py-2 text-right text-purple-300">{d.voiceNotes}</td>
                      <td className="px-4 py-2 text-right font-bold text-[#3ecf8e]">
                        ${d.costUsd.toFixed(2)} USD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
