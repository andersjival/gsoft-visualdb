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

    const cleanTable = table.replace(/[^a-zA-Z0-9_]/g, "");

    // Verificar si la tabla existe realmente en la base de datos física
    const tableInfo = await runD1Sql(dbId, `PRAGMA table_info("${cleanTable}");`, [], context.env, accountKey);
    const isRealTable = Boolean(tableInfo.results && tableInfo.results.length > 0);

    // Fallback exclusivo para bases de datos viejas donde registered_users no existe como tabla física
    if (!isRealTable && table === "registered_users") {
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

    if (action === "delete") {
      if (!pkColumn || pkValue === undefined) {
        throw new Error("pkColumn y pkValue requeridos para eliminar");
      }
      const cleanPk = pkColumn.replace(/[^a-zA-Z0-9_]/g, "");

      // Si es registered_users o usuarios, limpiar y desvincular dependencias foráneas antes de borrar para garantizar control total
      if (cleanTable === "registered_users") {
        try {
          let userId = pkValue;
          if (cleanPk !== "id") {
            const u = await runD1Sql(dbId, `SELECT id FROM registered_users WHERE "${cleanPk}" = ? LIMIT 1;`, [pkValue], context.env, accountKey);
            userId = u.results[0]?.id ?? pkValue;
          }
          if (userId) {
            await runD1Sql(dbId, `DELETE FROM apartados_abonos WHERE id_apartado IN (SELECT id_apartado FROM apartados WHERE id_usuario = ?);`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `DELETE FROM apartados WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `DELETE FROM curso_inscripciones WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `DELETE FROM direcciones_envio WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `DELETE FROM user_passkeys WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE orders SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE drive_course_purchases SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE user_support_tickets SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE course_downloads SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE workshop_waitlist SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
            await runD1Sql(dbId, `UPDATE agent_conversations SET id_usuario = NULL WHERE id_usuario = ?;`, [userId], context.env, accountKey).catch(() => {});
          }
        } catch {}
      }

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
