import { verifySessionToken } from "./_auth";
import { runD1Sql, getAccountFromContext } from "./_cf";

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
    return new Response(JSON.stringify({ error: "dbId requerido" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const accountKey = getAccountFromContext(context);
    const sql = "SELECT name, type FROM sqlite_master WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;";
    const queryRes = await runD1Sql(dbId, sql, [], context.env, accountKey);
    const tableNames: string[] = queryRes.results.map((r: any) => r.name);

    const tables = await Promise.all(
      tableNames.map(async (name) => {
        try {
          const countRes = await runD1Sql(dbId, `SELECT COUNT(*) as count FROM "${name}";`, [], context.env, accountKey);
          const rowCount = countRes.results[0]?.count ?? 0;
          return { name, rowCount };
        } catch {
          return { name, rowCount: 0 };
        }
      })
    );

    // Si tiene site_metrics y NO existe como tabla física, agregar vista virtual de usuarios registrados al inicio
    if (!tableNames.includes("registered_users") && tableNames.includes("site_metrics")) {
      try {
        const uRes = await runD1Sql(dbId, "SELECT data FROM site_metrics WHERE id = 'app_registered_users' LIMIT 1;", [], context.env, accountKey);
        if (uRes.results[0]?.data) {
          const parsed = JSON.parse(uRes.results[0].data);
          tables.unshift({ name: "registered_users", rowCount: Array.isArray(parsed) ? parsed.length : 0 });
        }
      } catch {}
    }

    return new Response(JSON.stringify({ success: true, tables }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
