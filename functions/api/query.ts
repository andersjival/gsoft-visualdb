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
    const { dbId, sql, params = [] } = body;

    if (!dbId || !sql) {
      return new Response(JSON.stringify({ error: "dbId y sql son requeridos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const res = await runD1Sql(dbId, sql, params, context.env);
    return new Response(
      JSON.stringify({
        success: true,
        results: res.results,
        meta: res.meta
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
