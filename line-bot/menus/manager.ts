import { client, blobClient } from '../lib/line-client';
import { setConfig, getConfig } from '../lib/supabase-admin';
import type { Logger } from '../lib/logger';
import { buildMenuImage } from './image-builder';
import { MENUS, MenuDefinition, MenuKey } from './definitions';

/**
 * Create a single rich menu end-to-end:
 * 1. Create menu structure via LINE API
 * 2. Generate 2500×843 PNG via sharp
 * 3. Upload PNG as menu content
 * 4. Store richMenuId in app_config
 * 5. On failure at any step, clean up the partial menu
 */
export async function createMenu(
  def: MenuDefinition,
  logger: Logger
): Promise<{ id: string } | { error: string }> {
  logger.info('menu.create.start', { key: def.key, name: def.richMenu.name });

  let richMenuId: string | null = null;

  try {
    const createRes = await client.createRichMenu(def.richMenu);
    richMenuId = createRes.richMenuId;
    logger.info('menu.create.ok', { richMenuId });

    const png = await buildMenuImage(def);
    logger.info('menu.image.built', { bytes: png.byteLength });

    await blobClient.setRichMenuImage(richMenuId, new Blob([png], { type: 'image/png' }));
    logger.info('menu.image.uploaded', { richMenuId });

    await setConfig(def.configKey, richMenuId, `${def.richMenu.name} rich menu ID`);

    return { id: richMenuId };
  } catch (err) {
    logger.error('menu.create.failed', err, { key: def.key });
    // Clean up partial menu
    if (richMenuId) {
      try {
        await client.deleteRichMenu(richMenuId);
        logger.info('menu.create.cleanup', { richMenuId });
      } catch (cleanupErr) {
        logger.error('menu.create.cleanup.failed', cleanupErr);
      }
    }
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Wipe all existing menus on the LINE account and create fresh ones.
 * Use this after fixing a bug in menu definitions.
 */
export async function rebuildAllMenus(
  logger: Logger
): Promise<Record<MenuKey, { id: string } | { error: string }>> {
  // Step 1: delete all existing menus
  try {
    const { richmenus } = await client.getRichMenuList();
    logger.info('menu.rebuild.existing', { count: richmenus.length });
    for (const m of richmenus) {
      try {
        await client.deleteRichMenu(m.richMenuId);
      } catch (err) {
        logger.warn('menu.delete.failed', { richMenuId: m.richMenuId, err: String(err) });
      }
    }
  } catch (err) {
    logger.error('menu.list.failed', err);
  }

  // Step 2: create fresh menus
  const results = {} as Record<MenuKey, { id: string } | { error: string }>;
  for (const [key, def] of Object.entries(MENUS) as [MenuKey, MenuDefinition][]) {
    results[key] = await createMenu(def, logger.child({ menu: key }));
  }

  // Step 3: set driver_idle as default for all new followers
  const idleRes = results.driver_idle;
  if ('id' in idleRes) {
    try {
      await client.setDefaultRichMenu(idleRes.id);
      logger.info('menu.default.set', { richMenuId: idleRes.id });
    } catch (err) {
      logger.error('menu.default.failed', err);
    }
  }

  return results;
}

/**
 * Link the correct menu to a user based on their role.
 * Called on follow event and when a user becomes verified.
 */
export async function linkMenuByRole(
  lineUserId: string,
  role: 'operator' | 'driver_idle' | 'driver_active',
  logger: Logger
): Promise<boolean> {
  const configKey = role === 'operator' ? 'RM_OPERATOR_MAIN'
    : role === 'driver_active' ? 'RM_DRIVER_ACTIVE'
    : 'RM_DRIVER_IDLE';

  const richMenuId = await getConfig(configKey);
  if (!richMenuId) {
    logger.error('menu.link.no_menu_id', null, { role, configKey });
    return false;
  }

  try {
    await client.linkRichMenuIdToUser(lineUserId, richMenuId);
    logger.info('menu.link.ok', { lineUserId, role, richMenuId });
    return true;
  } catch (err) {
    logger.error('menu.link.failed', err, { lineUserId, role });
    return false;
  }
}

/**
 * Unlink current menu from user (they'll see the default menu or nothing).
 */
export async function unlinkMenu(lineUserId: string, logger: Logger): Promise<void> {
  try {
    await client.unlinkRichMenuIdFromUser(lineUserId);
    logger.info('menu.unlink.ok', { lineUserId });
  } catch (err) {
    logger.warn('menu.unlink.failed', { lineUserId, err: String(err) });
  }
}
