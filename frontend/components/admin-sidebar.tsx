"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Film,
  Users,
  FileText,
  FileWarning,
  ShoppingBag,
  Wallet,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { LucideIcon } from "lucide-react"

type NavItem = {
  id: string
  label: string
  href: string
  icon: LucideIcon
  disabled?: boolean
}

const NAV: readonly NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { id: "movies", label: "Movies", href: "/admin/movies", icon: Film },
  { id: "purchases", label: "Purchases", href: "/admin/purchases", icon: ShoppingBag },
  { id: "payouts", label: "Payouts", href: "/admin/payouts", icon: Wallet },
  { id: "users", label: "Users", href: "/admin/users", icon: Users },
  { id: "reports", label: "Reports", href: "/admin/reports", icon: FileWarning },
  { id: "news", label: "News", href: "#", icon: FileText, disabled: true },
  { id: "settings", label: "Settings", href: "#", icon: Settings, disabled: true },
]

interface AdminSidebarProps {
  activeItem: string
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function AdminSidebar({ activeItem, onCollapsedChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    onCollapsedChange?.(collapsed)
  }, [collapsed, onCollapsedChange])

  const isActive = (item: NavItem) => {
    if (item.disabled) return false
    if (item.id === "dashboard") return pathname === "/admin" || pathname.startsWith("/admin/dashboard")
    if (item.href !== "#") return pathname.startsWith(item.href)
    return false
  }

  return (
    <>
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={() => setMobileOpen((o) => !o)}>
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r transform transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center min-w-0">
              <img src="/placeholder.svg?height=32&width=32" alt="" className="h-8 w-8 shrink-0" />
              {!collapsed && <span className="ml-2 font-bold truncate">Admin</span>}
            </Link>
            <Button variant="ghost" size="icon" className="hidden md:flex shrink-0" onClick={() => setCollapsed((c) => !c)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {NAV.map((item) => {
                const active = isActive(item) || activeItem === item.id
                if (item.disabled) {
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      disabled
                      className={`w-full justify-start opacity-50 ${collapsed ? "px-3" : "px-3"}`}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  )
                }
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    asChild
                    className={`w-full justify-start ${active ? "bg-gray-100" : ""} ${collapsed ? "px-3" : "px-3"}`}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (mobileOpen) setMobileOpen(false)
                      }}
                    >
                      <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  </Button>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center min-w-0">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={user?.avatarUrl ?? undefined} alt="" />
                <AvatarFallback className="text-xs">
                  {(user?.displayName ?? "A").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!collapsed && user && (
                <div className="ml-2 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              className={`w-full justify-start mt-4 ${collapsed ? "px-3" : "px-3"}`}
              onClick={async () => {
                await logout()
                router.push("/")
              }}
            >
              <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`} />
              {!collapsed && <span>Đăng xuất</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
