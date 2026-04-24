import { PostbackEvent } from '@line/bot-sdk';
import type { Logger } from '../lib/logger';
import { supabase } from '../lib/supabase-admin';
import { reply, textMessage } from '../lib/line-client';

/**
 * Postback routing. The `action` URL parameter determines which flow handles the tap.
 *
 * Convention: `action=FLOW&param1=value1&param2=value2`
 *
 * We proxy most flows to the existing Supabase edge functions for now (backwards compat),
 * but new flows should be implemented directly in this service.
 */
export async function handlePostback(event: PostbackEvent, logger: Logger): Promise<void> {
  const lineUserId = event.source.userId;
  if (!lineUserId || !event.postback?.data) return;

  const params = new URLSearchParams(event.postback.data);
  const action = params.get('action');
  if (!action) {
    logger.warn('postback.no_action', { data: event.postback.data });
    return;
  }

  logger.info('postback.received', { action, data: event.postback.data });

  // Update line_user_log
  await supabase
    .from('line_user_log')
    .upsert(
      {
        line_user_id: lineUserId,
        last_message: `postback:${action}`,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'line_user_id' }
    );

  // Rich menu actions
  switch (action) {
    case 'op_jobs_today':
    case 'op_jobs_upcoming':
    case 'op_pending_pay':
    case 'op_help':
      return handleOperatorMenuAction(action, lineUserId, event, logger);

    case 'driver_jobs_today':
    case 'driver_next_trip':
    case 'driver_status':
    case 'driver_help':
      return handleDriverIdleMenuAction(action, lineUserId, event, logger);

    case 'driver_pickup':
    case 'driver_arrived':
    case 'driver_close':
      return handleDriverActiveMenuAction(action, lineUserId, event, logger);

    case 'register':
      return handleRegistrationStart(params.get('role'), lineUserId, event, logger);

    default:
      // Proxy to existing Supabase edge functions (backwards compat during migration)
      return proxyToSupabase(action, params, lineUserId, event, logger);
  }
}

async function handleOperatorMenuAction(
  action: string,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  const { data: op } = await supabase
    .from('operators')
    .select('id, company_name')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (!op) {
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage('⚠️ ไม่พบบัญชีผู้ประกอบการของคุณ\nกรุณาสมัครก่อนใช้งาน'),
        logger
      );
    }
    return;
  }

  if (action === 'op_jobs_today') {
    await fetchAndReplyOperatorJobs(op.id, lineUserId, event, 'today', logger);
  } else if (action === 'op_jobs_upcoming') {
    await fetchAndReplyOperatorJobs(op.id, lineUserId, event, 'upcoming', logger);
  } else if (action === 'op_pending_pay') {
    await fetchAndReplyPendingPayments(op.id, lineUserId, event, logger);
  } else if (action === 'op_help') {
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage(
          '🆘 ช่วยเหลือ RIDEN\n\n📞 ติดต่อทีม: @riden\n🌐 เว็บ: riden.me\n📖 คู่มือ: riden.me/help'
        ),
        logger
      );
    }
  }
}

async function fetchAndReplyOperatorJobs(
  operatorId: string,
  lineUserId: string,
  event: PostbackEvent,
  scope: 'today' | 'upcoming',
  logger: Logger
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from('trips')
    .select('id, trip_date, pickup_time, pickup_location, dropoff_location, status, pax_count')
    .eq('operator_id', operatorId)
    .in('status', ['operator_accepted', 'assigned', 'in_progress']);

  if (scope === 'today') {
    query = query.eq('trip_date', today);
  } else {
    query = query.gt('trip_date', today).lte('trip_date', addDays(today, 14));
  }

  const { data: trips } = await query.order('trip_date').order('pickup_time').limit(10);

  if (!trips || trips.length === 0) {
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage(scope === 'today' ? '📅 ไม่มีงานวันนี้' : '📅 ไม่มีงานในช่วง 14 วันข้างหน้า'),
        logger
      );
    }
    return;
  }

  const lines = trips.map((t, idx) => {
    const time = (t.pickup_time || '').slice(0, 5);
    return `${idx + 1}. ${t.id}\n   📅 ${t.trip_date} ⏰ ${time}\n   📍 ${t.pickup_location}\n   → ${t.dropoff_location}\n   👥 ${t.pax_count || 1} คน · ${t.status}`;
  });

  if (event.replyToken) {
    await reply(
      event.replyToken,
      textMessage(
        `📋 ${scope === 'today' ? 'งานวันนี้' : 'งานล่วงหน้า'} (${trips.length} รายการ)\n\n${lines.join('\n\n')}`
      ),
      logger
    );
  }
}

