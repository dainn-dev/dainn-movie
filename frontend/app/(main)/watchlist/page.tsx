"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { BookmarkX, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import type { MovieSummaryDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function WatchlistPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [items, setItems] = useState<MovieSummaryDto[]>([])
  const [loading, setLoading] = useState(true)

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    [accessToken],
  )

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/social/watchlist`, { headers })
      if (r.ok) setItems(await r.json())
      else setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, headers])

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/watchlist")
      return
    }
    load()
  }, [user, load, router])

  async function remove(movieId: string) {
    if (!accessToken) return
    await fetch(`${API}/api/social/watchlist/${movieId}`, {
      method: "DELETE",
      headers,
    })
    load()
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Đang chuyển hướng…
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xem sau</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Phim bạn đã thêm từ trang chi tiết phim (watchlist).
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/movies">Khám phá phim</Link>
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-sm">Đang tải…</p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">Danh sách trống. Thêm phim từ nút &quot;Xem sau&quot; khi xem chi tiết phim.</p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map((m) => (
            <li key={m.id} className="group relative rounded-lg border bg-card overflow-hidden shadow-sm">
              <Link href={`/movies/${m.id}`} className="block">
                <div className="relative aspect-[2/3] bg-muted">
                  <Image
                    src={m.posterUrl || "/placeholder.svg"}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="font-medium text-sm line-clamp-2 leading-snug">{m.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {m.avgRating.toFixed(1)}
                    {m.releaseYear != null && <span>· {m.releaseYear}</span>}
                  </div>
                </div>
              </Link>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 opacity-90"
                title="Bỏ khỏi xem sau"
                onClick={() => remove(m.id)}
              >
                <BookmarkX className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
