import { createClient } from "@supabase/supabase-js";

// Estichara.ma production Supabase project. This is the public anon key;
// all data protection is enforced by Row Level Security in Supabase.
export const SUPABASE_URL = "https://wvbqmuumzbvaxnaajjqo.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIUzI1NiIsInJlZiI6Ind2YnFtdXVtemJ2YXhuYWFqanFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjEyNjAsImV4cCI6MjEwMjE5NzI2MH0.Zk1lZQ2T0Hf6HerD6eAYqRbMTghWuIcl5LS5jji9sHc";

const isBrowser = typeof window !== "undefined";

// Supabase's client is safe in both Vite SSR and the browser. Browser-only
// session persistence is disabled on the server to avoid accessing localStorage.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
});
