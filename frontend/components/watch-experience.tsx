"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { WatchVideoPlayer } from "@/components/watch-video-player"
import type { MovieDetailDto } from "@/types/api"

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
  const currentChapter = chapters[idx]
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
          chapter={currentChapter}
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
