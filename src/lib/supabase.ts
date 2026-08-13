import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Estichara.ma production Supabase project.
// The anon key is safe to ship publicly — all protection comes from
// Row Level Security policies in the database.
const SUPABASE_URL = "https://wvbqmuumzbvaxnaajjqo.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnFtdXVtemJ2YXhuYWFqanFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MjEyNjAsImV4cCI6MjEwMjE5NzI2MH0.Zk1lZQ2T0Hf6HerD6eAYqRbMTghWuIcl5LS5jji9sHc";

// Lazily create the client on first use. This keeps the module safe to
// import during server-side rendering (the realtime engine needs a
// browser WebSocket); all actual calls happen in the browser.
let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = getClient()[prop as keyof SupabaseClient];
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
