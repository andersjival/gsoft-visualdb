export function getCfCredentials(env?: Record<string, any>) {
  const accountId = env?.CLOUDFLARE_ACCOUNT_ID || "c45409ee4154cf898c37375b1e96d910";
  const token = env?.CLOUDFLARE_API_TOKEN || "";
  return { accountId, token };
}

export async function cfFetch(
  endpoint: string,
  method = "GET",
  body?: any,
  env?: Record<string, any>
) {
  const { accountId, token } = getCfCredentials(env);
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

export async function cfGraphql(query: string, env?: Record<string, any>) {
  const { token } = getCfCredentials(env);
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
  env?: Record<string, any>
) {
  const payload = { sql, params };
  const res = await cfFetch(`/d1/database/${databaseId}/query`, "POST", payload, env);
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
