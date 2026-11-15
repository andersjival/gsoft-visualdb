import React, { useState } from "react";
import { Table, Search, Layers, Loader2, Users, ShoppingCart } from "lucide-react";
import { TableSummary } from "../types";

interface TableSidebarProps {
  tables: TableSummary[];
  selectedTable: string | null;
  onSelectTable: (tableName: string) => void;
  onOpenUsersDirectly?: () => void;
  onOpenVentasDirectly?: () => void;
  loading: boolean;
}

export const TableSidebar: React.FC<TableSidebarProps> = ({
  tables,
  selectedTable,
  onSelectTable,
  onOpenUsersDirectly,
  onOpenVentasDirectly,
  loading
}) => {
  const [filter, setFilter] = useState("");

  const filteredTables = tables.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <aside className="w-full lg:w-64 bg-[#171717] border-b lg:border-b-0 lg:border-r border-[#262626] flex flex-col flex-shrink-0">
      <div className="p-3 border-b border-[#262626]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-300">
            <Layers className="w-3.5 h-3.5 text-[#3ecf8e]" />
            <span>Tablas ({tables.length})</span>
          </div>
          {loading && <Loader2 className="w-3 h-3 text-[#3ecf8e] animate-spin" />}
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Buscar tabla..."
            className="w-full pl-8 pr-2 py-1.5 bg-[#1f1f1f] border border-[#333] rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-[#3ecf8e]"
          />
        </div>
      </div>

      {/* Accesos Rápidos */}
      {(onOpenUsersDirectly || onOpenVentasDirectly) && (
        <div className="p-2 border-b border-[#262626] bg-[#141414] space-y-1">
          {onOpenUsersDirectly && (
            <button
              onClick={onOpenUsersDirectly}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTable === "registered_users"
                  ? "bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/50"
                  : "bg-[#1c1c1c] hover:bg-[#222] text-neutral-300 border border-[#262626]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-[#3ecf8e]" />
                <span>Usuarios Registrados</span>
              </div>
              <span className="text-[10px] bg-[#292929] px-1.5 py-0.2 rounded font-mono text-neutral-400">
                Clientes
              </span>
            </button>
          )}

          {onOpenVentasDirectly && (
            <button
              onClick={onOpenVentasDirectly}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedTable === "ventas"
                  ? "bg-[#3ecf8e]/20 text-[#3ecf8e] border border-[#3ecf8e]/50"
                  : "bg-[#1c1c1c] hover:bg-[#222] text-neutral-300 border border-[#262626]"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ventas por Usuario</span>
              </div>
              <span className="text-[10px] bg-[#292929] px-1.5 py-0.2 rounded font-mono text-neutral-400">
                user_id
              </span>
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto max-h-48 lg:max-h-[calc(100vh-230px)] p-2 space-y-0.5 scrollbar-thin">
        {filteredTables.length === 0 ? (
          <p className="text-center text-xs text-neutral-500 py-6">
            {loading ? "Cargando tablas..." : "No hay tablas"}
          </p>
        ) : (
          filteredTables.map((table) => {
            const isSelected = selectedTable === table.name;
            return (
              <button
                key={table.name}
                onClick={() => onSelectTable(table.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono transition text-left ${
                  isSelected
                    ? "bg-[#282828] text-white font-medium border border-[#3ecf8e]/50 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-[#1f1f1f] border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Table className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#3ecf8e]" : "text-neutral-500"}`} />
                  <span className="truncate">{table.name}</span>
                </div>
                {table.rowCount !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono flex-shrink-0 ${
                    isSelected ? "bg-[#3ecf8e]/20 text-[#3ecf8e]" : "bg-[#222] text-neutral-500"
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
