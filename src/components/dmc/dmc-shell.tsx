"use client"

import { LanguageProvider } from "@/hooks/use-language"
import { CustomCursor } from "@/components/custom-cursor"
import { DmcSidebar } from "@/components/dmc/sidebar"
import { DmcTopbar } from "@/components/dmc/topbar"

interface DmcShellProps {
  children: React.ReactNode
  companyName?: string
  subscriptionPlan?: "trial" | "starter" | "pro" | "enterprise"
  userName?: string
}

export function DmcShell({
  children,
  companyName = "DMC Company",
  subscriptionPlan = "trial",
}: DmcShellProps) {
  return (
    <LanguageProvider>
      <CustomCursor />
      <div style={{ minHeight: "100vh", background: "var(--bg-base,#080808)" }}>
        <DmcSidebar companyName={companyName} subscriptionPlan={subscriptionPlan} />
        <div style={{ paddingLeft: 232, transition: "padding 300ms" }}>
          <DmcTopbar />
          <main style={{ padding: 24 }}>{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
