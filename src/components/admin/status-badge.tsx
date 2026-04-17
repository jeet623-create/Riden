'use client'
interface StatusConfig { bg: string; text: string; label: string }
const cfg: Record<string, StatusConfig> = {
  active:{bg:'var(--teal-10)',text:'var(--teal)',label:'Active'},
  confirmed:{bg:'var(--teal-10)',text:'var(--teal)',label:'Confirmed'},
  completed:{bg:'rgba(255,255,255,0.05)',text:'var(--text-2)',label:'Completed'},
  pending:{bg:'var(--amber-bg)',text:'var(--amber)',label:'Pending'},
  trial:{bg:'var(--amber-bg)',text:'var(--amber)',label:'Trial'},
  open:{bg:'var(--amber-bg)',text:'var(--amber)',label:'Open'},
  cancelled:{bg:'var(--red-bg)',text:'var(--red)',label:'Cancelled'},
  suspended:{bg:'var(--red-bg)',text:'var(--red)',label:'Suspended'},
  expired:{bg:'var(--red-bg)',text:'var(--red)',label:'Expired'},
  in_pool:{bg:'var(--blue-bg)',text:'var(--blue)',label:'In Pool'},
  in_progress:{bg:'var(--blue-bg)',text:'var(--blue)',label:'In Progress'},
  inactive:{bg:'rgba(255,255,255,0.05)',text:'var(--text-2)',label:'Inactive'},
  replied:{bg:'var(--blue-bg)',text:'var(--blue)',label:'Replied'},
  closed:{bg:'rgba(255,255,255,0.05)',text:'var(--text-2)',label:'Closed'},
}
export function StatusBadge({ status, variant='default', showPulse }: { status:string; variant?:'default'|'small'; showPulse?:boolean }) {
  const s = status.toLowerCase().replace(/ /g,'_')
  const c = cfg[s] ?? {bg:'rgba(255,255,255,0.05)',text:'var(--text-2)',label:status}
  const pulse = showPulse ?? s==='in_progress'
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full font-medium" style={{fontFamily:'var(--font-mono)',fontSize:variant==='small'?10:11,padding:variant==='small'?'2px 8px':'3px 10px',background:c.bg,color:c.text}}>
      {pulse && <span className="w-2 h-2 rounded-full animate-pulse" style={{background:'var(--green)'}}/>}
      {c.label}
    </span>
  )
}
