"use client"

import { AdminPayoutsPanel } from "@/components/admin/admin-payouts-panel"

export default function AdminPayoutsPage() {
  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rút tiền creator (payout)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Xử lý yêu cầu rút — chuyển khoản thủ công rồi bấm &quot;Đã chuyển&quot;.
        </p>
      </div>
      <AdminPayoutsPanel />
    </div>
  )
}
