import React from "react";
import { TableColumn } from "../types";
import { Edit3, Trash2, Braces, Key } from "lucide-react";

interface TableDataGridProps {
  columns: TableColumn[];
  rows: Record<string, any>[];
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
  onInspectJson: (title: string, data: string) => void;
}

export const TableDataGrid: React.FC<TableDataGridProps> = ({
  columns,
  rows,
  onEditRow,
  onDeleteRow,
  onInspectJson
}) => {
  const isJsonString = (str: any): boolean => {
    if (typeof str !== "string") return false;
    const t = str.trim();
    return (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
  };

  const getColTypeBadge = (col: TableColumn) => {
    if (col.pk === 1) return <span className="text-[10px] text-amber-400 font-sans flex items-center gap-0.5"><Key className="w-2.5 h-2.5" /> pk</span>;
    const type = (col.type || "text").toLowerCase();
    if (type.includes("int") || type.includes("num") || type.includes("real")) {
      return <span className="text-[10px] text-emerald-400 font-mono">int</span>;
    }
    return <span className="text-[10px] text-sky-400 font-mono">text</span>;
  };

  return (
    <table className="w-full text-left border-collapse text-xs select-text">
      <thead className="bg-[#1c1c1c] sticky top-0 border-b border-[#2e2e2e] z-10 shadow-sm">
        <tr>
          <th className="p-2.5 px-3 text-neutral-500 font-mono font-medium w-12 text-center border-r border-[#2a2a2a]">#</th>
          <th className="p-2.5 px-3 text-neutral-400 font-medium w-20 text-center border-r border-[#2a2a2a]">Acciones</th>
          {columns.map((c) => (
            <th key={c.cid} className="p-2.5 px-3.5 text-neutral-300 font-mono font-medium whitespace-nowrap border-r border-[#2a2a2a]/60">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">{c.name}</span>
                {getColTypeBadge(c)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#262626]">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length + 2} className="p-12 text-center text-neutral-500">
              No se encontraron registros
            </td>
          </tr>
        ) : (
          rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-[#1f1f1f] transition group">
              <td className="p-2 px-3 text-center text-neutral-500 font-mono text-[11px] border-r border-[#262626]">
                {idx + 1}
              </td>
              <td className="p-2 px-3 text-center whitespace-nowrap border-r border-[#262626]">
                <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition">
                  <button
                    onClick={() => onEditRow(row)}
                    title="Editar fila"
                    className="p-1 text-neutral-400 hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10 rounded transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteRow(row)}
                    title="Eliminar fila"
                    className="p-1 text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
              {columns.map((c) => {
                const val = row[c.name];
                const isJson = isJsonString(val);
                return (
                  <td
                    key={c.cid}
                    className="p-2 px-3.5 max-w-xs truncate font-mono text-neutral-200 border-r border-[#262626]/50"
                  >
                    {val === null ? (
                      <span className="text-neutral-500 italic text-[11px] bg-[#222] px-1.5 py-0.5 rounded">null</span>
                    ) : isJson ? (
                      <button
                        onClick={() => onInspectJson(`${c.name} (Fila #${idx + 1})`, String(val))}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 text-[11px] font-mono transition"
                        title="Clic para ver en tabla estructurada tipo Supabase"
                      >
                        <Braces className="w-3 h-3 text-emerald-400" />
                        <span>Ver JSON Estructurado</span>
                      </button>
                    ) : (
                      <span title={String(val)}>{String(val)}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};
