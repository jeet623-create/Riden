"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"

export function AdminTopbar() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="h-14 bg-surface/80 backdrop-blur-sm border-b border-border sticky top-0 z-40 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")} className="w8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-elevated transition-colors">
          {mounted && resolvedTheme === "dark" ? <Sun className="w4 h-4 text-muted" /> : <Moon className="w-4 h-4 text-muted" />}
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><span className="text-xs font-medium text-primary">A</span></div>
      </div>
    </header>
  )
}
