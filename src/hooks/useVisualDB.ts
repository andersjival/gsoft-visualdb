import { useState, useEffect, useCallback } from "react";
import { D1Database, TableSummary, TableColumn } from "../types";
import { fetchDatabases, fetchTables, fetchTableData, mutateRow } from "../services/api";

export function useVisualDB() {
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

  // Cargar bases de datos iniciales
  const loadDatabases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dbs = await fetchDatabases();
      setDatabases(dbs);
      
      // Auto-seleccionar byfiocr-db si existe
      const byfio = dbs.find(d => d.name === "byfiocr-db") || dbs[0];
      if (byfio && !selectedDb) {
        setSelectedDb(byfio);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedDb]);

  // Cargar tablas de la base de datos seleccionada
  const loadTables = useCallback(async (db: D1Database) => {
    try {
      setLoadingTables(true);
      setError(null);
      const tbls = await fetchTables(db.uuid);
      setTables(tbls);
      if (tbls.length > 0) {
        setSelectedTable(tbls[0].name);
      } else {
        setSelectedTable(null);
        setRows([]);
        setColumns([]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  // Cargar datos de la tabla activa
  const loadTableData = useCallback(async () => {
    if (!selectedDb || !selectedTable) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTableData({
        dbId: selectedDb.uuid,
        table: selectedTable,
        page,
        limit,
        search,
        sort: sortCol,
        order: sortOrder
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

  useEffect(() => {
    if (selectedDb) {
      loadTables(selectedDb);
    }
  }, [selectedDb, loadTables]);

  useEffect(() => {
    if (selectedDb && selectedTable) {
      loadTableData();
    }
  }, [selectedDb, selectedTable, page, limit, search, sortCol, sortOrder, loadTableData]);

  const selectDatabaseByName = (name: string) => {
    const found = databases.find(d => d.name.toLowerCase().includes(name.toLowerCase()));
    if (found) {
      setSelectedDb(found);
      setPage(1);
      setSearch("");
    }
  };

  const deleteRow = async (pkCol: string, pkVal: any) => {
    if (!selectedDb || !selectedTable) return;
    await mutateRow({
      dbId: selectedDb.uuid,
      table: selectedTable,
      action: "delete",
      pkColumn: pkCol,
      pkValue: pkVal
    });
    await loadTableData();
  };

  return {
    databases,
    selectedDb,
    setSelectedDb,
    selectDatabaseByName,
    tables,
    selectedTable,
    setSelectedTable,
    columns,
    rows,
    totalRows,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    sortCol,
    setSortCol,
    sortOrder,
    setSortOrder,
    loading,
    loadingTables,
    error,
    setError,
    loadDatabases,
    loadTableData,
    deleteRow
  };
}