async function fetchAndReplyPendingPayments(
  operatorId: string,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  const { data: trips } = await supabase
    .from('trips')
    .select('id, trip_date, pickup_location')
    .eq('operator_id', operatorId)
    .eq('status', 'completed');

  const tripIds = (trips || []).map((t) => t.id);
  if (tripIds.length === 0) {
    if (event.replyToken) {
      await reply(event.replyToken, textMessage('💰 ไม่มีงานค้างรับเงิน'), logger);
    }
    return;
  }

  const { data: payments } = await supabase
    .from('payments')
    .select('trip_id, status, created_at')
    .in('trip_id', tripIds)
    .in('status', ['pending', 'proof_uploaded']);

  if (!payments || payments.length === 0) {
    if (event.replyToken) {
      await reply(event.replyToken, textMessage('💰 ไม่มีงานค้างรับเงิน'), logger);
    }
    return;
  }

  const tripMap = new Map((trips || []).map((t) => [t.id, t]));
  const lines = payments.map((p) => {
    const t = tripMap.get(p.trip_id);
    return `• ${p.trip_id}\n  📅 ${t?.trip_date} · ${t?.pickup_location}\n  สถานะ: ${p.status}`;
  });

  if (event.replyToken) {
    await reply(
      event.replyToken,
      textMessage(`💰 งานค้างรับเงิน (${payments.length} รายการ)\n\n${lines.join('\n\n')}`),
      logger
    );
  }
}

async function handleDriverIdleMenuAction(
  action: string,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  // Proxy to existing driver-my-trips edge function for now
  await proxyToSupabase(action, new URLSearchParams(`action=${action}`), lineUserId, event, logger);
}

async function handleDriverActiveMenuAction(
  action: string,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  // These require an active trip context — look it up
  const { data: driver } = await supabase
    .from('drivers')
    .select('id, active_trip_id')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (!driver?.active_trip_id) {
    if (event.replyToken) {
      await reply(
        event.replyToken,
        textMessage('⚠️ ตอนนี้ไม่มีงานที่กำลังดำเนินการ'),
        logger
      );
    }
    return;
  }

  // Map rich menu action → trip-status-updater action
  const statusAction =
    action === 'driver_pickup' ? 'driver_pickup'
    : action === 'driver_arrived' ? 'driver_arrived'
    : 'driver_close';

  const params = new URLSearchParams({ action: statusAction });
  params.set('trip_id', driver.active_trip_id);
  await proxyToSupabase(statusAction, params, lineUserId, event, logger);
}

async function handleRegistrationStart(
  role: string | null,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  // For now, proxy to existing driver-registration-handler
  const params = new URLSearchParams({ action: 'start_reg', type: role || 'driver' });
  await proxyToSupabase('start_reg', params, lineUserId, event, logger);
}

/**
 * Proxy an unhandled postback to the existing Supabase edge function.
 * Used during the migration period while flows are gradually moved here.
 */
async function proxyToSupabase(
  action: string,
  params: URLSearchParams,
  lineUserId: string,
  event: PostbackEvent,
  logger: Logger
): Promise<void> {
  logger.info('postback.proxy', { action });

  const functionName = resolveProxyTarget(action);
  if (!functionName) {
    logger.warn('postback.no_proxy_target', { action });
    return;
  }

  const payload: Record<string, unknown> = {
    lineUserId,
    action,
    rawData: event.postback?.data,
  };

  // Copy known params
  const tripId = params.get('trip_id');
  const bookingId = params.get('booking_id');
  if (tripId) payload.tripId = tripId;
  if (bookingId) payload.bookingId = bookingId;

  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/${functionName}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );
    logger.info('postback.proxy.ok', { functionName, status: res.status });
  } catch (err) {
    logger.error('postback.proxy.failed', err, { functionName });
  }
}

function resolveProxyTarget(action: string): string | null {
  // Map action → existing Supabase edge function
  if (action.startsWith('op_')) return 'operator-response-handler';
  if (action.startsWith('driver_pickup') || action.startsWith('driver_arrived') || action.startsWith('driver_close') || action === 'driver_noted') {
    return 'trip-status-updater';
  }
  if (action === 'driver_jobs_today' || action === 'driver_next_trip') return 'driver-my-trips';
  if (action === 'driver_bid') return 'driver-bid-handler';
  if (action === 'start_reg' || action === 'reg_vehicle' || action === 'op_also_driver' || action === 'op_vehicle') {
    return 'driver-registration-handler';
  }
  return null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
