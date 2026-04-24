/**
 * Run: npm run setup-menus
 *
 * Creates all 3 rich menus (operator, driver-idle, driver-active) at the
 * correct 2500×843 dimensions and sets driver-idle as the default menu.
 *
 * Idempotent: safely wipes any existing menus first.
 */
import { rebuildAllMenus } from '../menus/manager';
import { createLogger, newTraceId } from '../lib/logger';

async function main() {
  const logger = createLogger(newTraceId(), { script: 'setup-menus' });
  logger.info('starting...');

  const results = await rebuildAllMenus(logger);

  console.log('\n=== Results ===\n');
  for (const [key, result] of Object.entries(results)) {
    if ('id' in result) {
      console.log(`✅ ${key}: ${result.id}`);
    } else {
      console.log(`❌ ${key}: ${result.error}`);
    }
  }

  const allOk = Object.values(results).every((r) => 'id' in r);
  console.log(allOk ? '\n🎉 All menus created!' : '\n⚠️ Some menus failed. Check logs above.');
  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
