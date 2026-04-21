// TODO: native speaker review — auto-translated initial pass (Japanese).

import type { MarketingDict } from "../dict"

export const ja: MarketingDict = {
  nav: {
    forDmcs: "DMC 向け",
    forOperators: "オペレーター",
    forDrivers: "ドライバー",
    pricing: "料金",
    about: "概要",
    blog: "ブログ",
    contact: "お問合わせ",
    login: "ログイン",
    beginTrial: "無料で開始",
  },
  hero: {
    pill: "77 県 · ひとつのネットワーク · 常時稼働",
    h1: "夜のタイを動かすレイヤー",
    // TODO: native speaker review — split from new titleLine design.
    titleLine1: "調整レイヤー",
    titleLine2Pre: "のための",
    titleEmphasis: "タイ観光",
    arrow: "↗",
    sub1: "すべての予約。すべてのドライバー。すべての県。リアルタイム。",
    sub2: "タイへのイノベーションアプローチ。タイで作り、世界へ。",
    ctaPrimary: "無料で開始",
    ctaSecondary: "調整レイヤーを見る",
  },
  metrics: {
    provinces: "県",
    operators: "オペレーター",
    trips: "運行",
    ontime: "定時率",
  },
  chapters: {
    dmc: {
      kicker: "チャプター 01 · DMC",
      num: "01",
      role: "DMC",
      titleStart: "予約は",
      titleItalic: "バンコクから。",
      body: "タイのツアー会社が海外の代理店から予約を受けます。7 日間、複数車両、12 フィールド — フォームは 1 枚。DMC がコーヒーを飲み終える前にポータルが予約 ID を発行します。",
    },
    operator: {
      kicker: "チャプター 02 · オペレーター",
      num: "02",
      role: "オペレーター",
      titleStart: "ディスパッチは",
      titleItalic: "LINE で。タイ語で。",
      body: "タイ語の Flex メッセージがオペレーターの既存 LINE チャットに届きます。新しいアプリも研修も不要。全受注、日別分割、ドライバープールへの転送 — すべて LINE の中で完結します。",
      lineNew: "新規",
      lineConfirm: "確認",
    },
    driver: {
      kicker: "チャプター 03 · ドライバー",
      num: "03",
      role: "ドライバー",
      titleStart: "写真に。",
      titleItalic: "GPS タイムスタンプ。",
      body: "ピックアップ → 走行 → 降車。各瞬間が緯度・経度・UTC 時刻・トリップコードとともに自動記録。ソウルの代理店は乗客がベルトを外す前に証拠を確認できます。",
    },
    network: {
      kicker: "● チャプター 04 · ネットワーク",
      title1: "あらゆるルート。",
      titleItalic: "あらゆる県。",
      body: "スワンナプーム空港送迎からチェンライのトレッキング、プーケットの島巡りからホアヒンの週末まで — RIDEN はタイ観光交通のあらゆる角、あらゆる時間を調整します。",
    },
  },
  pricing: {
    kicker: "● チャプター 05 · 料金",
    titleStart: "無料で",
    titleItalic: "はじめる",
    sub: "60 日間 · クレジットカード不要 · いつでも解約",
    perMo: "/月",
    plans: {
      starter: {
        name: "Starter",
        tag: "小規模 DMC 向け",
        per: "年額請求",
        features: [
          "無制限の予約",
          "5 オペレーター接続",
          "LINE 連携 · タイ語",
          "リアルタイム GPS",
          "メールサポート",
        ],
        cta: "無料で開始",
      },
      growth: {
        name: "Growth",
        tag: "成長中の DMC 向け",
        per: "年額請求 · 20% 節約",
        features: [
          "Starter のすべて",
          "無制限オペレーター",
          "ドライバープール",
          "複数ユーザーログイン",
          "分析ダッシュボード",
          "LINE 優先サポート",
        ],
        cta: "無料で開始 ↗",
      },
      pro: {
        name: "Pro",
        tag: "エンタープライズ DMC 向け",
        per: "年額請求 · SLA 付き",
        features: [
          "Growth のすべて",
          "ホワイトラベル",
          "カスタム予約項目",
          "API アクセス",
          "専任アカウント担当",
          "SLA 保証",
        ],
        cta: "営業に連絡",
      },
    },
  },
  testimonials: {
    kicker: "● 現場から",
    title: "タイ DMC の声",
    items: [
      {
        quote: "複数日予約あたり 14 本の WhatsApp スレッドが、たったひとつのポータル画面に。運営チームが夜を取り戻しました。",
        role: "運営責任者 · Siam Horizon Tours",
      },
      {
        quote: "LINE Flex メッセージのディスパッチは、必要だったと気づかなかった機能です。オペレーターは 30 秒で受諾します。",
        role: "創業者 · Andaman Blue DMC",
      },
      {
        quote: "7 日の複数車両調整、5 か国の予約チェーン、ひとつのダッシュボード。RIDEN は陸送が必要としていたものです。",
        role: "代表 · Ruen Thai Travel Group",
      },
    ],
  },
  press: {
    featuredIn: "掲載メディア",
  },
  demo: {
    kicker: "● デモ申込",
    titleStart: "RIDEN の",
    titleItalic: "実演を見る",
    sub: "30 分のウォークスルー。ポータル、LINE フロー、ドライバーアプリ。タイ語または英語で。",
  },
  closer: {
    title1: "タイを",
    titleItalic: "調整する",
    sub: "60 日間無料トライアル。クレジットカード不要。セットアップ料なし。初日から全機能。",
    ctaPrimary: "無料で開始 · 60 日",
    ctaSecondary: "デモを予約",
  },
  footer: {
    tagline: "タイへのイノベーションアプローチ。タイで作り、世界へ。",
    product: "プロダクト",
    company: "会社",
    support: "サポート",
    legal: "法務",
    copyright: "© 2026 RIDEN · バンコク · タイ",
    pdpa: "PDPA 準拠 · データはシンガポール保管",
    operational: "すべてのシステムが正常",
  },
}
