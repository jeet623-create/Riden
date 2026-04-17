"use client"

import { LanguageProvider } from "@/hooks/use-language"
import { CustomCursor } from "@/components/custom-cursor"
import { DmcSidebar } from "@/components/dmc/sidebar"
import { DmcTopbar } from "@/components/dmc/topbar"

export default function DmcLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CustomCursor />
      <div className="min-h-screen" style={{background:'var(--bg-base)'}}>
        <DmcSidebar companyName="Siam Tours" subscriptionPlan="trial" />
        <div className="pl-[232px] transition-all duration-300">
          <DmcTopbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
