import type { Metadata } from "next"
import { PageHero, Section } from "@/components/marketing/primitives"
import { DemoForm } from "@/components/marketing/demo-form"
import { Mail, Phone, MapPin, Clock, MessageSquare } from "lucide-react"

export const metadata: Metadata = {
  title: "Contact Riden",
  description: "Talk to the Riden team. Bangkok office. Email support@riden.me or sales@riden.me.",
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="CONTACT"
        title={<>Let's <span className="italic">talk.</span></>}
        subtitle="We respond to every inquiry within 24 hours. Bangkok hours — 9:00 to 18:00 ICT, Monday to Friday."
      />

      <Section>
        <div className="grid md:grid-cols-[1.1fr_1fr] gap-12 items-start">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-7">
            <DemoForm
              kind="contact"
              title={<>Send us a <span className="italic">message.</span></>}
              subtitle="For demos, sales questions, partnerships, press, or anything else."
              compact
            />
          </div>
          <div className="space-y-6">
            <ContactItem icon={<Mail className="w-4 h-4" />} label="Email" value="hello@riden.me" href="mailto:hello@riden.me" />
            <ContactItem icon={<MessageSquare className="w-4 h-4" />} label="Support" value="support@riden.me" href="mailto:support@riden.me" />
            <ContactItem icon={<Phone className="w-4 h-4" />} label="Phone" value="+66 2 000 1234" href="tel:+6620001234" />
            <ContactItem icon={<MessageSquare className="w-4 h-4" />} label="LINE" value="@ridenth" href="https://line.me/R/ti/p/@ridenth" />
            <ContactItem icon={<Clock className="w-4 h-4" />} label="Hours" value="Mon–Fri · 09:00–18:00 ICT" />
            <ContactItem icon={<MapPin className="w-4 h-4" />} label="Bangkok office" value="Sukhumvit Soi 23 · Klongtoey · Bangkok 10110" />

            <div className="mt-8 rounded-xl overflow-hidden border border-white/10">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3875.3!2d100.5!3d13.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!2s0x0!5e0!3m2!1sen!2sth!4v1700000000000"
                width="100%"
                height="240"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Bangkok office map"
              />
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}

function ContactItem({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const Wrapper: any = href ? "a" : "div"
  return (
    <Wrapper href={href} className="flex items-start gap-3 text-white/80 hover:text-primary transition-colors no-underline group">
      <span className="mt-[3px] text-primary">{icon}</span>
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-0.5">{label}</div>
        <div className="text-[15px] text-white group-hover:text-primary">{value}</div>
      </div>
    </Wrapper>
  )
}
