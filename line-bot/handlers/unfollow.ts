import { UnfollowEvent } from '@line/bot-sdk';
import type { Logger } from '../lib/logger';
import { supabase } from '../lib/supabase-admin';

export async function handleUnfollow(event: UnfollowEvent, logger: Logger): Promise<void> {
  const lineUserId = event.source.userId;
  if (!lineUserId) return;

  logger.info('unfollow.received', { lineUserId });

  // Mark user as unfollowed — don't delete the record in case they rejoin
  await supabase
    .from('line_user_log')
    .upsert(
      {
        line_user_id: lineUserId,
        unfollowed_at: new Date().toISOString(),
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'line_user_id' }
    );
}
