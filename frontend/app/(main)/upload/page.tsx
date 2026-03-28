"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useAuth } from "@/contexts/auth-context"
import type {
  CelebrityListDto,
  GenreDto,
  PagedResult,
  VideoConfirmRequest,
  VideoPresignRequest,
  VideoSourceInfoDto,
} from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""
const DRAFT_KEY = "moviesocial_upload_draft_v1"

type Draft = {
  movieId: string
  chapterId: string
  title: string
  step: number
}

function guessVideoMime(filename: string): string {
  const f = filename.toLowerCase()
  if (f.endsWith(".mp4")) return "video/mp4"
  if (f.endsWith(".mov")) return "video/quicktime"
  if (f.endsWith(".avi")) return "video/x-msvideo"
  if (f.endsWith(".mkv")) return "video/x-matroska"
  return "video/mp4"
}

const TRIM_EPS = 0.35

async function waitForChapterVideoReady(
  chapterId: string,
  opts?: { maxMs?: number; intervalMs?: number }
): Promise<boolean> {
  const maxMs = opts?.maxMs ?? 120_000
  const intervalMs = opts?.intervalMs ?? 1500
  const deadline = Date.now() + maxMs
  while (Date.now() < deadline) {
    const r = await fetch(`${API}/api/chapters/${chapterId}/sources`)
    if (r.ok) {
      const list = (await r.json()) as VideoSourceInfoDto[]
      if (list.some((s) => s.status === "ready")) return true
    }
    await new Promise((res) => setTimeout(res, intervalMs))
  }
  return false
}

