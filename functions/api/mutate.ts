import { verifySessionToken } from "./_auth";
import { runD1Sql } from "./_cf";

export const onRequestPost = async (context: any) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!(await verifySessionToken(token))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await context.request.json().catch(() => ({}));
    const { dbId, table, action, record, pkColumn, pkValue } = body;

    if (!dbId || !table || !action) {
      return new Response(JSON.stringify({ error: "dbId, table y action son requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const cleanTable = table.replace(/[^a-zA-Z0-9_]/g, "");

    if (action === "delete") {
      if (!pkColumn || pkValue === undefined) {
        throw new Error("pkColumn y pkValue requeridos para eliminar");
      }
      const cleanPk = pkColumn.replace(/[^a-zA-Z0-9_]/g, "");
      const sql = `DELETE FROM "${cleanTable}" WHERE "${cleanPk}" = ?;`;
      const res = await runD1Sql(dbId, sql, [pkValue], context.env);
      return new Response(JSON.stringify({ success: true, meta: res.meta }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "update") {
      if (!pkColumn || pkValue === undefined || !record) {
        throw new Error("pkColumn, pkValue y record son requeridos para actualizar");
      }
      const cleanPk = pkColumn.replace(/[^a-zA-Z0-9_]/g, "");
      const keys = Object.keys(record).filter(k => k !== cleanPk);
      if (keys.length === 0) {
        return new Response(JSON.stringify({ success: true, message: "Sin cambios" }), {
          headers: { "Content-Type": "application/json" }
        });
      }

      const setClauses = keys.map(k => `"${k.replace(/[^a-zA-Z0-9_]/g, "")}" = ?`).join(", ");
      const params = [...keys.map(k => record[k]), pkValue];
      const sql = `UPDATE "${cleanTable}" SET ${setClauses} WHERE "${cleanPk}" = ?;`;
      const res = await runD1Sql(dbId, sql, params, context.env);
      return new Response(JSON.stringify({ success: true, meta: res.meta }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    if (action === "insert") {
      if (!record || typeof record !== "object") {
        throw new Error("record requerido para inserción");
      }
      const keys = Object.keys(record).filter(k => record[k] !== undefined && record[k] !== null && record[k] !== "");
      if (keys.length === 0) {
        throw new Error("Se debe proporcionar al menos una columna con valor");
      }

      const colNames = keys.map(k => `"${k.replace(/[^a-zA-Z0-9_]/g, "")}"`).join(", ");
      const placeholders = keys.map(() => "?").join(", ");
      const params = keys.map(k => record[k]);
      const sql = `INSERT INTO "${cleanTable}" (${colNames}) VALUES (${placeholders});`;
      const res = await runD1Sql(dbId, sql, params, context.env);
      return new Response(JSON.stringify({ success: true, meta: res.meta }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: `Acción desconocida: ${action}` }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
