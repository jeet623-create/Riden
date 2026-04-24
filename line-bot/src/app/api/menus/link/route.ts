import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { createLogger, newTraceId } from '../../../../../lib/logger';
import { linkMenuByRole, unlinkMenu } from '../../../../../menus/manager';

/**
 * POST /api/menus/link
 *
 * Admin-only. Link or unlink a rich menu for a specific user.
 *
 * Body: { lineUserId: string, role: 'operator' | 'driver_idle' | 'driver_active' | 'unlink' }
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const traceId = newTraceId();
  const logger = createLogger(traceId, { component: 'menu-link' });

  try {
    const body = await req.json();
    const { lineUserId, role } = body as {
      lineUserId?: string;
      role?: 'operator' | 'driver_idle' | 'driver_active' | 'unlink';
    };

    if (!lineUserId) {
      return NextResponse.json({ error: 'Missing lineUserId' }, { status: 400 });
    }

    if (role === 'unlink') {
      await unlinkMenu(lineUserId, logger);
      return NextResponse.json({ ok: true, traceId, action: 'unlinked' });
    }

    if (role !== 'operator' && role !== 'driver_idle' && role !== 'driver_active') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const ok = await linkMenuByRole(lineUserId, role, logger);
    return NextResponse.json({ ok, traceId, action: 'linked', role });
  } catch (err) {
    logger.error('menu.link.failed', err);
    return NextResponse.json(
      { ok: false, traceId, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
