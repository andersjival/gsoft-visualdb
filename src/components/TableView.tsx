import React from "react";
import { TableColumn } from "../types";
import { TableDataGrid } from "./TableDataGrid";
import { Plus, Search, Code2, ChevronLeft, ChevronRight, Loader2, RefreshCw, Table as TableIcon } from "lucide-react";

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
  onInspectJson: (title: string, data: string) => void;
  onCellSave?: (row: Record<string, any>, colName: string, newVal: any) => Promise<void>;
}

export const TableView: React.FC<TableViewProps> = ({
  tableName, columns, rows, totalRows, page, limit, search, loading,
  onPageChange, onSearchChange, onRefresh, onOpenInsert, onOpenSchema,
  onEditRow, onDeleteRow, onInspectJson, onCellSave
}) => {
  const totalPages = Math.ceil(totalRows / limit) || 1;

  if (!tableName) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500 bg-[#121212]">
        <TableIcon className="w-10 h-10 mb-2 text-neutral-600" />
        <p className="text-sm">Selecciona una tabla en el menú lateral para explorar y editar registros</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden border-t sm:border-t-0 sm:border-l border-[#262626]">
      {/* Top Controls Bar */}
      <div className="p-3 sm:px-4 border-b border-[#262626] flex flex-wrap items-center justify-between gap-3 bg-[#171717]">
        <div className="flex items-center gap-2.5">
          <TableIcon className="w-4 h-4 text-[#3ecf8e]" />
          <h3 className="font-semibold text-white text-sm font-mono flex items-center gap-2">
            <span>{tableName}</span>
            <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#262626] text-neutral-400 font-normal">
              {totalRows} filas
            </span>
          </h3>

          <button
            onClick={onOpenSchema}
            className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 rounded-lg border border-[#333] transition"
          >
            <Code2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Esquema</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar en tabla..."
              className="pl-8 pr-3 py-1.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#3ecf8e] w-36 sm:w-48"
            />
          </div>
          <button
            onClick={onRefresh}
            title="Refrescar datos"
            className="p-1.5 bg-[#222] hover:bg-[#2c2c2c] text-neutral-300 rounded-lg border border-[#333] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
          </button>
          <button
            onClick={onOpenInsert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg text-xs shadow transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Insertar Fila</span>
          </button>
        </div>
      </div>

      {/* Grid Table */}
      <div className="flex-1 overflow-auto scrollbar-thin bg-[#121212]">
        {loading && rows.length === 0 ? (
          <div className="flex items-center justify-center p-12 text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#3ecf8e]" />
            <span className="text-sm">Cargando datos...</span>
          </div>
        ) : (
          <TableDataGrid
            columns={columns}
            rows={rows}
            onEditRow={onEditRow}
            onDeleteRow={onDeleteRow}
            onInspectJson={onInspectJson}
            onCellSave={onCellSave}
          />
        )}
      </div>

      {/* Pagination Bar */}
      <div className="p-2.5 px-4 border-t border-[#262626] bg-[#171717] flex items-center justify-between text-xs text-neutral-400 font-mono">
        <div>
          Página <span className="text-white font-semibold">{page}</span> de <span className="text-white font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded bg-[#222] hover:bg-[#2c2c2c] disabled:opacity-30 text-neutral-300 border border-[#333] transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded bg-[#222] hover:bg-[#2c2c2c] disabled:opacity-30 text-neutral-300 border border-[#333] transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
