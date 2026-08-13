import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, DEMO_MODE } from "./config";
import { demoClient } from "./demo";

export const supabase = DEMO_MODE
  ? demoClient
  : createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isConfigured = DEMO_MODE || !SUPABASE_URL.includes("YOUR-PROJECT-REF");
