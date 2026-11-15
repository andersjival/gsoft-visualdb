import { verifySessionToken } from "./_auth";
import { cfFetch, getAccountFromContext } from "./_cf";

export const onRequestGet = async (context: any) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  if (!(await verifySessionToken(token))) {
    return new Response(JSON.stringify({ error: "No autorizado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const accountKey = getAccountFromContext(context);
    const data = await cfFetch("/d1/database", "GET", null, context.env, accountKey);
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Error al consultar Cloudflare API");
    }

    const databases = data.result.map((db: any) => ({
      uuid: db.uuid,
      name: db.name,
      num_tables: db.num_tables || 0,
      file_size: db.file_size || 0,
      created_at: db.created_at
    }));

    return new Response(JSON.stringify({ success: true, databases }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
