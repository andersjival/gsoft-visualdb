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
  const table = url.searchParams.get("table");

  if (!dbId || !table) {
    return new Response(JSON.stringify({ error: "dbId y table requeridos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const accountKey = getAccountFromContext(context);
    const cleanTable = table.replace(/[^a-zA-Z0-9_]/g, "");
    const res = await runD1Sql(dbId, `PRAGMA table_info("${cleanTable}");`, [], context.env, accountKey);
    let columns = res.results || [];

    if (columns.length === 0 && table === "registered_users") {
      const virtualCols = [
        { cid: 0, name: "email", type: "TEXT", notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: "name", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 2, name: "phone", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 3, name: "idCard", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 4, name: "address", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 5, name: "password", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 }
      ];
      return new Response(JSON.stringify({ success: true, columns: virtualCols }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const hasPk = columns.some((c: any) => c.pk === 1);
    const processedColumns = columns.map((c: any) => {
      if (!hasPk && c.name === "id") return { ...c, pk: 1 };
      return c;
    });

    return new Response(JSON.stringify({ success: true, columns: processedColumns }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
