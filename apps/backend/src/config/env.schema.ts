import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().default('3000').transform(Number),

  DATABASE_URL: z.string().min(1, 'Database URL is required'),

  JWT_ACCESS_TOKEN: z.string().min(1, 'Access token secret is required'),
  JWT_REFRESH_TOKEN: z.string().min(1, 'Refresh token secret is required'),

  // We cast the string from .env to the type expected by the JWT library
  ACCESS_TOKEN_EXPIRES: z.string().min(1) as unknown as z.ZodType<any>,
  REFRESH_TOKEN_EXPIRES: z.string().min(1) as unknown as z.ZodType<any>,
});

// Create automatic TypeScript types based on the Zod schema
export type EnvConfig = z.infer<typeof envSchema>;
