"use client"

import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { adminFetch } from "@/lib/admin-fetch"
import type { AdminPayoutRowDto, PagedResult } from "@/types/api"

const PAGE_SIZE = 15

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`
}

export function AdminPayoutsPanel() {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rows, setRows] = useState<AdminPayoutRowDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoadErr(null)
    setBusy(true)
    try {
      const res = await adminFetch<PagedResult<AdminPayoutRowDto>>(
        `/api/admin/payout-requests?page=${page}&pageSize=${PAGE_SIZE}`,
        accessToken
      )
      if (!res.ok) {
        setLoadErr(res.status === 403 ? "Cần quyền admin." : res.message)
        return
      }
      setRows(res.data.data)
      setTotalPages(Math.max(1, res.data.pagination.totalPages))
    } finally {
      setBusy(false)
    }
  }, [accessToken, page])

  useEffect(() => {
    void load()
  }, [load])

  const resolveRow = async (id: string, paid: boolean) => {
    if (!accessToken) return
    const note = paid
      ? window.prompt("Ghi chú (tùy chọn), ví dụ mã CK:", "") ?? ""
      : window.prompt("Lý do từ chối:", "") ?? ""
    const res = await adminFetch<unknown>(`/api/admin/payout-requests/${id}/resolve`, accessToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paid, note: note.trim() || null }),
    })
    if (!res.ok) {
      window.alert(res.message)
      return
    }
    void load()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => void load()}>
          <RefreshCw className={`h-4 w-4 mr-1 ${busy ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
        <span className="text-sm text-muted-foreground">
          API: GET /api/admin/payout-requests, POST …/resolve {"{ paid, note }"}
        </span>
      </div>
      {loadErr && <p className="text-sm text-destructive">{loadErr}</p>}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Tạo lúc</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!rows.length ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Chưa có yêu cầu
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">@{row.username}</TableCell>
                  <TableCell className="tabular-nums">{formatVnd(row.amountVnd)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {new Date(row.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {row.adminNote ?? "—"}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {row.status === "pending" ? (
                      <>
                        <Button type="button" size="sm" variant="default" onClick={() => void resolveRow(row.id, true)}>
                          Đã chuyển
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => void resolveRow(row.id, false)}>
                          Từ chối
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1 || busy} onClick={() => setPage((p) => p - 1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Trang {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= totalPages || busy}
          onClick={() => setPage((p) => p + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
