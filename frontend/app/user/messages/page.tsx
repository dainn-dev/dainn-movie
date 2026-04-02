"use client"

import * as signalR from "@microsoft/signalr"
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { FriendUserDto, MessageDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Đang tải…</div>
      }
    >
      <MessagesInner />
    </Suspense>
  )
}

function MessagesInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const withId = searchParams.get("with")
  const { accessToken, user } = useAuth()
  const [friends, setFriends] = useState<FriendUserDto[]>([])
  const [peerId, setPeerId] = useState<string | null>(withId)
  const [messages, setMessages] = useState<MessageDto[]>([])
  const [body, setBody] = useState("")
  const peer = useMemo(() => friends.find((f) => f.id === peerId), [friends, peerId])
  const peerIdRef = useRef(peerId)
  const userIdRef = useRef(user?.id)
  useEffect(() => {
    peerIdRef.current = peerId
  }, [peerId])
  useEffect(() => {
    userIdRef.current = user?.id
  }, [user?.id])

  /** Luôn trỏ JWT mới nhất — M1a / DAI-116: reconnect SignalR dùng token sau silent refresh, không cắt hub mỗi lần rotate. */
  const accessTokenRef = useRef<string | null>(null)
  accessTokenRef.current = accessToken

  const headers = useMemo(
    () =>
      accessToken
        ? { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
        : undefined,
    [accessToken]
  )

  const loadFriends = useCallback(async () => {
    if (!accessToken) return
    const r = await fetch(`${API}/api/social/friends`, { headers: { Authorization: `Bearer ${accessToken}` } })
    if (r.ok) setFriends(await r.json())
  }, [accessToken])

  const loadMessages = useCallback(async () => {
    if (!accessToken || !peerId) return
    const r = await fetch(`${API}/api/social/messages/${peerId}?page=1&pageSize=50`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!r.ok) return
    const p = (await r.json()) as PagedResult<MessageDto>
    setMessages(p.data)
    await fetch(`${API}/api/social/messages/${peerId}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
  }, [accessToken, peerId])

  useEffect(() => {
    if (!user) router.replace("/login?next=/user/messages")
  }, [user, router])

  useEffect(() => {
    loadFriends()
  }, [loadFriends])

  useEffect(() => {
    if (withId) setPeerId(withId)
  }, [withId])

  useEffect(() => {
    loadMessages()
  }, [loadMessages])

  const hasAccessToken = Boolean(accessToken)

  useEffect(() => {
    if (!user?.id || !API) return
    if (!accessToken) return

    const base = API.replace(/\/$/, "")
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${base}/hubs/chat`, {
        accessTokenFactory: () => {
          const t = accessTokenRef.current
          if (!t) return Promise.reject(new Error("missing_access_token"))
          return Promise.resolve(t)
        },
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .build()

    conn.on("message", (raw: unknown) => {
      const m = raw as MessageDto
      const peer = peerIdRef.current
      const me = userIdRef.current
      if (!peer || !me) return
      const inThread =
        (m.senderId === peer && m.receiverId === me) || (m.senderId === me && m.receiverId === peer)
      if (!inThread) return
      setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
    })

    void conn.start().catch(() => {})

    return () => {
      void conn.stop()
    }
    // Chỉ khởi tạo lại khi đổi user hoặc có/không token (đăng xuất); không phụ thuộc chuỗi JWT từng lần refresh (dùng accessTokenRef).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- accessToken omitted: silent refresh không nên reconnect hub
  }, [user?.id, hasAccessToken])

  async function send() {
    if (!accessToken || !peerId || !body.trim()) return
    const r = await fetch(`${API}/api/social/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ receiverId: peerId, body: body.trim() }),
    })
    if (r.ok) {
      setBody("")
      loadMessages()
    }
  }

  return (
    <div>
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Tin nhắn</h1>
          <p className="text-sm text-white/70 mt-2">
            <Link href="/user/friends" className="hover:underline">
              Bạn bè
            </Link>
            <span className="mx-2">•</span>
            Chat
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <UserSidebar activeItem="messages" />
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-3 h-[420px] overflow-y-auto bg-card">
              <h2 className="text-sm font-semibold mb-2">Bạn bè</h2>
              {friends.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`w-full text-left px-2 py-2 rounded text-sm mb-1 ${
                    peerId === f.id ? "bg-muted" : "hover:bg-muted/60"
                  }`}
                  onClick={() => {
                    setPeerId(f.id)
                    router.replace(`/user/messages?with=${f.id}`, { scroll: false })
                  }}
                >
                  {f.displayName}
                </button>
              ))}
            </div>
            <div className="md:col-span-2 border rounded-lg flex flex-col h-[420px] bg-card">
              {!peerId ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground p-4">
                  Chọn một bạn để nhắn tin.
                </div>
              ) : (
                <>
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    {peer ? `${peer.displayName} (@${peer.username})` : "Đang tải…"}
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
                    {messages.map((m) => {
                      const mine = m.senderId === user?.id
                      return (
                        <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 ${mine ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
                          {m.body}
                          <div className="text-[10px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="border-t p-2 flex gap-2">
                    <Textarea
                      className="min-h-[44px] resize-none"
                      placeholder="Nhập tin…"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                    />
                    <Button type="button" onClick={send}>
                      Gửi
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
