export interface D1Database {
  uuid: string;
  name: string;
  num_tables?: number;
  file_size?: number;
  created_at?: string;
  jurisdiction?: string;
}

export interface PagesProject {
  name: string;
  subdomain: string;
  domains: string[];
}

export interface TableColumn {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSummary {
  name: string;
  rowCount?: number;
}

export interface QueryResultMeta {
  duration?: number;
  rows_read?: number;
  rows_written?: number;
  changes?: number;
  last_row_id?: number;
  size_after?: number;
}

export interface QueryResponse {
  results: Record<string, any>[];
  meta?: QueryResultMeta;
  success: boolean;
  error?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: string | null;
}

export type AccountKey = "anders" | "george";

export interface CloudflareAccountInfo {
  key: AccountKey;
  name: string;
  email: string;
  accountId: string;
}

export interface AiApiMetrics {
  status: string;
  totalNeuronsToday: number;
  totalNeuronsMonth: number;
  totalMessagesAnswered: number;
  totalChatOpens: number;
  remainingNeuronsToday: number;
  serverTimestamp?: string;
}

export interface DbPlanMetrics {
  databaseId: string;
  databaseName: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  maxSizeBytes: number;
  maxSizeFormatted: string;
  storagePercentUsed: number;
  planName: string;
  todayQueries: number;
  todayReadQueries: number;
  todayWriteQueries: number;
  todayRowsRead: number;
  todayRowsWritten: number;
  maxDailyRowsRead: number;
  maxDailyRowsWritten: number;
  readPercentUsed: number;
  writePercentUsed: number;
  monthQueries: number;
  monthRowsRead: number;
  monthRowsWritten: number;
  status: "healthy" | "warning" | "exceeded";
  refreshedAt: string;
}

export interface R2BucketInfo {
  name: string;
  creationDate?: string;
}

export interface R2UsageMetrics {
  payloadBytes: number;
  payloadFormatted: string;
  metadataBytes: number;
  totalStoredBytes: number;
  totalStoredFormatted: string;
  maxSizeBytes: number;
  maxSizeFormatted: string;
  percentUsed: number;
  objectCount: number;
  uploadCount: number;
  planName: string;
  lastSync?: string;
}

export interface R2ObjectItem {
  key: string;
  name: string;
  sizeBytes: number;
  sizeFormatted: string;
  contentType: string;
  isImage: boolean;
  uploadedAt: string;
  storageClass: string;
  publicUrl: string;
}

export interface R2StorageData {
  success: boolean;
  notEnabled?: boolean;
  error?: string;
  account?: CloudflareAccountInfo;
  buckets: R2BucketInfo[];
  selectedBucket: string | null;
  usage: R2UsageMetrics | null;
  objects: R2ObjectItem[];
}
