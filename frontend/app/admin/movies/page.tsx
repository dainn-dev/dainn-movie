"use client"

import { AdminPendingMoviesPanel } from "@/components/admin/admin-panels"

export default function AdminMoviesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản lý phim (moderation)</h1>
        <p className="text-sm text-muted-foreground mt-1">API: GET /api/admin/movies/pending, POST …/moderate</p>
      </div>
      <AdminPendingMoviesPanel />
    </div>
  )
}
