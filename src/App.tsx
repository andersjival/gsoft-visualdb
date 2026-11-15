import React, { useState, useEffect } from "react";
import { getStoredToken, clearStoredToken, verifyToken } from "./services/auth";
import { useVisualDB } from "./hooks/useVisualDB";
import { mutateRow } from "./services/api";
import { LoginModal } from "./components/LoginModal";
import { Navbar } from "./components/Navbar";
import { ProjectSelector } from "./components/ProjectSelector";
import { TableSidebar } from "./components/TableSidebar";
import { TableView } from "./components/TableView";
import { RowEditModal } from "./components/RowEditModal";
import { RowInsertModal } from "./components/RowInsertModal";
import { SchemaModal } from "./components/SchemaModal";
import { SqlConsoleModal } from "./components/SqlConsoleModal";
import { AiStatusBanner } from "./components/AiStatusBanner";

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<string | null>("Anders Jival");
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [isViewingSchema, setIsViewingSchema] = useState(false);
  const [isViewingSql, setIsViewingSql] = useState(false);

  const db = useVisualDB();
  const isAiDb = db.selectedDb?.name === "byfio-agent-db" || (db.selectedDb?.name.includes("agent") ?? false);

  useEffect(() => {
    const initAuth = async () => {
      const existing = getStoredToken();
      if (existing) {
        const valid = await verifyToken(existing);
        if (valid) {
          setToken(existing);
          db.loadDatabases();
        } else {
          clearStoredToken();
          setToken(null);
        }
      }
      setIsAuthChecking(false);
    };
    initAuth();
  }, []);

  const handleLoginSuccess = (newToken: string, newUser: string) => {
    setToken(newToken);
    setUser(newUser);
    db.loadDatabases();
  };

  const handleSaveEdit = async (record: Record<string, any>, pkCol: string, pkVal: any) => {
    if (!db.selectedDb || !db.selectedTable) return;
    await mutateRow({
      dbId: db.selectedDb.uuid,
      table: db.selectedTable,
      action: "update",
      record,
      pkColumn: pkCol,
      pkValue: pkVal
    });
    await db.loadTableData();
  };

  const handleSaveInsert = async (record: Record<string, any>) => {
    if (!db.selectedDb || !db.selectedTable) return;
    await mutateRow({
      dbId: db.selectedDb.uuid,
      table: db.selectedTable,
      action: "insert",
      record
    });
    await db.loadTableData();
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] text-slate-400">
        <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return <LoginModal onSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar
        selectedDb={db.selectedDb}
        onOpenSql={() => setIsViewingSql(true)}
        onSelectMainDb={db.selectMainDb}
        onSelectAiDb={db.selectAiDb}
        onLogout={() => { clearStoredToken(); setToken(null); }}
        userName={user}
      />

      <ProjectSelector
        databases={db.databases}
        selectedDb={db.selectedDb}
        onSelect={(database) => db.setSelectedDb(database)}
        onRefresh={db.loadDatabases}
        loading={db.loading}
      />

      {isAiDb && (
        <AiStatusBanner
          online={db.aiOnline}
          metrics={db.aiMetrics}
          onRefresh={db.checkAiApi}
        />
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        <TableSidebar
          tables={db.tables}
          selectedTable={db.selectedTable}
          onSelectTable={(tableName) => db.setSelectedTable(tableName)}
          loading={db.loadingTables}
        />

        <TableView
          tableName={db.selectedTable}
          columns={db.columns}
          rows={db.rows}
          totalRows={db.totalRows}
          page={db.page}
          limit={db.limit}
          search={db.search}
          loading={db.loading}
          onPageChange={db.setPage}
          onSearchChange={db.setSearch}
          onRefresh={db.loadTableData}
          onOpenInsert={() => setIsInserting(true)}
          onOpenSchema={() => setIsViewingSchema(true)}
          onEditRow={(row) => setEditingRow(row)}
          onDeleteRow={(row) => {
            const pk = db.columns.find((c) => c.pk === 1) || db.columns[0];
            if (window.confirm(`¿Seguro que deseas eliminar el registro con ${pk.name} = "${row[pk.name]}"?`)) {
              db.deleteRow(pk.name, row[pk.name]);
            }
          }}
        />
      </div>

      {editingRow && db.selectedTable && (
        <RowEditModal
          tableName={db.selectedTable}
          columns={db.columns}
          initialData={editingRow}
          onClose={() => setEditingRow(null)}
          onSave={handleSaveEdit}
        />
      )}

      {isInserting && db.selectedTable && (
        <RowInsertModal
          tableName={db.selectedTable}
          columns={db.columns}
          onClose={() => setIsInserting(false)}
          onSave={handleSaveInsert}
        />
      )}

      {isViewingSchema && db.selectedTable && (
        <SchemaModal
          tableName={db.selectedTable}
          columns={db.columns}
          onClose={() => setIsViewingSchema(false)}
        />
      )}

      {isViewingSql && db.selectedDb && (
        <SqlConsoleModal
          dbId={db.selectedDb.uuid}
          dbName={db.selectedDb.name}
          tableName={db.selectedTable}
          onClose={() => setIsViewingSql(false)}
          onQuerySuccess={db.loadTableData}
        />
      )}
    </div>
  );
};
export default App;
