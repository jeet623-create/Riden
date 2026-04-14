'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Shell from '@/components/Shell'

const D='#1A1A1A',Y='#D4E827'

export default function OperatorsPage() {
  const router=useRouter()
  const [ops,setOps]=useState<any[]>([])
  const [pref,setPref]=useState<string[]>([])
  const [search,setSearch]=useState('')
  const [loading,setLoading]=useState(true)
  const [dmcId,setDmcId]=useState('')

  useEffect(()=>{load()},[])  

  async function load() {
    const c=createClient()
    const {data:{user}}=await c.auth.getUser()
    if(!user){router.push('/login');return}
    setDmcId(user.id)
    const [{data:o},{data:d}]=await Promise.all([
      c.from('operators').select('id,company_name,phone,base_location,status,is_verified').eq('status','active').eq('is_verified',true).order('company_name'),
      c.from('dmc_users').select('preferred_operator_ids').eq('id',user.id).single()
    ])
    setOps(o??[]); setPref(d?.preferred_operator_ids??[]); setLoading(false)
  }

  async function toggle(id: string) {
    const c=createClient()
    const n=pref.includes(id)?pref.filter((x:string)=>x!==id):[...pref,id]
    setPref(n)
    await c.from('dmc_users').update({preferred_operator_ids:n}).eq('id',dmcId)
  }

  const filtered=ops.filter((o:any)=>!search||o.company_name?.toLowerCase().includes(search.toLowerCase())||o.base_location?.toLowerCase().includes(search.toLowerCase()))
  const sorted=[...filtered.filter((o:any)=>pref.includes(o.id)),...filtered.filter((o:any)=>!pref.includes(o.id))]

  return (
    <Shell title="Operators">
      <style>{'@media(max-width:600px){.op-grid{grid-template-columns:1fr!important}}'}</style>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap' as const}}>
        <input style={{flex:1,minWidth:180,background:'#fff',border:'0.5px solid #E8E8E8',borderRadius:8,color:D,fontFamily:'var(--font-space)',fontSize:13,padding:'10px 14px',outline:'none',boxSizing:'border-box' as const}} placeholder="Search by name or city..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {!loading&&<span style={{fontSize:12,color:'#888',whiteSpace:'nowrap' as const}}>{sorted.length} operators · {pref.length} preferred</span>}
      </div>
      {loading
        ?<div className="op-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>{[1,2,3,4,5,6].map(i=><div key={i} className="skeleton" style={{height:110,borderRadius:14}}/>)}</div>
        :sorted.length===0?<div style={{padding:'48px 0',textAlign:'center' as const,color:'#888',fontSize:14}}>No operators found.</div>
        :<div className="op-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
          {sorted.map((op:any)=>{
            const ip=pref.includes(op.id)
            return <div key={op.id} style={{background:ip?D:'#fff',borderRadius:14,border:ip?'2px solid '+D:'0.5px solid #E8E8E8',padding:'18px 18px 14px',position:'relative' as const,transition:'all 200ms'}}>
              {ip&&<div style={{position:'absolute' as const,top:13,right:44,background:Y,color:D,fontSize:9,fontWeight:700,fontFamily:'var(--font-syne)',padding:'2px 7px',borderRadius:20,letterSpacing:'0.1em'}}>PREFERRED</div>}
              <button onClick={()=>toggle(op.id)} style={{position:'absolute' as const,top:11,right:13,background:'none',border:'none',cursor:'pointer',fontSize:20,lineHeight:1,color:ip?Y:'#ccc',transition:'color 200ms',padding:2}}>{ip?'★':'☆'}</button>
              <div style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:14,color:ip?Y:D,marginBottom:5,paddingRight:40,lineHeight:1.2}}>{op.company_name}</div>
              {op.base_location&&<div style={{fontSize:12,color:ip?'rgba(212,232,39,0.6)':'#888',marginBottom:2}}>📍 {op.base_location}</div>}
              {op.phone&&<div style={{fontSize:12,color:ip?'rgba(212,232,39,0.6)':'#888'}}>📞 {op.phone}</div>}
            </div>
          })}
        </div>
      }
    </Shell>
  )
}
