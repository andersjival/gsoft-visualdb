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
import { JsonViewerModal } from "./components/JsonViewerModal";
import { DbMetricsModal } from "./components/DbMetricsModal";
import { R2StorageView } from "./components/R2StorageView";
import { KvStorageView } from "./components/KvStorageView";
import { AiNeuronsModal } from "./components/AiNeuronsModal";

export const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<string | null>("Anders Jival");
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [mainTab, setMainTab] = useState<"database" | "r2" | "kv">("database");
  const [editingRow, setEditingRow] = useState<Record<string, any> | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [isViewingSchema, setIsViewingSchema] = useState(false);
  const [isViewingSql, setIsViewingSql] = useState(false);
  const [isViewingMetrics, setIsViewingMetrics] = useState(false);
  const [isViewingNeurons, setIsViewingNeurons] = useState(false);
  const [jsonModal, setJsonModal] = useState<{ title: string; data: string } | null>(null);

  const db = useVisualDB();
  const isAiDb = db.selectedDb?.name === "byfio-agent-db" || (db.selectedDb?.name.includes("agent") ?? false);

  useEffect(() => {
    (async () => {
      const existing = getStoredToken();
      if (existing && (await verifyToken(existing))) {
        setToken(existing);
        db.loadDatabases();
      } else { clearStoredToken(); setToken(null); }
      setIsAuthChecking(false);
    })();
  }, []);

  const switchTableCleanly = (tableName: string) => {
    db.setSearch(""); db.setPage(1); db.setSelectedTable(tableName);
  };

  const mutateAndReload = async (action: "insert" | "update", record: any, pkCol?: string, pkVal?: any) => {
    if (!db.selectedDb || !db.selectedTable) return;
    await mutateRow({ dbId: db.selectedDb.uuid, table: db.selectedTable, action, record, pkColumn: pkCol, pkValue: pkVal });
    await db.loadTableData();
  };

  const handleCellSave = async (row: Record<string, any>, col: string, val: any) => {
    const pk = db.columns.find((c) => c.pk === 1) || db.columns[0];
    await mutateAndReload("update", { [col]: val }, pk.name, row[pk.name]);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-neutral-400">
        <div className="w-6 h-6 border-2 border-[#3ecf8e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) return <LoginModal onSuccess={(t, u) => { setToken(t); setUser(u); db.loadDatabases(); }} />;

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-neutral-100 font-sans">
      <Navbar
        selectedDb={db.selectedDb}
        account={db.account}
        onSwitchAccount={db.switchAccount}
        onOpenSql={() => setIsViewingSql(true)}
        onSelectMainDb={() => { setMainTab("database"); db.selectMainDb(); }}
        onSelectAiDb={() => { setMainTab("database"); db.selectAiDb(); }}
        onOpenNeuronsHistory={() => { setIsViewingNeurons(true); db.checkAiApi(); }}
        activeTab={mainTab}
        onSelectR2={() => setMainTab("r2")}
        onSelectKv={() => setMainTab("kv")}
        onLogout={() => { clearStoredToken(); setToken(null); }}
        userName={user}
      />

      {mainTab === "r2" ? (
        <R2StorageView
          account={db.account}
          onSwitchAccount={db.switchAccount}
          dbMetrics={db.metrics}
          selectedDbName={db.selectedDb?.name}
          onOpenDbMetrics={() => setIsViewingMetrics(true)}
        />
      ) : mainTab === "kv" ? (
        <KvStorageView
          account={db.account}
          onSwitchAccount={db.switchAccount}
        />
      ) : (
        <>
          <ProjectSelector
            databases={db.databases}
            selectedDb={db.selectedDb}
            metrics={db.metrics}
            loadingMetrics={db.loadingMetrics}
            onSelect={(d) => db.setSelectedDb(d)}
            onRefresh={() => { db.loadDatabases(); if (db.selectedDb) db.loadMetrics(db.selectedDb.uuid); }}
            onOpenMetrics={() => setIsViewingMetrics(true)}
            loading={db.loading}
          />
          {isAiDb && (
            <AiStatusBanner
              online={db.aiOnline}
              metrics={db.aiMetrics}
              onRefresh={db.checkAiApi}
              onOpenNeuronsHistory={() => { setIsViewingNeurons(true); db.checkAiApi(); }}
            />
          )}

          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            <TableSidebar
              tables={db.tables}
              selectedTable={db.selectedTable}
              onSelectTable={(t) => switchTableCleanly(t)}
              onOpenUsersDirectly={(db.selectedDb?.name === "byfiocr-v2-db" || db.selectedDb?.name === "byfiocr-db") ? () => switchTableCleanly("registered_users") : undefined}
              onOpenVentasDirectly={(db.selectedDb?.name === "byfiocr-v2-db" || db.selectedDb?.name === "byfiocr-db") ? () => switchTableCleanly("orders") : undefined}
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
          error={db.error}
          onClearError={() => db.setError(null)}
          onPageChange={db.setPage}
          onSearchChange={db.setSearch}
          onRefresh={db.loadTableData}
          onOpenInsert={() => setIsInserting(true)}
          onOpenSchema={() => setIsViewingSchema(true)}
          onEditRow={(row) => setEditingRow(row)}
          onDeleteRow={async (row) => {
            const pk = db.columns.find((c) => c.pk === 1) || db.columns[0];
            if (window.confirm(`¿Eliminar registro con ${pk.name} = "${row[pk.name]}"?`)) {
              try {
                await db.deleteRow(pk.name, row[pk.name]);
              } catch (err: any) {
                alert(`Error al eliminar: ${err.message}`);
              }
            }
          }}
          onInspectJson={(title, data) => setJsonModal({ title, data })}
          onCellSave={handleCellSave}
          onFilterByUser={(userId) => { db.setSelectedTable("orders"); db.setSearch(userId); db.setPage(1); }}
        />
      </div>
      </>
      )}

      {isViewingMetrics && (
        <DbMetricsModal
          metrics={db.metrics}
          loading={db.loadingMetrics}
          onRefresh={() => { if (db.selectedDb) db.loadMetrics(db.selectedDb.uuid); }}
          onClose={() => setIsViewingMetrics(false)}
        />
      )}
      {isViewingNeurons && (
        <AiNeuronsModal
          metrics={db.aiMetrics}
          daily={db.aiDaily}
          logs={db.aiNeuronLogs}
          loading={false}
          onRefresh={db.checkAiApi}
          onClose={() => setIsViewingNeurons(false)}
        />
      )}
      {jsonModal && <JsonViewerModal title={jsonModal.title} jsonData={jsonModal.data} onClose={() => setJsonModal(null)} />}
      {editingRow && db.selectedTable && (
        <RowEditModal tableName={db.selectedTable} columns={db.columns} initialData={editingRow} onClose={() => setEditingRow(null)} onSave={(rec, col, val) => mutateAndReload("update", rec, col, val)} />
      )}
      {isInserting && db.selectedTable && (
        <RowInsertModal tableName={db.selectedTable} columns={db.columns} onClose={() => setIsInserting(false)} onSave={(rec) => mutateAndReload("insert", rec)} />
      )}
      {isViewingSchema && db.selectedTable && <SchemaModal tableName={db.selectedTable} columns={db.columns} onClose={() => setIsViewingSchema(false)} />}
      {isViewingSql && db.selectedDb && (
        <SqlConsoleModal dbId={db.selectedDb.uuid} dbName={db.selectedDb.name} tableName={db.selectedTable} onClose={() => setIsViewingSql(false)} onQuerySuccess={db.loadTableData} />
      )}
    </div>
  );
};
export default App;
