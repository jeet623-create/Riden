'use client'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-riden-black">
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
      <nav className="relative z-50 border-b border-riden-border px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-riden-muted hover:text-riden-text"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></Link>
        <div className="w-px h-5 bg-riden-border" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-riden-teal rounded-md flex items-center justify-center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <span className="font-display text-riden-white font-600">RIDEN — Privacy Policy</span>
        </div>
      </nav>
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <div className="glass rounded-2xl p-8 space-y-8">
          <div>
            <h1 className="font-display text-3xl font-700 text-riden-white mb-2">Privacy Policy</h1>
            <p className="text-riden-muted text-sm font-mono">Last updated: April 2026 · Thailand PDPA Compliant</p>
          </div>
          {[['1. Introduction','RIDEN (ไรเด็น) is a B2B tourism transport coordination platform operated by RIDEN Co., Ltd. in Thailand. This Privacy Policy explains how we collect, use, and protect information when you use our DMC portal, operator LINE interface, and related services. By using RIDEN, you agree to the practices described in this policy.'],
            ['2. Information We Collect','We collect: company and contact details for DMC accounts; operator and driver information including LINE User IDs; booking and trip data including client names and travel details; driver GPS location during active trips only; payment proof photos; and support communications.'],
            ['3. How We Use Your Information','We use collected information to coordinate transport bookings; send booking notifications via LINE; process payment confirmations; provide customer support; improve our platform; and comply with Thai legal obligations.'],
            ['4. LINE Messaging','RIDEN uses the LINE Messaging API to communicate with operators and drivers. Your LINE User ID is stored to enable notifications. We do not share LINE data with third parties outside LINE Corporation\'s own terms.'],
            ['5. GPS & Location Data','Driver GPS is collected only during active trips and only with driver consent. Location data is used solely for trip tracking. Location history is not stored beyond 30 days after trip completion.'],
            ['6. Data Storage & Security','All data is stored on Supabase infrastructure with encryption at rest and in transit (TLS/SSL). We implement role-based access controls so each party only sees data relevant to them.'],
            ['7. Data Sharing','We do not sell your personal data. We share data only to fulfill booking coordination, with LINE Corporation for messaging, with payment processors if applicable, and when required by Thai law or court order.'],
            ['8. Data Retention','Booking and trip data is retained for 3 years. Driver location history is deleted after 30 days. Support tickets are retained for 2 years. Account data is retained while your account is active.'],
            ['9. Your Rights','You have the right to access, correct, or delete your personal data; withdraw consent for non-essential processing; and file a complaint with Thailand\'s PDPC. Contact us at privacy@riden.co.th.'],
            ['10. Cookies','Our web portal uses essential cookies for authentication only. We do not use advertising cookies or tracking pixels.'],
            ['11. Children\'s Privacy','RIDEN is a B2B platform not intended for persons under 18. We do not knowingly collect personal information from minors.'],
            ['12. Changes to This Policy','We may update this policy and will notify registered accounts of significant changes. Continued use constitutes acceptance.'],
            ['13. Contact Us','RIDEN Co., Ltd. · Email: privacy@riden.co.th · LINE: @574jjuix · Bangkok, Thailand'],
          ].map(([title, body]) => (
            <div key={title}>
              <h2 className="font-display font-600 text-riden-white text-lg mb-3">{title as string}</h2>
              <p className="text-riden-text text-sm leading-relaxed">{body as string}</p>
            </div>
          ))}
          <div className="pt-4 border-t border-riden-border text-center">
            <p className="text-riden-muted text-xs">© 2026 RIDEN Co., Ltd. All rights reserved. · Thailand PDPA Compliant</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <Link href="/login" className="text-riden-teal text-sm hover:underline">Back to Login</Link>
              <Link href="/register" className="text-riden-teal text-sm hover:underline">Register</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
