import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { createLogger, newTraceId } from '../../../../../lib/logger';
import { rebuildAllMenus } from '../../../../../menus/manager';

/**
 * POST /api/menus/setup
 *
 * Admin-only. Wipes all existing rich menus and rebuilds from definitions.
 * Use this any time menu structure or image changes.
 *
 * Authentication: Bearer token with ADMIN_API_KEY.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const traceId = newTraceId();
  const logger = createLogger(traceId, { component: 'menus-setup' });

  logger.info('menus.rebuild.start');

  try {
    const results = await rebuildAllMenus(logger);
    logger.info('menus.rebuild.done', { results });
    return NextResponse.json({ ok: true, traceId, results });
  } catch (err) {
    logger.error('menus.rebuild.failed', err);
    return NextResponse.json(
      { ok: false, traceId, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    usage: 'POST with Bearer token to rebuild all rich menus',
  });
}
