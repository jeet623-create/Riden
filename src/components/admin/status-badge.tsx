'use client'
const cfg: Record<string,{bg:string;text:string;label:string}> = {
  active:{bg:'bg-[rgba(34,197,94,0.1)]',text:'text-[#22c55e]',label:'Active'},
  confirmed:{bg:'bg-[rgba(34,197,94,0.1)]',text:'text-[#22c55e]',label:'Confirmed'},
  completed:{bg:'bg-[rgba(34,197,94,0.1)]',text:'text-[#22c55e]',label:'Completed'},
  pending:{bg:'bg-[rgba(245,158,11,0.1)]',text:'text-[#f59e0b]',label:'Pending'},
  trial:{bg:'bg-[rgba(245,158,11,0.1)]',text:'text-[#f59e0b]',label:'Trial'},
  cancelled:{bg:'bg-[rgba(239,68,68,0.1)]',text:'text-[#ef4444]',label:'Cancelled'},
  suspended:{bg:'bg-[rgba(239,68,68,0.1)]',text:'text-[#ef4444]',label:'Suspended'},
  expired:{bg:'bg-[rgba(239,68,68,0.1)]',text:'text-[#ef4444]',label:'Expired'},
  in_pool:{bg:'bg-[rgba(59,130,246,0.1)]',text:'text-[#3b82f6]',label:'In Pool'},
  in_progress:{bg:'bg-[rgba(59,130,246,0.1)]',text:'text-[#3b82f6]',label:'In Progress'},
  inactive:{bg:'bg-white/5',text:'text-[#737373]',label:'Inactive'},
  replied:{bg:'bg-white/5',text:'text-[#737373]',label:'Replied'},
  closed:{bg:'bg-white/5',text:'text-[#737373]',label:'Closed'},
  open:{bg:'bg-[rgba(29,158,117,0.1)]',text:'text-[#1D9E75]',label:'Open'},
}
export function StatusBadge({ status, variant='default' }: { status: string; variant?: 'default'|'small' }) {
  const c = cfg[status.toLowerCase()] ?? { bg:'bg-white/5',text:'text-[#737373]',label:status }
  const sz = variant==='small' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return <span className={`inline-flex items-center rounded-full font-medium ${c.bg} ${c.text} ${sz}`}>{c.label}</span>
}
