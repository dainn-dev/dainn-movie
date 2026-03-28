"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, Star, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MovieSummaryDto, CelebrityListDto, NewsListDto, SearchResultDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""
const RECENT_KEY = "dmovie_recent_searches"
const MAX_RECENT = 6

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") } catch { return [] }
}
function saveRecent(q: string) {
  const prev = getRecent().filter((s) => s !== q)
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)))
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-8 text-muted-foreground text-sm">Đang tải...</div>
      }
    >
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ    = searchParams.get("q")    ?? ""
  const initialType = searchParams.get("type") ?? "all"

  const [query,   setQuery]   = useState(initialQ)
  const [type,    setType]    = useState(initialType)
  const [results, setResults] = useState<SearchResultDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [recent,  setRecent]  = useState<string[]>([])
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setRecent(getRecent()) }, [])

  // Debounce search
  useEffect(() => {
    if (!query.trim()) { setResults(null); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { doSearch(query, type) }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, type])

  // Sync initial query from URL
  useEffect(() => {
    if (initialQ) doSearch(initialQ, initialType)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function doSearch(q: string, t: string) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        q,
        page: "1",
        pageSize: "12",
        ...(t !== "all" ? { type: t } : {}),
      })
      const res = await fetch(`${API}/api/search?${params}`)
      if (res.ok) {
        const data: SearchResultDto = await res.json()
        setResults(data)
        saveRecent(q)
        setRecent(getRecent())
      }
    } finally {
      setLoading(false)
    }
    router.replace(`/search?q=${encodeURIComponent(q)}${t !== "all" ? `&type=${t}` : ""}`, { scroll: false })
  }

  function highlight(text: string, q: string) {
    if (!q) return text
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx < 0) return text
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary/20 text-primary rounded-sm">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    )
  }

  const totalMovies      = results?.movies.length      ?? 0
  const totalCelebrities = results?.celebrities.length ?? 0
  const totalNews        = results?.news.length        ?? 0

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          className="pl-10 pr-10 h-12 text-base"
          placeholder="Tìm phim, diễn viên, tin tức..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults(null) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Recent searches */}
      {!query && recent.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Tìm kiếm gần đây</p>
          <div className="flex flex-wrap gap-2">
            {recent.map((r) => (
              <button
                key={r}
                onClick={() => setQuery(r)}
                className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {query && (
        <Tabs value={type} onValueChange={(v) => setType(v)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Tất cả {results ? `(${results.total})` : ""}</TabsTrigger>
            <TabsTrigger value="movies">Phim {totalMovies > 0 ? `(${totalMovies})` : ""}</TabsTrigger>
            <TabsTrigger value="celebrities">Diễn viên {totalCelebrities > 0 ? `(${totalCelebrities})` : ""}</TabsTrigger>
            <TabsTrigger value="news">Tin tức {totalNews > 0 ? `(${totalNews})` : ""}</TabsTrigger>
          </TabsList>

          {loading && <div className="text-center py-12 text-muted-foreground">Đang tìm kiếm...</div>}

          {!loading && results && results.total === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Không tìm thấy kết quả cho <strong>"{query}"</strong>
              <p className="text-sm mt-2">Thử tìm với từ khoá khác.</p>
            </div>
          )}

          {!loading && results && (
            <>
              <TabsContent value="all">
                {totalMovies > 0 && (
                  <Section title="Phim">
                    <MovieResults movies={results.movies} query={query} highlight={highlight} />
                  </Section>
                )}
                {totalCelebrities > 0 && (
                  <Section title="Diễn viên / Đạo diễn">
                    <CelebrityResults celebrities={results.celebrities} query={query} highlight={highlight} />
                  </Section>
                )}
                {totalNews > 0 && (
                  <Section title="Tin tức">
                    <NewsResults news={results.news} query={query} highlight={highlight} />
                  </Section>
                )}
              </TabsContent>

              <TabsContent value="movies">
                <MovieResults movies={results.movies} query={query} highlight={highlight} />
              </TabsContent>
              <TabsContent value="celebrities">
                <CelebrityResults celebrities={results.celebrities} query={query} highlight={highlight} />
              </TabsContent>
              <TabsContent value="news">
                <NewsResults news={results.news} query={query} highlight={highlight} />
              </TabsContent>
            </>
          )}
        </Tabs>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </div>
  )
}

function MovieResults({ movies, query, highlight }: { movies: MovieSummaryDto[]; query: string; highlight: (t: string, q: string) => React.ReactNode }) {
  if (!movies.length) return <p className="text-muted-foreground text-sm">Không có kết quả.</p>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {movies.map((m) => (
        <Link key={m.id} href={`/movies/${m.id}`} className="group flex gap-3 items-start">
          <div className="relative w-12 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
            {m.posterUrl
              ? <Image src={m.posterUrl} alt={m.title} fill className="object-cover" sizes="48px" />
              : <div className="w-full h-full bg-muted" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">{highlight(m.title, query)}</p>
            <p className="text-xs text-muted-foreground">{m.releaseYear}</p>
            {m.avgRating > 0 && (
              <p className="text-xs text-yellow-500 flex items-center gap-0.5 mt-0.5">
                <Star className="h-3 w-3 fill-current" />{m.avgRating}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

function CelebrityResults({ celebrities, query, highlight }: { celebrities: CelebrityListDto[]; query: string; highlight: (t: string, q: string) => React.ReactNode }) {
  if (!celebrities.length) return <p className="text-muted-foreground text-sm">Không có kết quả.</p>
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {celebrities.map((c) => (
        <Link key={c.id} href={`/celebrities/${c.slug}`} className="group flex gap-3 items-center">
          <div className="relative w-10 h-10 flex-shrink-0 bg-muted rounded-full overflow-hidden">
            {c.avatarUrl
              ? <Image src={c.avatarUrl} alt={c.name} fill className="object-cover" sizes="40px" />
              : <div className="w-full h-full bg-muted" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary">{highlight(c.name, query)}</p>
            <p className="text-xs text-muted-foreground">{c.movieCount} phim</p>
          </div>
        </Link>
      ))}
    </div>
  )
}

function NewsResults({ news, query, highlight }: { news: NewsListDto[]; query: string; highlight: (t: string, q: string) => React.ReactNode }) {
  if (!news.length) return <p className="text-muted-foreground text-sm">Không có kết quả.</p>
  return (
    <div className="flex flex-col gap-3">
      {news.map((n) => (
        <Link key={n.id} href={`/news/${n.slug}`} className="group flex gap-3 items-start">
          <div className="relative w-16 h-12 flex-shrink-0 bg-muted rounded overflow-hidden">
            {n.coverUrl
              ? <Image src={n.coverUrl} alt={n.title} fill className="object-cover" sizes="64px" />
              : <div className="w-full h-full bg-muted" />}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">{highlight(n.title, query)}</p>
            <p className="text-xs text-muted-foreground">{new Date(n.publishedAt).toLocaleDateString("vi-VN")}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
