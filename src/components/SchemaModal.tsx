import React from "react";
import { TableColumn } from "../types";
import { X, Key, Minus } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#171717] border border-[#2e2e2e] rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#262626] flex items-center justify-between bg-[#1f1f1f]">
          <div>
            <h3 className="font-bold text-white text-base">Esquema de Columnas</h3>
            <p className="text-xs text-neutral-400 font-mono">Tabla: {tableName}</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#141414] scrollbar-thin">
          <div className="border border-[#2e2e2e] rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#1f1f1f] sticky top-0 border-b border-[#2e2e2e]">
                <tr>
                  <th className="p-2.5 px-3 text-neutral-400 font-semibold">#</th>
                  <th className="p-2.5 px-3 text-neutral-300 font-semibold">Nombre</th>
                  <th className="p-2.5 px-3 text-neutral-300 font-semibold">Tipo</th>
                  <th className="p-2.5 px-3 text-neutral-300 font-semibold">Clave Primaria</th>
                  <th className="p-2.5 px-3 text-neutral-300 font-semibold">NOT NULL</th>
                  <th className="p-2.5 px-3 text-neutral-300 font-semibold">Default</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {columns.map((col) => (
                  <tr key={col.cid} className="hover:bg-[#1a1a1a] font-mono">
                    <td className="p-2.5 px-3 text-neutral-500">{col.cid}</td>
                    <td className="p-2.5 px-3 font-semibold text-neutral-100">{col.name}</td>
                    <td className="p-2.5 px-3 text-[#3ecf8e]">{col.type || "ANY"}</td>
                    <td className="p-2.5 px-3">
                      {col.pk === 1 ? (
                        <span className="flex items-center gap-1 text-amber-400 font-sans font-medium text-[11px]">
                          <Key className="w-3 h-3" /> PK
                        </span>
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-neutral-600" />
                      )}
                    </td>
                    <td className="p-2.5 px-3">
                      {col.notnull === 1 ? (
                        <span className="text-rose-400 font-sans text-[11px] font-medium">Sí</span>
                      ) : (
                        <span className="text-neutral-500 font-sans text-[11px]">No</span>
                      )}
                    </td>
                    <td className="p-2.5 px-3 text-neutral-400 truncate max-w-xs">
                      {col.dflt_value !== null ? String(col.dflt_value) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
