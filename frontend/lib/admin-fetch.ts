const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export async function adminFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  if (r.status === 204) return { ok: true, data: undefined as T }
  const text = await r.text()
  if (!r.ok) {
    let message = text || r.statusText
    try {
      const j = JSON.parse(text) as { message?: string }
      if (j.message) message = j.message
    } catch {
      /* keep */
    }
    return { ok: false, status: r.status, message }
  }
  if (!text) return { ok: true, data: undefined as T }
  return { ok: true, data: JSON.parse(text) as T }
}
