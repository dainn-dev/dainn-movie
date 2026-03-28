"use client"

import Link from "next/link"
import { Film, Users, FileWarning, LayoutDashboard, ShoppingBag, Wallet } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLiveStats } from "@/components/admin-live-stats"
import { AdminModerationSection } from "@/components/admin-moderation-section"

const shortcuts = [
  {
    href: "/admin/movies",
    title: "Duyệt phim",
    desc: "Draft / processing → published / rejected",
    icon: Film,
  },
  {
    href: "/admin/users",
    title: "Người dùng",
    desc: "Tìm kiếm, role, kích hoạt / khoá",
    icon: Users,
  },
  {
    href: "/admin/reports",
    title: "Báo cáo & ghi chú queue",
    desc: "Content reports; upload queue qua Hangfire (dev)",
    icon: FileWarning,
  },
  {
    href: "/admin/purchases",
    title: "Đơn mua (M8)",
    desc: "Marketplace — refund, tranh chấp",
    icon: ShoppingBag,
  },
  {
    href: "/admin/payouts",
    title: "Rút tiền creator",
    desc: "Yêu cầu payout — đánh dấu đã chuyển",
    icon: Wallet,
  },
]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <LayoutDashboard className="h-7 w-7" />
          Admin dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Dữ liệu từ <code className="text-xs bg-muted px-1 rounded">/api/admin/*</code> — cần tài khoản role{" "}
          <strong>admin</strong>.
        </p>
      </div>

      <AdminLiveStats />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shortcuts.map((s) => (
          <Link key={s.href} href={s.href}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <s.icon className="h-8 w-8 text-muted-foreground mb-2" />
                <CardTitle className="text-base">{s.title}</CardTitle>
                <CardDescription>{s.desc}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Tổng quan nhanh</h2>
        <AdminModerationSection />
      </div>
    </div>
  )
}
