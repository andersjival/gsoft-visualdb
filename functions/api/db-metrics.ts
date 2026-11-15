import { verifySessionToken } from "./_auth";
import { cfFetch, cfGraphql, getCfCredentials, getAccountFromContext } from "./_cf";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const onRequestGet = async (context: any) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!(await verifySessionToken(token))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const url = new URL(context.request.url);
  const dbId = url.searchParams.get("dbId");

  if (!dbId) {
    return new Response(JSON.stringify({ error: "Falta parámetro dbId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const accountKey = getAccountFromContext(context);
    const { accountId } = getCfCredentials(context.env, accountKey);

    // 1. Live Database Info (file_size, num_tables, etc.)
    const dbRes = await cfFetch(`/d1/database/${dbId}`, "GET", null, context.env, accountKey);
    if (!dbRes.success) {
      throw new Error(dbRes.errors?.[0]?.message || "No se pudo obtener información de la base de datos");
    }
    const dbData = dbRes.result;
    const fileSizeBytes = dbData.file_size || 0;

    // 2. Query Metrics via Cloudflare GraphQL
    const todayIso = new Date().toISOString().slice(0, 10) + "T00:00:00Z";
    const monthIso = new Date(Date.now() - 30 * 86400000).toISOString();

    const gqlQuery = `
      {
        viewer {
          accounts(filter: {accountTag: "${accountId}"}) {
            today: d1AnalyticsAdaptiveGroups(limit: 1, filter: {databaseId: "${dbId}", datetime_geq: "${todayIso}"}) {
              count
              sum { readQueries writeQueries rowsRead rowsWritten }
            }
            month: d1AnalyticsAdaptiveGroups(limit: 1, filter: {databaseId: "${dbId}", datetime_geq: "${monthIso}"}) {
              count
              sum { readQueries writeQueries rowsRead rowsWritten }
            }
          }
        }
      }
    `;

    const gqlRes = await cfGraphql(gqlQuery, context.env, accountKey);
    const accountData = gqlRes?.data?.viewer?.accounts?.[0];
    const todayStats = accountData?.today?.[0] || { count: 0, sum: { readQueries: 0, writeQueries: 0, rowsRead: 0, rowsWritten: 0 } };
    const monthStats = accountData?.month?.[0] || { count: 0, sum: { readQueries: 0, writeQueries: 0, rowsRead: 0, rowsWritten: 0 } };

    // Plan limits: Cloudflare D1 Free Tier
    const maxSizeBytes = 500 * 1024 * 1024; // 500 MB
    const maxDailyRowsRead = 5000000;       // 5M rows/day
    const maxDailyRowsWritten = 100000;     // 100k rows/day

    const todayRowsRead = todayStats.sum?.rowsRead || 0;
    const todayRowsWritten = todayStats.sum?.rowsWritten || 0;
    const storagePercentUsed = Math.min(100, Number(((fileSizeBytes / maxSizeBytes) * 100).toFixed(2)));
    const readPercentUsed = Math.min(100, Number(((todayRowsRead / maxDailyRowsRead) * 100).toFixed(2)));
    const writePercentUsed = Math.min(100, Number(((todayRowsWritten / maxDailyRowsWritten) * 100).toFixed(2)));

    let status = "healthy";
    if (storagePercentUsed > 90 || readPercentUsed > 90 || writePercentUsed > 90) status = "warning";
    if (storagePercentUsed >= 100 || readPercentUsed >= 100 || writePercentUsed >= 100) status = "exceeded";

    return new Response(JSON.stringify({
      success: true,
      metrics: {
        databaseId: dbId,
        databaseName: dbData.name,
        fileSizeBytes,
        fileSizeFormatted: formatBytes(fileSizeBytes),
        maxSizeBytes,
        maxSizeFormatted: "500.00 MB",
        storagePercentUsed,
        planName: "Cloudflare D1 Standard (Plan Gratuito)",
        todayQueries: todayStats.count || 0,
        todayReadQueries: todayStats.sum?.readQueries || 0,
        todayWriteQueries: todayStats.sum?.writeQueries || 0,
        todayRowsRead,
        todayRowsWritten,
        maxDailyRowsRead,
        maxDailyRowsWritten,
        readPercentUsed,
        writePercentUsed,
        monthQueries: monthStats.count || 0,
        monthRowsRead: monthStats.sum?.rowsRead || 0,
        monthRowsWritten: monthStats.sum?.rowsWritten || 0,
        status,
        refreshedAt: new Date().toISOString()
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
