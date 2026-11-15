import { verifySessionToken } from "./_auth";
import { cfFetch, getCfCredentials, getAccountFromContext } from "./_cf";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

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
    const requestedBucket = url.searchParams.get("bucket");
    const accountKey = getAccountFromContext(context) || "george"; // Prioriza george donde R2 está activo
    const credentials = getCfCredentials(context.env, accountKey);

    // 1. Listar buckets en la cuenta
    const bucketsRes = await cfFetch("/r2/buckets", "GET", null, context.env, accountKey);
    if (!bucketsRes.success) {
      const errorMsg = bucketsRes.errors?.[0]?.message || "Error consultando R2";
      const isNotEnabled = bucketsRes.errors?.[0]?.code === 10042 || errorMsg.includes("enable R2");
      return new Response(JSON.stringify({
        success: false,
        notEnabled: isNotEnabled,
        error: errorMsg,
        account: credentials
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const bucketsList = (bucketsRes.result?.buckets || []).map((b: any) => ({
      name: b.name,
      creationDate: b.creation_date
    }));

    if (bucketsList.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        account: credentials,
        buckets: [],
        selectedBucket: null,
        usage: null,
        objects: []
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const activeBucketName = requestedBucket || bucketsList[0].name;

    // 2. Obtener métricas de uso del bucket
    let usageData: any = null;
    try {
      const usageRes = await cfFetch(`/r2/buckets/${encodeURIComponent(activeBucketName)}/usage`, "GET", null, context.env, accountKey);
      if (usageRes.success && usageRes.result) {
        const payloadBytes = Number(usageRes.result.payloadSize) || 0;
        const metadataBytes = Number(usageRes.result.metadataSize) || 0;
        const totalStoredBytes = payloadBytes + metadataBytes;
        const maxSizeBytes = 10 * 1024 * 1024 * 1024; // 10 GB Free Tier
        const percentUsed = Math.min(100, Number(((totalStoredBytes / maxSizeBytes) * 100).toFixed(4)));

        usageData = {
          payloadBytes,
          payloadFormatted: formatBytes(payloadBytes),
          metadataBytes,
          totalStoredBytes,
          totalStoredFormatted: formatBytes(totalStoredBytes),
          maxSizeBytes,
          maxSizeFormatted: "10.00 GB",
          percentUsed,
          objectCount: Number(usageRes.result.objectCount) || 0,
          uploadCount: Number(usageRes.result.uploadCount) || 0,
          planName: "Cloudflare R2 Standard (Tier Gratuito 10 GB/mes)",
          lastSync: usageRes.result.end || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn("No se pudo obtener uso de R2:", e);
    }

    // 3. Obtener objetos almacenados en el bucket
    let objectsList: any[] = [];
    try {
      const objectsRes = await cfFetch(`/r2/buckets/${encodeURIComponent(activeBucketName)}/objects`, "GET", null, context.env, accountKey);
      if (objectsRes.success && Array.isArray(objectsRes.result)) {
        objectsList = objectsRes.result.map((o: any) => {
          const sizeBytes = Number(o.size) || 0;
          const cleanName = o.custom_metadata?.originalName || o.key.split("_").slice(3).join("_") || o.key;
          const contentType = o.http_metadata?.contentType || "image/png";
          const publicUrl = `https://byfiocr.com/api/etf-file?key=${encodeURIComponent(o.key)}`;

          return {
            key: o.key,
            name: cleanName,
            sizeBytes,
            sizeFormatted: formatBytes(sizeBytes),
            contentType,
            isImage: contentType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(cleanName),
            uploadedAt: o.custom_metadata?.uploadedAt || o.last_modified,
            storageClass: o.storage_class || "Standard",
            publicUrl
          };
        });
      }
    } catch (e) {
      console.warn("No se pudo listar objetos de R2:", e);
    }

    // Si usage no trajo objectCount o bytes porque Cloudflare R2 usage tiene delay de cálculo,
    // calcular el total real basado en los objetos listados:
    if (usageData && usageData.objectCount === 0 && objectsList.length > 0) {
      const realTotalBytes = objectsList.reduce((acc, o) => acc + o.sizeBytes, 0);
      usageData.objectCount = objectsList.length;
      usageData.payloadBytes = realTotalBytes;
      usageData.totalStoredBytes = realTotalBytes;
      usageData.totalStoredFormatted = formatBytes(realTotalBytes);
      usageData.percentUsed = Math.min(100, Number(((realTotalBytes / usageData.maxSizeBytes) * 100).toFixed(4)));
    }

    return new Response(JSON.stringify({
      success: true,
      account: credentials,
      buckets: bucketsList,
      selectedBucket: activeBucketName,
      usage: usageData,
      objects: objectsList
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
