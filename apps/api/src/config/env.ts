import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  DB_PROVIDER: z.enum(['sqlite', 'postgresql']).default('sqlite'),
  JWT_SECRET: z.string().min(32),
  ADMIN_KEY: z.string().min(16),
  INVITE_TTL_DAYS: z.coerce.number().default(7),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables')
  }

  return parsed.data
}

export const env = validateEnv()
