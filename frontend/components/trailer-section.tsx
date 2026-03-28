import TrailerSectionClient from "@/components/trailer-section-client"
import { fetchWithTimeout } from "@/lib/server-fetch"
import type { MovieTrailerDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function TrailerSection() {
  let trailers: MovieTrailerDto[] = []
  if (API) {
    const res = await fetchWithTimeout(`${API}/api/movies/trailers?limit=8`, { next: { revalidate: 300 } })
    if (res.ok) trailers = await res.json()
  }
  return <TrailerSectionClient trailers={trailers} />
}
