"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useAuth } from "@/contexts/auth-context"
import type { FriendUserDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

/**
 * Launcher chat nổi (M5): danh sách bạn từ API, mở /user/messages — không dùng mock.
 */
export function ChatSystem() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [open, setOpen] = useState(false)
  const [friends, setFriends] = useState<FriendUserDto[]>([])

  const loadFriends = useCallback(async () => {
    if (!accessToken) return
    const r = await fetch(`${API}/api/social/friends`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (r.ok) setFriends(await r.json())
  }, [accessToken])

  useEffect(() => {
    if (open && accessToken) void loadFriends()
  }, [open, accessToken, loadFriends])

  if (!user || !accessToken) return null

  if (!open) {
    return (
      <Button
        type="button"
        className="fixed bottom-4 right-4 z-40 h-12 w-12 rounded-full shadow-lg"
        onClick={() => setOpen(true)}
        aria-label="Mở chat nhanh"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-[min(100vw-2rem,20rem)] max-h-[min(420px,70vh)] flex-col rounded-lg border bg-card shadow-xl">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-medium">Chat nhanh</span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Trang tin nhắn đầy đủ">
            <Link href="/user/messages">
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setOpen(false)}
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-64 px-1 py-2">
        {friends.length === 0 ? (
          <p className="px-2 text-xs text-muted-foreground">
            Chưa có bạn bè. Thêm bạn tại{" "}
            <Link href="/user/friends" className="text-primary underline">
              Bạn bè
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-0.5">
            {friends.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    router.push(`/user/messages?with=${f.id}`)
                    setOpen(false)
                  }}
                >
                  {f.displayName}{" "}
                  <span className="text-muted-foreground">@{f.username}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
      <div className="border-t p-2">
        <Button variant="secondary" size="sm" className="w-full" asChild>
          <Link href="/user/messages">Mở tin nhắn đầy đủ</Link>
        </Button>
      </div>
    </div>
  )
}
