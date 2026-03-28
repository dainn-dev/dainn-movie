"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { FriendRequestDto, FriendUserDto, UserSearchResultDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function FriendsPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [friends, setFriends] = useState<FriendUserDto[]>([])
  const [incoming, setIncoming] = useState<FriendRequestDto[]>([])
  const [q, setQ] = useState("")
  const [hits, setHits] = useState<UserSearchResultDto[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined

  const load = useCallback(async () => {
    if (!accessToken) return
    const [f, i] = await Promise.all([
      fetch(`${API}/api/social/friends`, { headers }),
      fetch(`${API}/api/social/friend-requests/incoming`, { headers }),
    ])
    if (f.ok) setFriends(await f.json())
    if (i.ok) setIncoming(await i.json())
  }, [accessToken, headers])

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/user/friends")
      return
    }
    load()
  }, [user, load, router])

  useEffect(() => {
    if (!accessToken || q.trim().length < 2) {
      setHits([])
      return
    }
    const t = setTimeout(async () => {
      const r = await fetch(`${API}/api/social/users/search?q=${encodeURIComponent(q.trim())}`, { headers })
      if (r.ok) setHits(await r.json())
    }, 300)
    return () => clearTimeout(t)
  }, [q, accessToken, headers])

  async function sendRequest(username: string) {
    setMsg(null)
    const r = await fetch(`${API}/api/social/friend-requests`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ receiverUsername: username }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setMsg((j as { message?: string }).message ?? "Lỗi")
      return
    }
    setMsg("Đã gửi lời mời.")
    setQ("")
    setHits([])
  }

  async function accept(id: string) {
    await fetch(`${API}/api/social/friend-requests/${id}/accept`, { method: "POST", headers })
    load()
  }

  async function reject(id: string) {
    await fetch(`${API}/api/social/friend-requests/${id}/reject`, { method: "POST", headers })
    load()
  }

  async function unfriend(id: string) {
    await fetch(`${API}/api/social/friends/${id}`, { method: "DELETE", headers })
    load()
  }

  return (
    <div>
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Bạn bè</h1>
          <p className="text-sm text-white/70 mt-2">
            <Link href="/" className="hover:underline">
              Trang chủ
            </Link>
            <span className="mx-2">•</span>
            Bạn bè
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <UserSidebar activeItem="profile" />
          </div>
          <div className="md:col-span-3 space-y-8">
            {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Thêm bạn</h2>
              <Input placeholder="Tìm username…" value={q} onChange={(e) => setQ(e.target.value)} />
              <ul className="mt-3 space-y-2">
                {hits.map((u) => (
                  <li key={u.id} className="flex items-center justify-between gap-2 text-sm border rounded px-3 py-2">
                    <span>
                      @{u.username} — {u.displayName}
                    </span>
                    <Button size="sm" variant="secondary" type="button" onClick={() => sendRequest(u.username)}>
                      Mời kết bạn
                    </Button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Lời mời nhận được</h2>
              {incoming.length === 0 ? (
                <p className="text-sm text-muted-foreground">Không có lời mời chờ.</p>
              ) : (
                <ul className="space-y-2">
                  {incoming.map((r) => (
                    <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 border rounded px-3 py-2 text-sm">
                      <span>
                        {r.senderDisplayName} <Badge variant="outline">@{r.senderUsername}</Badge>
                      </span>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => accept(r.id)}>
                          Chấp nhận
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => reject(r.id)}>
                          Từ chối
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-lg border bg-card p-6 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">Bạn bè</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/user/messages">Tin nhắn</Link>
                </Button>
              </div>
              {friends.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có bạn bè.</p>
              ) : (
                <ul className="space-y-2">
                  {friends.map((f) => (
                    <li key={f.id} className="flex items-center justify-between border rounded px-3 py-2 text-sm">
                      <Link href={`/u/${f.username}`} className="hover:underline">
                        {f.displayName} <span className="text-muted-foreground">@{f.username}</span>
                      </Link>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/user/messages?with=${f.id}`}>Nhắn tin</Link>
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => unfriend(f.id)}>
                          Xoá
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
