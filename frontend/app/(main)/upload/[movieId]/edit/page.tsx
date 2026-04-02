"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StreamMirrorsEditor } from "@/components/stream-mirrors-editor"
import { useAuth } from "@/contexts/auth-context"
import type { GenreDto, MovieDetailDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function EditUploadedMoviePage() {
  const params = useParams()
  const router = useRouter()
  const movieId = params.movieId as string
  const { accessToken, user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [genres, setGenres] = useState<GenreDto[]>([])
  const [detail, setDetail] = useState<MovieDetailDto | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [releaseYear, setReleaseYear] = useState("")
  const [status, setStatus] = useState("draft")
  const [listingPriceVnd, setListingPriceVnd] = useState("")
  const [genrePick, setGenrePick] = useState<Set<number>>(new Set())

  const [chapterStreams, setChapterStreams] = useState<Record<string, string>>({})
  const [chapterStreamErr, setChapterStreamErr] = useState<Record<string, string>>({})
  const [trimByChapter, setTrimByChapter] = useState<Record<string, { start: string; end: string }>>({})
  const [posterSecByChapter, setPosterSecByChapter] = useState<Record<string, string>>({})
  const [mediaBusy, setMediaBusy] = useState<string | null>(null)
  const [mediaNote, setMediaNote] = useState<string | null>(null)

  const authJson = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  )

  useEffect(() => {
    if (!user || !accessToken) {
      router.replace("/login")
      return
    }
    ;(async () => {
      try {
        const [gRes, mRes] = await Promise.all([
          fetch(`${API}/api/movies/genres`),
          fetch(`${API}/api/movies/${movieId}`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ])
        if (gRes.ok) setGenres(await gRes.json())
        if (mRes.status === 401) {
          router.replace("/login")
          return
        }
        if (!mRes.ok) {
          setError("Không tải được phim (kiểm tra quyền sở hữu).")
          setLoading(false)
          return
        }
        const m = (await mRes.json()) as MovieDetailDto
        setDetail(m)
        setTitle(m.title)
        setDescription(m.description ?? "")
        setPosterUrl(m.posterUrl ?? "")
        setReleaseYear(m.releaseYear != null ? String(m.releaseYear) : "")
        setStatus(m.status)
        setListingPriceVnd(
          m.listingPriceVnd != null && m.listingPriceVnd > 0 ? String(m.listingPriceVnd) : ""
        )
        setGenrePick(new Set(m.genres.map((g) => g.id)))
      } catch {
        setError("Lỗi mạng.")
      } finally {
        setLoading(false)
      }
    })()
  }, [movieId, accessToken, user, router])

  const fetchChapterStream = useCallback(
    async (chapterId: string) => {
      if (!accessToken) return
      const r = await fetch(`${API}/api/chapters/${chapterId}/stream-url`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!r.ok) {
        const msg =
          r.status === 404
            ? "Chưa có video sẵn sàng hoặc chưa cấu hình stream."
            : `Không lấy được URL (${r.status}).`
        setChapterStreamErr((e) => ({ ...e, [chapterId]: msg }))
        setChapterStreams((s) => {
          const n = { ...s }
          delete n[chapterId]
          return n
        })
        return
      }
      const { url } = (await r.json()) as { url: string }
      setChapterStreams((s) => ({ ...s, [chapterId]: url }))
      setChapterStreamErr((e) => {
        const n = { ...e }
        delete n[chapterId]
        return n
      })
    },
    [accessToken]
  )

  useEffect(() => {
    if (!detail?.chapters?.length) return
    setTrimByChapter((prev) => {
      const next = { ...prev }
      for (const ch of detail.chapters) {
        if (next[ch.id]) continue
        const d =
          ch.durationSeconds != null && ch.durationSeconds > 0 ? ch.durationSeconds : 120
        next[ch.id] = { start: "0", end: String(d) }
      }
      return next
    })
    setPosterSecByChapter((prev) => {
      const next = { ...prev }
      for (const ch of detail.chapters) {
        if (next[ch.id] == null) next[ch.id] = "3"
      }
      return next
    })
    for (const ch of detail.chapters) void fetchChapterStream(ch.id)
  }, [detail, fetchChapterStream])

  async function reloadMovie() {
    if (!accessToken) return
    const mRes = await fetch(`${API}/api/movies/${movieId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (mRes.ok) setDetail((await mRes.json()) as MovieDetailDto)
  }

  async function applyChapterTrim(chapterId: string) {
    if (!accessToken) return
    const t = trimByChapter[chapterId]
    if (!t) return
    const start = parseFloat(t.start)
    const end = parseFloat(t.end)
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      setMediaNote("Khoảng cắt không hợp lệ (điểm kết thúc phải lớn hơn điểm đầu).")
      return
    }
    setMediaNote(null)
    setMediaBusy(`trim-${chapterId}`)
    try {
      const res = await fetch(`${API}/api/chapters/${chapterId}/trim`, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({ startSeconds: start, endSeconds: end }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setMediaNote((j as { message?: string }).message ?? "Cắt video thất bại.")
        return
      }
      setMediaNote("Đã cắt — đang làm mới preview…")
      await fetchChapterStream(chapterId)
    } finally {
      setMediaBusy(null)
    }
  }

  async function applyChapterPoster(chapterId: string) {
    if (!accessToken) return
    const raw = posterSecByChapter[chapterId] ?? "0"
    const timeSeconds = parseFloat(raw)
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0) {
      setMediaNote("Thời điểm poster không hợp lệ.")
      return
    }
    setMediaNote(null)
    setMediaBusy(`poster-${chapterId}`)
    try {
      const res = await fetch(`${API}/api/chapters/${chapterId}/poster-from-video`, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({ timeSeconds }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setMediaNote((j as { message?: string }).message ?? "Lấy poster thất bại.")
        return
      }
      setMediaNote("Đã cập nhật poster chapter.")
      await reloadMovie()
    } finally {
      setMediaBusy(null)
    }
  }

  async function uploadChapterVtt(chapterId: string, file: File | null) {
    if (!accessToken || !file) return
    if (!file.name.toLowerCase().endsWith(".vtt")) {
      setMediaNote("Chọn file .vtt (WebVTT).")
      return
    }
    setMediaNote(null)
    setMediaBusy(`vtt-${chapterId}`)
    try {
      const pr = await fetch(`${API}/api/videos/subtitle-presigned-url`, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({
          movieId,
          chapterId,
          filename: file.name,
          contentType: "text/vtt",
        }),
      })
      if (!pr.ok) {
        const j = await pr.json().catch(() => ({}))
        setMediaNote((j as { message?: string }).message ?? "Không lấy được URL upload phụ đề.")
        return
      }
      const { url, key } = (await pr.json()) as { url: string; key: string }
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", url)
        xhr.setRequestHeader("Content-Type", "text/vtt")
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(file)
      })
      const cf = await fetch(`${API}/api/videos/confirm-subtitle`, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({
          movieId,
          chapterId,
          key,
          fileSizeBytes: file.size,
        }),
      })
      if (!cf.ok) {
        const j = await cf.json().catch(() => ({}))
        setMediaNote((j as { message?: string }).message ?? "Xác nhận phụ đề thất bại.")
        return
      }
      setMediaNote("Đã gắn phụ đề VTT cho chapter.")
      await reloadMovie()
    } catch (e) {
      setMediaNote(e instanceof Error ? e.message : "Upload phụ đề thất bại.")
    } finally {
      setMediaBusy(null)
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    const year = releaseYear ? parseInt(releaseYear, 10) : null
    const priceRaw = listingPriceVnd.trim() ? parseInt(listingPriceVnd.trim(), 10) : NaN
    const body = {
      title: title.trim(),
      description: description.trim() || null,
      posterUrl: posterUrl.trim() || null,
      releaseYear: Number.isFinite(year) ? year : null,
      status,
      genreIds: [...genrePick],
      listingPriceVnd: Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : 0,
    }
    const res = await fetch(`${API}/api/movies/${movieId}`, {
      method: "PUT",
      headers: authJson,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Lưu thất bại.")
      return
    }
    router.push("/user/my-movies")
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Đang tải…</div>
  }

  if (!detail) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-destructive mb-4">{error ?? "Không có dữ liệu."}</p>
        <Button asChild variant="outline">
          <Link href="/user/my-movies">Quay lại</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-2">Chỉnh sửa phim</h1>
      <p className="text-sm text-muted-foreground mb-6">
        <Link href={`/upload`} className="text-primary underline">
          Quay lại luồng upload
        </Link>
      </p>

      {error && (
        <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={save} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label>Tiêu đề</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Mô tả</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Poster URL</Label>
            <Input value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} />
          </div>
        <div className="space-y-2">
          <Label>Năm</Label>
          <Input type="number" value={releaseYear} onChange={(e) => setReleaseYear(e.target.value)} />
        </div>
        </div>
        <div className="space-y-2">
          <Label>Giá bán (VND)</Label>
          <Input
            type="number"
            min={0}
            placeholder="Để trống hoặc 0 = xem miễn phí"
            value={listingPriceVnd}
            onChange={(e) => setListingPriceVnd(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            M8b: đặt giá để người xem phải mua trước khi stream. Hoa hồng nền tảng theo cấu hình API.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Trạng thái</Label>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="draft">draft</option>
            <option value="processing">processing</option>
            <option value="published">published</option>
            <option value="rejected">rejected</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>Thể loại</Label>
          <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto border rounded-md p-3">
            {genres.map((g) => (
              <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={genrePick.has(g.id)}
                  onChange={() => {
                    setGenrePick((prev) => {
                      const n = new Set(prev)
                      if (n.has(g.id)) n.delete(g.id)
                      else n.add(g.id)
                      return n
                    })
                  }}
                />
                {g.name}
              </label>
            ))}
          </div>
        </div>
        <div className="flex justify-between gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/user/my-movies">Huỷ</Link>
          </Button>
          <Button type="submit">Lưu</Button>
        </div>
      </form>

      <div className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold">Tập phim — xem lại &amp; media (M4b)</h2>
        <p className="text-sm text-muted-foreground">
          Preview stream khi bạn là chủ phim (kể cả draft). Cắt video, poster từ frame và upload phụ đề .vtt cần R2 +
          ffmpeg trên server.
        </p>
        {mediaNote && (
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">{mediaNote}</div>
        )}
        <div className="space-y-6">
          {detail.chapters.map((ch) => (
            <div key={ch.id} className="rounded-xl border bg-card p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-medium">{ch.title}</h3>
                <span className="text-xs text-muted-foreground">
                  {ch.videoSources
                    .map(
                      (v) =>
                        `${v.quality}: ${v.status}${
                          v.extraStreamEndpointCount ? ` (+${v.extraStreamEndpointCount} mirror)` : ""
                        }`
                    )
                    .join(" · ") || "Chưa có nguồn"}
                </span>
              </div>
              {ch.videoSources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Điểm phát dự phòng (mirror / CDN — thử trước file gốc)
                  </p>
                  {ch.videoSources.map((v) => (
                    <StreamMirrorsEditor
                      key={v.id}
                      videoSource={v}
                      accessToken={accessToken}
                      onChanged={() => void reloadMovie()}
                    />
                  ))}
                </div>
              )}
              {chapterStreams[ch.id] ? (
                <video
                  key={chapterStreams[ch.id]}
                  className="w-full max-h-56 rounded-md bg-black"
                  src={chapterStreams[ch.id]}
                  controls
                  playsInline
                />
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center border rounded-md bg-muted/20">
                  {chapterStreamErr[ch.id] ?? "Đang tải preview…"}
                </p>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 rounded-lg border p-3">
                  <Label className="text-xs font-medium">Cắt video (giây)</Label>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-muted-foreground">Bắt đầu</span>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        value={trimByChapter[ch.id]?.start ?? ""}
                        onChange={(e) =>
                          setTrimByChapter((p) => ({
                            ...p,
                            [ch.id]: { ...p[ch.id], start: e.target.value, end: p[ch.id]?.end ?? "" },
                          }))
                        }
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-muted-foreground">Kết thúc</span>
                      <Input
                        type="number"
                        step="0.1"
                        min={0}
                        value={trimByChapter[ch.id]?.end ?? ""}
                        onChange={(e) =>
                          setTrimByChapter((p) => ({
                            ...p,
                            [ch.id]: { ...p[ch.id], end: e.target.value, start: p[ch.id]?.start ?? "" },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={mediaBusy === `trim-${ch.id}`}
                    onClick={() => applyChapterTrim(ch.id)}
                  >
                    Áp dụng cắt
                  </Button>
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <Label className="text-xs font-medium">Poster từ video (giây)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    value={posterSecByChapter[ch.id] ?? ""}
                    onChange={(e) =>
                      setPosterSecByChapter((p) => ({ ...p, [ch.id]: e.target.value }))
                    }
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={mediaBusy === `poster-${ch.id}`}
                    onClick={() => applyChapterPoster(ch.id)}
                  >
                    Lấy frame làm thumbnail
                  </Button>
                  {ch.thumbnailUrl && (
                    <p className="text-xs text-muted-foreground truncate">URL hiện tại: {ch.thumbnailUrl}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="text-xs font-medium">Phụ đề WebVTT (.vtt)</Label>
                <Input
                  type="file"
                  accept=".vtt,text/vtt"
                  disabled={mediaBusy === `vtt-${ch.id}`}
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null
                    e.target.value = ""
                    void uploadChapterVtt(ch.id, f)
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  {ch.hasSubtitles ? "Chapter đã có phụ đề trên storage." : "Chưa có phụ đề."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
