import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../lib/env';
import { createLogger, newTraceId } from '../../../../lib/logger';
import { push, textMessage } from '../../../../lib/line-client';

/**
 * POST /api/push
 *
 * Admin-only. Send an arbitrary push message for testing.
 *
 * Body:
 *   - { to: string, text: string }  OR
 *   - { to: string, messages: LineMessage[] }
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const traceId = newTraceId();
  const logger = createLogger(traceId, { component: 'push' });

  try {
    const body = await req.json();
    const { to, text, messages } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing "to"' }, { status: 400 });
    }

    const payload = messages ?? (text ? [textMessage(text)] : null);
    if (!payload) {
      return NextResponse.json({ error: 'Missing "text" or "messages"' }, { status: 400 });
    }

    await push(to, payload, logger);
    return NextResponse.json({ ok: true, traceId });
  } catch (err) {
    logger.error('push.failed', err);
    return NextResponse.json(
      { ok: false, traceId, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
