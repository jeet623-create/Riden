import type { Metadata } from "next"
import { PageHero, Section } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Privacy Policy · Riden",
  description: "Riden (Thailand) privacy policy. PDPA-compliant data handling.",
}

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="LEGAL · PRIVACY"
        title={<>Privacy <span className="italic">Policy.</span></>}
        subtitle="Last updated: 20 April 2026. This policy explains how RIDEN (Thailand) Co., Ltd. collects, uses, and protects your personal data under Thailand's Personal Data Protection Act (PDPA) B.E. 2562 (2019)."
      />

      <Section>
        <article className="prose-custom max-w-3xl space-y-10 text-[15px] leading-[1.75] text-white/85">
          <Clause
            id="intro"
            n="1"
            title="Who we are"
            body={[
              "RIDEN (Thailand) Co., Ltd. (\"Riden\", \"we\", \"our\") is the data controller of personal information collected through our website, portal, and LINE integrations. We are registered in Bangkok, Thailand.",
              "Contact for data matters: hello@riden.me. Data Protection Officer: dpo@riden.me.",
            ]}
          />

          <Clause
            id="data-collected"
            n="2"
            title="Data we collect"
            body={[
              "Account data: name, email, phone, company, country, LINE user ID (if linked).",
              "Booking data: client names, contact numbers, pickup/dropoff locations, trip dates, pax counts, special requirements, vehicle types, and notes.",
              "Payment data: subscription plan, amount, reference numbers, proof-of-payment file references. We do NOT store full card numbers.",
              "Operational data: GPS locations of drivers during active trips, photo timestamps, device user-agent, IP address, country of access.",
              "Marketing data: demo requests, contact form submissions, UTM parameters, referrer.",
            ]}
          />

          <Clause
            id="how-we-use"
            n="3"
            title="How we use your data"
            body={[
              "To provide the Riden service: create bookings, dispatch to operators, track trips, generate invoices.",
              "To communicate: service notifications via LINE and email, support responses, billing.",
              "To improve the product: aggregate analytics on platform usage. We never sell individual data.",
              "To comply with legal obligations in Thailand.",
            ]}
          />

          <Clause
            id="sharing"
            n="4"
            title="Sharing"
            body={[
              "We share booking and trip details with the operators and drivers you choose to dispatch to — this is the core function of the platform.",
              "We use Supabase (AWS Singapore) for data hosting, LINE (for messaging), Vercel (for hosting the web portal), and email providers (for transactional email). Data leaves Thailand only to these trusted processors.",
              "We do not sell data to third parties. We do not share personal data with advertisers.",
              "We may disclose data if required by Thai law, a valid court order, or to protect our users' safety.",
            ]}
          />

          <Clause
            id="pdpa"
            n="5"
            title="Your rights under PDPA"
            body={[
              "Access: you can request a copy of the personal data we hold about you.",
              "Rectification: you can correct inaccurate data.",
              "Erasure: you can request deletion of your account and associated personal data, subject to legal retention requirements.",
              "Portability: you can receive your data in a machine-readable format.",
              "Objection: you can object to processing for specific purposes.",
              "Withdrawal of consent: where processing is based on consent, you can withdraw at any time.",
              "To exercise any of these rights, email dpo@riden.me with your request. We respond within 30 days as required by PDPA Section 30.",
            ]}
          />

          <Clause
            id="retention"
            n="6"
            title="Data retention"
            body={[
              "Active account data: retained while your account is active.",
              "Trip and booking records: retained for 7 years after trip completion, for accounting and legal purposes as required by Thai tax law.",
              "Marketing leads (demo requests, contact forms): retained for 2 years or until you request deletion.",
              "Deleted account data: permanently removed from our primary systems within 30 days, except where retention is legally required.",
            ]}
          />

          <Clause
            id="cookies"
            n="7"
            title="Cookies"
            body={[
              "We use strictly-necessary cookies for authentication, language preference (riden_lang), and session management. These are required for the platform to function.",
              "We use analytics cookies (via Vercel Analytics) to understand aggregate traffic patterns. These do not identify individuals.",
              "We do not use third-party advertising cookies.",
            ]}
          />

          <Clause
            id="security"
            n="8"
            title="Security"
            body={[
              "Data in transit is encrypted via TLS 1.3.",
              "Data at rest is encrypted in Supabase (AWS Singapore).",
              "Access to production data is restricted to a small number of authorized Riden staff. Access is logged.",
              "We do not store payment card numbers. Subscription payments are handled via bank transfer or Stripe (for international Pro customers).",
            ]}
          />

          <Clause
            id="changes"
            n="9"
            title="Changes to this policy"
            body={[
              "We may update this policy. Material changes will be announced via email to registered DMCs and prominently on this page. The date at the top reflects the most recent update.",
            ]}
          />

          <Clause
            id="contact"
            n="10"
            title="Contact"
            body={[
              "RIDEN (Thailand) Co., Ltd.",
              "Sukhumvit Soi 23, Klongtoey, Bangkok 10110, Thailand",
              "Email: dpo@riden.me · hello@riden.me",
            ]}
          />
        </article>
      </Section>
    </>
  )
}

function Clause({ id, n, title, body }: { id: string; n: string; title: string; body: string[] }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="font-mono text-[11px] text-primary">{n}.</span>
        <h2 className="font-display font-semibold text-[22px] tracking-[-0.01em]">{title}</h2>
      </div>
      <div className="space-y-3">
        {body.map((p, i) => <p key={i} className="text-white/80">{p}</p>)}
      </div>
    </section>
  )
}
