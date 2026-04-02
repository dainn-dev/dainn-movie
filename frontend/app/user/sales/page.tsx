"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { CreatorPayoutBalanceDto, CreatorSalesResponseDto, PayoutRequestItemDto } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`
}

export default function UserSalesPage() {
  const router = useRouter()
  const { accessToken } = useAuth()
  const [data, setData] = useState<CreatorSalesResponseDto | null>(null)
  const [payoutBal, setPayoutBal] = useState<CreatorPayoutBalanceDto | null>(null)
  const [payoutReqs, setPayoutReqs] = useState<PayoutRequestItemDto[]>([])
  const [payoutAmount, setPayoutAmount] = useState("")
  const [payoutBusy, setPayoutBusy] = useState(false)
  const [payoutErr, setPayoutErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)

  const loadPayout = useCallback(async () => {
    if (!accessToken) return
    setPayoutErr(null)
    try {
      const [br, rr] = await Promise.all([
        fetch(`${API}/api/purchases/payout-balance`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }),
        fetch(`${API}/api/purchases/payout-requests/me?limit=50`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          cache: "no-store",
        }),
      ])
      if (br.ok) setPayoutBal((await br.json()) as CreatorPayoutBalanceDto)
      if (rr.ok) setPayoutReqs((await rr.json()) as PayoutRequestItemDto[])
    } catch {
      setPayoutErr("Không tải được thông tin rút tiền.")
    }
  }, [accessToken])

  const load = useCallback(async () => {
    if (!accessToken) return
    setErr(null)
    setLoading(true)
    try {
      const r = await fetch(`${API}/api/purchases/sales?limit=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      })
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { message?: string }
        setErr(j.message ?? "Không tải được doanh thu.")
        return
      }
      setData((await r.json()) as CreatorSalesResponseDto)
      await loadPayout()
    } finally {
      setLoading(false)
    }
  }, [accessToken, loadPayout])

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login?next=/user/sales")
      return
    }
    void load()
  }, [accessToken, load, router])

  const s = data?.summary

  const submitPayout = async () => {
    if (!accessToken) return
    const n = parseInt(payoutAmount.replace(/\D/g, ""), 10)
    if (!Number.isFinite(n) || n < 1) {
      setPayoutErr("Nhập số tiền hợp lệ (VND).")
      return
    }
    setPayoutBusy(true)
    setPayoutErr(null)
    try {
      const r = await fetch(`${API}/api/purchases/payout-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amountVnd: n }),
      })
      const j = (await r.json().catch(() => ({}))) as { message?: string }
      if (!r.ok) {
        setPayoutErr(j.message ?? "Gửi yêu cầu thất bại.")
        return
      }
      setPayoutAmount("")
      await loadPayout()
    } finally {
      setPayoutBusy(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink-0">
          <UserSidebar activeItem="sales" />
        </aside>
        <main className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Doanh thu & đơn bán</h1>
            <p className="text-sm text-muted-foreground">
              Các đơn liên quan phim bạn đăng. API: <code className="text-xs bg-muted px-1 rounded">GET /api/purchases/sales</code>
            </p>
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}

          {loading ? (
            <p className="text-muted-foreground text-sm">Đang tải…</p>
          ) : s ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Đã bán (completed)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">{s.completedSalesCount}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Chờ thanh toán</CardTitle>
                  </CardHeader>
                  <CardContent className="text-2xl font-semibold tabular-nums">{s.pendingPurchasesCount}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Tổng thu (gross)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold tabular-nums">{formatVnd(Number(s.totalGrossVnd))}</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Thu cho bạn (ước tính net)</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xl font-semibold tabular-nums">
                    {formatVnd(Number(s.totalNetToCreatorVnd))}
                  </CardContent>
                </Card>
              </div>

              {payoutBal ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Rút tiền (payout)</CardTitle>
                    <p className="text-sm text-muted-foreground font-normal">
                      Khả dụng: <span className="font-medium tabular-nums">{formatVnd(Number(payoutBal.availableVnd))}</span>
                      {" · "}
                      Đã chi: {formatVnd(Number(payoutBal.paidOutVnd))}
                      {" · "}
                      Chờ duyệt: {formatVnd(Number(payoutBal.pendingReserveVnd))}
                      {" · "}
                      Tối thiểu mỗi lần: {formatVnd(payoutBal.minPayoutVnd)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {payoutErr && <p className="text-sm text-destructive">{payoutErr}</p>}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end max-w-md">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="payout-amt">Số tiền muốn rút (VND)</Label>
                        <Input
                          id="payout-amt"
                          inputMode="numeric"
                          placeholder="Ví dụ 500000"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          disabled={payoutBusy}
                        />
                      </div>
                      <Button type="button" onClick={() => void submitPayout()} disabled={payoutBusy}>
                        Gửi yêu cầu
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Một lúc chỉ một yêu cầu <code className="bg-muted px-1 rounded">pending</code>. Admin xử lý chuyển khoản
                      thủ công.
                    </p>
                    {payoutReqs.length > 0 ? (
                      <div className="overflow-x-auto border rounded-md">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Số tiền</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Ghi chú</TableHead>
                              <TableHead>Thời gian</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payoutReqs.map((pr) => (
                              <TableRow key={pr.id}>
                                <TableCell className="tabular-nums">{formatVnd(pr.amountVnd)}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{pr.status}</Badge>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{pr.adminNote ?? "—"}</TableCell>
                                <TableCell className="text-sm whitespace-nowrap">
                                  {new Date(pr.createdAt).toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}

              <div className="overflow-x-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phim</TableHead>
                      <TableHead>Người mua</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Net (ước tính)</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thời gian</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {!data.items.length ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          Chưa có đơn
                        </TableCell>
                      </TableRow>
                    ) : (
                      data.items.map((row) => (
                        <TableRow key={row.purchaseId}>
                          <TableCell>
                            <Link href={`/movies/${row.movieId}`} className="font-medium hover:underline">
                              {row.movieTitle}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">@{row.buyerUsername}</TableCell>
                          <TableCell className="tabular-nums">{formatVnd(row.amountVnd)}</TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">
                            {formatVnd(row.netToCreatorVnd)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{row.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(row.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}
        </main>
      </div>
    </div>
  )
}
