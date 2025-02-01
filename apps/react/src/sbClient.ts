import { createClient } from "@supabase/supabase-js";
import { Database } from "../../../database.types";

const supabaseUrl = "https://bkpqenquwivuilvrihip.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcHFlbnF1d2l2dWlsdnJpaGlwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgyMDExMTAsImV4cCI6MjA1Mzc3NzExMH0.AbQz1GmIjSKiP74m2xa7jCjaIUfygHdh5Od34NVZ56k";
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export default supabase;