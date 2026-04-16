'use client'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
interface Column<T> { key: string; header: string; mono?: boolean; className?: string; render?: (item: T) => React.ReactNode; sortable?: boolean }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; sortable?: boolean; onRowClick?: (item: T) => void }
export function DataTable<T extends Record<string, any>>({ columns, data, sortable=true, onRowClick }: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string|null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const handleSort = (key: string) => { if (!sortable) return; if (sortCol===key) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortCol(key); setSortDir('asc') } }
  const sorted = [...data]
  if (sortCol && sortable) sorted.sort((a,b) => { const av=a[sortCol],bv=b[sortCol]; if(av===bv) return 0; return (av>bv?1:-1)*(sortDir==='asc'?1:-1) })
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead><tr className="border-b border-white/[0.08]">{columns.map(col => {
          const isSortable = sortable && col.sortable !== false; const isSorted = sortCol===col.key
          return <th key={col.key} className={`text-left px-4 py-3 text-xs text-[#737373] font-medium uppercase ${isSortable?'cursor-pointer hover:text-[#f5f5f5] select-none':''}`} onClick={()=>isSortable&&handleSort(col.key)}>
            <div className="flex items-center gap-1">{col.header}{isSortable&&<div className="flex flex-col"><ChevronUp className={`w-3 h-3 -mb-1 ${isSorted&&sortDir==='asc'?'text-[#1D9E75]':'text-white/[0.08]'}`}/><ChevronDown className={`w-3 h-3 ${isSorted&&sortDir==='desc'?'text-[#1D9E75]':'text-white/[0.08]'}`}/></div>}</div>
          </th>
        })}</tr></thead>
        <tbody>{sorted.map((item,i) => (
          <tr key={i} className={`border-b border-white/[0.04] hover:bg-[#1a1a1a] transition-colors ${onRowClick?'cursor-pointer':''}`} onClick={()=>onRowClick?.(item)}>
            {columns.map(col => <td key={col.key} className={`px-4 py-3 text-sm ${col.mono?'font-mono':''} ${col.className||''}`}>{col.render?col.render(item):item[col.key]}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  )
}
