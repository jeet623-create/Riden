import { NextRequest, NextResponse } from 'next/server';
import { env } from '../../../../../lib/env';
import { createLogger, newTraceId } from '../../../../../lib/logger';
import { blobClient } from '../../../../../lib/line-client';
import { getConfig } from '../../../../../lib/supabase-admin';
import { validateAndNormalizeMenuImage } from '../../../../../menus/image-builder';
import { MENUS, MenuKey } from '../../../../../menus/definitions';

/**
 * POST /api/menus/image
 *
 * Admin-only. Uploads a custom PNG to replace the auto-generated placeholder
 * for one rich menu (e.g. operator_main). Accepts any size — auto-resizes to
 * 2500×843 using cover fit.
 *
 * Body: multipart/form-data with fields:
 *   - menu: 'operator_main' | 'driver_idle' | 'driver_active'
 *   - image: PNG/JPG file
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.ADMIN_API_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const traceId = newTraceId();
  const logger = createLogger(traceId, { component: 'menu-image' });

  try {
    const form = await req.formData();
    const menuKey = form.get('menu') as MenuKey | null;
    const file = form.get('image') as File | null;

    if (!menuKey || !(menuKey in MENUS)) {
      return NextResponse.json({ error: 'Invalid menu key' }, { status: 400 });
    }
    if (!file) {
      return NextResponse.json({ error: 'Missing image file' }, { status: 400 });
    }

    const def = MENUS[menuKey];
    const richMenuId = await getConfig(def.configKey);
    if (!richMenuId) {
      return NextResponse.json(
        { error: `Menu ${menuKey} not initialized. Call /api/menus/setup first.` },
        { status: 400 }
      );
    }

    const raw = Buffer.from(await file.arrayBuffer());
    logger.info('image.received', { menu: menuKey, bytes: raw.byteLength });

    const normalized = await validateAndNormalizeMenuImage(raw);
    logger.info('image.normalized', { bytes: normalized.byteLength });

    await blobClient.setRichMenuImage(
      richMenuId,
      new Blob([normalized], { type: 'image/png' })
    );

    logger.info('image.uploaded.ok', { menu: menuKey, richMenuId });
    return NextResponse.json({ ok: true, traceId, menu: menuKey, richMenuId });
  } catch (err) {
    logger.error('image.upload.failed', err);
    return NextResponse.json(
      { ok: false, traceId, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
