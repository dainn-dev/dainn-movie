import { fetchWithTimeout } from "@/lib/server-fetch"
import type { MovieSummaryDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export async function fetchMoviesForGridCategory(category: string): Promise<MovieSummaryDto[]> {
  if (!API) return []

  const revalidate = { next: { revalidate: 60 } as const }

  const popular = async () => {
    const r = await fetchWithTimeout(`${API}/api/movies/popular?limit=12`, revalidate)
    return r.ok ? ((await r.json()) as MovieSummaryDto[]) : []
  }
  const latest = async () => {
    const r = await fetchWithTimeout(`${API}/api/movies/latest?limit=12`, revalidate)
    return r.ok ? ((await r.json()) as MovieSummaryDto[]) : []
  }
  const sortList = async (sort: string) => {
    const p = new URLSearchParams({ sort, page: "1", pageSize: "12" })
    const r = await fetchWithTimeout(`${API}/api/movies?${p}`, revalidate)
    if (!r.ok) return []
    const body = (await r.json()) as { data: MovieSummaryDto[] }
    return body.data ?? []
  }

  switch (category) {
    case "popular":
    case "tv-popular":
      return popular()
    case "coming-soon":
    case "tv-coming-soon":
      return latest()
    case "top-rated":
    case "tv-top-rated":
      return sortList("rating")
    case "most-reviewed":
    case "tv-most-reviewed":
      return sortList("reviews")
    default:
      return popular()
  }
}
