import { FollowEvent } from '@line/bot-sdk';
import type { Logger } from '../lib/logger';
import { supabase } from '../lib/supabase-admin';
import { linkMenuByRole } from '../menus/manager';
import { reply, textMessage } from '../lib/line-client';

/**
 * User added the bot as friend (or rejoined after blocking).
 *
 * Smart role detection:
 * - If they're already a verified operator → link operator menu, welcome back
 * - If they're already a verified driver with active trip → link active driver menu
 * - If they're already a verified driver without active trip → link idle driver menu
 * - Otherwise → send registration prompt (new user)
 */
export async function handleFollow(event: FollowEvent, logger: Logger): Promise<void> {
  const lineUserId = event.source.userId;
  if (!lineUserId) {
    logger.warn('follow.no_userid');
    return;
  }

  logger.info('follow.received', { lineUserId });

  // Check existing roles
  const [operatorRes, driverRes] = await Promise.all([
    supabase
      .from('operators')
      .select('id, is_verified, company_name')
      .eq('line_user_id', lineUserId)
      .maybeSingle(),
    supabase
      .from('drivers')
      .select('id, is_verified, full_name, active_trip_id')
      .eq('line_user_id', lineUserId)
      .maybeSingle(),
  ]);

  const operator = operatorRes.data;
  const driver = driverRes.data;

  if (operator?.is_verified) {
    logger.info('follow.verified_operator', { operatorId: operator.id });
    await linkMenuByRole(lineUserId, 'operator', logger);
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage(
          `🎉 ยินดีต้อนรับกลับสู่ RIDEN คุณ ${operator.company_name}\n\nเมนูผู้ประกอบการพร้อมใช้งานที่ด้านล่าง 🚗`
        ),
        logger
      );
    }
    return;
  }

  if (driver?.is_verified) {
    const role = driver.active_trip_id ? 'driver_active' : 'driver_idle';
    logger.info('follow.verified_driver', { driverId: driver.id, role });
    await linkMenuByRole(lineUserId, role, logger);
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage(
          `🎉 ยินดีต้อนรับกลับ คุณ ${driver.full_name}\n\nเมนูคนขับพร้อมใช้งานที่ด้านล่าง 🚗`
        ),
        logger
      );
    }
    return;
  }

  // New user — trigger registration flow
  logger.info('follow.new_user');
  await linkMenuByRole(lineUserId, 'driver_idle', logger); // default menu

  if (event.replyToken) {
    await reply(
      event.replyToken,
      [
        textMessage(
          '🚗 ยินดีต้อนรับสู่ RIDEN!\n\nRIDEN เป็นระบบประสานงานขนส่งท่องเที่ยวในไทย เชื่อม DMC ผู้ประกอบการ และคนขับเข้าด้วยกัน'
        ),
        {
          type: 'flex',
          altText: 'คุณต้องการสมัครในฐานะ?',
          contents: {
            type: 'bubble',
            header: {
              type: 'box',
              layout: 'vertical',
              backgroundColor: '#1D9E75',
              paddingAll: '16px',
              contents: [
                {
                  type: 'text',
                  text: '🚗 สมัครเข้าสู่ระบบ',
                  color: '#FFFFFF',
                  weight: 'bold',
                  size: 'lg',
                },
              ],
            },
            body: {
              type: 'box',
              layout: 'vertical',
              spacing: 'md',
              contents: [
                { type: 'text', text: 'คุณต้องการสมัครในฐานะ?', weight: 'bold' },
              ],
            },
            footer: {
              type: 'box',
              layout: 'vertical',
              spacing: 'sm',
              contents: [
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '🏢 ผู้ประกอบการ (มีรถ)',
                    data: 'action=register&role=operator',
                  },
                  style: 'primary',
                  color: '#1D9E75',
                },
                {
                  type: 'button',
                  action: {
                    type: 'postback',
                    label: '🧑‍✈️ คนขับรถ',
                    data: 'action=register&role=driver',
                  },
                  style: 'secondary',
                },
              ],
            },
          },
        },
      ],
      logger
    );
  }
}
