"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookmarkPlus, Heart, Play, Star } from "lucide-react"
import { WriteReviewDialog } from "@/components/write-review-dialog"
import { useAuth } from "@/contexts/auth-context"
import type { MovieDetailDto, PagedResult, ReviewDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function formatRuntime(min: number | null): string {
  if (min == null) return "—"
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h${m}m` : `${m} phút`
}

export default function MovieDetailClient({
  movie,
  initialReviews,
}: {
  movie: MovieDetailDto
  initialReviews: PagedResult<ReviewDto>
}) {
  const { accessToken } = useAuth()
  const [fav, setFav] = useState(false)
  const [watchlist, setWatchlist] = useState(false)
  const [reviews, setReviews] = useState<PagedResult<ReviewDto>>(initialReviews)

  const sortedChapters = [...movie.chapters].sort((a, b) => a.order - b.order)
  const firstChapterId = sortedChapters[0]?.id

  const loadReviews = useCallback(async () => {
    const r = await fetch(`${API}/api/movies/${movie.id}/reviews?page=1&pageSize=20`)
    if (r.ok) setReviews(await r.json())
  }, [movie.id])

  useEffect(() => {
    if (!accessToken) {
      setFav(false)
      setWatchlist(false)
      return
    }
    ;(async () => {
      const [rf, rw] = await Promise.all([
        fetch(`${API}/api/movies/${movie.id}/favorite`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        movie.status === "published"
          ? fetch(`${API}/api/social/watchlist/contains/${movie.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            })
          : Promise.resolve(null as Response | null),
      ])
      if (rf.ok) {
        const d = (await rf.json()) as { isFavorite: boolean }
        setFav(d.isFavorite)
      }
      if (rw?.ok) {
        const d = (await rw.json()) as { onList: boolean }
        setWatchlist(d.onList)
      }
    })()
  }, [accessToken, movie.id, movie.status])

  async function toggleWatchlist() {
    if (!accessToken) {
      alert("Đăng nhập để dùng danh sách xem sau.")
      return
    }
    if (movie.status !== "published") return
    const h = { Authorization: `Bearer ${accessToken}` }
    if (watchlist) {
      await fetch(`${API}/api/social/watchlist/${movie.id}`, { method: "DELETE", headers: h })
      setWatchlist(false)
    } else {
      const r = await fetch(`${API}/api/social/watchlist/${movie.id}`, { method: "POST", headers: h })
      if (r.ok) setWatchlist(true)
    }
  }

  async function toggleFavorite() {
    if (!accessToken) {
      alert("Đăng nhập để dùng yêu thích.")
      return
    }
    const h = { Authorization: `Bearer ${accessToken}` }
    if (fav) {
      await fetch(`${API}/api/movies/${movie.id}/favorite`, { method: "DELETE", headers: h })
      setFav(false)
    } else {
      const r = await fetch(`${API}/api/movies/${movie.id}/favorite`, { method: "POST", headers: h })
      if (r.ok) setFav(true)
    }
  }

  return (
    <div className="pb-16">
      <div
        className="h-48 md:h-64 w-full bg-muted relative bg-cover bg-center"
        style={
          movie.backdropUrl
            ? { backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.5), var(--background)), url(${movie.backdropUrl})` }
            : undefined
        }
      />

      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Image
                src={movie.posterUrl || "/placeholder.svg"}
                alt={movie.title}
                width={320}
                height={480}
                className="rounded-lg shadow-lg w-full h-auto border border-border"
              />
              <div className="mt-4 flex flex-col gap-2">
                {firstChapterId ? (
                  <Button className="w-full" asChild>
                    <Link href={`/watch/${movie.id}/${firstChapterId}`}>
                      <Play className="mr-2 h-4 w-4" /> Xem ngay
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full" disabled variant="secondary">
                    Chưa có tập phát
                  </Button>
                )}
                <Button variant={fav ? "default" : "outline"} className="w-full" type="button" onClick={toggleFavorite}>
                  <Heart className={`mr-2 h-4 w-4 ${fav ? "fill-current" : ""}`} />
                  {fav ? "Đã thích" : "Yêu thích"}
                </Button>
                {movie.status === "published" && (
                  <Button
                    variant={watchlist ? "secondary" : "outline"}
                    className="w-full"
                    type="button"
                    onClick={toggleWatchlist}
                  >
                    <BookmarkPlus className="mr-2 h-4 w-4" />
                    {watchlist ? "Đã thêm xem sau" : "Xem sau (watchlist)"}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6">
              <h1 className="text-3xl font-dosis font-bold mb-1">
                {movie.title}{" "}
                <span className="text-muted-foreground font-normal">
                  {movie.releaseYear ? `(${movie.releaseYear})` : ""}
                </span>
              </h1>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                {movie.genres.map((g) => (
                  <Link key={g.slug} href={`/movies?genre=${g.slug}`} className="text-primary hover:underline">
                    {g.name}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="h-5 w-5 fill-current" />
                  <span className="font-semibold text-foreground">{movie.avgRating || "—"}</span>
                  <span className="text-muted-foreground text-sm">/10 · {movie.ratingCount} lượt</span>
                </div>
              </div>

              <Tabs defaultValue="overview">
                <TabsList className="mb-4 flex-wrap h-auto">
                  <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                  <TabsTrigger value="chapters">Chương</TabsTrigger>
                  <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
                  <TabsTrigger value="cast">Diễn viên</TabsTrigger>
                  <TabsTrigger value="related">Liên quan</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {movie.description || "Chưa có mô tả."}
                  </p>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Thời lượng</dt>
                      <dd>{formatRuntime(movie.runtimeMinutes)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Phân loại</dt>
                      <dd>{movie.mpaaRating ?? "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Lượt xem</dt>
                      <dd>{movie.viewCount.toLocaleString("vi-VN")}</dd>
                    </div>
                  </dl>
                  {movie.trailerUrl && (
                    <a
                      href={movie.trailerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary text-sm hover:underline"
                    >
                      Trailer ngoài ↗
                    </a>
                  )}
                </TabsContent>

                <TabsContent value="chapters">
                  {sortedChapters.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Chưa có chương.</p>
                  ) : (
                    <ul className="space-y-2">
                      {sortedChapters.map((c) => (
                        <li
                          key={c.id}
                          className="flex flex-wrap items-center justify-between gap-2 border border-border rounded-md p-3"
                        >
                          <div>
                            <p className="font-medium">{c.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.videoSources.filter((v) => v.status === "ready").length} nguồn sẵn sàng
                            </p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/watch/${movie.id}/${c.id}`}>
                              <Play className="h-3 w-3 mr-1" /> Xem
                            </Link>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <p className="text-sm text-muted-foreground">
                      {reviews.pagination.total} đánh giá có nội dung
                    </p>
                    <WriteReviewDialog
                      movieTitle={movie.title}
                      movieId={movie.id}
                      onSubmitted={loadReviews}
                    />
                  </div>
                  <div className="space-y-6">
                    {reviews.data.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Chưa có review.</p>
                    ) : (
                      reviews.data.map((rev) => (
                        <div key={rev.id} className="border-b border-border pb-4">
                          <div className="flex gap-3">
                            <div className="relative h-10 w-10 rounded-full overflow-hidden bg-muted shrink-0">
                              {rev.avatarUrl ? (
                                <Image src={rev.avatarUrl} alt="" fill className="object-cover" sizes="40px" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center text-xs font-bold">
                                  {rev.username[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium">{rev.title}</p>
                              <div className="flex text-yellow-500 text-xs my-1">
                                {Array.from({ length: rev.score }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current" />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                {new Date(rev.createdAt).toLocaleString("vi-VN")} · {rev.username}
                              </p>
                              <p className="text-sm whitespace-pre-wrap">{rev.body}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="cast">
                  <ul className="space-y-3">
                    {movie.cast.map((c) => (
                      <li key={`${c.celebrityId}-${c.role}`} className="flex items-center gap-3">
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0">
                          {c.avatarUrl ? (
                            <Image src={c.avatarUrl} alt="" fill className="object-cover" sizes="48px" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-xs font-medium">
                              {c.name[0]}
                            </span>
                          )}
                        </div>
                        <div>
                          <Link href={`/celebrities/${c.slug}`} className="font-medium hover:text-primary">
                            {c.name}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {c.role}
                            {c.characterName ? ` · ${c.characterName}` : ""}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </TabsContent>

                <TabsContent value="related">
                  {movie.relatedMovies.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Chưa có gợi ý.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {movie.relatedMovies.map((m) => (
                        <Link key={m.id} href={`/movies/${m.id}`} className="group block">
                          <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted mb-2">
                            <Image
                              src={m.posterUrl || "/placeholder.svg"}
                              alt={m.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform"
                              sizes="120px"
                            />
                          </div>
                          <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">{m.title}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
