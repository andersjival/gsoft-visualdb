import { verifySessionToken } from "../_auth";

export const onRequestGet = async (context: any) => {
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "");

  const isValid = await verifySessionToken(token);
  if (!isValid) {
    return new Response(
      JSON.stringify({ valid: false, error: "Token inválido o expirado" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ valid: true, user: "Anders Jival - GeoSoft" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
};
