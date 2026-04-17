"use client"

type StatusType = "pending"|"confirmed"|"active"|"in_progress"|"completed"|"cancelled"|"expired"|"suspended"|"trial"|"open"|"replied"|"closed"

const statusStyles: Record<StatusType,{bg:string;text:string}> = {
  pending:{bg:"rgba(245,158,11,0.08)",text:"#f59e0b"},
  confirmed:{bg:"rgba(29,158,117,0.10)",text:"#1D9E75"},
  active:{bg:"rgba(29,158,117,0.10)",text:"#1D9E75"},
  in_progress:{bg:"rgba(59,130,246,0.1)",text:"#3b82f6"},
  completed:{bg:"rgba(255,255,255,0.05)",text:"var(--text-2)"},
  cancelled:{bg:"rgba(239,68,68,0.08)",text:"#ef4444"},
  expired:{bg:"rgba(239,68,68,0.08)",text:"#ef4444"},
  suspended:{bg:"rgba(255,255,255,0.05)",text:"var(--text-2)"},
  trial:{bg:"rgba(245,158,11,0.08)",text:"#f59e0b"},
  open:{bg:"rgba(245,158,11,0.08)",text:"#f59e0b"},
  replied:{bg:"rgba(59,130,246,0.1)",text:"#3b82f6"},
  closed:{bg:"rgba(255,255,255,0.05)",text:"var(--text-2)"},
}

const statusLabels: Record<StatusType,string> = {
  pending:"Pending",confirmed:"Confirmed",active:"Active",in_progress:"In Progress",
  completed:"Completed",cancelled:"Cancelled",expired:"Expired",suspended:"Suspended",
  trial:"Trial",open:"Open",replied:"Replied",closed:"Closed",
}

export function StatusBadge({ status, showPulse=false }: { status:StatusType; showPulse?:boolean }) {
  const s = statusStyles[status] || statusStyles.pending
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 10px',borderRadius:99,fontFamily:'var(--font-mono)',fontSize:11,background:s.bg,color:s.text}}>
      {showPulse && status==="in_progress" && <span style={{width:8,height:8,borderRadius:'50%',background:'#22c55e',animation:'pulse 2s infinite'}}/>}
      {statusLabels[status]}
    </span>
  )
}
