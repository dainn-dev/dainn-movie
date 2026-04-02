"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StreamEndpointDto, VideoSourceInfoDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export function StreamMirrorsEditor({
  videoSource,
  accessToken,
  onChanged,
}: {
  videoSource: VideoSourceInfoDto
  accessToken: string | null
  onChanged: () => void
}) {
  const [items, setItems] = useState<StreamEndpointDto[]>([])
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [sortOrder, setSortOrder] = useState("0")
  const [r2Key, setR2Key] = useState("")
  const [directUrl, setDirectUrl] = useState("")
  const [note, setNote] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setNote(null)
    try {
      const r = await fetch(`${API}/api/videos/video-sources/${videoSource.id}/stream-endpoints`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (r.ok) setItems(await r.json())
      else setItems([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, videoSource.id])

  useEffect(() => {
    void load()
  }, [load])

  async function addMirror() {
    if (!accessToken) return
    const sort = parseInt(sortOrder, 10)
    const body = {
      sortOrder: Number.isFinite(sort) ? sort : 0,
      r2Key: r2Key.trim() || null,
      directUrl: directUrl.trim() || null,
    }
    if (!body.r2Key && !body.directUrl) {
      setNote("Điền R2 key hoặc URL trực tiếp.")
      return
    }
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${API}/api/videos/video-sources/${videoSource.id}/stream-endpoints`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setNote((j as { message?: string }).message ?? "Thêm thất bại.")
        return
      }
      setR2Key("")
      setDirectUrl("")
      await load()
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  async function removeMirror(id: string) {
    if (!accessToken) return
    setBusy(true)
    setNote(null)
    try {
      const r = await fetch(`${API}/api/videos/video-sources/stream-endpoints/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setNote((j as { message?: string }).message ?? "Xoá thất bại.")
        return
      }
      await load()
      onChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-lg border border-dashed p-3 space-y-2 bg-muted/10">
      <p className="text-xs font-medium">
        Chất lượng {videoSource.quality} ({videoSource.status}) — mirror / URL dự phòng
      </p>
      <p className="text-[11px] text-muted-foreground">
        Khi phát, BE thử lần lượt các điểm dưới (sortOrder nhỏ trước), rồi mới dùng file gốc của nguồn này.
      </p>
      {note && <p className="text-xs text-destructive">{note}</p>}
      {loading ? (
        <p className="text-xs text-muted-foreground">Đang tải danh sách…</p>
      ) : items.length === 0 ? (
        <p className="text-xs text-muted-foreground">Chưa có điểm phát thêm.</p>
      ) : (
        <ul className="space-y-1 text-xs">
          {items.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 border rounded px-2 py-1">
              <span className="text-muted-foreground">#{e.sortOrder}</span>
              <span className="truncate max-w-[200px] font-mono">
                {e.directUrl ?? e.r2Key ?? "—"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-destructive"
                disabled={busy}
                onClick={() => void removeMirror(e.id)}
              >
                Xoá
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid gap-2 sm:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-[11px]">Sort</Label>
          <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-8 text-xs" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-[11px]">R2 object key (tuỳ chọn)</Label>
          <Input
            value={r2Key}
            onChange={(e) => setR2Key(e.target.value)}
            placeholder="videos/…/file.mp4"
            className="h-8 text-xs font-mono"
          />
        </div>
        <div className="space-y-1 sm:col-span-3">
          <Label className="text-[11px]">Hoặc URL trực tiếp (CDN)</Label>
          <Input
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="https://…"
            className="h-8 text-xs"
          />
        </div>
      </div>
      <Button type="button" size="sm" variant="secondary" disabled={busy || !accessToken} onClick={() => void addMirror()}>
        Thêm điểm phát
      </Button>
    </div>
  )
}
