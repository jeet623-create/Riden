import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LanguageProvider } from '@/hooks/use-language'
import { CustomCursor } from '@/components/custom-cursor'
import { DmcSidebar } from '@/components/dmc/sidebar'
import { DmcTopbar } from '@/components/dmc/topbar'

// Force every /dmc/* request through the server-side auth guard.
// Prevents browser from showing cached authenticated pages after sign-out.
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

const PUBLIC_PATHS = ['/dmc/login', '/dmc/forgot-password', '/dmc/reset-password']

export default async function DmcLayout({ children }: { children: React.ReactNode }) {
  const h = await headers()
  const pathname = h.get('x-pathname') || ''
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (isPublic) {
    return (
      <LanguageProvider>
        <CustomCursor />
        {children}
      </LanguageProvider>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dmc/login')

  const { data: dmc } = await supabase
    .from('dmc_users')
    .select('id, company_name, subscription_plan, subscription_status, trial_ends_at, line_user_id')
    .eq('id', user.id)
    .single()

  if (!dmc) {
    await supabase.auth.signOut()
    redirect('/dmc/login?error=no_profile')
  }

  return (
    <LanguageProvider>
      <CustomCursor />
      <div className="min-h-screen bg-background dot-grid">
        <DmcSidebar companyName={dmc.company_name} subscriptionPlan={dmc.subscription_plan} />
        <div className="pl-[232px] transition-all duration-300">
          <DmcTopbar />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </LanguageProvider>
  )
}
