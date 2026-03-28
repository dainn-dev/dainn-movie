"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Check, X, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type {
  AdminUserSummaryDto,
  ContentReportAdminDto,
  MovieSummaryDto,
  PagedResult,
} from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

async function adminFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  })
  if (r.status === 204) return { ok: true, data: undefined as T }
  const text = await r.text()
  if (!r.ok) {
    let message = text || r.statusText
    try {
      const j = JSON.parse(text) as { message?: string }
      if (j.message) message = j.message
    } catch {
      /* keep text */
    }
    return { ok: false, status: r.status, message }
  }
  if (!text) return { ok: true, data: undefined as T }
  return { ok: true, data: JSON.parse(text) as T }
}

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

export function AdminModerationSection() {
  const { accessToken } = useAuth()
  const [pending, setPending] = useState<MovieSummaryDto[]>([])
  const [users, setUsers] = useState<AdminUserSummaryDto[]>([])
  const [reports, setReports] = useState<ContentReportAdminDto[]>([])
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
      const [pm, ur, rp] = await Promise.all([
        adminFetch<PagedResult<MovieSummaryDto>>("/api/admin/movies/pending?page=1&pageSize=20", accessToken),
        adminFetch<PagedResult<AdminUserSummaryDto>>("/api/admin/users?page=1&pageSize=10", accessToken),
        adminFetch<PagedResult<ContentReportAdminDto>>("/api/admin/reports?page=1&pageSize=20", accessToken),
      ])
      if (!pm.ok) {
        setLoadErr(pm.status === 403 ? "Cần quyền admin." : pm.message)
        return
      }
      if (!ur.ok) {
        setLoadErr(ur.status === 403 ? "Cần quyền admin." : ur.message)
        return
      }
      if (!rp.ok) {
        setLoadErr(rp.status === 403 ? "Cần quyền admin." : rp.message)
        return
      }
      setPending(pm.data.data)
      setUsers(ur.data.data)
      setReports(rp.data.data)
    } finally {
      setBusy(false)
    }
  }, [accessToken])

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

  const patchUser = async (id: string, body: { isActive?: boolean; role?: string }) => {
    if (!accessToken) return
    setActionErr(null)
    const res = await adminFetch<AdminUserSummaryDto>(`/api/admin/users/${id}`, accessToken, {
      method: "PATCH",
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      setActionErr(res.message)
      return
    }
    setUsers((prev) => prev.map((u) => (u.id === id ? res.data : u)))
  }

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
    return <p className="text-sm text-muted-foreground">Đăng nhập (admin) để duyệt nội dung.</p>
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-end">
        <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={busy}>
          <RefreshCw className={`h-4 w-4 mr-2 ${busy ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      {loadErr && <p className="text-sm text-destructive">{loadErr}</p>}
      {actionErr && <p className="text-sm text-destructive">{actionErr}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Pending movie moderation</CardTitle>
          <CardDescription>Draft / processing titles awaiting publish or reject</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Movie</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Genres</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending movies
                    </TableCell>
                  </TableRow>
                ) : (
                  pending.map((movie) => (
                    <TableRow key={movie.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={movie.posterUrl || "/placeholder.svg"}
                            alt={movie.title}
                            width={56}
                            height={84}
                            className="rounded object-cover w-14 h-[84px]"
                          />
                          <div>
                            <p className="font-medium">{movie.title}</p>
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => {
                              setConfirmMovie(movie)
                              setConfirmApprove(true)
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" /> Publish
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
                            <X className="h-4 w-4 mr-1" /> Reject
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

      <Card>
        <CardHeader>
          <CardTitle>Recent users</CardTitle>
          <CardDescription>Latest accounts (newest first)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users loaded
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
                        <Select
                          value={user.role}
                          onValueChange={(role) => void patchUser(user.id, { role })}
                        >
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
                        <div className="flex items-center gap-2">
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
                            {user.isActive ? "Deactivate" : "Activate"}
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

      <Card>
        <CardHeader>
          <CardTitle>Content reports</CardTitle>
          <CardDescription>Pending user reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No pending reports
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
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => void resolveReport(r.id, "dismissed")}
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            className="h-8"
                            onClick={() => void resolveReport(r.id, "actioned")}
                          >
                            Actioned
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
            <DialogTitle>{confirmApprove ? "Publish movie" : "Reject movie"}</DialogTitle>
            <DialogDescription>
              {confirmMovie?.title ? `Apply to “${confirmMovie.title}”?` : "Confirm moderation."}
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
              Cancel
            </Button>
            <Button
              variant={confirmApprove ? "default" : "destructive"}
              onClick={() => {
                if (confirmMovie && confirmApprove !== null) {
                  void moderateMovie(confirmMovie.id, confirmApprove)
                }
              }}
            >
              {confirmApprove ? "Publish" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
