import MovieSliderClient from "@/components/movie-slider-client"
import { fetchWithTimeout } from "@/lib/server-fetch"
import type { MovieSummaryDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function MovieSlider() {
  let movies: MovieSummaryDto[] = []
  if (API) {
    const res = await fetchWithTimeout(`${API}/api/movies/featured?limit=8`, { next: { revalidate: 120 } })
    if (res.ok) movies = await res.json()
  }
  return <MovieSliderClient movies={movies} />
}
