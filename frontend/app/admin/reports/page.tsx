"use client"

import { AdminReportsPanel } from "@/components/admin/admin-panels"

export default function AdminReportsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Báo cáo nội dung</h1>
        <p className="text-sm text-muted-foreground mt-1">
          API: GET /api/admin/reports, POST /api/admin/reports/{"{id}"}/resolve
        </p>
      </div>
      <AdminReportsPanel />
    </div>
  )
}
