"use client"

export const dynamic = "force-dynamic"

import { AdminPaymentsTable } from "@/components/admin/admin-payments-table"

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-4 text-[13px]">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase text-muted tracking-[0.18em]">ADMIN · PAYMENTS</div>
          <div className="text-foreground text-[15px] font-medium">Payment chain monitoring</div>
        </div>
      </div>
      <AdminPaymentsTable />
    </div>
  )
}
