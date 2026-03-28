"use client"

import { AdminPurchasesPanel } from "@/components/admin/admin-panels"

export default function AdminPurchasesPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketplace — đơn mua</h1>
        <p className="text-sm text-muted-foreground mt-1">
          API: GET /api/admin/purchases, POST …/purchases/{"{id}"}/refund, POST …/movies/{"{id}"}/unpublish-dispute
        </p>
      </div>
      <AdminPurchasesPanel />
    </div>
  )
}
