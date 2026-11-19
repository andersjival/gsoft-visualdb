import { useState, useEffect, useCallback } from "react";
import { D1Database, TableSummary, TableColumn, AiApiMetrics, DbPlanMetrics, AccountKey, DailyNeuronItem, NeuronLogItem } from "../types";
import { fetchDatabases, fetchTables, fetchTableData, mutateRow, fetchAiStatus, fetchDbMetrics, getActiveAccount, setActiveAccount } from "../services/api";

export function useVisualDB() {
  const [account, setAccount] = useState<AccountKey>(getActiveAccount());
  const [databases, setDatabases] = useState<D1Database[]>([]);
  const [selectedDb, setSelectedDb] = useState<D1Database | null>(null);
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [columns, setColumns] = useState<TableColumn[]>([]);
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [loading, setLoading] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiOnline, setAiOnline] = useState(false);
  const [aiMetrics, setAiMetrics] = useState<Partial<AiApiMetrics> | null>(null);
  const [aiDaily, setAiDaily] = useState<DailyNeuronItem[]>([]);
  const [aiNeuronLogs, setAiNeuronLogs] = useState<NeuronLogItem[]>([]);

  const [metrics, setMetrics] = useState<DbPlanMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const loadMetrics = useCallback(async (dbId?: string) => {
    const id = dbId || selectedDb?.uuid;
    if (!id) return;
    try {
      setLoadingMetrics(true);
      const data = await fetchDbMetrics(id);
      setMetrics(data);
    } catch (err: any) {
      console.error("Error al cargar métricas:", err);
    } finally {
      setLoadingMetrics(false);
    }
  }, [selectedDb]);

  const loadDatabases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dbs = await fetchDatabases();
      setDatabases(dbs);
      const currentExists = dbs.some(d => d.uuid === selectedDb?.uuid);
      if (!currentExists) {
        const mainDb = dbs.find(d => d.name === "byfiocr-v2-db") || dbs.find(d => d.name === "byfiocr-db") || dbs[0] || null;
        setSelectedDb(mainDb);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDb]);

  const switchAccount = useCallback(async (newAccount: AccountKey) => {
    setActiveAccount(newAccount);
    setAccount(newAccount);
    setSelectedDb(null);
    setTables([]);
    setSelectedTable(null);
    setRows([]);
    setColumns([]);
    setMetrics(null);
    try {
      setLoading(true);
      setError(null);
      const dbs = await fetchDatabases();
      setDatabases(dbs);
      const mainDb = dbs.find(d => d.name === "byfiocr-v2-db") || dbs.find(d => d.name === "byfiocr-db") || dbs[0] || null;
      setSelectedDb(mainDb);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTables = useCallback(async (db: D1Database) => {
    try {
      setLoadingTables(true);
      setError(null);
      const tbls = await fetchTables(db.uuid);
      setTables(tbls);
      setSelectedTable(tbls.length > 0 ? tbls[0].name : null);
      if (tbls.length === 0) { setRows([]); setColumns([]); }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const loadTableData = useCallback(async () => {
    if (!selectedDb || !selectedTable) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTableData({
        dbId: selectedDb.uuid,
        table: selectedTable,
        page, limit, search, sort: sortCol, order: sortOrder
      });
      setColumns(data.columns);
      setRows(data.rows);
      setTotalRows(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDb, selectedTable, page, limit, search, sortCol, sortOrder]);

  const checkAiApi = useCallback(async () => {
    const res = await fetchAiStatus();
    setAiOnline(res.online);
    setAiMetrics(res.summary);
    setAiDaily(res.daily || []);
    setAiNeuronLogs(res.neuronLogs || []);
  }, []);

  useEffect(() => {
    if (selectedDb) {
      loadTables(selectedDb);
      loadMetrics(selectedDb.uuid);
      if (selectedDb.name.includes("agent")) checkAiApi();
    }
  }, [selectedDb, loadTables, loadMetrics, checkAiApi]);

  useEffect(() => {
    if (selectedDb && selectedTable) loadTableData();
  }, [selectedDb, selectedTable, page, limit, search, sortCol, sortOrder, loadTableData]);

  const selectMainDb = () => {
    const main = databases.find(d => d.name === "byfiocr-v2-db") || databases.find(d => d.name === "byfiocr-db");
    if (main) { setSelectedDb(main); setPage(1); setSearch(""); }
  };

  const selectAiDb = () => {
    const aiDb = databases.find(d => d.name === "byfio-agent-db") || databases.find(d => d.name.includes("agent"));
    if (aiDb) { setSelectedDb(aiDb); setPage(1); setSearch(""); checkAiApi(); }
  };

  const deleteRow = async (pkCol: string, pkVal: any) => {
    if (!selectedDb || !selectedTable) return;
    try {
      setLoading(true);
      setError(null);
      await mutateRow({ dbId: selectedDb.uuid, table: selectedTable, action: "delete", pkColumn: pkCol, pkValue: pkVal });
      await loadTableData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    account, switchAccount,
    databases, selectedDb, setSelectedDb, selectMainDb, selectAiDb,
    tables, selectedTable, setSelectedTable,
    columns, rows, totalRows, page, setPage, limit, setLimit,
    search, setSearch, sortCol, setSortCol, sortOrder, setSortOrder,
    loading, loadingTables, error, setError,
    loadDatabases, loadTableData, deleteRow,
    aiOnline, aiMetrics, aiDaily, aiNeuronLogs, checkAiApi,
    metrics, loadingMetrics, loadMetrics
  };
}
