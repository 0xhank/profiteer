#!/usr/bin/env node

import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";
import { config } from "dotenv";

const commonSchema = z.object({
  SERVER_HOST: z.string().default("0.0.0.0"),
  SERVER_PORT: z.coerce.number().positive().default(8888),

  QN_RPC_URL: z.string(),

  // SUPABASE
  SB_CONNECTION: z.string(),
  SB_URL: z.string(),
  SB_SERVICE_KEY: z.string(),

  PAYER_PRIVATE_KEY: z.string(),
  RPC_URL: z.string(),

});

export function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
  schema?: TSchema,
): z.infer<TSchema extends ZodTypeAny ? ZodIntersection<typeof commonSchema, TSchema> : typeof commonSchema> {
  const envSchema = schema !== undefined ? z.intersection(commonSchema, schema) : commonSchema;
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof ZodError) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _errors, ...invalidEnvVars } = error.format();
      console.error(`\nMissing or invalid environment variables:\n\n  ${Object.keys(invalidEnvVars).join("\n  ")}\n`);
      process.exit(1);
    }
    throw error;
  }
}

let env: z.infer<typeof commonSchema>;
if (typeof window === "undefined") {
  config({ path: "../../.env" });
  env =  parseEnv();
} else {
  env = {} as any
}

export default env;
