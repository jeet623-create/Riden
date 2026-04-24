import { env } from './env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[env.LOG_LEVEL];
}

export function createLogger(traceId: string, context: Record<string, unknown> = {}) {
  const prefix = { traceId, ...context };

  return {
    debug(msg: string, meta: Record<string, unknown> = {}) {
      if (shouldLog('debug')) console.log(JSON.stringify({ level: 'debug', msg, ...prefix, ...meta }));
    },
    info(msg: string, meta: Record<string, unknown> = {}) {
      if (shouldLog('info')) console.log(JSON.stringify({ level: 'info', msg, ...prefix, ...meta }));
    },
    warn(msg: string, meta: Record<string, unknown> = {}) {
      if (shouldLog('warn')) console.warn(JSON.stringify({ level: 'warn', msg, ...prefix, ...meta }));
    },
    error(msg: string, err?: unknown, meta: Record<string, unknown> = {}) {
      if (shouldLog('error')) {
        const errPayload = err instanceof Error
          ? { error: err.message, stack: err.stack }
          : { error: String(err) };
        console.error(JSON.stringify({ level: 'error', msg, ...prefix, ...errPayload, ...meta }));
      }
    },
    child(extraContext: Record<string, unknown>) {
      return createLogger(traceId, { ...context, ...extraContext });
    },
  };
}

export function newTraceId(): string {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type Logger = ReturnType<typeof createLogger>;
