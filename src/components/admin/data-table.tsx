'use client'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'
interface Column<T> { key: string; header: string; mono?: boolean; className?: string; render?: (item: T) => React.ReactNode }
interface DataTableProps<T> { columns: Column<T>[]; data: T[]; onRowClick?: (item: T) => void }
export function DataTable<T extends Record<string, any>>({ columns, data, onRowClick }: DataTableProps<T>) {
  const [sortCol, setSortCol] = useState<string|null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const sorted = [...data].sort((a, b) => {
    if (!sortCol) return 0
    const av = a[sortCol], bv = b[sortCol]
    if (av === bv) return 0
    return (av > bv ? 1 : -1) * (sortDir === 'asc' ? 1 : -1)
  })
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} onClick={() => { if(sortCol===col.key) setSortDir(d=>d==='asc'?'desc':'asc'); else {setSortCol(col.key);setSortDir('asc')} }}
                className="text-left px-4 py-3 cursor-pointer select-none hover:text-[var(--text-1)] transition-colors"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <div className="flex items-center gap-1">{col.header}
                  <div className="flex flex-col opacity-40">
                    <ChevronUp className={`w-3 h-3 -mb-1 ${sortCol===col.key&&sortDir==='asc'?'opacity-100 text-[var(--teal)]':''}`}/>
                    <ChevronDown className={`w-3 h-3 ${sortCol===col.key&&sortDir==='desc'?'opacity-100 text-[var(--teal)]':''}`}/>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => (
            <tr key={i} onClick={() => onRowClick?.(item)}
              className="transition-colors duration-100"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: onRowClick ? 'pointer' : 'default' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {columns.map(col => (
                <td key={col.key} className={`px-4 py-3 text-sm ${col.className || ''}`}
                  style={col.mono ? { fontFamily: 'var(--font-mono)', fontSize: 12 } : {}}>
                  {col.render ? col.render(item) : item[col.key]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-12 text-center" style={{ color: 'var(--text-3)' }}>No data found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
