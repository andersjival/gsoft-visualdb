import React, { useState, useEffect } from "react";
import {
  Cloud, HardDrive, RefreshCw, Layers, Database, ExternalLink,
  Download, Eye, Copy, Check, ShieldCheck, AlertCircle, FileText,
  Image as ImageIcon, Zap, ChevronRight, X
} from "lucide-react";
import { R2StorageData, R2ObjectItem, DbPlanMetrics, AccountKey } from "../types";
import { fetchR2Storage } from "../services/api";

interface R2StorageViewProps {
  account: AccountKey;
  onSwitchAccount: (acc: AccountKey) => void;
  dbMetrics: DbPlanMetrics | null;
  selectedDbName?: string;
  onOpenDbMetrics: () => void;
}

export const R2StorageView: React.FC<R2StorageViewProps> = ({
  account,
  onSwitchAccount,
  dbMetrics,
  selectedDbName = "byfiocr-db",
  onOpenDbMetrics
}) => {
  const [data, setData] = useState<R2StorageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [previewItem, setPreviewItem] = useState<R2ObjectItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async (bucketOverride?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchR2Storage(bucketOverride || selectedBucket || undefined, account);
      setData(res);
      if (res.selectedBucket && !selectedBucket) {
        setSelectedBucket(res.selectedBucket);
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar datos de R2");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [account]);

  const handleCopyUrl = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredObjects = (data?.objects || []).filter((obj) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return obj.name.toLowerCase().includes(term) || obj.key.toLowerCase().includes(term);
  });

  const isGeorge = account === "george";

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#171717] border border-[#262626] rounded-2xl p-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-white">Almacenamiento Cloudflare R2 & Base de Datos</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/30 text-purple-300 border border-purple-600/30">
                Archivos & Capacidad
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Monitoreo en vivo de espacio utilizado, archivos subidos (DTF) y capacidad de almacenamiento de la BD
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
            onClick={() => loadData(selectedBucket || undefined)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[#222] hover:bg-[#282828] text-neutral-200 border border-[#333] transition disabled:opacity-50"
            title="Actualizar datos en tiempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Alerta si la cuenta actual no tiene R2 habilitado */}
      {data?.notEnabled && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/40 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-xs">
              La cuenta <strong>{data.account?.name || account}</strong> no tiene R2 activo. El servicio R2 está activo en la cuenta <strong>georgeandersmail@gmail.com</strong>.
            </p>
          </div>
          <button
            onClick={() => onSwitchAccount("george")}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold transition shrink-0"
          >
            Cambiar a cuenta con R2 Activo
          </button>
        </div>
      )}

      {/* Grid de 2 Tarjetas Maestras: R2 Storage vs BD D1 Capacity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Tarjeta 1: Espacio R2 Storage */}
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Almacenamiento Cloudflare R2</h3>
                <p className="text-[11px] font-mono text-purple-300">
                  Bucket: <strong className="text-white">{data?.selectedBucket || "byfiocr-files"}</strong>
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 flex items-center gap-1 font-bold">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              10 GB Gratis
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {data?.usage?.totalStoredFormatted || "0 B"}
                </span>
                <span className="text-xs text-neutral-400 ml-2">almacenados</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Límite: <strong className="text-neutral-200">{data?.usage?.maxSizeFormatted || "10.00 GB"}</strong>
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-[#202020] rounded-full h-2.5 overflow-hidden border border-[#2a2a2a]">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, data?.usage?.percentUsed || 0.1)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>{data?.usage?.percentUsed || 0}% de capacidad mensual</span>
              <span>Cero costo de egress / transferencia</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
            <div className="p-2.5 rounded-xl bg-[#141414] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Total Archivos</span>
              <span className="text-base font-bold font-mono text-white">
                {data?.usage?.objectCount ?? data?.objects.length ?? 0} {data?.usage?.objectCount === 1 ? "archivo" : "archivos"}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141414] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Total Subidas</span>
              <span className="text-base font-bold font-mono text-purple-300">
                {data?.usage?.uploadCount || data?.objects.length || 0} operaciones
              </span>
            </div>
          </div>
        </div>

        {/* Tarjeta 2: Capacidad Base de Datos D1 */}
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-5 space-y-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[#3ecf8e]">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Capacidad de Base de Datos (D1)</h3>
                <p className="text-[11px] font-mono text-[#3ecf8e]">
                  BD: <strong className="text-white">{selectedDbName}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={onOpenDbMetrics}
              className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#222] hover:bg-[#282828] text-neutral-300 hover:text-white border border-[#333] transition"
            >
              Ver Detalle
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
                  {dbMetrics?.fileSizeFormatted || "5.23 MB"}
                </span>
                <span className="text-xs text-neutral-400 ml-2">usados</span>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Límite: <strong className="text-neutral-200">{dbMetrics?.maxSizeFormatted || "500.00 MB"}</strong>
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full bg-[#202020] rounded-full h-2.5 overflow-hidden border border-[#2a2a2a]">
              <div
                className="bg-gradient-to-r from-[#3ecf8e] to-emerald-400 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(1, dbMetrics?.storagePercentUsed || 1)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>{dbMetrics?.storagePercentUsed || 1.05}% de cuota de almacenamiento</span>
              <span className="text-emerald-400 font-semibold">Saludable (Operativo)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#262626]">
            <div className="p-2.5 rounded-xl bg-[#141414] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Lecturas Hoy</span>
              <span className="text-base font-bold font-mono text-white">
                {(dbMetrics?.todayRowsRead || 0).toLocaleString()} <span className="text-xs text-neutral-500">/ 5M</span>
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#141414] border border-[#222]">
              <span className="text-[10px] text-neutral-500 uppercase font-semibold block">Escrituras Hoy</span>
              <span className="text-base font-bold font-mono text-[#3ecf8e]">
                {(dbMetrics?.todayRowsWritten || 0).toLocaleString()} <span className="text-xs text-neutral-500">/ 100k</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Explorador de Archivos en R2 */}
      <div className="bg-[#171717] border border-[#262626] rounded-2xl overflow-hidden shadow-sm">
        {/* Header del Explorador */}
        <div className="p-4 sm:px-6 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151515]">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Archivos Almacenados en {data?.selectedBucket || "byfiocr-files"}
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#222] border border-[#333] text-neutral-300">
              {filteredObjects.length} {filteredObjects.length === 1 ? "archivo" : "archivos"}
            </span>
          </div>

          {/* Buscador de archivos */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar archivo por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#1e1e1e] border border-[#2e2e2e] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 w-full sm:w-64"
            />
          </div>
        </div>

        {/* Lista de Archivos */}
        {loading ? (
          <div className="p-12 text-center text-neutral-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-xs font-mono">Cargando archivos desde Cloudflare R2...</span>
          </div>
        ) : filteredObjects.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-neutral-600 opacity-60" />
            <p className="text-xs">No se encontraron archivos en este bucket.</p>
            <p className="text-[11px] text-neutral-600">
              Los archivos subidos por clientes en el módulo DTF aparecerán aquí automáticamente.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#222]">
            {filteredObjects.map((obj) => (
              <div
                key={obj.key}
                className="p-3 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#1a1a1a] transition"
              >
                {/* Info & Thumbnail */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-lg bg-[#202020] border border-[#2e2e2e] flex items-center justify-center shrink-0 overflow-hidden relative cursor-pointer"
                    onClick={() => setPreviewItem(obj)}
                    title="Click para ver en grande"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, #1c1c1c 25%, transparent 25%), linear-gradient(-45deg, #1c1c1c 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1c1c1c 75%), linear-gradient(-45deg, transparent 75%, #1c1c1c 75%)",
                      backgroundSize: "8px 8px"
                    }}
                  >
                    {obj.isImage ? (
                      <img src={obj.publicUrl} alt={obj.name} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <FileText className="w-5 h-5 text-purple-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      onClick={() => setPreviewItem(obj)}
                      className="text-xs font-bold text-white hover:text-purple-300 transition truncate cursor-pointer"
                      title={obj.name}
                    >
                      {obj.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono mt-0.5">
                      <span>{obj.sizeFormatted}</span>
                      <span>•</span>
                      <span className="truncate max-w-[140px]">{obj.contentType}</span>
                      <span>•</span>
                      <span>{new Date(obj.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setPreviewItem(obj)}
                    className="p-2 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#333] transition"
                    title="Previsualizar archivo"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                  </button>

                  <button
                    onClick={() => handleCopyUrl(obj.publicUrl, obj.key)}
                    className="p-2 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white border border-[#333] transition"
                    title="Copiar URL directa del archivo"
                  >
                    {copiedKey === obj.key ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <a
                    href={`${obj.publicUrl}&download=1`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-2xs"
                    title="Descargar archivo en resolución original"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Descargar</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Previsualización de Archivo */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171717] border border-[#2d2d2d] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#262626] bg-[#1a1a1a]">
              <div className="min-w-0 pr-3">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
                  Cloudflare R2 Storage ({previewItem.sizeFormatted})
                </span>
                <h3 className="text-sm font-bold text-white truncate">{previewItem.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${previewItem.publicUrl}&download=1`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </a>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg bg-[#222] hover:bg-[#2a2a2a] text-neutral-300 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="p-6 overflow-auto flex items-center justify-center bg-black/60 min-h-[300px]"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)",
                backgroundSize: "16px 16px"
              }}
            >
              {previewItem.isImage ? (
                <img
                  src={previewItem.publicUrl}
                  alt={previewItem.name}
                  className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-[#2a2a2a]"
                />
              ) : (
                <div className="text-center p-8 bg-[#1a1a1a] rounded-2xl border border-[#262626]">
                  <FileText className="w-12 h-12 text-purple-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-sm mb-1">{previewItem.name}</p>
                  <p className="text-xs text-neutral-400">{previewItem.contentType} • {previewItem.sizeFormatted}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
