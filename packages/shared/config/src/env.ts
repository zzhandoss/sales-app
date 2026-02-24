import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  ERP_PROVIDER: z.string().default('1c'),
  ERP_BASE_URL: z.string().url(),
  ERP_API_KEY: z.string().min(1),
});

export type AppEnv = z.infer<typeof envSchema>;

export const parseEnv = (source: Record<string, string | undefined>): AppEnv => {
  return envSchema.parse(source);
};
