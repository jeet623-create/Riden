import type { RichMenu } from '@line/bot-sdk';

/**
 * IMPORTANT: LINE rich menu images MUST be 2500×843 or 2500×1686.
 * Other dimensions = silent failure (taps don't fire).
 */
export const MENU_WIDTH = 2500;
export const MENU_HEIGHT = 843;

export type MenuKey = 'operator_main' | 'driver_idle' | 'driver_active';

export interface MenuDefinition {
  key: MenuKey;
  configKey: string; // app_config key to store the richMenuId
  richMenu: RichMenu;
  /** Zone labels for image generation (in order) */
  zoneLabels: { en: string; th: string }[];
}

const quarter = Math.floor(MENU_WIDTH / 4); // 625
const third = Math.floor(MENU_WIDTH / 3); // 833

export const MENUS: Record<MenuKey, MenuDefinition> = {
  operator_main: {
    key: 'operator_main',
    configKey: 'RM_OPERATOR_MAIN',
    zoneLabels: [
      { en: "Today's Jobs", th: 'งานวันนี้' },
      { en: 'Upcoming', th: 'งานล่วงหน้า' },
      { en: 'Payments', th: 'ค้างรับเงิน' },
      { en: 'Help', th: 'ช่วยเหลือ' },
    ],
    richMenu: {
      size: { width: MENU_WIDTH, height: MENU_HEIGHT },
      selected: true,
      name: 'RIDEN Operator Main',
      chatBarText: 'เมนูผู้ประกอบการ',
      areas: [
        {
          bounds: { x: 0, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'งานวันนี้', data: 'action=op_jobs_today' },
        },
        {
          bounds: { x: quarter, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'งานล่วงหน้า', data: 'action=op_jobs_upcoming' },
        },
        {
          bounds: { x: quarter * 2, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'ค้างรับเงิน', data: 'action=op_pending_pay' },
        },
        {
          bounds: { x: quarter * 3, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'ช่วยเหลือ', data: 'action=op_help' },
        },
      ],
    },
  },

  driver_idle: {
    key: 'driver_idle',
    configKey: 'RM_DRIVER_IDLE',
    zoneLabels: [
      { en: "Today's Jobs", th: 'งานวันนี้' },
      { en: 'Next Trip', th: 'งานถัดไป' },
      { en: 'Status', th: 'สถานะ' },
      { en: 'Help', th: 'ช่วยเหลือ' },
    ],
    richMenu: {
      size: { width: MENU_WIDTH, height: MENU_HEIGHT },
      selected: true,
      name: 'RIDEN Driver Idle',
      chatBarText: 'เมนู',
      areas: [
        {
          bounds: { x: 0, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'งานวันนี้', data: 'action=driver_jobs_today' },
        },
        {
          bounds: { x: quarter, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'งานถัดไป', data: 'action=driver_next_trip' },
        },
        {
          bounds: { x: quarter * 2, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'สถานะ', data: 'action=driver_status' },
        },
        {
          bounds: { x: quarter * 3, y: 0, width: quarter, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'ช่วยเหลือ', data: 'action=driver_help' },
        },
      ],
    },
  },

  driver_active: {
    key: 'driver_active',
    configKey: 'RM_DRIVER_ACTIVE',
    zoneLabels: [
      { en: 'Picked Up', th: 'รับแล้ว' },
      { en: 'Arrived', th: 'ถึงแล้ว' },
      { en: 'Close Trip', th: 'ปิดงาน' },
    ],
    richMenu: {
      size: { width: MENU_WIDTH, height: MENU_HEIGHT },
      selected: true,
      name: 'RIDEN Driver Active',
      chatBarText: 'งานดำเนิน',
      areas: [
        {
          bounds: { x: 0, y: 0, width: third, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'รับแล้ว', data: 'action=driver_pickup' },
        },
        {
          bounds: { x: third, y: 0, width: third, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'ถึงแล้ว', data: 'action=driver_arrived' },
        },
        {
          bounds: { x: third * 2, y: 0, width: MENU_WIDTH - third * 2, height: MENU_HEIGHT },
          action: { type: 'postback', label: 'ปิดงาน', data: 'action=driver_close' },
        },
      ],
    },
  },
};
