"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import {
  hasBrowserPushSubscription,
  pushSupported,
  subscribeWebPush,
  unsubscribeWebPush,
} from "@/lib/push-notifications"
import type { NotificationDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function NotificationsPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [items, setItems] = useState<NotificationDto[]>([])
  const [loading, setLoading] = useState(true)
  const [pushOn, setPushOn] = useState(false)
  const [pushBusy, setPushBusy] = useState(false)
  const [pushNote, setPushNote] = useState<string | null>(null)

  const headers = useCallback(
    () =>
      accessToken
        ? { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
        : null,
    [accessToken]
  )

  const load = useCallback(async () => {
    const h = headers()
    if (!h) return
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/social/notifications`, { headers: h })
      if (r.ok) setItems(await r.json())
      else setItems([])
    } finally {
      setLoading(false)
    }
  }, [headers])

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/user/notifications")
      return
    }
    load()
  }, [user, load, router])

  useEffect(() => {
    if (!user) return
    let cancel = false
    ;(async () => {
      if (!pushSupported()) return
      const on = await hasBrowserPushSubscription()
      if (!cancel) setPushOn(on)
    })()
    return () => {
      cancel = true
    }
  }, [user])

  function newEpisodeWatchPath(n: NotificationDto): string | null {
    if (n.type !== "new_episode") return null
    if (!n.referenceMovieId || !n.referenceId) return null
    return `/watch/${n.referenceMovieId}/${n.referenceId}`
  }

  async function markRead(id: string) {
    const h = headers()
    if (!h) return
    await fetch(`${API}/api/social/notifications/${id}/read`, { method: "POST", headers: h })
    load()
  }

  async function markAll() {
    const h = headers()
    if (!h) return
    await fetch(`${API}/api/social/notifications/read-all`, { method: "POST", headers: h })
    load()
  }

  async function enableBrowserPush() {
    if (!accessToken) return
    setPushBusy(true)
    setPushNote(null)
    const r = await subscribeWebPush(accessToken)
    setPushBusy(false)
    if (r.ok) setPushOn(true)
    else setPushNote(r.message ?? "Không bật được thông báo trình duyệt.")
  }

  async function disableBrowserPush() {
    if (!accessToken) return
    setPushBusy(true)
    setPushNote(null)
    try {
      await unsubscribeWebPush(accessToken)
      setPushOn(false)
    } finally {
      setPushBusy(false)
    }
  }

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
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Thông báo</h1>
            <p className="text-sm text-white/70 mt-2">
              <Link href="/" className="hover:underline">
                Trang chủ
              </Link>
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            onClick={() => markAll()}
          >
            Đánh dấu đọc hết
          </Button>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <UserSidebar activeItem="notifications" />
          </div>
          <div className="md:col-span-3 space-y-3">
            {pushSupported() ? (
              <div className="rounded-lg border border-border bg-card p-4 mb-6">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Thông báo trình duyệt (Web Push)
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Nhận push khi có tập mới (cùng quy tắc với thông báo trong app). Cần HTTPS hoặc localhost.
                </p>
                {pushNote ? <p className="text-xs text-destructive mt-2">{pushNote}</p> : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {pushOn ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pushBusy}
                      onClick={() => void disableBrowserPush()}
                    >
                      <BellOff className="mr-2 h-4 w-4" />
                      {pushBusy ? "Đang tắt…" : "Tắt trên thiết bị này"}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      disabled={pushBusy}
                      onClick={() => void enableBrowserPush()}
                    >
                      <Bell className="mr-2 h-4 w-4" />
                      {pushBusy ? "Đang bật…" : "Bật thông báo trình duyệt"}
                    </Button>
                  )}
                </div>
              </div>
            ) : null}
            {loading ? (
              <p className="text-sm text-muted-foreground">Đang tải…</p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có thông báo.</p>
            ) : (
              <ul className="space-y-2">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`rounded-lg border p-4 cursor-pointer transition-colors ${
                      n.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
                    }`}
                    onClick={() => {
                      const path = newEpisodeWatchPath(n)
                      if (!n.isRead) void markRead(n.id)
                      if (path) router.push(path)
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-sm">{n.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(n.createdAt).toLocaleString()} · {n.type}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="shrink-0 h-2 w-2 rounded-full bg-primary" title="Chưa đọc" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="pt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/user/friends">Bạn bè &amp; tin nhắn</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
