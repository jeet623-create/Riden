import type { MarketingDict } from "../dict"

export const en: MarketingDict = {
  nav: {
    forDmcs: "For DMCs",
    forOperators: "Operators",
    forDrivers: "Drivers",
    pricing: "Pricing",
    about: "About",
    blog: "Blog",
    contact: "Contact",
    login: "Log in",
    beginTrial: "Begin trial",
  },
  hero: {
    pill: "Live across 77 provinces",
    h1: "Where Thailand moves at night",
    titleLine1: "The coordination layer",
    titleLine2Pre: "for",
    titleEmphasis: "Thai tourism",
    arrow: "↗",
    sub1: "Every booking. Every driver. Every province. Live.",
    sub2: "Built in Thailand, for the world.",
    ctaPrimary: "Begin trial",
    ctaSecondary: "See it move",
  },
  metrics: {
    provinces: "Provinces",
    operators: "Operators",
    trips: "Trips",
    ontime: "On-time",
  },
  whyNow: {
    kicker: "● WHY NOW",
    title1: "A market the size of",
    titleItalic: "a country, still run on",
    sub: "WhatsApp threads, spreadsheets, and phone calls. Thailand is rebuilding its tourism engine — and choosing the system it will run on for the next decade.",
    cards: [
      {
        tag: "MARKET",
        headline: "$58B rebuilt",
        body: "Thailand's tourism economy is projected to pass pre-pandemic highs in 2026. Ground transport is the single largest operational spend inside that number — and the least digitised.",
      },
      {
        tag: "BEHAVIOUR",
        headline: "95% on LINE",
        body: "Every Thai driver and operator already lives inside LINE. RIDEN dispatches there — no new app, no training, no behaviour change. The distribution problem is solved.",
      },
      {
        tag: "MOAT",
        headline: "Fragmented by default",
        body: "2,400+ operators. 77 provinces. Zero dominant platform. A coordination layer, once owned, is structurally hard to dislodge — and we are twelve months ahead.",
      },
    ],
  },
  chapters: {
    dmc: {
      kicker: "CHAPTER 01 · THE DMC",
      num: "01",
      role: "The DMC",
      titleStart: "Bookings begin in",
      titleItalic: "Bangkok.",
      body: "A Thai tour company receives a booking from a foreign travel agent. Seven days. Multi-vehicle. Twelve fields — one form. The portal generates the booking ID before the DMC has finished their coffee.",
    },
    operator: {
      kicker: "CHAPTER 02 · THE OPERATOR",
      num: "02",
      role: "The Operator",
      titleStart: "Dispatched on",
      titleItalic: "LINE. In Thai.",
      body: "A Thai Flex Message lands in the operator's existing LINE chat. No new app. No training. Accept in full, split by day, or send to the driver pool — all from within LINE.",
      lineNew: "new",
      lineConfirm: "confirmed",
    },
    driver: {
      kicker: "CHAPTER 03 · THE DRIVER",
      num: "03",
      role: "The Driver",
      titleStart: "Photographed.",
      titleItalic: "GPS-stamped.",
      body: "Pickup → transit → drop. Each moment captured, auto-stamped with latitude, longitude, UTC time, and trip code. The agent in Seoul sees proof before the passenger unbuckles.",
    },
    network: {
      kicker: "● CHAPTER 04 · THE NETWORK",
      title1: "Every route.",
      titleItalic: "Every province.",
      body: "From Suvarnabhumi airport transfers to Chiang Rai hill treks, from Phuket island hops to Hua Hin weekend escapes — RIDEN coordinates every corner of Thai tourism transport, every hour of every day.",
    },
  },
  pricing: {
    kicker: "● CHAPTER 05 · PRICING",
    titleStart: "Begin",
    titleItalic: "free",
    sub: "Sixty days · No credit card · Cancel anytime",
    perMo: "/mo",
    plans: {
      starter: {
        name: "Starter",
        tag: "For boutique DMCs",
        per: "Billed annually",
        features: [
          "Unlimited bookings",
          "5 operator connections",
          "LINE integration · Thai",
          "Real-time GPS tracking",
          "Email support",
        ],
        cta: "Begin trial",
      },
      growth: {
        name: "Growth",
        tag: "For scaling DMCs",
        per: "Billed annually · Save 20%",
        features: [
          "Everything in Starter",
          "Unlimited operators",
          "Driver pool access",
          "Multi-user team logins",
          "Analytics dashboard",
          "Priority LINE support",
        ],
        cta: "Begin trial ↗",
      },
      pro: {
        name: "Pro",
        tag: "For enterprise DMCs",
        per: "Billed annually · SLA included",
        features: [
          "Everything in Growth",
          "White-label DMC portal",
          "Custom booking fields",
          "API access",
          "Dedicated account manager",
          "SLA guarantees",
        ],
        cta: "Contact sales",
      },
    },
  },
  testimonials: {
    kicker: "● FROM THE FIELD",
    title: "What Thai DMCs are saying",
    items: [
      {
        quote:
          "We cut 14 WhatsApp threads per multi-day booking down to one portal view. Our ops team gets their evenings back.",
        role: "Head of Ops · Siam Horizon Tours",
      },
      {
        quote:
          "The LINE Flex Message dispatch is the feature I didn't know I needed. My operators accept bookings in 30 seconds.",
        role: "Founder · Andaman Blue DMC",
      },
      {
        quote:
          "Seven days of multi-vehicle coordination, five countries in the booking chain, one dashboard. RIDEN is what ground transport needed.",
        role: "MD · Ruen Thai Travel Group",
      },
    ],
  },
  press: {
    featuredIn: "Featured in",
  },
  demo: {
    kicker: "● REQUEST A DEMO",
    titleStart: "See RIDEN in",
    titleItalic: "action",
    sub: "30-minute walkthrough. Portal, LINE flow, driver app. In Thai or English.",
  },
  closer: {
    title1: "Coordinate",
    titleItalic: "Thailand",
    sub: "60-day free trial. No credit card. No setup fee. Full platform access from day one.",
    ctaPrimary: "Begin trial · Free 60 days",
    ctaSecondary: "Book a demo",
  },
  footer: {
    tagline: "An innovation approach to Thailand. Made in Thailand. Made for the world.",
    product: "Product",
    company: "Company",
    support: "Support",
    legal: "Legal",
    copyright: "© 2026 RIDEN · Bangkok · Thailand",
    pdpa: "PDPA compliant · data stored in Singapore",
    operational: "All systems operational",
  },
}
