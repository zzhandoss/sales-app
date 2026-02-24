import pino, { Logger, LoggerOptions } from 'pino';

export interface LoggerContext {
  tenantId?: string;
  userId?: string;
  correlationId?: string;
  [key: string]: unknown;
}

const baseOptions: LoggerOptions = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
};

export const createLogger = (context: LoggerContext = {}): Logger => {
  return pino({ ...baseOptions, ...context });
};
