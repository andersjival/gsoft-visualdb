const ACCESS_CODE = "Geosoft777$$$";
const SECRET_SALT = "geosoft-d1-secure-edge-salt-2026";

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_SALT),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(str: string): string {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return atob(s);
}

export async function createSessionToken(accessCode: string): Promise<string | null> {
  if (accessCode !== ACCESS_CODE) {
    return null;
  }
  const payload = {
    role: "admin",
    user: "Anders Jival - GeoSoft",
    iat: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 días
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = base64UrlEncode(payloadStr);

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payloadB64));
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureB64 = base64UrlEncode(String.fromCharCode(...signatureArray));

  return `${payloadB64}.${signatureB64}`;
}

export async function verifySessionToken(token: string | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payloadB64, signatureB64] = parts;

  try {
    const payloadStr = base64UrlDecode(payloadB64);
    const payload = JSON.parse(payloadStr);
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }

    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const sigBytes = Uint8Array.from(base64UrlDecode(signatureB64), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payloadB64));
    return valid;
  } catch {
    return false;
  }
}
