import {
  Client,
  Message,
  messagingApi,
  RichMenu,
  WebhookEvent,
  MessageEvent,
  PostbackEvent,
  FollowEvent,
  UnfollowEvent,
} from '@line/bot-sdk';
import { env } from './env';
import type { Logger } from './logger';

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
});

const blobClient = new messagingApi.MessagingApiBlobClient({
  channelAccessToken: env.LINE_CHANNEL_ACCESS_TOKEN,
});

export { client, blobClient };

/**
 * Push a message to a user. Handles the 5-message batch limit.
 */
export async function push(
  to: string,
  messages: Message | Message[],
  logger?: Logger
): Promise<void> {
  const msgs = Array.isArray(messages) ? messages : [messages];

  // LINE allows max 5 messages per push call
  for (let i = 0; i < msgs.length; i += 5) {
    const chunk = msgs.slice(i, i + 5);
    try {
      await client.pushMessage({ to, messages: chunk });
      logger?.info('line.push.ok', { to, count: chunk.length });
    } catch (err) {
      logger?.error('line.push.failed', err, { to, count: chunk.length });
      throw err;
    }
  }
}

/**
 * Reply to a webhook event within 30 seconds using the reply token.
 * Free of charge (doesn't count against push quota).
 */
export async function reply(
  replyToken: string,
  messages: Message | Message[],
  logger?: Logger
): Promise<void> {
  const msgs = Array.isArray(messages) ? messages : [messages];
  try {
    await client.replyMessage({ replyToken, messages: msgs });
    logger?.info('line.reply.ok', { count: msgs.length });
  } catch (err) {
    logger?.error('line.reply.failed', err);
    throw err;
  }
}

/**
 * Shortcut for simple text messages.
 */
export function textMessage(text: string): Message {
  return { type: 'text', text };
}

/**
 * Download binary content (image/video/audio) from a message.
 */
export async function downloadContent(messageId: string): Promise<Buffer> {
  const stream = await blobClient.getMessageContent(messageId);
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer);
  }
  return Buffer.concat(chunks);
}
