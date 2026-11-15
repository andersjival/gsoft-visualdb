const TOKEN_STORAGE_KEY = "geosoft_visualdb_token";

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: string;
  error?: string;
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function loginWithAccessCode(accessCode: string): Promise<LoginResult> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessCode })
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      setStoredToken(data.token);
      return { success: true, token: data.token, user: data.user };
    }
    return { success: false, error: data.error || "Código de acceso incorrecto" };
  } catch (err: any) {
    return { success: false, error: err.message || "Error al conectar con el servidor" };
  }
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}
