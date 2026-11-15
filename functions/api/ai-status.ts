import { verifySessionToken } from "./_auth";

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
    const aiApiUrl = "https://byfiocr.pages.dev/api/ai/metrics";
    const res = await fetch(aiApiUrl, {
      headers: { "Accept": "application/json" }
    });

    if (!res.ok) {
      throw new Error(`API de IA respondió con estado HTTP ${res.status}`);
    }

    const data = await res.json() as any;
    return new Response(
      JSON.stringify({
        success: true,
        online: true,
        endpoint: aiApiUrl,
        summary: data.summary || {},
        periods: data.periods || {}
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        success: false,
        online: false,
        error: err.message,
        endpoint: "https://byfiocr.pages.dev/api/ai/metrics"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
