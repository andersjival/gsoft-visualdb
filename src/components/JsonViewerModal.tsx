import React, { useState } from "react";
import { X, Copy, Check, Table, Code, Search, Braces } from "lucide-react";

interface JsonViewerModalProps {
  title: string;
  jsonData: string;
  onClose: () => void;
}

export const JsonViewerModal: React.FC<JsonViewerModalProps> = ({ title, jsonData, onClose }) => {
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState("");

  let parsed: any = null;
  let isArrayOfObjects = false;
  try {
    parsed = JSON.parse(jsonData);
    isArrayOfObjects = Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object";
  } catch {
    parsed = jsonData;
  }

  const columns = isArrayOfObjects ? Object.keys(parsed[0]) : [];
  const filteredData = isArrayOfObjects
    ? parsed.filter((item: any) =>
        JSON.stringify(item).toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const handleCopy = () => {
    navigator.clipboard.writeText(typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : String(parsed));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-[#171717] border border-[#2e2e2e] rounded-xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="p-3.5 px-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Braces className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2 font-mono">
                {title}
                {isArrayOfObjects && (
                  <span className="text-[11px] font-sans font-normal px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                    {parsed.length} registros estructurados
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isArrayOfObjects && (
              <div className="flex items-center bg-[#262626] rounded-lg p-0.5 border border-[#333]">
                <button
                  onClick={() => setViewMode("table")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                    viewMode === "table" ? "bg-[#3ecf8e] text-black font-semibold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Table className="w-3.5 h-3.5" /> Tabla
                </button>
                <button
                  onClick={() => setViewMode("raw")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
                    viewMode === "raw" ? "bg-[#3ecf8e] text-black font-semibold" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Code className="w-3.5 h-3.5" /> JSON
                </button>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#262626] hover:bg-[#333] text-neutral-300 rounded-lg border border-[#333] transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>
            <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {isArrayOfObjects && viewMode === "table" && (
          <div className="p-2.5 px-5 border-b border-[#262626] bg-[#141414] flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por nombre, correo, teléfono..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#3ecf8e]"
              />
            </div>
            <span className="text-xs text-neutral-500 font-mono">
              Mostrando {filteredData.length} de {parsed.length}
            </span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 bg-[#141414] scrollbar-thin">
          {viewMode === "table" && isArrayOfObjects ? (
            <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#1f1f1f] border-b border-[#2a2a2a] sticky top-0">
                  <tr>
                    <th className="p-2.5 px-3 text-neutral-400 font-mono font-medium w-10">#</th>
                    {columns.map((col) => (
                      <th key={col} className="p-2.5 px-3 text-neutral-300 font-mono font-medium whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#242424]">
                  {filteredData.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-[#1a1a1a] font-mono transition">
                      <td className="p-2.5 px-3 text-neutral-500 text-[11px]">{i + 1}</td>
                      {columns.map((col) => {
                        const val = row[col];
                        const display = val === null ? "NULL" : typeof val === "object" ? JSON.stringify(val) : String(val);
                        return (
                          <td key={col} className="p-2.5 px-3 text-neutral-200 truncate max-w-xs" title={display}>
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="p-4 bg-[#171717] rounded-lg border border-[#2a2a2a] font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
              {typeof parsed === "object" ? JSON.stringify(parsed, null, 2) : String(parsed)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
};
