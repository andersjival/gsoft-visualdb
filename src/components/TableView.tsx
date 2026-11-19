import React, { useRef, useEffect } from "react";
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
  error?: string | null;
  onClearError?: () => void;
  onPageChange: (newPage: number) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onOpenInsert: () => void;
  onOpenSchema: () => void;
  onEditRow: (row: Record<string, any>) => void;
  onDeleteRow: (row: Record<string, any>) => void;
  onInspectJson: (title: string, data: string) => void;
  onCellSave?: (row: Record<string, any>, colName: string, newVal: any) => Promise<void>;
  onFilterByUser?: (userId: string) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tableName, columns, rows, totalRows, page, limit, search, loading, error, onClearError,
  onPageChange, onSearchChange, onRefresh, onOpenInsert, onOpenSchema,
  onEditRow, onDeleteRow, onInspectJson, onCellSave, onFilterByUser
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(totalRows / limit) || 1;
  const isVentas = tableName === "orders" || tableName === "ventas";
  const ventasTotal = isVentas ? rows.reduce((acc, r) => acc + (Number(r.total) || 0), 0) : 0;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, left: 0 });
  }, [tableName]);

  if (!tableName) {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden border-t sm:border-t-0 sm:border-l border-[#262626]">
        {error && (
          <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between gap-2 z-20">
            <span className="font-mono truncate">{error}</span>
            {onClearError && (
              <button onClick={onClearError} className="text-rose-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/50 flex-shrink-0">
                Descartar
              </button>
            )}
          </div>
        )}
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-500">
          <TableIcon className="w-10 h-10 mb-2 text-neutral-600" />
          <p className="text-sm">Selecciona una tabla en el menú lateral</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#121212] overflow-hidden border-t sm:border-t-0 sm:border-l border-[#262626]">
      {/* Top Header - Altura Fija Absoluta para Prevenir Saltos */}
      {error && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-200 px-4 py-2 text-xs flex items-center justify-between gap-2 z-20">
          <span className="font-mono truncate">{error}</span>
          {onClearError && (
            <button onClick={onClearError} className="text-rose-300 hover:text-white text-xs font-semibold px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/50 flex-shrink-0">
              Descartar
            </button>
          )}
        </div>
      )}
      <div className="h-14 min-h-[56px] max-h-[56px] px-4 border-b border-[#262626] flex items-center justify-between gap-3 bg-[#171717] overflow-hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <TableIcon className="w-4 h-4 text-[#3ecf8e] flex-shrink-0" />
          <h3 className="font-semibold text-white text-sm font-mono truncate flex items-center gap-2">
            <span>{tableName}</span>
            <span className="text-[11px] font-sans px-2 py-0.5 rounded-full bg-[#242424] text-neutral-400 font-normal">
              {totalRows} filas
            </span>
          </h3>

          {isVentas && (
            <span className="hidden md:inline-flex text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 whitespace-nowrap">
              Total: ₡{ventasTotal.toLocaleString("es-CR")}
            </span>
          )}

          <button
            onClick={onOpenSchema}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs bg-[#222] hover:bg-[#282828] text-neutral-300 rounded-lg border border-[#333] transition flex-shrink-0"
          >
            <Code2 className="w-3.5 h-3.5 text-neutral-400" />
            <span>Esquema</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-3 py-1.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#3ecf8e] w-36 sm:w-48"
            />
          </div>
          <button
            onClick={onRefresh}
            title="Refrescar datos"
            className="p-1.5 bg-[#222] hover:bg-[#282828] text-neutral-300 rounded-lg border border-[#333] transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#3ecf8e]" : ""}`} />
          </button>
          <button
            onClick={onOpenInsert}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3ecf8e] hover:bg-[#34b27b] text-black font-semibold rounded-lg text-xs shadow transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Insertar Fila</span>
          </button>
        </div>
      </div>

      {/* Grid Container con Posición Fija y Barra de Carga Superior Sin Saltos */}
      <div ref={scrollRef} className="flex-1 overflow-auto scrollbar-thin bg-[#121212] relative">
        {loading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#3ecf8e] animate-pulse z-20" />
        )}

        <TableDataGrid
          columns={columns}
          rows={rows}
          tableName={tableName}
          onEditRow={onEditRow}
          onDeleteRow={onDeleteRow}
          onInspectJson={onInspectJson}
          onCellSave={onCellSave}
          onFilterByUser={onFilterByUser}
        />

        {loading && rows.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121212]/80 z-10 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[#3ecf8e]" />
            <span className="text-xs text-neutral-400 font-mono">Cargando datos...</span>
          </div>
        )}
      </div>

      {/* Pagination Bar - Altura Fija */}
      <div className="h-10 min-h-[40px] max-h-[40px] px-4 border-t border-[#262626] bg-[#171717] flex items-center justify-between text-xs text-neutral-400 font-mono">
        <div>
          Página <span className="text-white font-semibold">{page}</span> de <span className="text-white font-semibold">{totalPages}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1 rounded bg-[#222] hover:bg-[#282828] disabled:opacity-30 text-neutral-300 border border-[#333] transition"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded bg-[#222] hover:bg-[#282828] disabled:opacity-30 text-neutral-300 border border-[#333] transition"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
