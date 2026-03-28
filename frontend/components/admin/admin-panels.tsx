"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { adminFetch } from "@/lib/admin-fetch"
import type {
  AdminPurchaseRowDto,
  AdminUserSummaryDto,
  ContentReportAdminDto,
  MovieSummaryDto,
  PagedResult,
} from "@/types/api"

function movieStatusBadge(status: string) {
  if (status === "published") return <Badge className="bg-green-500">Published</Badge>
  if (status === "processing")
    return (
      <Badge variant="outline" className="text-amber-600 border-amber-600">
        Processing
      </Badge>
    )
  if (status === "draft")
    return (
      <Badge variant="outline" className="text-yellow-600 border-yellow-600">
        Draft
      </Badge>
    )
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="outline">{status}</Badge>
}

const PAGE_SIZE = 15

export function AdminPendingMoviesPanel() {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pending, setPending] = useState<MovieSummaryDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)
  const [confirmMovie, setConfirmMovie] = useState<MovieSummaryDto | null>(null)
  const [confirmApprove, setConfirmApprove] = useState<boolean | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoadErr(null)
    setBusy(true)
    try {
      const pm = await adminFetch<PagedResult<MovieSummaryDto>>(
        `/api/admin/movies/pending?page=${page}&pageSize=${PAGE_SIZE}`,
        accessToken
      )
      if (!pm.ok) {
        setLoadErr(pm.status === 403 ? "Cần quyền admin." : pm.message)
        return
      }
      setPending(pm.data.data)
      setTotalPages(Math.max(1, pm.data.pagination.totalPages))
    } finally {
      setBusy(false)
    }
  }, [accessToken, page])

  useEffect(() => {
    void load()
  }, [load])

  const moderateMovie = async (id: string, approve: boolean) => {
    if (!accessToken) return
    setActionErr(null)
    const res = await adminFetch<unknown>(`/api/admin/movies/${id}/moderate`, accessToken, {
      method: "POST",
      body: JSON.stringify({ approve, note: null }),
    })
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    setConfirmMovie(null)
    setConfirmApprove(null)
    await load()
  }

  if (!accessToken) {
    return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để duyệt phim.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>Phim chờ duyệt</CardTitle>
          <CardDescription>Draft / processing — xuất bản hoặc từ chối</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadErr && <p className="text-sm text-destructive mb-2">{loadErr}</p>}
        {actionErr && <p className="text-sm text-destructive mb-2">{actionErr}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phim</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thể loại</TableHead>
                <TableHead>Ngày</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có phim chờ duyệt
                  </TableCell>
                </TableRow>
              ) : (
                pending.map((movie) => (
                  <TableRow key={movie.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Image
                          src={movie.posterUrl || "/placeholder.svg"}
                          alt=""
                          width={56}
                          height={84}
                          className="rounded object-cover w-14 h-[84px]"
                        />
                        <div>
                          <Link href={`/movies/${movie.id}`} className="font-medium hover:underline">
                            {movie.title}
                          </Link>
                          {movie.releaseYear != null && (
                            <p className="text-xs text-muted-foreground">{movie.releaseYear}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{movie.status ? movieStatusBadge(movie.status) : "—"}</TableCell>
                    <TableCell className="max-w-[180px] text-sm text-muted-foreground">
                      {movie.genres?.length ? movie.genres.map((g) => g.name).join(", ") : "—"}
                    </TableCell>
                    <TableCell>
                      {movie.createdAt ? new Date(movie.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => {
                            setConfirmMovie(movie)
                            setConfirmApprove(true)
                          }}
                        >
                          <Check className="h-4 w-4 mr-1" /> Xuất bản
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => {
                            setConfirmMovie(movie)
                            setConfirmApprove(false)
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Từ chối
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog
        open={confirmMovie !== null && confirmApprove !== null}
        onOpenChange={(o) => {
          if (!o) {
            setConfirmMovie(null)
            setConfirmApprove(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmApprove ? "Xuất bản phim" : "Từ chối phim"}</DialogTitle>
            <DialogDescription>
              {confirmMovie?.title ? `Áp dụng cho “${confirmMovie.title}”?` : "Xác nhận."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmMovie(null)
                setConfirmApprove(null)
              }}
            >
              Huỷ
            </Button>
            <Button
              variant={confirmApprove ? "default" : "destructive"}
              onClick={() => {
                if (confirmMovie && confirmApprove !== null) {
                  void moderateMovie(confirmMovie.id, confirmApprove)
                }
              }}
            >
              {confirmApprove ? "Xuất bản" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export function AdminUsersPanel({ compact = false }: { compact?: boolean }) {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [q, setQ] = useState("")
  const [debouncedQ, setDebouncedQ] = useState("")
  const [users, setUsers] = useState<AdminUserSummaryDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q.trim())
      setPage(1)
    }, 350)
    return () => clearTimeout(t)
  }, [q])

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoadErr(null)
    setBusy(true)
    try {
      const qs = new URLSearchParams({ page: String(page), pageSize: String(compact ? 10 : PAGE_SIZE) })
      if (debouncedQ) qs.set("q", debouncedQ)
      const ur = await adminFetch<PagedResult<AdminUserSummaryDto>>(
        `/api/admin/users?${qs.toString()}`,
        accessToken
      )
      if (!ur.ok) {
        setLoadErr(ur.status === 403 ? "Cần quyền admin." : ur.message)
        return
      }
      setUsers(ur.data.data)
      setTotalPages(Math.max(1, ur.data.pagination.totalPages))
    } finally {
      setBusy(false)
    }
  }, [accessToken, page, debouncedQ, compact])

  useEffect(() => {
    void load()
  }, [load])

  const patchUser = async (id: string, body: { isActive?: boolean; role?: string }) => {
    if (!accessToken) return
    setActionErr(null)
    const res = await adminFetch<AdminUserSummaryDto>(`/api/admin/users/${id}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify(
        body.role !== undefined
          ? { role: body.role }
          : body.isActive !== undefined
            ? { isActive: body.isActive }
            : {}
      ),
    })
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)))
  }

  if (!accessToken) {
    return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để quản lý user.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>Người dùng</CardTitle>
          <CardDescription>Tìm theo username, email, tên hiển thị</CardDescription>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!compact && (
            <Input
              className="w-56 h-9"
              placeholder="Tìm…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          )}
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {compact && (
          <Input
            className="max-w-sm mb-4 h-9"
            placeholder="Tìm user…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        {loadErr && <p className="text-sm text-destructive mb-2">{loadErr}</p>}
        {actionErr && <p className="text-sm text-destructive mb-2">{actionErr}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tham gia</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{user.email}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Select value={user.role} onValueChange={(role) => void patchUser(user.id, { role })}>
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        {user.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => void patchUser(user.id, { isActive: !user.isActive })}
                        >
                          {user.isActive ? "Khoá" : "Mở"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminReportsPanel() {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [reports, setReports] = useState<ContentReportAdminDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoadErr(null)
    setBusy(true)
    try {
      const rp = await adminFetch<PagedResult<ContentReportAdminDto>>(
        `/api/admin/reports?page=${page}&pageSize=${PAGE_SIZE}`,
        accessToken
      )
      if (!rp.ok) {
        setLoadErr(rp.status === 403 ? "Cần quyền admin." : rp.message)
        return
      }
      setReports(rp.data.data)
      setTotalPages(Math.max(1, rp.data.pagination.totalPages))
    } finally {
      setBusy(false)
    }
  }, [accessToken, page])

  useEffect(() => {
    void load()
  }, [load])

  const resolveReport = async (id: string, status: "dismissed" | "actioned") => {
    if (!accessToken) return
    setActionErr(null)
    const res = await adminFetch<unknown>(`/api/admin/reports/${id}/resolve`, accessToken, {
      method: "POST",
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    await load()
  }

  if (!accessToken) {
    return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để xử lý báo cáo.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>Báo cáo nội dung</CardTitle>
          <CardDescription>Pending — bỏ qua hoặc đã xử lý</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Hàng chờ upload/transcode: xem Hangfire UI (Development) hoặc log job — chưa có API queue riêng.
        </p>
        {loadErr && <p className="text-sm text-destructive mb-2">{loadErr}</p>}
        {actionErr && <p className="text-sm text-destructive mb-2">{actionErr}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người báo</TableHead>
                <TableHead>Đích</TableHead>
                <TableHead>Lý do</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Không có báo cáo chờ xử lý
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm">@{r.reporterUsername}</TableCell>
                    <TableCell className="text-sm">
                      <span className="font-mono text-xs">{r.targetType}</span>{" "}
                      <span className="text-muted-foreground">{r.targetId.slice(0, 8)}…</span>
                    </TableCell>
                    <TableCell className="max-w-[240px] text-sm">{r.reason}</TableCell>
                    <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => void resolveReport(r.id, "dismissed")}
                        >
                          Bỏ qua
                        </Button>
                        <Button size="sm" className="h-8" onClick={() => void resolveReport(r.id, "actioned")}>
                          Đã xử lý
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`
}

export function AdminPurchasesPanel() {
  const { accessToken } = useAuth()
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [rows, setRows] = useState<AdminPurchaseRowDto[]>([])
  const [loadErr, setLoadErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [actionErr, setActionErr] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoadErr(null)
    setBusy(true)
    try {
      const res = await adminFetch<PagedResult<AdminPurchaseRowDto>>(
        `/api/admin/purchases?page=${page}&pageSize=${PAGE_SIZE}`,
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

  const refund = async (id: string) => {
    if (!accessToken) return
    if (!confirm("Đánh dấu đơn refunded? Người mua mất quyền xem (trừ admin/owner).")) return
    setActionErr(null)
    const res = await adminFetch<unknown>(`/api/admin/purchases/${id}/refund`, accessToken, { method: "POST" })
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    await load()
  }

  const unpublishMovie = async (movieId: string) => {
    if (!accessToken) return
    if (!confirm("Gỡ phim về draft (tranh chấp)? Phim không còn hiển thị công khai.")) return
    setActionErr(null)
    const res = await adminFetch<unknown>(
      `/api/admin/movies/${movieId}/unpublish-dispute`,
      accessToken,
      { method: "POST" }
    )
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    await load()
  }

  if (!accessToken) {
    return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để xem đơn mua.</p>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>Đơn mua (marketplace)</CardTitle>
          <CardDescription>Hoàn tiền / gỡ phim tranh chấp</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {page} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loadErr && <p className="text-sm text-destructive mb-2">{loadErr}</p>}
        {actionErr && <p className="text-sm text-destructive mb-2">{actionErr}</p>}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người mua</TableHead>
                <TableHead>Phim</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Chưa có đơn
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm">@{row.buyerUsername}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">
                      <Link href={`/movies/${row.movieId}`} className="underline-offset-2 hover:underline">
                        {row.movieTitle}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">{formatVnd(row.amountVnd)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{row.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(row.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {row.status === "completed" ? (
                          <Button type="button" size="sm" variant="destructive" className="h-8" onClick={() => void refund(row.id)}>
                            Refund
                          </Button>
                        ) : null}
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8"
                          onClick={() => void unpublishMovie(row.movieId)}
                        >
                          Gỡ phim
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
