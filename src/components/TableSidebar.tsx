import React, { useState } from "react";
import { Table, Search, Layers, Loader2 } from "lucide-react";
import { TableSummary } from "../types";

interface TableSidebarProps {
  tables: TableSummary[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  loading: boolean;
}

export const TableSidebar: React.FC<TableSidebarProps> = ({
  tables,
  selectedTable,
  onSelectTable,
  loading
}) => {
  const [filter, setFilter] = useState("");

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-64 bg-slate-900/60 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tablas ({tables.length})</span>
          </div>
          {loading && <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar tabla..."
            className="w-full pl-8 pr-2 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto max-h-48 lg:max-h-[calc(100vh-180px)] p-2 space-y-1 scrollbar-thin">
        {filteredTables.length === 0 ? (
          <p className="text-center text-xs text-slate-500 py-6">
            {loading ? "Cargando tablas..." : "No hay tablas"}
          </p>
        ) : (
          filteredTables.map((table) => {
            const isSelected = selectedTable === table.name;
            return (
              <button
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                  <span className="truncate">{table.name}</span>
                </div>
                {table.rowCount !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono flex-shrink-0 ${
                    isSelected ? "bg-cyan-950 text-cyan-400" : "bg-slate-800 text-slate-500"
                  }`}>
                    {table.rowCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};
