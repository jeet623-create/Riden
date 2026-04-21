// TODO: native speaker review — auto-translated initial pass (Arabic, RTL).

import type { MarketingDict } from "../dict"

export const ar: MarketingDict = {
  nav: {
    forDmcs: "لـ DMC",
    forOperators: "المشغلون",
    forDrivers: "السائقون",
    pricing: "الأسعار",
    about: "حول",
    blog: "المدونة",
    contact: "اتصل بنا",
    login: "تسجيل الدخول",
    beginTrial: "ابدأ التجربة",
  },
  hero: {
    pill: "77 مقاطعة · شبكة واحدة · دائماً متصلة",
    h1: "حيث تتحرك تايلاند ليلاً",
    // TODO: native speaker review — split from new titleLine design.
    titleLine1: "طبقة التنسيق",
    titleLine2Pre: "لـ",
    titleEmphasis: "السياحة التايلاندية",
    arrow: "↗",
    sub1: "كل حجز. كل سائق. كل مقاطعة. مباشر.",
    sub2: "نهج ابتكاري لتايلاند. صُنع في تايلاند. للعالم.",
    ctaPrimary: "ابدأ التجربة",
    ctaSecondary: "استكشف طبقة التنسيق",
  },
  metrics: {
    provinces: "مقاطعات",
    operators: "مشغلون",
    trips: "رحلات",
    ontime: "في الموعد",
  },
  chapters: {
    dmc: {
      kicker: "الفصل 01 · DMC",
      num: "01",
      role: "DMC",
      titleStart: "الحجوزات تبدأ في",
      titleItalic: "بانكوك.",
      body: "تستلم شركة سياحية تايلاندية حجزاً من وكيل أجنبي. سبعة أيام. عدة مركبات. اثنا عشر حقلاً — نموذج واحد. تُصدر البوابة رقم الحجز قبل أن ينتهي DMC من قهوته.",
    },
    operator: {
      kicker: "الفصل 02 · المشغل",
      num: "02",
      role: "المشغل",
      titleStart: "الإرسال عبر",
      titleItalic: "LINE. باللغة التايلاندية.",
      body: "تصل رسالة Flex التايلاندية إلى محادثة LINE الحالية للمشغل. لا تطبيق جديد. لا تدريب. اقبل الكل، قسّم باليوم، أو أرسل إلى مجمع السائقين — كل ذلك داخل LINE.",
      lineNew: "جديد",
      lineConfirm: "مؤكد",
    },
    driver: {
      kicker: "الفصل 03 · السائق",
      num: "03",
      role: "السائق",
      titleStart: "مصوّر.",
      titleItalic: "مختوم بـ GPS.",
      body: "الاستلام ← النقل ← التسليم. كل لحظة تُسجَّل تلقائياً بخط العرض والطول والتوقيت العالمي ورمز الرحلة. الوكيل في سيول يرى الدليل قبل أن يفكّ الراكب حزامه.",
    },
    network: {
      kicker: "● الفصل 04 · الشبكة",
      title1: "كل طريق.",
      titleItalic: "كل مقاطعة.",
      body: "من نقل مطار سوفارنابومي إلى رحلات تسلق جبال شيانغ راي، من قفزات جزر بوكيت إلى عطلات هوا هين — RIDEN ينسّق كل زاوية من النقل السياحي التايلاندي، كل ساعة من كل يوم.",
    },
  },
  pricing: {
    kicker: "● الفصل 05 · الأسعار",
    titleStart: "ابدأ",
    titleItalic: "مجاناً",
    sub: "ستون يوماً · بدون بطاقة ائتمان · إلغاء في أي وقت",
    perMo: "/شهر",
    plans: {
      starter: {
        name: "Starter",
        tag: "لـ DMC صغيرة",
        per: "فوترة سنوية",
        features: [
          "حجوزات غير محدودة",
          "5 مشغلين",
          "تكامل LINE · تايلاندي",
          "تتبع GPS مباشر",
          "دعم عبر البريد",
        ],
        cta: "ابدأ التجربة",
      },
      growth: {
        name: "Growth",
        tag: "لـ DMC متنامية",
        per: "فوترة سنوية · وفّر 20%",
        features: [
          "كل ما في Starter",
          "مشغلون غير محدودين",
          "الوصول لمجمع السائقين",
          "تسجيل دخول متعدد",
          "لوحة تحليلات",
          "دعم LINE ذو الأولوية",
        ],
        cta: "ابدأ التجربة ↗",
      },
      pro: {
        name: "Pro",
        tag: "للشركات الكبيرة",
        per: "فوترة سنوية · SLA مضمّن",
        features: [
          "كل ما في Growth",
          "بوابة DMC بعلامة خاصة",
          "حقول حجز مخصصة",
          "وصول API",
          "مدير حساب مخصص",
          "ضمانات SLA",
        ],
        cta: "تواصل مع المبيعات",
      },
    },
  },
  testimonials: {
    kicker: "● من الميدان",
    title: "ماذا تقول DMC التايلاندية",
    items: [
      {
        quote: "قلّلنا من 14 محادثة WhatsApp لكل حجز متعدد الأيام إلى عرض واحد في البوابة. فريق العمليات استعاد أمسياته.",
        role: "رئيس العمليات · Siam Horizon Tours",
      },
      {
        quote: "إرسال LINE Flex Message هو الميزة التي لم أعرف أنني بحاجة إليها. المشغلون يقبلون خلال 30 ثانية.",
        role: "المؤسس · Andaman Blue DMC",
      },
      {
        quote: "سبعة أيام تنسيق متعدد المركبات، خمس دول في سلسلة الحجز، لوحة واحدة. RIDEN هو ما احتاجه النقل البري.",
        role: "المدير العام · Ruen Thai Travel Group",
      },
    ],
  },
  press: {
    featuredIn: "نُشر في",
  },
  demo: {
    kicker: "● اطلب عرضاً",
    titleStart: "شاهد RIDEN",
    titleItalic: "أثناء العمل",
    sub: "جولة 30 دقيقة. البوابة، تدفق LINE، تطبيق السائق. بالتايلاندية أو الإنجليزية.",
  },
  closer: {
    title1: "نسّق",
    titleItalic: "تايلاند",
    sub: "تجربة مجانية 60 يوماً. بدون بطاقة ائتمان. بدون رسوم إعداد. وصول كامل من اليوم الأول.",
    ctaPrimary: "ابدأ التجربة · 60 يوماً مجاناً",
    ctaSecondary: "احجز عرضاً",
  },
  footer: {
    tagline: "نهج ابتكاري لتايلاند. صُنع في تايلاند. للعالم.",
    product: "المنتج",
    company: "الشركة",
    support: "الدعم",
    legal: "قانوني",
    copyright: "© 2026 RIDEN · بانكوك · تايلاند",
    pdpa: "متوافق مع PDPA · البيانات في سنغافورة",
    operational: "جميع الأنظمة تعمل",
  },
}
