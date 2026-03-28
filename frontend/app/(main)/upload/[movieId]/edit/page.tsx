"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  const [genrePick, setGenrePick] = useState<Set<number>>(new Set())

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
        setGenrePick(new Set(m.genres.map((g) => g.id)))
      } catch {
        setError("Lỗi mạng.")
      } finally {
        setLoading(false)
      }
    })()
  }, [movieId, accessToken, user, router])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken) return
    setError(null)
    const year = releaseYear ? parseInt(releaseYear, 10) : null
    const body = {
      title: title.trim(),
      description: description.trim() || null,
      posterUrl: posterUrl.trim() || null,
      releaseYear: Number.isFinite(year) ? year : null,
      status,
      genreIds: [...genrePick],
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
    </div>
  )
}
