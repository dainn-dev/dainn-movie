import Link from "next/link"
import Image from "next/image"
import { CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { NewsListDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

async function fetchNews(params: URLSearchParams): Promise<PagedResult<NewsListDto>> {
  const res = await fetch(`${API}/api/news?${params}`, { next: { revalidate: 60 } })
  if (!res.ok) return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }
  return res.json()
}

interface PageProps {
  searchParams: Promise<{ tag?: string; page?: string }>
}

export default async function NewsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = new URLSearchParams({
    ...(sp.tag ? { tag: sp.tag } : {}),
    page:     sp.page ?? "1",
    pageSize: "18",
  })

  const result = await fetchNews(params)
  const currentPage = Number(sp.page ?? 1)
  const [featured, ...rest] = result.data

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { ...sp, ...overrides }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) { if (v) p.set(k, v) }
    const qs = p.toString()
    return `/news${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-dosis font-bold mb-6">Tin tức &amp; Bài viết</h1>

      {/* Featured article hero */}
      {featured && currentPage === 1 && (
        <Link href={`/news/${featured.slug}`} className="group block mb-8">
          <div className="relative rounded-xl overflow-hidden aspect-[21/9] bg-muted">
            {featured.coverUrl && (
              <Image src={featured.coverUrl} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="100vw" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 text-white">
              <div className="flex gap-2 mb-2">
                {featured.tags.slice(0, 3).map((t) => (
                  <Badge key={t} className="bg-primary text-white text-xs">{t}</Badge>
                ))}
              </div>
              <h2 className="text-2xl md:text-3xl font-dosis font-bold mb-1 group-hover:text-primary/80 transition-colors">
                {featured.title}
              </h2>
              <p className="text-sm text-white/70 flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {new Date(featured.publishedAt).toLocaleDateString("vi-VN")} · {featured.authorName}
              </p>
            </div>
          </div>
        </Link>
      )}

      {/* Tag filter (derived from current page results) */}
      {sp.tag && (
        <div className="flex items-center gap-2 mb-4 text-sm">
          <span className="text-muted-foreground">Tag:</span>
          <Badge className="bg-primary/10 text-primary">{sp.tag}</Badge>
          <Link href="/news" className="text-muted-foreground hover:text-destructive text-xs">× Xoá</Link>
        </div>
      )}

      {/* Article grid */}
      {rest.length === 0 && !featured ? (
        <div className="text-center py-20 text-muted-foreground">Chưa có bài viết nào.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {result.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {currentPage > 1 && (
            <Link href={buildHref({ page: String(currentPage - 1) })}>
              <Button variant="outline" size="sm">← Trước</Button>
            </Link>
          )}
          <span className="flex items-center text-sm text-muted-foreground px-3">
            Trang {currentPage} / {result.pagination.totalPages}
          </span>
          {currentPage < result.pagination.totalPages && (
            <Link href={buildHref({ page: String(currentPage + 1) })}>
              <Button variant="outline" size="sm">Tiếp →</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

function NewsCard({ article }: { article: NewsListDto }) {
  return (
    <Link href={`/news/${article.slug}`} className="group block">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-3">
        {article.coverUrl && (
          <Image src={article.coverUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        )}
      </div>
      <div className="flex gap-1 mb-1 flex-wrap">
        {article.tags.slice(0, 2).map((t) => (
          <span key={t} className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">{t}</span>
        ))}
      </div>
      <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">{article.title}</h3>
      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
        <CalendarDays className="h-3 w-3" />
        {new Date(article.publishedAt).toLocaleDateString("vi-VN")} · {article.authorName}
      </p>
    </Link>
  )
}
