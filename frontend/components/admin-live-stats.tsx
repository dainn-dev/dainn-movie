"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, FileText, Users, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { AdminStatsDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

export function AdminLiveStats() {
  const { accessToken } = useAuth()
  const [stats, setStats] = useState<AdminStatsDto | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken) return
    ;(async () => {
      const r = await fetch(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!r.ok) {
        setErr(r.status === 403 ? "Cần quyền admin." : `Lỗi ${r.status}`)
        return
      }
      setStats(await r.json())
      setErr(null)
    })()
  }, [accessToken])

  if (!accessToken) return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để xem thống kê thật.</p>
  if (err) return <p className="text-sm text-destructive">{err}</p>
  if (!stats) return <p className="text-sm text-muted-foreground">Đang tải thống kê…</p>

  const cards = [
    { title: "Users (active)", value: stats.activeUsers, sub: `Total ${stats.users}`, icon: Users },
    { title: "Movies", value: stats.publishedMovies, sub: `${stats.pendingMovies} pending`, icon: Film },
    { title: "News", value: stats.news, sub: "articles", icon: FileText },
    { title: "Celebrities", value: stats.celebrities, sub: `${stats.pendingReports} reports`, icon: User },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => (
        <Card key={c.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
            <c.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{c.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
