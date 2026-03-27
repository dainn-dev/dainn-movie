"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LayoutDashboard, Film, Users, FileText, User, Settings, LogOut, Menu, X } from "lucide-react"

interface AdminSidebarProps {
  activeItem: string
  onItemClick: (item: string) => void
  onCollapsedChange?: (collapsed: boolean) => void
}

export default function AdminSidebar({ activeItem, onItemClick, onCollapsedChange }: AdminSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "movies", label: "Movies", icon: Film },
    { id: "users", label: "Users", icon: Users },
    { id: "news", label: "News", icon: FileText },
    { id: "celebrities", label: "Celebrities", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  useEffect(() => {
    if (onCollapsedChange) {
      onCollapsedChange(collapsed)
    }
  }, [collapsed, onCollapsedChange])

  const toggleSidebar = () => {
    setCollapsed(!collapsed)
  }

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 md:hidden" onClick={toggleMobileSidebar}>
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r transform transition-all duration-300 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center">
              <img src="/placeholder.svg?height=32&width=32" alt="Logo" className="h-8 w-8" />
              {!collapsed && <span className="ml-2 font-bold">Admin Panel</span>}
            </div>
            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              {menuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${
                    activeItem === item.id ? "bg-gray-100" : ""
                  } ${collapsed ? "px-3" : "px-3"}`}
                  onClick={() => {
                    onItemClick(item.id)
                    if (mobileOpen) setMobileOpen(false)
                  }}
                >
                  <item.icon className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="ml-2">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">admin@example.com</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className={`w-full justify-start mt-4 ${collapsed ? "px-3" : "px-3"}`}>
              <LogOut className={`h-5 w-5 ${collapsed ? "" : "mr-2"}`} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
