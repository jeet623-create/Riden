import type { Metadata } from "next"
import { PageHero, Section } from "@/components/marketing/primitives"

export const metadata: Metadata = {
  title: "Terms of Service · Riden",
  description: "Riden (Thailand) Terms of Service. Thai jurisdiction.",
}

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="LEGAL · TERMS"
        title={<>Terms of <span className="italic">Service.</span></>}
        subtitle="Last updated: 20 April 2026. These Terms govern your use of the Riden platform, operated by RIDEN (Thailand) Co., Ltd."
      />

      <Section>
        <article className="max-w-3xl space-y-10 text-[15px] leading-[1.75] text-white/85">
          <Clause
            n="1"
            title="Acceptance of terms"
            body={[
              "By registering for a Riden account or otherwise using our services, you agree to these Terms. If you do not agree, do not use the service.",
              "You must be authorized to bind the entity you represent (e.g., the Destination Management Company) to these Terms.",
            ]}
          />
          <Clause
            n="2"
            title="The service"
            body={[
              "Riden provides a software platform for Thai Destination Management Companies (DMCs), transport operators, and drivers to coordinate ground-transport bookings. The platform includes a web portal for DMCs, LINE-based dispatching for operators, and a driver pool.",
              "Riden is a coordination tool — we do not own vehicles, employ drivers, or provide transport services directly. DMCs, operators, and drivers are independent parties responsible for their own service quality and legal compliance.",
            ]}
          />
          <Clause
            n="3"
            title="Accounts and access"
            body={[
              "Each DMC account requires accurate registration details. You are responsible for maintaining the security of your account credentials.",
              "You must not share a single account across multiple legal entities. Enterprise plans support multi-user team logins.",
              "We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraud, or pose a risk to other users.",
            ]}
          />
          <Clause
            n="4"
            title="Payment"
            body={[
              "DMC plans are billed monthly or annually, in Thai Baht (THB) via bank transfer, PromptPay, or (for international Pro customers) Stripe in USD.",
              "Free trials are 60 days. No credit card is required to begin.",
              "Subscriptions auto-renew unless cancelled at least 7 days before the renewal date.",
              "Refunds for unused months on annual plans are prorated at our discretion on a case-by-case basis.",
              "Operators and drivers never pay Riden a subscription. Payment between DMCs, operators, and drivers for completed trips is a direct relationship between those parties.",
            ]}
          />
          <Clause
            n="5"
            title="Acceptable use"
            body={[
              "You must not use Riden to coordinate illegal transport services, including unlicensed taxi operations.",
              "You must not upload content that is unlawful, defamatory, or infringes third-party rights.",
              "You must not attempt to disrupt the platform, bypass security measures, or reverse engineer our code.",
              "You must comply with all applicable Thai laws and regulations, including tax, labor, and transport licensing requirements.",
            ]}
          />
          <Clause
            n="6"
            title="Intellectual property"
            body={[
              "Riden and its licensors retain all rights to the platform's software, design, branding, and content.",
              "You retain ownership of all data you upload (booking records, photos, notes). You grant Riden a limited license to process this data solely to provide the service.",
            ]}
          />
          <Clause
            n="7"
            title="Liability"
            body={[
              "Riden is provided \"as is.\" To the maximum extent permitted by Thai law, we disclaim all warranties — express or implied.",
              "We are not liable for the actions of DMCs, operators, or drivers using the platform. Disputes between those parties must be resolved directly between them.",
              "Our total liability in any 12-month period is capped at the subscription fees you paid to us in that period.",
              "Nothing in these Terms limits liability for gross negligence or willful misconduct.",
            ]}
          />
          <Clause
            n="8"
            title="Termination"
            body={[
              "You may cancel your subscription at any time from the portal. Cancellation takes effect at the end of the current billing cycle.",
              "We may suspend or terminate your account for material breach of these Terms or non-payment, with reasonable notice where practicable.",
              "Upon termination, your data may be retained as required by law (see our Privacy Policy).",
            ]}
          />
          <Clause
            n="9"
            title="Governing law and jurisdiction"
            body={[
              "These Terms are governed by the laws of the Kingdom of Thailand.",
              "Any dispute arising out of or relating to these Terms shall be resolved in the courts of Bangkok, Thailand, unless both parties agree to arbitration.",
            ]}
          />
          <Clause
            n="10"
            title="Changes to these terms"
            body={[
              "We may update these Terms. Material changes will be communicated via email at least 30 days before they take effect. Continued use of the service after the effective date constitutes acceptance.",
            ]}
          />
          <Clause
            n="11"
            title="Contact"
            body={[
              "RIDEN (Thailand) Co., Ltd.",
              "Sukhumvit Soi 23, Klongtoey, Bangkok 10110, Thailand",
              "Email: hello@riden.me · legal@riden.me",
            ]}
          />
        </article>
      </Section>
    </>
  )
}

function Clause({ n, title, body }: { n: string; title: string; body: string[] }) {
  return (
    <section className="scroll-mt-24">
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
