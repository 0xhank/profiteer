import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { Database } from "../../../database.types";
import { parseEnv } from "../bin/env";

if (typeof window === "undefined") {
}


// Initialize Supabase client
let supabase: SupabaseClient<Database>;
if (typeof window === "undefined") {
  config({ path: "../../.env" });
  const env =  parseEnv();
  supabase = createClient<Database>(env.SB_URL ?? '', env.SB_SERVICE_KEY ?? '');
} else {
  supabase = null as any;
}

export default supabase;

