// Cliente API centralizado para comunicarse con el Backend desacoplado KURI
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null; ok: boolean }> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // Incluir cookies de sesión JWT
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { data: null, error: data?.error || `Error HTTP ${res.status}`, ok: false };
    }

    return { data, error: null, ok: true };
  } catch (err: any) {
    return { data: null, error: err.message || "Error de red al conectar con el backend", ok: false };
  }
}