export default function UploadPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [posterUrl, setPosterUrl] = useState("")
  const [releaseYear, setReleaseYear] = useState("")
  const [genres, setGenres] = useState<GenreDto[]>([])
  const [genrePick, setGenrePick] = useState<Set<number>>(new Set())

  const [movieId, setMovieId] = useState<string | null>(null)
  const [chapterId, setChapterId] = useState<string | null>(null)

  const [celebrityQ, setCelebrityQ] = useState("")
  const [celebrityHits, setCelebrityHits] = useState<CelebrityListDto[]>([])
  const [castAdded, setCastAdded] = useState<string[]>([])

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [mediaMeta, setMediaMeta] = useState<{
    duration: number
    width: number
    height: number
  } | null>(null)
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 0])
  const [uploadPct, setUploadPct] = useState<number | null>(null)
  const [videoStatus, setVideoStatus] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    if (!user || !accessToken) {
      router.replace("/login?next=/upload")
    }
  }, [ready, user, accessToken, router])

  useEffect(() => {
    if (!accessToken) return
    ;(async () => {
      try {
        const res = await fetch(`${API}/api/movies/genres`)
        if (res.ok) setGenres(await res.json())
      } catch {
        /* ignore */
      }
    })()
  }, [accessToken])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const d = JSON.parse(raw) as Draft
      if (d.movieId) setMovieId(d.movieId)
      if (d.chapterId) setChapterId(d.chapterId)
      if (d.title) setTitle(d.title)
      if (typeof d.step === "number") setStep(Math.min(d.step, 3))
    } catch {
      /* ignore */
    }
  }, [])

  const persistDraft = useCallback(
    (patch: Partial<Draft>) => {
      try {
        const cur: Draft = {
          movieId: patch.movieId ?? movieId ?? "",
          chapterId: patch.chapterId ?? chapterId ?? "",
          title: patch.title ?? title,
          step: patch.step ?? step,
        }
        localStorage.setItem(DRAFT_KEY, JSON.stringify(cur))
      } catch {
        /* ignore */
      }
    },
    [movieId, chapterId, title, step]
  )

  const authJson = useMemo(
    () => ({
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    }),
    [accessToken]
  )

  const searchCelebrities = useCallback(
    async (q: string) => {
      if (!accessToken || q.trim().length < 2) {
        setCelebrityHits([])
        return
      }
      const res = await fetch(
        `${API}/api/celebrities?q=${encodeURIComponent(q.trim())}&page=1&pageSize=12`
      )
      if (!res.ok) return
      const data = (await res.json()) as PagedResult<CelebrityListDto>
      setCelebrityHits(data.data)
    },
    [accessToken]
  )

  useEffect(() => {
    const id = setTimeout(() => searchCelebrities(celebrityQ), 320)
    return () => clearTimeout(id)
  }, [celebrityQ, searchCelebrities])

  useEffect(() => {
    if (!videoFile) {
      setPreviewUrl(null)
      setMediaMeta(null)
      setTrimRange([0, 0])
      return
    }
    const url = URL.createObjectURL(videoFile)
    setPreviewUrl(url)
    const el = document.createElement("video")
    el.preload = "metadata"
    el.muted = true
    const onMeta = () => {
      const d = el.duration
      if (Number.isFinite(d) && d > 0) {
        setMediaMeta({
          duration: d,
          width: el.videoWidth,
          height: el.videoHeight,
        })
        setTrimRange([0, d])
      }
    }
    el.addEventListener("loadedmetadata", onMeta)
    el.src = url
    el.load()
    return () => {
      el.removeEventListener("loadedmetadata", onMeta)
      URL.revokeObjectURL(url)
    }
  }, [videoFile])

  async function submitInfo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!accessToken) return
    const year = releaseYear ? parseInt(releaseYear, 10) : null
    const body = {
      title: title.trim(),
      description: description.trim() || null,
      posterUrl: posterUrl.trim() || null,
      backdropUrl: null,
      trailerUrl: null,
      releaseYear: Number.isFinite(year) ? year : null,
      runtimeMinutes: null,
      mpaaRating: null,
      genreIds: [...genrePick],
    }
    const res = await fetch(`${API}/api/movies`, {
      method: "POST",
      headers: authJson,
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Không tạo được phim.")
      return
    }
    const created = (await res.json()) as { id: string }
    setMovieId(created.id)

    const chRes = await fetch(`${API}/api/movies/${created.id}/chapters`, {
      method: "POST",
      headers: authJson,
      body: JSON.stringify({
        title: "Tập 1",
        order: 1,
        durationSeconds: null,
        thumbnailUrl: null,
      }),
    })
    if (!chRes.ok) {
      const j = await chRes.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Không tạo chapter.")
      return
    }
    const ch = (await chRes.json()) as { id: string }
    setChapterId(ch.id)
    setStep(1)
    persistDraft({ movieId: created.id, chapterId: ch.id, step: 1, title })
  }

  async function addCast(c: CelebrityListDto, role: string) {
    if (!accessToken || !movieId) return
    setError(null)
    const res = await fetch(`${API}/api/movies/${movieId}/cast`, {
      method: "POST",
      headers: authJson,
      body: JSON.stringify({
        celebrityId: c.id,
        role,
        characterName: null,
        order: castAdded.length,
      }),
    })
    if (!res.ok && res.status !== 204) {
      const j = await res.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Không thêm được cast.")
      return
    }
    setCastAdded((x) => [...x, `${c.name} (${role})`])
  }

  async function uploadVideo(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!accessToken || !movieId || !chapterId || !videoFile) {
      setError("Chọn file video.")
      return
    }
    const contentType = videoFile.type || guessVideoMime(videoFile.name)
    const presignBody: VideoPresignRequest = {
      movieId,
      chapterId,
      filename: videoFile.name,
      contentType,
    }
    const pr = await fetch(`${API}/api/videos/presigned-url`, {
      method: "POST",
      headers: authJson,
      body: JSON.stringify(presignBody),
    })
    if (!pr.ok) {
      const j = await pr.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Không lấy được URL upload (cần cấu hình R2).")
      return
    }
    const { url, key } = (await pr.json()) as { url: string; key: string }

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", url)
        xhr.setRequestHeader("Content-Type", contentType)
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setUploadPct(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload HTTP ${xhr.status}`))
        }
        xhr.onerror = () => reject(new Error("Network error"))
        xhr.send(videoFile)
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload thất bại.")
      return
    }

    const confirmBody: VideoConfirmRequest = {
      movieId,
      chapterId,
      key,
      fileSizeBytes: videoFile.size,
      contentType,
    }
    const cf = await fetch(`${API}/api/videos/confirm-upload`, {
      method: "POST",
      headers: authJson,
      body: JSON.stringify(confirmBody),
    })
    if (!cf.ok) {
      const j = await cf.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Xác nhận upload thất bại.")
      return
    }

    const [t0, t1] = trimRange
    const dur = mediaMeta?.duration
    const wantsTrim =
      dur != null &&
      dur > TRIM_EPS &&
      (t0 > TRIM_EPS || t1 < dur - TRIM_EPS)

    if (wantsTrim) {
      setVideoStatus("Đang chờ video sẵn sàng để cắt theo khoảng đã chọn…")
      const ready = await waitForChapterVideoReady(chapterId)
      if (!ready) {
        setVideoStatus(
          "Đã upload. Video chưa sẵn sàng kịp để cắt tự động — vào Sửa phim để cắt sau (M4b)."
        )
        setStep(3)
        persistDraft({ step: 3 })
        return
      }
      const tr = await fetch(`${API}/api/chapters/${chapterId}/trim`, {
        method: "POST",
        headers: authJson,
        body: JSON.stringify({ startSeconds: t0, endSeconds: t1 }),
      })
      if (!tr.ok) {
        const j = await tr.json().catch(() => ({}))
        setVideoStatus(
          `Đã upload. Cắt video thất bại: ${(j as { message?: string }).message ?? tr.status}. Mở Sửa phim để thử lại.`
        )
        setStep(3)
        persistDraft({ step: 3 })
        return
      }
      setVideoStatus("Đã upload và cắt xong — đang / đã xử lý transcode.")
    } else {
      setVideoStatus("Đã tải lên — đang xử lý (transcode stub).")
    }
    setStep(3)
    persistDraft({ step: 3 })
  }

  async function publish() {
    if (!accessToken || !movieId) return
    setError(null)
    const res = await fetch(`${API}/api/movies/${movieId}`, {
      method: "PUT",
      headers: authJson,
      body: JSON.stringify({ status: "published" }),
    })
    if (!res.ok) {
      const j = await res.json().catch(() => ({}))
      setError((j as { message?: string }).message ?? "Không xuất bản được.")
      return
    }
    localStorage.removeItem(DRAFT_KEY)
    router.push(`/movies/${movieId}`)
  }

  if (!ready || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Đang kiểm tra phiên đăng nhập…
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Đăng phim mới</h1>
        <p className="text-muted-foreground mt-1">
          Các bước: thông tin → cast (tuỳ chọn) → upload video → xuất bản
        </p>
        <div className="flex gap-2 mt-4">
          {[0, 1, 2, 3].map((s) => (
            <Badge key={s} variant={step === s ? "default" : "outline"}>
              {s === 0 ? "Thông tin" : s === 1 ? "Cast" : s === 2 ? "Video" : "Hoàn tất"}
            </Badge>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 0 && (
        <form onSubmit={submitInfo} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title">Tiêu đề</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Mô tả</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poster">URL poster (tuỳ chọn)</Label>
              <Input id="poster" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Năm phát hành</Label>
              <Input
                id="year"
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(e.target.value)}
                placeholder="2026"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Thể loại</Label>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
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
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/user/my-movies">Huỷ</Link>
            </Button>
            <Button type="submit">Tiếp — tạo phim &amp; chapter</Button>
          </div>
        </form>
      )}

      {step === 1 && (
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <Label>Tìm diễn viên / đạo diễn (tuỳ chọn)</Label>
            <Input
              className="mt-2"
              placeholder="Gõ tên..."
              value={celebrityQ}
              onChange={(e) => setCelebrityQ(e.target.value)}
            />
            <div className="mt-3 grid gap-2">
              {celebrityHits.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                >
                  <span>{c.name}</span>
                  <div className="flex gap-1">
                    <Button type="button" size="sm" variant="secondary" onClick={() => addCast(c, "actor")}>
                      + Diễn viên
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => addCast(c, "director")}>
                      + Đạo diễn
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {castAdded.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Đã thêm</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {castAdded.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Quay lại
            </Button>
            <Button type="button" onClick={() => { setStep(2); persistDraft({ step: 2 }) }}>
              Bỏ qua / Tiếp tới video
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={uploadVideo} className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <Label>File video (MP4, MOV, AVI, MKV)</Label>
            <Input
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mkv"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Xem lại tại chỗ, kéo điểm đầu/cuối để cắt (M4b). Cần R2 + ffmpeg trên API để cắt trên server.
            </p>
          </div>
          {previewUrl && (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
              <video
                key={previewUrl}
                className="w-full max-h-[320px] rounded-md bg-black"
                src={previewUrl}
                controls
                playsInline
              />
              {mediaMeta && mediaMeta.duration > 0 && (
                <>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(mediaMeta.width)}×{Math.round(mediaMeta.height)} ·{" "}
                    {mediaMeta.duration.toFixed(1)}s
                  </p>
                  <div className="space-y-2">
                    <Label className="text-xs">Khoảng giữ lại (giây)</Label>
                    <Slider
                      min={0}
                      max={mediaMeta.duration}
                      step={0.1}
                      value={trimRange}
                      onValueChange={(v) => {
                        const a = v[0] ?? 0
                        const b = v[1] ?? mediaMeta.duration
                        setTrimRange(a <= b ? [a, b] : [b, a])
                      }}
                    />
                    <p className="text-xs tabular-nums">
                      Bắt đầu {trimRange[0].toFixed(1)}s — Kết thúc {trimRange[1].toFixed(1)}s (độ dài{" "}
                      {(trimRange[1] - trimRange[0]).toFixed(1)}s)
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          {uploadPct !== null && <Progress value={uploadPct} className="h-2" />}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Quay lại
            </Button>
            <Button type="submit" disabled={!videoFile}>
              Upload
            </Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">{videoStatus ?? "Hoàn tất upload."}</p>
          <p className="text-sm">
            Bạn có thể chỉnh sửa metadata trước khi xuất bản:{" "}
            {movieId && (
              <Link href={`/upload/${movieId}/edit`} className="text-primary underline">
                Sửa phim
              </Link>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" asChild>
              <Link href="/user/my-movies">Danh sách phim của tôi</Link>
            </Button>
            <Button type="button" onClick={publish}>
              Xuất bản ngay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
