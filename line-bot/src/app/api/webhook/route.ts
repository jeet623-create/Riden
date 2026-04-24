import { NextRequest, NextResponse } from 'next/server';
import { validateSignature, WebhookEvent } from '@line/bot-sdk';
import { env } from '../../../../lib/env';
import { createLogger, newTraceId } from '../../../../lib/logger';
import { supabase } from '../../../../lib/supabase-admin';
import { handleEvent } from '../../../../handlers';

// LINE webhook MUST reply within ~1 second or they retry.
// Process events in background after returning 200.
export async function POST(req: NextRequest) {
  const traceId = newTraceId();
  const logger = createLogger(traceId, { component: 'webhook' });

  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';

  if (!validateSignature(rawBody, env.LINE_CHANNEL_SECRET, signature)) {
    logger.warn('webhook.signature.invalid');
    return new NextResponse('Unauthorized', { status: 401 });
  }

  let body: { events: WebhookEvent[]; destination?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    logger.error('webhook.body.invalid');
    return new NextResponse('Bad Request', { status: 400 });
  }

  logger.info('webhook.received', { eventCount: body.events?.length ?? 0 });

  // Log all events to the database for post-mortem analysis
  if (body.events?.length) {
    try {
      await supabase.from('webhook_events_log').insert(
        body.events.map((e) => ({
          trace_id: traceId,
          event_type: e.type,
          line_user_id: (e.source as { userId?: string })?.userId,
          payload: e,
          received_at: new Date().toISOString(),
        }))
      );
    } catch (err) {
      logger.error('webhook.log.failed', err);
    }
  }

  // Process each event in parallel. Don't await — return 200 immediately.
  // Any errors happen async and are logged for debugging.
  if (body.events?.length) {
    Promise.allSettled(
      body.events.map((event) => handleEvent(event, logger.child({ eventType: event.type })))
    ).catch((err) => logger.error('webhook.process.unhandled', err));
  }

  return new NextResponse('OK', { status: 200 });
}

// LINE doesn't send GET, but let's respond cleanly for health checks
export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'riden-line-bot' });
}
