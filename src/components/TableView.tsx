import React from "react";
import { TableColumn } from "../types";
import { Plus, Search, Edit3, Trash2, Code2, ChevronLeft, ChevronRight, Loader2, RefreshCw } from "lucide-react";

interface TableViewProps {
  tableName: string | null;
  columns: TableColumn[];
  rows: Record<string, any>[];
  totalRows: number;
  page: number;
  limit: number;
  search: string;
  loading: boolean;
  onPageChange: (newPage: number) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onOpenInsert: () => void;
  onOpenSchema: () => void;
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tableName,
  columns,
  rows,
  totalRows,
  page,
  limit,
  search,
  loading,
  onPageChange,
  onSearchChange,
  onRefresh,
  onOpenInsert,
  onOpenSchema,
  onEditRow,
  onDeleteRow
}) => {
  const totalPages = Math.ceil(totalRows / limit) || 1;

  if (!tableName) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-500">
        <p className="text-sm">Selecciona una tabla para visualizar y modificar sus datos</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-950/40 overflow-hidden">
      {/* Controls Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-white text-base font-mono flex items-center gap-2">
            <span>{tableName}</span>
            <span className="text-xs text-slate-400 font-sans font-normal">
              ({totalRows} {totalRows === 1 ? "registro" : "registros"})
            </span>
          </h3>
          <button
            onClick={onOpenSchema}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Esquema</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Filtrar registros..."
              className="pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-36 sm:w-48"
            />
          </div>
          <button
            onClick={onRefresh}
            title="Refrescar datos"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
          <button
            onClick={onOpenInsert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* Table Data */}
      <div className="flex-1 overflow-auto scrollbar-thin">
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-sm">Cargando registros...</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900/90 sticky top-0 border-b border-slate-800 z-10">
              <tr>
                <th className="p-2.5 px-3 text-slate-400 font-semibold w-20 text-center">Acciones</th>
                {columns.map((c) => (
                  <th key={c.cid} className="p-2.5 px-3 text-slate-300 font-semibold font-mono whitespace-nowrap">
                    {c.name}
                    {c.pk === 1 && <span className="ml-1 text-[10px] text-amber-400">🔑</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="p-8 text-center text-slate-500">
                    No se encontraron registros
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition group">
                    <td className="p-2 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditRow(row)}
                          title="Editar registro"
                          className="p-1 hover:bg-cyan-950 text-slate-400 hover:text-cyan-400 rounded transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteRow(row)}
                          title="Eliminar registro"
                          className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    {columns.map((c) => {
                      const val = row[c.name];
                      const displayVal = val === null ? "NULL" : typeof val === "object" ? JSON.stringify(val) : String(val);
                      return (
                        <td
                          key={c.cid}
                          className={`p-2 px-3 max-w-xs truncate font-mono ${val === null ? "text-slate-600 italic" : "text-slate-200"}`}
                          title={displayVal}
                        >
                          {displayVal}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex items-center justify-between text-xs text-slate-400">
        <div>
          Página <span className="text-slate-200 font-semibold">{page}</span> de{" "}
          <span className="text-slate-200 font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
