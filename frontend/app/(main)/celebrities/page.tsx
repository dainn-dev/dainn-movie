import Link from "next/link"
import Image from "next/image"
import { Film } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { CelebrityListDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

async function fetchCelebrities(params: URLSearchParams): Promise<PagedResult<CelebrityListDto>> {
  const res = await fetch(`${API}/api/celebrities?${params}`, { next: { revalidate: 60 } })
  if (!res.ok) return { data: [], pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 } }
  return res.json()
}

interface PageProps {
  searchParams: Promise<{ role?: string; sort?: string; page?: string }>
}

const ROLES = [
  { value: "",         label: "Tất cả"    },
  { value: "actor",    label: "Diễn viên" },
  { value: "director", label: "Đạo diễn"  },
  { value: "writer",   label: "Biên kịch" },
]

export default async function CelebritiesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const params = new URLSearchParams({
    ...(sp.role ? { role: sp.role } : {}),
    sort:     sp.sort ?? "popular",
    page:     sp.page ?? "1",
    pageSize: "20",
  })

  const result = await fetchCelebrities(params)
  const currentPage = Number(sp.page ?? 1)

  function buildHref(overrides: Record<string, string | undefined>) {
    const merged = { ...sp, ...overrides }
    const p = new URLSearchParams()
    for (const [k, v] of Object.entries(merged)) { if (v) p.set(k, v) }
    const qs = p.toString()
    return `/celebrities${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-dosis font-bold mb-6">Diễn viên &amp; Đạo diễn</h1>

      {/* Role filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ROLES.map((r) => (
          <Link key={r.value} href={buildHref({ role: r.value || undefined, page: "1" })}>
            <Badge variant={(sp.role ?? "") === r.value ? "default" : "outline"} className="cursor-pointer">
              {r.label}
            </Badge>
          </Link>
        ))}

        <div className="ml-auto flex gap-1">
	{[
            { value: "popular", label: "Nổi tiếng" },
            { value: "newest", label: "Mới thêm" },
            { value: "title", label: "Tên A-Z" },
          ].map((s) => (
            <Link key={s.value} href={buildHref({ sort: s.value, page: "1" })}>
              <Button variant={(sp.sort ?? "popular") === s.value ? "default" : "ghost"} size="sm" className="text-xs h-7">
                {s.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {result.data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">Chưa có dữ liệu.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {result.data.map((c) => (
            <Link key={c.id} href={`/celebrities/${c.slug}`} className="group block text-center">
              <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden bg-muted mb-2">
                {c.avatarUrl ? (
                  <Image src={c.avatarUrl} alt={c.name} fill className="object-cover group-hover:scale-105 transition-transform" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-2xl font-bold">
                    {c.name[0]}
                  </div>
                )}
              </div>
              <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-1">{c.name}</p>
              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                <Film className="h-3 w-3" /> {c.movieCount} phim
              </p>
              {c.country && <p className="text-xs text-muted-foreground">{c.country}</p>}
            </Link>
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
