// TODO: native speaker review — auto-translated initial pass (Korean).

import type { MarketingDict } from "../dict"

export const ko: MarketingDict = {
  nav: {
    forDmcs: "DMC용",
    forOperators: "운영사",
    forDrivers: "기사",
    pricing: "가격",
    about: "소개",
    blog: "블로그",
    contact: "문의",
    login: "로그인",
    beginTrial: "무료 시작",
  },
  hero: {
    pill: "77개 주 · 하나의 네트워크 · 24시간",
    h1: "밤에도 움직이는 태국",
    // TODO: native speaker review — split from new titleLine design.
    titleLine1: "조정 레이어",
    titleLine2Pre: "위한",
    titleEmphasis: "태국 관광",
    arrow: "↗",
    sub1: "모든 예약. 모든 기사. 모든 지방. 실시간.",
    sub2: "태국을 위한 혁신적 접근. 태국에서 만들어, 세계를 위해.",
    ctaPrimary: "무료로 시작",
    ctaSecondary: "조정 플랫폼 보기",
  },
  metrics: {
    provinces: "주",
    operators: "운영사",
    trips: "여행",
    ontime: "정시",
  },
  chapters: {
    dmc: {
      kicker: "챕터 01 · DMC",
      num: "01",
      role: "DMC",
      titleStart: "예약은 여기서 시작",
      titleItalic: "방콕",
      body: "태국 여행사가 해외 대리인으로부터 예약을 받습니다. 7일. 다중 차량. 열두 개 필드 — 하나의 양식. DMC가 커피를 다 마시기도 전에 포털이 예약 번호를 발급합니다.",
    },
    operator: {
      kicker: "챕터 02 · 운영사",
      num: "02",
      role: "운영사",
      titleStart: "배차는",
      titleItalic: "LINE 으로. 태국어로.",
      body: "태국어 Flex 메시지가 운영사의 기존 LINE 채팅에 도착합니다. 새 앱 불필요. 교육 불필요. 전부 수락, 일별 분할, 또는 드라이버 풀로 전달 — LINE 안에서 모두 가능.",
      lineNew: "신규",
      lineConfirm: "확인됨",
    },
    driver: {
      kicker: "챕터 03 · 기사",
      num: "03",
      role: "기사",
      titleStart: "사진으로.",
      titleItalic: "GPS 타임스탬프.",
      body: "픽업 → 이동 → 하차. 모든 순간이 위도, 경도, UTC 시간, 트립 코드와 함께 자동 기록됩니다. 서울의 대리인은 승객이 벨트를 풀기 전에 증거를 확인합니다.",
    },
    network: {
      kicker: "● 챕터 04 · 네트워크",
      title1: "모든 노선.",
      titleItalic: "모든 지방.",
      body: "수완나품 공항 이동부터 치앙라이 산악 트레킹, 푸껫 섬 여행부터 후아힌 주말 휴가까지 — RIDEN 은 태국 관광 운송의 모든 구석, 모든 시간을 조정합니다.",
    },
  },
  pricing: {
    kicker: "● 챕터 05 · 가격",
    titleStart: "무료로",
    titleItalic: "시작",
    sub: "60일 · 신용카드 불필요 · 언제든 취소",
    perMo: "/월",
    plans: {
      starter: {
        name: "Starter",
        tag: "부티크 DMC 용",
        per: "연간 청구",
        features: [
          "무제한 예약",
          "5개 운영사 연결",
          "LINE 통합 · 태국어",
          "실시간 GPS 추적",
          "이메일 지원",
        ],
        cta: "무료 시작",
      },
      growth: {
        name: "Growth",
        tag: "성장하는 DMC 용",
        per: "연간 청구 · 20% 할인",
        features: [
          "Starter 전체",
          "무제한 운영사",
          "드라이버 풀 접근",
          "다중 사용자 로그인",
          "분석 대시보드",
          "LINE 우선 지원",
        ],
        cta: "무료 시작 ↗",
      },
      pro: {
        name: "Pro",
        tag: "엔터프라이즈 DMC 용",
        per: "연간 청구 · SLA 포함",
        features: [
          "Growth 전체",
          "화이트 라벨 포털",
          "커스텀 예약 필드",
          "API 접근",
          "전담 계정 매니저",
          "SLA 보장",
        ],
        cta: "영업팀 연락",
      },
    },
  },
  testimonials: {
    kicker: "● 현장에서",
    title: "태국 DMC의 목소리",
    items: [
      {
        quote: "다일정 예약당 14개의 WhatsApp 스레드가 하나의 포털 뷰로 줄었습니다. 운영팀이 저녁을 되찾았죠.",
        role: "운영 책임자 · Siam Horizon Tours",
      },
      {
        quote: "LINE Flex 메시지 배차는 제가 필요한지도 몰랐던 기능입니다. 운영사는 30초 안에 수락합니다.",
        role: "창립자 · Andaman Blue DMC",
      },
      {
        quote: "7일 다중 차량 조정, 5개국 예약 체인, 하나의 대시보드. RIDEN 은 지상 운송이 필요했던 것입니다.",
        role: "대표 · Ruen Thai Travel Group",
      },
    ],
  },
  press: {
    featuredIn: "언급된 매체",
  },
  demo: {
    kicker: "● 데모 신청",
    titleStart: "RIDEN 을",
    titleItalic: "실제로 보기",
    sub: "30분 워크스루. 포털, LINE 플로우, 기사 앱. 태국어 또는 영어.",
  },
  closer: {
    title1: "태국을",
    titleItalic: "조정하세요",
    sub: "60일 무료 체험. 신용카드 불필요. 설치비 없음. 첫날부터 플랫폼 전체 이용.",
    ctaPrimary: "무료 시작 · 60일",
    ctaSecondary: "데모 예약",
  },
  footer: {
    tagline: "태국을 위한 혁신적 접근. 태국에서 만들어, 세계를 위해.",
    product: "제품",
    company: "회사",
    support: "지원",
    legal: "법적 고지",
    copyright: "© 2026 RIDEN · 방콕 · 태국",
    pdpa: "PDPA 준수 · 데이터는 싱가포르에 저장",
    operational: "모든 시스템 정상",
  },
}
