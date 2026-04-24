import { WebhookEvent } from '@line/bot-sdk';
import type { Logger } from '../lib/logger';
import { handleFollow } from './follow';
import { handleUnfollow } from './unfollow';
import { handleMessage } from './message';
import { handlePostback } from './postback';

const processedEvents = new Set<string>();

/**
 * Idempotent event dispatcher.
 * Deduplicates by webhookEventId (LINE retries on timeout).
 */
export async function handleEvent(event: WebhookEvent, logger: Logger): Promise<void> {
  // Dedupe
  const eventId = event.webhookEventId;
  if (eventId) {
    if (processedEvents.has(eventId)) {
      logger.debug('event.duplicate', { eventId });
      return;
    }
    processedEvents.add(eventId);

    // Prevent memory growth — keep last 1000 ids
    if (processedEvents.size > 1000) {
      const toDelete = Array.from(processedEvents).slice(0, 500);
      toDelete.forEach((id) => processedEvents.delete(id));
    }
  }

  const userId = (event.source as { userId?: string })?.userId;
  const childLogger = logger.child({ eventId, userId });

  try {
    switch (event.type) {
      case 'follow':
        await handleFollow(event, childLogger);
        break;
      case 'unfollow':
        await handleUnfollow(event, childLogger);
        break;
      case 'message':
        await handleMessage(event, childLogger);
        break;
      case 'postback':
        await handlePostback(event, childLogger);
        break;
      default:
        childLogger.debug('event.unhandled', { type: event.type });
    }
  } catch (err) {
    childLogger.error('event.handler.failed', err, { type: event.type });
  }
}
