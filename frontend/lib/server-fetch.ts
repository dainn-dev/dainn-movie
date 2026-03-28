/**
 * Server-only fetch with wall-clock timeout so `next build` does not hang when
 * `NEXT_PUBLIC_API_URL` is slow or unreachable.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } } = {},
  ms = 12_000
): Promise<Response> {
  const { next, ...rest } = init
  const ctrl = new AbortController()
  const id = setTimeout(() => ctrl.abort(), ms)
  try {
    return await fetch(url, { ...rest, next, signal: ctrl.signal })
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError")
      return new Response(null, { status: 408 })
    throw e
  } finally {
    clearTimeout(id)
  }
}
