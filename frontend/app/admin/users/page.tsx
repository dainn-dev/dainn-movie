"use client"

import { AdminUsersPanel } from "@/components/admin/admin-panels"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>
        <p className="text-sm text-muted-foreground mt-1">API: GET /api/admin/users, PATCH /api/admin/users/{"{id}"}</p>
      </div>
      <AdminUsersPanel />
    </div>
  )
}
