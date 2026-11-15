import { createSessionToken } from "../_auth";

export const onRequestPost = async (context: any) => {
  try {
    const body = await context.request.json().catch(() => ({}));
    const { accessCode } = body;

    const token = await createSessionToken(accessCode);
    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "Código de acceso incorrecto" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: "Anders Jival - GeoSoft",
        expiresIn: "7d"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
