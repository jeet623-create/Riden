'use client'
import { useState } from 'react'
import { Search, Plus, Trash2, MapPin, Phone, Star } from 'lucide-react'

const mockPreferred = [
  { id: 'op1', company: 'Bangkok Premium Transport', ridenId: 'OP-1042', phone: '+66 81 234 5678', location: 'Bangkok', rating: 4.8, vehicles: 12 },
  { id: 'op2', company: 'Chiang Mai Transfers', ridenId: 'OP-2156', phone: '+66 89 876 5432', location: 'Chiang Mai', rating: 4.9, vehicles: 8 },
  { id: 'op3', company: 'Phuket Express', ridenId: 'OP-3089', phone: '+66 82 345 6789', location: 'Phuket', rating: 4.7, vehicles: 15 },
]

const mockSearchResults = [
  { id: 'op4', company: 'Krabi Shuttle Service', ridenId: 'OP-4201', phone: '+66 83 456 7890', location: 'Krabi', rating: 4.6, vehicles: 6 },
  { id: 'op5', company: 'Samui Island Tours', ridenId: 'OP-5123', phone: '+66 84 567 8901', location: 'Koh Samui', rating: 4.5, vehicles: 10 },
  { id: 'op6', company: 'Pattaya Limo', ridenId: 'OP-6078', phone: '+66 85 678 9012', location: 'Pattaya', rating: 4.4, vehicles: 20 },
]

export default function DMCOperatorsPage() {
  const [preferred, setPreferred] = useState(mockPreferred)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<typeof mockSearchResults>([])

  function handleSearch(q: string) {
    setSearch(q)
    if (q.length >= 2) {
      setResults(mockSearchResults.filter(op => 
        op.company.toLowerCase().includes(q.toLowerCase()) ||
        op.ridenId.toLowerCase().includes(q.toLowerCase()) ||
        op.location.toLowerCase().includes(q.toLowerCase())
      ))
    } else {
      setResults([])
    }
  }

  function addOperator(op: typeof mockSearchResults[0]) {
    if (!preferred.find(p => p.id === op.id)) {
      setPreferred([...preferred, op])
    }
  }

  function removeOperator(id: string) {
    setPreferred(preferred.filter(p => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-1)' }}>Preferred Operators</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Manage your trusted transport operators</p>
      </div>

      {/* Preferred List */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div 
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold" style={{ color: 'var(--text-1)' }}>
            Your List ({preferred.length})
          </h2>
        </div>

        {preferred.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3 opacity-30">🏢</div>
            <div className="font-medium" style={{ color: 'var(--text-1)' }}>No preferred operators</div>
            <div className="text-sm mt-1" style={{ color: 'var(--text-2)' }}>Search below to add operators</div>
          </div>
        ) : (
          preferred.map(op => (
            <div 
              key={op.id}
              className="flex items-center justify-between px-5 py-4 border-b transition-all hover:bg-[var(--bg-elevated)]"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="font-semibold" style={{ color: 'var(--text-1)' }}>{op.company}</div>
                  <span 
                    className="px-2 py-0.5 rounded text-[10px] font-medium"
                    style={{ fontFamily: 'var(--font-mono)', background: 'var(--teal-10)', color: 'var(--teal)' }}
                  >
                    {op.ridenId}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {op.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" /> {op.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} /> {op.rating}
                  </span>
                  <span>{op.vehicles} vehicles</span>
                </div>
              </div>
              <button
                onClick={() => removeOperator(op.id)}
                className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
                style={{ color: 'var(--red)' }}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Search Section */}
      <div 
        className="rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <div 
          className="px-5 py-4 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--text-1)' }}>Search Operators</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-2)' }} />
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, city, or RIDEN ID (e.g. OP-1042)"
              className="w-full h-11 pl-10 pr-4 rounded-lg text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-1)'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--teal)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div>
            {results.map(op => {
              const isAdded = preferred.some(p => p.id === op.id)
              return (
                <div 
                  key={op.id}
                  className="flex items-center justify-between px-5 py-4 border-b transition-all hover:bg-[var(--bg-elevated)]"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold" style={{ color: 'var(--text-1)' }}>{op.company}</div>
                      <span 
                        className="px-2 py-0.5 rounded text-[10px] font-medium"
                        style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-elevated)', color: 'var(--text-2)' }}
                      >
                        {op.ridenId}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-sm" style={{ color: 'var(--text-2)' }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {op.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5" style={{ color: 'var(--amber)' }} /> {op.rating}
                      </span>
                      <span>{op.vehicles} vehicles</span>
                    </div>
                  </div>
                  {isAdded ? (
                    <span className="text-sm" style={{ color: 'var(--teal)' }}>Added</span>
                  ) : (
                    <button
                      onClick={() => addOperator(op)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                      style={{ background: 'var(--teal)', color: '#fff' }}
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {search.length >= 2 && results.length === 0 && (
          <div className="text-center py-8">
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>No operators found for "{search}"</div>
          </div>
        )}
      </div>
    </div>
  )
}
