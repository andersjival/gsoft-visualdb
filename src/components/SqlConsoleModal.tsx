import React, { useState } from "react";
import { Terminal, Play, X, AlertCircle, Clock } from "lucide-react";
import { executeSqlQuery } from "../services/api";
import { QueryResultMeta } from "../types";

interface SqlConsoleModalProps {
  dbId: string;
  dbName: string;
  tableName: string | null;
  onClose: () => void;
  onQuerySuccess: () => void;
}

export const SqlConsoleModal: React.FC<SqlConsoleModalProps> = ({
  dbId,
  dbName,
  tableName,
  onClose,
  onQuerySuccess
}) => {
  const defaultSql = tableName
    ? `SELECT * FROM "${tableName}" LIMIT 25;`
    : `SELECT name FROM sqlite_master WHERE type='table';`;
  const [sql, setSql] = useState(defaultSql);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Record<string, any>[] | null>(null);
  const [meta, setMeta] = useState<QueryResultMeta | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    if (!sql.trim()) return;
    setRunning(true);
    setError(null);
    try {
      const res = await executeSqlQuery(dbId, sql.trim());
      setResults(res.results || []);
      setMeta(res.meta || null);
      onQuerySuccess();
    } catch (err: any) {
      setError(err.message || "Error al ejecutar consulta SQL");
      setResults(null);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-[#171717] border border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#262626] text-neutral-300 rounded-lg">
              <Terminal className="w-4 h-4 text-[#3ecf8e]" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Consola SQL Interactiva</h3>
              <p className="text-xs text-neutral-400 font-mono">Base de Datos: {dbName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-4 border-b border-[#262626] space-y-2 bg-[#141414]">
          <textarea
            rows={4}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Escribe tu consulta SQL aquí..."
            className="w-full px-3 py-2 bg-[#1c1c1c] border border-[#2e2e2e] rounded-xl text-xs font-mono text-emerald-300 focus:outline-none focus:border-[#3ecf8e] resize-y"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              {meta && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1 text-[#3ecf8e]">
                    <Clock className="w-3 h-3" /> {meta.duration ? meta.duration.toFixed(2) : "0"} ms
                  </span>
                  <span>Lecturas: {meta.rows_read ?? 0}</span>
                  <span>Escrituras: {meta.rows_written ?? 0}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#3ecf8e] hover:bg-[#34b27b] text-black rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{running ? "Ejecutando..." : "Ejecutar SQL"}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-auto p-4 bg-[#141414] scrollbar-thin">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {results !== null && (
            <div>
              {results.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">Consulta ejecutada con éxito (0 filas)</p>
              ) : (
                <div className="border border-[#2e2e2e] rounded-lg overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#1f1f1f] sticky top-0 border-b border-[#2e2e2e]">
                      <tr>
                        {Object.keys(results[0]).map((key) => (
                          <th key={key} className="p-2 px-3 text-neutral-300 font-semibold font-mono">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#262626]">
                      {results.map((r, i) => (
                        <tr key={i} className="hover:bg-[#1a1a1a] font-mono">
                          {Object.keys(results[0]).map((key) => (
                            <td key={key} className="p-2 px-3 text-neutral-200 truncate max-w-xs">
                              {r[key] !== null ? String(r[key]) : "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
