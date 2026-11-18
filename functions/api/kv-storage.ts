import { verifySessionToken } from "./_auth";
import { cfFetch, getCfCredentials, getAccountFromContext } from "./_cf";

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
    const url = new URL(context.request.url);
    const requestedNamespace = url.searchParams.get("namespace");
    const requestedKey = url.searchParams.get("key");
    const accountKey = getAccountFromContext(context) || "george";
    const credentials = getCfCredentials(context.env, accountKey);

    // 1. Listar Namespaces de KV
    const nsRes = await cfFetch("/storage/kv/namespaces?per_page=100", "GET", null, context.env, accountKey);
    if (!nsRes.success) {
      const errorMsg = nsRes.errors?.[0]?.message || "Error consultando KV namespaces";
      return new Response(JSON.stringify({
        success: false,
        error: errorMsg,
        account: credentials,
        namespaces: []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const namespaces: { id: string; title: string }[] = (nsRes.result || []).map((ns: any) => ({
      id: ns.id,
      title: ns.title
    }));

    if (namespaces.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        account: credentials,
        namespaces: [],
        selectedNamespace: null,
        keys: []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const activeNamespaceId = requestedNamespace || namespaces[0].id;

    // 2. Si se solicitó el valor de una key específica
    let selectedValue: string | null = null;
    if (requestedKey) {
      try {
        const valRes = await cfFetch(
          `/storage/kv/namespaces/${encodeURIComponent(activeNamespaceId)}/values/${encodeURIComponent(requestedKey)}`,
          "GET",
          null,
          context.env,
          accountKey
        );
        // Cloudflare KV values endpoint returns raw value or json
        selectedValue = typeof valRes === "object" ? JSON.stringify(valRes, null, 2) : String(valRes);
      } catch (e: any) {
        selectedValue = `Error al leer valor: ${e.message}`;
      }
    }

    // 3. Listar claves del namespace seleccionado
    let keysList: any[] = [];
    try {
      const keysRes = await cfFetch(
        `/storage/kv/namespaces/${encodeURIComponent(activeNamespaceId)}/keys?limit=100`,
        "GET",
        null,
        context.env,
        accountKey
      );
      if (keysRes.success && Array.isArray(keysRes.result)) {
        keysList = keysRes.result.map((k: any) => ({
          name: k.name,
          expiration: k.expiration,
          metadata: k.metadata
        }));
      }
    } catch (e) {
      console.warn("No se pudieron listar claves de KV:", e);
    }

    return new Response(JSON.stringify({
      success: true,
      account: credentials,
      namespaces,
      selectedNamespace: activeNamespaceId,
      keys: keysList,
      selectedKey: requestedKey || null,
      selectedValue
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
