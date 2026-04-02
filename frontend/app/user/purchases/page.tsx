"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { PurchaseListItemDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`
}

export default function UserPurchasesPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [items, setItems] = useState<PurchaseListItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setErr(null)
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/purchases/me?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      })
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { message?: string }
        setErr(j.message ?? "Không tải được đơn mua.")
        return
      }
      setItems((await r.json()) as PurchaseListItemDto[])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login?next=/user/purchases")
      return
    }
    void load()
  }, [accessToken, load, router])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <UserSidebar activeItem="purchases" />
        </aside>
        <main className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Đơn mua của tôi</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Trạng thái đơn chờ thanh toán / đã mua. Chi tiết:{" "}
            <code className="text-xs bg-muted px-1 rounded">GET /api/purchases/{"{id}"}</code>
          </p>
          {err && <p className="text-sm text-destructive mb-4">{err}</p>}
          {loading ? (
            <p className="text-muted-foreground text-sm">Đang tải…</p>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phim</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                        Chưa có đơn nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          <Link href={`/movies/${row.movieId}`} className="hover:underline">
                            {row.movieTitle}
                          </Link>
                        </TableCell>
                        <TableCell className="tabular-nums">{formatVnd(row.amountVnd)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.status}</Badge>
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {new Date(row.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/movies/${row.movieId}`}>Xem phim</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
