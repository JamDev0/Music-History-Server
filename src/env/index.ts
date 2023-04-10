import { config } from 'dotenv';

import zod from 'zod';

if(process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' });
} else {
  config();
}

const envSchema = zod.object({
  DATABASE_URL: zod.string(),
  PORT: zod.coerce.number().default(3333),
  DATABASE_CLIENT: zod.enum(['sqlite', 'pg']),
  NODE_ENV: zod.enum(['development', 'production', 'test']).default('production'),
});

const _env = envSchema.safeParse(process.env);

if(_env.success === false) {
  throw new Error(`Invalid environment variables. ${_env.error.format()}`);
}

export const env = _env.data;