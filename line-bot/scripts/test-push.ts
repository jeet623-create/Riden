/**
 * Run: npm run test-push <LINE_USER_ID>
 *
 * Sends a test message to the given LINE user ID to verify:
 * 1. LINE channel access token is valid
 * 2. Bot is authorized to push to this user (user has added bot as friend)
 * 3. Message is delivered
 */
import { push, textMessage } from '../lib/line-client';
import { createLogger, newTraceId } from '../lib/logger';

async function main() {
  const targetUserId = process.argv[2];
  if (!targetUserId) {
    console.error('Usage: npm run test-push <LINE_USER_ID>');
    process.exit(1);
  }

  const logger = createLogger(newTraceId(), { script: 'test-push' });
  const now = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok' });

  try {
    await push(
      targetUserId,
      textMessage(`🧪 RIDEN test ping at ${now}\n\nIf you see this, LINE delivery works.`),
      logger
    );
    console.log('\n✅ Message pushed successfully. Check the user\'s LINE app.');
  } catch (err) {
    console.error('\n❌ Push failed:', err);
    process.exit(1);
  }
}

main();
