"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import type { MovieDetailDto, VideoSourceInfoDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function WatchExperience({
  movie,
  initialChapterId,
}: {
  movie: MovieDetailDto
  initialChapterId: string
}) {
  const router = useRouter()
  const { accessToken } = useAuth()
  const chapters = useMemo(
    () => [...movie.chapters].sort((a, b) => a.order - b.order),
    [movie.chapters]
  )
  const [chapterId, setChapterId] = useState(initialChapterId)
  const [theater, setTheater] = useState(false)

  useEffect(() => {
    router.replace(`/watch/${movie.id}/${chapterId}`, { scroll: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, movie.id])

  const idx = chapters.findIndex((c) => c.id === chapterId)
  const onEnded = useCallback(() => {
    if (idx >= 0 && idx < chapters.length - 1) setChapterId(chapters[idx + 1]!.id)
  }, [chapters, idx])

  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row min-h-[calc(100vh-49px)]",
        theater && "fixed inset-0 z-40 min-h-screen"
      )}
    >
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 py-2 border-b border-white/10">
          <h1 className="text-lg font-semibold truncate">{movie.title}</h1>
        </div>
        <WatchVideoPlayer
          movieId={movie.id}
          chapterId={chapterId}
          onEnded={onEnded}
          theater={theater}
          onTheaterToggle={() => setTheater((t) => !t)}
        />
        <div className="px-4 py-6 space-y-4 text-white/80 text-sm border-t border-white/10">
          <p className="text-white/50">Bình luận trực tiếp trên video — có thể mở rộng với SignalR.</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white"
            type="button"
            onClick={async () => {
              if (!accessToken) {
                alert("Đăng nhập để báo cáo.")
                return
              }
              const reason = typeof window !== "undefined" ? window.prompt("Mô tả ngắn lý do báo cáo:") : null
              if (!reason || reason.trim().length < 3) return
              const r = await fetch(`${API}/api/social/reports`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ targetType: "movie", targetId: movie.id, reason: reason.trim() }),
              })
              alert(r.ok ? "Đã gửi báo cáo cho moderator." : "Gửi báo cáo thất bại.")
            }}
          >
            Báo cáo
          </Button>
        </div>
      </div>
      <aside
        className={cn(
          "w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-white/10 bg-black/40 p-3 max-h-[40vh] lg:max-h-none overflow-y-auto shrink-0",
          theater && "hidden lg:block"
        )}
      >
        <h2 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Chương / Tập</h2>
        <ul className="space-y-1">
          {chapters.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setChapterId(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                  c.id === chapterId
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-white/10 text-white/90"
                )}
              >
                {c.title}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-6 pt-4 border-t border-white/10">
          <Link href={`/movies/${movie.id}`} className="text-sm text-sky-400 hover:underline">
            ← Chi tiết phim
          </Link>
        </div>
      </aside>
    </div>
  )
}

function WatchVideoPlayer({
  movieId,
  chapterId,
  onEnded,
  theater,
  onTheaterToggle,
}: {
  movieId: string
  chapterId: string
  onEnded: () => void
  theater: boolean
  onTheaterToggle: () => void
}) {
  const [qualities, setQualities] = useState<{ key: string; label: string }[]>([{ key: "720p", label: "720p" }])
  const [quality, setQuality] = useState("720p")
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { accessToken } = useAuth()
  const lastHistoryAt = useRef(0)

  useEffect(() => {
    lastHistoryAt.current = 0
  }, [chapterId])

  useEffect(() => {
    let cancel = false
    ;(async () => {
      const r = await fetch(`${API}/api/chapters/${chapterId}/sources`)
      if (!r.ok || cancel) return
      const sources = (await r.json()) as VideoSourceInfoDto[]
      const ready = sources.filter((s) => s.status === "ready")
      const opts = ready.length
        ? ready.map((s) => ({
            key: mapQualityToParam(s.quality),
            label: formatQualityLabel(s.quality),
          }))
        : [{ key: "720p", label: "720p" }]
      if (!cancel) {
        setQualities(opts)
        setQuality(opts[0]!.key)
      }
    })()
    return () => {
      cancel = true
    }
  }, [chapterId])

  useEffect(() => {
    let cancel = false
    setLoading(true)
    setError(null)
    setUrl(null)
    ;(async () => {
      const r = await fetch(
        `${API}/api/chapters/${chapterId}/stream-url?quality=${encodeURIComponent(quality)}`
      )
      if (cancel) return
      if (!r.ok) {
        setError("Không lấy được link phát (chapter chưa có video ready hoặc thiếu cấu hình R2).")
        setLoading(false)
        return
      }
      const data = (await r.json()) as { url: string }
      setUrl(data.url)
      setLoading(false)
    })()
    return () => {
      cancel = true
    }
  }, [chapterId, quality])

  return (
    <div className={cn("relative bg-black", theater && "flex-1 flex flex-col justify-center")}>
      <div className="aspect-video w-full max-h-[75vh] bg-black relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-white/60 text-sm z-10">
            Đang tải video…
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-sm px-4 text-center z-10">
            {error}
          </div>
        )}
        {url && !loading && !error && (
          <video
            key={url}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
            src={url}
            onEnded={onEnded}
            onTimeUpdate={(e) => {
              if (!accessToken) return
              const sec = Math.floor(e.currentTarget.currentTime)
              const now = Date.now()
              if (now - lastHistoryAt.current < 12_000) return
              lastHistoryAt.current = now
              void fetch(`${API}/api/social/watch-history`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ movieId, chapterId, progressSeconds: sec }),
              })
            }}
          />
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-black/80 border-t border-white/10">
        <span className="text-xs text-white/50">Chất lượng</span>
        <select
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white"
        >
          {qualities.map((q) => (
            <option key={q.key} value={q.key}>
              {q.label}
            </option>
          ))}
        </select>
        <Button type="button" variant="secondary" size="sm" onClick={onTheaterToggle}>
          {theater ? "Thoát rạp" : "Chế độ rạp"}
        </Button>
      </div>
    </div>
  )
}

function mapQualityToParam(stored: string): string {
  const u = stored.toUpperCase()
  if (u === "SD") return "480p"
  if (u === "HD") return "720p"
  if (u === "4K") return "1080p"
  return stored
}

function formatQualityLabel(stored: string): string {
  const u = stored.toUpperCase()
  if (u === "SD") return "480p"
  if (u === "HD") return "720p"
  if (u === "4K") return "1080p / 4K"
  return stored
}
