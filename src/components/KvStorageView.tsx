import React, { useState, useEffect } from "react";
import {
  Layers, RefreshCw, Key, AlertCircle, Copy, Check, Eye, Search, Box
} from "lucide-react";
import { KvStorageData, AccountKey } from "../types";
import { fetchKvStorage } from "../services/api";

interface KvStorageViewProps {
  account: AccountKey;
  onSwitchAccount: (acc: AccountKey) => void;
}

export const KvStorageView: React.FC<KvStorageViewProps> = ({
  account,
  onSwitchAccount
}) => {
  const [data, setData] = useState<KvStorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [loadingValue, setLoadingValue] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const loadNamespaces = async (nsOverride?: string) => {
    setLoading(true);
    setError(null);
    setSelectedValue(null);
    setSelectedKey(null);
    try {
      const res = await fetchKvStorage({
        namespace: nsOverride || selectedNamespace || undefined,
        account
      });
      setData(res);
      if (res.selectedNamespace && !selectedNamespace) {
        setSelectedNamespace(res.selectedNamespace);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar namespaces KV");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNamespaces();
  }, [account]);

  const handleSelectNamespace = (nsId: string) => {
    setSelectedNamespace(nsId);
    setSelectedKey(null);
    setSelectedValue(null);
    loadNamespaces(nsId);
  };

  const handleSelectKey = async (keyName: string) => {
    if (!selectedNamespace) return;
    setSelectedKey(keyName);
    setLoadingValue(true);
    try {
      const res = await fetchKvStorage({
        namespace: selectedNamespace,
        key: keyName,
        account
      });
      setSelectedValue(res.selectedValue || "");
    } catch (err: any) {
      setSelectedValue(`Error al cargar valor: ${err.message}`);
    } finally {
      setLoadingValue(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredKeys = (data?.keys || []).filter((k) =>
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171717] border border-[#262626] rounded-2xl p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">Cloudflare Workers KV Storage</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-300 border border-amber-600/30">
                Key-Value Global
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Explorador en tiempo real de Namespaces, Claves y Valores almacenados en KV
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Switch rápido entre cuentas */}
          <div className="flex items-center gap-1.5 bg-[#202020] border border-[#2e2e2e] rounded-xl px-2 py-1">
            <span className="text-[11px] text-neutral-400">Cuenta:</span>
            <select
              value={account}
              onChange={(e) => onSwitchAccount(e.target.value as AccountKey)}
              className="text-[11px] font-mono bg-transparent text-[#3ecf8e] outline-none cursor-pointer font-medium"
            >
              <option value="george" className="bg-[#1c1c1c] text-white">George Anders</option>
              <option value="anders" className="bg-[#1c1c1c] text-white">Anders Jival</option>
            </select>
          </div>

          <button
            onClick={() => loadNamespaces(selectedNamespace || undefined)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#222] hover:bg-[#282828] text-neutral-200 border border-[#333] transition disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Selector de Namespaces */}
      <div className="bg-[#171717] border border-[#262626] rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-white">
              Namespaces KV ({data?.namespaces?.length || 0})
            </h2>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            Cuenta: {data?.account?.email || account}
          </span>
        </div>

        {(!data?.namespaces || data.namespaces.length === 0) ? (
          <div className="p-8 text-center bg-[#141414] rounded-xl border border-dashed border-[#2b2b2b] text-neutral-400">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium">No hay Namespaces de KV creados en esta cuenta.</p>
            <p className="text-xs text-neutral-500 mt-1">
              Puedes crearlos desde Cloudflare Dashboard o mediante Wrangler en tu Worker.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {data.namespaces.map((ns) => {
              const isActive = selectedNamespace === ns.id;
              return (
                <button
                  key={ns.id}
                  onClick={() => handleSelectNamespace(ns.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition border ${
                    isActive
                      ? "bg-amber-950/40 border-amber-500/60 text-amber-200 shadow-sm"
                      : "bg-[#1f1f1f] border-[#2d2d2d] text-neutral-300 hover:border-neutral-500"
                  }`}
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>{ns.title}</span>
                  <span className="text-[10px] text-neutral-500">({ns.id.slice(0, 8)}...)</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Explorador de Claves y Valores */}
      {selectedNamespace && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[420px]">
          {/* Columna Izquierda: Lista de Keys */}
          <div className="lg:col-span-5 bg-[#171717] border border-[#262626] rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
              <span className="text-xs font-semibold text-neutral-300">
                Claves ({filteredKeys.length})
              </span>
              <div className="relative w-44">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Buscar clave..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#121212] border border-[#2b2b2b] rounded-lg pl-8 pr-2 py-1 text-xs text-white placeholder-neutral-500 outline-none focus:border-amber-500/60"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[460px]">
              {filteredKeys.length === 0 ? (
                <p className="text-xs text-neutral-500 p-4 text-center">
                  {searchTerm ? "Sin coincidencias" : "No hay claves en este Namespace"}
                </p>
              ) : (
                filteredKeys.map((k) => {
                  const isSelected = selectedKey === k.name;
                  return (
                    <button
                      key={k.name}
                      onClick={() => handleSelectKey(k.name)}
                      className={`w-full text-left p-2.5 rounded-xl text-xs font-mono transition flex items-center justify-between border ${
                        isSelected
                          ? "bg-amber-950/30 border-amber-500/50 text-amber-200"
                          : "bg-[#1b1b1b] border-transparent hover:border-[#2f2f2f] text-neutral-300 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Key className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                        <span className="truncate">{k.name}</span>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-neutral-500 shrink-0 opacity-60" />
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Visor de Valor */}
          <div className="lg:col-span-7 bg-[#171717] border border-[#262626] rounded-2xl p-4 flex flex-col space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs font-semibold text-neutral-300">Valor de:</span>
                <span className="text-xs font-mono text-amber-300 truncate font-bold">
                  {selectedKey || "Ninguna clave seleccionada"}
                </span>
              </div>
              {selectedValue && (
                <button
                  onClick={() => handleCopy(selectedValue)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-[#222] hover:bg-[#282828] text-neutral-300 hover:text-white border border-[#333] transition"
                  title="Copiar valor"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado" : "Copiar"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto bg-[#111] border border-[#222] rounded-xl p-3 max-h-[460px]">
              {loadingValue ? (
                <div className="h-48 flex items-center justify-center text-neutral-500 gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="text-xs">Cargando valor...</span>
                </div>
              ) : selectedValue !== null ? (
                <pre className="text-xs font-mono text-neutral-200 whitespace-pre-wrap break-all leading-relaxed">
                  {selectedValue}
                </pre>
              ) : (
                <div className="h-48 flex items-center justify-center text-neutral-500 text-xs">
                  Selecciona una clave a la izquierda para inspeccionar su contenido.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
