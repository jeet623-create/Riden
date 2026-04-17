"use client"

import { useState } from "react"
import { Sun, Moon } from "lucide-react"
import { useLanguage, Language } from "@/hooks/use-language"

const languages: { code: Language; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "th", label: "TH" },
  { code: "zh", label: "中文" },
]

export function DmcTopbar() {
  const { language, setLanguage } = useLanguage()
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.setAttribute("data-theme", isDark ? "light" : "dark")
  }

  return (
    <header style={{height:56,borderBottom:'1px solid var(--border)',background:'rgba(17,17,17,0.8)',backdropFilter:'blur(12px)',position:'sticky',top:0,zIndex:40,display:'flex',alignItems:'center',justifyContent:'flex-end',padding:'0 24px',gap:12}}>
      <span style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--text-3)'}}>dmc.riden.me</span>
      <div style={{display:'flex',border:'1px solid var(--border)',borderRadius:8,overflow:'hidden'}}>
        {languages.map(l=>(
          <button key={l.code} onClick={()=>setLanguage(l.code)}
            style={{padding:'4px 10px',fontSize:11,fontFamily:'var(--font-mono)',cursor:'pointer',border:'none',borderRight:'1px solid var(--border)',transition:'all 150ms',
              background:language===l.code?'var(--text-1)':'transparent',
              color:language===l.code?'var(--bg-base)':'var(--text-3)'}}>
            {l.label}
          </button>
        ))}
      </div>
      <button onClick={toggleTheme} style={{width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:8,background:'var(--bg-elevated)',border:'1px solid var(--border)',cursor:'pointer'}}>
        {isDark ? <Sun size={14} color="var(--text-2)"/> : <Moon size={14} color="var(--text-2)"/>}
      </button>
      <div style={{width:28,height:28,borderRadius:'50%',background:'var(--teal-10)',border:'1px solid var(--teal-20)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:11,color:'var(--teal)'}}>D</div>
    </header>
  )
}
