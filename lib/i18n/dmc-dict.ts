"use client"

import { useCallback } from "react"
import { useLanguage, type Language } from "@/hooks/use-language"

type Dict = Record<Language, Record<string, string>>

export const DMC_DICT: Dict = {
  en: {
    "common.login": "Log in",
    "common.logout": "Log out",
    "common.dashboard": "Dashboard",
    "common.bookings": "Bookings",
    "common.newBooking": "New booking",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.open": "Open",
    "common.back": "Back",

    "booking.clientName": "Client name",
    "booking.days": "Days",
    "booking.pickupLocation": "Pickup location",
    "booking.dropoffLocation": "Dropoff location",
    "booking.vehicleType": "Vehicle type",
    "booking.passengers": "Passengers",
    "booking.flightNumber": "Flight number",
    "booking.notes": "Notes",
    "booking.preferredOperator": "Preferred operator",
    "booking.sendToPool": "Send to pool",
    "booking.createBooking": "Create booking",

    "dashboard.activeTrips": "Active trips",
    "dashboard.pendingConfirmations": "Pending confirmations",
    "dashboard.completedThisWeek": "Completed this week",
    "dashboard.paymentsPending": "Payments pending",

    "status.pending": "Pending",
    "status.confirmed": "Confirmed",
    "status.inProgress": "In progress",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",
  },
  th: {
    "common.login": "เข้าสู่ระบบ",
    "common.logout": "ออกจากระบบ",
    "common.dashboard": "แดชบอร์ด",
    "common.bookings": "การจอง",
    "common.newBooking": "สร้างการจองใหม่",
    "common.save": "บันทึก",
    "common.cancel": "ยกเลิก",
    "common.confirm": "ยืนยัน",
    "common.open": "เปิด",
    "common.back": "ย้อนกลับ",

    "booking.clientName": "ชื่อลูกค้า",
    "booking.days": "จำนวนวัน",
    "booking.pickupLocation": "จุดรับ",
    "booking.dropoffLocation": "จุดส่ง",
    "booking.vehicleType": "ประเภทรถ",
    "booking.passengers": "ผู้โดยสาร",
    "booking.flightNumber": "หมายเลขเที่ยวบิน",
    "booking.notes": "หมายเหตุ",
    "booking.preferredOperator": "โอเปอเรเตอร์ที่ต้องการ",
    "booking.sendToPool": "ส่งเข้าพูล",
    "booking.createBooking": "สร้างการจอง",

    "dashboard.activeTrips": "ทริปที่กำลังดำเนินการ",
    "dashboard.pendingConfirmations": "รอการยืนยัน",
    "dashboard.completedThisWeek": "เสร็จสิ้นสัปดาห์นี้",
    "dashboard.paymentsPending": "รอชำระเงิน",

    "status.pending": "รอดำเนินการ",
    "status.confirmed": "ยืนยันแล้ว",
    "status.inProgress": "กำลังดำเนินการ",
    "status.completed": "เสร็จสิ้น",
    "status.cancelled": "ยกเลิก",
  },
  zh: {
    "common.login": "登录",
    "common.logout": "退出",
    "common.dashboard": "仪表板",
    "common.bookings": "预订",
    "common.newBooking": "新建预订",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.open": "打开",
    "common.back": "返回",

    "booking.clientName": "客户姓名",
    "booking.days": "天数",
    "booking.pickupLocation": "接车地点",
    "booking.dropoffLocation": "送车地点",
    "booking.vehicleType": "车型",
    "booking.passengers": "乘客",
    "booking.flightNumber": "航班号",
    "booking.notes": "备注",
    "booking.preferredOperator": "首选运营商",
    "booking.sendToPool": "发送至司机池",
    "booking.createBooking": "创建预订",

    "dashboard.activeTrips": "进行中的行程",
    "dashboard.pendingConfirmations": "待确认",
    "dashboard.completedThisWeek": "本周已完成",
    "dashboard.paymentsPending": "待付款",

    "status.pending": "待处理",
    "status.confirmed": "已确认",
    "status.inProgress": "进行中",
    "status.completed": "已完成",
    "status.cancelled": "已取消",
  },
  ko: {
    "common.login": "로그인",
    "common.logout": "로그아웃",
    "common.dashboard": "대시보드",
    "common.bookings": "예약",
    "common.newBooking": "새 예약",
    "common.save": "저장",
    "common.cancel": "취소",
    "common.confirm": "확인",
    "common.open": "열기",
    "common.back": "뒤로",

    "booking.clientName": "고객 이름",
    "booking.days": "일수",
    "booking.pickupLocation": "픽업 장소",
    "booking.dropoffLocation": "목적지",
    "booking.vehicleType": "차량 종류",
    "booking.passengers": "승객",
    "booking.flightNumber": "항공편 번호",
    "booking.notes": "메모",
    "booking.preferredOperator": "선호 운영사",
    "booking.sendToPool": "드라이버 풀로 전송",
    "booking.createBooking": "예약 생성",

    "dashboard.activeTrips": "진행 중인 여정",
    "dashboard.pendingConfirmations": "확인 대기",
    "dashboard.completedThisWeek": "이번 주 완료",
    "dashboard.paymentsPending": "결제 대기",

    "status.pending": "대기 중",
    "status.confirmed": "확인됨",
    "status.inProgress": "진행 중",
    "status.completed": "완료됨",
    "status.cancelled": "취소됨",
  },
  tr: {
    "common.login": "Giriş yap",
    "common.logout": "Çıkış yap",
    "common.dashboard": "Kontrol paneli",
    "common.bookings": "Rezervasyonlar",
    "common.newBooking": "Yeni rezervasyon",
    "common.save": "Kaydet",
    "common.cancel": "İptal",
    "common.confirm": "Onayla",
    "common.open": "Aç",
    "common.back": "Geri",

    "booking.clientName": "Müşteri adı",
    "booking.days": "Gün sayısı",
    "booking.pickupLocation": "Alış noktası",
    "booking.dropoffLocation": "Bırakış noktası",
    "booking.vehicleType": "Araç tipi",
    "booking.passengers": "Yolcular",
    "booking.flightNumber": "Uçuş numarası",
    "booking.notes": "Notlar",
    "booking.preferredOperator": "Tercih edilen operatör",
    "booking.sendToPool": "Havuza gönder",
    "booking.createBooking": "Rezervasyon oluştur",

    "dashboard.activeTrips": "Aktif yolculuklar",
    "dashboard.pendingConfirmations": "Bekleyen onaylar",
    "dashboard.completedThisWeek": "Bu hafta tamamlanan",
    "dashboard.paymentsPending": "Bekleyen ödemeler",

    "status.pending": "Beklemede",
    "status.confirmed": "Onaylandı",
    "status.inProgress": "Devam ediyor",
    "status.completed": "Tamamlandı",
    "status.cancelled": "İptal edildi",
  },
}

export type DmcTranslationKey = keyof (typeof DMC_DICT)["en"]

export function useDmcT() {
  const { language } = useLanguage()
  return useCallback(
    (key: DmcTranslationKey): string =>
      DMC_DICT[language]?.[key] ?? DMC_DICT.en[key] ?? key,
    [language]
  )
}
