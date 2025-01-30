import { createClient } from "@supabase/supabase-js";
import { env } from "./util/env";
import { Database } from "../../../database.types";

// Create a single supabase client for interacting with your database
const supabase = createClient<Database>(env.SB_URL, env.SB_SERVICE_KEY);

export default supabase;
