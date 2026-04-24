import { MessageEvent } from '@line/bot-sdk';
import type { Logger } from '../lib/logger';
import { supabase } from '../lib/supabase-admin';
import { reply, textMessage } from '../lib/line-client';

export async function handleMessage(event: MessageEvent, logger: Logger): Promise<void> {
  const lineUserId = event.source.userId;
  if (!lineUserId) return;

  if (event.message.type !== 'text') {
    logger.debug('message.non_text', { type: event.message.type });
    // TODO: handle images in handlers/image.ts
    return;
  }

  const text = event.message.text.trim();
  logger.info('message.text', { text: text.slice(0, 100) });

  await supabase
    .from('line_user_log')
    .upsert(
      {
        line_user_id: lineUserId,
        last_message: text.slice(0, 200),
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'line_user_id' }
    );

  // DMC link code: DMC-XXXXXX
  if (/^DMC-[A-Z0-9]{6}$/i.test(text)) {
    return handleDmcLinkCode(text.toUpperCase(), lineUserId, event, logger);
  }

  // Check if in registration flow
  const { data: reg } = await supabase
    .from('registration_flow')
    .select('id')
    .eq('line_user_id', lineUserId)
    .eq('status', 'in_progress')
    .maybeSingle();

  if (reg) {
    // Proxy to registration handler
    await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/driver-registration-handler`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ lineUserId, text, messageId: event.message.id }),
      }
    );
    return;
  }

  // Commands
  const upper = text.toUpperCase();
  if (upper === 'HELP' || text === 'ช่วยเหลือ') {
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage(
          '🆘 RIDEN Help\n\n• พิมพ์ "งานวันนี้" เพื่อดูงาน\n• แตะปุ่มในเมนูด้านล่าง\n• ติดต่อ @riden สำหรับความช่วยเหลือ'
        ),
        logger
      );
    }
    return;
  }

  if (upper === 'MY ID' || upper === 'ID') {
    const [op, dr] = await Promise.all([
      supabase.from('operators').select('riden_id, company_name').eq('line_user_id', lineUserId).maybeSingle(),
      supabase.from('drivers').select('id, full_name').eq('line_user_id', lineUserId).maybeSingle(),
    ]);
    if (op.data) {
      await reply(event.replyToken!, textMessage(`🏢 ${op.data.company_name}\n🆔 ${op.data.riden_id}`), logger);
    } else if (dr.data) {
      await reply(event.replyToken!, textMessage(`🧑‍✈️ ${dr.data.full_name}\n🆔 ${dr.data.id}`), logger);
    }
    return;
  }

  // Bid amount (number from driver)
  const amount = parseFloat(text.replace(/[^0-9.]/g, ''));
  if (!isNaN(amount) && amount > 0 && amount < 100000) {
    const { data: driver } = await supabase
      .from('drivers')
      .select('id, pending_bid_trip_id, pending_bid_sent_at')
      .eq('line_user_id', lineUserId)
      .maybeSingle();

    if (driver?.pending_bid_trip_id && driver.pending_bid_sent_at) {
      const minutesAgo = (Date.now() - new Date(driver.pending_bid_sent_at).getTime()) / 60000;
      if (minutesAgo < 30) {
        await fetch(
          `${process.env.SUPABASE_URL}/functions/v1/driver-bid-handler`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({ lineUserId, tripId: driver.pending_bid_trip_id, amount }),
          }
        );
        await supabase
          .from('drivers')
          .update({ pending_bid_trip_id: null, pending_bid_sent_at: null })
          .eq('id', driver.id);
      }
    }
  }
}

async function handleDmcLinkCode(
  code: string,
  lineUserId: string,
  event: MessageEvent,
  logger: Logger
): Promise<void> {
  const { data: dmc } = await supabase
    .from('dmc_users')
    .select('id, company_name, line_user_id')
    .eq('line_link_code', code)
    .maybeSingle();

  if (!dmc) {
    if (event.replyToken) {
      await reply(event.replyToken, textMessage('❌ รหัสไม่ถูกต้อง'), logger);
    }
    return;
  }

  if (dmc.line_user_id) {
    if (event.replyToken) {
      await reply(event.replyToken, textMessage(`✅ ${dmc.company_name} เชื่อมแล้ว`), logger);
    }
    return;
  }

  await supabase
    .from('dmc_users')
    .update({ line_user_id: lineUserId, line_link_code: null, line_connected_at: new Date().toISOString() })
    .eq('id', dmc.id);

  if (event.replyToken) {
    await reply(
      event.replyToken,
      textMessage(`✅ เชื่อมสำเร็จ!\n🏢 ${dmc.company_name}`),
      logger
    );
  }
}
