"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import type { NotificationDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export function NotificationBell() {
  const { accessToken } = useAuth()
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<NotificationDto[]>([])

  const load = useCallback(async () => {
    if (!accessToken) return
    const [cRes, nRes] = await Promise.all([
      fetch(`${API}/api/social/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`${API}/api/social/notifications`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ])
    if (cRes.ok) {
      const d = (await cRes.json()) as { count: number }
      setCount(d.count)
    }
    if (nRes.ok) setItems(await nRes.json())
  }, [accessToken])

  useEffect(() => {
    load()
    const t = setInterval(load, 30_000)
    return () => clearInterval(t)
  }, [load])

  if (!accessToken) return null

  async function markRead(id: string) {
    if (!accessToken) return
    await fetch(`${API}/api/social/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    load()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Thông báo">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] rounded-full bg-destructive text-[10px] text-white flex items-center justify-center px-1">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="px-3 py-4 text-sm text-muted-foreground">Chưa có thông báo.</div>
        ) : (
          items.slice(0, 12).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 whitespace-normal cursor-pointer"
              onClick={() => markRead(n.id)}
            >
              <span className="font-medium text-sm">{n.title}</span>
              <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuItem asChild>
          <Link href="/user/friends" className="cursor-pointer w-full">
            Bạn bè &amp; tin nhắn
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
