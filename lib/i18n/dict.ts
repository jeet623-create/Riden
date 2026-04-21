// Marketing translation dictionary.
// EN + TH are hand-written primary. ZH/KO/AR/HI/JA are initial auto-translations.
// TODO: native speaker review before public launch — especially ZH/KO/AR/HI/JA.

export type MarketingDict = {
  nav: {
    forDmcs: string
    forOperators: string
    forDrivers: string
    pricing: string
    about: string
    blog: string
    contact: string
    login: string
    beginTrial: string
  }
  hero: {
    pill: string
    /** @deprecated since 3m.7 — use titleLine1 + titleLine2Pre + titleEmphasis */
    h1: string
    titleLine1: string
    titleLine2Pre: string
    titleEmphasis: string
    arrow: string
    sub1: string
    sub2: string
    ctaPrimary: string
    ctaSecondary: string
  }
  metrics: {
    provinces: string
    operators: string
    trips: string
    ontime: string
  }
  chapters: {
    dmc: {
      kicker: string
      num: string
      role: string
      titleStart: string
      titleItalic: string
      body: string
    }
    operator: {
      kicker: string
      num: string
      role: string
      titleStart: string
      titleItalic: string
      body: string
      lineNew: string
      lineConfirm: string
    }
    driver: {
      kicker: string
      num: string
      role: string
      titleStart: string
      titleItalic: string
      body: string
    }
    network: {
      kicker: string
      title1: string
      titleItalic: string
      body: string
    }
  }
  pricing: {
    kicker: string
    titleStart: string
    titleItalic: string
    sub: string
    perMo: string
    plans: {
      starter: { name: string; tag: string; per: string; features: string[]; cta: string }
      growth:  { name: string; tag: string; per: string; features: string[]; cta: string }
      pro:     { name: string; tag: string; per: string; features: string[]; cta: string }
    }
  }
  testimonials: {
    kicker: string
    title: string
    items: { quote: string; role: string }[]
  }
  press: {
    featuredIn: string
  }
  demo: {
    kicker: string
    titleStart: string
    titleItalic: string
    sub: string
  }
  closer: {
    title1: string
    titleItalic: string
    sub: string
    ctaPrimary: string
    ctaSecondary: string
  }
  footer: {
    tagline: string
    product: string
    company: string
    support: string
    legal: string
    copyright: string
    pdpa: string
    operational: string
  }
}
