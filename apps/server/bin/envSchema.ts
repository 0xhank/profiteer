import { z } from "zod";

export type Env = z.infer<typeof commonSchema>;
export const commonSchema = z.object({
    SERVER_HOST: z.string().default("0.0.0.0"),
    SERVER_PORT: z.coerce.number().positive().default(8888),

    // SUPABASE
    SB_CONNECTION: z.string(),
    SB_URL: z.string(),
    SB_SERVICE_KEY: z.string(),

    ADMIN_PRIVATE_KEY: z.string(),
    RPC_URL: z
        .string()
        .url()
        .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "RPC URL must start with http:// or https://"
        ),

    DEEPINFRA_API_KEY: z.string().optional(),

    DEV_PRIVY_APP_ID: z.string(),
    DEV_PRIVY_APP_SECRET: z.string(),

    PROD_PRIVY_APP_ID: z.string(),
    PROD_PRIVY_APP_SECRET: z.string(),

    JUPITER_URL: z.string().url(),

    VITE_ENV: z.enum(["development", "production"]).default("development"),
});
