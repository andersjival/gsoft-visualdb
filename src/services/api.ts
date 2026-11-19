import { getStoredToken } from "./auth";
import { D1Database, PagesProject, TableColumn, TableSummary, QueryResponse, AiApiMetrics, AiStatusResponse, DbPlanMetrics, AccountKey, R2StorageData, KvStorageData } from "../types";

let activeAccount: AccountKey = (localStorage.getItem("gsoft_active_account") as AccountKey) || "george";

export function setActiveAccount(account: AccountKey) {
  activeAccount = account;
  try { localStorage.setItem("gsoft_active_account", account); } catch {}
}

export function getActiveAccount(): AccountKey {
  return activeAccount;
}

function getHeaders(): HeadersInit {
  const token = getStoredToken() || "";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "X-Cloudflare-Account": activeAccount
  };
}

export async function fetchDatabases(): Promise<D1Database[]> {
  const res = await fetch(`/api/databases?_t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener bases de datos");
  return data.databases;
}

export async function fetchProjects(): Promise<PagesProject[]> {
  const res = await fetch(`/api/projects?_t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener proyectos Pages");
  return data.projects;
}

export async function fetchTables(dbId: string): Promise<TableSummary[]> {
  const res = await fetch(`/api/tables?dbId=${encodeURIComponent(dbId)}&_t=${Date.now()}`, { headers: getHeaders(), cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener tablas");
  return data.tables;
}

export async function fetchTableSchema(dbId: string, table: string): Promise<TableColumn[]> {
  const res = await fetch(`/api/schema?dbId=${encodeURIComponent(dbId)}&table=${encodeURIComponent(table)}&_t=${Date.now()}`, {
    headers: getHeaders(),
    cache: "no-store"
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener esquema");
  return data.columns;
}

export async function fetchTableData(params: {
  dbId: string;
  table: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}): Promise<{
  columns: TableColumn[];
  rows: Record<string, any>[];
  total: number;
  page: number;
  limit: number;
}> {
  const query = new URLSearchParams({
    dbId: params.dbId,
    table: params.table,
    page: String(params.page || 1),
    limit: String(params.limit || 25),
    search: params.search || "",
    sort: params.sort || "",
    order: params.order || "asc",
    _t: String(Date.now())
  });
  const res = await fetch(`/api/table-data?${query.toString()}`, { headers: getHeaders(), cache: "no-store" });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener datos de tabla");
  return data;
}

export async function mutateRow(params: {
  dbId: string;
  table: string;
  action: "insert" | "update" | "delete";
  record?: Record<string, any>;
  pkColumn?: string;
  pkValue?: any;
}): Promise<any> {
  const res = await fetch("/api/mutate", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params)
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error en operación CRUD");
  return data;
}

export async function executeSqlQuery(dbId: string, sql: string, params: any[] = []): Promise<QueryResponse> {
  const res = await fetch("/api/query", {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ dbId, sql, params })
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al ejecutar consulta SQL");
  return data;
}

export async function fetchAiStatus(): Promise<AiStatusResponse> {
  const res = await fetch("/api/ai-status", { headers: getHeaders() });
  const data = await res.json();
  return {
    online: data.online ?? false,
    endpoint: data.endpoint || "https://byfiocr.pages.dev/api/ai/metrics",
    summary: data.summary || {},
    daily: data.daily || [],
    neuronLogs: data.neuronLogs || []
  };
}

export async function fetchDbMetrics(dbId: string): Promise<DbPlanMetrics> {
  const res = await fetch(`/api/db-metrics?dbId=${encodeURIComponent(dbId)}`, { headers: getHeaders() });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Error al obtener métricas de BD");
  return data.metrics;
}

export async function fetchR2Storage(bucket?: string, account?: AccountKey): Promise<R2StorageData> {
  const query = new URLSearchParams();
  if (bucket) query.set("bucket", bucket);
  if (account) query.set("account", account);
  const res = await fetch(`/api/r2-storage?${query.toString()}`, {
    headers: {
      ...getHeaders(),
      ...(account ? { "X-Cloudflare-Account": account } : {})
    }
  });
  const data = await res.json();
  return data;
}

export async function fetchKvStorage(params?: { namespace?: string; key?: string; account?: AccountKey }): Promise<KvStorageData> {
  const query = new URLSearchParams();
  if (params?.namespace) query.set("namespace", params.namespace);
  if (params?.key) query.set("key", params.key);
  if (params?.account) query.set("account", params.account);
  const res = await fetch(`/api/kv-storage?${query.toString()}`, {
    headers: {
      ...getHeaders(),
      ...(params?.account ? { "X-Cloudflare-Account": params.account } : {})
    }
  });
  const data = await res.json();
  return data;
}
