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
    const data = await cfFetch("/pages/projects", "GET", null, context.env, accountKey);
    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Error al consultar Pages projects");
    }

    const projects = (data.result || []).map((p: any) => ({
      name: p.name,
      subdomain: p.subdomain,
      domains: p.domains || []
    }));

    return new Response(JSON.stringify({ success: true, projects }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
