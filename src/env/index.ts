import 'dotenv/config';

import zod from 'zod';

const envSchema = zod.object({
  DATABASE_URL: zod.string(),
  SERVER_PORT: zod.number().default(3333),
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('production'),
});

const _env = envSchema.safeParse(process.env);

if(_env.success === false) {
  throw new Error(`Invalid environment variables. ${_env.error.format()}`,);
}

export const env = _env.data;