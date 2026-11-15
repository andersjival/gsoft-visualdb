import React from "react";
import { TableColumn } from "../types";
import { X, Key, ShieldCheck, Check, Minus } from "lucide-react";

interface SchemaModalProps {
  tableName: string;
  columns: TableColumn[];
  onClose: () => void;
}

export const SchemaModal: React.FC<SchemaModalProps> = ({
  tableName,
  columns,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Esquema de Columnas</h3>
            <p className="text-xs text-slate-400 font-mono">Tabla: {tableName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-800/80 sticky top-0 border-b border-slate-700">
              <tr>
                <th className="p-2.5 px-3 text-slate-400 font-semibold">#</th>
                <th className="p-2.5 px-3 text-slate-300 font-semibold">Nombre</th>
                <th className="p-2.5 px-3 text-slate-300 font-semibold">Tipo</th>
                <th className="p-2.5 px-3 text-slate-300 font-semibold">Clave Primaria</th>
                <th className="p-2.5 px-3 text-slate-300 font-semibold">NOT NULL</th>
                <th className="p-2.5 px-3 text-slate-300 font-semibold">Default</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {columns.map((col) => (
                <tr key={col.cid} className="hover:bg-slate-800/40 font-mono">
                  <td className="p-2.5 px-3 text-slate-500">{col.cid}</td>
                  <td className="p-2.5 px-3 font-semibold text-cyan-300">{col.name}</td>
                  <td className="p-2.5 px-3 text-emerald-400">{col.type || "ANY"}</td>
                  <td className="p-2.5 px-3">
                    {col.pk === 1 ? (
                      <span className="flex items-center gap-1 text-amber-400 font-sans font-medium text-[11px]">
                        <Key className="w-3 h-3" /> PK
                      </span>
                    ) : (
                      <Minus className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </td>
                  <td className="p-2.5 px-3">
                    {col.notnull === 1 ? (
                      <span className="text-rose-400 font-sans text-[11px] font-medium">Sí</span>
                    ) : (
                      <span className="text-slate-500 font-sans text-[11px]">No</span>
                    )}
                  </td>
                  <td className="p-2.5 px-3 text-slate-400 truncate max-w-xs">
                    {col.dflt_value !== null ? String(col.dflt_value) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
