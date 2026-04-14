import Link from 'next/link'
const D='#1A1A1A',Y='#D4E827'
const S=[['Information We Collect','We collect company name, email, country, and language preference during registration, along with booking data and usage analytics.'],['How We Use Your Data','Your data operates the RIDEN platform, sends booking confirmations, and coordinates with operators and drivers. We do not sell your data.'],['LINE Integration','If you link your LINE account, your LINE user ID is stored only to send emergency notifications. No marketing messages via LINE.'],['Data Retention','Active account data is retained for your subscription duration plus 90 days. Request deletion by contacting support.'],['PDPA Compliance','RIDEN complies with Thailand PDPA. You have the right to access, correct, or delete your data. Deletion requests are processed within 30 days.'],['Third-Party Services','We use Supabase for storage, Vercel for hosting, and LINE Messaging API for emergency alerts.'],['Contact','For privacy inquiries: privacy@riden.app']]
export default function PrivacyPage() {
  return <div style={{minHeight:'100vh',background:'#fff',fontFamily:'var(--font-space)'}}>
    <nav style={{background:D,height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px'}}>
      <Link href="/login" style={{textDecoration:'none',display:'inline-flex',alignItems:'baseline',gap:5}}><span style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:20,letterSpacing:'-0.05em',color:Y}}>RIDEN</span><span style={{fontFamily:'var(--font-space)',fontWeight:500,fontSize:10,letterSpacing:'0.05em',opacity:0.55,color:Y}}>ไรเด็น</span></Link>
      <Link href="/login" style={{fontFamily:'var(--font-space)',fontSize:13,color:Y,opacity:0.5,textDecoration:'none'}}>← Sign in</Link>
    </nav>
    <div style={{maxWidth:720,margin:'0 auto',padding:'clamp(32px,6vw,72px) 20px'}}>
      <div style={{background:Y,display:'inline-block',padding:'3px 10px',borderRadius:4,fontFamily:'var(--font-space)',fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase' as const,color:D,marginBottom:20}}>Legal</div>
      <h1 style={{fontFamily:'var(--font-syne)',fontWeight:800,fontSize:'clamp(28px,5vw,48px)',letterSpacing:'-0.04em',color:D,marginBottom:8,lineHeight:1.05}}>Privacy &amp; Data Protection</h1>
      <p style={{fontSize:14,color:'#888',marginBottom:48}}>Last updated: April 2026 · RIDEN Co., Ltd. · Thailand</p>
      <div style={{borderTop:'0.5px solid #E8E8E8'}}>{S.map(([h,p])=><div key={h} style={{padding:'28px 0',borderBottom:'0.5px solid #E8E8E8'}}><h2 style={{fontFamily:'var(--font-syne)',fontWeight:700,fontSize:17,color:D,marginBottom:10,letterSpacing:'-0.02em'}}>{h}</h2><p style={{fontSize:14,color:'#555',lineHeight:1.8}}>{p}</p></div>)}</div>
    </div>
  </div>
}
