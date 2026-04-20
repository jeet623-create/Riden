import type { Metadata } from "next"
import { PageHero, Section } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "System Status · Riden",
  description: "Live service status for the Riden platform.",
}

const SERVICES = [
  { name: "DMC Portal", status: "operational", detail: "Bangkok edge · 42ms p95" },
  { name: "Admin Panel", status: "operational", detail: "Bangkok edge · 38ms p95" },
  { name: "LINE Integration", status: "operational", detail: "Webhook delivery nominal" },
  { name: "Edge Functions", status: "operational", detail: "Booking · Dispatch · Pool · Notifications" },
  { name: "Database (Supabase)", status: "operational", detail: "Singapore · ap-southeast-1" },
  { name: "File Storage", status: "operational", detail: "Driver / vehicle / proof uploads" },
]

export default function StatusPage() {
  return (
    <>
      <PageHero
        eyebrow="SYSTEM STATUS"
        title={<>All systems <span className="italic">operational.</span></>}
        subtitle="Service-level health for all public-facing Riden components. Incidents are posted here as they happen."
      />

      <Section>
        <div className="bg-primary/10 border border-primary/40 rounded-2xl p-6 md:p-8 mb-8 flex items-start gap-4">
          <span className="relative flex h-3 w-3 mt-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
          <div>
            <div className="font-display font-semibold text-[22px] tracking-tight">All systems operational</div>
            <div className="mt-1 font-mono text-[12px] text-white/60 uppercase tracking-[0.1em]">Last checked · {new Date().toISOString().slice(0, 16).replace("T", " · ")} UTC</div>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl divide-y divide-white/5">
          {SERVICES.map(s => (
            <div key={s.name} className="flex items-center gap-4 px-5 py-4">
              <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-[16px]">{s.name}</div>
                <div className="font-mono text-[11px] text-white/50">{s.detail}</div>
              </div>
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-primary">{s.status}</span>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/50 mb-3">UPTIME · LAST 30 DAYS</div>
          <div className="flex gap-[3px]">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 h-8 rounded-sm bg-primary/80" />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-white/40">
            <span>30 DAYS AGO</span>
            <span className="text-primary">99.98% UPTIME</span>
            <span>TODAY</span>
          </div>
        </div>

        <div className="mt-10 text-[13px] text-white/60">
          Incident? Email <a href="mailto:support@riden.me" className="text-primary no-underline hover:underline">support@riden.me</a>. Emergency affecting live trips? WhatsApp +66 2 000 1234.
        </div>
      </Section>
    </>
  )
}
