import React, { useState } from "react";
import { Terminal, Play, X, AlertCircle, Clock, Database, Layers } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-950 text-cyan-400 rounded-lg">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Consola SQL Interactiva</h3>
              <p className="text-xs text-slate-400 font-mono">Base de Datos: {dbName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Input */}
        <div className="p-4 border-b border-slate-800 space-y-2 bg-slate-950/60">
          <textarea
            rows={4}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            placeholder="Escribe tu consulta SQL aquí..."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500 resize-y"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {meta && (
                <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
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
              className="flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{running ? "Ejecutando..." : "Ejecutar SQL"}</span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {results !== null && (
            <div>
              {results.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Consulta ejecutada con éxito (0 filas retornadas)</p>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-800/80 sticky top-0 border-b border-slate-700">
                    <tr>
                      {Object.keys(results[0]).map((key) => (
                        <th key={key} className="p-2 px-3 text-slate-300 font-semibold font-mono">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {results.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/40 font-mono">
                        {Object.keys(results[0]).map((key) => (
                          <td key={key} className="p-2 px-3 text-slate-200 truncate max-w-xs">
                            {r[key] !== null ? String(r[key]) : "NULL"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
