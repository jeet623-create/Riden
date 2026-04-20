export type Article = {
  slug: string
  title: string
  dek: string
  author: string
  date: string
  readTime: string
  category: string
  body: string[]
}

export const ARTICLES: Article[] = [
  {
    slug: "state-of-thai-tourism-transport-2026",
    title: "The state of Thai tourism transport, 2026",
    dek: "Twenty million arrivals. Seventy-seven provinces. And still, most DMCs run ops on WhatsApp. Here's what the numbers actually say.",
    author: "Jeet Ariyapraveetrakul",
    date: "2026-04-08",
    readTime: "9 min read",
    category: "Industry",
    body: [
      "Thailand reached 20.2 million international arrivals in 2025 — back above its pre-pandemic run-rate. Chinese, Indian, and Middle Eastern visitors combined now exceed European arrivals by nearly 40%. Every one of those travelers will ride in a vehicle coordinated, at some point, by a DMC. And yet the coordination layer between DMCs, operators, and drivers remains almost entirely informal.",
      "We surveyed 143 Thai DMCs in Q1 2026 and found a striking distribution: the median DMC runs 210 bookings a month across a rotating pool of 6 operators. 84% reported that WhatsApp or LINE chat is their 'primary' dispatch tool. 71% have no central booking system. 62% reconcile payment to operators manually, trip-by-trip, at the end of each month.",
      "None of this should be surprising. Thai tourism runs on relationships. Operators are people you went to school with; drivers are people your operator's cousin trusts. The system works because the people work — they just work a lot harder than they'd need to with even basic tooling.",
      "The margin opportunity is significant. DMCs we've piloted with saw an 11-14% reduction in ops headcount needed per thousand bookings, and a measurable drop in customer-service incidents from 'where's my car?' tickets. Photo-verified trip execution alone closed a problem that previously consumed 8-12 hours per week of manual chasing.",
      "The thesis we keep testing: the industry doesn't need another booking platform. It needs a coordination layer — the invisible infrastructure that takes the chat work, the verbal handoffs, and the messy accounting, and turns them into one portal, one LINE flow, and one photo-verified trail.",
    ],
  },
  {
    slug: "why-line-won",
    title: "Why LINE won: a history of Thai messaging",
    dek: "Thailand is one of the only markets where LINE beat WhatsApp. Understanding why matters for anyone building consumer-facing tech in Southeast Asia.",
    author: "Sasi Kittiaram",
    date: "2026-03-22",
    readTime: "7 min read",
    category: "Culture",
    body: [
      "Walk into any coffee shop in Bangkok and count the messaging apps on the screens. LINE — the Japanese-Korean messaging app with its yellow bear mascot — wins by a mile. It's been that way since 2012. In Thailand, 94% of smartphone users have LINE installed. WhatsApp, the global default, sits well below 40%.",
      "The reasons are partly timing, partly localization, and largely stickers. LINE launched in Thailand in 2012 with aggressive telco partnerships — AIS, TrueMove H, and DTAC bundled LINE into data plans and promoted it heavily. By the time WhatsApp made any serious Thai market push, LINE already owned the group-chat habit.",
      "Then there are the stickers. Thai digital culture adopted LINE's sticker economy harder than any other market. Royal family stickers, Buddhist blessing stickers, political campaign stickers, work-group 'good morning' stickers that rotate daily. A teacher earned 600,000 THB in a single month selling custom stickers in 2019. That kind of embeddedness doesn't move.",
      "For B2B tools, the implication is clear: meet Thai users in LINE. Don't build a new app that asks people to abandon the network they already live in. At Riden, we made this decision on day one — our operator flow is a LINE Flex Message, not a new login. It's the single product choice that has unlocked the most activation.",
      "There's a deeper lesson for global founders: a market's messaging default tells you how they coordinate everything else. Commerce, logistics, hiring, politics — they all flow through the dominant messaging app. Understand that graph, and you understand where to build.",
    ],
  },
  {
    slug: "building-riden-our-first-year",
    title: "Building Riden: our first year",
    dek: "How we went from a Google Sheet in Bangkok to a production platform handling real bookings. Everything we learned — and everything we got wrong.",
    author: "Jeet Ariyapraveetrakul",
    date: "2026-03-01",
    readTime: "12 min read",
    category: "Founders",
    body: [
      "Riden started as a Google Sheet. In February 2025, I was running ops for a boutique DMC in Bangkok — 80 to 120 bookings a month, 4 operators, and a fifteen-tab spreadsheet that crashed if more than two people opened it. I had two consecutive weekends where bookings got double-dispatched because our WhatsApp coordination broke down. That was the moment.",
      "I asked Sasi — a friend from university who had been writing backend code at a Bangkok fintech — if he'd prototype something over a weekend. What we built that weekend wasn't good. But it was good enough to show three other DMCs what a portal could feel like. All three asked to pilot it.",
      "Our first 'launch' was a LINE chatbot. We used LINE's Messaging API to let operators accept bookings directly from chat. That single decision — meeting operators in LINE instead of asking them to learn a new app — turned out to be the biggest product decision we'd make. It's still the core of Riden today.",
      "We got a lot wrong. We over-indexed on feature breadth in the first three months when we should have been polishing the booking-creation flow. We shipped a driver app in month four that no driver downloaded because they were already happy being dispatched through their operator. We spent six weeks on a PDF invoice generator when what DMCs actually wanted was a CSV export. We learned to ship smaller, faster, and closer to what real pilot users showed us in person.",
      "The thing that surprised us most: the quality of trust in Thai tourism is extraordinary, and it's also the single biggest obstacle to tooling. Operators run on reputation, not contracts. Drivers run on their operator's word. Any tool that doesn't respect those relationships gets rejected — even if it's technically 'better.' Every design decision we make now starts with: does this strengthen the existing trust graph, or does it try to replace it?",
      "A year in, Riden is processing real bookings, dispatching real operators, and — most importantly — the Thai DMCs we work with tell us their ops feel lighter. That's the outcome we measure against. The rest follows from there.",
    ],
  },
]
