import { verifySessionToken } from "./_auth";
import { runD1Sql } from "./_cf";

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
    const sql = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name;";
    const queryRes = await runD1Sql(dbId, sql, [], context.env);
    const tableNames: string[] = queryRes.results.map((r: any) => r.name);

    // Obtener recuentos para cada tabla
    const tables = await Promise.all(
      tableNames.map(async (name) => {
        try {
          const countRes = await runD1Sql(dbId, `SELECT COUNT(*) as count FROM "${name}";`, [], context.env);
          const rowCount = countRes.results[0]?.count ?? 0;
          return { name, rowCount };
        } catch {
          return { name, rowCount: 0 };
        }
      })
    );

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
