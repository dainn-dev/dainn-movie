"use client"

import type React from "react"
import { useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import AdminSidebar from "@/components/admin-sidebar"
import { useAuth } from "@/contexts/auth-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, accessToken } = useAuth()

  const activeItem = useMemo(() => {
    if (pathname.startsWith("/admin/movies")) return "movies"
    if (pathname.startsWith("/admin/purchases")) return "purchases"
    if (pathname.startsWith("/admin/payouts")) return "payouts"
    if (pathname.startsWith("/admin/users")) return "users"
    if (pathname.startsWith("/admin/reports")) return "reports"
    return "dashboard"
  }, [pathname])

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/login?next=${encodeURIComponent(pathname || "/admin/dashboard")}`)
      return
    }
    if (user && user.role !== "admin") {
      router.replace("/")
    }
  }, [accessToken, user, pathname, router])

  if (!accessToken || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        Đang kiểm tra quyền…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeItem={activeItem} />
      <main className="flex-1 p-4 pt-16 md:pt-4 overflow-auto md:ml-64">{children}</main>
    </div>
  )
}
