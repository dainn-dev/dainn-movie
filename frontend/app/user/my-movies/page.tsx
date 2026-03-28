"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Film, MoreHorizontal, Trash, Edit, Upload } from "lucide-react"
import UserSidebar from "@/components/user-sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { MovieSummaryDto, PagedResult } from "@/types/api"

const API = process.env.NEXT_PUBLIC_API_URL ?? ""

function mapStatusLabel(apiStatus: string | null | undefined): { label: string; variant: "default" | "secondary" | "destructive" | "outline" } {
  switch (apiStatus) {
    case "published":
      return { label: "Đã xuất bản", variant: "default" }
    case "rejected":
      return { label: "Từ chối", variant: "destructive" }
    case "processing":
      return { label: "Đang xử lý", variant: "secondary" }
    case "draft":
    default:
      return { label: "Bản nháp", variant: "outline" }
  }
}

export default function UserMoviesPage() {
  const router = useRouter()
  const { accessToken, user } = useAuth()
  const [items, setItems] = useState<MovieSummaryDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/movies?uploadedBy=me&page=1&pageSize=100`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) {
        router.replace("/login?next=/user/my-movies")
        return
      }
      if (!res.ok) {
        setError("Không tải được danh sách.")
        return
      }
      const data = (await res.json()) as PagedResult<MovieSummaryDto>
      setItems(data.data)
    } catch {
      setError("Lỗi mạng.")
    } finally {
      setLoading(false)
    }
  }, [accessToken, router])

  useEffect(() => {
    if (!user) {
      router.replace("/login?next=/user/my-movies")
      return
    }
    load()
  }, [user, load, router])

  async function confirmDelete() {
    if (!accessToken || !deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`${API}/api/movies/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.ok) {
        setItems((rows) => rows.filter((m) => m.id !== deleteId))
        setDeleteId(null)
      }
    } finally {
      setDeleting(false)
    }
  }

  const totalViews = items.reduce((s, m) => s + m.viewCount, 0)

  return (
    <div>
      <div className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Phim của tôi</h1>
          <div className="flex items-center text-sm">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <span className="mx-2">•</span>
            <span>Phim của tôi</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <UserSidebar activeItem="profile" />
          </div>

          <div className="md:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold">Phim đã đăng</h2>
                <Button asChild>
                  <Link href="/upload">
                    <Upload className="h-4 w-4 mr-2" /> Đăng phim mới
                  </Link>
                </Button>
              </div>

              {error && <p className="text-sm text-destructive mb-4">{error}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Tổng phim</p>
                  <p className="text-2xl font-bold">{items.length}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Tổng lượt xem</p>
                  <p className="text-2xl font-bold">{totalViews}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Đánh giá TB</p>
                  <p className="text-2xl font-bold">
                    {items.length ? (items.reduce((s, m) => s + m.avgRating, 0) / items.length).toFixed(1) : "—"}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phim</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Lượt xem</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Đang tải…
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <Film className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Chưa có phim</p>
                          <Button asChild variant="outline" className="mt-4">
                            <Link href="/upload">Đăng phim đầu tiên</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((movie) => {
                        const st = mapStatusLabel(movie.status)
                        const thumb = movie.posterUrl || "/placeholder.svg"
                        const created = movie.createdAt
                          ? new Date(movie.createdAt).toLocaleDateString()
                          : "—"
                        return (
                          <TableRow key={movie.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Image
                                  src={thumb}
                                  alt={movie.title}
                                  width={72}
                                  height={102}
                                  className="rounded object-cover w-[72px] h-[48px]"
                                />
                                <div>
                                  <p className="font-medium">{movie.title}</p>
                                  <p className="text-xs text-muted-foreground">{movie.slug}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={st.variant}>{st.label}</Badge>
                            </TableCell>
                            <TableCell>{movie.viewCount}</TableCell>
                            <TableCell>{created}</TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/upload/${movie.id}/edit`} className="flex items-center cursor-pointer">
                                      <Edit className="h-4 w-4 mr-2" /> Sửa
                                    </Link>
                                  </DropdownMenuItem>
                                  {movie.status === "published" && (
                                    <DropdownMenuItem asChild>
                                      <Link href={`/movies/${movie.id}`} className="flex items-center cursor-pointer">
                                        Xem
                                      </Link>
                                    </DropdownMenuItem>
                                  )}
                                  {(movie.status === "draft" || movie.status === "rejected") && (
                                    <DropdownMenuItem
                                      className="text-destructive cursor-pointer"
                                      onClick={() => setDeleteId(movie.id)}
                                    >
                                      <Trash className="h-4 w-4 mr-2" /> Xoá
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xoá phim?</DialogTitle>
            <DialogDescription>Hành động không hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Huỷ
            </Button>
            <Button variant="destructive" disabled={deleting} onClick={confirmDelete}>
              Xoá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
