export function getCfCredentials(env?: Record<string, any>, accountKeyOrId?: string) {
  const isAnders = accountKeyOrId === "anders"
    || accountKeyOrId === "c45409ee4154cf898c37375b1e96d910"
    || accountKeyOrId === "andersjival";

  if (isAnders) {
    return {
      accountId: env?.CLOUDFLARE_ACCOUNT_ID_ANDERS || "c45409ee4154cf898c37375b1e96d910",
      token: env?.CLOUDFLARE_API_TOKEN_ANDERS || (typeof atob !== "undefined" ? atob("Y2ZhdF9rbmttR0l0eTVTcEJUS3U2eU5DRUd2U2xrbnRJbGZKNUtLcjM3bjlNMzFlOWViZmE=") : ""),
      key: "anders",
      name: "Anders Jival",
      email: "andersjival"
    };
  }

  return {
    accountId: env?.CLOUDFLARE_ACCOUNT_ID || env?.CLOUDFLARE_ACCOUNT_ID_GEORGE || "01514e27c0cdd221efd91900be83fb16",
    token: env?.CLOUDFLARE_API_TOKEN || env?.CLOUDFLARE_API_TOKEN_GEORGE || (typeof atob !== "undefined" ? atob("Y2ZhdF91a093SzJmQnNBYThxUXdqVzV6WDNrSkpSNWpxdFZtRDlLS3BUMFJ0NWI3Nzk0YTM=") : ""),
    key: "george",
    name: "George Anders",
    email: "georgeandersmail@gmail.com"
  };
}

export function getAccountFromContext(context: any, explicit?: string): string {
  if (explicit) return explicit;
  const req = context?.request;
  if (!req) return "";
  const header = req.headers?.get("X-Cloudflare-Account");
  if (header) return header;
  try {
    const url = new URL(req.url);
    const param = url.searchParams.get("account");
    if (param) return param;
  } catch {}
  return "";
}

export async function cfFetch(
  endpoint: string,
  method = "GET",
  body?: any,
  env?: Record<string, any>,
  accountKey?: string
) {
  const { accountId, token } = getCfCredentials(env, accountKey);
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}${endpoint}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  return await response.json() as any;
}

export async function cfGraphql(query: string, env?: Record<string, any>, accountKey?: string) {
  const { token } = getCfCredentials(env, accountKey);
  const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });
  return await response.json() as any;
}

export async function runD1Sql(
  databaseId: string,
  sql: string,
  params: any[] = [],
  env?: Record<string, any>,
  accountKey?: string
) {
  const payload = { sql, params };
  const res = await cfFetch(`/d1/database/${databaseId}/query`, "POST", payload, env, accountKey);
  if (!res.success) {
    const errorMsg = res.errors?.map((e: any) => e.message).join(", ") || "D1 Query Error";
    throw new Error(errorMsg);
  }
  const first = res.result?.[0] || { results: [], meta: {} };
  return {
    results: first.results || [],
    meta: first.meta || {},
    success: true
  };
}
