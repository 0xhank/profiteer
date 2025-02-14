#!/usr/bin/env node

import { z, ZodError, ZodIntersection, ZodTypeAny } from "zod";
import { config } from "dotenv";
import path from "path";

const commonSchema = z.object({
  // SUPABASE
  SB_URL: z.string(),
  SB_SERVICE_KEY: z.string(),

  RPC_URL: z.string(),

  JUPITER_URL: z.string(),
});

function parseEnv<TSchema extends ZodTypeAny | undefined = undefined>(
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

config({ path: "../../.env" });
export const env = parseEnv();

