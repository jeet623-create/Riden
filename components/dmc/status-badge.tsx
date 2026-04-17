"use client"

type StatusType = 
  | "pending" 
  | "confirmed" 
  | "active" 
  | "in_progress" 
  | "completed" 
  | "cancelled" 
  | "expired" 
  | "suspended" 
  | "trial" 
  | "open" 
  | "replied" 
  | "closed"

interface StatusBadgeProps {
  status: StatusType
  showPulse?: boolean
}

const statusStyles: Record<StatusType, { bg: string; text: string }> = {
  pending: { bg: "bg-[rgba(245,158,11,0.08)]", text: "text-[#f59e0b]" },
  confirmed: { bg: "bg-[rgba(29,158,117,0.10)]", text: "text-[#1D9E75]" },
  active: { bg: "bg-[rgba(29,158,117,0.10)]", text: "text-[#1D9E75]" },
  in_progress: { bg: "bg-[rgba(59,130,246,0.1)]", text: "text-[#3b82f6]" },
  completed: { bg: "bg-[rgba(255,255,255,0.05)]", text: "text-muted" },
  cancelled: { bg: "bg-[rgba(239,68,68,0.08)]", text: "text-[#ef4444]" },
  expired: { bg: "bg-[rgba(239,68,68,0.08)]", text: "text-[#ef4444]" },
  suspended: { bg: "bg-[rgba(255,255,255,0.05)]", text: "text-muted" },
  trial: { bg: "bg-[rgba(245,158,11,0.08)]", text: "text-[#f59e0b]" },
  open: { bg: "bg-[rgba(245,158,11,0.08)]", text: "text-[#f59e0b]" },
  replied: { bg: "bg-[rgba(59,130,246,0.1)]", text: "text-[#3b82f6]" },
  closed: { bg: "bg-[rgba(255,255,255,0.05)]", text: "text-muted" },
}

const statusLabels: Record<StatusType, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  active: "Active",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  expired: "Expired",
  suspended: "Suspended",
  trial: "Trial",
  open: "Open",
  replied: "Replied",
  closed: "Closed",
}

export function StatusBadge({ status, showPulse = false }: StatusBadgeProps) {
  const styles = statusStyles[status]
  const label = statusLabels[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono text-[11px] ${styles.bg} ${styles.text}`}>
      {showPulse && status === "in_progress" && (
        <span className="w-2 h-2 rounded-full bg-[#22c55e] pulse-dot" />
      )}
      {label}
    </span>
  )
}