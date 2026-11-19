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

  const accountKey = getAccountFromContext(context);
  const url = new URL(context.request.url);
  const dbId = url.searchParams.get("dbId");
  const table = url.searchParams.get("table");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get("limit") || "25", 10)));
  const search = (url.searchParams.get("search") || "").trim().toLowerCase();
  const sortCol = (url.searchParams.get("sort") || "").replace(/[^a-zA-Z0-9_]/g, "");
  const sortOrder = url.searchParams.get("order")?.toLowerCase() === "desc" ? "DESC" : "ASC";

  if (!dbId || !table) {
    return new Response(JSON.stringify({ error: "dbId y table requeridos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const cleanTable = table.replace(/[^a-zA-Z0-9_]/g, "");
    const schemaRes = await runD1Sql(dbId, `PRAGMA table_info("${cleanTable}");`, [], context.env, accountKey);
    const columns = schemaRes.results || [];

    // Fallback exclusivo para bases de datos heredadas donde registered_users no existe como tabla física
    if (columns.length === 0 && table === "registered_users") {
      const uRes = await runD1Sql(dbId, "SELECT data FROM site_metrics WHERE id = 'app_registered_users' LIMIT 1;", [], context.env, accountKey);
      let users: any[] = [];
      if (uRes.results[0]?.data) {
        users = JSON.parse(uRes.results[0].data);
      }

      if (search) {
        users = users.filter((u: any) => JSON.stringify(u).toLowerCase().includes(search));
      }

      if (sortCol) {
        users.sort((a, b) => {
          const valA = String(a[sortCol] || "");
          const valB = String(b[sortCol] || "");
          return sortOrder === "DESC" ? valB.localeCompare(valA) : valA.localeCompare(valB);
        });
      }

      const total = users.length;
      const offset = (page - 1) * limit;
      const paginated = users.slice(offset, offset + limit);

      const virtualColumns = [
        { cid: 0, name: "email", type: "TEXT", notnull: 1, dflt_value: null, pk: 1 },
        { cid: 1, name: "name", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 2, name: "phone", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 3, name: "idCard", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 4, name: "address", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 },
        { cid: 5, name: "password", type: "TEXT", notnull: 0, dflt_value: null, pk: 0 }
      ];

      return new Response(
        JSON.stringify({ success: true, columns: virtualColumns, rows: paginated, total, page, limit }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
          }
        }
      );
    }

    const hasPk = columns.some((c: any) => c.pk === 1);
    const mappedColumns = columns.map((c: any) => {
      if (!hasPk && c.name === "id") return { ...c, pk: 1 };
      return c;
    });

    let whereClause = "";
    const params: any[] = [];
    if (search && mappedColumns.length > 0) {
      const textCols = mappedColumns
        .filter((c: any) => ["TEXT", "VARCHAR", "CHAR", "STRING", ""].includes((c.type || "").toUpperCase()))
        .map((c: any) => c.name);
      
      const targetCols = textCols.length > 0 ? textCols : mappedColumns.slice(0, 3).map((c: any) => c.name);
      whereClause = `WHERE ` + targetCols.map((c: string) => `CAST("${c}" AS TEXT) LIKE ?`).join(" OR ");
      targetCols.forEach(() => params.push(`%${search}%`));
    }

    const countSql = `SELECT COUNT(*) as total FROM "${cleanTable}" ${whereClause};`;
    const countRes = await runD1Sql(dbId, countSql, params, context.env, accountKey);
    const total = countRes.results[0]?.total ?? 0;

    let orderClause = "";
    if (sortCol && mappedColumns.some((c: any) => c.name === sortCol)) {
      orderClause = `ORDER BY "${sortCol}" ${sortOrder}`;
    }

    const offset = (page - 1) * limit;
    const dataSql = `SELECT * FROM "${cleanTable}" ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset};`;
    const dataRes = await runD1Sql(dbId, dataSql, params, context.env, accountKey);

    return new Response(
      JSON.stringify({
        success: true,
        columns: mappedColumns,
        rows: dataRes.results,
        total,
        page,
        limit,
        meta: dataRes.meta
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"
        }
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
