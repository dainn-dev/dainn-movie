"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { WatchHistoryItemDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function formatDuration(sec: number) {
  if (sec <= 0) return "—"
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export default function WatchHistoryPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [rows, setRows] = useState<WatchHistoryItemDto[]>([])
  const [loading, setLoading] = useState(true)

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined),
    [accessToken],
  )

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/social/watch-history`, { headers })
      if (r.ok) setRows(await r.json())
      else setRows([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, headers])

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/user/watch-history")
      return
    }
    load()
  }, [user, load, router])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Đang chuyển hướng…
      </div>
    )
  }

  return (
    <div>
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Lịch sử xem</h1>
          <p className="text-sm text-white/70 mt-2">
            <Link href="/" className="hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2">•</span>
            Tiếp tục từ các tập đã mở
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <UserSidebar activeItem="history" />
          </div>
          <div className="md:col-span-3 space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải…</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có lịch sử xem.</p>
            ) : (
              <ul className="space-y-3">
                {rows.map((h) => (
                  <li
                    key={h.id}
                    className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="relative h-20 w-14 shrink-0 rounded overflow-hidden bg-muted">
                      <Image
                        src={h.posterUrl || "/placeholder.svg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium">{h.movieTitle}</p>
                      <p className="text-sm text-muted-foreground">{h.chapterTitle}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tiến độ {formatDuration(h.progressSeconds)} ·{" "}
                        {new Date(h.watchedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" asChild>
                      <Link href={`/watch/${h.movieId}/${h.chapterId}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Tiếp tục
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
