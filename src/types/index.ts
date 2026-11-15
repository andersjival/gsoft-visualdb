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

export interface AiApiMetrics {
  status: string;
  totalNeuronsToday: number;
  totalNeuronsMonth: number;
  totalMessagesAnswered: number;
  totalChatOpens: number;
  remainingNeuronsToday: number;
  serverTimestamp?: string;
}
