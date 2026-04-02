"use client"

import { AdminPendingMoviesPanel, AdminReportsPanel, AdminUsersPanel } from "@/components/admin/admin-panels"

/** Tổng hợp 3 khối moderation trên dashboard (M6). */
export function AdminModerationSection() {
  return (
    <div className="space-y-8">
      <AdminPendingMoviesPanel />
      <AdminUsersPanel compact />
      <AdminReportsPanel />
    </div>
  )
}
