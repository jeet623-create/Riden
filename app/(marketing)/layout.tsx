import { Nav } from "@/components/marketing/v2/Nav"
import { Footer } from "@/components/marketing/v2/Footer"
import { GrainOverlay } from "@/components/marketing/v2/GrainOverlay"
import { CustomCursor } from "@/components/marketing/v2/CustomCursor"

// Marketing layout — v2 chrome (editorial nav, dark home, magnetic CTA, grain).
// All public pages share these primitives. /v2 keeps its own showcase wrapper.
export const dynamic = "force-dynamic"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0b0e] text-[#f3f1ea]">
      <GrainOverlay />
      <CustomCursor />
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
