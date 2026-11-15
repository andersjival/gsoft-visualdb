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
  const table = url.searchParams.get("table");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(5, parseInt(url.searchParams.get("limit") || "25", 10)));
  const search = (url.searchParams.get("search") || "").trim();
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
    
    // Obtener columnas
    const schemaRes = await runD1Sql(dbId, `PRAGMA table_info("${cleanTable}");`, [], context.env);
    const columns = schemaRes.results;

    // Clausula WHERE si hay búsqueda
    let whereClause = "";
    const params: any[] = [];
    if (search && columns.length > 0) {
      const textCols = columns
        .filter((c: any) => ["TEXT", "VARCHAR", "CHAR", "STRING", ""].includes((c.type || "").toUpperCase()))
        .map((c: any) => c.name);
      
      const targetCols = textCols.length > 0 ? textCols : columns.slice(0, 3).map((c: any) => c.name);
      whereClause = `WHERE ` + targetCols.map((c: string) => `CAST("${c}" AS TEXT) LIKE ?`).join(" OR ");
      targetCols.forEach(() => params.push(`%${search}%`));
    }

    // Contar total
    const countSql = `SELECT COUNT(*) as total FROM "${cleanTable}" ${whereClause};`;
    const countRes = await runD1Sql(dbId, countSql, params, context.env);
    const total = countRes.results[0]?.total ?? 0;

    // Orden
    let orderClause = "";
    if (sortCol && columns.some((c: any) => c.name === sortCol)) {
      orderClause = `ORDER BY "${sortCol}" ${sortOrder}`;
    }

    // Filas paginadas
    const offset = (page - 1) * limit;
    const dataSql = `SELECT * FROM "${cleanTable}" ${whereClause} ${orderClause} LIMIT ${limit} OFFSET ${offset};`;
    const dataRes = await runD1Sql(dbId, dataSql, params, context.env);

    return new Response(
      JSON.stringify({
        success: true,
        columns,
        rows: dataRes.results,
        total,
        page,
        limit,
        meta: dataRes.meta
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
