"use client"

import type React from "react"
import AdminSidebar from "@/components/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar activeItem="dashboard" onItemClick={(item) => console.log(`Clicked ${item}`)} />
      <main className="flex-1 p-4 overflow-auto">{children}</main>
    </div>
  )
}
