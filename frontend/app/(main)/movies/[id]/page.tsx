import { notFound } from "next/navigation"
import MovieDetailClient from "./movie-detail-client"
import type { MovieDetailDto, PagedResult, ReviewDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!API) notFound()

  const [movieRes, reviewsRes] = await Promise.all([
    fetch(`${API}/api/movies/${id}`, { next: { revalidate: 60 } }),
    fetch(`${API}/api/movies/${id}/reviews?page=1&pageSize=20`, { next: { revalidate: 30 } }),
  ])

  if (!movieRes.ok) notFound()
  const movie = (await movieRes.json()) as MovieDetailDto
  const initialReviews: PagedResult<ReviewDto> = reviewsRes.ok
    ? await reviewsRes.json()
    : { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }

  return <MovieDetailClient movie={movie} initialReviews={initialReviews} />
}
