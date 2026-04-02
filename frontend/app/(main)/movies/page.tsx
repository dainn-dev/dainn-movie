import Link from "next/link"
import Image from "next/image"
import { Star, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { GenreDto, MovieSummaryDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

async function fetchMovies(params: URLSearchParams): Promise<PagedResult<MovieSummaryDto>> {
  const res = await fetch(`${API}/api/movies?${params}`, { next: { revalidate: 60 } })
  if (!res.ok) return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }
  return res.json()
}

async function fetchGenres(): Promise<GenreDto[]> {
  const res = await fetch(`${API}/api/movies/genres`, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return res.json()
}

interface PageProps {
  searchParams: Promise<{ genre?: string; year?: string; sort?: string; page?: string }>
}

export default async function MoviesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = new URLSearchParams({
    ...(sp.genre ? { genre: sp.genre } : {}),
    ...(sp.year  ? { year:  sp.year  } : {}),
    sort:     sp.sort     ?? "latest",
    page:     sp.page     ?? "1",
    pageSize: "20",
  })

  const [result, genres] = await Promise.all([fetchMovies(params), fetchGenres()])
  const currentPage = Number(sp.page ?? 1)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-dosis font-bold mb-6">Danh sách phim</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <SlidersHorizontal className="h-4 w-4" /> Lọc:
        </div>

        {/* Genre filter */}
        <div className="flex flex-wrap gap-2">
          <Link href={buildHref(sp, { genre: undefined, page: "1" })}>
            <Badge variant={!sp.genre ? "default" : "outline"} className="cursor-pointer">Tất cả</Badge>
          </Link>
          {genres.map((g) => (
            <Link key={g.slug} href={buildHref(sp, { genre: g.slug, page: "1" })}>
              <Badge variant={sp.genre === g.slug ? "default" : "outline"} className="cursor-pointer">
                {g.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Sort */}
        <div className="ml-auto">
          <SortSelect current={sp.sort ?? "latest"} baseParams={sp} />
        </div>
      </div>

      {/* Active filters */}
      {(sp.genre || sp.year) && (
        <div className="flex gap-2 mb-4 text-sm">
          <span className="text-muted-foreground">Đang lọc:</span>
          {sp.genre && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{sp.genre}</span>}
          {sp.year  && <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{sp.year}</span>}
          <Link href="/movies" className="text-muted-foreground hover:text-destructive ml-1">× Xoá tất cả</Link>
        </div>
      )}

      {/* Grid */}
      {result.data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Không tìm thấy phim nào phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {result.data.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link href={buildHref(sp, { page: String(currentPage - 1) })}>
              <Button variant="outline" size="sm">← Trước</Button>
            </Link>
          )}
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Trang {currentPage} / {result.pagination.totalPages}
          </span>
          {currentPage < result.pagination.totalPages && (
            <Link href={buildHref(sp, { page: String(currentPage + 1) })}>
              <Button variant="outline" size="sm">Tiếp →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function MovieCard({ movie }: { movie: MovieSummaryDto }) {
  return (
    <Link href={`/movies/${movie.id}`} className="group block">
      <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted mb-2">
        {movie.posterUrl ? (
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs p-2 text-center">
            {movie.title}
          </div>
        )}
        {movie.avgRating > 0 && (
          <div className="absolute top-1 right-1 bg-black/70 text-yellow-400 text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-current" /> {movie.avgRating}
          </div>
        )}
      </div>
      <p className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">{movie.title}</p>
      {movie.releaseYear && <p className="text-xs text-muted-foreground mt-0.5">{movie.releaseYear}</p>}
    </Link>
  )
}

function SortSelect({ current, baseParams }: { current: string; baseParams: Record<string, string | undefined> }) {
  // client-only for interactivity — but we use a plain link form for SSR compatibility
  const options = [
    { value: "latest", label: "Mới nhất" },
    { value: "popular", label: "Xem nhiều" },
    { value: "rating",  label: "Đánh giá cao" },
    { value: "title",   label: "Tên A-Z" },
  ]
  return (
    <div className="flex gap-1">
      {options.map((o) => (
        <Link key={o.value} href={buildHref(baseParams, { sort: o.value, page: "1" })}>
          <Button variant={current === o.value ? "default" : "ghost"} size="sm" className="text-xs h-7">
            {o.label}
          </Button>
        </Link>
      ))}
    </div>
  )
}

function buildHref(current: Record<string, string | undefined>, overrides: Record<string, string | undefined>) {
  const merged = { ...current, ...overrides }
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(merged)) {
    if (v) params.set(k, v)
  }
  const qs = params.toString()
  return `/movies${qs ? `?${qs}` : ""}`
}
