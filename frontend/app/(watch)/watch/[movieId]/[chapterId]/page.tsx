import { notFound } from "next/navigation"
import WatchExperience from "@/components/watch-experience"
import type { MovieDetailDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default async function WatchPage({
  params,
}: {
  params: Promise<{ movieId: string; chapterId: string }>
}) {
  const { movieId, chapterId } = await params
  if (!API) notFound()

  const res = await fetch(`${API}/api/movies/${movieId}`, { next: { revalidate: 60 } })
  if (!res.ok) notFound()
  const movie = (await res.json()) as MovieDetailDto

  const chapterExists = movie.chapters.some((c) => c.id === chapterId)
  if (!chapterExists) notFound()

  return <WatchExperience movie={movie} initialChapterId={chapterId} />
}
