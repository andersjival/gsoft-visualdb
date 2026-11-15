import { verifySessionToken } from "./_auth";
import { runD1Sql, getAccountFromContext } from "./_cf";

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
    const accountKey = getAccountFromContext(context, body?.account);

    if (!dbId || !table || !action) {
      return new Response(JSON.stringify({ error: "dbId, table y action son requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Mutaciones directas sobre Usuarios Registrados
    if (table === "registered_users") {
      const uRes = await runD1Sql(dbId, "SELECT data FROM site_metrics WHERE id = 'app_registered_users' LIMIT 1;", [], context.env, accountKey);
      let users: any[] = [];
      if (uRes.results[0]?.data) {
        users = JSON.parse(uRes.results[0].data);
      }

      if (action === "update") {
        const idx = users.findIndex((u: any) => u.email === pkValue || u[pkColumn] === pkValue);
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...record };
        } else {
          users.push(record);
        }
      } else if (action === "insert") {
        users.push(record);
      } else if (action === "delete") {
        users = users.filter((u: any) => u.email !== pkValue && u[pkColumn] !== pkValue);
      }

      await runD1Sql(
        dbId,
        "UPDATE site_metrics SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 'app_registered_users';",
        [JSON.stringify(users)],
        context.env,
        accountKey
      );

      return new Response(JSON.stringify({ success: true, count: users.length }), {
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
      const res = await runD1Sql(dbId, sql, [pkValue], context.env, accountKey);
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
      const res = await runD1Sql(dbId, sql, params, context.env, accountKey);
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
      const res = await runD1Sql(dbId, sql, params, context.env, accountKey);
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
